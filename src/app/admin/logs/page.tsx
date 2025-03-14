"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Terminal, AlertCircle, RefreshCw, Download } from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [autoRefresh, setAutoRefresh] = useState(false);
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

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLogs(date);
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, date, fetchLogs]);

  // Initial fetch
  useEffect(() => {
    if (!hasInitialFetch) {
      fetchLogs(date);
      setHasInitialFetch(true);
    }
  }, [hasInitialFetch, date, fetchLogs]);

  // Calculate log statistics
  const logStats = {
    total: logs.length,
    errors: logs.filter(log => log.type === 'error').length,
    warnings: logs.filter(log => log.type === 'warning').length,
    info: logs.filter(log => log.type === 'info').length
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Path', 'Message'].join(','),
      ...logs.map(log => [
        format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
        log.type,
        log.requestPath || '',
        `"${log.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${format(date, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <PageContainer scrollable>
      <ErrorBoundary>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Terminal className="h-8 w-8 text-primary" />
                <div>
                  <Heading
                    title="System Logs"
                    description="Monitor and analyze system activity logs"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5",
                  autoRefresh && "bg-primary/10"
                )}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  autoRefresh && "animate-spin"
                )} />
                {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[180px] justify-start text-left font-normal"
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
                size="sm"
                onClick={() => fetchLogs(date)} 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={logs.length === 0}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Total Logs</p>
                  <Badge variant="outline" className="font-mono">
                    {logStats.total}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-destructive">Errors</p>
                  <Badge variant="destructive" className="font-mono">
                    {logStats.errors}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-yellow-600">Warnings</p>
                  <Badge variant="secondary" className="font-mono">
                    {logStats.warnings}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-blue-600">Info</p>
                  <Badge variant="default" className="font-mono">
                    {logStats.info}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {logStats.errors > 0 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                {logStats.errors} error{logStats.errors > 1 ? 's' : ''} detected in the system logs
              </p>
            </div>
          )}

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
