export type Player = {
  readonly id: string;
  name: string;
};

type CreateProps = {
  name: string;
};

export function createPlayer(props: CreateProps = { name: "NONAME" }): Player {
  return {
    ...props,
    id: crypto.randomUUID(),
  };
}
