import { Action } from "../action.ts";
import { State } from "../state.ts";
import { getCommandDirection } from "./differential.ts";

export function lookProcessor(state: State, action: Action): State {
  const direction = getCommandDirection(action.command);
  if (!direction) {
    throw new Error(`Invalid look direction in command: ${action.command}`);
  }

  // Look action doesn't modify the state but could be enhanced to
  // provide vision or information in a future implementation

  return state;
}
