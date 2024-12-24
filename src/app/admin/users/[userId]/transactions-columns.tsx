"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Add status mapping
const getStatusInfo = (status: number) => {
  const statusMap = {
    0: { label: "Not Process", icon: "⏸️", variant: "secondary" },
    5: { label: "No Parsing", icon: "⏹️", variant: "secondary" },
    7: { label: "Processing", icon: "⏳", variant: "warning" },
    8: { label: "Process Failed", icon: "❌", variant: "destructive" },
    9: { label: "Waiting Response", icon: "🔄", variant: "warning" },
    10: { label: "Successful", icon: "✅", variant: "success" },
    20: { label: "Failed", icon: "❌", variant: "destructive" },
    21: { label: "Wrong Number", icon: "❎", variant: "destructive" },
    22: { label: "Invalid Amount", icon: "🚫", variant: "destructive" },
    23: { label: "Provider Down", icon: "⚠️", variant: "destructive" },
  } as const;

  return statusMap[status as keyof typeof statusMap] || { label: "Unknown", icon: "❓", variant: "secondary" };
};

export type Transaction = {
  id: number;
  ip_address: string;
  provider_code: string;
  number: string;
  amount: number;
  price: number;
  mobile_number: string;
  shop_name: string;
  status: number;
  api_id: string;
  api_txn_id: string;
  operator_id: string;
  remarks: string;
  extra_field1: string;
  extra_field2: string;
  req_id: number;
  createdAt: string;
  updatedAt: string;
};

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "provider_code",
    header: "Provider",
  },
  {
    accessorKey: "number",
    header: "Number",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-medium">₹{row.original.amount.toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="text-muted-foreground">₹{row.original.price.toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusInfo = getStatusInfo(status);
      return (
        <div className="flex items-center gap-2">
          <Badge variant={statusInfo.variant as any}>
            {statusInfo.icon} {statusInfo.label}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "api_txn_id",
    header: "API TXN ID",
  },
  {
    accessorKey: "operator_id",
    header: "Operator ID",
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
  },
  {
    accessorKey: "extra_field1",
    header: "Extra Info",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.extra_field1 && row.original.extra_field2 ? (
          <>
            {row.original.extra_field1}
            <br />
            {row.original.extra_field2}
          </>
        ) : (
          row.original.extra_field1 || row.original.extra_field2 || "N/A"
        )}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.createdAt), "PPp"),
  },
];
