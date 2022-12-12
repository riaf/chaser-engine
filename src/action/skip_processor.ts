import { Action } from "../action.ts";
import { nextPlayer, State } from "../state.ts";
import { nextState } from "./post_processor.ts";

export function skipProcessor(state: State, action: Action): State {
  return nextState(state, {
    waitFor: nextPlayer(state, action),
  });
}
