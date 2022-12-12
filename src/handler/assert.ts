import { Action } from "../action.ts";
import { Player } from "../player.ts";
import { State } from "../state.ts";

export function assert(state: State, action: Action) {
  assertStateActivity(state);
  assertValidActionPlayer(state, action);
  assertPlayerAlived(state, action.actor);
}

function assertStateActivity(state: State) {
  if (state.isFinish) {
    throw new Error(`state finished.`);
  }
}

function assertValidActionPlayer(state: State, action: Action) {
  if (state.waitFor?.id !== action.actor.id) {
    throw new Error(`Invalid action player`);
  }
}

function assertPlayerAlived(state: State, player: Player) {
  if (state.deadPlayers.has(player)) {
    throw new Error(`Player dead`);
  }
}
