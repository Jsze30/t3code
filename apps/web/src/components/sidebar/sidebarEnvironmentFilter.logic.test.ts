import { describe, expect, it } from "vite-plus/test";

import { scopeToEnvironment } from "./sidebarEnvironmentFilter.logic";

const projects = [
  { environmentId: "mac-a", id: "web" },
  { environmentId: "mac-a", id: "api" },
  { environmentId: "mac-b", id: "web" },
];

describe("scopeToEnvironment", () => {
  it.each([
    { name: "keeps the scope with no environment", scope: null, env: null, expected: null },
    {
      name: "lists every project on the environment",
      scope: null,
      env: "mac-a",
      expected: ["mac-a:web", "mac-a:api"],
    },
    {
      name: "keeps only the scoped projects on the environment",
      scope: ["mac-a:web", "mac-b:web"],
      env: "mac-b",
      expected: ["mac-b:web"],
    },
    {
      name: "lists nothing when the scoped projects are elsewhere",
      scope: ["mac-a:api"],
      env: "mac-b",
      expected: [],
    },
  ])("$name", ({ scope, env, expected }) => {
    const result = scopeToEnvironment(scope === null ? null : new Set(scope), projects, env);
    expect(result === null ? null : [...result]).toEqual(expected);
  });
});
