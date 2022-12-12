import { Command, Commands } from "../action.ts";
import { Range } from "../map.ts";

export const aroundRange: Range = {
  startY: -1,
  startX: -1,
  lengthY: 3,
  lengthX: 3,
} as const;

export const postActionRange: Record<Command, Range> = {
  [Commands.WalkUp]: aroundRange,
  [Commands.WalkDown]: aroundRange,
  [Commands.WalkLeft]: aroundRange,
  [Commands.WalkRight]: aroundRange,
  [Commands.LookUp]: { startY: -3, startX: -1, lengthY: 3, lengthX: 3 },
  [Commands.LookDown]: { startY: 1, startX: -1, lengthY: 3, lengthX: 3 },
  [Commands.LookLeft]: { startY: -1, startX: -3, lengthY: 3, lengthX: 3 },
  [Commands.LookRight]: { startY: -1, startX: 1, lengthY: 3, lengthX: 3 },
  [Commands.SearchUp]: { startY: -9, startX: 0, lengthY: 9, lengthX: 1 },
  [Commands.SearchDown]: { startY: 1, startX: 0, lengthY: 9, lengthX: 1 },
  [Commands.SearchLeft]: { startY: 0, startX: -9, lengthY: 1, lengthX: 9 },
  [Commands.SearchRight]: { startY: 0, startX: 1, lengthY: 1, lengthX: 9 },
  [Commands.PutUp]: aroundRange,
  [Commands.PutDown]: aroundRange,
  [Commands.PutLeft]: aroundRange,
  [Commands.PutRight]: aroundRange,
} as const;
