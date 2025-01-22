"use client";

import { Input } from "@/components/ui/input";
import { Search, Hash, Box, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [searchFilters, setSearchFilters] = useState({
    identifier: '',
    module_name: '',
    provider_code: '', // Changed from provider_codes to provider_code
  });
  const [activeFilters, setActiveFilters] = useState({
    identifier: '',
    module_name: '',
    provider_code: '', // Updated to match new field name
  });

  const handleSearchChange = (field: keyof typeof searchFilters) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSearch = () => {
    setActiveFilters({
      ...searchFilters
    });
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const sale = row as LapuSale;
      
      if (activeFilters.identifier && !sale.identifier.toLowerCase().includes(activeFilters.identifier.toLowerCase())) {
        return false;
      }
      
      if (activeFilters.module_name && !sale.module_name.toLowerCase().includes(activeFilters.module_name.toLowerCase())) {
        return false;
      }
      
      // Updated provider code filtering to search through provider_details array
      if (activeFilters.provider_code) {
        const hasMatchingProvider = sale.provider_details.some(provider => 
          provider.provider_code.toLowerCase().includes(activeFilters.provider_code.toLowerCase()) ||
          provider.provider_name.toLowerCase().includes(activeFilters.provider_code.toLowerCase())
        );
        if (!hasMatchingProvider) return false;
      }
      
      return true;
    });
  }, [data, activeFilters]);

  const handleReset = () => {
    setSearchFilters({
      identifier: '',
      module_name: '',
      provider_code: '', // Updated to match new field name
    });
    setActiveFilters({
      identifier: '',
      module_name: '',
      provider_code: '', // Updated to match new field name
    });
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          <div className="relative">
            <Hash className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by identifier..."
              value={searchFilters.identifier}
              onChange={handleSearchChange('identifier')}
              className="pl-8 w-full"
            />
          </div>

          <div className="relative">
            <Box className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by module name..."
              value={searchFilters.module_name}
              onChange={handleSearchChange('module_name')}
              className="pl-8 w-full"
            />
          </div>

          <div className="relative">
            <Tag className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by provider code or name..."
              value={searchFilters.provider_code}
              onChange={handleSearchChange('provider_code')}
              className="pl-8 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:self-start">
          <Button 
            onClick={handleSearch}
            className="gap-2 w-full lg:w-auto"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>

          {Object.values(activeFilters).some(Boolean) && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="w-full lg:w-auto"
            >
              Reset
            </Button>
          )}
        </div>
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
