"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
  VisibilityState,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useState, useMemo, useEffect } from "react";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter";
import { User, roleOptions, statusOptions, defaultVisibleColumns } from "../columns";
import { Input } from "@/components/ui/input";
import { DataTableResetFilter } from "@/components/ui/table/data-tble-reset";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { ColumnToggle } from "./column-toggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { columns } from "../columns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSizeOptions?: number[];
  loading: boolean;
}

export function UserTable<TData extends User, TValue>({
  columns,
  data,
  pageSizeOptions = [10, 20, 30, 50],
  loading,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [roleFilter, setroleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [parentFilter, setParentFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Reset filters
  const resetFilters = () => {
    setroleFilter("");
    setStatusFilter("");
    setSearchFilter("");
    setParentFilter("");
  };

  const isAnyFilterActive = roleFilter || statusFilter || searchFilter || parentFilter;

  // Function to determine screen size
  const getScreenSize = () => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 640) return "xs";
      if (width < 768) return "sm";
      if (width < 1024) return "md";
      if (width < 1280) return "lg";
      return "xl";
    }
    return "md"; // Default for SSR
  };

  // Update column visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      const size = getScreenSize();
      const visibleColumns = defaultVisibleColumns[size];
      const newVisibility = columns.reduce((acc, column) => {
        // Use type assertion to handle column id
        const columnId = column.id || (column as any).accessorKey as string;
        if (columnId) {
          acc[columnId] = visibleColumns.includes(columnId);
        }
        return acc;
      }, {} as VisibilityState);
      setColumnVisibility(newVisibility);
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columns]);

  // Apply search filter across multiple columns
  useEffect(() => {
    if (searchFilter) {
      const searchValue = searchFilter.toLowerCase();
      const filteredData = data.filter((row) => {
        return (
          (row.shop_name?.toLowerCase() || "").includes(searchValue) ||
          row.owner_name.toLowerCase().includes(searchValue) ||
          row.mobile_number.toString().includes(searchValue) ||
          row.email_address.toLowerCase().includes(searchValue)
        );
      });
      
      // Update the table's filtered data
      table.setColumnFilters([
        {
          id: "global",
          value: filteredData,
        },
      ]);
    } else {
      table.setColumnFilters([]);
    }
  }, [searchFilter, data]);

  const table = useReactTable({
    data: useMemo(() => {
      return data.filter((row) => {
        // Role filter
        const roleMatch = roleFilter
          ? roleFilter.split(".").includes(row.group_code)
          : true;

        // Status filter - Show all data if both statuses are selected
        const statusMatch = statusFilter
          ? statusFilter.split(".").some(status => row.status === (status === "true"))
          : true;

        // Parent filter - Show all matching parents if multiple selected
        const parentMatch = parentFilter
          ? parentFilter.split(".").some(parent => row.parent_number?.toString() === parent)
          : true;

        // Search filter
        const searchValue = searchFilter.toLowerCase();
        const searchMatch = searchFilter
          ? (row.shop_name?.toLowerCase() || "").includes(searchValue) ||
            row.owner_name.toLowerCase().includes(searchValue) ||
            row.mobile_number.toString().includes(searchValue) ||
            row.email_address.toLowerCase().includes(searchValue)
          : true;

        return roleMatch && statusMatch && parentMatch && searchMatch;
      });
    }, [data, roleFilter, statusFilter, parentFilter, searchFilter]),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { 
      rowSelection,
      columnVisibility,
      sorting,
      columnFilters,
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
  });

  const totalItems = data.length;
  const filteredDataCount = table.getPrePaginationRowModel().rows.length;

  // Updated uniqueParentNumbers to include shop name
  const uniqueParentNumbers = useMemo(() => {
    return Array.from(new Set(data.map(row => row.parent_number)))
      .filter(Boolean)
      .map(parentNum => {
        const parentUser = data.find(user => user.mobile_number === parentNum);
        return {
          label: parentUser 
            ? `${parentUser.shop_name} (${parentNum})` 
            : `Parent: ${parentNum}`,
          value: parentNum?.toString() || ''
        };
      });
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <Input
            className="min-w-[200px] flex-1 sm:max-w-[300px]"
            placeholder="Search by name, mobile, or email..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <DataTableFilterBox
              filterKey="roleOptions"
              title="Role"
              options={roleOptions}
              setFilterValue={(value) => {
                setroleFilter((value || "") as string);
                return Promise.resolve(new URLSearchParams());
              }}
              filterValue={roleFilter}
            />
            <DataTableFilterBox
              filterKey="statusOptions"
              title="Status"
              options={statusOptions}
              setFilterValue={(value) => {
                setStatusFilter((value || "") as string);
                return Promise.resolve(new URLSearchParams());
              }}
              filterValue={statusFilter}
            />
            <DataTableFilterBox
              filterKey="parentNumber"
              title="Parent"
              options={uniqueParentNumbers}
              setFilterValue={(value) => {
                setParentFilter(value as string);
                return Promise.resolve(new URLSearchParams());
              }}
              filterValue={parentFilter}
            />
          </div>
          <DataTableResetFilter
            isFilterActive={isAnyFilterActive}
            onReset={resetFilters}
          />
        </div>
        <ColumnToggle table={table} />
      </div>
      {loading ? (
        <DataTableSkeleton columnCount={8} rowCount={10} />
      ) : (
        <div>
          <div className="rounded-md border">
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="whitespace-nowrap">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(
                          "group hover:bg-muted/50",
                          !row.original.status && "bg-muted/50"
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
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
