import { eventmit } from "eventmit";
import { Command, createAction, Game, State } from "../mod.ts";

class CoolError extends Error { }
class HotError extends Error { }

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
  #connections: Deno.Conn[] = [];

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

    this.#connections = await Promise.all(
      servers.map((server) => server.accept()),
    );

    try {
      await this.#setName(this.#connections[0], this.#connections[1]);

      game:
      for await (const players of this.#game) {
        for await (const [i, player] of players.entries()) {
          try {
            await this.#send(this.#connections[i], "@");
            const ready = await this.#receive(this.#connections[i]);
            if (ready !== "gr") {
              this.#game.elminatePlayer(player);
              this.stateEvent.emit(this.#game.currentState);
              break game;
            }

            await this.#send(
              this.#connections[i],
              [
                "1",
                ...this.#game.preActionHint(player).flat().map((cell) =>
                  cell.legacyCode
                ),
              ].join(""),
            );

            const command = await this.#receive(this.#connections[i]);
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
              this.#connections[i],
              [aliveFlag, ...postActionHint.flat().map((cell) => cell.legacyCode)]
                .join(""),
            );

            const turnEnd = await this.#receive(this.#connections[i]);
            if (turnEnd !== "#") {
              this.#game.elminatePlayer(player);
              this.stateEvent.emit(this.#game.currentState);
              break game;
            }

            this.stateEvent.emit(this.#game.currentState);
          } catch (e) {
            const error = i === 0 ? new CoolError(e) : new HotError(e);
            throw error;
          }
        }
      }
    } catch (e) {
      console.error(e);
      this.end();

      if (e instanceof CoolError) {
        this.#game.elminatePlayer(this.#game.currentState.players[0]);
      } else if (e instanceof HotError) {
        this.#game.elminatePlayer(this.#game.currentState.players[1]);
      } else {
        throw e;
      }
    }

    this.end();
  }

  end() {
    for (const conn of this.#connections) {
      try {
        conn.close();
      } catch (e) {
        console.error(e);
      }
    }

    this.#connections = [];
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
    try {
      this.#game.currentState.players[0].name = await this.#receive(coolConn);
    } catch (e) {
      throw new CoolError(e);
    }

    try {
      this.#game.currentState.players[1].name = await this.#receive(hotConn);
    } catch (e) {
      throw new HotError(e);
    }
  }
}
