import { getCell, Map, Position } from "../map.ts";
import { CellTypes } from "../map/cell.ts";
import { Player } from "../player.ts";
import { Score } from "../score.ts";
import { createState, KillContext, State } from "../state.ts";

type Props = {
  map?: Map;
  playerPositions?: Record<string, Position>;
  deadPlayers?: Set<Player>;
  score?: Score;
  killContexts?: KillContext[];
  isFinish?: boolean;
  waitFor: Player | null;
};

export function nextState(state: State, props: Props): State {
  const map = props.map ?? state.map;
  const deadPlayers = new Set([
    ...state.deadPlayers,
    ...(props.deadPlayers ?? []),
  ]);

  for (const player of state.players) {
    try {
      const position = state.playerPositions[player.id];
      if (
        [
          getCell(map, { x: position.x, y: position.y - 1 }),
          getCell(map, { x: position.x + 1, y: position.y }),
          getCell(map, { x: position.x, y: position.y + 1 }),
          getCell(map, { x: position.x - 1, y: position.y }),
        ].every((cell) => cell.type === CellTypes.Block)
      ) {
        deadPlayers.add(player);
        props.isFinish = true;
        props.waitFor = null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (deadPlayers.size > 0) {
    props.isFinish = true;
    props.waitFor = null;
  }

  return createState({ ...state, ...props, deadPlayers });
}
