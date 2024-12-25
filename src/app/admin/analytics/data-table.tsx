"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter";
import { Transaction } from "./columns";
import { Input } from "@/components/ui/input";
import { DataTableResetFilter } from "@/components/ui/table/data-tble-reset";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { DataTableWithScroll } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const statusOptions = [
  { label: "Not Process", value: "0" },
  { label: "Processing", value: "7" },
  { label: "Waiting Response", value: "9" },
  { label: "Successful", value: "10" },
  { label: "Failed", value: "20" },
  { label: "Wrong Number", value: "21" },
  { label: "Invalid Amount", value: "22" },
  { label: "Provider Down", value: "23" },
];

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
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState({});

  const resetFilters = () => {
    setStatusFilter("");
    setSearchFilter("");
  };

  const isAnyFilterActive = statusFilter || searchFilter;

  const table = useReactTable({
    data: useMemo(() => {
      return data.filter((row) => {
        const statusMatch = statusFilter
          ? statusFilter.split(".").includes(row.status.toString())
          : true;
        const searchMatch = searchFilter
          ? row.number.toLowerCase().includes(searchFilter.toLowerCase()) ||
            row.mobile_number.toLowerCase().includes(searchFilter.toLowerCase()) ||
            row.shop_name.toLowerCase().includes(searchFilter.toLowerCase())
          : true;
        return statusMatch && searchMatch;
      });
    }, [data, statusFilter, searchFilter]),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { rowSelection, columnVisibility },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const totalItems = data.length;
  const filteredDataCount = table.getPrePaginationRowModel().rows.length;

  return (
    <div className="space-y-4">
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Input
            className="w-[300px]"
            placeholder="Search by number, mobile or shop..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          <DataTableFilterBox
            filterKey="status"
            title="Status"
            options={statusOptions}
            setFilterValue={(value) => {
              setStatusFilter((value || "") as string);
              return Promise.resolve(new URLSearchParams());
            }}
            filterValue={statusFilter}
          />
          <DataTableResetFilter
            isFilterActive={isAnyFilterActive}
            onReset={resetFilters}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {loading ? (
        <DataTableSkeleton columnCount={16} rowCount={10} />
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
