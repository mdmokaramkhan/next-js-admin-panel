"use client";
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const Transactions = () => {
  interface Transaction {
    id: string;
    ip_address: string;
    provider_code: string;
    number: string;
    amount: number;
    price: number;
    mobile_number: string;
    shop_name: string;
    module_name?: string;
    module_id?: string;
    status: number; // Changed from string to number
    sn: string;
    lapu_id: string;
    lapu_bal: number;
    r_offer: string;
    ref_id: string;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusBadge = (status: number) => {
    const statusConfig: Record<number, { label: string; color: string, emoji: string }> = {
      0: { label: 'Not Process', color: 'bg-slate-400', emoji: '⏸️' },
      5: { label: 'No Parsing', color: 'bg-slate-500', emoji: '⏹️' },
      7: { label: 'Processing', color: 'bg-blue-500', emoji: '⏳' },
      8: { label: 'Process Failed', color: 'bg-red-400', emoji: '❌' },
      9: { label: 'Waiting Response', color: 'bg-yellow-500', emoji: '🔄' },
      10: { label: 'Successful', color: 'bg-green-500', emoji: '✅' },
      20: { label: 'Failed', color: 'bg-red-500', emoji: '❌' },
      21: { label: 'Wrong Number', color: 'bg-red-500', emoji: '❎' },
      22: { label: 'Invalid Amount', color: 'bg-red-500', emoji: '🚫' },
      23: { label: 'Provider Down', color: 'bg-orange-500', emoji: '⚠️' }
    };

    const config = statusConfig[status] || { label: 'Unknown', color: 'bg-gray-500', emoji: '❓' };

    return (
      <Badge variant="secondary" className={`${config.color} flex items-center gap-1`}>
        <span>{config.emoji}</span>
        <span>{config.label}</span>
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL);

    socket.on('connect', () => setLoading(false));

    socket.on('transaction:create', (newTransaction) => {
      setTransactions((prev) => [...prev, newTransaction]); // Add new transaction
    });

    socket.on('transaction:update', (updatedTransaction) => {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        )
      ); // Update transaction
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Live Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Live Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SN</TableHead>
                  <TableHead>Lapu ID</TableHead>
                  <TableHead className="text-right">Lapu Balance</TableHead>
                  <TableHead className="text-right">R Offer</TableHead>
                  <TableHead>Ref ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="h-24 text-center">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.ip_address}</TableCell>
                      <TableCell>{transaction.provider_code}</TableCell>
                      <TableCell>{transaction.number}</TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.price)}</TableCell>
                      <TableCell>{transaction.mobile_number}</TableCell>
                      <TableCell>{transaction.shop_name}</TableCell>
                      <TableCell>{transaction.module_name && `${transaction.module_name} (${transaction.module_id})`}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{transaction.sn}</TableCell>
                      <TableCell>{transaction.lapu_id}</TableCell>
                      <TableCell className="text-right">{transaction.lapu_bal ? formatCurrency(transaction.lapu_bal) : '-'}</TableCell>
                      <TableCell className="text-right">{transaction.r_offer || '-'}</TableCell>
                      <TableCell>{transaction.ref_id}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Transactions;
