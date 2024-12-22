import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, User, Phone, Store, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserInfo {
  name: string;
  shopName: string | null;
  mobile: number;
  role: string;
}

interface BalanceInfo {
  userInfo: UserInfo;
  rch_bal: number;
  rch_min_bal: number;
  utility_bal: number;
  utility_min_bal: number;
  dmt_bal: number;
  dmt_min_bal: number;
}

interface BalanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  balances: BalanceInfo;
}

const BalanceDialog: React.FC<BalanceDialogProps> = ({
  isOpen,
  onClose,
  balances,
}) => {
  const handleSendMoney = (walletType: string) => {
    window.dispatchEvent(new CustomEvent('openTransferDialog', { 
      detail: { 
        mobileNumber: balances.userInfo.mobile,
        targetWallet: walletType,
        selectedWalletType: walletType === 'rch_bal' ? 'Recharge' : 
                          walletType === 'utility_bal' ? 'Utility' : 'DMT'
      }
    }));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Wallet Overview</DialogTitle>
        </DialogHeader>

        {/* User Info Section */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{balances.userInfo.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{balances.userInfo.shopName || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">+91 {balances.userInfo.mobile}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{balances.userInfo.role}</Badge>
            </div>
          </div>
        </div>

        {/* Wallet Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Recharge Wallet */}
          <Card className="border bg-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="font-medium mb-4">Recharge</h3>
                <div className="text-2xl font-bold">
                  ₹{balances.rch_bal.toLocaleString()}
                </div>
                <Separator className="my-2" />
                <div className="text-xs text-muted-foreground">
                  Locked: ₹{balances.rch_min_bal.toLocaleString()}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleSendMoney("rch_bal")}
              >
                <Send className="h-4 w-4 mr-2" />
                Send RCH
              </Button>
            </CardFooter>
          </Card>

          {/* Utility Wallet */}
          <Card className="border bg-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="font-medium mb-4">Utility</h3>
                <div className="text-2xl font-bold">
                  ₹{balances.utility_bal.toLocaleString()}
                </div>
                <Separator className="my-2" />
                <div className="text-xs text-muted-foreground">
                  Locked: ₹{balances.utility_min_bal.toLocaleString()}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleSendMoney("utility_bal")}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Utility
              </Button>
            </CardFooter>
          </Card>

          {/* DMT Wallet */}
          <Card className="border bg-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="font-medium mb-4">DMT</h3>
                <div className="text-2xl font-bold">
                  ₹{balances.dmt_bal.toLocaleString()}
                </div>
                <Separator className="my-2" />
                <div className="text-xs text-muted-foreground">
                  Locked: ₹{balances.dmt_min_bal.toLocaleString()}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleSendMoney("dmt_bal")}
              >
                <Send className="h-4 w-4 mr-2" />
                Send DMT
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export type { BalanceDialogProps, BalanceInfo };
export default BalanceDialog;
