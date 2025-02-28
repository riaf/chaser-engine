import { Action } from "./action.ts";
import { isSamePosition, Map, Position } from "./map.ts";
import { Player } from "./player.ts";
import { Score } from "./score.ts";

/**
 * プレイヤーが他のプレイヤーを倒したときのコンテキスト
 */
export type KillContext = {
  readonly killer: Player;
  readonly target: Player;
};

/**
 * ゲームの状態を表すインターフェース
 */
export type State = {
  readonly id: string;
  readonly map: Map;
  readonly time: Date;
  readonly players: readonly Player[];
  readonly playerPositions: Readonly<Record<string, Position>>;
  readonly deadPlayers: ReadonlySet<Player>;
  readonly score: Readonly<Score>;
  readonly killContexts: readonly KillContext[];
  readonly isFinish: boolean;
  readonly lastAction?: Readonly<Action>;
  readonly waitFor: Player | null;
};

/**
 * 状態作成のためのパラメータ
 */
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

/**
 * 新しいゲーム状態を作成する
 */
export function createState({
  map,
  players,
  playerPositions,
  deadPlayers,
  score,
  killContexts,
  isFinish,
  lastAction,
  waitFor,
}: CreateProps): State {
  return Object.freeze({
    id: crypto.randomUUID(),
    time: new Date(),
    map,
    players,
    playerPositions: { ...playerPositions },
    deadPlayers: new Set(deadPlayers),
    score: { ...score },
    killContexts: [...killContexts],
    isFinish,
    lastAction,
    waitFor,
  });
}

/**
 * 次のプレイヤーを決定する
 */
export function nextPlayer(state: State, action: Action): Player {
  const currentIndex = state.players.findIndex((p) => p.id === action.actor.id);
  if (currentIndex === -1) {
    throw new Error(`Player ${action.actor.id} not found in state`);
  }

  const nextIndex = (currentIndex + 1) % state.players.length;
  return state.players[nextIndex];
}

/**
 * 特定の位置にいるプレイヤーを見つける
 */
export function findPlayersByPosition(
  state: State,
  position: Position,
): Player[] {
  return state.players.filter((player) =>
    !state.deadPlayers.has(player) &&
    isSamePosition(state.playerPositions[player.id], position)
  );
}
