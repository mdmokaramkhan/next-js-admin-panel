"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

import PageContainer from "@/components/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { Log, logColumns } from "./columns";
import { DataTable } from "./data-table";

// Loading component
const LoadingState = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

// Error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full p-4 text-center">
        <p className="text-destructive">Something went wrong loading the logs.</p>
        <Button variant="outline" onClick={() => setHasError(false)}>
          Try Again
        </Button>
      </div>
    );
  }

  return children;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const router = useRouter();

  const fetchLogs = useCallback(async (selectedDate: Date) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const response = await apiRequest(
        `logs/date?date=${formattedDate}`,
        "GET",
        null,
        router
      );
      
      if (response.success) {
        setLogs(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch logs");
      }
    } catch {
      toast.error("Error loading logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [loading, router]);

  // Initial fetch
  useEffect(() => {
    if (!hasInitialFetch) {
      fetchLogs(date);
      setHasInitialFetch(true);
    }
  }, [hasInitialFetch, date, fetchLogs]);

  return (
    <PageContainer scrollable>
      <ErrorBoundary>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Heading
                title="System Logs"
                description="View and search system logs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button 
                onClick={() => fetchLogs(date)} 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>
          <Separator />

          <Suspense fallback={<LoadingState />}>
            <DataTable
              columns={logColumns}
              data={logs}
              pageSizeOptions={[10, 20, 50, 100]}
              loading={loading}
            />
          </Suspense>
        </div>
      </ErrorBoundary>
    </PageContainer>
  );
}
