import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TransactionDetailsDialog } from "./transaction-details-dialog";

export type Transaction = {
  id?: number;
  ip_address: string;
  provider_code: string;
  number: string;
  amount: number;
  price: number;
  mobile_number: number;
  shop_name: string;
  module_id?: number;
  module_name?: string;
  status: number;
  response?: string;
  sn?: string;
  extra_field1?: string;
  extra_field2?: string;
  lapu_id?: string;
  lapu_bal?: number;
  r_offer?: number;
  ref_id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  moduleDetails?: {
    module_name: string;
    response_group: string;
    recharge_url: string;
  };
  statements?: Array<{
    amount: number;
    price: string;
    wallet_type: string;
    statement_type: number;
    balance: string;
    description: string;
  }>;
  userDetails?: {
    mobile_number: number;
    shop_name: string;
    owner_name: string;
    email_address: string;
  };
};

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

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "number",
    header: "Transaction Number",
  },
  {
    accessorKey: "provider_code",
    header: "Provider",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span>₹{parseFloat(row.original.price.toLocaleString()).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "mobile_number",
    header: "Mobile Number",
  },
  {
    accessorKey: "shop_name",
    header: "Shop Name",
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
    accessorKey: "response",
    header: "Response",
    cell: ({ row }) => (
      <span className="truncate max-w-[200px] block">
        {row.original.response || "N/A"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            View
          </Button>
          <TransactionDetailsDialog
            transaction={row.original}
            open={open}
            onOpenChange={setOpen}
          />
        </>
      );
    },
  },
];
