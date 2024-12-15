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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Money</DialogTitle>
          <DialogDescription>
            Enter the details to transfer money.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              amount: parseFloat(formData.amount),
              receiptMobileNumber: formData.receiptMobileNumber,
              targetWallet: formData.targetWallet,
            });
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="1000"
                type="number"
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="receiptMobileNumber" className="text-right">
                Mobile Number
              </Label>
              <Select
                value={formData.receiptMobileNumber}
                onValueChange={(value) =>
                  handleSelectChange(value, "receiptMobileNumber")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem
                      key={user.mobile_number}
                      value={user.mobile_number.toString()}
                    >
                      {user.mobile_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="targetWallet" className="text-right">
                Target Wallet
              </Label>
              <Select
                value={formData.targetWallet}
                onValueChange={(value) =>
                  handleSelectChange(value, "targetWallet")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rch_bal">RCH Balance</SelectItem>
                  <SelectItem value="utility_bal">Utility Balance</SelectItem>
                  <SelectItem value="dmt_bal">DMT Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Money"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferMoneyDialog;
