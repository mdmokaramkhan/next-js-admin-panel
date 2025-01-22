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
    accessorKey: "identifier",
    header: "Module Information",
    cell: ({ row }) => {
      const value = row.original.identifier;
      const isModuleId = value.startsWith('MODULE-');
      
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium min-w-0 truncate">
            {row.original.module_name}
          </span>
          {isModuleId ? (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 shrink-0">
              {value}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-base text-gray-700 shrink-0">
              {value}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "metrics",
    header: () => (
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        <span>Transaction Metrics</span>
      </div>
    ),
    cell: ({ row }) => {
      const metrics = [
        { label: "Total Volume", value: row.original.total_sales, prefix: "₹" },
        { label: "Transactions", value: row.original.total_transactions }
      ];

      return (
        <Card className="p-2 border-dashed">
          <div className="grid grid-cols-2 gap-2 text-center">
            {metrics.map((metric, i) => (
              <div key={i} className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {metric.label}
                </p>
                <p className="text-sm font-bold">
                  {metric.prefix && metric.prefix}
                  {typeof metric.value === 'number' 
                    ? metric.value.toLocaleString('en-IN', { 
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2
                      })
                    : metric.value}
                </p>
              </div>
            ))}
          </div>
        </Card>
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
      const openingBal = row.original.opening_balance;
      const closingBal = row.original.closing_balance;
      const balanceChange = ((closingBal - openingBal) / openingBal) * 100;
      const isPositive = balanceChange >= 0;
      
      return (
        <Card className="p-2 border-dashed">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Opening</p>
                <p className="text-sm font-bold">₹{openingBal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Closing</p>
                <p className="text-sm font-bold">₹{closingBal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </Card>
      );
    },
  },
  {
    accessorKey: "provider_details",
    header: "Service Providers",
    cell: ({ row }) => {
      const providers = row.original.provider_details;
      const totalProviders = providers.length;
      const providerTypes = [...new Set(providers.map(p => p.provider_type))];
      
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
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "difference",
    header: "Net Difference",
    cell: ({ row }) => {
      const diff = row.original.difference * -1;
      const isPositive = diff >= 0;
      const Icon = isPositive ? TrendingUp : TrendingDown;
      
      return (
        <Card className={`p-2 border-dashed ${
          isPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`} />
              <span className={`font-bold ${
                isPositive ? 'text-green-700' : 'text-red-700'
              }`}>
                ₹{Math.abs(diff).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>
      );
    },
  },
];
