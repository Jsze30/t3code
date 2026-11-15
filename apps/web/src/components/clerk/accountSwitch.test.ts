import { describe, expect, it } from "vite-plus/test";

import { rememberSwitchAccount, switchAccountTarget } from "./accountSwitch";

describe("rememberSwitchAccount", () => {
  it.each([
    { accounts: [], email: "a@x.com", expected: ["a@x.com"] },
    { accounts: ["a@x.com"], email: "b@x.com", expected: ["b@x.com", "a@x.com"] },
    { accounts: ["b@x.com", "a@x.com"], email: "A@x.com", expected: ["A@x.com", "b@x.com"] },
    { accounts: ["b@x.com", "a@x.com"], email: "c@x.com", expected: ["c@x.com", "b@x.com"] },
  ])("remembers $email on top of $accounts", ({ accounts, email, expected }) => {
    expect(rememberSwitchAccount(accounts, email)).toEqual(expected);
  });
});

describe("switchAccountTarget", () => {
  it.each([
    { accounts: ["a@x.com", "b@x.com"], current: "a@x.com", expected: "b@x.com" },
    { accounts: ["a@x.com", "b@x.com"], current: "B@X.com", expected: "a@x.com" },
    { accounts: ["a@x.com"], current: "a@x.com", expected: null },
    { accounts: ["a@x.com", "b@x.com"], current: null, expected: null },
  ])("offers $expected while signed in as $current", ({ accounts, current, expected }) => {
    expect(switchAccountTarget(accounts, current)).toBe(expected);
  });
});
