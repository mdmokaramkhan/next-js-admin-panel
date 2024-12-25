"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { Transaction } from "./columns";
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

export function DataTable<TData extends Transaction, TValue>({
  columns,
  data,
  pageSizeOptions = [10, 20, 30, 50],
  loading,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Reset filters
  const resetFilters = () => {
    setSearchFilter("");
  };

  const isAnyFilterActive = searchFilter;

  const table = useReactTable({
    data: useMemo(() => {
      // Apply filtering logic for transactions
      return data.filter((row) => {
        if (!searchFilter) return true;
        
        // Search across multiple fields
        const searchTerm = searchFilter.toLowerCase();
        return (
          row.number.toLowerCase().includes(searchTerm) ||
          row.provider_code.toLowerCase().includes(searchTerm) ||
          row.shop_name.toLowerCase().includes(searchTerm) ||
          row.mobile_number.toString().includes(searchTerm)
        );
      });
    }, [data, searchFilter]),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
  });

  const totalItems = data.length;
  const filteredDataCount = table.getPrePaginationRowModel().rows.length;

  return (
    <div className="space-y-4">
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Input
          className="w-1/4"
          placeholder="Search by number, provider, shop name..."
          onChange={(e) => setSearchFilter(e.target.value || "")}
          value={searchFilter}
        />
        
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        />
      </div>

      {loading ? (
        <DataTableSkeleton columnCount={8} rowCount={10} />
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
