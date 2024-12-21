import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "./columns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Send, Search, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TransferMoneyDialogProps {
  onSubmit: (formData: {
    amount: number;
    receiptMobileNumber: string;
    targetWallet: string;
  }) => void;
  isSubmitting: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  users: User[];
  formData: {
    amount: string;
    receiptMobileNumber: string;
    targetWallet: string;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSelectChange: (value: string, field: string) => void;
}

const TransferMoneyDialog: React.FC<TransferMoneyDialogProps> = ({
  onSubmit,
  isSubmitting,
  isDialogOpen,
  setIsDialogOpen,
  users,
  formData,
  handleChange,
  handleSelectChange,
}) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Transfer Money
          </DialogTitle>
          <DialogDescription>
            Transfer money between user wallets. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            amount: parseFloat(formData.amount),
            receiptMobileNumber: formData.receiptMobileNumber,
            targetWallet: formData.targetWallet,
          });
        }}>
          <Card>
            <CardContent className="space-y-6 pt-4">
              {/* Amount Input with Currency Symbol */}
              <div className="space-y-2">
                <Label htmlFor="amount">Transfer Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    type="number"
                    min="1"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* User Selection using Select */}
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select
                  value={formData.receiptMobileNumber}
                  onValueChange={(value) => handleSelectChange(value, "receiptMobileNumber")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.mobile_number} value={user.mobile_number.toString()}>
                        <div className="flex flex-col">
                          <span>{user.owner_name}</span>
                          <span className="text-xs text-muted-foreground">
                            +91 {user.mobile_number}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wallet Selection with Icons */}
              <div className="space-y-2">
                <Label htmlFor="targetWallet">Select Wallet</Label>
                <Select
                  value={formData.targetWallet}
                  onValueChange={(value) => handleSelectChange(value, "targetWallet")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose wallet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rch_bal">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>Recharge Wallet</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="utility_bal">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>Utility Wallet</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dmt_bal">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>DMT Wallet</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Summary */}
              {formData.amount && formData.receiptMobileNumber && formData.targetWallet && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Transaction Summary</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">₹{formData.amount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-medium">
                          {users.find(u => u.mobile_number.toString() === formData.receiptMobileNumber)?.owner_name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wallet:</span>
                        <Badge variant="outline" className="capitalize">
                          {formData.targetWallet.replace('_bal', '')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.amount || !formData.receiptMobileNumber || !formData.targetWallet}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Money
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferMoneyDialog;
