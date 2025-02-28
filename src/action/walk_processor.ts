import { Action } from "../action.ts";
import { createMap } from "../map.ts";
import {
  CellTypes,
  createBlockCell,
  createFloorCell,
  MapCell,
} from "../map/cell.ts";
import { addPlayerScore, Score } from "../score.ts";
import { nextPlayer, State } from "../state.ts";
import { getTargetDifferential } from "./differential.ts";
import { nextState } from "./post_processor.ts";

/**
 * 「歩く」アクションの処理を行う
 */
export function walkProcessor(state: State, action: Action): State {
  // プレイヤーの現在位置と移動差分を取得
  const { playerPositions, map, score: currentScore, deadPlayers } = state;
  const actorId = action.actor.id;
  const currentPos = playerPositions[actorId];
  const { x: dx, y: dy } = getTargetDifferential(action);

  // 次の位置を計算
  const nextPosition = {
    x: currentPos.x + dx,
    y: currentPos.y + dy,
  };

  // マップとスコアのディープコピー作成
  const newCells: MapCell[][] = JSON.parse(JSON.stringify(map.cells));
  let newScore: Score = { ...currentScore };

  // 次のセルの種類を取得
  const nextCell: MapCell = newCells[nextPosition.y][nextPosition.x];

  // ブロックに移動した場合: プレイヤーは死亡する
  if (nextCell.type === CellTypes.Block) {
    // 現在位置は床に、プレイヤーを死亡リストに追加
    newCells[currentPos.y][currentPos.x] = createFloorCell();
    newCells[nextPosition.y][nextPosition.x] = createBlockCell();

    return nextState(state, {
      map: createMap({ name: map.name, cells: newCells }),
      deadPlayers: new Set([...deadPlayers, action.actor]),
      waitFor: nextPlayer(state, action),
    });
  }

  // アイテムに移動した場合: スコア加算
  if (nextCell.type === CellTypes.Item) {
    newCells[currentPos.y][currentPos.x] = createBlockCell();
    newCells[nextPosition.y][nextPosition.x] = createFloorCell();
    newScore = addPlayerScore(currentScore, action.actor, 1);
  }

  // プレイヤー位置の更新
  const newPositions = { ...playerPositions, [actorId]: nextPosition };

  // 新しい状態を作成して返す
  return nextState(state, {
    map: createMap({ name: map.name, cells: newCells }),
    playerPositions: newPositions,
    score: newScore,
    waitFor: nextPlayer(state, action),
  });
}
