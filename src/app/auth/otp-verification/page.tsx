"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function OTPVerification() {
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });

      if (!res.ok) {
        toast.error("Invalid Otp", {
          position: "top-right",
        });
        toast.success("OTP Verified!", {
          position: "top-right",
        });
      } else {
        toast.success("OTP Verified!", {
          position: "top-right",
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card>
        <CardHeader className="mt-5">
          <CardTitle className="text-center">OTP Verification</CardTitle>
          <CardDescription>
            We have sent the verification code to your email address.
          </CardDescription>
          <CardContent>
            <div className="m-5">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={handleVerify} className="w-full">
              <Lock className="w-6 h-6 text-white-500 stroke-2" />
              Verify OTP
            </Button>
            <div className="m-auto mt-3 text-xs text-center">
              <Link href="#">Resend OTP</Link>
            </div>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
