import { eventmit } from "eventmit";
import { Command, createAction, Game, State } from "../mod.ts";

/**
 * クールプレイヤー（1番目のプレイヤー）に関するエラー
 */
class CoolPlayerError extends Error {
  constructor(message: string | Error) {
    super(message instanceof Error ? message.message : message);
    this.name = "CoolPlayerError";
  }
}

/**
 * ホットプレイヤー（2番目のプレイヤー）に関するエラー
 */
class HotPlayerError extends Error {
  constructor(message: string | Error) {
    super(message instanceof Error ? message.message : message);
    this.name = "HotPlayerError";
  }
}

/**
 * レガシーサーバー設定のプロパティ
 */
type LegacyServerProps = {
  coolPort?: number; // クールプレイヤー用ポート
  hotPort?: number; // ホットプレイヤー用ポート
  game: Game; // ゲームインスタンス
};

/**
 * ゲーム通信の状態
 */
enum GameState {
  WAITING_FOR_READY = "waiting_for_ready",
  SENDING_HINT = "sending_hint",
  WAITING_FOR_COMMAND = "waiting_for_command",
  SENDING_RESULT = "sending_result",
  WAITING_FOR_TURN_END = "waiting_for_turn_end",
  FINISHED = "finished",
}

/**
 * 従来のCHaserプロトコルに対応したTCPサーバー
 */
export class LegacyServer {
  /** 状態変更イベント */
  readonly stateEvent = eventmit<State>();

  // プライベートプロパティ
  #game: Game;
  #coolPort: number;
  #hotPort: number;
  #connections: Deno.Conn[] = [];
  #gameState: GameState = GameState.WAITING_FOR_READY;

  /**
   * レガシーサーバーのインスタンスを作成
   */
  constructor({ game, coolPort = 2009, hotPort = 2010 }: LegacyServerProps) {
    this.#validateGame(game);
    this.#game = game;
    this.#coolPort = coolPort;
    this.#hotPort = hotPort;
  }

