import { Action, actionType, Command, Commands } from "../action.ts";
import { State } from "../state.ts";
import { lookProcessor } from "./look_processor.ts";
import { putProcessor } from "./put_processor.ts";
import { searchProcessor } from "./search_processor.ts";
import { walkProcessor } from "./walk_processor.ts";

export type Processor = (state: State, action: Action) => State;

// Registry of processors by action type
const processorsByType: Record<string, Processor> = {
  "walk": walkProcessor,
  "look": lookProcessor,
  "search": searchProcessor,
  "put": putProcessor,
};

// For backward compatibility
const commandProcessors: Record<Command, Processor> = {
  [Commands.WalkUp]: walkProcessor,
  [Commands.WalkDown]: walkProcessor,
  [Commands.WalkLeft]: walkProcessor,
  [Commands.WalkRight]: walkProcessor,
  [Commands.PutUp]: putProcessor,
  [Commands.PutDown]: putProcessor,
  [Commands.PutLeft]: putProcessor,
  [Commands.PutRight]: putProcessor,
  [Commands.LookUp]: lookProcessor,
  [Commands.LookDown]: lookProcessor,
  [Commands.LookLeft]: lookProcessor,
  [Commands.LookRight]: lookProcessor,
  [Commands.SearchUp]: searchProcessor,
  [Commands.SearchDown]: searchProcessor,
  [Commands.SearchLeft]: searchProcessor,
  [Commands.SearchRight]: searchProcessor,
} as const;

export function selectProcessor(action: Action): Processor {
  // Try to get processor from registry using action type
  const type = actionType(action);
  const processor = processorsByType[type];

  if (processor) {
    return processor;
  }

  // Fallback to direct command mapping
  return commandProcessors[action.command];
}
