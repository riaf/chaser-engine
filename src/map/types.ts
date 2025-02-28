import { MapCell } from "./cell.ts";

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

export type CreateMapProps = {
  name: string;
  cells: MapCell[][];
};