  /**
   * サーバーの待ち受けを開始し、ゲームを実行
   */
  async listen(): Promise<void> {
    try {
      // TCPサーバーをセットアップして接続を受け付ける
      const servers = [
        Deno.listen({ port: this.#coolPort }),
        Deno.listen({ port: this.#hotPort }),
      ];

      console.log(
        `Listening on port ${this.#coolPort} (cool) and ${this.#hotPort} (hot)`,
      );

      // クライアント接続を待機
      this.#connections = await Promise.all(
        servers.map((server) => server.accept()),
      );

      // プレイヤー名を設定
      await this.#setupPlayerNames();

      // ゲームのメインループ
      await this.#runGameLoop();
    } catch (error) {
      console.error("Server error:", error);
      await this.#handleGameError(error);
    } finally {
      await this.end();
    }
  }

  /**
   * サーバー接続を終了
   */
  end(): Promise<void> {
    // すべてのTCP接続を閉じる
    for (const conn of this.#connections) {
      try {
        conn.close();
      } catch (error) {
        console.error("Connection close error:", error);
      }
    }

    this.#connections = [];
    this.#gameState = GameState.FINISHED;
  }

  /**
   * ゲームのメインループを実行
   */
  async #runGameLoop(): Promise<void> {
    gameLoop: for await (const players of this.#game) {
      // 各プレイヤーのターンを処理
      for await (const [index, player] of players.entries()) {
        try {
          // ターンの開始を通知
          await this.#send(this.#connections[index], "@");

          // クライアントの準備確認
          this.#gameState = GameState.WAITING_FOR_READY;
          const ready = await this.#receive(this.#connections[index]);
          if (ready !== "gr") {
            console.warn(`Player ${player.name} not ready, response: ${ready}`);
            this.#game.elminatePlayer(player);
            this.stateEvent.emit(this.#game.currentState);
            break gameLoop;
          }

          // ヒントデータを送信
          this.#gameState = GameState.SENDING_HINT;
          const preActionHint = this.#game.preActionHint(player);
          const hintData = [
            "1", // 生存フラグ
            ...preActionHint.flat().map((cell) => cell.legacyCode),
          ].join("");
          await this.#send(this.#connections[index], hintData);

          // コマンド受信
          this.#gameState = GameState.WAITING_FOR_COMMAND;
          const command = await this.#receive(this.#connections[index]);

          // コマンド形式のバリデーション
          if (!this.#isValidCommand(command)) {
            console.warn(`Invalid command from ${player.name}: ${command}`);
            this.#game.elminatePlayer(player);
            this.stateEvent.emit(this.#game.currentState);
            break gameLoop;
          }

          // アクションの実行
          const action = createAction({
            actor: player,
            command: command as Command,
          });
          const postActionHint = this.#game.applyAction(action);

          // アクション結果の送信
          this.#gameState = GameState.SENDING_RESULT;
          const aliveFlag = this.#game.currentState.deadPlayers.has(player)
            ? "0"
            : "1";
          const resultData = [
            aliveFlag,
            ...postActionHint.flat().map((cell) => cell.legacyCode),
          ].join("");
          await this.#send(this.#connections[index], resultData);

          // ターン終了確認
          this.#gameState = GameState.WAITING_FOR_TURN_END;
          const turnEnd = await this.#receive(this.#connections[index]);
          if (turnEnd !== "#") {
            console.warn(`Invalid turn end from ${player.name}: ${turnEnd}`);
            this.#game.elminatePlayer(player);
            this.stateEvent.emit(this.#game.currentState);
            break gameLoop;
          }

          // 状態変更イベントを発行
          this.stateEvent.emit(this.#game.currentState);
        } catch (error) {
          // プレイヤーごとのエラーハンドリング
          const playerError = index === 0
            ? new CoolPlayerError(error)
            : new HotPlayerError(error);
          throw playerError;
        }
      }
    }
  }

  /**
   * プレイヤー名を設定
   */
  async #setupPlayerNames(): Promise<void> {
    try {
      // クールプレイヤー名を受信
      const coolPlayerName = await this.#receive(this.#connections[0]);
      this.#game.currentState.players[0].name = coolPlayerName;
      console.log(`Cool player connected: ${coolPlayerName}`);
    } catch (error) {
      throw new CoolPlayerError(error);
    }

    try {
      // ホットプレイヤー名を受信
      const hotPlayerName = await this.#receive(this.#connections[1]);
      this.#game.currentState.players[1].name = hotPlayerName;
      console.log(`Hot player connected: ${hotPlayerName}`);
    } catch (error) {
      throw new HotPlayerError(error);
    }
  }

  /**
   * ゲームエラーの処理
   */
  #handleGameError(error: unknown): Promise<void> {
    if (error instanceof CoolPlayerError) {
      console.error("Cool player error:", error.message);
      this.#game.elminatePlayer(this.#game.currentState.players[0]);
    } else if (error instanceof HotPlayerError) {
      console.error("Hot player error:", error.message);
      this.#game.elminatePlayer(this.#game.currentState.players[1]);
    } else {
      console.error("Unexpected error:", error);
      throw error;
    }
  }

  /**
   * ゲーム設定の検証
   */
  #validateGame(game: Game): void {
    if (game.currentState.players.length !== 2) {
      throw new Error("Legacy server only supports exactly 2 players");
    }
  }

  /**
   * コマンドの形式を検証
   */
  #isValidCommand(command: string): boolean {
    return /^[wpls][udrl]$/.test(command);
  }

  /**
   * クライアントへデータを送信
   */
  async #send(
    conn: Deno.Conn,
    data: string,
    withNewline = true,
  ): Promise<void> {
    const encoder = new TextEncoder();
    const newline = withNewline ? "\n" : "";
    await conn.write(encoder.encode(data + newline));
  }

  /**
   * クライアントからデータを受信
   */
  async #receive(conn: Deno.Conn): Promise<string> {
    const buffer = new Uint8Array(1024);
    const bytesRead = await conn.read(buffer);

    if (bytesRead === null) {
      throw new Error("Connection closed unexpectedly");
    }

    return new TextDecoder().decode(buffer.subarray(0, bytesRead)).trimEnd();
  }
}
