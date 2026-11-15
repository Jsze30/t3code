import { UserButton, useAuth, useClerk, useUser } from "@clerk/react";
import { T, useMessages } from "gt-react";
import { ArrowLeftRightIcon, LogInIcon, RotateCwIcon } from "lucide-react";
import { useEffect, useEffectEvent } from "react";

import { hasCloudPublicConfig } from "../../cloud/publicConfig";
import { isElectron } from "../../env";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  rememberSwitchAccount,
  SWITCH_ACCOUNTS_STORAGE_KEY,
  SwitchAccounts,
  switchAccountTarget,
} from "./accountSwitch";
import { resolveClerkSignInProps } from "./authRedirect";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { retryClerkLoad, useClerkLoadFailed } from "./clerkLoadFailure";
import { T3_CONNECT_ACCOUNT_PAGES } from "./T3ConnectAccountPages";
import { useT3ConnectAuthPrompt } from "./useT3ConnectAuthPrompt";

export function T3ConnectSidebarSignIn() {
  if (!hasCloudPublicConfig()) return null;

  return <ConfiguredT3ConnectSidebarSignIn />;
}

export function T3ConnectSidebarAvatar() {
  if (!hasCloudPublicConfig()) return null;

  return <ConfiguredT3ConnectSidebarAvatar />;
}

function ConfiguredT3ConnectSidebarAvatar() {
  const { isLoaded, isSignedIn } = useAuth();
  const m = useMessages();
  const { user } = useUser();
  const clerk = useClerk();
  const [switchAccounts, setSwitchAccounts] = useLocalStorage(
    SWITCH_ACCOUNTS_STORAGE_KEY,
    [],
    SwitchAccounts,
  );
  const googleEmail =
    user?.externalAccounts.find((account) => account.provider === "google")?.emailAddress ?? null;

  const rememberAccount = useEffectEvent((email: string) =>
    setSwitchAccounts((accounts) => rememberSwitchAccount(accounts, email)),
  );
  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- records the Clerk account, which lives outside React, in localStorage
  useEffect(() => {
    if (googleEmail) rememberAccount(googleEmail);
  }, [googleEmail]);

  if (!isLoaded || !isSignedIn) return null;

  const switchTarget = switchAccountTarget(switchAccounts, googleEmail);
  const switchTo = (email: string) => {
    const redirect = resolveClerkSignInProps(window.location.href, isElectron);
    const openSignIn = () =>
      clerk.openSignIn({ ...redirect, initialValues: { emailAddress: email } });
    // T3 Connect allows one signed-in account at a time, so switching signs out first.
    void clerk.signOut(async () => {
      // oxlint-disable-next-line t3code/no-rpc-permission-bypass -- Clerk's client, not a T3 RPC client
      const signIn = clerk.client?.signIn;
      // Only the desktop app can finish a Google sign-in started here; the web has no callback route.
      if (!isElectron || !signIn || !redirect.forceRedirectUrl) return openSignIn();
      try {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          identifier: email,
          redirectUrl: redirect.forceRedirectUrl,
          redirectUrlComplete: redirect.forceRedirectUrl,
          __internal_callbackParams: {
            signInForceRedirectUrl: redirect.forceRedirectUrl,
            signUpForceRedirectUrl: redirect.forceRedirectUrl,
          },
        });
      } catch {
        openSignIn();
      }
    });
  };

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "size-7",
          // Clerk's unlayered trigger reset (padding, radius, background) beats layered utilities.
          userButtonTrigger: "mb-1! rounded-lg! p-1! hover:bg-sidebar-row-hover!",
        },
      }}
    >
      {T3_CONNECT_ACCOUNT_PAGES.map((page) => (
        <UserButton.UserProfilePage
          key={page.url}
          label={m(page.label)}
          labelIcon={page.icon}
          url={page.url}
        >
          {page.content}
        </UserButton.UserProfilePage>
      ))}
      {switchTarget ? (
        <UserButton.MenuItems>
          <UserButton.Action label="manageAccount" />
          <UserButton.Action
            label={`Switch to ${switchTarget}`}
            labelIcon={<ArrowLeftRightIcon className="size-4" />}
            onClick={() => switchTo(switchTarget)}
          />
          <UserButton.Action label="signOut" />
        </UserButton.MenuItems>
      ) : null}
    </UserButton>
  );
}

function ConfiguredT3ConnectSidebarSignIn() {
  const { isLoaded, isSignedIn } = useAuth();
  const loadFailed = useClerkLoadFailed();
  const { openAuthPrompt } = useT3ConnectAuthPrompt();

  if (loadFailed) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={retryClerkLoad}>
            <RotateCwIcon />
            <span>
              <T>Retry T3 Connect</T>
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }
  if (!isLoaded || isSignedIn) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={openAuthPrompt}>
          <LogInIcon />
          <span>
            <T>Sign in to T3 Connect</T>
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
