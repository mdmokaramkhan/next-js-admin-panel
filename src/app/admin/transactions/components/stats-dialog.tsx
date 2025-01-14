import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Transaction } from "../columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
}

const StatsDialog = ({ open, onOpenChange, transactions }: StatsDialogProps) => {
  // Calculate statistics
  const stats = {
    total: {
      count: transactions.length,
      amount: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    },
    success: {
      count: transactions.filter((t) => t.status === 10).length,
      amount: transactions
        .filter((t) => t.status === 10)
        .reduce((sum, t) => sum + (t.amount || 0), 0),
    },
    pending: {
      count: transactions.filter((t) => [0, 5, 7, 8, 9].includes(t.status)).length,
      amount: transactions
        .filter((t) => [0, 5, 7, 8, 9].includes(t.status))
        .reduce((sum, t) => sum + (t.amount || 0), 0),
    },
    failed: {
      count: transactions.filter((t) => [20, 21, 22, 23].includes(t.status)).length,
      amount: transactions
        .filter((t) => [20, 21, 22, 23].includes(t.status))
        .reduce((sum, t) => sum + (t.amount || 0), 0),
    },
    // Group by provider
    byProvider: Object.values(
      transactions.reduce((acc, t) => {
        const provider = t.providerDetails?.provider_name || "Unknown";
        if (!acc[provider]) {
          acc[provider] = {
            name: provider,
            count: 0,
            amount: 0,
            successCount: 0,
            successAmount: 0,
            pendingCount: 0,
            pendingAmount: 0,
          };
        }
        acc[provider].count++;
        acc[provider].amount += t.amount || 0;
        if (t.status === 10) {
          acc[provider].successCount++;
          acc[provider].successAmount += t.amount || 0;
        } else if ([0, 5, 7, 8, 9].includes(t.status)) {
          acc[provider].pendingCount++;
          acc[provider].pendingAmount += t.amount || 0;
        }
        return acc;
      }, {} as Record<string, any>)
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] h-[85vh] flex flex-col p-0">
        <DialogHeader className="sticky top-0 z-10 bg-background px-6 py-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">
            Transaction Analytics
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Overview Cards */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-secondary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      Total Transactions
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">
                      ₹{stats.total.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.total.count.toLocaleString()} transactions
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between text-green-600">
                      Successful
                      <ChevronRight className="h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-green-600">
                      ₹{stats.success.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.success.count.toLocaleString()} transactions
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between text-yellow-600">
                      Pending
                      <ChevronRight className="h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-yellow-600">
                      ₹{stats.pending.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.pending.count.toLocaleString()} transactions
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between text-red-600">
                      Failed
                      <ChevronRight className="h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-red-600">
                      ₹{stats.failed.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.failed.count.toLocaleString()} transactions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Provider Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Provider Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.byProvider.map((provider: any) => (
                  <Card key={provider.name} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage
                            src={`/images/${transactions.find(t => 
                              t.providerDetails?.provider_name === provider.name
                            )?.providerDetails?.provider_logo}`}
                            alt={provider.name}
                          />
                          <AvatarFallback className="text-lg">
                            {provider.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                              <h4 className="text-base font-semibold truncate">
                                {provider.name}
                              </h4>
                              <div className="text-right shrink-0">
                                <div className="text-xl font-bold">
                                  ₹{provider.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </div>
                                <p className="text-sm text-green-600 font-medium">
                                  ₹{provider.successAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} successful
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="h-6">
                                {provider.count.toLocaleString()} txns
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="bg-green-500/10 text-green-600 h-6"
                              >
                                {((provider.successCount / provider.count) * 100).toFixed(1)}% success
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="bg-yellow-500/10 text-yellow-600 h-6"
                              >
                                {provider.pendingCount.toLocaleString()} pending
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsDialog;
