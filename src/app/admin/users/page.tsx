"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Send, UserPlus } from "lucide-react";
import PageContainer from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { UserTable } from "./components/user-table";
import { User, columns } from "./columns";
import AddUserDialog from "./components/add-user-modal"; // Import the Add User dialog component
import TransferMoneyDialog from "./components/send-money-modal"; // Import the new Transfer Money dialog component

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    owner_name: "",
    email_address: "",
    mobile_number: "",
    password: "",
    shop_name: "",
    address: "",
    group_code: "",
    callback_url: "",
  });
  const [transferData, setTransferData] = useState({
    amount: "",
    receiptMobileNumber: "",
    targetWallet: "rch_bal",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false); // Add state for Send Money dialog
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("users", "GET", null, router);
      if (response.success) {
        setUsers(response.data || []);
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      owner_name,
      email_address,
      mobile_number,
      password,
      shop_name,
      address,
      group_code,
    } = formData;
    if (
      !owner_name ||
      !email_address ||
      !mobile_number ||
      !password ||
      !shop_name ||
      !address ||
      !group_code
    ) {
      toast.error("All fields except Callback URL are required.");
      return;
    }
    if (!/^[0-9]+$/.test(mobile_number)) {
      toast.error("Mobile number must be a valid integer.");
      return;
    }
    const parsedMobileNumber = parseInt(mobile_number, 10);

    setIsSubmitting(true);
    try {
      const response = await apiRequest(
        "users",
        "POST",
        { ...formData, mobile_number: parsedMobileNumber },
        router
      );
      if (response.success) {
        toast.success("User added successfully!");
        setUsers((prev) => [...prev, response.data]); // Add new user to the table
        setIsDialogOpen(false); // Close dialog on success
      } else {
        toast.warning("Failed to add user.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add user."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferMoney = async (formData: {
    amount: number;
    receiptMobileNumber: string;
    targetWallet: string;
  }) => {
    const { amount, receiptMobileNumber, targetWallet } = formData;

    if (!amount || !receiptMobileNumber || !targetWallet) {
      toast.error("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest(
        "transfers/sendBalance",
        "POST",
        formData,
        router
      );
      if (response.status) {
        toast.success("Money sent successfully!");
        setIsTransferDialogOpen(false); // Close dialog on success
      } else {
        toast.warning("Failed to send money.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send money."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleTransferChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setTransferData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, group_code: value }));
  };

  const handleTransferSelectChange = (value: string, field: string) => {
    setTransferData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleTransferDialog = (event: CustomEvent) => {
      const { userId, mobileNumber } = event.detail;
      setTransferData(prev => ({
        ...prev,
        receiptMobileNumber: mobileNumber.toString()
      }));
      setIsTransferDialogOpen(true);
    };

    window.addEventListener('openTransferDialog', handleTransferDialog as EventListener);
    return () => {
      window.removeEventListener('openTransferDialog', handleTransferDialog as EventListener);
    };
  }, []);

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Users"
            description="Manage your users and their roles here."
          />
          <div>
            <Button
              variant="outline"
              className="space-x-1 mr-2"
              onClick={() => setIsTransferDialogOpen(true)}
            >
              <Send /> Send Money
            </Button>
            <Button className="space-x-1" onClick={() => setIsDialogOpen(true)}>
              <UserPlus /> Add User
            </Button>
            <AddUserDialog
              onSubmit={handleAddUser}
              isSubmitting={isSubmitting}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
            />
            <TransferMoneyDialog
              onSubmit={handleTransferMoney}
              isSubmitting={isSubmitting}
              isDialogOpen={isTransferDialogOpen}
              setIsDialogOpen={setIsTransferDialogOpen}
              users={users}
              formData={transferData}
              handleChange={handleTransferChange}
              handleSelectChange={handleTransferSelectChange}
            />
          </div>
        </div>
        <Separator />
        <UserTable
          columns={columns}
          data={users}
          pageSizeOptions={[10, 20, 50]}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
}
