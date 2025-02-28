/**
 * レガシーサーバーを使ったCHaserサーバーの実装例
 */
import {
  createBlockCell,
  createFloorCell,
  createItemCell,
  createMap,
  createPlayer,
  Game,
} from "../mod.ts";
import { LegacyServer } from "./legacy_server.ts";

/**
 * サンプルマップを作成する
 */
function createSampleMap() {
  // セルの種類を定義
  const B = createBlockCell();
  const F = createFloorCell();
  const I = createItemCell();

  // 10x10のマップを作成
  const cells = [
    [B, B, B, B, B, B, B, B, B, B],
    [B, F, F, F, I, I, F, F, F, B],
    [B, F, B, B, F, F, B, B, F, B],
    [B, F, B, I, F, F, I, B, F, B],
    [B, I, F, F, F, F, F, F, I, B],
    [B, I, F, F, F, F, F, F, I, B],
    [B, F, B, I, F, F, I, B, F, B],
    [B, F, B, B, F, F, B, B, F, B],
    [B, F, F, F, I, I, F, F, F, B],
    [B, B, B, B, B, B, B, B, B, B],
  ];

  return createMap({
    name: "chaser-arena",
    cells,
  });
}

import { Player, State } from "../mod.ts";

/**
 * ゲーム状態変更時のハンドラー
 */
function handleStateChange(state: State) {
  console.log("\n===== ゲーム状態が更新されました =====");

  // スコアを表示
  console.log("スコア状況:");
  for (const player of state.players) {
    const status = state.deadPlayers.has(player) ? "死亡" : "生存";
    console.log(
      `${player.name}: ${state.score[player.id]} ポイント (${status})`,
    );
  }

  // ゲーム終了判定
  if (state.isFinish) {
    console.log("\n===== ゲーム終了 =====");

    // 勝者の判定
    const survivors = state.players.filter(
      (player: Player) => !state.deadPlayers.has(player),
    );

    if (survivors.length === 0) {
      console.log("引き分け - 全プレイヤー死亡");
    } else if (survivors.length === 1) {
      const winner = survivors[0];
      console.log(`勝者: ${winner.name} (スコア: ${state.score[winner.id]})`);
    } else {
      // スコアで勝者を決定
      const scores = survivors.map(
        (player: Player) => ({ player, score: state.score[player.id] }),
      );
      scores.sort((a, b) => b.score - a.score);

      if (scores[0].score > scores[1].score) {
        console.log(
          `勝者: ${scores[0].player.name} (スコア: ${scores[0].score})`,
        );
      } else {
        console.log("引き分け - 同点");
      }
    }
  }
}

/**
 * メイン関数：CHaserサーバーの起動
 */
async function main() {
  // コマンドライン引数からポートを取得
  const args = parseArgs();
  const coolPort = args.coolPort || 2009;
  const hotPort = args.hotPort || 2010;

  // プレイヤーの作成（名前は接続時に設定される）
  const player1 = createPlayer({ name: "Cool" });
  const player2 = createPlayer({ name: "Hot" });

  // マップの作成
  const map = createSampleMap();

  // プレイヤーの初期位置を設定
  const playerPositions = {
    [player1.id]: { x: 1, y: 1 }, // 左上
    [player2.id]: { x: 8, y: 8 }, // 右下
  };

  // ゲームを作成
  const game = new Game({
    map,
    players: [player1, player2],
    playerPositions,
    maxTurn: 1000, // サーバーでは長めのターン数を設定
  });

  // サーバーの設定と起動
  const server = new LegacyServer({
    game,
    coolPort,
    hotPort,
  });

  // ゲーム状態変更イベントの購読
  server.stateEvent.on(handleStateChange);

  // サーバー起動の案内メッセージ
  console.log(`CHaser Server を起動しています...`);
  console.log(
    `Cool プレイヤー(${player1.name})は port ${coolPort} で接続してください`,
  );
  console.log(
    `Hot プレイヤー(${player2.name})は port ${hotPort} で接続してください`,
  );
  console.log("両方のプレイヤーが接続するとゲームが開始します\n");

  // サーバーの起動
  try {
    await server.listen();
    console.log("サーバーを終了しました");
  } catch (error) {
    console.error("サーバーエラー:", error);
  }
}

/**
 * コマンドライン引数をパースする
 */
function parseArgs() {
  const args = Deno.args;
  const result: Record<string, number> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--cool-port" && i + 1 < args.length) {
      result.coolPort = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--hot-port" && i + 1 < args.length) {
      result.hotPort = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return result;
}

// メイン関数を実行
if (import.meta.main) {
  main().catch(console.error);
}
