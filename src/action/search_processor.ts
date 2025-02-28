import { Action } from "../action.ts";
import { State } from "../state.ts";
import { getCommandDirection } from "./differential.ts";

export function searchProcessor(state: State, action: Action): State {
  const direction = getCommandDirection(action.command);
  if (!direction) {
    throw new Error(`Invalid search direction in command: ${action.command}`);
  }

  // Search action doesn't modify the state but could be enhanced to
  // provide information about items in the searched direction

  return state;
}
