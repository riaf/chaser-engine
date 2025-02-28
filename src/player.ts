/**
 * プレイヤーを表すインターフェース
 * 識別子は読み取り専用だが、名前は変更可能
 */
export type Player = {
  readonly id: string;
  name: string;
};

type CreateProps = {
  name: string;
};

/**
 * 新しいプレイヤーを作成する
 * デフォルト名は "NONAME"
 */
export function createPlayer(
  { name = "NONAME" }: CreateProps = { name: "NONAME" },
): Player {
  return {
    id: crypto.randomUUID(),
    name,
  };
}
