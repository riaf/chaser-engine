import { Action } from "../action.ts";
import { createMap } from "../map.ts";
import { createBlockCell, MapCell } from "../map/cell.ts";
import { findPlayersByPosition, nextPlayer, State } from "../state.ts";
import { getTargetDifferential } from "./differential.ts";
import { nextState } from "./post_processor.ts";

export function putProcessor(state: State, action: Action): State {
  const pos = state.playerPositions[action.actor.id];
  const dydx = getTargetDifferential(action);

  const targetPosition = {
    y: pos.y + dydx.y,
    x: pos.x + dydx.x,
  };

  const cells: MapCell[][] = structuredClone(state.map.cells);
  cells[targetPosition.y][targetPosition.x] = createBlockCell();

  const inTargetPlayers = findPlayersByPosition(state, targetPosition);
  if (inTargetPlayers.length > 0) {
    return nextState(state, {
      map: createMap({ ...state.map, cells }),
      deadPlayers: new Set([...state.deadPlayers, ...inTargetPlayers]),
      killContexts: [
        ...state.killContexts,
        ...inTargetPlayers.map((p) => ({
          killer: action.actor,
          target: p,
        })),
      ],
      waitFor: nextPlayer(state, action),
    });
  }

  return nextState(state, {
    map: createMap({ ...state.map, cells }),
    waitFor: nextPlayer(state, action),
  });
}
