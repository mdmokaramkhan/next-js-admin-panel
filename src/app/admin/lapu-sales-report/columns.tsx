"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Wallet, BarChart3 } from "lucide-react";

type ProviderDetail = {
  provider_code: string;
  provider_name: string;
  provider_logo: string;
  provider_type: string;
  target_wallet: string;
};

export type LapuSale = {
  identifier: string;
  provider_details: ProviderDetail[];
  total_sales: number;
  total_r_offer: number;
  opening_balance: number;
  closing_balance: number;
  total_transactions: number;
  module_name: string;
  difference: number;
};

function ProviderTooltip({ provider }: { provider: ProviderDetail }) {
  return (
    <div className="space-y-1.5">
      <p className="font-semibold">{provider.provider_name}</p>
      <div className="text-xs space-y-1">
        <p>Code: {provider.provider_code}</p>
        <p>Type: {provider.provider_type}</p>
        <p>Wallet: {provider.target_wallet}</p>
      </div>
    </div>
  );
}

export const lapuSalesColumns: ColumnDef<LapuSale>[] = [
  {
    accessorKey: "module_name",
    header: "Module",
    cell: ({ row }) => (
      <div>
        <span className="text-sm font-medium truncate block">
          {row.original.module_name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "identifier",
    header: "Identifier",
    cell: ({ row }) => {
      const value = row.original.identifier;
      const isModuleId = value.startsWith('MODULE-');
      
      return (
        <div>
          <Badge variant={isModuleId ? "secondary" : "outline"} 
            className={`${isModuleId ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : 'text-gray-700'} truncate`}>
            {value}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "provider_details",
    header: "Service Providers",
    size: 300,
    cell: ({ row }) => {
      const providers = row.original.provider_details;
      const totalProviders = providers.length;
      const providerTypes = [...new Set(providers.map(p => p.provider_type))];
      const totalTransactions = row.original.total_transactions;
      
      return (
        <div className="flex flex-col space-y-2 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <TooltipProvider>
              <AvatarGroup className="justify-start flex-shrink-0">
                {providers.map((provider) => (
                  <Tooltip key={provider.provider_code}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-white ring-1 ring-gray-200 hover:ring-blue-400 transition-all duration-200">
                        <AvatarImage
                          src={`/images/${provider.provider_logo}`}
                          alt={provider.provider_name}
                          className="object-contain p-0.5"
                        />
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white p-3 shadow-xl">
                      <ProviderTooltip provider={provider} />
                    </TooltipContent>
                  </Tooltip>
                ))}
              </AvatarGroup>
            </TooltipProvider>

            <div className="flex flex-wrap items-center gap-1 min-w-0">
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                {totalProviders} Provider{totalProviders > 1 ? 's' : ''}
              </Badge>
              {providerTypes.map(type => (
                <Badge key={type} variant="outline" className="text-xs whitespace-nowrap">
                  {type}
                </Badge>
              ))}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="gap-1 cursor-help">
                      <BarChart3 className="h-3 w-3" />
                      <span className="tabular-nums">{totalTransactions.toLocaleString('en-IN')}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Total Transactions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "balance_flow",
    header: () => (
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        <span>Balance Flow</span>
      </div>
    ),
    cell: ({ row }) => {
      const { opening_balance, closing_balance, total_sales, total_r_offer } = row.original;
      
      return (
        <div className="w-full flex items-center justify-between px-1">
          {/* Opening Balance - Fixed width */}
          <div className="flex flex-col w-[120px]">
            <span className="text-[10px] uppercase text-muted-foreground">Opening</span>
            <span className="text-sm font-medium tabular-nums">₹{opening_balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>

          {/* Flow Arrows and Center Content - Reduced gaps */}
          <div className="flex-1 flex items-center justify-center gap-1.5">
            <span className="text-gray-300 shrink-0">→</span>
            
            {/* Sales Section - Reduced gaps */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-start shrink-0">
                <span className="text-[10px] uppercase text-muted-foreground">Sales</span>
                <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 text-sm mt-0.5">
                  <span className="tabular-nums font-medium">₹{total_sales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </Badge>
              </div>
              <div className="h-11 w-px bg-gray-200 shrink-0" />
              <div className="flex flex-col items-start shrink-0">
                <span className="text-[10px] uppercase text-muted-foreground">R-Offer</span>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-sm mt-0.5">
                  <span className="tabular-nums font-medium">₹{total_r_offer.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </Badge>
              </div>
            </div>
            
            <span className="text-gray-300 shrink-0">→</span>
          </div>

          {/* Closing Balance - Fixed width */}
          <div className="flex flex-col w-[120px]">
            <span className="text-[10px] uppercase text-muted-foreground">Closing</span>
            <span className="text-sm font-medium tabular-nums">₹{closing_balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "difference",
    header: () => "Net Difference",
    size: 160,
    cell: ({ row }) => {
      const diff = row.original.difference * -1;
      const isPositive = diff >= 0;
      const Icon = isPositive ? TrendingUp : TrendingDown;
      
      return (
        <div className="flex items-center justify-end gap-2 min-w-[140px]">
          <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${
            isPositive ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Icon className={`h-5 w-5 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
          <span className={`text-base font-semibold tabular-nums ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            ₹{Math.abs(diff).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>
      );
    },
  },
];
