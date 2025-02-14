"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, 
         Tooltip, PieChart, Pie, Cell, 
         YAxis} from "recharts";
import { TrendingUp, Circle } from "lucide-react";
import {
  Users,
  RefreshCw,
  Wallet,
  BarChart3,
  Settings
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageContainer from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
// import { BadgeDelta, Color } from "@tremor/react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LiveTransactions from '../analytics/live-transactions';
import { StatCard } from "./_components/stat-card";
import { WeeklyComparison } from "./_components/weekly-comparison";

interface WeeklyComparison {
  current_week: WeekData;
  last_week: WeekData;
  week_over_week_changes: {
    amount_change_percentage: number;
    transaction_change_percentage: number;
    price_change_percentage: number;
  };
}

interface WeekData {
  start_date: string;
  end_date: string;
  daily_sales: Array<{
    date: string;
    total_amount: number;
    transaction_count: number;
    total_price: number;
  }>;
  totals: {
    total_amount: number;
    total_transactions: number;
    total_price: number;
  };
}

interface TransactionTrend {
  count: number;
  period: string;
  average_count: number;
  average_amount: number;
  average_revenue: number;
  average_successful: number;
  average_failed: number;
  success_rate: string;
  total_count: number;
  total_amount: number;
  total_revenue: number;
}

interface ProviderPerformance {
  provider_code: string;
  provider_name: string;
  provider_logo: string;
  provider_type: string;
  total_transactions: number;
  total_amount: number;
  total_revenue: number;
  success_rate: string;
}

interface UserActivity {
  active_users: number;
  top_users: Array<{
    mobile_number: number;
    shop_name: string;
    owner_name: string;
    transaction_count: number;
    total_amount: number;
  }>;
  user_growth: Array<{
    date: string;
    new_users: number;
  }>;
}

interface DashboardStats {
  user_metrics: {
    total_users: number;
    new_users_30d: number;
    verified_users: number;
    verification_rate: string;
  };
  transaction_metrics: {
    total_transactions: number;
    total_amount: number;
    total_revenue: number;
    success_rate: string;
    average_transaction_value: string;
  };
  wallet_metrics: {
    total_recharge_balance: number;
    total_utility_balance: number;
    total_dmt_balance: number;
    total_system_balance: number;
  };
  service_performance: Array<{
    service_name: string;
    transaction_count: number;
    total_amount: number;
    total_revenue: number;
    average_transaction: string;
  }>;
  weekly_comparison?: WeeklyComparison;
  transaction_trends?: { timeframe: string; trends: TransactionTrend[] };
  provider_performance?: ProviderPerformance[];
  user_activity?: UserActivity;
}

export default function Overview() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const router = useRouter();
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 3)), // Changed from 7 to 3 days
    to: new Date(),
  });

  const fetchDashboardStats = useCallback(async () => {
    if (!date.from || !date.to) return;

    setIsRefreshing(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
      });

      const [statsResponse, weeklyResponse, trendsResponse, providerResponse, activityResponse] = await Promise.all([
        apiRequest(`reports/dashboard-stats?${queryParams}`, "GET", null, router),
        apiRequest(`reports/weekly-comparison?${queryParams}`, "GET", null, router),
        apiRequest(`reports/transaction-trends?${queryParams}`, "GET", null, router),
        apiRequest(`reports/provider-performance?${queryParams}`, "GET", null, router),
        apiRequest(`reports/user-activity?${queryParams}`, "GET", null, router)
      ]);
      
      if (statsResponse.status && weeklyResponse.status && trendsResponse.status && 
          providerResponse.status && activityResponse.status) {
        setStats({ 
          ...statsResponse.data, 
          weekly_comparison: weeklyResponse.data,
          transaction_trends: trendsResponse.data,
          provider_performance: providerResponse.data,
          user_activity: activityResponse.data
        });
        toast.success("Dashboard stats updated");
      }
    } catch {
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setIsRefreshing(false);
    }
  }, [router, date.from, date.to]);

  useEffect(() => {
    if (date.from && date.to) {
      fetchDashboardStats();
    }
  }, [fetchDashboardStats, date.from, date.to]);


  const formatTrendsData = (trends?: { timeframe: string; trends: TransactionTrend[] }) => {
    if (!trends?.trends || !Array.isArray(trends.trends)) return [];
    
    return [...trends.trends]
      .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime())
      .map(trend => ({
        hour: new Date(trend.period).getHours(),
        transactions: trend.total_count,
        amount: trend.total_amount,
        success_rate: parseFloat(trend.success_rate),
        successful: trend.average_successful,
        failed: trend.average_failed,
      }));
  };


  // Add chartConfig

  const trendsConfig = {
    transactions: {
      label: "Transactions",
      color: "hsl(var(--chart-1))",
    },
    success_rate: {
      label: "Success Rate",
      color: "hsl(var(--chart-2))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-3))",
    }
  };



  const calculateTotalVolume = (trends?: { timeframe: string; trends: TransactionTrend[] }) => {
    if (!trends?.trends) return 0;
    return trends.trends.reduce((acc, curr) => acc + curr.total_count, 0);
  };

  const formatPhoneNumber = (number: number) => {
    const str = number.toString();
    return `+91 ${str.slice(0, 5)} ${str.slice(5)}`;
  };

  const formatServiceData = (services?: Array<{ service_name: string; total_amount: number }>) => {
    if (!services) return [];
    return services.map(service => ({
      name: service.service_name,
      value: service.total_amount
    }));
  };

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))"
  ];

  const renderServiceBreakdown = () => {
    const totalAmount = stats?.service_performance?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;
    const totalTransactions = stats?.service_performance?.reduce((acc, curr) => acc + curr.transaction_count, 0) || 0;
    // const totalRevenue = stats?.service_performance?.reduce((acc, curr) => acc + (curr.total_revenue - curr.total_amount), 0) || 0;
  
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>Transaction distribution by service type</CardDescription>
            </div>
            <Select defaultValue="amount">
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="View by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">By Amount</SelectItem>
                <SelectItem value="transactions">By Transactions</SelectItem>
                <SelectItem value="revenue">By Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatServiceData(stats?.service_performance)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {formatServiceData(stats?.service_performance).map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const service = stats?.service_performance?.find(
                            s => s.service_name === payload[0].name
                          );
                          const percentage = ((service?.total_amount || 0) / totalAmount * 100).toFixed(1);
                          const successRate = ((service?.transaction_count || 0) / (totalTransactions || 1) * 100).toFixed(1);
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: payload[0].color }}
                                />
                                <span className="font-medium">{payload[0].name}</span>
                              </div>
                              <div className="mt-2 space-y-1.5">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <span className="text-muted-foreground">Volume:</span>
                                  <span className="font-medium text-right">₹{service?.total_amount.toLocaleString()}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <span className="text-muted-foreground">Transactions:</span>
                                  <span className="font-medium text-right">{service?.transaction_count} ({percentage}%)</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <span className="text-muted-foreground">Success Rate:</span>
                                  <span className="font-medium text-right">{successRate}%</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <span className="text-muted-foreground">Revenue:</span>
                                  <span className="font-medium text-right">₹{((service?.total_revenue || 0) - (service?.total_amount || 0)).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold">₹{totalAmount.toLocaleString()}</p>
                    <p className="text-sm mt-1">{totalTransactions} transactions</p>
                  </div>
                </div>
              </div>
    
              <ScrollArea className="h-[280px]">
                <div className="space-y-4">
                  {stats?.service_performance?.map((service, index) => {
                    const percentage = (service.total_amount / totalAmount * 100);
                    return (
                      <div key={service.service_name} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{service.service_name}</span>
                          </div>
                          <span className="text-sm">
                            ₹{service.total_amount.toLocaleString()}
                            <span className="text-xs text-muted-foreground ml-2">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 group-hover:opacity-80"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>{service.transaction_count} transactions</span>
                          <span>Revenue: ₹{(service.total_revenue - service.total_amount).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
  
            {/* Replace the old bottom section with this new compact version */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: "Most Used",
                    value: stats?.service_performance?.[0]?.service_name || "-",
                    subValue: `${((stats?.service_performance?.[0]?.transaction_count || 0) / totalTransactions * 100).toFixed(1)}%`,
                    color: COLORS[0]
                  },
                  {
                    label: "Highest Volume",
                    value: `₹${stats?.service_performance?.sort((a, b) => b.total_amount - a.total_amount)[0]?.total_amount.toLocaleString() || 0}`,
                    subValue: stats?.service_performance?.sort((a, b) => b.total_amount - a.total_amount)[0]?.service_name || "-",
                    color: COLORS[1]
                  },
                  {
                    label: "Best Revenue",
                    value: `₹${((stats?.service_performance?.sort((a, b) => (b.total_revenue - b.total_amount) - (a.total_revenue - a.total_amount))[0]?.total_revenue || 0) - (stats?.service_performance?.sort((a, b) => (b.total_revenue - b.total_amount) - (a.total_revenue - a.total_amount))[0]?.total_amount || 0)).toFixed(2)}`,
                    subValue: stats?.service_performance?.sort((a, b) => (b.total_revenue - b.total_amount) - (a.total_revenue - a.total_amount))[0]?.service_name || "-",
                    color: COLORS[2]
                  },
                  {
                    label: "Total Services",
                    value: stats?.service_performance?.length || 0,
                    subValue: `${totalTransactions.toLocaleString()} txns`,
                    color: COLORS[3]
                  }
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className="relative rounded-lg bg-muted/50 p-3 overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: stat.color }} />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-medium mt-1 truncate">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{stat.subValue}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleViewAllUsers = () => {
    router.push('/admin/users');
  };

  const statsCards = [
    {
      title: "User Activity",
      mainValue: stats?.user_metrics.total_users || 0,
      subValue: `+${stats?.user_metrics.new_users_30d || 0} new this month`,
      icon: <Users className="h-4 w-4" />,
      trend: ((stats?.user_metrics.new_users_30d || 0) / (stats?.user_metrics.total_users || 1) * 100),
      variant: "primary" as const
    },
    {
      title: "Transactions",
      mainValue: stats?.transaction_metrics.total_transactions || 0,
      subValue: `${stats?.transaction_metrics.success_rate || 0}% success rate`,
      icon: <BarChart3 className="h-4 w-4" />,
      trend: parseFloat(stats?.transaction_metrics.success_rate || "0"),
      variant: parseFloat(stats?.transaction_metrics.success_rate || "0") >= 90 ? "success" as const : "danger" as const
    },
    {
      title: "Service Performance",
      mainValue: stats?.service_performance?.[0]?.transaction_count || 0,
      subValue: `${stats?.service_performance?.[0]?.service_name || "No Service"}`,
      icon: <BarChart3 className="h-4 w-4" />,
      trend: ((stats?.service_performance?.[0]?.total_revenue || 0) / 
        (stats?.service_performance?.[0]?.total_amount || 1) * 100 - 100),
      variant: "warning" as const,
      prefix: "₹"
    },
    {
      title: "System Balance",
      mainValue: (stats?.wallet_metrics.total_system_balance || 0).toFixed(2),
      subValue: `Recharge: ₹${(stats?.wallet_metrics.total_recharge_balance || 0).toFixed(2)}`,
      icon: <Wallet className="h-4 w-4" />,
      trend: 100,
      variant: "success" as const,
      prefix: "₹"
    }
  ];

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Heading
              title="Dashboard Overview"
              description="Monitor your system's performance and analytics."
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
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
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="live-transactions">Live Transactions</TabsTrigger>
                </TabsList>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchDashboardStats}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </div>
          <Separator />

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statsCards.map((card, index) => (
                <StatCard key={index} {...card} />
              ))}
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <WeeklyComparison data={stats?.weekly_comparison} />
              {renderServiceBreakdown()}

              <Card className="col-span-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Provider Performance</CardTitle>
                      <CardDescription>Success rate and revenue by provider</CardDescription>
                    </div>
                    {/* Summary numbers */}
                    <div className="hidden md:flex items-center gap-4">
                      {[
                        {
                          label: "Total Volume",
                          value: `₹${stats?.provider_performance?.reduce((acc, curr) => acc + curr.total_amount, 0)?.toLocaleString() || 0}`,
                        },
                        {
                          label: "Total Revenue",
                          value: `₹${stats?.provider_performance?.reduce((acc, curr) => acc + (curr.total_revenue - curr.total_amount), 0)?.toFixed(2) || 0}`,
                        },
                        {
                          label: "Avg. Success Rate",
                          value: `${(stats?.provider_performance?.reduce((acc, curr) => acc + parseFloat(curr.success_rate), 0) || 0 / (stats?.provider_performance?.length || 1)).toFixed(1)}%`,
                        }
                      ].map((stat, i) => (
                        <div key={i} className="text-right">
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="text-sm font-medium">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {stats?.provider_performance?.map((provider) => (
                      <div
                        key={provider.provider_code}
                        className="group flex flex-col space-y-3 p-4 border rounded-lg hover:bg-secondary/20 transition-colors relative overflow-hidden"
                      >
                        {/* Success rate indicator line */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-300"
                          style={{
                            background: parseFloat(provider.success_rate) >= 90 
                              ? "linear-gradient(to right, hsl(var(--success)), transparent)" 
                              : parseFloat(provider.success_rate) >= 75
                              ? "linear-gradient(to right, hsl(var(--warning)), transparent)"
                              : "linear-gradient(to right, hsl(var(--destructive)), transparent)",
                            width: `${provider.success_rate}%`
                          }}
                        />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center relative overflow-hidden">
                              <Image
                                src={`/images/${provider.provider_logo}`}
                                alt={provider.provider_name}
                                width={28}
                                height={28}
                                className="object-contain"
                                priority={false}
                              />
                            </div>
                            <div>
                              <p className="font-medium line-clamp-1">{provider.provider_name}</p>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="secondary" 
                                  className="h-5 text-xs font-normal"
                                >
                                  {provider.provider_type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {provider.provider_code}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-2">
                          <div>
                            <p className="text-muted-foreground text-xs">Transactions</p>
                            <p className="font-medium">{provider.total_transactions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Success Rate</p>
                            <p className={cn(
                              "font-medium",
                              parseFloat(provider.success_rate) >= 90 
                                ? "text-emerald-600" 
                                : parseFloat(provider.success_rate) >= 75 
                                ? "text-yellow-600" 
                                : "text-rose-600"
                            )}>
                              {provider.success_rate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Volume</p>
                            <p className="font-medium">₹{provider.total_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Revenue</p>
                            <div className="flex items-baseline gap-1">
                              <p className="font-medium">₹{(provider.total_revenue - provider.total_amount).toFixed(2)}</p>
                              <span className="text-xs text-muted-foreground">
                                ({((provider.total_revenue - provider.total_amount) / provider.total_amount * 100).toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Hover stats */}
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-sm font-medium">Avg. Transaction</p>
                            <p className="text-lg font-bold">₹{(provider.total_amount / provider.total_transactions).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              Revenue per txn: ₹{((provider.total_revenue - provider.total_amount) / provider.total_transactions).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Hourly Transaction Trends</CardTitle>
                      <CardDescription className="mt-1">
                        {stats?.transaction_trends?.timeframe} overview
                      </CardDescription>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-4 text-sm">
                        {Object.entries(trendsConfig).map(([key, config]) => (
                          <div key={key} className="flex items-center gap-2">
                            <div 
                              className="h-2 w-2 rounded-full" 
                              style={{ backgroundColor: config.color }} 
                            />
                            <span className="text-muted-foreground">{config.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    {[
                      {
                        title: "Total Transactions",
                        value: calculateTotalVolume(stats?.transaction_trends),
                        subValue: "transactions processed",
                        icon: <BarChart3 className="h-4 w-4" />,
                      },
                      {
                        title: "Success Rate",
                        value: `${((stats?.transaction_trends?.trends || []).reduce((acc, curr) => 
                          acc + parseFloat(curr.success_rate), 0) / 
                          (stats?.transaction_trends?.trends || []).length || 0).toFixed(1)}%`,
                        subValue: "average success rate",
                        icon: <TrendingUp className="h-4 w-4" />,
                      },
                      {
                        title: "Total Volume",
                        value: `₹${(stats?.transaction_trends?.trends || [])
                          .reduce((acc, curr) => acc + curr.total_amount, 0)
                          .toLocaleString()}`,
                        subValue: "total amount processed",
                        icon: <Wallet className="h-4 w-4" />,
                      },
                      {
                        title: "Peak Hour",
                        value: (() => {
                          const maxTrend = (stats?.transaction_trends?.trends || [])
                            .reduce((max, curr) => curr.total_count > max.total_count ? curr : max, 
                              { total_count: 0, period: new Date().toISOString() });
                          return `${new Date(maxTrend.period).getHours()}:00`;
                        })(),
                        subValue: "highest transaction hour",
                        icon: <Circle className="h-4 w-4" />,
                      }
                    ].map((metric, i) => (
                      <Card key={i} className="bg-muted/30 border-none">
                        <CardHeader className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg p-2 bg-background">
                              {metric.icon}
                            </div>
                            <CardTitle className="text-sm font-medium">
                              {metric.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <div className="text-2xl font-bold">{metric.value}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {metric.subValue}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={formatTrendsData(stats?.transaction_trends)}
                        margin={{ top: 20, right: 0, bottom: 16, left: 0 }}
                      >
                        <CartesianGrid 
                          horizontal 
                          strokeDasharray="4" 
                          stroke="hsl(var(--border))" 
                          className="opacity-20" 
                        />
                        <XAxis
                          dataKey="hour"
                          tickLine={false}
                          axisLine={false}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => `${value}:00`}
                        />
                        <YAxis
                          yAxisId="left"
                          tickLine={false}
                          axisLine={false}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tickLine={false}
                          axisLine={false}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-lg">
                                  <div className="font-medium">{`${label}:00`}</div>
                                  <div className="mt-2 space-y-2">
                                    <div className="flex items-center justify-between gap-8">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{ backgroundColor: trendsConfig.transactions.color }}
                                        />
                                        <span className="text-muted-foreground">Transactions</span>
                                      </div>
                                      <span className="font-medium">{payload[0].value}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-8">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{ backgroundColor: trendsConfig.success_rate.color }}
                                        />
                                        <span className="text-muted-foreground">Success Rate</span>
                                      </div>
                                      <span className="font-medium">{payload[1].value}%</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-8">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{ backgroundColor: trendsConfig.revenue.color }}
                                        />
                                        <span className="text-muted-foreground">Volume</span>
                                      </div>
                                      <span className="font-medium">₹{payload[0].payload.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="mt-1 pt-1 border-t flex items-center justify-between text-xs text-muted-foreground">
                                      <span className="text-emerald-500">{payload[0].payload.successful} successful</span>
                                      <span>•</span>
                                      <span className="text-rose-500">{payload[0].payload.failed} failed</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                        />
                        <Bar
                          dataKey="transactions"
                          fill={trendsConfig.transactions.color}
                          radius={[4, 4, 0, 0]}
                          yAxisId="left"
                        />
                        <Bar
                          dataKey="success_rate"
                          fill={trendsConfig.success_rate.color}
                          radius={[4, 4, 0, 0]}
                          yAxisId="right"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Activity & Growth</CardTitle>
                      <CardDescription>Performance metrics and acquisitions</CardDescription>
                    </div>
                    <Badge variant="outline" className="font-normal">
                      <Users className="h-3 w-3 mr-1" />
                      {stats?.user_activity?.active_users || 0} active users
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-8 grid-cols-1 md:grid-cols-2 h-auto md:h-[650px]">
                  {/* Left column - Top Users */}
                  <div className="flex flex-col h-[500px] md:h-full border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold">Top Performing Users</h4>
                        <p className="text-xs text-muted-foreground mt-1">Based on transaction volume</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={handleViewAllUsers}
                      >
                        View all
                      </Button>
                    </div>
                    
                    {/* Scrollable container with fixed height */}
                    <ScrollArea className="h-[480px] -mr-4 pr-4">
                      <div className="space-y-4">
                        {stats?.user_activity?.top_users.map((user, i) => (
                          <div
                            key={user.mobile_number}
                            className={cn(
                              "group relative flex items-center gap-4 rounded-lg border p-4 transition-all duration-200",
                              i < 3 ? "bg-gradient-to-r from-muted/50 to-background border-primary/20" : "hover:bg-muted/50",
                              i === 0 && "relative overflow-hidden"
                            )}
                          >
                            {/* Shimmer effect for top performer */}
                            {i === 0 && (
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                            )}

                            {/* Left highlight bar */}
                            <div className={cn(
                              "absolute left-0 top-0 bottom-0 w-1 transition-all duration-200",
                              i === 0 && "bg-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)]",
                              i === 1 && "bg-[#C0C0C0] shadow-[0_0_10px_rgba(192,192,192,0.5)]",
                              i === 2 && "bg-[#CD7F32] shadow-[0_0_10px_rgba(205,127,50,0.5)]",
                              i >= 3 && "bg-transparent group-hover:bg-primary/50"
                            )} />
                            
                            {/* Avatar section */}
                            <div className="relative flex-shrink-0">
                              <Avatar className={cn(
                                "h-12 w-12 border-2 shadow-md",
                                i === 0 && "border-[#FFD700] ring-2 ring-[#FFD700]/20",
                                i === 1 && "border-[#C0C0C0] ring-2 ring-[#C0C0C0]/20",
                                i === 2 && "border-[#CD7F32] ring-2 ring-[#CD7F32]/20",
                                i >= 3 && "border-border"
                              )}>
                                <div className={cn(
                                  "flex h-full w-full items-center justify-center rounded-full font-bold text-sm",
                                  i === 0 && "bg-[#FFD700]/10 text-[#FFD700]",
                                  i === 1 && "bg-[#C0C0C0]/10 text-[#C0C0C0]",
                                  i === 2 && "bg-[#CD7F32]/10 text-[#CD7F32]",
                                  i >= 3 && "bg-primary/10 text-primary"
                                )}>
                                  {i + 1}
                                </div>
                              </Avatar>
                              {/* Trophy/Medal icons */}
                              {i < 3 && (
                                <div className="absolute -top-1 -right-1 rounded-full bg-background p-1 shadow-md">
                                  <span className="text-base">
                                    {i === 0 && "👑"}
                                    {i === 1 && "🥈"}
                                    {i === 2 && "🥉"}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Content section */}
                            <div className="flex flex-1 items-center justify-between min-w-0 gap-2">
                              <div className="truncate">
                                <p className={cn(
                                  "font-medium truncate",
                                  i < 3 ? "text-base" : "text-sm"
                                )}>
                                  {user.shop_name}
                                </p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-muted-foreground truncate">
                                    {formatPhoneNumber(user.mobile_number)}
                                  </span>
                                  <span className="inline-flex items-center text-xs text-muted-foreground">
                                    <Circle className="h-1 w-1 fill-current opacity-50 mr-1" />
                                    {user.transaction_count} txns
                                  </span>
                                </div>
                              </div>

                              {/* Right section */}
                              <div className="flex flex-col items-end gap-1">
                                <span className={cn(
                                  "font-bold whitespace-nowrap",
                                  i < 3 ? "text-base text-primary" : "text-sm"
                                )}>
                                  ₹{user.total_amount.toLocaleString()}
                                </span>
                                <Badge 
                                  variant={i < 3 ? "default" : "secondary"}
                                  className={cn(
                                    "font-normal text-xs",
                                    i === 0 && "bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30",
                                    i === 1 && "bg-[#C0C0C0]/20 text-[#C0C0C0] hover:bg-[#C0C0C0]/30",
                                    i === 2 && "bg-[#CD7F32]/20 text-[#CD7F32] hover:bg-[#CD7F32]/30"
                                  )}
                                >
                                  {i < 3 ? "Top Performer" : `Rank #${i + 1}`}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Right column - Growth Metrics */}
                  <div className="flex flex-col h-full border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                      <div className="mb-4 sm:mb-0">
                        <h4 className="text-sm font-semibold">User Growth & Metrics</h4>
                        <p className="text-xs text-muted-foreground mt-1">Overall statistics</p>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger className="h-8 w-[135px] text-xs">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Last 7 days</SelectItem>
                          <SelectItem value="14">Last 14 days</SelectItem>
                          <SelectItem value="30">Last 30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {[
                        {
                          title: "New Users",
                          value: stats?.user_metrics.new_users_30d || 0,
                          change: ((stats?.user_metrics.new_users_30d || 0) / (stats?.user_metrics.total_users || 1) * 100).toFixed(1),
                          label: "vs. previous period"
                        },
                        {
                          title: "Active Rate",
                          value: ((stats?.user_activity?.active_users || 0) / (stats?.user_metrics.total_users || 1) * 100).toFixed(1) + "%",
                          change: stats?.user_activity?.active_users || 0,
                          label: `of ${stats?.user_metrics.total_users || 0} total users`
                        },
                        {
                          title: "Verification Rate",
                          value: stats?.user_metrics.verification_rate || "0%",
                          change: stats?.user_metrics.verified_users || 0,
                          label: "successfully verified"
                        },
                        {
                          title: "Avg. Transactions",
                          value: ((stats?.transaction_metrics.total_transactions || 0) / (stats?.user_activity?.active_users || 1)).toFixed(1),
                          change: "per user",
                          label: "transactions per active user"
                        }
                      ].map((metric, i) => (
                        <Card key={i} className="border-none shadow-none bg-muted/30">
                          <CardHeader className="p-4">
                            <CardDescription>{metric.title}</CardDescription>
                            <div className="flex items-center justify-between mt-1">
                              <CardTitle className="text-2xl">{metric.value}</CardTitle>
                              <Badge variant="secondary" className="font-normal">
                                {typeof metric.change === 'number' && metric.change > 0 ? '+' : ''}{metric.change}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4 pb-4 pt-0">
                            <p className="text-xs text-muted-foreground">{metric.label}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex-1 flex flex-col rounded-lg border bg-card">
                      <div className="flex items-center justify-between p-4 border-b">
                        <div>
                          <h4 className="text-sm font-semibold">Daily User Acquisition</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Total new users: {stats?.user_metrics.new_users_30d || 0}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <span className="text-xs text-muted-foreground">Daily signups</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-primary/30" />
                              <span className="text-xs text-muted-foreground">Average</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 p-4 overflow-x-auto">
                        <div className="min-w-[600px] h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={stats?.user_activity?.user_growth}
                              margin={{ top: 0, right: 8, left: -15, bottom: 0 }}
                            >
                              <CartesianGrid 
                                strokeDasharray="3 3" 
                                className="opacity-20"
                                horizontal={true}
                                vertical={false}
                              />
                              {/* Background bars for visual reference */}
                              <Bar
                                dataKey="new_users"
                                fill="hsla(var(--primary), 0.2)"
                                radius={[0, 0, 0, 0]}
                                isAnimationActive={false}
                              />
                              {/* Main bars */}
                              <Bar
                                dataKey="new_users"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                              />
                              <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                                  day: '2-digit',
                                  month: 'short'
                                })}
                                fontSize={12}
                                stroke="hsl(var(--muted-foreground))"
                                minTickGap={10}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                fontSize={12}
                                stroke="hsl(var(--muted-foreground))"
                                tickFormatter={(value) => `${value}`}
                                width={30}
                              />
                              <Tooltip
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="rounded-lg border bg-background p-2 shadow-lg">
                                        <div className="font-medium">
                                          {new Date(label).toLocaleDateString('en-US', { 
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2">
                                          <div className="h-2 w-2 rounded-full bg-primary" />
                                          <span className="text-sm text-muted-foreground">
                                            {payload[0].value} new users
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add this new section at the bottom */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Recent System Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { type: "success", message: "System balance updated successfully", time: "2 mins ago" },
                    { type: "warning", message: "Provider API latency detected", time: "15 mins ago" },
                    { type: "error", message: "Failed transaction retry attempt", time: "1 hour ago" },
                    { type: "info", message: "Automated daily report generated", time: "2 hours ago" },
                  ].map((event, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        event.type === "success" && "bg-emerald-500",
                        event.type === "warning" && "bg-yellow-500",
                        event.type === "error" && "bg-rose-500",
                        event.type === "info" && "bg-blue-500"
                      )} />
                      <span className="flex-1">{event.message}</span>
                      <span className="text-xs text-muted-foreground">{event.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Add Money", icon: <Wallet className="h-4 w-4" /> },
                      { label: "View Reports", icon: <BarChart3 className="h-4 w-4" /> },
                      { label: "Users", icon: <Users className="h-4 w-4" /> },
                      { label: "Settings", icon: <Settings className="h-4 w-4" /> }
                    ].map((action, i) => (
                      <Button key={i} variant="outline" className="h-12 justify-start gap-2">
                        {action.icon}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "API Response Time", value: "280ms", target: "< 300ms" },
                    { label: "Success Rate", value: "99.2%", target: "> 98%" },
                    { label: "System Load", value: "42%", target: "< 75%" },
                    { label: "Memory Usage", value: "3.2GB", target: "< 4GB" }
                  ].map((metric, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span className="font-medium">{metric.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ 
                            width: `${parseInt(metric.value) || 0}%`,
                            backgroundColor: parseInt(metric.value) > 90 
                              ? 'hsl(var(--destructive))' 
                              : parseInt(metric.value) > 75 
                              ? 'hsl(var(--warning))' 
                              : 'hsl(var(--primary))'
                          }} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Target: {metric.target}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="live-transactions" className="space-y-4">
            <div className="grid gap-4">
              <LiveTransactions />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
