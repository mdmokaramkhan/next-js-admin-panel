"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export interface Transaction {
  id: string | number;
  createdAt?: Date;
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
  providerDetails?: {
    provider_name: string;
    provider_logo: string;
  };
  moduleDetails?: {
    module_name: string;
  };
}

export const getStatusConfig = (status: number) => {
  const configs = {
    0: { label: 'Not Process', color: 'bg-gray-100 text-gray-700', emoji: '⏸️' },
    7: { label: 'Processing', color: 'bg-blue-100 text-blue-700', emoji: '⏳' },
    9: { label: 'Waiting', color: 'bg-yellow-100 text-yellow-700', emoji: '🔄' },
    10: { label: 'Success', color: 'bg-green-100 text-green-700', emoji: '✅' },
    20: { label: 'Failed', color: 'bg-red-100 text-red-700', emoji: '❌' },
    // ...add other statuses as needed...
  };
  return configs[status as keyof typeof configs] || { label: 'Unknown', color: 'bg-gray-100', emoji: '❓' };
};

export const liveTransactionColumns: ColumnDef<Transaction>[] = [
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
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div title={format(new Date(row.original.createdAt!), "dd MMM yyyy hh:mm:ss a")}>
        {format(new Date(row.original.createdAt!), "hh:mm:ss a")}
      </div>
    ),
  },
  {
    accessorKey: "provider_code",
    header: "Provider",
    cell: ({ row }) => {
      const logoPath = row.original.providerDetails?.provider_logo 
        ? `/images/${row.original.providerDetails.provider_logo}`
        : null;
      
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={logoPath || undefined} />
            <AvatarFallback>
              {row.original.providerDetails?.provider_name?.substring(0, 2).toUpperCase() || "PT"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {row.original.providerDetails?.provider_name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "number",
    header: "Number",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.number}</div>
    ),
  },
  {
    accessorKey: "amount_price",
    header: "Amount",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="font-medium">
          ₹ {row.original.amount.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          Price: ₹ {row.original.price.toFixed(2)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusInfo = getStatusConfig(status);
      return (
        <Badge 
          variant="secondary"
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}
        >
          {statusInfo.emoji} {statusInfo.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "user_info",
    header: "User",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{row.original.shop_name}</p>
        <p className="text-xs text-muted-foreground">
          +91 {row.original.mobile_number}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "module_details",
    header: "Module",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="text-sm font-medium">
          {row.original.moduleDetails?.module_name || "N/A"}
        </p>
        <p className="text-xs text-muted-foreground">
          Bal: ₹ {row.original.lapu_bal?.toFixed(2) || "0.00"}
        </p>
      </div>
    ),
  }
];
