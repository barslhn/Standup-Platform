"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useMemo } from "react";
import { useTeamUpdates } from "@/modules/manager/hooks/useTeamUpdates";
import { useBatchUpdateVersions } from "@/modules/daily-updates/hooks/useUpdates";
import { StandupUpdateCard } from "@/modules/manager/components/StandupUpdateCard";
import { EmptyUpdatesState } from "@/modules/manager/components/EmptyUpdatesState";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { TEAM_OPTIONS } from "@/modules/auth/constants/register-options";

const FILTER_OPTIONS: Array<{
    value: "ON_LEAVE" | "BLOCKER" | "LATE" | "EDITED";
    label: string;
}> = [
    { value: "ON_LEAVE", label: "On Leave" },
    { value: "BLOCKER", label: "Critical" },
    { value: "LATE", label: "Late" },
    { value: "EDITED", label: "Edited" },
];

export default function ManagerUpdatesPage() {
    const toDateInputValue = (value: Date) => {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

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

    const pageNumbers = useMemo(
        () => Array.from({ length: totalPages }, (_, index) => index + 1),
        [totalPages],
    );

    const updateIds = useMemo(() => filtered.map((item) => item.id), [filtered]);
    const { data: versionsByUpdateId = {} } = useBatchUpdateVersions(updateIds);

    const today = new Date().toISOString().split("T")[0];
    const hasSearch = Boolean(search.trim());
    const hasTeamOrStatusFilters = Boolean(selectedTeam) || selectedFilters.length > 0;
    const isDifferentDate = dateFilter !== today;

    let emptyTitle = "No records found";

    if (hasSearch) {
        emptyTitle = `No results found for "${search.trim()}"`;
    } else if (hasTeamOrStatusFilters) {
        emptyTitle = "No records match the selected filters";
    } else if (isDifferentDate) {
        const dateStr = dateFilter + "T00:00:00";
        emptyTitle = `${new Date(dateStr).toLocaleDateString("en-US")} no records found for the selected date`;
    }

    let emptyDescription = "No records found yet.";

    if (hasSearch) {
        emptyDescription = "You can try a different name or clear the search.";
    } else if (hasTeamOrStatusFilters) {
        emptyDescription = "Try clearing the filters and try again.";
    } else if (isDifferentDate) {
        emptyDescription = "You can try a different date or go back to the record day.";
    }

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

            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        placeholder="Search by name or content..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select
                    value={selectedTeam || "ALL_TEAMS"}
                    onValueChange={(value) =>
                        setSelectedTeam(value === "ALL_TEAMS" ? "" : value)
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Teams" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="ALL_TEAMS">All Teams</SelectItem>

                        {TEAM_OPTIONS.map((team) => (
                            <SelectItem key={team.value} value={team.value}>
                                {team.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between"
                        >
                            {selectedFilters.length === 0
                                ? "All Statuses"
                                : `${selectedFilters.length} Selected Statuses`}
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-[220px]" align="start">
                        <DropdownMenuLabel>Status Filters</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuCheckboxItem
                            checked={selectedFilters.length === 0}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    selectAllFilters();
                                }
                            }}
                        >
                            All
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuSeparator />

                        {FILTER_OPTIONS.map((option) => (
                            <DropdownMenuCheckboxItem
                                key={option.value}
                                checked={selectedFilters.includes(option.value)}
                                onCheckedChange={() => {

                                    if (
                                        selectedFilters.length === 1 &&
                                        selectedFilters[0] === option.value
                                    ) {
                                        selectAllFilters();
                                        return;
                                    }

                                    toggleFilter(option.value);
                                }}
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DatePicker
                    selected={new Date(dateFilter)}
                    onChange={(date: Date | null) =>
                        setDateFilter(date ? toDateInputValue(date) : "")
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date (YYYY-MM-DD)"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    wrapperClassName="w-full"
                />

            </div>

            {total === 0 ? (
                <EmptyUpdatesState
                    title={emptyTitle}
                    description={emptyDescription}
                    actions={
                        <>
                            {hasSearch && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearch("")}
                                >
                                    Clear Search
                                </Button>
                            )}

                            {!hasSearch && hasTeamOrStatusFilters && (
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

                            {!hasSearch && isDifferentDate && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDateFilter(today)}
                                >
                                    Go Back to Record Day
                                </Button>
                            )}
                        </>
                    }
                />
            ) : (

                <div className="space-y-3">

                    <div className="grid grid-cols-1 items-stretch gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {filtered.map((u) => (
                            <StandupUpdateCard
                                key={u.id}
                                update={u}
                                isLate={
                                    u.status === "ACTIVE" &&
                                    isLateSubmission(u.createdAt, u.date)
                                }
                                versions={versionsByUpdateId[u.id] ?? []}
                            />
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        {pageNumbers.map((page) => (
                            <Button
                                key={page}
                                type="button"
                                size="sm"
                                variant={page === currentPage ? "default" : "outline"}
                                onClick={() => goToPage(page)}
                                disabled={isFetching}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
}
