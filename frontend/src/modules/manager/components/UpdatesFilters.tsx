"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { ChevronDown, Search } from "lucide-react";
import { TEAM_OPTIONS } from "@/modules/auth/constants/register-options";
import { UPDATE_FILTER_OPTIONS, type UpdateFilter } from "@/modules/manager/types/update-filters";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UpdatesFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  selectedTeam: string;
  setSelectedTeam: (value: string) => void;
  selectedFilters: UpdateFilter[];
  toggleFilter: (filter: UpdateFilter) => void;
  selectAllFilters: () => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
}

function toDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function UpdatesFilters({
  search,
  setSearch,
  selectedTeam,
  setSelectedTeam,
  selectedFilters,
  toggleFilter,
  selectAllFilters,
  dateFilter,
  setDateFilter,
}: UpdatesFiltersProps) {
  return (
    <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or content..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={selectedTeam || "ALL_TEAMS"}
        onValueChange={(value) => setSelectedTeam(value === "ALL_TEAMS" ? "" : value)}
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
          <Button type="button" variant="outline" className="w-full justify-between">
            {selectedFilters.length === 0 ? "All Statuses" : `${selectedFilters.length} Selected Statuses`}
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
          {UPDATE_FILTER_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedFilters.includes(option.value)}
              onCheckedChange={() => {
                if (selectedFilters.length === 1 && selectedFilters[0] === option.value) {
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
        onChange={(date: Date | null) => setDateFilter(date ? toDateInputValue(date) : "")}
        dateFormat="yyyy-MM-dd"
        placeholderText="Select date (YYYY-MM-DD)"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        wrapperClassName="w-full"
      />
    </div>
  );
}
