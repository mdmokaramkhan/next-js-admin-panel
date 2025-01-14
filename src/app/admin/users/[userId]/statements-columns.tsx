"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export interface Statement {
  id: number;
  mobile_number: number;
  shop_name: string;
  amount: number;
  price: string;
  transaction_id: number | null;
  transfer_id: number | null;
  inbox_id: number | null;
  wallet_type: string;
  statement_type: number;
  balance: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const getStatementTypeInfo = (type: number) => {
  const typeMap = {
    1: { 
      label: "DEBIT", 
      variant: "destructive", 
      icon: "↑",
      description: "Money sent or deducted from account"
    },
    2: { 
      label: "CREDIT", 
      variant: "default", 
      icon: "↓",
      description: "Money received or added to account"
    },
    10: { 
      label: "TRANSACTION", 
      variant: "secondary", 
      icon: "→",
      description: "Service transaction"
    },
    20: { 
      label: "REVERTED", 
      variant: "outline", 
      icon: "↺",
      description: "Transaction reversed"
    },
  } as const;

  return typeMap[type as keyof typeof typeMap] || { 
    label: "OTHER", 
    variant: "default", 
    icon: "•",
    description: "Other type of transaction"
  };
};

export const statementColumns: ColumnDef<Statement>[] = [
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="space-y-1">
          <div className="whitespace-nowrap font-medium">
            {format(date, "dd MMM yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(date, "hh:mm:ss a")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const statement = row.original;
      return (
        <div className="space-y-1 min-w-[300px]">
          <div className="flex items-center gap-2">
            <p className="font-medium">{statement.description}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Service Charge: ₹{parseFloat(statement.price || '0').toLocaleString('en-IN', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {statement.transaction_id && (
              <Badge variant="outline" className="text-xs">
                TXN ID: {statement.transaction_id}
              </Badge>
            )}
            {statement.transfer_id && (
              <Badge variant="outline" className="text-xs">
                Transfer ID: {statement.transfer_id}
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "wallet_type",
    header: "Wallet",
    cell: ({ row }) => {
      const walletType = row.original.wallet_type;
      const walletColor = {
        rch_bal: "default",
        utility_bal: "secondary",
        dmt_bal: "outline"
      }[walletType] || "default";
      
      return (
        <Badge variant={walletColor as any} className="whitespace-nowrap">
          {walletType.replace('_', ' ').toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = row.original.amount;
      const typeInfo = getStatementTypeInfo(row.original.statement_type);
      const isTransactionDebit = row.original.statement_type === 10;
      const formattedAmount = Math.abs(amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      });
      
      return (
        <div className={`text-right font-medium whitespace-nowrap ${
          amount < 0 || isTransactionDebit ? 'text-destructive' : 'text-green-600'
        }`}>
          {typeInfo.icon} {formattedAmount}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Service Charge</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.original.price || '0');
      const formattedPrice = price.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      });
      
      return price > 0 ? (
        <div className="text-right font-medium text-muted-foreground whitespace-nowrap">
          {formattedPrice}
        </div>
      ) : (
        <div className="text-right text-muted-foreground">-</div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }) => {
      const balance = parseFloat(row.original.balance);
      const formattedBalance = balance.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
      
      return (
        <div className="text-right font-medium whitespace-nowrap">
          {formattedBalance}
        </div>
      );
    },
  },
  {
    accessorKey: "statement_type",
    header: "Type",
    cell: ({ row }) => {
      const typeInfo = getStatementTypeInfo(row.original.statement_type);
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={typeInfo.variant as any} className="whitespace-nowrap">
                {typeInfo.icon} {typeInfo.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{typeInfo.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
] as const;
