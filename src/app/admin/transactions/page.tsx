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
import { CalendarIcon, BarChart3, RefreshCcw, Search, PhoneCall, Store, User } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatsDialog from "./components/stats-dialog";
import { Input } from "@/components/ui/input";

// Update the constants to match the actual status codes
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "10", label: "Success" },
  { value: "0,5,7,8,9", label: "Pending" },
  { value: "20,21,22,23", label: "Failed" },
];

export default function TransactionPage() {
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date(),
  });
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!date.from || !date.to) {
      setLoading(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
      });

      const response = await apiRequest(
        `transactions/date-range?${queryParams.toString()}`,
        "GET"
      );
      if (response.success) {
        setRawTransactions(response.data || []);
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
  }, [date.from, date.to]); // Only depend on dates

  // New effect for filtering with correct type checking
  useEffect(() => {
    const filterTransactions = () => {
      let filtered = [...rawTransactions];

      if (selectedStatus !== "all") {
        const statusCodes = selectedStatus.split(",").map(Number);
        filtered = filtered.filter(transaction => 
          statusCodes.includes(transaction.status)
        );
      }

      setFilteredTransactions(filtered);
    };

    filterTransactions();
  }, [rawTransactions, selectedStatus]);

  useEffect(() => {
    if (date.from && date.to) {
      setLoading(true);
      fetchTransactions();
    }
  }, [fetchTransactions, date.from, date.to]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: format(date.from!, "yyyy-MM-dd"),
        endDate: format(date.to!, "yyyy-MM-dd"),
      });

      const response = await apiRequest(
        `transactions/date-range?${queryParams.toString()}`,
        "GET"
      );
      if (response.success) {
        setRawTransactions(response.data || []);
      } else {
        toast.warning("Transactions not loaded properly!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch transactions."
      );
    } finally {
      setRefreshing(false);
    }
  }, [date.from, date.to]);

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
            <Heading
              title="Transactions"
              description="View and manage all your transactions here."
            />
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              {/* Modify Refresh Button */}
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="gap-2"
                disabled={refreshing}
              >
                <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                Refresh
              </Button>

              {/* Stats Button */}
              <Button
                variant="outline"
                onClick={() => setIsStatsOpen(true)}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Statistics
              </Button>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px] min-w-[140px]">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
          </div>
        </div>

        <Separator />
        <DataTable
          columns={transactionColumns}
          data={filteredTransactions}
          pageSizeOptions={[10, 20, 50]}
          loading={loading && !refreshing} // Only show loading state for initial load
          onFilter={setFilteredTransactions}
        />
        
        {/* Stats Dialog */}
        <StatsDialog
          open={isStatsOpen}
          onOpenChange={setIsStatsOpen}
          transactions={rawTransactions}
        />
      </div>
    </PageContainer>
  );
}
