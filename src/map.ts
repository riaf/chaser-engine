import { createBlockCell, MapCell } from "./map/cell.ts";

export type Map = {
  readonly name: string;
  readonly cells: MapCell[][];
};

export type Position = {
  x: number;
  y: number;
};

export type Range = {
  startY: number;
  startX: number;
  lengthY: number;
  lengthX: number;
};

type CreateProps = {
  name: string;
  cells: MapCell[][];
};

const outCell = createBlockCell();

export function createMap(props: CreateProps): Map {
  const map = { ...props };

  assertMap(map);

  return map;
}

export function isSamePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function getCell(map: Map, position: Position): MapCell {
  if (
    position.x < 0 || position.y < 0 ||
    map.cells.length <= position.y ||
    map.cells[position.y].length <= position.x
  ) {
    return outCell;
  }

  return map.cells[position.y][position.x];
}

export function getCellRange(
  map: Map,
  position: Position,
  range: Range,
): MapCell[][] {
  const cells: MapCell[][] = [];
  for (
    let y = position.y + range.startY;
    y < position.y + range.startY + range.lengthY;
    y++
  ) {
    const xcells: MapCell[] = [];
    for (
      let x = position.x + range.startX;
      x < position.x + range.startX + range.lengthX;
      x++
    ) {
      xcells.push(getCell(map, { x, y }));
    }
    cells.push(xcells);
  }
  return cells;
}

function assertMap(map: Map): void {
  if (map.name === "") {
    throw new Error(`Empty map name`);
  }
}
