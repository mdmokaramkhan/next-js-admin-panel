"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export interface Transaction {
  id: string;
  ip_address: string;
  provider_code: string;
  number: string;
  amount: number;
  price: number;
  mobile_number: string;
  shop_name: string;
  module_name?: string;
  module_id?: string;
  status: number;
  response: string;
  sn: string;
  lapu_id: string;
  lapu_bal: number;
  r_offer: string;
  ref_id: string;
}

const getStatusBadge = (status: number) => {
  const statusConfig: Record<number, { label: string; color: string, emoji: string }> = {
    0: { label: 'Not Process', color: 'bg-slate-400', emoji: '⏸️' },
    5: { label: 'No Parsing', color: 'bg-slate-500', emoji: '⏹️' },
    7: { label: 'Processing', color: 'bg-blue-500', emoji: '⏳' },
    8: { label: 'Process Failed', color: 'bg-red-400', emoji: '❌' },
    9: { label: 'Waiting Response', color: 'bg-yellow-500', emoji: '🔄' },
    10: { label: 'Successful', color: 'bg-green-500', emoji: '✅' },
    20: { label: 'Failed', color: 'bg-red-500', emoji: '❌' },
    21: { label: 'Wrong Number', color: 'bg-red-500', emoji: '❎' },
    22: { label: 'Invalid Amount', color: 'bg-red-500', emoji: '🚫' },
    23: { label: 'Provider Down', color: 'bg-orange-500', emoji: '⚠️' }
  };

  const config = statusConfig[status] || { label: 'Unknown', color: 'bg-gray-500', emoji: '❓' };
  return (
    <Badge variant="secondary" className={`${config.color} flex items-center gap-1`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </Badge>
  );
};

export const columns: ColumnDef<Transaction>[] = [
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
    header: "ID",
    accessorKey: "id",
  },
  {
    header: "IP Address",
    accessorKey: "ip_address",
  },
  {
    header: "Provider",
    accessorKey: "provider_code",
  },
  {
    header: "Number",
    accessorKey: "number",
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell: ({ row }) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(row.getValue("amount")),
  },
  {
    header: "Price",
    accessorKey: "price",
    cell: ({ row }) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(row.getValue("price")),
  },
  {
    header: "Mobile",
    accessorKey: "mobile_number",
  },
  {
    header: "Shop",
    accessorKey: "shop_name",
  },
  {
    header: "Module",
    accessorKey: "module_name",
    cell: ({ row }) => {
      const moduleName = row.getValue("module_name");
      const moduleId = row.original.module_id;
      return moduleName ? `${moduleName} (${moduleId})` : null;
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    header: "Response",
    accessorKey: "response",
  },
  {
    header: "SN",
    accessorKey: "sn",
  },
  {
    header: "Lapu ID",
    accessorKey: "lapu_id",
  },
  {
    header: "Lapu Balance",
    accessorKey: "lapu_bal",
    cell: ({ row }) => {
      const balance = row.getValue("lapu_bal");
      return balance ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(balance as number) : '-';
    },
  },
  {
    header: "R Offer",
    accessorKey: "r_offer",
    cell: ({ row }) => row.getValue("r_offer") || '-',
  },
  {
    header: "Ref ID",
    accessorKey: "ref_id",
  },
];
