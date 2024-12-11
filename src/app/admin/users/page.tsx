"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import PageContainer from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { removeAuthToken } from "@/utils/cookies";

type User = {
  id: string;
  shop_name: string;
  mobile_number: string;
  email_address: string;
};
var totalUsers = 0;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("allUsers", "GET");
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
      </div>
    </PageContainer>
  );
}
