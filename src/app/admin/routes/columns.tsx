import { ColumnDef } from "@tanstack/react-table"

// Type definitions based on your database schema
export interface Group {
  id: string
  group_code: string
  group_name: string
  group_panel: string
  group_child?: string
  group_description?: string
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
  cashback_type: "cashback_percentage" | "cashback_flat" | "surcharge_percentage" | "surcharge_flat";
  cashback: number;
  createdAt: string;
  updatedAt: string;
  provider_details: ProviderDetails;
}

// Column definitions for the cashback settings table
export const cashbackColumns: ColumnDef<CashbackSetting>[] = [
  {
    id: "provider_code",
    accessorKey: "provider_details.provider_name", // Changed to show provider name instead of code
    header: "Provider Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <img 
          src={`/images/${row.original.provider_details.provider_logo}`} 
          alt={row.original.provider_details.provider_name}
          className="w-6 h-6 object-contain"
        />
        <span>{row.original.provider_details.provider_name}</span>
      </div>
    )
  },
  {
    id: "cashback_type",
    accessorKey: "cashback_type",
    header: "Cashback Type",
    cell: ({ row }) => {
      const value = row.getValue("cashback_type") as string
      return value.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
    }
  },
  {
    id: "cashback",
    accessorKey: "cashback",
    header: "Cashback Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cashback"))
      const type = row.getValue("cashback_type") as string
      return type.includes("percentage") ? `${amount}%` : `₹${amount}`
    }
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className={`font-medium ${row.getValue("status") ? "text-green-600" : "text-red-600"}`}>
        {row.getValue("status") ? "Active" : "Inactive"}
      </div>
    )
  },
]
