"use client";

import { useUpdateVersions } from "../hooks/useUpdates";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { DailyUpdate } from "@/core/types";

interface Props {
readonly updateId: string;
}

export function VersionHistory({ updateId }: Props) {
  const { data: versions, isLoading } = useUpdateVersions(updateId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  if (!versions?.length) {
    return <p className="text-sm text-muted-foreground">No revision history available.</p>;
  }

  return (
    <div className="space-y-3">
      {versions.map((v, idx) => {
        const data = v.data as Partial<DailyUpdate>;
        return (
          <div key={v.id} className="rounded-md border p-3 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="outline">v{versions.length - idx}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(v.changedAt).toLocaleString("en-US")}
              </span>
            </div>
            {data.yesterday && (
              <p><span className="font-medium">Yesterday:</span> {data.yesterday}</p>
            )}
            {data.today && (
              <p><span className="font-medium">Today:</span> {data.today}</p>
            )}
            {data.blockers && (
              <p><span className="font-medium">Blocker:</span> {data.blockers}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}