import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateDailyUpdateDto, UpdateDailyUpdateDto, UpdateStandupPolicyDto } from "@/core/types";
import {
  fetchUpdates,
  fetchVersions,
  fetchVersionsBatch,
  fetchStandupPolicy,
  updateStandupPolicy,
  fetchTeamStats,
  createUpdate,
  patchUpdate,
} from "@/modules/daily-updates/api/daily-updates.api";

export interface UpdatesQueryParams {
  team?: string;
  search?: string;
  date?: string;
  status?: "ACTIVE" | "ON_LEAVE";
  skip?: number;
  limit?: number;
}

export const updateKeys = {
  all: ["updates"] as const,
  list: (params?: UpdatesQueryParams) => ["updates", "list", params ?? {}] as const,
  versions: (id: string) => ["updates", id, "versions"] as const,
  versionsBatch: (ids: string[]) => ["updates", "versions", "batch", ids] as const,
  policy: ["updates", "policy"] as const,
  teamStats: (params?: { date?: string; team?: string }) => ["updates", "team-stats", params ?? {}] as const,
};

export function useAllUpdates(params?: UpdatesQueryParams) {
  return useQuery({
    queryKey: updateKeys.list(params),
    placeholderData: (previousData) => previousData,
    queryFn: () => fetchUpdates(params),
  });
}

export function useUpdateVersions(id: string, enabled = true) {
  return useQuery({
    queryKey: updateKeys.versions(id),
    queryFn: () => fetchVersions(id),
    enabled: !!id && enabled,
  });
}

export function useBatchUpdateVersions(ids: string[]) {
  const normalizedIds = Array.from(new Set(ids.filter(Boolean))).sort((a, b) => a.localeCompare(b));

  return useQuery({
    queryKey: updateKeys.versionsBatch(normalizedIds),
    queryFn: () => fetchVersionsBatch(normalizedIds),
    enabled: normalizedIds.length > 0,
    placeholderData: (prev) => prev,
  });
}

export function useCreateUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDailyUpdateDto) => createUpdate(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: updateKeys.all }); },
  });
}

export function usePatchUpdate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateDailyUpdateDto) => patchUpdate(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: updateKeys.all });
      qc.invalidateQueries({ queryKey: updateKeys.versions(id) });
    },
  });
}

export function useStandupPolicy() {
  return useQuery({
    queryKey: updateKeys.policy,
    queryFn: () => fetchStandupPolicy(),
  });
}

export function useUpdateStandupPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateStandupPolicyDto) => updateStandupPolicy(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: updateKeys.policy }); },
  });
}

export function useTeamStats(params?: { date?: string; team?: string }) {
  return useQuery({
    queryKey: updateKeys.teamStats(params),
    queryFn: () => fetchTeamStats(params),
  });
}