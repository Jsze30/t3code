import type { EnvironmentMachineKind } from "@t3tools/contracts";
import { ServerIcon } from "lucide-react";

import { useLocalStorage } from "~/hooks/useLocalStorage";
import { EnvironmentMachineIcon } from "../EnvironmentMachineIcon";
import { MenuPopup, MenuRadioGroup, MenuRadioItem, Menu, MenuTrigger } from "../ui/menu";
import { SidebarHeaderIconButton } from "./SidebarThreadHeader";
import {
  SIDEBAR_ENVIRONMENT_FILTER_KEY,
  SidebarEnvironmentFilterValue,
} from "./sidebarEnvironmentFilter.logic";

const ALL = "all";

export function useSidebarEnvironmentFilter() {
  return useLocalStorage(SIDEBAR_ENVIRONMENT_FILTER_KEY, null, SidebarEnvironmentFilterValue);
}

export interface SidebarEnvironmentOption {
  readonly environmentId: string;
  readonly label: string;
  readonly machine: EnvironmentMachineKind;
}

export function SidebarEnvironmentFilter({
  environments,
  value,
  onChange,
}: {
  readonly environments: ReadonlyArray<SidebarEnvironmentOption>;
  readonly value: string | null;
  readonly onChange: (environmentId: string | null) => void;
}) {
  const selected = environments.find((environment) => environment.environmentId === value);
  return (
    <Menu>
      <MenuTrigger
        render={
          <SidebarHeaderIconButton
            label={
              selected
                ? `Filter threads by environment: ${selected.label}`
                : "Filter threads by environment"
            }
          />
        }
      >
        {selected ? (
          <EnvironmentMachineIcon kind={selected.machine} className="size-4" />
        ) : (
          <ServerIcon className="size-4" />
        )}
      </MenuTrigger>
      <MenuPopup align="start">
        <MenuRadioGroup
          value={selected ? selected.environmentId : ALL}
          onValueChange={(next) => onChange(next === ALL ? null : (next as string))}
        >
          <MenuRadioItem value={ALL} closeOnClick>
            All environments
          </MenuRadioItem>
          {environments.map((environment) => (
            <MenuRadioItem
              key={environment.environmentId}
              value={environment.environmentId}
              closeOnClick
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <EnvironmentMachineIcon kind={environment.machine} className="size-3" />
                <span className="min-w-0 truncate">{environment.label}</span>
              </span>
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  );
}
