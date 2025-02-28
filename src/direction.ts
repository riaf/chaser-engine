export type Direction = "up" | "right" | "down" | "left";

export const Directions: readonly Direction[] = [
  "up",
  "right",
  "down",
  "left",
] as const;

export type DirectionDiff = {
  readonly x: number;
  readonly y: number;
};

export const getDirectionDiff = (direction: Direction): DirectionDiff => {
  switch (direction) {
    case "up":
      return { x: 0, y: -1 };
    case "right":
      return { x: 1, y: 0 };
    case "down":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
  }
};

export const getNextPosition = (
  x: number,
  y: number,
  direction: Direction,
): [number, number] => {
  const diff = getDirectionDiff(direction);
  return [x + diff.x, y + diff.y];
};
