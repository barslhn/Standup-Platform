"use client";

import { useMemo } from "react";
import { UpdateCard } from "@/modules/daily-updates/components/UpdateCard";
import type { DailyUpdate, UpdateVersion } from "@/core/types";

export function StandupUpdateCard({
    update,
    isLate,
    versions,
}: {
    update: DailyUpdate;
    isLate: boolean;
    versions: UpdateVersion[];
}) {
    const blockerRemoved = useMemo(() => {
        if (update.hasBlocker) {
            return false;
        }

        return versions.some((version) => Boolean(version.data?.hasBlocker));
    }, [versions, update.hasBlocker]);

    return (
        <UpdateCard
            update={update}
            isLate={isLate}
            compact
            editNote={blockerRemoved ? "Blocker removed" : undefined}
            prefetchedVersions={versions}
        />
    );
}
