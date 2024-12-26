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
import { AlertCircle } from "lucide-react";

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

  const statusInfo = getStatusInfo(transaction.status); // Add this helper function import from columns.tsx

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction #{transaction.id}
            <Badge>
              {format(new Date(transaction.createdAt!), "dd MMM yyyy HH:mm")}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-2 gap-4 pr-6">
            {/* Provider Card - Full Width */}
            {transaction.providerDetails && (
              <Card className="col-span-2">
                <CardContent className="flex items-center gap-4 pt-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={`/images/${transaction.providerDetails.provider_logo}`}
                      alt={transaction.providerDetails.provider_name}
                    />
                    <AvatarFallback>
                      {transaction.providerDetails.provider_code}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {transaction.providerDetails.provider_name}
                      </h3>
                      <Badge variant="outline">
                        {transaction.providerDetails.provider_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Code: {transaction.providerDetails.provider_code}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Wallet: {transaction.providerDetails.target_wallet}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transaction Info Card */}
            <Card className="col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Transaction Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Transaction Number</p>
                  <p className="font-medium">{transaction.number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">₹{transaction.amount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">₹{transaction.price}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Provider</p>
                  <p className="font-medium">{transaction.provider_code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Entry At</p>
                  <p className="font-medium">
                    {format(new Date(transaction.createdAt!), "PPpp")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Updated At</p>
                  <p className="font-medium">
                    {format(new Date(transaction.updatedAt!), "PPpp")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Extra Field 1</p>
                  <p className="font-medium">
                    {transaction.extra_field1 || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Extra Field 2</p>
                  <p className="font-medium">
                    {transaction.extra_field2 || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Response Card */}
            <Card className="col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Response Details
                  </CardTitle>
                  <Badge variant={statusInfo.variant as any}>
                    {statusInfo.icon} {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-y-4 text-sm">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Status Response</p>
                  <div className="relative p-3 bg-muted rounded-md">
                    <div className="overflow-x-auto overflow-y-auto max-h-70">
                      <pre className="font-medium text-sm m-0">
                        <code className="block whitespace-pre-wrap break-all">
                          {transaction.response
                            ? transaction.response
                            : "No response available"}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
                {/* Additional response-related fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Serial Number</p>
                    <p className="font-medium">{transaction.sn || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Reference ID</p>
                    <p className="font-medium">{transaction.ref_id || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Module Details Card */}
            {transaction.moduleDetails && (
              <Card className="col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Module Details</CardTitle>
                    <Badge variant="outline">
                      {transaction.moduleDetails.response_group}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Module ID</p>
                    <p className="font-medium">
                      {transaction.module_id || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Module Name</p>
                    <p className="font-medium">
                      {transaction.moduleDetails.module_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Response Group</p>
                    <p className="font-medium">
                      {transaction.moduleDetails.response_group}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">LAPU Balance</p>
                    <p className="font-medium">
                      {transaction.lapu_bal
                        ? `₹${transaction.lapu_bal}`
                        : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Details Card */}
            {transaction.userDetails && (
              <Card className="col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">User Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Shop Name</p>
                    <p className="font-medium">
                      {transaction.userDetails.shop_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Owner</p>
                    <p className="font-medium">
                      {transaction.userDetails.owner_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {transaction.userDetails.email_address}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Mobile</p>
                    <p className="font-medium">
                      {transaction.userDetails.mobile_number}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">IP Address</p>
                    <p className="font-medium">{transaction.ip_address}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statements Card */}
            {transaction.statements && transaction.statements.length > 0 && (
              <Card className="col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Statement History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="font-medium text-left p-2">Amount</th>
                        <th className="font-medium text-left p-2">Type</th>
                        <th className="font-medium text-left p-2">Balance</th>
                        <th className="font-medium text-left p-2">
                          Description
                        </th>
                        <th className="font-medium text-left p-2">
                          Updated At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transaction.statements.map((statement, index) => (
                        <tr key={index} className="border-b">
                          <td className="font-medium p-2">
                            ₹{statement.amount}
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                statement.statement_type === 10
                                  ? "default"
                                  : "outline"
                              }
                              className="w-16 text-center"
                            >
                              {statement.statement_type === 10
                                ? "Debit"
                                : "Credit"}
                            </Badge>
                          </td>
                          <td className="font-medium p-2">
                            ₹{statement.balance}
                          </td>
                          <td className="font-medium truncate p-2">
                            {statement.description}
                          </td>
                          <td className="font-medium p-2">
                            {new Date(statement.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
