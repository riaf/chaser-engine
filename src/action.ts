import { Player } from "./player.ts";

// 列挙型として定義する代わりに、より厳密な型定義
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

/**
 * アクションオブジェクトを作成し、不変オブジェクトとして返す
 */
export function createAction({ actor, command }: CreateProps): Action {
  return Object.freeze({ actor, command });
}

/**
 * アクションの種類を決定するマッピングテーブル
 */
const ACTION_TYPE_MAP: Record<string, ActionType> = {
  w: "walk",
  l: "look",
  s: "search",
  p: "put",
};

/**
 * アクションの種類を決定する
 */
export function actionType(action: Action): ActionType {
  const prefix = action.command.charAt(0);
  const type = ACTION_TYPE_MAP[prefix];

  if (!type) {
    throw new Error(`Unknown action type: ${action.command}`);
  }

  return type;
}
