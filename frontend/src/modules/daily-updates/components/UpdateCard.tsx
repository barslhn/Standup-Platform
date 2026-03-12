"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { History, Pencil, AlertTriangle } from "lucide-react";
import { useUpdateVersions } from "../hooks/useUpdates";
import { UpdateForm } from "./UpdateForm";
import type { DailyUpdate, UpdateVersion } from "@/core/types";

interface Props {
  update: DailyUpdate;
  canEdit?: boolean;
  isLate?: boolean;
  compact?: boolean;
  showHistory?: boolean;
  editNote?: string;
  prefetchedVersions?: UpdateVersion[];
}

function statusLabel(status: DailyUpdate["status"]) {
  if (status === "ON_LEAVE") return "On Leave";
  return "Active";
}

export function UpdateCard({
  update,
  canEdit,
  isLate,
  compact = false,
  showHistory = true,
  editNote,
  prefetchedVersions,
}: Readonly<Props>) {
  const [showEdit, setShowEdit] = useState(false);
  const { data: fetchedVersions = [] } = useUpdateVersions(update.id, prefetchedVersions === undefined);
  const versions = prefetchedVersions ?? fetchedVersions;
  const hasVersions = versions.length > 0;
  const previewVersions = useMemo(() => versions.slice(0, 3), [versions]);
  const hasCurrentBlockerText = Boolean(update.blockers?.trim());
  const shouldShowCurrentBlocker = update.hasBlocker && hasCurrentBlockerText;

  return (
    <Card className={compact ? "h-full min-h-[280px]" : "h-fit self-start"}>
      <CardHeader className={compact ? "pb-1" : "pb-2"}>
        <div className="space-y-2">
          <CardTitle className="text-base">
            {update.user?.name ?? "Me"}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            {update.user?.team && (
              <Badge
                variant="secondary"
                className="border-slate-300 bg-slate-100 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {update.user.team}
              </Badge>
            )}
            {update.status !== "ACTIVE" && (
              <Badge
                variant="outline"
                className="border-sky-300 bg-sky-50 text-xs text-sky-800 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200"
              >
                {statusLabel(update.status)}
              </Badge>
            )}
            {isLate && (
              <Badge className="border border-amber-300 bg-amber-50 text-xs text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60">
                Late Notification
              </Badge>
            )}
            {update.hasBlocker && (
              <Badge className="gap-1 border border-red-300 bg-red-50 text-xs text-red-800 hover:bg-red-100 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/60">
                <AlertTriangle className="h-3 w-3" />
                Blocker
              </Badge>
            )}
            {editNote && (
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-50 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
              >
                {editNote}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={compact ? "flex h-full flex-col space-y-2 text-sm" : "space-y-3 text-sm"}>
        {showEdit ? (
          <UpdateForm
            existing={update}
            onSuccess={() => setShowEdit(false)}
          />
        ) : (
          <>
            <div>
              <p className="font-medium text-muted-foreground">Yesterday</p>
              <p className={compact ? "line-clamp-2" : ""}>{update.yesterday || "-"}</p>
            </div>
            <Separator />
            <div>
              <p className="font-medium text-muted-foreground">Today</p>
              <p className={compact ? "line-clamp-2" : ""}>{update.today || "-"}</p>
            </div>
            {shouldShowCurrentBlocker && (
              <>
                <Separator />
                <div>
                  <p className="font-medium text-muted-foreground">Blocker</p>
                  <p className={compact ? "line-clamp-2" : ""}>{update.blockers}</p>
                </div>
              </>
            )}
            <div className={compact ? "mt-auto flex gap-2 pt-1" : "flex gap-2 pt-2"}>
              {canEdit && update.status === "ACTIVE" && (
                <Button size="sm" variant="outline" onClick={() => setShowEdit(true)}>
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}
              {showHistory && hasVersions && (
                <HoverCard openDelay={120} closeDelay={80}>
                  <HoverCardTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={compact ? "h-7 px-2 text-xs" : undefined}
                    >
                      <History className="mr-1 h-3 w-3" />
                      History
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent side="top" align="end" collisionPadding={16} className="text-xs">
                    <p className="mb-2 font-medium text-muted-foreground">Revision History</p>
                    <div className="space-y-2">
                      {previewVersions.map((version, index) => {
                        const data = version.data as Partial<DailyUpdate>;
                        const hasVersionBlockerText = Boolean(data.blockers?.trim());
                        const shouldShowVersionBlocker = data.hasBlocker === true && hasVersionBlockerText;

                        return (
                          <div key={version.id} className="rounded-sm border p-2">
                            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>v{versions.length - index}</span>
                              <span>{new Date(version.changedAt).toLocaleString("en-US")}</span>
                            </div>
                            <p className="line-clamp-1"><span className="font-medium">Yesterday:</span> {data.yesterday || "-"}</p>
                            <p className="line-clamp-1"><span className="font-medium">Today:</span> {data.today || "-"}</p>
                            {shouldShowVersionBlocker && (
                              <p className="line-clamp-1"><span className="font-medium">Blocker:</span> {data.blockers}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}