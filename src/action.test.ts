import { assertEquals } from "testing/asserts.ts";
import { actionType, Commands, createAction } from "./action.ts";
import { createPlayer } from "./player.ts";

Deno.test("Determining the correct type from any action", () => {
  const actor = createPlayer();

  assertEquals(
    [
      actionType(createAction({ command: Commands.WalkUp, actor })),
      actionType(createAction({ command: Commands.WalkDown, actor })),
      actionType(createAction({ command: Commands.WalkLeft, actor })),
      actionType(createAction({ command: Commands.WalkRight, actor })),
    ],
    Array<string>(4).fill("walk"),
  );
  assertEquals(
    [
      actionType(createAction({ command: Commands.LookUp, actor })),
      actionType(createAction({ command: Commands.LookDown, actor })),
      actionType(createAction({ command: Commands.LookLeft, actor })),
      actionType(createAction({ command: Commands.LookRight, actor })),
    ],
    Array<string>(4).fill("look"),
  );
  assertEquals(
    [
      actionType(createAction({ command: Commands.SearchUp, actor })),
      actionType(createAction({ command: Commands.SearchDown, actor })),
      actionType(createAction({ command: Commands.SearchLeft, actor })),
      actionType(createAction({ command: Commands.SearchRight, actor })),
    ],
    Array<string>(4).fill("search"),
  );
  assertEquals(
    [
      actionType(createAction({ command: Commands.PutUp, actor })),
      actionType(createAction({ command: Commands.PutDown, actor })),
      actionType(createAction({ command: Commands.PutLeft, actor })),
      actionType(createAction({ command: Commands.PutRight, actor })),
    ],
    Array<string>(4).fill("put"),
  );
});
