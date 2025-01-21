"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pause, StopCircle, Hourglass, X, RefreshCw, Check, Ban, AlertTriangle } from "lucide-react";

export type ResponseGroup = {
  id?: number;
  group_name: string;
  txt_required: string;
  txt_not_required: string | null;
  txt_b_number: string;
  txt_a_number: string;
  txt_b_amount: string;
  txt_a_amount: string;
  txt_b_sn: string | null;
  txt_a_sn: string | null;
  txt_b_refid: string | null;
  txt_a_refid: string | null;
  status_code: number;
  txt_b_module_bal: string;
  txt_a_module_bal: string;
  txt_b_lapu_id: string | null;
  txt_a_lapu_id: string | null;
  txt_b_roffer: string | null;
  txt_a_roffer: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const getStatusInfo = (status: number) => {
  const statusMap = {
    // Not Started / Neutral States
    0: {
      label: "Not Process",
      icon: <Pause size={16} />,
      variant: "secondary",
      color: "bg-gray-100 text-gray-700 border-gray-200"
    },
    5: {
      label: "No Parsing",
      icon: <StopCircle size={16} />,
      variant: "secondary",
      color: "bg-gray-100 text-gray-700 border-gray-200"
    },
    // Processing/Pending States
    7: {
      label: "Processing",
      icon: <Hourglass size={16} className="animate-spin" />,
      variant: "secondary",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200"
    },
    8: {
      label: "Process Failed",
      icon: <Pause size={16} />,
      variant: "secondary",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200"
    },
    9: {
      label: "Waiting Response",
      icon: <RefreshCw size={16} className="animate-spin" />,
      variant: "secondary",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200"
    },
    // Success State
    10: {
      label: "Successful",
      icon: <Check size={16} />,
      variant: "secondary",
      color: "bg-green-100 text-green-700 border-green-200"
    },
    // Error States
    20: {
      label: "Failed",
      icon: <X size={16} />,
      variant: "secondary",
      color: "bg-red-100 text-red-700 border-red-200"
    },
    21: {
      label: "Wrong Number",
      icon: <Ban size={16} />,
      variant: "secondary",
      color: "bg-red-100 text-red-700 border-red-200"
    },
    22: {
      label: "Invalid Amount",
      icon: <Ban size={16} />,
      variant: "secondary",
      color: "bg-red-100 text-red-700 border-red-200"
    },
    23: {
      label: "Provider Down",
      icon: <AlertTriangle size={16} />,
      variant: "secondary",
      color: "bg-red-100 text-red-700 border-red-200"
    }
  } as const;

  return (
    statusMap[status as keyof typeof statusMap] || {
      label: "Unknown",
      icon: null,
      variant: "secondary",
      color: "bg-gray-100 text-gray-700 border-gray-200"
    }
  );
};

export const columns: ColumnDef<ResponseGroup>[] = [
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
    header: "Group Name",
    accessorKey: "group_name",
  },
  {
    header: "Required Text",
    accessorKey: "txt_required",
  },
  {
    header: "Not Required Text",
    accessorKey: "txt_not_required",
    cell: ({ row }) => row.getValue("txt_not_required") || "N/A",
  },
  {
    header: "Before Number",
    accessorKey: "txt_b_number",
  },
  {
    header: "After Number",
    accessorKey: "txt_a_number",
  },
  {
    header: "Before Amount",
    accessorKey: "txt_b_amount",
  },
  {
    header: "After Amount",
    accessorKey: "txt_a_amount",
  },
  {
    header: "Before SN",
    accessorKey: "txt_b_sn",
    cell: ({ row }) => row.getValue("txt_b_sn") || "N/A",
  },
  {
    header: "After SN",
    accessorKey: "txt_a_sn",
    cell: ({ row }) => row.getValue("txt_a_sn") || "N/A",
  },
  {
    header: "Before RefID",
    accessorKey: "txt_b_refid",
    cell: ({ row }) => row.getValue("txt_b_refid") || "N/A",
  },
  {
    header: "After RefID",
    accessorKey: "txt_a_refid",
    cell: ({ row }) => row.getValue("txt_a_refid") || "N/A",
  },
  {
    header: "Status Code",
    accessorKey: "status_code",
    cell: ({ row }) => {
      const status = row.original.status_code;
      const statusInfo = getStatusInfo(status);
      return (
        <Badge 
          variant="secondary"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border ${statusInfo.color}`}
        >
          {statusInfo.icon} {statusInfo.label}
        </Badge>
      );
    }
  },
  {
    header: "Before Module Balance",
    accessorKey: "txt_b_module_bal",
  },
  {
    header: "After Module Balance",
    accessorKey: "txt_a_module_bal",
  },
  {
    header: "Before LAPU ID",
    accessorKey: "txt_b_lapu_id",
    cell: ({ row }) => row.getValue("txt_b_lapu_id") || "N/A",
  },
  {
    header: "After LAPU ID",
    accessorKey: "txt_a_lapu_id",
    cell: ({ row }) => row.getValue("txt_a_lapu_id") || "N/A",
  },
  {
    header: "Before Roffer",
    accessorKey: "txt_b_roffer",
    cell: ({ row }) => row.getValue("txt_b_roffer") || "N/A",
  },
  {
    header: "After Roffer",
    accessorKey: "txt_a_roffer",
    cell: ({ row }) => row.getValue("txt_a_roffer") || "N/A",
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  }
];