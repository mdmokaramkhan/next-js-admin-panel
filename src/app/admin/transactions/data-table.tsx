"use client";

import { Input } from "@/components/ui/input";
import { PhoneCall, Store, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { Transaction } from "./columns";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSizeOptions?: number[];
  loading: boolean;
}

function getColumnWidth(columnId: string): string {
  // Remove all fixed widths and let table handle it naturally
  return 'auto';
}

export function DataTable<TData extends Transaction, TValue>({
  columns,
  data,
  pageSizeOptions = [10, 20, 30, 50],
  loading,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [searchFilters, setSearchFilters] = useState({
    number: '',
    provider: '',
    user: ''
  });
  const [activeFilters, setActiveFilters] = useState({
    number: '',
    provider: '',
    user: ''
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

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    return data.filter(row => {
      const transaction = row as Transaction;
      
      if (activeFilters.number && !transaction.number.toLowerCase().includes(activeFilters.number.toLowerCase())) {
        return false;
      }
      
      if (activeFilters.provider && !transaction.providerDetails?.provider_name?.toLowerCase().includes(activeFilters.provider.toLowerCase())) {
        return false;
      }
      
      if (activeFilters.user && !String(transaction.mobile_number).includes(activeFilters.user)) {
        return false;
      }
      
      return true;
    });
  }, [data, activeFilters]);

  const handleReset = () => {
    setSearchFilters({
      number: '',
      provider: '',
      user: ''
    });
    setActiveFilters({
      number: '',
      provider: '',
      user: ''
    });
  };

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
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          <div className="relative">
            <PhoneCall className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by number..."
              value={searchFilters.number}
              onChange={handleSearchChange('number')}
              className="pl-8 w-full"
            />
          </div>

          <div className="relative">
            <Store className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by provider..."
              value={searchFilters.provider}
              onChange={handleSearchChange('provider')}
              className="pl-8 w-full"
            />
          </div>

          <div className="relative">
            <User className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user number..."
              value={searchFilters.user}
              onChange={handleSearchChange('user')}
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
