import { squashAtomCommandFailure } from "@t3tools/client-runtime/state/runtime";
import type { EnvironmentThreadShell } from "@t3tools/client-runtime/state/shell";

import { useProjectLookups } from "../components/CommandPaletteLookups";
import { toastManager } from "../components/ui/toast";
import { serverEnvironment } from "../state/server";
import { threadEnvironment } from "../state/threads";
import { useAtomCommand } from "../state/use-atom-command";

/** Stops the thread's provider session and refreshes its skills, so the next message starts fresh. */
export function useRestartAgentSession() {
  const stopThreadSession = useAtomCommand(threadEnvironment.stopSession, {
    reportFailure: false,
  });
  const refreshProviders = useAtomCommand(serverEnvironment.refreshProviders, {
    reportFailure: false,
  });
  const { projectByKey } = useProjectLookups();
  return async (thread: EnvironmentThreadShell) => {
    const { environmentId } = thread;
    if (thread.runtime !== null) {
      const stopped = await stopThreadSession({
        environmentId,
        input: { threadId: thread.id },
      });
      if (stopped._tag === "Failure") throw squashAtomCommandFailure(stopped);
    }
    toastManager.add({
      type: "success",
      title: "Agent session will restart",
      description: "Your next message starts a fresh session.",
    });
    const project = projectByKey.get(`${environmentId}:${thread.projectId}`);
    if (!project) return;
    const refreshed = await refreshProviders({
      environmentId,
      input: {
        instanceId: thread.runtime?.providerInstanceId ?? thread.modelSelection.instanceId,
        cwd: thread.worktreePath ?? project.workspaceRoot,
        fresh: true,
      },
    });
    if (refreshed._tag === "Failure") throw squashAtomCommandFailure(refreshed);
  };
}
