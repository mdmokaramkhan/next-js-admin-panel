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
import { apiRequest } from "@/lib/api";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/auth-layout";

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
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">
            Forgot password?
          </CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" /> Send reset link
                  </>
                )}
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/auth/login" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
