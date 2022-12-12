import { createMap } from "../map.ts";
import {
  createBlockCell,
  createFloorCell,
  createItemCell,
  LegacyCellCodes,
  MapCell,
} from "../map/cell.ts";
import { createPlayer } from "../player.ts";

export function parseLegacyMap(mapData: string) {
  let name = "Legacy Map";
  let maxTurn = 100;
  let [hotX, hotY, coolX, coolY] = [0, 1, 1, 0];
  const cells: MapCell[][] = [];

  const cool = createPlayer({ name: "Cool" });
  const hot = createPlayer({ name: "Hot" });

  mapData.split("\n").forEach((row) => {
    const [type, data] = row.split(":");

    switch (type) {
      case "N":
        name = data;
        break;

      case "D":
        cells.push(
          data.split("").map((cell) => {
            switch (cell) {
              case LegacyCellCodes.Floor:
              case LegacyCellCodes.Player:
                return createFloorCell();
              case LegacyCellCodes.Block:
                return createBlockCell();
              case LegacyCellCodes.Item:
                return createItemCell();
              default:
                return null;
            }
          }).filter((cell) => cell !== null) as MapCell[],
        );
        break;

      case "T":
        maxTurn = Number(data);
        break;

      case "C":
        [coolX, coolY] = data.split(",").map((n) => Number(n));
        break;

      case "H":
        [hotX, hotY] = data.split(",").map((n) => Number(n));
        break;

      default:
        // pass
    }
  });

  return {
    map: createMap({ name, cells }),
    maxTurn,
    cool,
    hot,
    playerPositions: {
      [cool.id]: {
        y: coolY,
        x: coolX,
      },
      [hot.id]: {
        y: hotY,
        x: hotX,
      },
    },
  };
}
