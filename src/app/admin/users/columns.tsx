"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Wallet, Send, ArrowUpDown, ShieldAlert, Users2, UserCog, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { useState, useEffect } from "react";
import BalanceDialog from "./balance-dialog";
import { Badge } from "@/components/ui/badge";

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

export const statusOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

// Helper function to get initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get role icon and color
const getRoleIconAndColor = (code: string) => {
  switch(code) {
    case 'O':
      return { icon: ShieldAlert, color: 'text-red-500' };
    case 'A':
      return { icon: UserCog, color: 'text-green-500' };
    case 'D':
      return { icon: Users2, color: 'text-blue-500' };
    case 'U':
      return { icon: User, color: 'text-yellow-500' };
    default:
      return { icon: User, color: 'text-gray-500' };
  }
};

// Responsive column visibility configuration
export const defaultVisibleColumns = {
  xs: ["select", "shop_name", "status", "actions"],
  sm: ["select", "shop_name", "owner_name", "status", "actions"],
  md: ["select", "shop_name", "owner_name", "groupDetails.group_name", "rch_bal", "status", "actions"],
  lg: ["select", "shop_name", "owner_name", "groupDetails.group_name", "rch_bal", "status", "mobile_number", "actions"],
  xl: ["select", "shop_name", "owner_name", "groupDetails.group_name", "rch_bal", "status", "mobile_number", "actions"],
};

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
    accessorKey: "shop_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent whitespace-nowrap"
        >
          Display Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const shopName = row.getValue("shop_name") as string;
      const profilePic = row.original.profile_pic;
      const ownerName = row.original.owner_name;
      
      return (
        <div className="flex items-center gap-2 min-w-[200px]">
          <Avatar className="h-8 w-8 shrink-0">
            {profilePic ? (
              <AvatarImage src={profilePic} alt={ownerName} />
            ) : (
              <AvatarFallback>{getInitials(ownerName)}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium truncate">{shopName ?? "N/A"}</span>
            <span className="text-xs text-muted-foreground md:hidden">{ownerName}</span>
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "owner_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent whitespace-nowrap"
        >
          Person Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="hidden md:block">
        {row.getValue("owner_name")}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "groupDetails.group_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const groupName = row.original.groupDetails?.group_name;
      const groupCode = row.original.group_code;
      const { icon: Icon, color } = getRoleIconAndColor(groupCode);
      
      return (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span>{groupName ?? "Not Set"}</span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "rch_bal",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const balance = Number(row.getValue("rch_bal"));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(balance);
      
      return (
        <div className={`font-medium ${balance < 0 ? 'text-red-500' : balance < 100 ? 'text-yellow-500' : 'text-green-500'}`}>
          {formatted}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = Number(rowA.getValue(columnId));
      const b = Number(rowB.getValue(columnId));
      return a < b ? -1 : a > b ? 1 : 0;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row, table }) => {
      const [status, setStatus] = useState<boolean>(row.original.status);
      
      // Update status when row data changes (e.g., due to filtering)
      useEffect(() => {
        setStatus(row.original.status);
      }, [row.original.status]);

      const handleStatusChange = async (newStatus: boolean) => {
        const id = row.original.id;
        const loadingToast = toast.loading("Updating status...");
        try {
          const response = await apiRequest(
            `/users/${id}`,
            "PUT",
            { id, status: newStatus }
          );
          if (response.success) {
            setStatus(newStatus);
            // Update the original data
            row.original.status = newStatus;
            toast.success("User status updated successfully!", {
              id: loadingToast,
            });
          } else {
            toast.error("Failed to update status", {
              id: loadingToast,
            });
          }
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Error updating status"
          );
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={status}
            onCheckedChange={handleStatusChange}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "mobile_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Phone Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => "+91" + row.getValue("mobile_number"),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "email_address",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.getValue("email_address"),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "parent_number",
    header: "Parent Number",
    cell: ({ row }) => {
      const parentNumber = row.getValue("parent_number");
      return parentNumber ? "+91" + parentNumber : "N/A";
    },
    enableHiding: true,
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("address");
      return address || "N/A";
    },
    enableHiding: true,
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
    cell: ({ row }) => {
      const ipAddress = row.getValue("ip_address");
      return ipAddress || "N/A";
    },
    enableHiding: true,
  },
  {
    accessorKey: "callback_url",
    header: "Callback URL",
    cell: ({ row }) => {
      const callbackUrl = row.getValue("callback_url");
      return callbackUrl || "N/A";
    },
    enableHiding: true,
  },
  {
    accessorKey: "failedLoginAttempts",
    header: "Failed Logins",
    cell: ({ row }) => row.getValue("failedLoginAttempts"),
    enableHiding: true,
  },
  {
    accessorKey: "tokenVersion",
    header: "Token Version",
    cell: ({ row }) => row.getValue("tokenVersion"),
    enableHiding: true,
  },
  {
    accessorKey: "rch_min_bal",
    header: "Min. Recharge Balance",
    cell: ({ row }) => {
      const minBal = row.getValue("rch_min_bal");
      return <div className="font-medium">₹{Number(minBal).toFixed(2)}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "utility_min_bal",
    header: "Min. Utility Balance",
    cell: ({ row }) => {
      const minBal = row.getValue("utility_min_bal");
      return <div className="font-medium">₹{Number(minBal).toFixed(2)}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "dmt_min_bal",
    header: "Min. DMT Balance",
    cell: ({ row }) => {
      const minBal = row.getValue("dmt_min_bal");
      return <div className="font-medium">₹{Number(minBal).toFixed(2)}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return date ? new Date(date).toLocaleString() : "N/A";
    },
    enableHiding: true,
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      return date ? new Date(date).toLocaleString() : "N/A";
    },
    enableHiding: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const balances = {
        userInfo: {
          name: row.original.owner_name,
          shopName: row.original.shop_name ?? null,
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
        <div className="flex items-center gap-1">
          <CellAction data={row.original} />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            className="h-8 w-8"
          >
            <Wallet className="h-4 w-4" />
          </Button>
          <BalanceDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            balances={balances}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const event = new CustomEvent('openTransferDialog', {
                      detail: { mobileNumber: row.original.mobile_number }
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send Money</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    enableHiding: false,
  },
];
