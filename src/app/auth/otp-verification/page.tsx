"use client";

import React from "react";
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
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { getAuthToken, setAuthToken } from "@/utils/cookies";
import AuthLayout from "@/components/auth-layout";

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tempToken = searchParams.get("tempToken");

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      router.push("/admin");
      return;
    }

    if (!tempToken) {
      toast.error("Invalid session. Please log in again.");
      router.push("/auth/login");
    }
  }, [tempToken, router]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest("/auth/verify-otp", "POST", {
        username: tempToken,
        userOTP: otp,
      });

      if (data.token) {
        setAuthToken(data.token);
        toast.success("Login successful!");
        router.push("/admin/overview");
      } else {
        throw new Error("Authentication failed. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!tempToken) return;

    setResending(true);
    try {
      await apiRequest("/auth/resend-otp", "POST", {
        username: tempToken,
      });
      toast.success("New OTP has been sent to your email");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">
            Verify your identity
          </CardTitle>
          <CardDescription>
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                className="gap-2"
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
              disabled={loading || !otp || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Verify OTP
                </>
              )}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
              </Link>
              <Button
                variant="link"
                className="text-muted-foreground hover:text-primary p-0 h-auto font-normal"
                disabled={resending}
                onClick={handleResendOTP}
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend code"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
