import { Action, Command, Commands } from "../action.ts";
import { State } from "../state.ts";
import { putProcessor } from "./put_processor.ts";
import { skipProcessor } from "./skip_processor.ts";
import { walkProcessor } from "./walk_processor.ts";

type Processor = (state: State, action: Action) => State;

const createProcessorMap = (commands: Command[], processor: Processor) => {
  return commands.reduce((acc, command) => {
    acc[command] = processor;
    return acc;
  }, {} as Record<Command, Processor>);
};

const processors: Record<Command, Processor> = {
  ...createProcessorMap(
    [Commands.WalkUp, Commands.WalkDown, Commands.WalkLeft, Commands.WalkRight],
    walkProcessor
  ),
  ...createProcessorMap(
    [Commands.PutUp, Commands.PutDown, Commands.PutLeft, Commands.PutRight],
    putProcessor
  ),
  ...createProcessorMap(
    [
      Commands.LookUp,
      Commands.LookDown,
      Commands.LookLeft,
      Commands.LookRight,
      Commands.SearchUp,
      Commands.SearchDown,
      Commands.SearchLeft,
      Commands.SearchRight,
    ],
    skipProcessor
  ),
} as const;

export function selectProcessor(action: Action): Processor {
  return processors[action.command];
}
