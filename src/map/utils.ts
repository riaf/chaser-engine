import { createBlockCell, MapCell } from "./cell.ts";
import { CreateMapProps, Map, Position, Range } from "./types.ts";

const outCell = createBlockCell();

/**
 * マップオブジェクトを作成し、検証する
 */
export function createMap({ name, cells }: CreateMapProps): Map {
  const map = { name, cells };
  assertMap(map);
  return Object.freeze(map);
}

/**
 * 二つの位置が同じかどうかを判定する
 */
export function isSamePosition(
  { x: x1, y: y1 }: Position,
  { x: x2, y: y2 }: Position,
): boolean {
  return x1 === x2 && y1 === y2;
}

/**
 * 指定された位置にあるセルを取得する
 * 境界外の場合はブロックセルを返す
 */
export function getCell(map: Map, { x, y }: Position): MapCell {
  if (
    x < 0 || y < 0 ||
    map.cells.length <= y ||
    map.cells[y].length <= x
  ) {
    return outCell;
  }

  return map.cells[y][x];
}

/**
 * 指定された位置を中心に、範囲内のセルの配列を取得する
 * より関数型のアプローチで実装
 */
export function getCellRange(
  map: Map,
  position: Position,
  range: Range,
): MapCell[][] {
  return Array.from({ length: range.lengthY }, (_, yIndex) => {
    const y = position.y + range.startY + yIndex;

    return Array.from({ length: range.lengthX }, (_, xIndex) => {
      const x = position.x + range.startX + xIndex;
      return getCell(map, { x, y });
    });
  });
}

/**
 * 指定された位置がマップの有効な位置かどうかを判定する
 */
export function isValidPosition(map: Map, { x, y }: Position): boolean {
  return (
    x >= 0 && y >= 0 &&
    y < map.cells.length &&
    x < map.cells[y].length
  );
}

/**
 * マップデータの整合性を検証する
 */
function assertMap(map: Map): void {
  if (map.name === "") {
    throw new Error(`Empty map name`);
  }

  if (map.cells.length === 0) {
    throw new Error("Map must have at least one row");
  }

  const rowLength = map.cells[0].length;
  if (rowLength === 0) {
    throw new Error("Map must have at least one column");
  }

  // すべての行が同じ長さであることを検証
  const invalidRow = map.cells.findIndex((row) => row.length !== rowLength);
  if (invalidRow !== -1) {
    throw new Error(
      `All rows must have the same length. Row 0 has ${rowLength} cells, but row ${invalidRow} has ${
        map.cells[invalidRow].length
      } cells.`,
    );
  }
}
