import { assertEquals } from "testing/asserts.ts";
import { Commands } from "../action.ts";
import { createPlayer } from "../player.ts";
import { selectProcessor } from "./processor_selector.ts";
import { lookProcessor } from "./look_processor.ts";
import { putProcessor } from "./put_processor.ts";
import { searchProcessor } from "./search_processor.ts";
import { walkProcessor } from "./walk_processor.ts";

Deno.test("Being able to choose the correct processor for all commands", () => {
  const actor = createPlayer({ name: "player" });

  // Walk Processor
  for (
    const command of [
      Commands.WalkDown,
      Commands.WalkLeft,
      Commands.WalkRight,
      Commands.WalkUp,
    ]
  ) {
    assertEquals(
      selectProcessor({ command, actor }),
      walkProcessor,
    );
  }

  // Put Processor
  for (
    const command of [
      Commands.PutDown,
      Commands.PutLeft,
      Commands.PutRight,
      Commands.PutUp,
    ]
  ) {
    assertEquals(
      selectProcessor({ command, actor }),
      putProcessor,
    );
  }

  // Look Processor
  for (
    const command of [
      Commands.LookDown,
      Commands.LookLeft,
      Commands.LookRight,
      Commands.LookUp,
    ]
  ) {
    assertEquals(
      selectProcessor({ command, actor }),
      lookProcessor,
    );
  }

  // Search Processor
  for (
    const command of [
      Commands.SearchDown,
      Commands.SearchLeft,
      Commands.SearchRight,
      Commands.SearchUp,
    ]
  ) {
    assertEquals(
      selectProcessor({ command, actor }),
      searchProcessor,
    );
  }
});
