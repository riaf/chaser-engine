/**
 * シンプルなCHaserゲームの作成と実行例
 */
import {
  Commands,
  createAction,
  createBlockCell,
  createFloorCell,
  // createInitialScore is unused but kept for reference
  createInitialScore as _createInitialScore,
  createItemCell,
  createMap,
  createPlayer,
  Game,
} from "../mod.ts";

/**
 * サンプルマップを作成する
 * B: ブロック, F: 床, I: アイテム
 *
 * BBBBB
 * BFIIB
 * BFBFB
 * BIFFB
 * BBBBB
 */
function createSampleMap() {
  // セルの種類を定義
  const B = createBlockCell();
  const F = createFloorCell();
  const I = createItemCell();

  // マップを定義
  const cells = [
    [B, B, B, B, B],
    [B, F, I, I, B],
    [B, F, B, F, B],
    [B, I, F, F, B],
    [B, B, B, B, B],
  ];

  return createMap({
    name: "simple-map",
    cells,
  });
}

/**
 * ゲーム進行状態を表示する関数
 */
function displayGameState(game: Game) {
  const { currentState } = game;
  const { map, playerPositions, score, deadPlayers } = currentState;

  console.log("\n===== 現在のゲーム状態 =====");

  // マップを表示
  console.log("\nマップ:");
  for (let y = 0; y < map.cells.length; y++) {
    let row = "";
    for (let x = 0; x < map.cells[y].length; x++) {
      // プレイヤーの位置を確認
      let hasPlayer = false;
      let playerChar = " ";

      for (const player of currentState.players) {
        const pos = playerPositions[player.id];
        if (pos.x === x && pos.y === y) {
          hasPlayer = true;
          playerChar = deadPlayers.has(player) ? "X" : player.name.charAt(0);
        }
      }

      if (hasPlayer) {
        row += `[${playerChar}]`;
      } else {
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

  // スコア表示
  console.log("\nスコア:");
  for (const player of currentState.players) {
    const status = deadPlayers.has(player) ? "死亡" : "生存";
    console.log(`${player.name}: ${score[player.id]} ポイント (${status})`);
  }

  // 次のプレイヤー
  const nextPlayerName = currentState.waitFor?.name || "なし（ゲーム終了）";
  console.log(`\n次のプレイヤー: ${nextPlayerName}`);
  console.log("=============================\n");
}

/**
 * メイン関数：サンプルゲームの実行
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
    [player2.id]: { x: 3, y: 3 }, // 右下
  };

  // ゲームを作成
  const game = new Game({
    map,
    players: [player1, player2],
    playerPositions,
    maxTurn: 100, // 最大ターン数を指定
  });

  // 初期状態を表示
  console.log("=== ゲーム開始 ===");
  displayGameState(game);

  // プレイヤー1: 右へ移動してアイテム獲得
  console.log("Player1: 右へ移動");
  const action1 = createAction({
    actor: player1,
    command: Commands.WalkRight,
  });
  game.applyAction(action1);
  displayGameState(game);

  // プレイヤー2: 左へ移動してアイテム獲得
  console.log("Player2: 左へ移動");
  const action2 = createAction({
    actor: player2,
    command: Commands.WalkLeft,
  });
  game.applyAction(action2);
  displayGameState(game);

  // プレイヤー1: さらに右へ移動してアイテム獲得
  console.log("Player1: さらに右へ移動");
  const action3 = createAction({
    actor: player1,
    command: Commands.WalkRight,
  });
  game.applyAction(action3);
  displayGameState(game);

  // プレイヤー2: 上へ移動してみる（壁にぶつかるため死亡）
  console.log("Player2: 上へ移動（ブロックへ移動するため死亡）");
  const action4 = createAction({
    actor: player2,
    command: Commands.WalkUp,
  });
  game.applyAction(action4);
  displayGameState(game);

  console.log("=== ゲーム終了 ===");

  // 勝者を表示
  const { currentState } = game;
  const winner = currentState.players.find(
    (player) => !currentState.deadPlayers.has(player),
  );

  if (winner) {
    console.log(
      `勝者: ${winner.name} (スコア: ${currentState.score[winner.id]})`,
    );
  } else {
    console.log("引き分け");
  }
}

// メイン関数を実行
if (import.meta.main) {
  main();
}
