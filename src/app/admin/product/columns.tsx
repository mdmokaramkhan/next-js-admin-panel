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

// Filter Options
export const providerOptions = [
  { value: "Prepaid", label: "Prepaid" },
  { value: "DTH", label: "DTH" },
  { value: "Electricity", label: "Electricity" },
];
// Filter Options
export const walletOptions = [
  { value: "rch_bal", label: "RCH Wallet" },
  { value: "utility_bal", label: "Utility Wallet" },
  { value: "dmt_bal", label: "DMT Wallet" },
];

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
    accessorKey: "provider_name", // Corresponds to the `provider_name` field
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const providerName = row.getValue("provider_name");
      return providerName;
    },
  },
  {
    header: "Provider Code",
    accessorKey: "provider_code", // Corresponds to the `provider_code` field in the model
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const providerCode = row.getValue("provider_code");
      return providerCode;
    },
  },
  {
    header: "Provider Type",
    accessorKey: "provider_type", // Corresponds to the `provider_type` field
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const providerType = row.getValue("provider_type");
      return providerType;
    },
  },
  {
    header: "Status",
    accessorKey: "status", // Corresponds to the `status` field
    cell: ({ row }: { row: { getValue: (key: string) => boolean } }) => {
      const status = row.getValue("status");
      return <Switch checked={status} id="airplane-mode" />
      // return status ? "Active" : "Inactive"; // Display friendly text
    },
  },
  {
    header: "Maximum Amount",
    accessorKey: "min_amount", // Corresponds to `min_amount`
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const minAmount = row.getValue("min_amount");
      return `₹ ${minAmount}.00`; // Example format: "$100"
    },
  },
  {
    header: "Minimum Amount",
    accessorKey: "max_amount", // Corresponds to `max_amount`
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const maxAmount = row.getValue("max_amount");
      return `₹ ${maxAmount}.00`; // Example format: "$5000"
    },
  },
  {
    header: "Blocked Amount",
    accessorKey: "blocked_amount", // Corresponds to `blocked_amount`
    cell: ({ row }: { row: { getValue: (key: string) => string | null } }) => {
      const blockedAmount = row.getValue("blocked_amount");
      return blockedAmount ?? "N/A"; // Handle null values
    },
  },
  // {
  //   header: "Min Length",
  //   accessorKey: "min_length", // Corresponds to `min_length`
  //   cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
  //     const minLength = row.getValue("min_length");
  //     return minLength;
  //   },
  // },
  // {
  //   header: "Max Length",
  //   accessorKey: "max_length", // Corresponds to `max_length`
  //   cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
  //     const maxLength = row.getValue("max_length");
  //     return maxLength;
  //   },
  // },
  {
    header: "Target Wallet",
    accessorKey: "target_wallet", // Corresponds to `target_wallet`
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const targetWallet = row.getValue("target_wallet");
      return targetWallet === "rch_bal"
        ? "RCH"
        : targetWallet === "utility_bal"
        ? "Utility"
        : "DMT"; // Map ENUM values to readable text
    },
  },
  {
    header: "",
    accessorKey: "actions",
    id: "actions",
    cell: ({ row }: { row: any }) => <CellAction data={row.original} />,
  },
];
