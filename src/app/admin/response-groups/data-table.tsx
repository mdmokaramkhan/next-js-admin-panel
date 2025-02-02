"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableResetFilter } from "@/components/ui/table/data-tble-reset";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { DataTableWithScroll } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { ResponseGroup } from "./columns";

const statusOptions = [
  { value: "0", label: "Not Process" },
  { value: "5", label: "No Parsing" },
  { value: "7", label: "Processing" },
  { value: "8", label: "Process Failed" },
  { value: "9", label: "Waiting Response" },
  { value: "10", label: "Successful" },
  { value: "20", label: "Failed" },
  { value: "21", label: "Wrong Number" },
  { value: "22", label: "Invalid Amount" },
  { value: "23", label: "Provider Down" },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSizeOptions?: number[];
  loading: boolean;
}

export function DataTable<TData extends ResponseGroup, TValue>({
  columns,
  data,
  pageSizeOptions = [10, 20, 30, 50],
  loading,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const resetFilters = () => {
    setSearchFilter("");
    setStatusFilter("all");
  };

  const isAnyFilterActive = (searchFilter || statusFilter !== "all") ? "true" : "";

  const table = useReactTable({
    data: useMemo(() => {
      return data.filter((row: any) => {
        const searchMatch = searchFilter
          ? row.group_name.toLowerCase().includes(searchFilter.toLowerCase())
          : true;
        
        const statusMatch = statusFilter !== "all"
          ? row.status_code.toString() === statusFilter
          : true;

        return searchMatch && statusMatch;
      });
    }, [data, searchFilter, statusFilter]),
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
          placeholder="Search by group name..."
          onChange={(e) => setSearchFilter(e.target.value || "")}
          value={searchFilter}
        />
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
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
