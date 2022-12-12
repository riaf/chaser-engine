import { assertEquals } from "testing/asserts.ts";
import { Commands } from "../action.ts";
import { createPlayer } from "../player.ts";
import { getTargetDifferential } from "./differential.ts";

Deno.test("Being able to properly handle commands with and without effect", () => {
  const actor = createPlayer({ name: "player" });

  assertEquals(getTargetDifferential({ command: Commands.WalkUp, actor }), {
    x: 0,
    y: -1,
  });
  assertEquals(getTargetDifferential({ command: Commands.LookUp, actor }), {
    x: 0,
    y: 0,
  });
});
