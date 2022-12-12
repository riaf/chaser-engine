import { assertArrayIncludes, assertEquals } from "testing/asserts.ts";
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
import { walkProcessor } from "./walk_processor.ts";

Deno.test("walkProcessor", async (t) => {
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

  await t.step("Simply walk", () => {
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
      walkProcessor(
        state,
        createAction({ command: Commands.WalkDown, actor: players[0] }),
      ).map.cells,
      [
        [blockCell, blockCell, blockCell],
        [floorCell, blockCell, floorCell],
        [itemCell, floorCell, floorCell],
      ],
    );

    assertEquals(
      walkProcessor(
        state,
        createAction({ command: Commands.WalkLeft, actor: players[0] }),
      ).map.cells,
      [
        [blockCell, blockCell, blockCell],
        [floorCell, floorCell, floorCell],
        [itemCell, itemCell, floorCell],
      ],
    );

    assertEquals(
      walkProcessor(
        state,
        createAction({ command: Commands.WalkRight, actor: players[0] }),
      ).map.cells,
      [
        [blockCell, blockCell, blockCell],
        [floorCell, floorCell, floorCell],
        [itemCell, itemCell, floorCell],
      ],
    );

    assertArrayIncludes(
      [
        ...(walkProcessor(
          state,
          createAction({ command: Commands.WalkUp, actor: players[0] }),
        ).deadPlayers),
      ],
      [players[0]],
    );
  });
});
