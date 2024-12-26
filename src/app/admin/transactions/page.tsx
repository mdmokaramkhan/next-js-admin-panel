"use client";

import PageContainer from "@/components/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useCallback } from "react";
import { Transaction, transactionColumns } from "./columns";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { DataTable } from "./data-table";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import io from "socket.io-client";

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date(),
  });

  const fetchTransactions = useCallback(async () => {
    // Only proceed if both dates are selected
    if (!date.from || !date.to) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest(
        `transactions/date-range?startDate=${format(date.from, "yyyy-MM-dd")}&endDate=${format(date.to, "yyyy-MM-dd")}`,
        "GET"
      );
      if (response.success) {
        setTransactions(response.data || []);
      } else {
        toast.warning("Transactions not loaded properly!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch transactions."
      );
    } finally {
      setLoading(false);
    }
  }, [date.from, date.to]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL);

    socket.on("transaction:create", (newTransaction) => {
      // Only add if within date range
      if (date.from && date.to) {
        const transactionDate = new Date(newTransaction.createdAt);
        if (transactionDate >= date.from && transactionDate <= date.to) {
          setTransactions((prev) => [newTransaction, ...prev]);
        }
      }
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
        }
        return prev;
      });
    });

    // Fetch initial data when dates are set
    if (date.from && date.to) {
      setLoading(true);
      fetchTransactions();
    }

    return () => {
      socket.disconnect();
    };
  }, [fetchTransactions, date.from, date.to]);

  useEffect(() => {
    // Only fetch if both dates are selected
    if (date.from && date.to) {
      setLoading(true);
      fetchTransactions();
    }
  }, [fetchTransactions, date.from, date.to]);

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Transactions"
            description="View and manage all your transactions here."
          />
          {/* Date range picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(range) =>
                  setDate({ from: range?.from, to: range?.to })
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Separator />
        <DataTable
          columns={transactionColumns}
          data={transactions}
          pageSizeOptions={[10, 20, 50]}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
}
