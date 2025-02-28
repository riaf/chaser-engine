# CHaser Engine

[![deno module](https://shield.deno.dev/x/chaser_engine)](https://deno.land/x/chaser_engine)
[![test workflow](https://github.com/riaf/chaser-engine/actions/workflows/test.yml/badge.svg)](https://github.com/riaf/chaser-engine/actions/workflows/test.yml?query=branch%3Amain)
[![codecov](https://codecov.io/gh/riaf/chaser-engine/branch/main/graph/badge.svg?token=KTAVHOCMHE)](https://codecov.io/gh/riaf/chaser-engine)

A Deno library for easily building CHaser servers used in the U-16 programming contest. It adopts immutable state management and has an extensible design.

## Features

- Pure function state management
- Immutable data structures
- Type-safe design (TypeScript)
- Modularized action processing

## Installation

To add to your Deno project, include the following in your dependencies:

```ts
// deps.ts
export * from "https://deno.land/x/chaser_engine@VERSION/mod.ts";
```

Replace `VERSION` with your desired version number.

## Basic Usage

### 1. Game Initialization

```ts
import {
  createBlockCell,
  createFloorCell,
  createGame,
  createItemCell,
  createMap,
  createPlayer,
} from "./deps.ts";

// マップの作成
const cells = [
  [
    createBlockCell(),
    createBlockCell(),
    createBlockCell(),
    createBlockCell(),
    createBlockCell(),
  ],
  [
    createBlockCell(),
    createFloorCell(),
    createFloorCell(),
    createItemCell(),
    createBlockCell(),
  ],
  [
    createBlockCell(),
    createFloorCell(),
    createBlockCell(),
    createFloorCell(),
    createBlockCell(),
  ],
  [
    createBlockCell(),
    createItemCell(),
    createFloorCell(),
    createFloorCell(),
    createBlockCell(),
  ],
  [
    createBlockCell(),
    createBlockCell(),
    createBlockCell(),
    createBlockCell(),
    createBlockCell(),
  ],
];
const map = createMap({ name: "sample-map", cells });

// プレイヤーの作成
const player1 = createPlayer({ name: "Player 1" });
const player2 = createPlayer({ name: "Player 2" });

// プレイヤーの初期位置
const playerPositions = {
  [player1.id]: { x: 1, y: 1 },
  [player2.id]: { x: 3, y: 3 },
};

// ゲームの作成
const game = createGame({
  map,
  players: [player1, player2],
  playerPositions,
});
```

### 2. Executing Actions

```ts
import { Commands, createAction } from "./deps.ts";

// Player 1 moves toward the item
const action1 = createAction({
  actor: player1,
  command: Commands.WalkRight,
});

// Execute the action
const nextGameState = game.dispatch(action1);

// Check current state
console.log(nextGameState.currentState.score); // Check scores
console.log(nextGameState.currentState.playerPositions); // Check player positions
```

### 3. Server Implementation Example

There is a server implementation example in `examples/legacy_server.ts` that supports the traditional CHaser protocol. You can use this as a reference to build your own server.

```ts
// Simple server implementation example
import { createBlockCell, createFloorCell, createItemCell, createMap, createPlayer, Game } from "../mod.ts";
import { LegacyServer } from "./legacy_server.ts";

// Create a sample map
const map = createSampleMap();

// Create players
const player1 = createPlayer({ name: "Player1" });
const player2 = createPlayer({ name: "Player2" });

// Set initial positions
const playerPositions = {
  [player1.id]: { x: 1, y: 1 },
  [player2.id]: { x: 8, y: 8 },
};

// Create game
const game = new Game({
  map,
  players: [player1, player2],
  playerPositions,
  maxTurn: 1000,
});

// Create and start the server
const server = new LegacyServer({
  game,
  coolPort: 2009,
  hotPort: 2010,
});

await server.listen();
```

For more detailed examples, check the `examples` directory.

## Available Actions

The following actions are available in CHaser:

- `walk` - Move in the specified direction
- `look` - Look in the specified direction
- `search` - Search in the specified direction
- `put` - Place a block in the specified direction

Each action has directions (up, down, left, right), specified like `Commands.WalkUp`.

## Advanced Usage

### Creating Custom Action Processors

To add your own action processing, implement a new processor and register it with the processorSelector:

```ts
// Custom command definition
const CustomCommands = {
  TeleportUp: "tu",
  TeleportRight: "tr",
  TeleportDown: "td",
  TeleportLeft: "tl",
} as const;

// Implement your processor
function teleportProcessor(state: State, action: Action): State {
  // Custom processing logic here
  // ...
  return nextState(state, { /* updated state properties */ });
}

// Register in processor_selector.ts:
// 1. Add to command processors
const commandProcessors: Record<Command | CustomCommand, Processor> = {
  // existing processors
  [CustomCommands.TeleportUp]: teleportProcessor,
  [CustomCommands.TeleportRight]: teleportProcessor,
  [CustomCommands.TeleportDown]: teleportProcessor,
  [CustomCommands.TeleportLeft]: teleportProcessor,
};

// 2. Add to action type detection
export function actionType(action: Action): ActionType | "teleport" {
  if (isCustomCommand(action.command)) {
    return "teleport";
  }
  // existing logic
}

// 3. Register in processors by type
const processorsByType: Record<string, Processor> = {
  "walk": walkProcessor,
  "look": lookProcessor,
  "search": searchProcessor,
  "put": putProcessor,
  "teleport": teleportProcessor,
};
```

For a complete example, see `examples/custom_processor.ts`.

### Monitoring Events

Game state changes can be monitored in two ways:

1. When using the Game class directly:

```ts
// Subscribe to the game's state iterator
for await (const players of game) {
  console.log("New turn started with active players:", players);
  console.log("Current state:", game.currentState);
}
```

2. When using the LegacyServer:

```ts
// Subscribe to server state events
server.stateEvent.on((state) => {
  console.log("Game state updated:", state);
  
  // Check scores
  for (const player of state.players) {
    console.log(`${player.name}: ${state.score[player.id]} points`);
  }
  
  // Check if game is finished
  if (state.isFinish) {
    console.log("Game finished!");
  }
});
```

See `examples/server_example.ts` for a complete implementation.

## How to Contribute

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## License

This project is released under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
