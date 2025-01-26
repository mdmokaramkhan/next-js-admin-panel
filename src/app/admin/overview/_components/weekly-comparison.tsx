import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface WeeklyComparisonProps {
  data?: {
    current_week: {
      start_date: string;
      end_date: string;
      daily_sales: Array<{
        date: string;
        total_amount: number;
      }>;
      totals: {
        total_transactions: number;
      };
    };
    last_week: {
      daily_sales: Array<{
        total_amount: number;
      }>;
    };
    week_over_week_changes: {
      amount_change_percentage: number;
    };
  };
}

const chartConfig = {
  current: {
    label: "Current Week",
    color: "hsl(var(--chart-1))",
  },
  previous: {
    label: "Previous Week",
    color: "hsl(var(--chart-2))",
  },
};

export function WeeklyComparison({ data }: WeeklyComparisonProps) {
  const formatChartData = () => {
    if (!data) return [];
    
    return data.current_week.daily_sales.map((current, index) => ({
      date: new Date(current.date).toLocaleDateString('en-US', { weekday: 'short' }),
      current: current.total_amount,
      previous: data.last_week.daily_sales[index].total_amount,
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-lg">
          <div className="font-medium">{label}</div>
          <div className="mt-2 flex flex-col gap-1">
            {payload.map((entry: any) => (
              <div key={entry.name} className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-muted-foreground">
                    {entry.name}
                  </span>
                </div>
                <span>₹{entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getTrendContent = () => {
    const changePercentage = data?.week_over_week_changes?.amount_change_percentage;
    
    if (typeof changePercentage !== 'number') {
      return <div className="text-muted-foreground">No comparison data available</div>;
    }

    const isPositive = changePercentage > 0;
    const absoluteChange = Math.abs(changePercentage).toFixed(1);

    return (
      <>
        {isPositive ? (
          <>
            Trending up by {absoluteChange}% this week
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </>
        ) : (
          <>
            Trending down by {absoluteChange}% this week
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </>
        )}
      </>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Weekly Performance Comparison</CardTitle>
        <CardDescription>
          {data?.current_week.start_date} - {data?.current_week.end_date}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={formatChartData()}
            className="w-full aspect-[4/3]"
            margin={{ top: 0, right: 0, bottom: 16, left: 0 }}
          >
            <CartesianGrid 
              horizontal 
              strokeDasharray="4" 
              stroke="hsl(var(--border))" 
              className="opacity-20" 
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              content={CustomTooltip}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
            />
            <Bar
              dataKey="current"
              fill={chartConfig.current.color}
              radius={[4, 4, 0, 0]}
              name={chartConfig.current.label}
            />
            <Bar
              dataKey="previous"
              fill={chartConfig.previous.color}
              radius={[4, 4, 0, 0]}
              name={chartConfig.previous.label}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {getTrendContent()}
        </div>
        <div className="leading-none text-muted-foreground">
          {data?.current_week.totals.total_transactions ?? 0} transactions this week
        </div>
      </CardFooter>
    </Card>
  );
}
