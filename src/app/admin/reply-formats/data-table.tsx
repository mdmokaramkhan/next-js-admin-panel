"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter";
import { MessageTemplate, modeOptions } from "./columns";
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

export function DataTable<TData extends MessageTemplate, TValue>({
  columns,
  data,
  pageSizeOptions = [10, 20, 30, 50],
  loading,
}: DataTableProps<TData, TValue>) {
  // State to track row selection
  const [rowSelection, setRowSelection] = useState({});
  const [modeFilter, setModeFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Reset filters
  const resetFilters = () => {
    setModeFilter("");
    setSearchFilter("");
  };

  const isAnyFilterActive = modeFilter || searchFilter;

  const table = useReactTable({
    data: useMemo(() => {
      // Apply filtering logic for Provider Type, Target Wallet, and Search
      return data.filter((row) => {
        const providerMatch = modeFilter
          ? modeFilter.split(".").includes(row.mode)
          : true;
        const searchMatch = searchFilter
          ? row.type.toLowerCase().includes(searchFilter.toLowerCase())
          : true; // Case-insensitive match for searchFilter
        return providerMatch && searchMatch;
      });
    }, [data, modeFilter, searchFilter]), // Add searchFilter to dependency array
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
  });

  const totalItems = data.length;

  const filteredDataCount = table.getPrePaginationRowModel().rows.length;

  // Function to get selected rows
  // const getSelectedRows = () => {
  //   const selectedRows = table
  //     .getSelectedRowModel()
  //     .rows.map((row) => row.original);
  //   console.log("Selected Rows: ", selectedRows);
  //   return selectedRows;
  // };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Input
          className="w-1/4"
          placeholder="Search ..."
          onChange={(e) => {
            setSearchFilter(e.target.value || ""); // Update searchFilter state
          }}
        />
        <div className="flex gap-4 mr-4">
          {/* Filter Boxes */}
          <DataTableFilterBox
            filterKey="mode"
            title="Mode"
            options={modeOptions}
            setFilterValue={(value) => {
              setModeFilter((value || "") as string);
              return Promise.resolve(new URLSearchParams());
            }}
            filterValue={modeFilter}
          />
        </div>
        {/* <Button variant="outline" onClick={getSelectedRows}>
            Get Selected Rows
          </Button> */}
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
