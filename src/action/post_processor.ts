import { Action } from "../action.ts";
import { getCell, Map, Position } from "../map.ts";
import { CellTypes } from "../map/cell.ts";
import { Player } from "../player.ts";
import { Score } from "../score.ts";
import { createState, KillContext, State } from "../state.ts";

/**
 * 状態更新のためのプロパティインターフェース
 */
type NextStateProps = {
  map?: Map;
  playerPositions?: Record<string, Position>;
  deadPlayers?: Set<Player>;
  score?: Score;
  killContexts?: KillContext[];
  isFinish?: boolean;
  lastAction?: Action;
  waitFor: Player | null;
};

/**
 * アクション処理後の状態を生成する
 * - 四方がブロックで囲まれたプレイヤーは死亡する
 * - 死亡したプレイヤーがいる場合はゲーム終了
 */
export function nextState(state: State, props: NextStateProps): State {
  const map = props.map ?? state.map;
  const newDeadPlayers = new Set([
    ...state.deadPlayers,
    ...(props.deadPlayers ?? []),
  ]);

  let shouldFinish = false;
  let finalWaitFor = props.waitFor;

  // 四方がブロックで囲まれたプレイヤーをチェック
  for (const player of state.players) {
    if (newDeadPlayers.has(player)) continue; // すでに死亡しているプレイヤーはスキップ

    try {
      const position = state.playerPositions[player.id];

      // プレイヤーの四方をチェック
      const surroundingCells = [
        { x: position.x, y: position.y - 1 }, // 上
        { x: position.x + 1, y: position.y }, // 右
        { x: position.x, y: position.y + 1 }, // 下
        { x: position.x - 1, y: position.y }, // 左
      ].map((pos) => getCell(map, pos));

      // 全方向がブロックの場合、プレイヤーは死亡
      if (surroundingCells.every((cell) => cell.type === CellTypes.Block)) {
        newDeadPlayers.add(player);
        shouldFinish = true;
        finalWaitFor = null;
      }
    } catch (error) {
      console.error(`Error checking player ${player.id} surroundings:`, error);
    }
  }

  // すでに死亡プレイヤーがいる場合もゲーム終了
  if (state.deadPlayers.size > 0 || newDeadPlayers.size > 0) {
    shouldFinish = true;
    finalWaitFor = null;
  }

  // 新しい状態を作成するための完全なプロパティセット
  const newStateProps = {
    players: [...state.players], // 配列をコピー
    map: props.map ?? state.map,
    playerPositions: props.playerPositions ?? state.playerPositions,
    deadPlayers: newDeadPlayers,
    score: props.score ?? state.score,
    killContexts: [...(props.killContexts ?? state.killContexts)], // 配列をコピー
    isFinish: shouldFinish || props.isFinish || state.isFinish,
    lastAction: props.lastAction ?? state.lastAction,
    waitFor: finalWaitFor,
  };

  return createState(newStateProps);
}
