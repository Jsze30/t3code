import * as Schema from "effect/Schema";

export const SIDEBAR_ENVIRONMENT_FILTER_KEY = "t3code:sidebar-environment-filter:v1";
export const SidebarEnvironmentFilterValue = Schema.NullOr(Schema.String);

/**
 * Narrows the sidebar's project scope (null is every project) to one environment's
 * projects, keyed `environmentId:projectId` like the scope itself.
 */
export function scopeToEnvironment(
  scopedKeys: ReadonlySet<string> | null,
  projects: Iterable<{ readonly environmentId: string; readonly id: string }>,
  environmentId: string | null,
): ReadonlySet<string> | null {
  if (environmentId === null) return scopedKeys;
  const keys = new Set<string>();
  for (const project of projects) {
    if (project.environmentId !== environmentId) continue;
    const key = `${project.environmentId}:${project.id}`;
    if (scopedKeys === null || scopedKeys.has(key)) keys.add(key);
  }
  return keys;
}
