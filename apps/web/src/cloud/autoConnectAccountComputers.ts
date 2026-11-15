import * as Schema from "effect/Schema";

export const AUTO_CONNECT_STORAGE_KEY = "t3code:t3-connect-auto-connected:v1";

/** The computers already offered to the signed-in account, so removing one keeps it removed. */
export const AutoConnectState = Schema.Struct({
  accountId: Schema.NullOr(Schema.String),
  seen: Schema.Array(Schema.String),
});
export type AutoConnectState = typeof AutoConnectState.Type;

export const EMPTY_AUTO_CONNECT_STATE: AutoConnectState = { accountId: null, seen: [] };

export interface DiscoveredComputer {
  readonly id: string;
  readonly checking: boolean;
  readonly compatible: boolean;
}

export function planAutoConnect(input: {
  readonly state: AutoConnectState;
  readonly accountId: string;
  readonly discovered: ReadonlyArray<DiscoveredComputer>;
  /** This computer and everything already saved, over any route. */
  readonly skipIds: ReadonlySet<string>;
}): { readonly state: AutoConnectState; readonly connectIds: ReadonlyArray<string> } {
  const seen = new Set(input.state.accountId === input.accountId ? input.state.seen : []);
  const connectIds: string[] = [];
  for (const computer of input.discovered) {
    if (computer.checking || seen.has(computer.id)) continue;
    seen.add(computer.id);
    if (computer.compatible && !input.skipIds.has(computer.id)) connectIds.push(computer.id);
  }
  const changed =
    input.state.accountId !== input.accountId || seen.size !== input.state.seen.length;
  return {
    state: changed ? { accountId: input.accountId, seen: [...seen] } : input.state,
    connectIds,
  };
}
