"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";

interface UpdatesPaginationProps {
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  onGoToPage: (page: number) => void;
}

export function UpdatesPagination({
  totalPages,
  currentPage,
  isFetching,
  onGoToPage,
}: UpdatesPaginationProps) {
  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {pageNumbers.map((page) => (
        <Button
          key={page}
          type="button"
          size="sm"
          variant={page === currentPage ? "default" : "outline"}
          onClick={() => onGoToPage(page)}
          disabled={isFetching}
        >
          {page}
        </Button>
      ))}
    </div>
  );
}
