interface EmptyStateParams {
  search: string;
  selectedTeam: string;
  selectedFiltersCount: number;
  dateFilter: string;
  today: string;
}

export function getUpdatesEmptyState({
  search,
  selectedTeam,
  selectedFiltersCount,
  dateFilter,
  today,
}: EmptyStateParams) {
  const trimmedSearch = search.trim();
  const hasSearch = Boolean(trimmedSearch);
  const hasTeamOrStatusFilters = Boolean(selectedTeam) || selectedFiltersCount > 0;
  const isDifferentDate = dateFilter !== today;

  let title = "No records found";
  let description = "No records found yet.";

  if (hasSearch) {
    title = `No results found for "${trimmedSearch}"`;
    description = "You can try a different name or clear the search.";
  } else if (hasTeamOrStatusFilters) {
    title = "No records match the selected filters";
    description = "Try clearing the filters and try again.";
  } else if (isDifferentDate) {
    const dateText = new Date(`${dateFilter}T00:00:00`).toLocaleDateString();
    title = `${dateText} no records found for the selected date`;
    description = "You can try a different date or go back to the record day.";
  }

  return {
    title,
    description,
    hasSearch,
    hasTeamOrStatusFilters,
    isDifferentDate,
  };
}
