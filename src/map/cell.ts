export const CellTypes = {
  Floor: "floor",
  Player: "player",
  Block: "block",
  Item: "item",
} as const;

export const LegacyCellCodes = {
  Floor: "0",
  Player: "1",
  Block: "2",
  Item: "3",
} as const;

export type FloorCell = {
  readonly legacyCode: "0";
  readonly type: typeof CellTypes.Floor;
};

export type BlockCell = {
  readonly legacyCode: "2";
  readonly type: typeof CellTypes.Block;
};

export type ItemCell = {
  readonly legacyCode: "3";
  readonly type: typeof CellTypes.Item;
};

export type MapCell = FloorCell | BlockCell | ItemCell;

export function createFloorCell(): FloorCell {
  return {
    legacyCode: LegacyCellCodes.Floor,
    type: CellTypes.Floor,
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
