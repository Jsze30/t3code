import * as Schema from "effect/Schema";

export const SWITCH_ACCOUNTS_STORAGE_KEY = "t3code:t3-connect-switch-accounts";
export const SwitchAccounts = Schema.Array(Schema.String);

const MAX_SWITCH_ACCOUNTS = 2;

const sameEmail = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** The Google accounts signed into on this device, most recent first, at most two. */
export function rememberSwitchAccount(
  accounts: ReadonlyArray<string>,
  email: string,
): ReadonlyArray<string> {
  return [email, ...accounts.filter((account) => !sameEmail(account, email))].slice(
    0,
    MAX_SWITCH_ACCOUNTS,
  );
}

export function switchAccountTarget(
  accounts: ReadonlyArray<string>,
  currentEmail: string | null,
): string | null {
  if (currentEmail === null) return null;
  return accounts.find((account) => !sameEmail(account, currentEmail)) ?? null;
}
