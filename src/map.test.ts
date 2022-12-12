import { assertEquals, assertThrows } from "testing/asserts.ts";
import { createMap, getCell } from "./map.ts";
import {
  CellTypes,
  createBlockCell,
  createFloorCell,
  createItemCell,
} from "./map/cell.ts";

Deno.test("Cannot create a map without a name", () => {
  assertThrows(() => {
    createMap({ cells: [[]], name: "" });
  });
});

Deno.test("Being able to retrieve the cell at the specified coordinates", () => {
  const map = createMap({
    cells: [
      [createFloorCell(), createBlockCell(), createItemCell()],
    ],
    name: "test",
  });

  assertEquals(getCell(map, { x: 0, y: 0 }).type, CellTypes.Floor);
  assertEquals(getCell(map, { x: 1, y: 0 }).type, CellTypes.Block);
  assertEquals(getCell(map, { x: 2, y: 0 }).type, CellTypes.Item);
});

Deno.test("If the cell at the specified coordinates does not exist, a block cell is returned", () => {
  const map = createMap({
    cells: [
      [createFloorCell(), createFloorCell(), createFloorCell()],
    ],
    name: "test",
  });

  assertEquals(getCell(map, { x: 1, y: 1 }).type, CellTypes.Block);
  assertEquals(getCell(map, { x: -1, y: 1 }).type, CellTypes.Block);
  assertEquals(getCell(map, { x: 1, y: -1 }).type, CellTypes.Block);
});
