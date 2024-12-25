import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transaction } from "./columns";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Transaction #{transaction.id}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[600px]">
          <div className="space-y-6 pr-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Transaction Information</CardTitle>
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
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(transaction.createdAt!), "PPpp")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-medium">{transaction.ip_address}</p>
                </div>
              </CardContent>
            </Card>

            {transaction.moduleDetails && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Module Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Module Name</p>
                      <p className="font-medium">
                        {transaction.moduleDetails.module_name}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {transaction.moduleDetails.response_group}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {transaction.userDetails && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">User Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Shop Name</p>
                    <p className="font-medium">{transaction.userDetails.shop_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Owner</p>
                    <p className="font-medium">{transaction.userDetails.owner_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{transaction.userDetails.email_address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Mobile</p>
                    <p className="font-medium">{transaction.userDetails.mobile_number}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {transaction.statements && transaction.statements.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Statement History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {transaction.statements.map((statement, index) => (
                    <div key={index}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium">₹{statement.amount}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Type</p>
                          <Badge variant={statement.statement_type === 10 ? "default" : "secondary"}>
                            {statement.statement_type === 10 ? 'Debit' : 'Credit'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Balance</p>
                          <p className="font-medium">₹{statement.balance}</p>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <p className="text-muted-foreground">Description</p>
                          <p className="font-medium">{statement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
