"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transaction } from "./columns";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusInfo } from "./columns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, IndianRupee, CalendarClock } from "lucide-react";

interface TransactionDetailsDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsDialog({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailsDialogProps) {
  if (!transaction) return null;

  const statusInfo = getStatusInfo(transaction.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] h-[90vh] p-0 gap-0">
        <div className="px-6 py-4 border-b">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold">
                  Transaction #{transaction.id}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  {format(new Date(transaction.createdAt!), "PPpp")}
                </div>
              </div>
              <Badge className={`${statusInfo.color} px-4 py-1.5 text-base`}>
                {statusInfo.icon} {statusInfo.label}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 h-[calc(90vh-8rem)]">
          <div className="px-6 py-4">
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Provider Info Card - Now in single column */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Provider Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2">
                          <AvatarImage
                            src={`/images/${transaction.providerDetails?.provider_logo}`}
                            alt={transaction.providerDetails?.provider_name}
                          />
                          <AvatarFallback className="text-lg">
                            {transaction.providerDetails?.provider_code}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-base">
                            {transaction.providerDetails?.provider_name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {transaction.provider_code}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Provider Type</span>
                          <span className="font-medium">{transaction.providerDetails?.provider_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant="outline" className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Module Info - Moved up */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Module Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Module Name</span>
                          <span className="font-medium">{transaction.moduleDetails?.module_name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">LAPU Balance</span>
                          <span className="font-medium">₹{transaction.lapu_bal || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reference ID</span>
                          <span className="font-medium">{transaction.ref_id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Serial Number</span>
                          <span className="font-medium">{transaction.sn || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Amount Details */}
                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      <IndianRupee className="h-4 w-4" />
                      Transaction Amount
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <div className="text-sm text-muted-foreground">Amount</div>
                        <div className="text-2xl font-bold text-green-600">
                          ₹{transaction.amount}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Price</div>
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{transaction.price}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="pt-1">
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Date</div>
                        <div className="text-sm font-medium pt-1">
                          {format(new Date(transaction.createdAt!), "dd MMM yyyy HH:mm")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Response Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <AlertCircle className="h-4 w-4" />
                    Response Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted p-4">
                    <pre className="text-sm whitespace-pre-wrap break-all">
                      {transaction.response || "No response available"}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Statement History */}
              {transaction.statements && transaction.statements.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Statement History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr className="text-muted-foreground">
                            <th className="p-2 text-left font-medium">Date</th>
                            <th className="p-2 text-left font-medium">Type</th>
                            <th className="p-2 text-left font-medium">Amount</th>
                            <th className="p-2 text-left font-medium">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transaction.statements.map((statement, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                {format(new Date(statement.createdAt), "dd MMM yyyy HH:mm")}
                              </td>
                              <td className="p-2">
                                <Badge variant={statement.statement_type === 10 ? "default" : "secondary"}>
                                  {statement.statement_type === 10 ? "Debit" : "Credit"}
                                </Badge>
                              </td>
                              <td className="p-2 font-medium">₹{statement.amount}</td>
                              <td className="p-2 font-medium">₹{statement.balance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
