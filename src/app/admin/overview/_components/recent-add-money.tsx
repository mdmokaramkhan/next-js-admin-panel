"use client";

import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api";
import { 
  IndianRupee, 
  PlusCircle, 
  Wallet,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: number;
  mobile_number: number;
  shop_name: string;
  amount: number;
  balance: string;
  description: string;
  createdAt: string;
  wallet_type: string;
}

interface StatItemProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
}

const StatItem = ({ title, value, icon, className }: StatItemProps) => (
  <div className={cn("space-y-1", className)}>
    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
      {icon}
      {title}
    </p>
    <p className="text-2xl font-bold tracking-tight">{value}</p>
  </div>
);

export function RecentAddMoney() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/transfers/recent', 'GET');
      
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error('Failed to load transactions');
      }
    } catch (err) {
      console.error('Failed to fetch wallet credits:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTransactions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const stats = {
    today: data?.filter(t => 
      new Date(t.createdAt).toDateString() === new Date().toDateString()
    ).reduce((acc, curr) => acc + curr.amount, 0) ?? 0,
    total: data?.reduce((acc, curr) => acc + curr.amount, 0) ?? 0,
    average: data.length ? Math.round((data.reduce((acc, curr) => acc + curr.amount, 0) / data.length)) : 0
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[76px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        {error || 'No recent transactions available'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatItem
          title="Today's Credit"
          value={`₹${stats.today.toLocaleString()}`}
          icon={<PlusCircle className="h-4 w-4" />}
        />
        <StatItem
          title="Total Added"
          value={`₹${stats.total.toLocaleString()}`}
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <StatItem
          title="Avg. Amount"
          value={`₹${stats.average.toLocaleString()}`}
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-4 pr-4">
          {data.map((transaction) => (
            <div
              key={transaction.id}
              className="group flex items-start gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50"
            >
              <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <PlusCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    {transaction.shop_name}
                  </p>
                  <p className="text-sm font-medium">
                    ₹{transaction.amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-3 w-3" />
                    <span>₹{parseFloat(transaction.balance).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(transaction.createdAt), { 
                        addSuffix: true 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
