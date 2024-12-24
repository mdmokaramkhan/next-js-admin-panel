"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertCircle, Wallet, Send } from "lucide-react";
import { CellAction } from "./cell-action";
import { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import BalanceDialog from "./balance-dialog";

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
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [status, setStatus] = useState<boolean>(initialStatus);

      // Function to update the user status (with error handling)
      const handleStatusChange = async (newStatus: boolean) => {
        const id = row.original.id; // Assuming the user has an id
        setStatus(newStatus); // Optimistic UI update (changes immediately on toggle)
        const loadingToast = toast.loading("Updating status...");
        try {
          const response = await apiRequest(
            `/users/${id}`, // Replace with your actual API endpoint
            "PUT",
            { id, status: newStatus }
          );
          if (response.success) {
            toast.success("User status updated successfully!", {
              id: loadingToast,
            });
          } else {
            toast.error("Failed to update status", {
              id: loadingToast,
            });
            setStatus(initialStatus); // Revert to the previous status on failure
          }
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Error fetching users"
          );
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
    header: "Balance",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const balances = {
        userInfo: {
          name: row.original.owner_name,
          shopName: row.original.shop_name ?? null, // Convert undefined to null
          mobile: row.original.mobile_number,
          role: row.original.groupDetails?.group_name || "N/A",
        },
        rch_bal: row.original.rch_bal,
        rch_min_bal: row.original.rch_min_bal,
        utility_bal: row.original.utility_bal,
        utility_min_bal: row.original.utility_min_bal,
        dmt_bal: row.original.dmt_bal,
        dmt_min_bal: row.original.dmt_min_bal,
      };

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Wallet className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="p-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Recharge:</span>
                    <span>₹{row.original.rch_bal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Utility:</span>
                    <span>₹{row.original.utility_bal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">DMT:</span>
                    <span>₹{row.original.dmt_bal.toLocaleString()}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("openTransferDialog", {
                  detail: {
                    userId: row.original.id,
                    mobileNumber: row.original.mobile_number,
                  },
                })
              );
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
          <BalanceDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            balances={balances}
          />
        </div>
      );
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
