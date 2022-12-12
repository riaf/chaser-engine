import { Action } from "./action.ts";
import { apply } from "./handler.ts";
import { getCellRange, Map, Position } from "./map.ts";
import { MapCell } from "./map/cell.ts";
import { aroundRange, postActionRange } from "./map/range.ts";
import { Player } from "./player.ts";
import { createInitialScore } from "./score.ts";
import { createState, State } from "./state.ts";

type GameProps = {
  readonly map: Map;
  readonly players: Player[];
  readonly playerPositions: Record<string, Position>;
  readonly maxTurn: number;
};

export class Game {
  readonly id = crypto.randomUUID();
  readonly maxTurn: number;

  #state: State;
  #stateHistory: State[] = [];
  #turn = 0;

  constructor({
    map,
    players,
    playerPositions,
    maxTurn,
  }: GameProps) {
    this.#state = createState({
      map,
      players,
      playerPositions,
      deadPlayers: new Set([]),
      score: createInitialScore(players),
      killContexts: [],
      isFinish: false,
      waitFor: players[0],
    });
    this.#stateHistory.push(this.#state);
    this.maxTurn = maxTurn;
  }

  get currentState() {
    return this.#state;
  }

  get stateHistory() {
    return this.#stateHistory;
  }

  applyAction(action: Action): MapCell[][] {
    this.#setState(apply(this.#state, action));

    return this.#postActionHint(action);
  }

  elminatePlayer(player: Player, finish = true): void {
    this.#setState(createState({
      ...this.#state,
      deadPlayers: new Set([...this.#state.deadPlayers, player]),
      isFinish: finish,
      waitFor: null,
    }));
  }

  async *[Symbol.asyncIterator]() {
    game:
    while (true) {
      this.#turn += 1;

      if (this.#turn >= this.maxTurn) {
        break game;
      }

      if (this.#state.isFinish) {
        break game;
      }

      yield this.#alivePlayers();
    }
  }

  preActionHint(player: Player): MapCell[][] {
    return getCellRange(
      this.#state.map,
      this.#state.playerPositions[player.id],
      aroundRange,
    );
  }

  #postActionHint(action: Action): MapCell[][] {
    return getCellRange(
      this.#state.map,
      this.#state.playerPositions[action.actor.id],
      postActionRange[action.command],
    );
  }

  #setState(state: State): void {
    this.#state = state;
    this.#stateHistory.push(state);
  }

  #alivePlayers(): Player[] {
    return this.#state.players.filter((p: Player) =>
      !this.#state.deadPlayers.has(p)
    );
  }
}
