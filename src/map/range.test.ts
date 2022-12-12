import { assertEquals } from "testing/asserts.ts";
import { Commands } from "../action.ts";
import { createMap, getCellRange } from "../map.ts";
import { createBlockCell, createFloorCell, createItemCell } from "./cell.ts";
import { aroundRange, postActionRange } from "./range.ts";

Deno.test("ranges", async (t) => {
  const blockCell = createBlockCell();
  const floorCell = createFloorCell();
  const itemCell = createItemCell();

  const map = createMap({
    cells: [
      [blockCell, blockCell, blockCell, floorCell, floorCell],
      [floorCell, itemCell, floorCell, floorCell, floorCell],
      [itemCell, blockCell, floorCell, floorCell, floorCell],
      [blockCell, floorCell, itemCell, floorCell, floorCell],
      [itemCell, floorCell, blockCell, itemCell, floorCell],
    ],
    name: "test",
  });

  await t.step("around ranges", () => {
    const pos = { y: 2, x: 2 };

    assertEquals(getCellRange(map, pos, aroundRange), [
      [itemCell, floorCell, floorCell],
      [blockCell, floorCell, floorCell],
      [floorCell, itemCell, floorCell],
    ]);
  });

  await t.step("look ranges", () => {
    const pos = { y: 2, x: 2 };

    assertEquals(getCellRange(map, pos, postActionRange[Commands.LookUp]), [
      [blockCell, blockCell, blockCell],
      [blockCell, blockCell, floorCell],
      [itemCell, floorCell, floorCell],
    ]);
    assertEquals(getCellRange(map, pos, postActionRange[Commands.LookDown]), [
      [floorCell, itemCell, floorCell],
      [floorCell, blockCell, itemCell],
      [blockCell, blockCell, blockCell],
    ]);
    assertEquals(getCellRange(map, pos, postActionRange[Commands.LookLeft]), [
      [blockCell, floorCell, itemCell],
      [blockCell, itemCell, blockCell],
      [blockCell, blockCell, floorCell],
    ]);
    assertEquals(getCellRange(map, pos, postActionRange[Commands.LookRight]), [
      [floorCell, floorCell, blockCell],
      [floorCell, floorCell, blockCell],
      [floorCell, floorCell, blockCell],
    ]);
  });

  await t.step("search ranges", () => {
    const pos = { y: 2, x: 2 };

    assertEquals(getCellRange(map, pos, postActionRange[Commands.SearchDown]), [
      [itemCell],
      [blockCell],
      [blockCell],
      [blockCell],
      [blockCell],
      [blockCell],
      [blockCell],
      [blockCell],
      [blockCell],
    ]);

    assertEquals(getCellRange(map, pos, postActionRange[Commands.SearchLeft]), [
      [
        blockCell,
        blockCell,
        blockCell,
        blockCell,
        blockCell,
        blockCell,
        blockCell,
        itemCell,
        blockCell,
      ],
    ]);

    assertEquals(
      getCellRange(map, pos, postActionRange[Commands.SearchRight]),
      [
        [
          floorCell,
          floorCell,
          blockCell,
          blockCell,
          blockCell,
          blockCell,
          blockCell,
          blockCell,
          blockCell,
        ],
      ],
    );

    assertEquals(getCellRange(map, pos, postActionRange[Commands.SearchUp]), [
      [blockCell],
      [blockCell],
      [blockCell],
      [blockCell],
      [blockCell],
      [blockCell],
      [blockCell],
      [blockCell],
      [floorCell],
    ]);
  });
});
