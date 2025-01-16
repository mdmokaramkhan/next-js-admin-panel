"use client";

import PageContainer from "@/components/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useCallback } from "react";
import { Transfer, transferColumns } from "./columns";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { DataTable } from "./data-table";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, RefreshCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export default function TransferPage() {
  const [rawTransfers, setRawTransfers] = useState<Transfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date(),
  });

  const fetchTransfers = useCallback(async () => {
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
        `transfers/date-range?${queryParams.toString()}`,
        "GET"
      );
      if (response.success) {
        setRawTransfers(response.data || []);
      } else {
        toast.warning("Transfers not loaded properly!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch transfers."
      );
    } finally {
      setLoading(false);
    }
  }, [date.from, date.to]);

  useEffect(() => {
    setFilteredTransfers(rawTransfers);
  }, [rawTransfers]);

  useEffect(() => {
    if (date.from && date.to) {
      setLoading(true);
      fetchTransfers();
    }
  }, [fetchTransfers, date.from, date.to]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransfers();
    setRefreshing(false);
  }, [fetchTransfers]);

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
            <Heading
              title="Transfers"
              description="View and manage all your transfers here."
            />
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="gap-2"
                disabled={refreshing}
              >
                <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                Refresh
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
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
          columns={transferColumns}
          data={filteredTransfers}
          pageSizeOptions={[10, 20, 50]}
          loading={loading && !refreshing}
        />
      </div>
    </PageContainer>
  );
}
