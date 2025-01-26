"use client";

import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import { Transaction } from "./columns";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter";
import { DataTableResetFilter } from "@/components/ui/table/data-tble-reset";

// Add status options
const statusOptions = [
  { value: "10", label: "Success" },
  { value: "0,5,7,8,9", label: "Pending" },
  { value: "20,21,22,23", label: "Failed" },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSizeOptions?: number[];
  loading: boolean;
  onFilter?: (filteredData: TData[]) => void;
}

export function DataTable<TData extends Transaction, TValue>({
  columns,
  data,
  pageSizeOptions = [10, 20, 30, 50],
  loading,
  onFilter,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [lapuSearchFilter, setLapuSearchFilter] = useState<string>(""); // Add this line
  const [providerFilter, setProviderFilter] = useState<string>("");
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true } // Default sort by updatedAt in descending order
  ]);

  // Get unique providers from data
  const uniqueProviders = useMemo(() => {
    const providers = new Set(data.map(row => row.providerDetails?.provider_name));
    return Array.from(providers)
      .filter(Boolean)
      .map(name => ({
        label: name as string,
        value: name as string
      }));
  }, [data]);

  // Get unique modules from data
  const uniqueModules = useMemo(() => {
    const modules = new Set(data.map(row => row.moduleDetails?.module_name));
    return Array.from(modules)
      .filter(Boolean)
      .map(name => ({
        label: name as string,
        value: name as string
      }));
  }, [data]);

  const resetFilters = () => {
    setSearchFilter("");
    setLapuSearchFilter(""); // Add this line
    setProviderFilter("");
    setModuleFilter("");
    setStatusFilter("");
  };

  const isAnyFilterActive = searchFilter || lapuSearchFilter || providerFilter || moduleFilter || statusFilter; // Modify this line

  const filteredData = useMemo(() => {
    return data.filter((row: Transaction) => {
      const searchMatch = searchFilter
        ? row.number.toLowerCase().includes(searchFilter.toLowerCase()) ||
          String(row.mobile_number).includes(searchFilter)
        : true;

      const lapuMatch = lapuSearchFilter
        ? String(row.lapu_id).toLowerCase().includes(lapuSearchFilter.toLowerCase())
        : true;

      const providerMatch = providerFilter
        ? providerFilter.split(".").some(p => 
            row.providerDetails?.provider_name?.toLowerCase() === p.toLowerCase()
          )
        : true;

      const moduleMatch = moduleFilter
        ? moduleFilter.split(".").some(m => 
            row.moduleDetails?.module_name?.toLowerCase() === m.toLowerCase()
          )
        : true;

      const statusMatch = statusFilter
        ? statusFilter.split(",").some(status => 
            Number(status) === row.status
          )
        : true;

      return searchMatch && lapuMatch && providerMatch && moduleMatch && statusMatch;
    });
  }, [data, searchFilter, lapuSearchFilter, providerFilter, moduleFilter, statusFilter]);

  useEffect(() => {
    onFilter?.(filteredData as TData[]);
  }, [filteredData, onFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    state: { 
      rowSelection,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {/* Search Inputs and Filters Container */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Inputs */}
          <div className="flex flex-wrap items-center gap-3 flex-grow">
            <Input
              placeholder="Search by number or mobile..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full sm:w-[200px] lg:w-[250px]"
            />
            
            <Input
              placeholder="Search by LAPU number..."
              value={lapuSearchFilter}
              onChange={(e) => setLapuSearchFilter(e.target.value)}
              className="w-full sm:w-[200px] lg:w-[250px]"
            />

            {/* Filter Boxes */}
            <DataTableFilterBox
              filterKey="provider"
              title="Provider"
              options={uniqueProviders}
              setFilterValue={(value) => {
                setProviderFilter(value as string);
                return Promise.resolve(new URLSearchParams());
              }}
              filterValue={providerFilter}
            />
            
            <DataTableFilterBox
              filterKey="module"
              title="Module"
              options={uniqueModules}
              setFilterValue={(value) => {
                setModuleFilter(value as string);
                return Promise.resolve(new URLSearchParams());
              }}
              filterValue={moduleFilter}
            />

            <DataTableFilterBox
              filterKey="status"
              title="Status"
              options={statusOptions}
              setFilterValue={(value) => {
                setStatusFilter(value as string);
                return Promise.resolve(new URLSearchParams());
              }}
              filterValue={statusFilter}
            />
          </div>

          {/* Reset Filter Button */}
          <DataTableResetFilter
            isFilterActive={isAnyFilterActive}
            onReset={resetFilters}
          />
        </div>
      </div>

      {loading ? (
        <DataTableSkeleton columnCount={8} rowCount={10} />
      ) : (
        <div>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
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
          <div className="mt-4">
            <DataTablePagination
              table={table}
              pageSizeOptions={pageSizeOptions}
              totalItems={data.length}
              filteredDataCount={filteredData.length}
            />
          </div>
        </div>
      )}
    </div>
  );
}
