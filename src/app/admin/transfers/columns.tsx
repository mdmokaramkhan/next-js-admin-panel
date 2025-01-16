"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { TransferDetailsDialog } from "./transfer-details-dialog";
import { ArrowUpRight, ArrowDownLeft, CreditCard, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type Transfer = {
  id: number;
  ip_address: string;
  mobile_number: number;
  shop_name: string;
  amount: number;
  end_mobile_number: number;
  end_shop_name: string;
  transfer_type: number;
  target_wallet: string;
  balance: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

// Transfer Type Utils
export const getTransferInfo = (type: number) => ({
  1: {
    label: "Sent",
    icon: <ArrowUpRight className="h-4 w-4" />,
    variant: "destructive" as const,
    className: "border-red-200 bg-red-100 text-red-700",
    description: "Balance sent to another account"
  },
  2: {
    label: "Received",
    icon: <ArrowDownLeft className="h-4 w-4" />,
    variant: "outline" as const,
    className: "border-green-200 bg-green-100 text-green-700",
    description: "Balance received from another account"
  },
  3: {
    label: "UPI",
    icon: <CreditCard className="h-4 w-4" />,
    variant: "outline" as const,
    className: "border-orange-200 bg-orange-100 text-orange-700",
    description: "Balance sent for UPI transaction"
  },
  4: {
    label: "Added",
    icon: <PlusCircle className="h-4 w-4" />,
    variant: "outline" as const,
    className: "border-blue-200 bg-blue-100 text-blue-700",
    description: "Balance added to account"
  }
}[type] || {
  label: "Unknown",
  icon: <ArrowUpRight className="h-4 w-4" />,
  variant: "outline" as const,
  className: "border-gray-200 bg-gray-100 text-gray-700",
  description: "Unknown transfer type"
});

function ActionCell({ transfer }: { transfer: Transfer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        View Details
      </Button>
      <TransferDetailsDialog
        transfer={transfer}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}

export const transferColumns: ColumnDef<Transfer>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-medium">#{row.original.id}</span>
  },
  {
    accessorKey: "transfer_type",
    header: "Type",
    cell: ({ row }) => {
      const info = getTransferInfo(row.original.transfer_type);
      return (
        <Badge variant={info.variant} className={`gap-1 ${info.className}`}>
          {info.icon}
          {info.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount_details",
    header: "Amount Details",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium text-green-600">
          ₹ {row.original.amount.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground">
          Balance: ₹ {parseFloat(row.original.balance).toFixed(2)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "from_user",
    header: "From",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium truncate max-w-[200px]">{row.original.shop_name}</p>
        <p className="text-sm text-muted-foreground">+91 {row.original.mobile_number}</p>
      </div>
    ),
  },
  {
    accessorKey: "to_user",
    header: "To",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium truncate max-w-[200px]">{row.original.end_shop_name}</p>
        <p className="text-sm text-muted-foreground">+91 {row.original.end_mobile_number}</p>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</p>
        <p className="text-sm text-muted-foreground">{format(new Date(row.original.createdAt), "hh:mm a")}</p>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell transfer={row.original} />,
  },
];
