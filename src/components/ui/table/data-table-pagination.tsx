import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface DataTablePaginationProps {
  table: any;
  pageSizeOptions: number[];
  totalItems: number;
  filteredDataCount: number;
}

export function DataTablePagination({
  table,
  pageSizeOptions,
  totalItems,
  filteredDataCount,
}: DataTablePaginationProps) {
  const paginationState = table.getState().pagination;
  const currentPage = paginationState.pageIndex + 1;
  const pageSize = paginationState.pageSize;
  const showingFrom = totalItems === 0 ? 0 : paginationState.pageIndex * pageSize + 1;
  const showingTo = Math.min(
    (paginationState.pageIndex + 1) * pageSize,
    filteredDataCount
  );

  return (
    <div className="flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row">
      {/* Page Info */}
      <div className="flex w-full items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredDataCount > 0 ? (
            <>Showing {showingFrom} to {showingTo} of {totalItems} entries</>
          ) : (
            "No entries found"
          )}
        </div>

        {/* Rows per page select */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
          <div className="flex items-center space-x-2">
            <p className="whitespace-nowrap text-sm font-medium">Rows per page</p>
            <Select
              value={`${paginationState.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={paginationState.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pagination buttons */}
      <div className="flex w-full items-center justify-between gap-2 sm:justify-end">
        <div className="flex w-[150px] items-center justify-center text-sm font-medium">
          {totalItems > 0 ? (
            <>Page {currentPage} of {table.getPageCount()}</>
          ) : (
            "No pages"
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
