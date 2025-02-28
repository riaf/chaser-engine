/**
 * カスタムアクションプロセッサーの実装例
 *
 * このサンプルでは、以下のカスタム機能を実装します：
 * 1. テレポートアクション - プレイヤーが指定方向の2マス先にテレポート
 * 2. カスタムコマンドの追加とプロセッサーの登録
 */
import {
  Action,
  Command,
  Commands,
  createAction,
  createBlockCell,
  createFloorCell,
  createItemCell,
  createMap,
  createPlayer,
  Game,
  nextPlayer,
  State,
} from "../mod.ts";
// Imported but unused in this example
import { getCommandDirection as _getCommandDirection } from "../src/action/differential.ts";
import { nextState } from "../src/action/post_processor.ts";

/**
 * カスタムコマンドの定義
 */
const CustomCommands = {
  // テレポートコマンド（一連のアクションで必要な方向情報）
  TeleportUp: "tu",
  TeleportRight: "tr",
  TeleportDown: "td",
  TeleportLeft: "tl",
} as const;

type CustomCommand = typeof CustomCommands[keyof typeof CustomCommands];

// 既存のコマンド型に拡張したカスタムコマンド型
type ExtendedCommand = Command | CustomCommand;

/**
 * テレポートアクションのプロセッサー
 * プレイヤーが指定された方向に2マス移動する
 * 
 * Note: This function is unused in the current example as it's for demonstration only
 */
function _teleportProcessor(state: State, action: Action): State {
  const { playerPositions, map } = state;
  const actorId = action.actor.id;
  const currentPos = playerPositions[actorId];

  // コマンドから方向を取得
  const command = action.command as ExtendedCommand;
  const directionChar = command.charAt(1);

  // 移動差分を計算
  let dx = 0;
  let dy = 0;

  switch (directionChar) {
    case "u":
      dy = -2;
      break; // 上に2マス
    case "r":
      dx = 2;
      break; // 右に2マス
    case "d":
      dy = 2;
      break; // 下に2マス
    case "l":
      dx = -2;
      break; // 左に2マス
  }

  // 新しい位置を計算
  const nextPosition = {
    x: currentPos.x + dx,
    y: currentPos.y + dy,
  };

  // マップの境界チェック
  if (
    nextPosition.x < 0 ||
    nextPosition.y < 0 ||
    nextPosition.y >= map.cells.length ||
    nextPosition.x >= map.cells[0].length
  ) {
    console.log("テレポート失敗: マップ外です");
    return nextState(state, { waitFor: nextPlayer(state, action) });
  }

  // 目的地のセルを確認
  const targetCell = map.cells[nextPosition.y][nextPosition.x];

  // ブロックセルの場合はテレポート失敗
  if (targetCell.type === "block") {
    console.log("テレポート失敗: 目的地がブロックです");
    return nextState(state, { waitFor: nextPlayer(state, action) });
  }

  // 新しいプレイヤー位置
  const newPositions = {
    ...playerPositions,
    [actorId]: nextPosition,
  };

  // 次のプレイヤーターンに移行
  return nextState(state, {
    playerPositions: newPositions,
    waitFor: nextPlayer(state, action),
  });
}

/**
 * カスタムコマンドを検証する関数
 * 
 * Note: This function is unused in the current example as it's for demonstration only
 */
function _isCustomCommand(command: string): boolean {
  return command === CustomCommands.TeleportUp ||
    command === CustomCommands.TeleportRight ||
    command === CustomCommands.TeleportDown ||
    command === CustomCommands.TeleportLeft;
}

/**
 * サンプルマップを作成する
 */
function createSampleMap() {
  // セルの種類を定義
  const B = createBlockCell();
  const F = createFloorCell();
  const I = createItemCell();

  // マップを定義
  const cells = [
    [B, B, B, B, B, B, B, B, B],
    [B, F, F, F, F, F, F, F, B],
    [B, F, B, B, F, B, B, F, B],
    [B, F, B, I, F, I, B, F, B],
    [B, F, F, F, F, F, F, F, B],
    [B, F, B, I, F, I, B, F, B],
    [B, F, B, B, F, B, B, F, B],
    [B, F, F, F, F, F, F, F, B],
    [B, B, B, B, B, B, B, B, B],
  ];

  return createMap({
    name: "teleport-sample",
    cells,
  });
}

/**
 * ゲーム状態を表示する関数
 */
