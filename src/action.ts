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
  switch (action.command[0]) {
    case "w":
      return "walk";
    case "l":
      return "look";
    case "s":
      return "search";
    case "p":
      return "put";
    default:
      throw new Error(`unknown action type: ${action.command}`);
  }
}
