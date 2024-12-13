"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertCircle } from "lucide-react";
import { CellAction } from "./cell-action";
import { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

export type GroupDetails = {
  id: string;
  group_code: string;
  group_name: string;
  group_panel: string;
  group_child: string | null;
  group_description: string | null;
};

export type User = {
  id?: number; // Sequelize automatically adds an 'id' field by default unless otherwise specified
  status: boolean;
  isVerified: boolean;
  shop_name?: string | null;
  owner_name: string;
  profile_pic?: string | null;
  rch_bal: number;
  rch_min_bal: number;
  utility_bal: number;
  utility_min_bal: number;
  dmt_bal: number;
  dmt_min_bal: number;
  parent_number?: number | null;
  address?: string | null;
  mobile_number: number;
  email_address: string;
  group_code: string;
  groupDetails: GroupDetails;
  ip_address?: string | null;
  callback_url?: string | null;
  failedLoginAttempts: number;
  tokenVersion: number;
  createdAt?: Date; // Sequelize adds createdAt by default
  updatedAt?: Date; // Sequelize adds updatedAt by default
};

// Filter Options
export const roleOptions = [
  { value: "O", label: "Admin" },
  { value: "A", label: "Agent" },
  { value: "D", label: "Distributor" },
  { value: "U", label: "Users" },
];

// Columns
export const columns: ColumnDef<User>[] = [
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
    header: "Display Name",
    accessorKey: "shop_name",
    cell: ({ row }: { row: { getValue: (key: string) => string | null } }) => {
      const shopName = row.getValue("shop_name");
      return shopName ?? "N/A";
    },
  },
  {
    header: "Person Name",
    accessorKey: "owner_name",
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const ownerName = row.getValue("owner_name");
      return ownerName;
    },
  },
  {
    header: "Email",
    accessorKey: "email_address",
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const emailAddress = row.getValue("email_address");
      return emailAddress;
    },
  },
  {
    header: "Phone Number",
    accessorKey: "mobile_number",
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const mobileNumber = row.getValue("mobile_number");
      return "+91" + mobileNumber;
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({
      row,
    }: {
      row: { getValue: (key: string) => boolean; original: User };
    }) => {
      const initialStatus = row.getValue("status");

      // Use state to handle the toggle locally
      const [status, setStatus] = useState<boolean>(initialStatus);

      // Function to update the user status (with error handling)
      const handleStatusChange = async (newStatus: boolean) => {
        const id = row.original.id; // Assuming the user has an id
        setStatus(newStatus); // Optimistic UI update (changes immediately on toggle)

        try {
          const response = await apiRequest(
            "updateUser", // Replace with your actual API endpoint
            "POST",
            { id, status: newStatus }
          );
          if (response.success) {
            toast.success("User status updated successfully!");
          } else {
            toast.error("Failed to update status.");
            setStatus(initialStatus); // Revert to the previous status on failure
          }
        } catch (error) {
          toast.error("Error updating status.");
          setStatus(initialStatus); // Revert to the previous status on error
        }
      };

      return (
        <Switch
          checked={status}
          onCheckedChange={(value) => handleStatusChange(!!value)} // Toggle and handle status change
          id="airplane-mode"
          className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out
            bg-gray-300 dark:bg-gray-700
            data-[state=checked]:bg-green-600
            data-[state=unchecked]:bg-gray-300
            dark:data-[state=checked]:bg-green-700
            dark:data-[state=unchecked]:bg-gray-600"
        />
      );
    },
  },
  {
    header: "Role",
    cell: ({
      row,
    }: {
      row: { original: { groupDetails: { group_name: string } } };
    }) => {
      const groupName = row.original.groupDetails?.group_name;
      return groupName ?? "Not Set";
    },
  },
  {
    header: "Recharge",
    accessorKey: "rch_bal",
    cell: ({ row }: { row: { getValue: (key: string) => number | null } }) => {
      const balance = row.getValue("rch_bal");
      if (balance === null || balance === undefined) {
        return "Not Set";
      }
      const formattedBalance = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
      }).format(balance);

      return formattedBalance;
    },
  },
  {
    header: "Utility",
    accessorKey: "utility_bal",
    cell: ({ row }: { row: { getValue: (key: string) => number | null } }) => {
      const balance = row.getValue("utility_bal");
      if (balance === null || balance === undefined) {
        return "Not Set";
      }
      const formattedBalance = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
      }).format(balance);

      return formattedBalance;
    },
  },
  {
    header: "DMT",
    accessorKey: "dmt_bal",
    cell: ({ row }: { row: { getValue: (key: string) => number | null } }) => {
      const balance = row.getValue("dmt_bal");
      if (balance === null || balance === undefined) {
        return "Not Set";
      }
      const formattedBalance = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
      }).format(balance);

      return formattedBalance;
    },
  },
  {
    header: "KYC",
    accessorKey: "isVerified",
    cell: ({ row }: { row: { getValue: (key: string) => boolean } }) => {
      const isVerified = row.getValue("isVerified");

      return isVerified ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-yellow-500" />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => <CellAction data={row.original} />,
  },
];
