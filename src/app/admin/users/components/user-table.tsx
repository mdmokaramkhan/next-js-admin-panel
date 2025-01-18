"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter";
import { User, roleOptions } from "../columns";
import { Input } from "@/components/ui/input";
import { DataTableResetFilter } from "@/components/ui/table/data-tble-reset";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";

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
  // State to track row selection
  const [rowSelection, setRowSelection] = useState({});
  const [roleFilter, setroleFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [parentFilter, setParentFilter] = useState<string>("");

  // Reset filters
  const resetFilters = () => {
    setroleFilter("");
    setSearchFilter("");
    setParentFilter("");
  };

  const isAnyFilterActive = roleFilter || searchFilter || parentFilter;

  const table = useReactTable({
    data: useMemo(() => {
      // Apply filtering logic for Provider Type, Target Wallet, and Search
      return data.filter((row) => {
        const roleMatch = roleFilter
          ? roleFilter.split(".").includes(row.group_code)
          : true;
        const searchMatch = searchFilter
          ? row.email_address
              .toLowerCase()
              .includes(searchFilter.toLowerCase()) ||
            row.owner_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
            row.mobile_number.toString().includes(searchFilter.toLowerCase())
          : true; // Case-insensitive match for searchFilter
        const parentMatch = parentFilter
          ? row.parent_number?.toString() === parentFilter
          : true;
        return roleMatch && searchMatch && parentMatch;
      });
    }, [data, roleFilter, searchFilter, parentFilter]), // Add searchFilter to dependency array
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true, // Simplified row selection
    // Only allow checkbox selection
  });

  const totalItems = data.length;

  const filteredDataCount = table.getPrePaginationRowModel().rows.length;

  // Updated uniqueParentNumbers to include shop name
  const uniqueParentNumbers = useMemo(() => {
    return Array.from(new Set(data.map(row => row.parent_number)))
      .filter(Boolean)
      .map(parentNum => {
        // Find the user details where mobile_number matches parent_number
        const parentUser = data.find(user => user.mobile_number === parentNum);
        return {
          label: parentUser 
            ? `${parentUser.shop_name} (${parentNum})` 
            : `Parent: ${parentNum}`,
          value: parentNum?.toString() || ''
        };
      });
  }, [data]);

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
          placeholder="Search by name, mobile, or email..."
          onChange={(e) => {
            setSearchFilter(e.target.value || ""); // Update searchFilter state
          }}
        />
        <div className="flex gap-4 mr-4">
          {/* Filter Boxes */}
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
            filterKey="parentNumber"
            title="Parent Number"
            options={uniqueParentNumbers}
            setFilterValue={(value) => {
              setParentFilter(value as string);
              return Promise.resolve(new URLSearchParams());
            }}
            filterValue={parentFilter}
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
          <div className="border rounded-md">
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} >
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
