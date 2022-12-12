import { assertEquals } from "testing/asserts.ts";
import { createPlayer } from "./player.ts";
import { addPlayerScore, createInitialScore } from "./score.ts";

Deno.test("Being able to initialize score for each players", () => {
  const players = [createPlayer(), createPlayer()];
  assertEquals(createInitialScore(players), {
    [players[0].id]: 0,
    [players[1].id]: 0,
  });
});

Deno.test("Being able to add point for specific player", () => {
  const players = [createPlayer(), createPlayer()];
  const score = createInitialScore(players);

  assertEquals(addPlayerScore(score, players[0], 1)[players[0].id], 1);
  // immutable?
  assertEquals(addPlayerScore(score, players[0], 1)[players[0].id], 1);

  const newScore = addPlayerScore(score, players[1], 1);
  assertEquals(addPlayerScore(newScore, players[1], 1)[players[1].id], 2);
});
