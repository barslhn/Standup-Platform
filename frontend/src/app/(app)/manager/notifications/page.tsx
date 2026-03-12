"use client";

import { useMemo } from "react";
import { AlertTriangle, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UpdateCard } from "@/modules/daily-updates/components/UpdateCard";
import { useAllUpdates, useBatchUpdateVersions } from "@/modules/daily-updates/hooks/useUpdates";
import type { DailyUpdate, UpdateVersion } from "@/core/types";

function EditedUpdateCard({ update, versions }: Readonly<{ update: DailyUpdate; versions: UpdateVersion[] }>) {

  const editNote = useMemo(() => {
    const hadBlockerInHistory = versions.some((version) => version.data?.hasBlocker === true);
    const hadNoBlockerInHistory = versions.some((version) => version.data?.hasBlocker === false);

    if (update.hasBlocker && hadNoBlockerInHistory) {
      return "Blocker has been added";
    }

    if (!update.hasBlocker && hadBlockerInHistory) {
      return "Blocker has been removed";
    }

    return undefined;
  }, [versions, update.hasBlocker]);

  return <UpdateCard update={update} compact editNote={editNote} prefetchedVersions={versions} />;
}

function EmptyNotificationState({
  icon,
  title,
  description,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  description: string;
}>) {
  return (
    <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function ManagerNotificationsPage() {
  const today = new Date().toISOString().split("T")[0];
  const { data: updates, isLoading, isError } = useAllUpdates({ date: today });

  const todayUpdates = updates ?? [];
  const blockers = todayUpdates.filter((u) => u.hasBlocker);
  const editedUpdates = todayUpdates.filter((u) => u.updatedAt !== u.createdAt);
  const editedIds = editedUpdates.map((item) => item.id);
  const { data: versionsByUpdateId = {} } = useBatchUpdateVersions(editedIds);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Notifications failed to load. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {blockers.length > 0 ? (
        <div className="space-y-2">
            <h2 className="flex items-center gap-2 text-base font-semibold text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Critical Blockers ({blockers.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {blockers.map((u) => (
              <UpdateCard key={u.id} update={u} compact />
            ))}
          </div>
        </div>
      ) : (
        <EmptyNotificationState
          icon={<AlertTriangle className="h-4 w-4" />}
          title="No critical blockers reported today"
          description="There are no critical blockers in the stand-up updates team."
        />
      )}

      {editedUpdates.length > 0 ? (
        <div className="space-y-2">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Pencil className="h-4 w-4" />
            Edited Stand-up Updates ({editedUpdates.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {editedUpdates.map((u) => (
              <EditedUpdateCard key={u.id} update={u} versions={versionsByUpdateId[u.id] ?? []} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyNotificationState
          icon={<Pencil className="h-4 w-4" />}
          title="No stand-up updates have been edited today"
          description="No revisions were made to the stand-up updates submitted records today."
        />
      )}
    </div>
  );
}
