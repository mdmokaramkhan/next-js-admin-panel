"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api"; // Correct import for apiRequest
import { DollarSign, CreditCard, Activity } from "lucide-react"; // Icons for wallets

export default function AddMoneyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("rch_bal");
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [step, setStep] = useState(1); // Step 1: Enter amount & wallet, Step 2: OTP verification
  const [loading, setLoading] = useState(false);

  const handleRequestBalance = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/transfers/request-admin", "POST", {
        amount: parseFloat(amount),
        targetWallet: wallet,
      });

      toast.success("OTP sent successfully!", {
        position: "top-right",
      });

      setTempToken(data.token); // Assuming the API response includes a `token`
      setStep(2); // Move to OTP verification step
    } catch (err) {
      toast.error(err.message || "Failed to request balance", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndAddBalance = async () => {
    setLoading(true);
    try {
      await apiRequest("/transfers/admin-balance", "POST", {
        userOTP: parseInt(otp, 10),
        token: tempToken,
      });

      toast.success("Money added successfully!", {
        position: "top-right",
      });

      setIsOpen(false);
      resetState(); // Reset state after success
    } catch (err) {
      toast.error(err.message || "Failed to verify OTP and add balance", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep(1);
    setAmount("");
    setWallet("rch_bal");
    setOtp("");
    setTempToken("");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetState(); // Reset state on dialog close
      }}
    >
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Add Money</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Add Money to Wallet" : "Enter OTP to Confirm"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter the amount and select the wallet to add money."
              : "Enter the OTP sent to your registered contact to confirm."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {step === 1 ? (
            <>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
              <Select
                onValueChange={(value) => setWallet(value)}
                defaultValue={wallet}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Wallets</SelectLabel>
                    <SelectItem value="rch_bal">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>RCH Wallet</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="utility_bal">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Utility Wallet</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dmt_bal">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4" />
                        <span>DMT Wallet</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </>
          ) : (
            <Input
              type="number"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button onClick={handleRequestBalance} disabled={loading}>
              {loading ? "Processing..." : "Next"}
            </Button>
          ) : (
            <Button onClick={handleVerifyAndAddBalance} disabled={loading}>
              {loading ? "Processing..." : "Submit"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
