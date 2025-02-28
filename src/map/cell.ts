export const CellTypes = {
  Floor: "floor",
  Player: "player",
  Block: "block",
  Item: "item",
} as const;

export type CellType = typeof CellTypes[keyof typeof CellTypes];

export const LegacyCellCodes = {
  Floor: "0",
  Player: "1",
  Block: "2",
  Item: "3",
} as const;

export type LegacyCellCode =
  typeof LegacyCellCodes[keyof typeof LegacyCellCodes];

export type FloorCell = {
  readonly legacyCode: "0";
  readonly type: typeof CellTypes.Floor;
};

export type PlayerCell = {
  readonly legacyCode: "1";
  readonly type: typeof CellTypes.Player;
  readonly playerId: string;
};

export type BlockCell = {
  readonly legacyCode: "2";
  readonly type: typeof CellTypes.Block;
};

export type ItemCell = {
  readonly legacyCode: "3";
  readonly type: typeof CellTypes.Item;
};

export type MapCell = FloorCell | BlockCell | ItemCell | PlayerCell;

export function createFloorCell(): FloorCell {
  return {
    legacyCode: LegacyCellCodes.Floor,
    type: CellTypes.Floor,
  } as const;
}

export function createPlayerCell(playerId: string): PlayerCell {
  return {
    legacyCode: LegacyCellCodes.Player,
    type: CellTypes.Player,
    playerId,
  } as const;
}

export function createBlockCell(): BlockCell {
  return {
    legacyCode: LegacyCellCodes.Block,
    type: CellTypes.Block,
  } as const;
}

export function createItemCell(): ItemCell {
  return {
    legacyCode: LegacyCellCodes.Item,
    type: CellTypes.Item,
  } as const;
}
