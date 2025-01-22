"use client";

import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
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
  const [providerFilter, setProviderFilter] = useState<string>("");
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

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
    setProviderFilter("");
    setModuleFilter("");
    setStatusFilter("");
  };

  const isAnyFilterActive = searchFilter || providerFilter || moduleFilter || statusFilter;

  const filteredData = useMemo(() => {
    return data.filter((row: Transaction) => {
      const searchMatch = searchFilter
        ? row.number.toLowerCase().includes(searchFilter.toLowerCase()) ||
          String(row.mobile_number).includes(searchFilter)
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

      return searchMatch && providerMatch && moduleMatch && statusMatch;
    });
  }, [data, searchFilter, providerFilter, moduleFilter, statusFilter]);

  useEffect(() => {
    onFilter?.(filteredData as TData[]);
  }, [filteredData, onFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by number or mobile..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-[300px]"
        />
        
        <div className="flex gap-4">
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
          <DataTablePagination
            table={table}
            pageSizeOptions={pageSizeOptions}
            totalItems={data.length}
            filteredDataCount={filteredData.length}
          />
        </div>
      )}
    </div>
  );
}
