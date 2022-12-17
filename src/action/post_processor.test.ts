import { assertEquals } from "testing/asserts.ts";
import { createMap } from "../map.ts";
import { createFloorCell } from "../map/cell.ts";
import { createPlayer } from "../player.ts";
import { createInitialScore } from "../score.ts";
import { createState } from "../state.ts";
import { nextState } from "./post_processor.ts";

Deno.test("Ensuring that the game ends if any player has died", () => {
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
    deadPlayers: new Set([players[0]]),
    score: createInitialScore(players),
    killContexts: [],
    isFinish: false,
    waitFor: players[0],
  });

  const newState = nextState(state, {
    waitFor: players[1],
  });

  assertEquals(newState.isFinish, true);
  assertEquals(newState.waitFor, null);
});
