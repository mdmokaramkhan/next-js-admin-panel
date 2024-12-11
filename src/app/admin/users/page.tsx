"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Plus } from "lucide-react";
import PageContainer from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { DataTable } from "@/components/ui/table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type User = {
  id: string;
  shop_name: string;
  mobile_number: string;
  email_address: string;
  rch_bal: number | null;
  isVerified: boolean | null;
  address: string | null;
  profile_pic: string | null;
  owner_name: string | null;
};

var totalUsers = 0;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("allUsers", "GET", null, router);
      if (response.success) {
        totalUsers = response.totalUser;
        setUsers(response.data || []);
        toast.success("Users loaded successfully!");
      } else {
        toast.warning("Users not loaded properly!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      header: "Shop Name",
      accessorKey: "shop_name",
      cell: ({ row }: { row: { getValue: (key: string) => string | null } }) => {
        const shopName = row.getValue("shop_name");
        return shopName ?? "Not Set"; // Show "Not Set" if value is null or undefined
      },
    },
    {
      header: "",
      accessorKey: "profile_pic",
      cell: ({ row }: { row: { getValue: (key: string) => string | null } }) => {
        const profilePic = row.getValue("profile_pic");
        const ownerName = row.getValue("shop_name");
  
        // If profile picture exists, show it; otherwise, show the first letter of owner_name
        return (
          <Avatar className="size-6">
            {profilePic ? (
              <AvatarImage src={profilePic} alt="Profile Picture" />
            ) : (
              <AvatarFallback delayMs={600}>
                {ownerName ? ownerName.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            )}
          </Avatar>
        );
      },
    },
    {
      header: "Mobile Number",
      accessorKey: "mobile_number",
      cell: ({ row }: { row: { getValue: (key: string) => string | null } }) => {
        const mobileNumber = row.getValue("mobile_number");
        return mobileNumber ?? "Not Set"; // Show "Not Set" if value is null or undefined
      },
    },
    {
      header: "Email Address",
      accessorKey: "email_address",
      cell: ({ row }: { row: { getValue: (key: string) => string | null } }) => {
        const emailAddress = row.getValue("email_address");
        return emailAddress ?? "Not Set"; // Show "Not Set" if value is null or undefined
      },
    },
    {
      header: "Balance",
      accessorKey: "rch_bal",
      cell: ({ row }: { row: { getValue: (key: string) => number | null } }) => {
        const balance = row.getValue("rch_bal");
        // Format balance as INR (Indian Rupees)
        if (balance === null || balance === undefined) {
          return "Not Set"; // Show "Not Set" if balance is null or undefined
        }
        const formattedBalance = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0, // Adjust based on your preference
        }).format(balance);
  
        return formattedBalance; // Return the formatted balance in INR
      },
    },
    {
      header: "KYC",
      accessorKey: "isVerified",
      cell: ({ row }: { row: { getValue: (key: string) => boolean | null } }) => {
        const isVerified = row.getValue("isVerified");
  
        if (isVerified === null || isVerified === undefined) {
          return "Not Set"; // Return "Not Set" for null or undefined
        }
  
        return isVerified ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-yellow-500" />
        );
      },
    },
    {
      header: "Address",
      accessorKey: "address",
      cell: ({ row }: { row: { getValue: (key: string) => string | null } }) => {
        const address = row.getValue("address");
        return address ?? "Not Set"; // Show "Not Set" if value is null or undefined
      },
    },
  ];

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title={`Employee (${totalUsers})`}
            description="Manage employees (Server side table functionalities.)"
          />
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
        <Separator />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Add Table Here */}
          </div>
        </div>
        {/* <EmployeeTable data={employee} totalData={totalUsers} /> */}
        <DataTable columns={columns} data={users} totalItems={totalUsers} />
      </div>
    </PageContainer>
  );
}
