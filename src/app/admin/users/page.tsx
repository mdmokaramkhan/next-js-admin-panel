"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import PageContainer from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { User, columns } from "./columns";
import { AddUserModal } from "@/app/admin/users/add-user-modal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal visibility state
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("allUsers", "GET", null, router);
      if (response.success) {
        setTotalUsers(response.totalUser);
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

  const handleAddUser = async (user: {
    name: string;
    email: string;
    role: string;
  }) => {
    try {
      const response = await apiRequest("addUser", "POST", user, router); // Replace with your API endpoint
      if (response.success) {
        toast.success("User added successfully!");
        setUsers([...users, response.data]); // Add new user to the list
      } else {
        toast.warning("Failed to add user.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add user."
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={50} color="#4B5563" />
      </div>
    );
  }

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Users"
            description="Manage your users and their roles here."
          />
          <Button className="space-x-1" onClick={() => setIsModalOpen(true)}>
            <UserPlus /> Add User
          </Button>
        </div>
        <Separator />
        {/* <DataTable columns={columns} data={users} totalItems={totalUsers} />
         */}
        <DataTable
          columns={columns}
          data={users}
          pageSizeOptions={[10, 20, 50]}
          loading={loading}
        />
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddUser}
      />
    </PageContainer>
  );
}
