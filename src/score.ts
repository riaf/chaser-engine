import { Player } from "./player.ts";

export type Score = {
  readonly [playerId: string]: number;
};

export function createInitialScore(players: Player[]): Score {
  return players.reduce<Score>((acc, player) => {
    return {
      ...acc,
      [player.id]: 0,
    };
  }, {});
}

export function addPlayerScore(
  score: Score,
  player: Player,
  point: number,
): Score {
  return {
    ...score,
    [player.id]: score[player.id] + point,
  } as const;
}
