import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "../columns";
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
import { Wallet, Send, Loader2, User as UserIcon, IndianRupee, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

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
  // Reset form data when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      handleSelectChange("", "receiptMobileNumber");
      handleSelectChange("", "targetWallet");
      handleChange({ target: { id: "amount", value: "" } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [isDialogOpen]);

  // Add useEffect to handle the custom event
  useEffect(() => {
    const handleTransferDialogOpen = (event: CustomEvent) => {
      const { targetWallet } = event.detail;
      if (targetWallet) {
        handleSelectChange(targetWallet, "targetWallet");
      }
    };

    window.addEventListener('openTransferDialog', handleTransferDialogOpen as EventListener);
    
    return () => {
      window.removeEventListener('openTransferDialog', handleTransferDialogOpen as EventListener);
    };
  }, [handleSelectChange]);

  const walletOptions = [
    { id: "rch_bal", label: "Recharge Wallet", icon: "💳", description: "For recharge transactions" },
    { id: "utility_bal", label: "Utility Wallet", icon: "🏷️", description: "For utility payments" },
    { id: "dmt_bal", label: "DMT Wallet", icon: "💰", description: "For money transfers" }
  ];

  const selectedUser = users.find(u => u.mobile_number.toString() === formData.receiptMobileNumber);

  const [isReverseTransfer, setIsReverseTransfer] = useState(false);

  // Add search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.mobile_number.toString().includes(searchQuery) ||
    (user.shop_name && user.shop_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild><div /></DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Transfer Money</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            amount: parseFloat(formData.amount),
            receiptMobileNumber: formData.receiptMobileNumber,
            targetWallet: formData.targetWallet,
          });
        }} className="flex flex-col h-full">
          <div className="p-6 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Send className={cn("w-8 h-8 text-primary transition-transform", 
                    isReverseTransfer && "rotate-180")} />
                  Money Transfer
                </h2>
                <p className="text-muted-foreground mt-2 text-base">
                  {isReverseTransfer 
                    ? "Withdraw money from user's wallet"
                    : "Send money to user's wallet safely and instantly"
                  }
                </p>
              </div>
              <div className="flex items-center gap-3 bg-background/50 p-3 rounded-lg backdrop-blur-sm">
                <Label htmlFor="transfer-mode" className="text-sm font-medium">Reverse Transfer</Label>
                <Switch
                  id="transfer-mode"
                  checked={isReverseTransfer}
                  onCheckedChange={setIsReverseTransfer}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="grid md:grid-cols-[1.2fr,0.8fr] divide-x h-full">
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-primary" />
                      {isReverseTransfer ? "Select Source User" : "Select Recipient"}
                    </div>
                  </Label>
                  
                  <Card className="overflow-hidden">
                    <Select
                      value={formData.receiptMobileNumber}
                      onValueChange={(value) => handleSelectChange(value, "receiptMobileNumber")}
                    >
                      <SelectTrigger className="h-[80px] border-0 bg-transparent p-4">
                        {selectedUser ? (
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <UserIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-lg font-semibold truncate">{selectedUser.owner_name}</div>
                              <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                                {selectedUser.shop_name && (
                                  <>
                                    <span>{selectedUser.shop_name}</span>
                                    <span>•</span>
                                  </>
                                )}
                                <span>+91 {selectedUser.mobile_number}</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="ml-auto">
                              {selectedUser.groupDetails?.group_name}
                            </Badge>
                          </div>
                        ) : (
                          <SelectValue placeholder="Choose a recipient" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <div className="sticky top-0 p-2 bg-background border-b">
                          <Input
                            placeholder="Search by name, shop, or number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="p-0 max-h-[300px] overflow-y-auto">
                          {filteredUsers.length === 0 ? (
                            <div className="p-2 text-sm text-center text-muted-foreground">
                              No users found
                            </div>
                          ) : (
                            filteredUsers.map((user) => (
                              <SelectItem
                                key={user.mobile_number}
                                value={user.mobile_number.toString()}
                                className="p-2 m-1 rounded-md cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <UserIcon className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{user.owner_name}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <span className="truncate">{user.shop_name}</span>
                                      {user.shop_name && <span>•</span>}
                                      <span className="shrink-0">+91 {user.mobile_number}</span>
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="shrink-0">
                                    {user.groupDetails?.group_name}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-primary" />
                    Enter Amount
                  </Label>
                  <Card>
                    <CardContent className="p-4">
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-primary">₹</div>
                        <Input
                          id="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          placeholder="0.00"
                          type="number"
                          min="1"
                          className="pl-12 h-16 text-3xl font-semibold"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="p-6 space-y-6 bg-muted/5">
                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Select Wallet
                  </Label>
                  <div className="space-y-3">
                    {walletOptions.map((wallet) => (
                      <Card
                        key={wallet.id}
                        className={cn(
                          "relative cursor-pointer transition-all hover:shadow-md overflow-hidden",
                          formData.targetWallet === wallet.id
                            ? "border-primary ring-1 ring-primary"
                            : "hover:border-primary/50"
                        )}
                        onClick={() => handleSelectChange(wallet.id, "targetWallet")}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{wallet.icon}</div>
                            <div className="flex-1">
                              <div className="font-medium">{wallet.label}</div>
                              <div className="text-sm text-muted-foreground">{wallet.description}</div>
                            </div>
                            {formData.targetWallet === wallet.id && (
                              <div className="h-3 w-3 rounded-full bg-primary" />
                            )}
                          </div>
                          {selectedUser && formData.targetWallet === wallet.id && (
                            <div className="mt-4 pt-4 border-t text-sm leading-relaxed">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Available Balance</span>
                                <span className="font-semibold">
                                  ₹{Number(selectedUser[wallet.id as keyof User] ?? 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-6 bg-muted/5">
            <div className="flex items-center justify-between gap-4 max-w-[1000px] mx-auto">
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {selectedUser && formData.targetWallet && formData.amount && (
                  <div className="rounded-lg bg-primary/5 p-2 text-sm">
                    <div className="font-medium text-primary">Transaction Summary</div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserIcon className="w-3 h-3" />
                      {isReverseTransfer ? "From:" : "To:"} {selectedUser.owner_name}
                      <span className="mx-2 text-primary">|</span>
                      <Wallet className="w-3 h-3" />
                      {walletOptions.find((w) => w.id === formData.targetWallet)?.label}
                    </div>
                  </div>
                )}
              </motion.div>
              <div className="flex gap-2">
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
                  className="min-w-[130px]"
                  disabled={isSubmitting || !formData.amount || !formData.receiptMobileNumber || !formData.targetWallet}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isReverseTransfer ? 'Withdraw' : 'Transfer'}
                      <ArrowRight className={cn("ml-2 h-4 w-4 transition-transform", 
                        isReverseTransfer && "rotate-180")} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferMoneyDialog;
