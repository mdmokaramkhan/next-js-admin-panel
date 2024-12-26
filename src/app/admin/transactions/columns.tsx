"use client";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TransactionDetailsDialog } from "./transaction-details-dialog";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pause,
  StopCircle,
  Hourglass,
  X,
  RefreshCw,
  Check,
  Ban,
  AlertTriangle,
} from "lucide-react";
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
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

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
    createdAt: Date;
  }>;
  userDetails?: {
    mobile_number: number;
    shop_name: string;
    owner_name: string;
    email_address: string;
  };
  providerDetails?: {
    provider_name: string;
    provider_code: string;
    provider_logo: string;
    provider_type: string;
    target_wallet: string;
  };
};

// Add status mapping
export const getStatusInfo = (status: number) => {
  const statusMap = {
    0: {
      label: "Not Process",
      icon: <Pause size={16} />,
      variant: "secondary",
    },
    5: {
      label: "No Parsing",
      icon: <StopCircle size={16} />,
      variant: "secondary",
    },
    7: {
      label: "Processing",
      icon: <Hourglass size={16} />,
      variant: "warning",
    },
    8: {
      label: "Process Failed",
      icon: <X size={16} />,
      variant: "destructive",
    },
    9: {
      label: "Waiting Response",
      icon: <RefreshCw size={16} />,
      variant: "warning",
    },
    10: { label: "Successful", icon: <Check size={16} />, variant: "success" },
    20: { label: "Failed", icon: <X size={16} />, variant: "destructive" },
    21: {
      label: "Wrong Number",
      icon: <Ban size={16} />,
      variant: "destructive",
    },
    22: {
      label: "Invalid Amount",
      icon: <Ban size={16} />,
      variant: "destructive",
    },
    23: {
      label: "Provider Down",
      icon: <AlertTriangle size={16} />,
      variant: "destructive",
    },
  } as const;

  return (
    statusMap[status as keyof typeof statusMap] || {
      label: "Unknown",
      icon: null,
      variant: "secondary",
    }
  );
};

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

      if (response.status) { // Changed from response.success to response.status
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
            <ContextMenuItem onClick={() => handleStatusUpdate(0)}>
              <Pause className="mr-2 h-4 w-4" /> Not Process
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleStatusUpdate(9)}>
              <RefreshCw className="mr-2 h-4 w-4" /> Waiting Response
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleStatusUpdate(10)}>
              <Check className="mr-2 h-4 w-4" /> Successful
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => handleStatusUpdate(20)}>
              <X className="mr-2 h-4 w-4" /> Failed
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleStatusUpdate(21)}>
              <Ban className="mr-2 h-4 w-4" /> Wrong Number
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleStatusUpdate(22)}>
              <Ban className="mr-2 h-4 w-4" /> Invalid Amount
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleStatusUpdate(23)}>
              <AlertTriangle className="mr-2 h-4 w-4" /> Provider Down
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
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
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-nowrap">
        {format(new Date(row.original.createdAt!), "dd MMM yyyy hh:mm a")}
      </span>
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
              .substring(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {row.original.providerDetails?.provider_name}
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
          Amount:{" "}
          <span className="text-green-600">
            ₹ {parseFloat(row.original.amount.toLocaleString()).toFixed(2)}
          </span>
        </p>
        <p className="font-normal text-muted-foreground">
          Price:{" "}
          <span className="font-normal text-blue-600">
            ₹ {parseFloat(row.original.price.toLocaleString()).toFixed(2)}
          </span>
        </p>
      </div>
    ),
  },
  {
    accessorKey: "user_info",
    header: "User Info",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-nowrap">{row.original.shop_name}</p>
        <p className="text-muted-foreground">+91{row.original.mobile_number}</p>
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
  // {
  //   accessorKey: "response",
  //   header: "Response",
  //   cell: ({ row }) => (
  //     <span className="truncate max-w-[200px] block">
  //       {row.original.response || "N/A"}
  //     </span>
  //   ),
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [open, setOpen] = useState(false);
      return (
        <TransactionContextMenu
          transaction={row.original}
          onStatusChange={() => null}
        >
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              View
            </Button>
            <TransactionDetailsDialog
              transaction={row.original}
              open={open}
              onOpenChange={setOpen}
            />
          </div>
        </TransactionContextMenu>
      );
    },
  },
];
