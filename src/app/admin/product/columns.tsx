"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

export type Product = {
  id?: number; // Optional, typically Sequelize auto-generates this
  status: boolean;
  provider_code: string;
  provider_name: string;
  provider_type: string;
  provider_logo: string;
  min_amount: number;
  max_amount: number;
  blocked_amount?: string | null; // Optional
  min_length: number;
  max_length: number;
  target_wallet: "rch_bal" | "utility_bal" | "dmt_bal"; // Enum values
  createdAt?: Date; // Optional, Sequelize auto-handles this
  updatedAt?: Date; // Optional, Sequelize auto-handles this
};

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }: { table: any }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }: { row: any }) => (
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
    header: "Provider Name",
    accessorKey: "provider_name",
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => row.getValue("provider_name"),
  },
  {
    header: "Provider Code",
    accessorKey: "provider_code",
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => row.getValue("provider_code"),
  },
  {
    header: "Provider Type",
    accessorKey: "provider_type",
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => row.getValue("provider_type"),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }: { row: { getValue: (key: string) => boolean } }) => (
      <Switch checked={row.getValue("status")} id="airplane-mode" />
    ),
  },
  {
    header: "Minimum Amount",
    accessorKey: "min_amount",
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => `₹ ${row.getValue("min_amount")}.00`,
  },
  {
    header: "Maximum Amount",
    accessorKey: "max_amount",
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => `₹ ${row.getValue("max_amount")}.00`,
  },
  {
    header: "Blocked Amount",
    accessorKey: "blocked_amount",
    cell: ({ row }: { row: { getValue: (key: string) => string | null } }) => row.getValue("blocked_amount") ?? "N/A",
  },
  {
    header: "Target Wallet",
    accessorKey: "target_wallet",
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const targetWallet = row.getValue("target_wallet");
      return targetWallet === "rch_bal" ? "RCH" : targetWallet === "utility_bal" ? "Utility" : "DMT";
    },
  },
  {
    header: "",
    accessorKey: "actions",
    id: "actions",
    cell: ({ row }: { row: any }) => <CellAction data={row.original} />,
  },
];

