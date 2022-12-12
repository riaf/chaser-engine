import { Action, Command, Commands } from "../action.ts";

type TargetDifferential = { x: number; y: number };

const targetDifferentials: Record<Command, TargetDifferential> = {
  [Commands.WalkUp]: { x: 0, y: -1 },
  [Commands.WalkDown]: { x: 0, y: 1 },
  [Commands.WalkLeft]: { x: -1, y: 0 },
  [Commands.WalkRight]: { x: 1, y: 0 },
  [Commands.LookUp]: { x: 0, y: 0 },
  [Commands.LookDown]: { x: 0, y: 0 },
  [Commands.LookLeft]: { x: 0, y: 0 },
  [Commands.LookRight]: { x: 0, y: 0 },
  [Commands.SearchUp]: { x: 0, y: 0 },
  [Commands.SearchDown]: { x: 0, y: 0 },
  [Commands.SearchLeft]: { x: 0, y: 0 },
  [Commands.SearchRight]: { x: 0, y: 0 },
  [Commands.PutUp]: { x: 0, y: -1 },
  [Commands.PutDown]: { x: 0, y: 1 },
  [Commands.PutLeft]: { x: -1, y: 0 },
  [Commands.PutRight]: { x: 1, y: 0 },
} as const;

export function getTargetDifferential(action: Action) {
  return targetDifferentials[action.command];
}
