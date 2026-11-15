import { useAuth } from "@clerk/react";
import {
  RelayConnectionRegistration,
  RelayConnectionTarget,
  orchestrationProtocolCompatibilityError,
} from "@t3tools/client-runtime/connection";
import { isAtomCommandInterrupted } from "@t3tools/client-runtime/state/runtime";
import * as Option from "effect/Option";
import { useEffect, useEffectEvent } from "react";

import {
  AUTO_CONNECT_STORAGE_KEY,
  AutoConnectState,
  EMPTY_AUTO_CONNECT_STATE,
  planAutoConnect,
} from "~/cloud/autoConnectAccountComputers";
import { hasCloudPublicConfig } from "~/cloud/publicConfig";
import { environmentCatalog } from "~/connection/catalog";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { isHostedStaticApp } from "~/hostedPairing";
import {
  useEnvironments,
  usePrimaryEnvironmentId,
  useRelayEnvironmentDiscovery,
} from "~/state/environments";
import { useAtomCommand } from "~/state/use-atom-command";
import { toastManager } from "../ui/toast";

/** Adds the signed-in T3 Connect account's other computers without asking. */
export function AutoConnectAccountComputers() {
  if (!hasCloudPublicConfig()) return null;
  return <ConfiguredAutoConnectAccountComputers />;
}

function ConfiguredAutoConnectAccountComputers() {
  const { isSignedIn, userId } = useAuth({ treatPendingAsSignedOut: false });
  const accountId = isSignedIn && userId ? userId : null;
  const [state, setState] = useLocalStorage(
    AUTO_CONNECT_STORAGE_KEY,
    EMPTY_AUTO_CONNECT_STATE,
    AutoConnectState,
  );
  const discovery = useRelayEnvironmentDiscovery();
  const { environments, isReady } = useEnvironments();
  const primaryEnvironmentId = usePrimaryEnvironmentId();
  const registerEnvironment = useAtomCommand(environmentCatalog.register, {
    reportFailure: false,
  });
  // The hosted home screen adds the first computers itself.
  const hostedHomeAdds = isHostedStaticApp() && environments.length === 0;

  const connectNewComputers = useEffectEvent(
    (
      accountId: string | null,
      discovery: ReturnType<typeof useRelayEnvironmentDiscovery>,
      environments: ReturnType<typeof useEnvironments>["environments"],
      isReady: boolean,
    ) => {
      if (accountId === null || !isReady || hostedHomeAdds || !discovery.listed) return;
      const skipIds = new Set<string>(environments.map((environment) => environment.environmentId));
      if (primaryEnvironmentId !== null) skipIds.add(primaryEnvironmentId);
      const plan = planAutoConnect({
        state,
        accountId,
        skipIds,
        discovered: [...discovery.environments.values()].map(
          ({ environment, status, availability }) => {
            const descriptor = Option.getOrNull(status)?.descriptor;
            return {
              id: environment.environmentId,
              checking: availability === "checking",
              compatible:
                descriptor === undefined ||
                orchestrationProtocolCompatibilityError(descriptor) === null,
            };
          },
        ),
      });
      if (plan.state !== state) setState(plan.state);
      for (const id of plan.connectIds) {
        const environment = discovery.environments.get(id)?.environment;
        if (!environment) continue;
        void registerEnvironment(
          new RelayConnectionRegistration({
            target: new RelayConnectionTarget({
              environmentId: environment.environmentId,
              label: environment.label,
            }),
          }),
        ).then((result) => {
          if (result._tag === "Success") {
            toastManager.add({ type: "success", title: `Added ${environment.label}` });
          } else if (!isAtomCommandInterrupted(result)) {
            toastManager.add({
              type: "error",
              title: `Could not add ${environment.label}`,
              description: "Connect it from Settings, under Connections.",
            });
          }
        });
      }
    },
  );

  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- relay discovery and the saved environment list are external stores; new computers start relay connections
  useEffect(() => {
    connectNewComputers(accountId, discovery, environments, isReady);
  }, [accountId, isReady, discovery, environments]);

  return null;
}
