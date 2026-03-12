"use client";

import { useMemo } from "react";
import { useTeamUpdates } from "@/modules/manager/hooks/useTeamUpdates";
import { useBatchUpdateVersions } from "@/modules/daily-updates/hooks/useUpdates";
import { StandupUpdateCard } from "@/modules/manager/components/StandupUpdateCard";
import { EmptyUpdatesState } from "@/modules/manager/components/EmptyUpdatesState";
import { UpdatesFilters } from "@/modules/manager/components/UpdatesFilters";
import { UpdatesPagination } from "@/modules/manager/components/UpdatesPagination";
import { getUpdatesEmptyState } from "@/modules/manager/utils/updates-empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ManagerUpdatesPage() {

  const {
    filtered,
    isLoading,
    isFetching,
    selectedTeam,
    setSelectedTeam,
    selectedFilters,
    toggleFilter,
    selectAllFilters,
    isLateSubmission,
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    total,
    totalOnPage,
    totalPages,
    currentPage,
    goToPage,
  } = useTeamUpdates();

  const updateIds = useMemo(() => filtered.map((item) => item.id), [filtered]);
  const { data: versionsByUpdateId = {} } = useBatchUpdateVersions(updateIds);

  const today = new Date().toISOString().split("T")[0];
  const emptyState = getUpdatesEmptyState({
    search,
    selectedTeam,
    selectedFiltersCount: selectedFilters.length,
    dateFilter,
    today,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        {Array.from({ length: 3 }, (_, i) => String(i)).map((id) => (
          <Skeleton key={`skeleton-${id}`} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Updates</h1>
          <h1 className="text-muted-foreground">Total {total} records</h1>
          <p className="text-muted-foreground">
            {currentPage}/{totalPages} Page | Showing total {totalOnPage} records on this page
          </p>
        </div>
      </div>

      <UpdatesFilters
        search={search}
        setSearch={setSearch}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        selectAllFilters={selectAllFilters}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      {total === 0 ? (
        <EmptyUpdatesState
          title={emptyState.title}
          description={emptyState.description}
          actions={
            <>
              {emptyState.hasSearch && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setSearch("")}>
                  Clear Search
                </Button>
              )}

              {!emptyState.hasSearch && emptyState.hasTeamOrStatusFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTeam("");
                    selectAllFilters();
                  }}
                >
                  Clear Filters
                </Button>
              )}

              {!emptyState.hasSearch && emptyState.isDifferentDate && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setDateFilter(today)}>
                  Go Back to Record Day
                </Button>
              )}
            </>
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 items-stretch gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((update) => (
              <StandupUpdateCard
                key={update.id}
                update={update}
                isLate={update.status === "ACTIVE" && isLateSubmission(update.createdAt, update.date)}
                versions={versionsByUpdateId[update.id] ?? []}
              />
            ))}
          </div>

          <UpdatesPagination
            totalPages={totalPages}
            currentPage={currentPage}
            isFetching={isFetching}
            onGoToPage={goToPage}
          />
        </div>
      )}
    </div>
  );
}
