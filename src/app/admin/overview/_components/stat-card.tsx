import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const cardVariants = cva("relative overflow-hidden transition-all duration-200", {
  variants: {
    variant: {
      default: "border hover:border-foreground/10",
      primary: "border hover:border-primary/50",
      success: "border hover:border-emerald-500/50",
      warning: "border hover:border-yellow-500/50",
      danger: "border hover:border-rose-500/50",
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

interface StatCardProps {
  title: string;
  mainValue: string | number;
  subValue: string | number;
  icon: React.ReactNode;
  trend: number;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  prefix?: string;
}

export function StatCard({ 
  title, 
  mainValue, 
  subValue, 
  icon, 
  trend, 
  variant = "default",
  prefix 
}: StatCardProps) {
  return (
    <Card className={cn(cardVariants({ variant }), "group")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "rounded-lg p-2.5 transition-colors",
              variant === "primary" && "text-primary",
              variant === "success" && "text-emerald-500",
              variant === "warning" && "text-yellow-500",
              variant === "danger" && "text-rose-500",
              variant === "default" && "text-muted-foreground",
              "group-hover:bg-secondary/50"
            )}>
              {React.cloneElement(icon as React.ReactElement)}
            </div>
            <CardTitle className="text-sm font-medium">
              {title}
            </CardTitle>
          </div>
          {trend !== 0 && (
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              trend > 0 
                ? "text-emerald-500" 
                : "text-rose-500"
            )}>
              {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            {prefix && (
              <span className="text-sm font-medium text-muted-foreground">
                {prefix}
              </span>
            )}
            <span className={cn(
              "text-2xl font-semibold tracking-tight",
              variant === "primary" && "text-primary",
              variant === "success" && "text-emerald-500",
              variant === "warning" && "text-yellow-500",
              variant === "danger" && "text-rose-500"
            )}>
              {typeof mainValue === 'number' ? mainValue.toLocaleString() : mainValue}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {subValue}
          </span>
        </div>
      </CardContent>

      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-500",
        variant === "primary" && "bg-primary",
        variant === "success" && "bg-emerald-500",
        variant === "warning" && "bg-yellow-500",
        variant === "danger" && "bg-rose-500",
        variant === "default" && "bg-foreground/10",
        "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 origin-left"
      )} />
    </Card>
  );
}
