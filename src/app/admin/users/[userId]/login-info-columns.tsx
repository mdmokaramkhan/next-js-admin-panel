"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Smartphone } from "lucide-react";

export interface LoginInfo {
  id: number;
  userId: number;
  deviceId: string;
  deviceBrand: string;
  deviceModel: string;
  deviceVersion: string;
  osVersion: string;
  browserName: string | null;
  browserVersion: string | null;
  loginTimestamp: string;
  ipAddress: string;
  location: string | null;
  status: string;
  loginMethod: string;
}

export const loginInfoColumns: ColumnDef<LoginInfo>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "loginTimestamp",
    header: "Login Date",
    cell: ({ row }) => format(new Date(row.original.loginTimestamp), "PPp"),
  },
  {
    accessorKey: "device",
    header: "Device Info",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          <span className="font-medium capitalize">
            {row.original.deviceBrand} {row.original.deviceModel}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Android {row.original.osVersion} ({row.original.deviceVersion})
        </span>
      </div>
    ),
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
  },
  {
    accessorKey: "loginMethod",
    header: "Method",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.loginMethod}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge 
        variant={row.original.status === "success" ? "success" : "destructive"}
      >
        {row.original.status}
      </Badge>
    ),
  },
];
