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
import { Wallet, Send, Loader2, User as UserIcon, IndianRupee, ArrowRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      <DialogContent className="sm:max-w-[95vw] md:max-w-[900px] p-0 max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {isReverseTransfer ? "Withdraw Money" : "Transfer Money"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            amount: isReverseTransfer
              ? parseFloat(formData.amount) * -1
              : parseFloat(formData.amount),
            receiptMobileNumber: formData.receiptMobileNumber,
            targetWallet: formData.targetWallet,
          });
        }} className="flex flex-col h-full">
          {/* Header Section */}
          <div className="px-6 py-5 border-b bg-gradient-to-r from-background via-muted/50 to-background relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-black/5" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold flex items-center gap-3 text-foreground/90">
                  <div className="p-2 rounded-full bg-primary/10 shadow-inner">
                    <Send className={cn("w-5 h-5 text-primary transition-transform", 
                      isReverseTransfer && "rotate-180")} />
                  </div>
                  {isReverseTransfer ? "Withdraw Money" : "Transfer Money"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1.5">
                  {isReverseTransfer 
                    ? "Securely withdraw funds from user's wallet"
                    : "Instantly transfer money to user's wallet"
                  }
                </p>
              </div>
              <div className="flex items-center gap-3 bg-card/50 p-2.5 rounded-full backdrop-blur-sm border shadow-sm">
                <Label htmlFor="transfer-mode" className="text-sm font-medium">Reverse</Label>
                <Switch
                  id="transfer-mode"
                  checked={isReverseTransfer}
                  onCheckedChange={setIsReverseTransfer}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <div className="grid lg:grid-cols-[1fr,auto] h-full">
              {/* Left Section - Main Content */}
              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* User Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                      <UserIcon className="w-4 h-4 text-primary" />
                      {isReverseTransfer ? "Source User" : "Recipient"}
                    </Label>
                    
                    <Card className="overflow-hidden border-none shadow-sm bg-card/50">
                      <Select
                        value={formData.receiptMobileNumber}
                        onValueChange={(value) => handleSelectChange(value, "receiptMobileNumber")}
                      >
                        <SelectTrigger className="h-[70px] border-0 bg-transparent p-3 focus:ring-1 focus:ring-primary/20">
                          <AnimatePresence mode="wait">
                            {selectedUser ? (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3"
                              >
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                                  <UserIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate text-foreground/90">{selectedUser.owner_name}</div>
                                  <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                    {selectedUser.shop_name && (
                                      <>
                                        <span className="truncate">{selectedUser.shop_name}</span>
                                        <span>•</span>
                                      </>
                                    )}
                                    <span className="shrink-0">+91 {selectedUser.mobile_number}</span>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="shrink-0 bg-primary/5 text-primary hover:bg-primary/10">
                                  {selectedUser.groupDetails?.group_name}
                                </Badge>
                              </motion.div>
                            ) : (
                              <SelectValue placeholder="Choose a recipient" />
                            )}
                          </AnimatePresence>
                        </SelectTrigger>
                        <SelectContent className="border-none shadow-sm bg-card/95 backdrop-blur-sm">
                          <div className="sticky top-0 p-2 bg-background/95 backdrop-blur-sm border-b">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="Search by name, shop, or number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 text-sm pl-9 pr-4 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20"
                              />
                            </div>
                          </div>
                          <div className="p-1.5 max-h-[250px] overflow-y-auto">
                            {filteredUsers.length === 0 ? (
                              <div className="p-3 text-sm text-center text-muted-foreground">
                                No users found
                              </div>
                            ) : (
                              filteredUsers.map((user) => (
                                <SelectItem
                                  key={user.mobile_number}
                                  value={user.mobile_number.toString()}
                                  className="p-2 rounded-lg cursor-pointer focus:bg-primary/5 data-[state=checked]:bg-primary/5"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                      <UserIcon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate text-foreground/90">{user.owner_name}</div>
                                      <div className="text-xs text-muted-foreground truncate">
                                        {user.shop_name && `${user.shop_name} • `}+91 {user.mobile_number}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                    </Card>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      Amount
                    </Label>
                    <Card className="border-none shadow-sm bg-card/50">
                      <CardContent className="p-3">
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-primary">₹</div>
                          <Input
                            id="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            type="number"
                            min="1"
                            className="pl-10 h-14 text-2xl font-semibold bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Right Section - Wallet Selection */}
              <div className="lg:w-[280px] p-6 space-y-4 overflow-y-auto bg-muted/5 border-t lg:border-t-0 lg:border-l">
                <Label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                  <Wallet className="w-4 h-4 text-primary" />
                  Select Wallet
                </Label>
                <div className="space-y-2.5">
                  {walletOptions.map((wallet) => (
                    <motion.div
                      key={wallet.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={cn(
                          "relative cursor-pointer transition-all overflow-hidden border-none bg-card/50",
                          formData.targetWallet === wallet.id
                            ? "ring-1 ring-primary/20 shadow-sm"
                            : "hover:ring-1 hover:ring-primary/10"
                        )}
                        onClick={() => handleSelectChange(wallet.id, "targetWallet")}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="text-lg bg-primary/10 w-9 h-9 rounded-full flex items-center justify-center shadow-inner">
                              {wallet.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-foreground/90">{wallet.label}</div>
                              <div className="text-xs text-muted-foreground">{wallet.description}</div>
                            </div>
                            {formData.targetWallet === wallet.id && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                          {selectedUser && formData.targetWallet === wallet.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-2.5 pt-2.5 border-t"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Available Balance</span>
                                <span className="font-medium text-sm">
                                  ₹{Number(selectedUser[wallet.id as keyof User] ?? 0).toFixed(2)}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-muted/5">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4 px-2">
              <AnimatePresence>
                {selectedUser && formData.targetWallet && formData.amount && (
                  <motion.div 
                    className="flex-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="rounded-lg bg-card/50 p-3 border shadow-sm">
                      <div className="font-medium text-primary text-sm">Transaction Summary</div>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>{isReverseTransfer ? "From" : "To"}:</span>
                          <span className="font-medium text-foreground/90">{selectedUser.owner_name}</span>
                        </div>
                        <span className="text-primary/40">•</span>
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5" />
                          <span className="font-medium text-foreground/90">
                            {walletOptions.find((w) => w.id === formData.targetWallet)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  size="sm"
                  className="text-xs font-medium px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className={cn(
                    "min-w-[120px] text-xs font-medium relative overflow-hidden",
                    isSubmitting && "text-transparent"
                  )}
                  disabled={isSubmitting || !formData.amount || !formData.receiptMobileNumber || !formData.targetWallet}
                >
                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                  <span className="flex items-center gap-1.5">
                    {isReverseTransfer ? 'Withdraw' : 'Transfer'}
                    <ArrowRight className={cn("w-3.5 h-3.5 transition-transform", 
                      isReverseTransfer && "rotate-180")} />
                  </span>
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
