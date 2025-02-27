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

function handleBlockCell(
  state: State,
  action: Action,
  cells: MapCell[][],
  pos: { y: number; x: number },
  nextPosition: { y: number; x: number }
): State {
  cells[pos.y][pos.x] = createFloorCell();
  cells[nextPosition.y][nextPosition.x] = createBlockCell();
  return nextState(state, {
    map: createMap({ ...state.map, cells }),
    deadPlayers: new Set([...state.deadPlayers, action.actor]),
    waitFor: nextPlayer(state, action),
  });
}

function handleItemCell(
  state: State,
  action: Action,
  cells: MapCell[][],
  pos: { y: number; x: number },
  nextPosition: { y: number; x: number },
  score: Score
): { cells: MapCell[][]; score: Score } {
  cells[pos.y][pos.x] = createBlockCell();
  cells[nextPosition.y][nextPosition.x] = createFloorCell();
  score = addPlayerScore(score, action.actor, 1);
  return { cells, score };
}

export function walkProcessor(state: State, action: Action): State {
  const pos = state.playerPositions[action.actor.id];
  const dydx = getTargetDifferential(action);

  const nextPosition = {
    y: pos.y + dydx.y,
    x: pos.x + dydx.x,
  };

  let score: Score = structuredClone(state.score);
  const cells: MapCell[][] = structuredClone(state.map.cells);
  const nextCell: MapCell = cells[nextPosition.y][nextPosition.x];

  if (nextCell.type === CellTypes.Block) {
    return handleBlockCell(state, action, cells, pos, nextPosition);
  }

  if (nextCell.type === CellTypes.Item) {
    const result = handleItemCell(state, action, cells, pos, nextPosition, score);
    cells = result.cells;
    score = result.score;
  }

  const playerPositions = structuredClone(state.playerPositions);
  playerPositions[action.actor.id] = nextPosition;

  return nextState(state, {
    map: createMap({ ...state.map, cells }),
    playerPositions,
    waitFor: nextPlayer(state, action),
  });
}
