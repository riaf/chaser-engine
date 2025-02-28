import { Action, Command } from "../action.ts";
import { Direction, getDirectionDiff } from "../direction.ts";

export function getCommandDirection(command: Command): Direction | null {
  const lastChar = command.charAt(1);
  switch (lastChar) {
    case "u":
      return "up";
    case "r":
      return "right";
    case "d":
      return "down";
    case "l":
      return "left";
    default:
      return null;
  }
}

export function getTargetDifferential(action: Action) {
  const direction = getCommandDirection(action.command);
  if (!direction) {
    throw new Error(`Invalid command direction: ${action.command}`);
  }

  // For look/search commands, return no movement
  if (action.command.startsWith("l") || action.command.startsWith("s")) {
    return { x: 0, y: 0 };
  }

  // For walk/put commands, return the direction differential
  return getDirectionDiff(direction);
}
