"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { LapuSale } from "./columns";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter";
import { DataTableResetFilter } from "@/components/ui/table/data-tble-reset";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSizeOptions?: number[];
  loading: boolean;
}

export function DataTable<TData extends LapuSale, TValue>({
  columns,
  data,
  pageSizeOptions = [10, 20, 30, 50],
  loading,
}: DataTableProps<TData, TValue>) {
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [identifierFilter, setIdentifierFilter] = useState<string>("");
  const [providerFilter, setProviderFilter] = useState<string>("");

  // Get unique modules from data
  const moduleOptions = useMemo(() => {
    const modules = new Set(data.map(row => row.module_name));
    return Array.from(modules)
      .filter(Boolean)
      .map(name => ({
        label: name as string,
        value: name as string
      }));
  }, [data]);

  // Get unique identifiers from data
  const identifierOptions = useMemo(() => {
    const identifiers = new Set(data.map(row => row.identifier));
    return Array.from(identifiers)
      .filter(Boolean)
      .map(id => ({
        label: id,
        value: id
      }));
  }, [data]);

  // Get unique providers from data
  const providerOptions = useMemo(() => {
    const providers = new Set(
      data.flatMap(row => 
        row.provider_details.map(p => p.provider_name)
      )
    );
    return Array.from(providers)
      .filter(Boolean)
      .map(name => ({
        label: name as string,
        value: name as string
      }));
  }, [data]);

  const resetFilters = () => {
    setModuleFilter("");
    setIdentifierFilter("");
    setProviderFilter("");
  };

  const isAnyFilterActive = moduleFilter || identifierFilter || providerFilter;

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const moduleMatch = moduleFilter
        ? moduleFilter.split(".").some(m => 
            row.module_name.toLowerCase() === m.toLowerCase()
          )
        : true;

      const identifierMatch = identifierFilter
        ? identifierFilter.split(".").some(i => 
            row.identifier.toLowerCase() === i.toLowerCase()
          )
        : true;

      const providerMatch = providerFilter
        ? providerFilter.split(".").some(p => 
            row.provider_details.some(provider => 
              provider.provider_name.toLowerCase() === p.toLowerCase()
            )
          )
        : true;

      return moduleMatch && identifierMatch && providerMatch;
    });
  }, [data, moduleFilter, identifierFilter, providerFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-4">
          <DataTableFilterBox
            filterKey="module"
            title="Module"
            options={moduleOptions}
            setFilterValue={(value) => {
              setModuleFilter(value as string);
              return Promise.resolve(new URLSearchParams());
            }}
            filterValue={moduleFilter}
          />
          
          <DataTableFilterBox
            filterKey="identifier"
            title="Identifier"
            options={identifierOptions}
            setFilterValue={(value) => {
              setIdentifierFilter(value as string);
              return Promise.resolve(new URLSearchParams());
            }}
            filterValue={identifierFilter}
          />

          <DataTableFilterBox
            filterKey="provider"
            title="Provider"
            options={providerOptions}
            setFilterValue={(value) => {
              setProviderFilter(value as string);
              return Promise.resolve(new URLSearchParams());
            }}
            filterValue={providerFilter}
          />
        </div>

        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        />
      </div>

      {loading ? (
        <DataTableSkeleton columnCount={6} rowCount={10} />
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
