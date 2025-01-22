"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { liveTransactionColumns } from "./columns";
import { DataTable } from "./data-table";
import type { Transaction } from "./columns";
import PageContainer from "@/components/page-container";
import { Card, CardContent } from "@/components/ui/card";

const MAX_TRANSACTIONS = 100;

export default function LiveTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "");

    const handleConnect = () => setLoading(false);
    const handleNewTransaction = (newTransaction: Transaction) => {
      setTransactions(prev => [newTransaction, ...prev].slice(0, MAX_TRANSACTIONS));
    };
    const handleUpdateTransaction = (updatedTransaction: Transaction) => {
      setTransactions(prev => {
        const existingIndex = prev.findIndex(t => t.id === updatedTransaction.id);
        const updated = [...prev];
        if (existingIndex !== -1) {
          updated[existingIndex] = updatedTransaction;
        } else {
          updated.unshift(updatedTransaction);
        }
        return updated.slice(0, MAX_TRANSACTIONS);
      });
    };

    socket.on("connect", handleConnect);
    socket.on("transaction:create", handleNewTransaction);
    socket.on("transaction:update", handleUpdateTransaction);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("transaction:create", handleNewTransaction);
      socket.off("transaction:update", handleUpdateTransaction);
      socket.disconnect();
    };
  }, []);

  return (
    <PageContainer scrollable>
      <div className="space-y-2 pb-4 h-full">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Live Transactions
          </h2>
        </div>

        <div className="space-y-4">
          <Card className="border-none">
            <CardContent className="p-6">
              <DataTable
                columns={liveTransactionColumns}
                data={transactions}
                pageSizeOptions={[10, 20, 30, 50]}
                loading={loading}
                autoRefresh={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
