import { Action, Command, Commands } from "../action.ts";
import { State } from "../state.ts";
import { putProcessor } from "./put_processor.ts";
import { skipProcessor } from "./skip_processor.ts";
import { walkProcessor } from "./walk_processor.ts";

type Processor = (state: State, action: Action) => State;

const processors: Record<Command, Processor> = {
  [Commands.WalkUp]: walkProcessor,
  [Commands.WalkDown]: walkProcessor,
  [Commands.WalkLeft]: walkProcessor,
  [Commands.WalkRight]: walkProcessor,
  [Commands.PutUp]: putProcessor,
  [Commands.PutDown]: putProcessor,
  [Commands.PutLeft]: putProcessor,
  [Commands.PutRight]: putProcessor,
  [Commands.LookUp]: skipProcessor,
  [Commands.LookDown]: skipProcessor,
  [Commands.LookLeft]: skipProcessor,
  [Commands.LookRight]: skipProcessor,
  [Commands.SearchUp]: skipProcessor,
  [Commands.SearchDown]: skipProcessor,
  [Commands.SearchLeft]: skipProcessor,
  [Commands.SearchRight]: skipProcessor,
} as const;

export function selectProcessor(action: Action): Processor {
  return processors[action.command];
}
