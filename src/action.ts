import { Player } from "./player.ts";

export const Commands = {
  WalkUp: "wu",
  WalkRight: "wr",
  WalkDown: "wd",
  WalkLeft: "wl",
  LookUp: "lu",
  LookRight: "lr",
  LookDown: "ld",
  LookLeft: "ll",
  SearchUp: "su",
  SearchRight: "sr",
  SearchDown: "sd",
  SearchLeft: "sl",
  PutUp: "pu",
  PutRight: "pr",
  PutDown: "pd",
  PutLeft: "pl",
} as const;

export type ActionType = "walk" | "look" | "search" | "put";

export type Command = typeof Commands[keyof typeof Commands];

export type Action = {
  readonly actor: Player;
  readonly command: Command;
};

type CreateProps = {
  actor: Player;
  command: Command;
};

export function createAction(props: CreateProps): Action {
  return { ...props } as const;
}

export function actionType(action: Action): ActionType {
  if (action.command.startsWith("w")) {
    return "walk";
  } else if (action.command.startsWith("l")) {
    return "look";
  } else if (action.command.startsWith("s")) {
    return "search";
  } else if (action.command.startsWith("p")) {
    return "put";
  } else {
    throw new Error(`unknown action type: ${action.command}`);
  }
}
