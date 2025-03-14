import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

// Type definitions based on your database schema
export interface Group {
  id: string;
  group_code: string;
  group_name: string;
  group_panel: string;
  group_child?: string;
  group_description?: string;
}

// Add provider details interface
interface ProviderDetails {
  provider_name: string;
  provider_code: string;
  provider_type: string;
  provider_logo: string;
}

export interface CashbackSetting {
  id: number;
  status: boolean;
  group_code: string;
  provider_code: string;
  cashback_type:
    | "cashback_percentage"
    | "cashback_flat"
    | "surcharge_percentage"
    | "surcharge_flat";
  cashback: number;
  min_amount: number;
  max_amount: number;
  createdAt: string;
  updatedAt: string;
  provider_details: ProviderDetails;
}

// Add this type export
export type CashbackColumn = ColumnDef<CashbackSetting>[];

// Column definitions for the cashback settings table
export const createCashbackColumns = (
  onEdit: (cashback: CashbackSetting) => void
): CashbackColumn => [
  {
    id: "provider",
    accessorKey: "provider_details.provider_name",
    header: "Provider Name",
    cell: ({ row }) => {
      const provider = row.original.provider_details;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`/images/${provider.provider_logo}`}
              alt={provider.provider_name}
            />
            <AvatarFallback>
              {provider.provider_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{provider.provider_name}</span>
        </div>
      );
    },
  },
  {
    id: "amount_range",
    header: "Amount Range",
    cell: ({ row }) => {
      const minAmount = row.original.min_amount;
      const maxAmount = row.original.max_amount;
      
      if (!minAmount && !maxAmount) {
        return "No limits";
      }
      
      if (!maxAmount) {
        return `Min: ₹${minAmount}`;
      }
      
      if (!minAmount) {
        return `Max: ₹${maxAmount}`;
      }
      
      return `₹${minAmount} - ₹${maxAmount}`;
    },
  },
  {
    id: "cashback_type",
    accessorKey: "cashback_type",
    header: "Cashback Type",
    cell: ({ row }) => {
      const value = row.getValue("cashback_type") as string;
      return value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
  },
  {
    id: "cashback",
    accessorKey: "cashback",
    header: "Cashback Value",
    cell: ({ row }) => {
      const amount = Number(row.getValue("cashback"));
      const type = row.getValue("cashback_type") as string;
      return type.includes("percentage") ? `${amount}%` : `₹${amount}`;
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          row.getValue("status")
            ? "border-transparent bg-emerald-50 text-emerald-600"
            : "border-transparent bg-rose-50 text-rose-600"
        }`}
      >
        {row.getValue("status") ? "Active" : "Inactive"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
        <Pencil className="h-4 w-4" />
      </Button>
    ),
  },
];
