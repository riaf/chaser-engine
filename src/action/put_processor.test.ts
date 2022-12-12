import { assert, assertEquals } from "testing/asserts.ts";
import { Commands, createAction } from "../action.ts";
import { createMap, Map, Position } from "../map.ts";
import {
  createBlockCell,
  createFloorCell,
  createItemCell,
} from "../map/cell.ts";
import { createPlayer, Player } from "../player.ts";
import { createInitialScore } from "../score.ts";
import { createState as originalCreateState } from "../state.ts";
import { putProcessor } from "./put_processor.ts";

Deno.test("putProcessor", async (t) => {
  const players = [createPlayer(), createPlayer()];

  const blockCell = createBlockCell();
  const floorCell = createFloorCell();
  const itemCell = createItemCell();

  const createState = (props: {
    map: Map;
    players: Player[];
    playerPositions: Record<string, Position>;
  }) => {
    return originalCreateState({
      deadPlayers: new Set(),
      score: createInitialScore(players),
      killContexts: [],
      isFinish: false,
      waitFor: null,
      ...props,
    });
  };

  await t.step("Simply put a block and the target cell becomes a block", () => {
    const playerPositions = {
      [players[0].id]: { x: 1, y: 1 },
      [players[1].id]: { x: 2, y: 2 },
    };
    const map = createMap({
      cells: [
        [blockCell, blockCell, blockCell],
        [floorCell, floorCell, floorCell],
        [itemCell, itemCell, floorCell],
      ],
      name: "test",
    });

    const state = createState({ map, players, playerPositions });

    assertEquals(
      putProcessor(
        state,
        createAction({ command: Commands.PutDown, actor: players[0] }),
      ).map.cells,
      [
        [blockCell, blockCell, blockCell],
        [floorCell, floorCell, floorCell],
        [itemCell, blockCell, floorCell],
      ],
    );

    assertEquals(
      putProcessor(
        state,
        createAction({ command: Commands.PutLeft, actor: players[0] }),
      ).map.cells,
      [
        [blockCell, blockCell, blockCell],
        [blockCell, floorCell, floorCell],
        [itemCell, itemCell, floorCell],
      ],
    );

    assertEquals(
      putProcessor(
        state,
        createAction({ command: Commands.PutRight, actor: players[0] }),
      ).map.cells,
      [
        [blockCell, blockCell, blockCell],
        [floorCell, floorCell, blockCell],
        [itemCell, itemCell, floorCell],
      ],
    );

    assertEquals(
      putProcessor(
        state,
        createAction({ command: Commands.PutUp, actor: players[0] }),
      ).map.cells,
      [
        [blockCell, blockCell, blockCell],
        [floorCell, floorCell, floorCell],
        [itemCell, itemCell, floorCell],
      ],
    );
  });
});

Deno.test("Can put blocks to kill players", async (t) => {
  const players = [createPlayer(), createPlayer()];

  const blockCell = createBlockCell();
  const floorCell = createFloorCell();
  const itemCell = createItemCell();

  const createState = (props: {
    map: Map;
    players: Player[];
    playerPositions: Record<string, Position>;
  }) => {
    return originalCreateState({
      deadPlayers: new Set(),
      score: createInitialScore(players),
      killContexts: [],
      isFinish: false,
      waitFor: null,
      ...props,
    });
  };

  await t.step("Lock an enemy in a block cell", () => {
    const playerPositions = {
      [players[0].id]: { x: 1, y: 1 },
      [players[1].id]: { x: 2, y: 2 },
    };
    const map = createMap({
      cells: [
        [blockCell, blockCell, blockCell],
        [floorCell, floorCell, blockCell],
        [itemCell, itemCell, floorCell],
      ],
      name: "test",
    });

    const state = putProcessor(
      createState({ map, players, playerPositions }),
      createAction({ command: Commands.PutDown, actor: players[0] }),
    );

    assert(!state.deadPlayers.has(players[0]));
    assert(state.deadPlayers.has(players[1]));
  });

  await t.step("Lock self in a block cell", () => {
    const playerPositions = {
      [players[0].id]: { x: 1, y: 1 },
      [players[1].id]: { x: 2, y: 2 },
    };
    const map = createMap({
      cells: [
        [blockCell, blockCell, blockCell, floorCell],
        [floorCell, floorCell, blockCell, floorCell],
        [itemCell, blockCell, floorCell, floorCell],
      ],
      name: "test",
    });

    const state = putProcessor(
      createState({ map, players, playerPositions }),
      createAction({ command: Commands.PutLeft, actor: players[0] }),
    );

    assert(state.deadPlayers.has(players[0]));
    assert(!state.deadPlayers.has(players[1]));
  });

  await t.step("Lock self and an enemy in block cells", () => {
    const playerPositions = {
      [players[0].id]: { x: 1, y: 1 },
      [players[1].id]: { x: 2, y: 2 },
    };
    const map = createMap({
      cells: [
        [blockCell, blockCell, blockCell],
        [blockCell, floorCell, blockCell],
        [itemCell, itemCell, floorCell],
      ],
      name: "test",
    });

    const state = putProcessor(
      createState({ map, players, playerPositions }),
      createAction({ command: Commands.PutDown, actor: players[0] }),
    );

    assert(state.deadPlayers.has(players[0]));
    assert(state.deadPlayers.has(players[1]));
  });

  await t.step("Put a block cell at enemy coordinates", () => {
    const playerPositions = {
      [players[0].id]: { x: 1, y: 1 },
      [players[1].id]: { x: 1, y: 2 },
    };
    const map = createMap({
      cells: [
        [blockCell, blockCell, blockCell],
        [floorCell, floorCell, floorCell],
        [itemCell, floorCell, itemCell],
      ],
      name: "test",
    });

    const state = putProcessor(
      createState({ map, players, playerPositions }),
      createAction({ command: Commands.PutDown, actor: players[0] }),
    );

    assert(!state.deadPlayers.has(players[0]));
    assert(state.deadPlayers.has(players[1]));
  });
});
