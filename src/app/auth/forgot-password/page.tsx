"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/ThemeToggle";
import { apiRequest } from "@/lib/api";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/auth-layout"; // Add import

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiRequest("/auth/reset-password", "POST", {
        email,
      });
      toast.success(data.message || "Reset link sent to your email", {
        position: "top-right",
      });
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message, {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="mx-auto max-w-sm glass-card">
        <CardHeader>
          <div className="grid grid-flow-col justify-between mb-3">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <ModeToggle />
          </div>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" /> Send Reset Link
                  </>
                )}
              </Button>
              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link href="/auth/login" className="underline">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
