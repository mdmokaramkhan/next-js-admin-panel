"use client";
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentTransfers } from "./_components/recent-transfers";
import AddMoneyModal from "./_components/add-money";
import PageContainer from "@/components/page-container";
import Transactions from "../analytics/live-transactions";
import { RecentAddMoney } from "./_components/recent-add-money";

export default function Overview() {
  const salesData = [
    { month: "Jan", online: 1500, offline: 900 },
    { month: "Feb", online: 2300, offline: 1200 },
    { month: "Mar", online: 3200, offline: 2100 },
    { month: "Apr", online: 2800, offline: 1800 },
    { month: "May", online: 4100, offline: 2600 },
    { month: "Jun", online: 3800, offline: 2400 },
  ];

  const salesConfig = {
    online: {
      label: "Online Sales",
      color: "#2563eb",
    },
    offline: {
      label: "Offline Sales",
      color: "#60a5fa",
    },
  } satisfies ChartConfig;

  const transactionConfig = {
    total: {
      label: "Transactions",
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  const transactionData = [
    { name: 'Mon', total: 145 },
    { name: 'Tue', total: 230 },
    { name: 'Wed', total: 187 },
    { name: 'Thu', total: 332 },
    { name: 'Fri', total: 278 },
    { name: 'Sat', total: 389 },
    { name: 'Sun', total: 423 },
  ];

  return (
    <PageContainer scrollable>
      <div className="space-y-2 pb-4 h-full">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, Welcome back 👋
          </h2>
          <div className="hidden items-center space-x-2 md:flex">
            <CalendarDateRangePicker />
            <Button>Download</Button>
            <AddMoneyModal />
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4 rounded-lg">
          <TabsList className="rounded-lg">
            <TabsTrigger className="rounded-lg" value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger className="rounded-lg" value="analytics">
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Subscriptions
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2350</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12,234</div>
                  <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Now
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales</CardTitle>
                  <CardDescription>Online vs Offline sales comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ChartContainer config={salesConfig} className="mt-6">
                      <BarChart data={salesData}>
                        <XAxis dataKey="month" />
                        <Bar dataKey="online" fill="var(--color-online)" radius={4} />
                        <Bar dataKey="offline" fill="var(--color-offline)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Transactions</CardTitle>
                  <CardDescription>Transaction trends this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ChartContainer config={transactionConfig} className="mt-6">
                      <LineChart data={transactionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="var(--color-total)" 
                          strokeWidth={2} 
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 md:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Transfers</CardTitle>
                  <CardDescription>
                    You made total sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransfers />
                </CardContent>
              </Card>
              <Card className="col-span-4 md:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Add Money</CardTitle>
                  <CardDescription>
                    You made total sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentAddMoney />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Transactions />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
