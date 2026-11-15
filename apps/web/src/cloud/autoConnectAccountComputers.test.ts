import { describe, expect, it } from "vite-plus/test";

import { EMPTY_AUTO_CONNECT_STATE, planAutoConnect } from "./autoConnectAccountComputers";

const computer = (id: string, overrides: { checking?: boolean; compatible?: boolean } = {}) => ({
  id,
  checking: false,
  compatible: true,
  ...overrides,
});

describe("planAutoConnect", () => {
  it.each([
    {
      name: "connects every new computer on a fresh account",
      state: EMPTY_AUTO_CONNECT_STATE,
      discovered: [computer("mac-a"), computer("mac-b")],
      skip: [],
      connect: ["mac-a", "mac-b"],
      seen: ["mac-a", "mac-b"],
    },
    {
      name: "keeps a computer removed after it was added once",
      state: { accountId: "user-1", seen: ["mac-a"] },
      discovered: [computer("mac-a")],
      skip: [],
      connect: [],
      seen: ["mac-a"],
    },
    {
      name: "connects again after switching to another account",
      state: { accountId: "user-2", seen: ["mac-a"] },
      discovered: [computer("mac-a")],
      skip: [],
      connect: ["mac-a"],
      seen: ["mac-a"],
    },
    {
      name: "skips this computer and ones already saved",
      state: EMPTY_AUTO_CONNECT_STATE,
      discovered: [computer("this-mac"), computer("saved"), computer("mac-b")],
      skip: ["this-mac", "saved"],
      connect: ["mac-b"],
      seen: ["this-mac", "saved", "mac-b"],
    },
    {
      name: "waits for health checks and never connects an incompatible computer",
      state: EMPTY_AUTO_CONNECT_STATE,
      discovered: [
        computer("checking", { checking: true }),
        computer("old", { compatible: false }),
      ],
      skip: [],
      connect: [],
      seen: ["old"],
    },
  ])("$name", ({ state, discovered, skip, connect, seen }) => {
    const plan = planAutoConnect({
      state,
      accountId: "user-1",
      discovered,
      skipIds: new Set(skip),
    });
    expect(plan.connectIds).toEqual(connect);
    expect(plan.state).toEqual({ accountId: "user-1", seen });
  });

  it("returns the same state when nothing changed, so storage is not rewritten", () => {
    const state = { accountId: "user-1", seen: ["mac-a"] };
    const plan = planAutoConnect({
      state,
      accountId: "user-1",
      discovered: [computer("mac-a")],
      skipIds: new Set(),
    });
    expect(plan.state).toBe(state);
  });
});
