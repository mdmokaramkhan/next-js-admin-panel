import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

// Add types for transfer data
export interface Transfer {
  id: number;
  ip_address: string;
  mobile_number: string;
  shop_name: string;
  amount: number;
  end_mobile_number: string;
  end_shop_name: string;
  transfer_type: string;
  target_wallet: string;
  balance: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}


// Add transfer columns
export const transferColumns: ColumnDef<Transfer, unknown>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }: { row: { original: Transfer } }) =>
      format(new Date(row.original.createdAt), "PPP"),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }: { row: { original: Transfer } }) =>
      `₹${row.original.amount.toLocaleString()}`,
  },
  {
    accessorKey: "end_shop_name",
    header: "Recipient",
  },
  {
    accessorKey: "end_mobile_number",
    header: "Recipient Mobile",
  },
  {
    accessorKey: "target_wallet",
    header: "Wallet",
    cell: ({ row }: { row: { original: Transfer } }) =>
      row.original.target_wallet.replace("_bal", "").toUpperCase(),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
] as const;