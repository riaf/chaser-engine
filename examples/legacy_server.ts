import { eventmit } from "eventmit";
import { Command, createAction, Game, State } from "../mod.ts";

type Props = {
  coolPort?: number;
  hotPort?: number;
  game: Game;
};

export class LegacyServer {
  readonly stateEvent = eventmit<State>();

  #game: Game;
  #coolPort: number;
  #hotPort: number;

  constructor({ game, coolPort = 2009, hotPort = 2010 }: Props) {
    this.#assertGame(game);

    this.#game = game;
    this.#coolPort = coolPort;
    this.#hotPort = hotPort;
  }

  async listen() {
    const servers = [
      Deno.listen({ port: this.#coolPort }),
      Deno.listen({ port: this.#hotPort }),
    ];

    console.log(
      `Listening on port ${this.#coolPort} (cool) and ${this.#hotPort} (hot)`,
    );

    const connections = await Promise.all(
      servers.map((server) => server.accept()),
    );

    await this.#setName(connections[0], connections[1]);

    game:
    for await (const players of this.#game) {
      for await (const [i, player] of players.entries()) {
        await this.#send(connections[i], "@");
        const ready = await this.#receive(connections[i]);
        if (ready !== "gr") {
          this.#game.elminatePlayer(player);
          this.stateEvent.emit(this.#game.currentState);
          break game;
        }

        await this.#send(
          connections[i],
          [
            "1",
            ...this.#game.preActionHint(player).flat().map((cell) =>
              cell.legacyCode
            ),
          ].join(""),
        );

        const command = await this.#receive(connections[i]);
        if (!command.match(/^[wpls][udrl]$/)) {
          this.#game.elminatePlayer(player);
          this.stateEvent.emit(this.#game.currentState);
          break game;
        }

        const action = createAction({
          actor: player,
          command: command as Command,
        });

        const postActionHint = this.#game.applyAction(action);

        const aliveFlag = this.#game.currentState.deadPlayers.has(player)
          ? "0"
          : "1";

        await this.#send(
          connections[i],
          [aliveFlag, ...postActionHint.flat().map((cell) => cell.legacyCode)]
            .join(""),
        );

        const turnEnd = await this.#receive(connections[i]);
        if (turnEnd !== "#") {
          this.#game.elminatePlayer(player);
          this.stateEvent.emit(this.#game.currentState);
          break game;
        }

        this.stateEvent.emit(this.#game.currentState);
      }
    }

    for (const conn of connections) {
      conn.close();
    }
  }

  #assertGame(game: Game) {
    if (game.currentState.players.length !== 2) {
      throw new Error("Only support 2 players");
    }
  }

  async #send(conn: Deno.Conn, data: string, withnl = true) {
    const encoder = new TextEncoder();
    const nl = withnl ? "\n" : "";
    await conn.write(encoder.encode(data + nl));
  }

  async #receive(conn: Deno.Conn) {
    const buf = new Uint8Array(1024);
    const n = await conn.read(buf);
    if (n === null) {
      throw new Error("Unexpected EOF");
    }
    return new TextDecoder().decode(buf.subarray(0, n)).trimEnd();
  }

  async #setName(coolConn: Deno.Conn, hotConn: Deno.Conn) {
    const coolName = await this.#receive(coolConn);
    const hotName = await this.#receive(hotConn);

    this.#game.currentState.players[0].name = coolName;
    this.#game.currentState.players[1].name = hotName;
  }
}
