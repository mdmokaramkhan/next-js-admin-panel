"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { TransactionDetailsDialog } from "../../transactions/transaction-details-dialog";
import { getStatusInfo } from "../../transactions/columns";
import {
  Pause,
  X,
  RefreshCw,
  Check,
  Ban,
  AlertTriangle,
} from "lucide-react";

export interface Transaction {
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
  providerDetails?: {
    provider_name: string;
    provider_code: string;
    provider_logo: string;
    provider_type: string;
    target_wallet: string;
  };
}

const TransactionContextMenu = ({
  children,
  transaction,
  onStatusChange,
}: {
  children: React.ReactNode;
  transaction: Transaction;
  onStatusChange: () => void;
}) => {
  const handleStatusUpdate = async (newStatus: number) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      const response = await apiRequest(
        `/transactions/${transaction.id}/status`,
        "PUT",
        { status: newStatus, transactionId: transaction.id }
      );

      if (response.status) {
        toast.success(response.message || "Status updated successfully", {
          id: loadingToast,
        });
        onStatusChange();
      } else {
        toast.error(response.message || "Failed to update status", {
          id: loadingToast,
        });
      }
    } catch {
      toast.error("Error updating status", {
        id: loadingToast,
      });
    }
  };

  // Define available status options
  const statusOptions = [
    { status: 0, label: "Not Process", icon: <Pause className="mr-2 h-4 w-4" /> },
    { status: 9, label: "Waiting Response", icon: <RefreshCw className="mr-2 h-4 w-4" /> },
    { status: 10, label: "Successful", icon: <Check className="mr-2 h-4 w-4" /> },
    { status: 20, label: "Failed", icon: <X className="mr-2 h-4 w-4" /> },
    { status: 21, label: "Wrong Number", icon: <Ban className="mr-2 h-4 w-4" /> },
    { status: 22, label: "Invalid Amount", icon: <Ban className="mr-2 h-4 w-4" /> },
    { status: 23, label: "Provider Down", icon: <AlertTriangle className="mr-2 h-4 w-4" /> },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={() => window.print()}>
          Print Transaction
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            navigator.clipboard.writeText(String(transaction.id));
            toast.success("Transaction ID copied to clipboard");
          }}
        >
          Copy Transaction ID
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Update Status</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {statusOptions.map((option) => (
              <ContextMenuItem
                key={option.status}
                onClick={() => handleStatusUpdate(option.status)}
              >
                {option.icon}
                <span>{option.label}</span>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
};

const ActionCell = ({ transaction }: { transaction: Transaction }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <TransactionContextMenu
      transaction={transaction}
      onStatusChange={() => null}
    >
      <div className="relative">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          View
        </Button>
        <TransactionDetailsDialog
          transaction={transaction}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
    </TransactionContextMenu>
  );
};

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="" title={format(new Date(row.original.createdAt!), "dd MMM yyyy hh:mm a")}>
        {format(new Date(row.original.createdAt!), "dd MMM yyyy hh:mm a")}
      </div>
    ),
  },
  {
    accessorKey: "provider_code",
    header: "Provider",
    cell: ({ row }) => (
      <div className="grid grid-cols-[auto,1fr] gap-2 items-center">
        <Avatar>
          <AvatarImage
            src={`/images/${row.original.providerDetails?.provider_logo}`}
            alt={row.original.providerDetails?.provider_logo}
          />
          <AvatarFallback>
            {row.original.providerDetails?.provider_name
              ?.substring(0, 2)
              .toUpperCase() || "NA"}
          </AvatarFallback>
        </Avatar>
        {row.original.providerDetails?.provider_name || row.original.provider_code}
      </div>
    ),
  },
  {
    accessorKey: "number",
    header: "Number",
  },
  {
    accessorKey: "amount_price",
    header: "Amount & Price",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium text-nowrap">
          Amt:{" "}
          <span className="text-green-600">
            ₹ {parseFloat(row.original.amount.toString()).toFixed(2)}
          </span>
        </p>
        <p className="font-normal text-muted-foreground">
          Price:{" "}
          <span className="font-normal text-blue-600">
            ₹ {parseFloat(row.original.price.toString()).toFixed(2)}
          </span>
        </p>
      </div>
    ),
  },
  {
    accessorKey: "module_details",
    header: "Module Details",
    cell: ({ row }) => (
      <div className="space-y-1 text-sm">
        <p className="font-medium">
          <span className="text-nowrap">
            {row.original.moduleDetails?.module_name ?? "N/A"}
          </span>
        </p>
        <p className="text-xs text-nowrap text-muted-foreground">
          Lapu Balance:{" "}
          {row.original.moduleDetails ? row.original.lapu_bal ?? "N/A" : "N/A"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusInfo = getStatusInfo(status);
      return (
        <div className="flex items-center gap-2 text-nowrap">
          <Badge variant={statusInfo.variant as any}>
            {statusInfo.icon} {statusInfo.label}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell transaction={row.original} />
  },
];
