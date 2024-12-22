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
        <div className="w-8 h-8 rounded-md border bg-muted p-1">
          <img 
            src={`/images/${row.original.provider_details.provider_logo}`} 
            alt={row.original.provider_details.provider_name}
            className="w-full h-full object-contain"
          />
        </div>
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
      <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
        row.getValue("status") 
          ? "border-transparent bg-emerald-50 text-emerald-600" 
          : "border-transparent bg-rose-50 text-rose-600"
      }`}>
        {row.getValue("status") ? "Active" : "Inactive"}
      </div>
    )
  },
]
