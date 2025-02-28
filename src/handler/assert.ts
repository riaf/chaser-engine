import { Action } from "../action.ts";
import { Player } from "../player.ts";
import { State } from "../state.ts";

/**
 * アクションの実行前に状態の整合性を検証する
 */
export function assert(state: State, action: Action): void {
  // 各検証を順番に実行し、エラーがあれば即座に中断
  assertStateActivity(state);
  assertValidActionPlayer(state, action);
  assertPlayerAlive(state, action.actor);
}

/**
 * ゲームが終了していないことを検証
 */
function assertStateActivity(state: State): void {
  if (state.isFinish) {
    throw new Error(`Game is already finished and cannot accept more actions.`);
  }
}

/**
 * アクションを実行しようとしているプレイヤーが適切かどうかを検証
 */
function assertValidActionPlayer(state: State, action: Action): void {
  // waitForがnullでないことを確認
  if (!state.waitFor) {
    throw new Error(`No player is currently expected to act.`);
  }

  // 期待されているプレイヤーが行動しているか確認
  if (state.waitFor.id !== action.actor.id) {
    throw new Error(
      `Expected player ${state.waitFor.id} to act, but received action from player ${action.actor.id}.`,
    );
  }
}

/**
 * プレイヤーが生存していることを検証
 */
function assertPlayerAlive(state: State, player: Player): void {
  if (state.deadPlayers.has(player)) {
    throw new Error(`Player ${player.id} is dead and cannot perform actions.`);
  }
}
