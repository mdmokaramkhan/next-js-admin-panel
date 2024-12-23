"use client";

import { useState, useEffect } from "react";
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
import { LogInIcon, Loader2, AtSign, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/utils/cookies";
import AuthLayout from "@/components/auth-layout"; // Update import

export default function LoginPage() {

  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check for token on mount and redirect if it exists
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      router.push("/admin"); // Redirect to /admin if token exists
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("auth/login", "POST", {
        username,
        password,
      });
      toast.success(data.message, {
        position: "top-right",
      });
      router.push(`/auth/otp-verification?tempToken=${username}`);
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
        <CardHeader className="space-y-3">
          <div className="grid grid-flow-col justify-between mb-3">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Login
              </CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access your account
              </CardDescription>
            </div>
            <ModeToggle />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="tel"
                    placeholder="Enter your username"
                    required
                    value={username}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 transition-all hover:border-primary/50 focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-xs underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 transition-all hover:border-primary/50 focus:border-primary"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full transition-all hover:shadow-lg hover:shadow-primary/25" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    <LogInIcon /> Login
                  </>
                )}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="underline">
                Sign up
              </Link>
            </div>
          </form>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
