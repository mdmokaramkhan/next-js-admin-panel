"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import PageContainer from "@/components/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function UserDetailsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query; // Assuming the route is like /users/[id]

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`getUserById/${id}`, "GET");
      if (response.success) {
        setUser(response.data);
      } else {
        console.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 size={50} color="#4B5563" />
      </div>
    );
  }

  if (!user) {
    return <div>No user details found</div>;
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <Heading
          title={user.shop_name || "User Details"}
          description={`Details of ${user.owner_name}`}
        />
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Shop Name:</h3>
            <p>{user.shop_name || "Not Set"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Owner Name:</h3>
            <p>{user.owner_name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Mobile Number:</h3>
            <p>{user.mobile_number}</p>
          </div>
          <div>
            <h3 className="font-semibold">Email Address:</h3>
            <p>{user.email_address}</p>
          </div>
          <div>
            <h3 className="font-semibold">Role:</h3>
            <p>{user.groupDetails?.group_name || "Not Set"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Balance:</h3>
            <p>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
              }).format(user.rch_bal)}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">KYC Status:</h3>
            <p>{user.isVerified ? "Verified" : "Not Verified"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Address:</h3>
            <p>{user.address || "Not Set"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status:</h3>
            <p>{user.status ? "Active" : "Inactive"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Profile Picture:</h3>
            {user.profile_pic ? (
              <img
                src={user.profile_pic}
                alt="Profile"
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <p>No Picture</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold">Recharge Minimum Balance:</h3>
            <p>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
              }).format(user.rch_min_bal)}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Utility Balance:</h3>
            <p>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
              }).format(user.utility_bal)}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Utility Minimum Balance:</h3>
            <p>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
              }).format(user.utility_min_bal)}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">DMT Balance:</h3>
            <p>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
              }).format(user.dmt_bal)}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">DMT Minimum Balance:</h3>
            <p>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
              }).format(user.dmt_min_bal)}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Parent Number:</h3>
            <p>{user.parent_number || "Not Set"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Callback URL:</h3>
            <p>{user.callback_url || "Not Set"}</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
