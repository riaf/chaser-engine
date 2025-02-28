import { Player } from "./player.ts";

/**
 * プレイヤーのスコアを表す型
 * プレイヤーIDをキーとし、スコア（数値）を値とするレコード
 */
export type Score = Readonly<Record<string, number>>;

/**
 * 初期スコア（すべてのプレイヤーのスコアを0に）を作成する
 */
export function createInitialScore(players: readonly Player[]): Score {
  // fromEntries/entries パターンを使用して、より宣言的に記述
  return Object.freeze(
    Object.fromEntries(
      players.map((player) => [player.id, 0]),
    ),
  );
}

/**
 * プレイヤーのスコアを追加する（イミュータブル）
 */
export function addPlayerScore(
  score: Score,
  player: Player,
  point: number,
): Score {
  // プレイヤーIDが存在するか確認
  if (!(player.id in score)) {
    throw new Error(`Player ${player.id} not found in score`);
  }

  return Object.freeze({
    ...score,
    [player.id]: (score[player.id] || 0) + point,
  });
}
