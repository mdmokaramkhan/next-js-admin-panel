"use client";

import { Input } from "@/components/ui/input";
import { Search, User, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { Transfer } from "./columns";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSizeOptions?: number[];
  loading: boolean;
}

export function DataTable<TData extends Transfer, TValue>({
  columns,
  data,
  pageSizeOptions = [10, 20, 30, 50],
  loading,
}: DataTableProps<TData, TValue>) {
  const [searchFilters, setSearchFilters] = useState({
    from_shop: '',
    from_mobile: '',
    to_mobile: '',
  });
  const [activeFilters, setActiveFilters] = useState({
    from_shop: '',
    from_mobile: '',
    to_mobile: '',
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
      const transfer = row as Transfer;
      
      if (activeFilters.from_shop && !transfer.shop_name.toLowerCase().includes(activeFilters.from_shop.toLowerCase())) {
        return false;
      }
      
      if (activeFilters.from_mobile && !String(transfer.mobile_number).includes(activeFilters.from_mobile)) {
        return false;
      }
      
      if (activeFilters.to_mobile && !String(transfer.end_mobile_number).includes(activeFilters.to_mobile)) {
        return false;
      }
      
      return true;
    });
  }, [data, activeFilters]);

  const handleReset = () => {
    setSearchFilters({
      from_shop: '',
      from_mobile: '',
      to_mobile: '',
    });
    setActiveFilters({
      from_shop: '',
      from_mobile: '',
      to_mobile: '',
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
            <User className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by from shop name..."
              value={searchFilters.from_shop}
              onChange={handleSearchChange('from_shop')}
              className="pl-8 w-full"
            />
          </div>

          <div className="relative">
            <PhoneCall className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by from mobile..."
              value={searchFilters.from_mobile}
              onChange={handleSearchChange('from_mobile')}
              className="pl-8 w-full"
            />
          </div>

          <div className="relative">
            <PhoneCall className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by to mobile number..."
              value={searchFilters.to_mobile}
              onChange={handleSearchChange('to_mobile')}
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
