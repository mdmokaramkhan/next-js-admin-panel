"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
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
import { DollarSign, CreditCard, Activity, Wallet } from "lucide-react"; // Icons for wallets

interface ApiResponse {
  success: boolean;
  token?: string;
  message?: string;
  status?: boolean;
}

export default function AddMoneyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("rch_bal");
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [step, setStep] = useState(1); // Step 1: Enter amount & wallet, Step 2: OTP verification
  const [loading, setLoading] = useState(false);

  const handleRequestBalance = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("/transfers/request-admin", "POST", {
        amount: parseFloat(amount),
        targetWallet: wallet,
      });

      if (response?.success && response?.token) {
        setTempToken(response.token);
        setStep(2);
        toast.success("OTP sent successfully!");
      } else {
        throw new Error(response?.message || "Failed to request balance");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request balance");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndAddBalance = async () => {
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("/transfers/admin-balance", "POST", {
        userOTP: parseInt(otp, 10),
        token: tempToken,
      });

      if (response?.success) {
        toast.success("Money added successfully!");
        setIsOpen(false);
        resetState();
      } else {
        throw new Error(response?.message || "Failed to verify OTP");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to verify OTP");
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
        <Button variant="outline">
          <Wallet className="w-4 h-4 mr-2" />
          Add Money
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 1 ? (
              <>
                <Wallet className="w-5 h-5" /> Add Money to Wallet
              </>
            ) : (
              <>
                <span className="text-primary">OTP Verification</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Add money to your desired wallet"
              : "Enter the verification code sent to your registered contact"}
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-4">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Wallet</Label>
                  <Select
                    onValueChange={(value) => setWallet(value)}
                    defaultValue={wallet}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Available Wallets</SelectLabel>
                        <SelectItem value="rch_bal">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span>RCH Wallet</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="utility_bal">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-500" />
                            <span>Utility Wallet</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dmt_bal">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-purple-500" />
                            <span>DMT Wallet</span>
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    disabled={loading}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Enter the 6-digit code sent to your device
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button onClick={handleRequestBalance} disabled={loading || !amount || parseFloat(amount) <= 0}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Next"
              )}
            </Button>
          ) : (
            <Button onClick={handleVerifyAndAddBalance} disabled={loading || !otp || otp.length < 6}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Add Money"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
