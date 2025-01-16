"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter";
import { Log } from "./columns";
import { Input } from "@/components/ui/input";
import { DataTableResetFilter } from "@/components/ui/table/data-tble-reset";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { DataTableWithScroll } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSizeOptions?: number[];
  loading: boolean;
}

export const typeOptions = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

export function DataTable<TData extends Log, TValue>({
  columns,
  data,
  pageSizeOptions = [10, 20, 30, 50],
  loading,
}: DataTableProps<TData, TValue>) {
  // Memoize filters
  const [filters, setFilters] = useState(() => ({
    type: "",
    search: ""
  }));

  const resetFilters = () => {
    setFilters({ type: "", search: "" });
  };

  // Memoize filtered data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const typeMatch = !filters.type || filters.type.split(".").includes(row.type);
      const searchMatch = !filters.search 
        ? true 
        : row.message.toLowerCase().includes(filters.search.toLowerCase()) ||
          (row.requestPath?.toLowerCase().includes(filters.search.toLowerCase()) ?? false);
      return typeMatch && searchMatch;
    });
  }, [data, filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalItems = data.length;
  const filteredDataCount = table.getPrePaginationRowModel().rows.length;

  return (
    <div className="space-y-4">
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Input
          className="w-1/4"
          placeholder="Search message or path..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <div className="flex gap-4 mr-4">
          <DataTableFilterBox
            filterKey="type"
            title="Level"
            options={typeOptions}
            setFilterValue={(value) => {
              setFilters((prev) => ({ ...prev, type: (value || "") as string }));
              return Promise.resolve(new URLSearchParams());
            }}
            filterValue={filters.type}
          />
        </div>
        <DataTableResetFilter
          isFilterActive={filters.type || filters.search}
          onReset={resetFilters}
        />
      </div>
      {loading ? (
        <DataTableSkeleton columnCount={5} rowCount={10} />
      ) : (
        <div>
          <DataTableWithScroll table={table} columns={columns} />
          <DataTablePagination
            table={table}
            pageSizeOptions={pageSizeOptions}
            totalItems={totalItems}
            filteredDataCount={filteredDataCount}
          />
        </div>
      )}
    </div>
  );
}
