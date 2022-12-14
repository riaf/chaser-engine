import { Action } from "./action.ts";
import { selectProcessor } from "./action/processor_selector.ts";
import { assert } from "./handler/assert.ts";
import { State } from "./state.ts";

export function apply(state: State, action: Action): State {
  assert(state, action);

  const nextState = selectProcessor(action)(state, action);

  return { ...nextState, lastAction: structuredClone(action) };
}