function displayGameState(game: Game) {
  const { currentState } = game;
  const { map, playerPositions, score } = currentState;

  console.log("\n==== 現在のゲーム状態 ====");

  // マップを表示
  console.log("\nマップ:");
  for (let y = 0; y < map.cells.length; y++) {
    let row = "";
    for (let x = 0; x < map.cells[y].length; x++) {
      // プレイヤーの位置を確認
      let hasPlayer = false;

      for (const player of currentState.players) {
        const pos = playerPositions[player.id];
        if (pos.x === x && pos.y === y) {
          hasPlayer = true;
          row += `[${player.name.charAt(0)}]`;
          break;
        }
      }

      if (!hasPlayer) {
        const cell = map.cells[y][x];
        switch (cell.type) {
          case "block":
            row += "[B]";
            break;
          case "floor":
            row += "[ ]";
            break;
          case "item":
            row += "[I]";
            break;
          default:
            row += "[?]";
        }
      }
    }
    console.log(row);
  }

  // プレイヤー情報を表示
  console.log("\nプレイヤー情報:");
  for (const player of currentState.players) {
    const pos = playerPositions[player.id];
    console.log(
      `${player.name}: 座標(${pos.x}, ${pos.y}), スコア: ${score[player.id]}`,
    );
  }

  console.log("=========================\n");
}

/**
 * メイン関数：カスタムプロセッサーのサンプル実行
 */
function main() {
  // プレイヤーの作成
  const player1 = createPlayer({ name: "Player1" });
  const player2 = createPlayer({ name: "Player2" });

  // マップの作成
  const map = createSampleMap();

  // プレイヤーの初期位置を設定
  const playerPositions = {
    [player1.id]: { x: 1, y: 1 }, // 左上
    [player2.id]: { x: 7, y: 7 }, // 右下
  };

  // ゲームを作成
  const game = new Game({
    map,
    players: [player1, player2],
    playerPositions,
    maxTurn: 100,
  });

  // 注意: この例は動作しません
  // 実際には、processor_selector.ts など処理選択モジュールを直接修正する必要があります
  // このサンプルコードは概念的な実装を示すのみです
  console.log(
    "[注意] 実際のアプリでは、src/action/processor_selector.ts を直接修正して",
  );
  console.log(
    "カスタムプロセッサを登録する必要があります。このサンプルは完全には動作しません。",
  );

  // 実際の実装では以下のようにprocessor_selector.tsを修正します:
  /*
  // processor_selector.ts

  // コマンドプロセッサーに登録
  const commandProcessors: Record<Command | CustomCommand, Processor> = {
    ...既存のプロセッサー,
    [CustomCommands.TeleportUp]: teleportProcessor,
    [CustomCommands.TeleportRight]: teleportProcessor,
    [CustomCommands.TeleportDown]: teleportProcessor,
    [CustomCommands.TeleportLeft]: teleportProcessor,
  };

  // actionType関数を拡張
  export function actionType(action: Action): ActionType | "teleport" {
    if (isCustomCommand(action.command)) {
      return "teleport";
    }
    // 既存の処理
  }

  // processorsByTypeに登録
  const processorsByType: Record<string, Processor> = {
    "walk": walkProcessor,
    "look": lookProcessor,
    "search": searchProcessor,
    "put": putProcessor,
    "teleport": teleportProcessor,
  };
  */

  // 初期状態を表示
  console.log("=== ゲーム開始 ===");
  displayGameState(game);

  // プレイヤー1: 通常移動
  console.log("Player1: 右へ移動");
  const action1 = createAction({
    actor: player1,
    command: Commands.WalkRight,
  });
  game.applyAction(action1);
  displayGameState(game);

  // プレイヤー2: 通常移動
  console.log("Player2: 左へ移動");
  const action2 = createAction({
    actor: player2,
    command: Commands.WalkLeft,
  });
  game.applyAction(action2);
  displayGameState(game);

  // プレイヤー1: テレポートのデモ
  // 注: 以下のコードはカスタムプロセッサーが登録されていないため実行時にエラーになります
  // 実際に使用するためには src/action/processor_selector.ts を修正する必要があります
  console.log("Player1: テレポート機能のデモ (このサンプルでは実際には動作しません)");
  console.log("テレポート機能を実装するには、プロジェクトのソースコードを修正する必要があります");
  
  /* 
  // 以下のコードは実装例として表示のみです
  const action3 = createAction({
    actor: player1,
    command: CustomCommands.TeleportRight as Command,
  });
  game.applyAction(action3);
  */

  // 代わりに通常の移動を使用
  console.log("代わりに通常の移動を使用: Player1 右に移動");
  const action3 = createAction({
    actor: player1,
    command: Commands.WalkRight,
  });
  game.applyAction(action3);
  displayGameState(game);

  // プレイヤー2も同様
  console.log("Player2: 上に移動");
  const action4 = createAction({
    actor: player2,
    command: Commands.WalkUp,
  });
  game.applyAction(action4);
  displayGameState(game);

  console.log("=== サンプル終了 ===");
}

// メイン関数を実行
if (import.meta.main) {
  main();
}
