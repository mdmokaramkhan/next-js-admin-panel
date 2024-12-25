"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { columns, type Transaction } from "./columns";
import { DataTable } from "./data-table";

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL);

    socket.on("connect", () => setLoading(false));

    socket.on("transaction:create", (newTransaction) => {
      setTransactions((prev) => [newTransaction, ...prev]);
    });

    socket.on("transaction:update", (updatedTransaction) => {
      setTransactions((prev) => {
        const existingTransactionIndex = prev.findIndex(
          (transaction) => transaction.id === updatedTransaction.id
        );

        if (existingTransactionIndex !== -1) {
          const newTransactions = [...prev];
          newTransactions[existingTransactionIndex] = updatedTransaction;
          return newTransactions;
        } else {
          return [updatedTransaction, ...prev];
        }
      });
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
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={transactions}
          pageSizeOptions={[10, 20, 50]}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
};

export default Transactions;
