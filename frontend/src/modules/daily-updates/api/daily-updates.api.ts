import { api } from "@/lib/axios";
import type {
    DailyUpdate,
    CreateDailyUpdateDto,
    UpdateDailyUpdateDto,
    UpdateVersion,
    StandupPolicy,
    UpdateStandupPolicyDto,
    TeamStats,
} from "@/core/types";
import type { UpdatesQueryParams } from "../hooks/useUpdates";

export async function fetchUpdates(params?: UpdatesQueryParams): Promise<DailyUpdate[]> {
    const res = await api.get<{ data: DailyUpdate[] }>("/updates", {
        params: {
            team: params?.team || undefined,
            search: params?.search || undefined,
            date: params?.date || undefined,
            status: params?.status || undefined,
            skip: params?.skip ?? undefined,
            limit: params?.limit ?? undefined,
        },
    });
    return res.data.data;
}

export async function fetchUpdate(id: string): Promise<DailyUpdate> {
    const res = await api.get<{ data: DailyUpdate }>(`/updates/${id}`);
    return res.data.data;
}

export async function createUpdate(dto: CreateDailyUpdateDto): Promise<DailyUpdate> {
    const res = await api.post<DailyUpdate>("/updates", dto);
    return res.data;
}

export async function patchUpdate(id: string, dto: UpdateDailyUpdateDto): Promise<DailyUpdate> {
    const res = await api.patch<DailyUpdate>(`/updates/${id}`, dto);
    return res.data;
}

export async function fetchVersions(id: string): Promise<UpdateVersion[]> {
    const res = await api.get<{ data: UpdateVersion[] }>(`/updates/${id}/versions`);
    return res.data.data;
}

export async function fetchVersionsBatch(
    ids: string[],
): Promise<Record<string, UpdateVersion[]>> {
    const res = await api.get<{ data: Record<string, UpdateVersion[]> }>(
        "/updates/versions/batch",
        { params: { ids: ids.join(",") } },
    );
    return res.data.data;
}

export async function fetchStandupPolicy(): Promise<StandupPolicy> {
    const res = await api.get<{ data: StandupPolicy }>("/updates/policy");
    return res.data.data;
}

export async function updateStandupPolicy(dto: UpdateStandupPolicyDto): Promise<StandupPolicy> {
    const res = await api.patch<StandupPolicy>("/updates/policy", dto);
    return res.data;
}

export async function fetchTeamStats(params?: {
    date?: string;
    team?: string;
}): Promise<TeamStats> {
    const res = await api.get<{ data: TeamStats }>("/updates/stats/team", {
        params: {
            date: params?.date || undefined,
            team: params?.team || undefined,
        },
    });
    return res.data.data;
}
