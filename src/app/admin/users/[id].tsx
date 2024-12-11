"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type User = {
  id: string;
  shop_name: string;
  mobile_number: string;
  email_address: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("getAllUsers", "GET");
      setUsers(response.data || []);
      toast.success("Users loaded successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => toast.info("Add User functionality coming soon!")}>Add User</Button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded shadow">
        {loading ? (
          <p className="p-4 text-center">Loading...</p>
        ) : users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Shop Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.shop_name}</TableCell>
                  <TableCell>{user.mobile_number}</TableCell>
                  <TableCell>{user.email_address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="p-4 text-center">No users found.</p>
        )}
      </div>
    </div>
  );
}
