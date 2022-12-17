import { assertEquals } from "testing/asserts.ts";
import { Commands, createAction } from "../action.ts";
import { createMap } from "../map.ts";
import { createFloorCell } from "../map/cell.ts";
import { createPlayer } from "../player.ts";
import { createInitialScore } from "../score.ts";
import { createState } from "../state.ts";
import { skipProcessor } from "./skip_processor.ts";

Deno.test("Ensuring that the state has changed to waiting for the next player", () => {
  const players = [
    createPlayer(),
    createPlayer(),
  ];
  const state = createState({
    map: createMap({
      name: "test",
      cells: [[createFloorCell(), createFloorCell()]],
    }),
    players,
    playerPositions: {
      [players[0].id]: { x: 0, y: 0 },
      [players[1].id]: { x: 0, y: 0 },
    },
    deadPlayers: new Set(),
    score: createInitialScore(players),
    killContexts: [],
    isFinish: false,
    waitFor: players[0],
  });

  const action = createAction({
    command: Commands.LookDown,
    actor: players[0],
  });

  const newState = skipProcessor(state, action);
  assertEquals(newState.waitFor?.id, players[1].id);
});
