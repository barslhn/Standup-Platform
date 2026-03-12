import { useCallback, useEffect, useMemo, useState } from "react";
import { useAllUpdates, useStandupPolicy } from "@/modules/daily-updates/hooks/useUpdates";
import { useDebounce } from "@/common/hooks/useDebounce";
import type { UpdateFilter } from "@/modules/manager/types/update-filters";

export function useTeamUpdates() {
  const PAGE_SIZE = 8;
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<UpdateFilter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0]
  );
  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = useMemo(
    () => debouncedSearch.replaceAll(/\s+/g, " ").trimStart(),
    [debouncedSearch],
  );

  const { data: updates = [], isLoading, isFetching } = useAllUpdates({
    team: selectedTeam || undefined,
    search: normalizedSearch || undefined,
    date: dateFilter || undefined,
  });

  useEffect(() => {
    setTimeout(() => setCurrentPage(1), 0);
  }, [selectedTeam, normalizedSearch, dateFilter]);

  const { data: policy } = useStandupPolicy();

  const isLateSubmission = useCallback((createdAt: string, date: string) => {
    const startTime = policy?.lateStart ?? "09:00";
    const endTime = policy?.lateAfter ?? "09:30";
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    const submittedAt = new Date(createdAt);

    return submittedAt < start || submittedAt > end;
  }, [policy]);

  const filteredAll = useMemo(() => {
    const list = updates.filter((u) => {
      if (selectedFilters.length === 0) {
        return true;
      }

      const isOnLeave = u.status === "ON_LEAVE";
      const isBlocker = u.hasBlocker;
      const isLate = u.status === "ACTIVE" && isLateSubmission(u.createdAt, u.date);
      const isEdited = u.updatedAt !== u.createdAt;

      return selectedFilters.some((filter) => {
        if (filter === "ON_LEAVE") return isOnLeave;
        if (filter === "BLOCKER") return isBlocker;
        if (filter === "LATE") return isLate;
        if (filter === "EDITED") return isEdited;
        return false;
      });
    });

    return list;
  }, [updates, selectedFilters, isLateSubmission]);

  const prioritizedAll = useMemo(() => {
    return filteredAll
      .map((update, index) => {
        const isLate = update.status === "ACTIVE" && isLateSubmission(update.createdAt, update.date);
        const isBlockerRemoved = !update.hasBlocker && update.updatedAt !== update.createdAt;

        let priority = 3;
        if (update.status === "ON_LEAVE") {
          priority = 4;
        } else if (update.hasBlocker) {
          priority = 0;
        } else if (isLate) {
          priority = 1;
        } else if (isBlockerRemoved) {
          priority = 2;
        }

        return { update, index, priority };
      })
      .sort((a, b) => a.priority - b.priority || a.index - b.index)
      .map((item) => item.update);
  }, [filteredAll, isLateSubmission]);

  const hasNextPage = currentPage * PAGE_SIZE < prioritizedAll.length;
  const totalPages = Math.max(1, Math.ceil(prioritizedAll.length / PAGE_SIZE));

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(prioritizedAll.length / PAGE_SIZE));
    setTimeout(() => setCurrentPage((prev) => Math.min(prev, maxPage)), 0);
  }, [prioritizedAll.length]);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const filtered = prioritizedAll.slice(pageStart, pageStart + PAGE_SIZE);

  const toggleFilter = (filter: UpdateFilter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((item) => item !== filter) : [...prev, filter],
    );
  };

  const selectAllFilters = () => {
    setSelectedFilters([]);
  };

  const blockerCount = useMemo(
    () => prioritizedAll.filter((u) => u.hasBlocker).length,
    [prioritizedAll]
  );

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToPage = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(target);
  };

  return {
    filtered,
    isLoading,
    isFetching,
    selectedTeam,
    setSelectedTeam,
    selectedFilters,
    setSelectedFilters,
    toggleFilter,
    selectAllFilters,
    isLateSubmission,
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    blockerCount,
    total: prioritizedAll.length,
    totalOnPage: filtered.length,
    pageSize: PAGE_SIZE,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage: currentPage > 1,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    policy,
  };
}
