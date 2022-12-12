import { Action } from "./action.ts";
import { isSamePosition, Map, Position } from "./map.ts";
import { Player } from "./player.ts";
import { Score } from "./score.ts";

export type KillContext = {
  readonly killer: Player;
  readonly target: Player;
};

export type State = {
  readonly id: string;
  readonly map: Map;
  readonly time: Date;
  readonly players: Player[];
  readonly playerPositions: Record<string, Position>;
  readonly deadPlayers: Set<Player>;
  readonly score: Score;
  readonly killContexts: KillContext[];
  readonly isFinish: boolean;
  readonly lastAction?: Action;
  readonly waitFor: Player | null;
};

type CreateProps = {
  map: Map;
  players: Player[];
  playerPositions: Record<string, Position>;
  deadPlayers: Set<Player>;
  score: Score;
  killContexts: KillContext[];
  isFinish: boolean;
  lastAction?: Action;
  waitFor: Player | null;
};

export function createState(props: CreateProps): State {
  return {
    ...props,
    id: crypto.randomUUID(),
    time: new Date(),
    deadPlayers: new Set(props.deadPlayers),
  } as const;
}

export function nextPlayer(state: State, action: Action): Player {
  return state.players[
    state.players.findIndex((p) => p.id === action.actor.id) + 1
  ] ?? state.players[0];
}

export function findPlayersByPosition(state: State, position: Position) {
  return state.players.filter((p) =>
    isSamePosition(state.playerPositions[p.id], position)
  );
}
