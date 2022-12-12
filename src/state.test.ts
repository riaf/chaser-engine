import { assertEquals, assertNotEquals } from "testing/asserts.ts";
import { Commands } from "./action.ts";
import { createMap } from "./map.ts";
import { createPlayer } from "./player.ts";
import { createState, nextPlayer } from "./state.ts";

Deno.test("Always generates a new state", () => {
  const props = {
    map: createMap({ cells: [[]], name: "test" }),
    players: [],
    playerPositions: {},
    deadPlayers: new Set([]),
    score: {},
    killContexts: [],
    isFinish: false,
    waitFor: null,
  };

  assertNotEquals(createState(props).id, createState(props).id);
});

Deno.test("Being able to correctly determine the next player", () => {
  const [player1, player2] = [createPlayer(), createPlayer()];
  const state = createState({
    map: createMap({ cells: [[]], name: "test" }),
    players: [player1, player2],
    playerPositions: {
      [player1.id]: { x: 0, y: 0 },
      [player2.id]: { x: 0, y: 0 },
    },
    deadPlayers: new Set([]),
    score: {},
    killContexts: [],
    isFinish: false,
    waitFor: null,
  });

  assertEquals(
    nextPlayer(state, { command: Commands.LookDown, actor: player1 }),
    player2,
  );
  assertEquals(
    nextPlayer(state, { command: Commands.LookDown, actor: player2 }),
    player1,
  );
});
