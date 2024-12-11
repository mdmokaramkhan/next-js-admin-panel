"use client";

import React, { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { apiRequest } from "@/lib/api";
import { Lock, Loader2 } from "lucide-react";
import { getAuthToken, setAuthToken } from "@/utils/cookies";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const searchParams = useSearchParams();
  const tempToken = searchParams?.get("tempToken");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if(getAuthToken()) {
      router.push("/admin/");
    }
    if (!tempToken) {
      toast.error("Invalid session. Please log in again.");
      router.push("/auth/login");
    }
  }, [tempToken, router]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/verifyOTP", "POST", {
        username: tempToken,
        userOTP: otp,
      });
      if (data.token) {
        // Store the access token in cookies
        setAuthToken(data.token);

        // Navigate to the dashboard or protected page
        toast.success("Login successful!", { position: "top-right" });
        router.push("/admin/overview");
      } else {
        throw new Error("Access token not provided");
      }
    } catch (err: any) {
      toast.error(err.message, {
        position: "top-right",
      });
    } finally {
      setLoading(false);
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
            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Please wait
                </>
              ) : (
                <>
                  <Lock /> Verify OTP
                </>
              )}
            </Button>
            <div className="m-auto mt-3 text-xs text-center">
              <span>Didn&apos;t received code? </span>
              <Link href="#" className="underline">
                Resend OTP
              </Link>
            </div>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerification />
    </Suspense>
  );
}
