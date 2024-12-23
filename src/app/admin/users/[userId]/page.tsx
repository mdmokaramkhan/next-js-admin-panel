"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import PageContainer from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ userId: string }>;
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'PPP');
  } catch (error) {
    return 'Invalid date';
  }
}

export default function UserDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        // Fix 1: Add leading slash to API endpoint
        const response = await apiRequest(`/users/${resolvedParams.userId}`, "GET");
        
        // Fix 2: Improved error handling
        if (mounted) {
          if (response && response.success && response.data) {
            setUserData(response.data);
          } else {
            console.error('API Response:', response); // For debugging
            toast.error(response?.message || "Failed to fetch user data");
            // Fix 3: Add delay before redirect
            setTimeout(() => {
              router.push("/admin/users");
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Fetch Error:', error); // For debugging
        if (mounted) {
          toast.error("Error fetching user data");
          setTimeout(() => {
            router.push("/admin/users");
          }, 1500);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [resolvedParams.userId, router]);

  // Fix 4: Better loading state
  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading user details...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Fix 5: Check for userData before rendering
  if (!userData) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">No user data found</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/users")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Heading title="User Details" description="View user information" />
          </div>
          <Button
            onClick={() => router.push(`/admin/users/edit/${userData.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit User
          </Button>
        </div>
        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>User's personal and shop details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Owner Name</p>
                  <p>{userData.owner_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shop Name</p>
                  <p>{userData.shop_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{userData.email_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>+91 {userData.mobile_number}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>{userData.address || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Current account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={userData.status ? "default" : "destructive"}>
                    {userData.status ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <Badge variant="outline">{userData.groupDetails?.group_name}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">KYC Status</p>
                  <Badge variant={userData.isVerified ? "default" : "secondary"}>
                    {userData.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p>{formatDate(userData.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Information */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
              <CardDescription>Balance and minimum balance details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recharge Balance</p>
                    <p className="text-2xl font-bold">₹{userData.rch_bal.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Min: ₹{userData.rch_min_bal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Utility Balance</p>
                    <p className="text-2xl font-bold">₹{userData.utility_bal.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Min: ₹{userData.utility_min_bal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">DMT Balance</p>
                    <p className="text-2xl font-bold">₹{userData.dmt_bal.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Min: ₹{userData.dmt_min_bal.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Other user details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Callback URL</p>
                  <p className="break-all">{userData.callback_url || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last IP Address</p>
                  <p>{userData.ip_address || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed Login Attempts</p>
                  <p>{userData.failedLoginAttempts}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p>{formatDate(userData.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
