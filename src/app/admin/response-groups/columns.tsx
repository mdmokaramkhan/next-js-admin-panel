"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";

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