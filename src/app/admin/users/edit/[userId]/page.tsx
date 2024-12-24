"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageContainer from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleOptions } from "../../columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SendHorizontal, AlertTriangle, Info, User, Store, Mail, Phone, MapPin, UserCog, Link2, Wallet } from "lucide-react";
import TransferMoneyDialog from "../../components/send-money-modal";
import { User as UserType } from "../../columns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function EditUserPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Add new state for balances and status
  const [balanceData, setBalanceData] = useState({
    rch_bal: "0",
    utility_bal: "0",
    dmt_bal: "0",
  });
  const [status, setStatus] = useState(false);
  const [formData, setFormData] = useState({
    owner_name: "",
    email_address: "",
    mobile_number: "",
    shop_name: "",
    address: "",
    group_code: "",
    callback_url: "",
    rch_min_bal: 0,
    utility_min_bal: 0,
    dmt_min_bal: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [transferFormData, setTransferFormData] = useState({
    amount: "",
    receiptMobileNumber: "",
    targetWallet: "",
  });

  // Add helper function for parsing decimal values
  const parseDecimalValue = (value: string | number | null | undefined): number => {
    if (!value) return 0;
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const response = await apiRequest(`users/${resolvedParams.userId}`, "GET");
        
        // Simplified validation - only check for success and data existence
        if (mounted && response?.success && response?.data) {
          const userData = response.data;
          
          // Rest of the data transformation
          setBalanceData({
            rch_bal: userData.rch_bal?.toString() || "0",
            utility_bal: userData.utility_bal?.toString() || "0",
            dmt_bal: userData.dmt_bal?.toString() || "0",
          });
          
          setStatus(Boolean(userData.status));
          
          setFormData({
            owner_name: userData.owner_name || "",
            email_address: userData.email_address || "",
            mobile_number: userData.mobile_number?.toString() || "",
            shop_name: userData.shop_name || "",
            address: userData.address || "",
            group_code: userData.group_code || "",
            callback_url: userData.callback_url || "",
            rch_min_bal: parseFloat(userData.rch_min_bal || "0"),
            utility_min_bal: parseFloat(userData.utility_min_bal || "0"),
            dmt_min_bal: parseFloat(userData.dmt_min_bal || "0"),
          });
          
          setLoading(false);
        } else {
          // Only log actual errors, not valid responses
          if (!response?.success) {
            console.error('API Response Error:', response);
            toast.error(response?.message || "Failed to load user data");
          }
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        toast.error("Error loading user data");
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
  }, [resolvedParams.userId]);

  const fetchUsers = async () => {
    try {
      const response = await apiRequest("users", "GET");
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error("Error fetching users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Transform any null values before rendering
  const getInputValue = (value: any) => {
    if (value === null || value === undefined) return "";
    return value;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, group_code: value }));
  };

  const handleTransferChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setTransferFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleTransferSelectChange = (value: string, field: string) => {
    setTransferFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Modify handle submit to use proper decimal parsing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Format the data before sending
      const updateData = {
        id: parseInt(resolvedParams.userId), // Add ID field
        ...formData,
        mobile_number: formData.mobile_number ? parseInt(formData.mobile_number) : undefined, // Convert to number
        rch_min_bal: parseDecimalValue(formData.rch_min_bal),
        utility_min_bal: parseDecimalValue(formData.utility_min_bal),
        dmt_min_bal: parseDecimalValue(formData.dmt_min_bal),
      };

      console.log("Submitting data:", updateData); // Debug log

      const response = await apiRequest(
        `users/${resolvedParams.userId}`,
        "PUT",
        updateData
      );
      
      if (response.success) {
        toast.success("User updated successfully");
        router.push("/admin/users");
      } else {
        // Handle array of error messages
        if (Array.isArray(response.message)) {
          response.message.forEach((msg: string) => toast.error(msg));
        } else {
          toast.error(response.message || "Failed to update user");
        }
      }
    } catch (error) {
      console.error('Update Error:', error);
      toast.error("Error updating user");
    } finally {
      setSubmitting(false);
    }
  };

  // Add status toggle handler
  const handleStatusChange = async (checked: boolean) => {
    try {
      const response = await apiRequest(
        `users/${resolvedParams.userId}/status`,
        "PUT",
        { status: checked }
      );
      if (response.success) {
        setStatus(checked);
        toast.success("Status updated successfully");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  // Add send money handler
  const handleSendMoney = () => {
    setIsDialogOpen(true);
  };

  const handleTransferSubmit = async (formData: {
    amount: number;
    receiptMobileNumber: string;
    targetWallet: string;
  }) => {
    try {
      const response = await apiRequest("transactions/transfer", "POST", formData);
      if (response.success) {
        toast.success("Money transferred successfully");
        setIsDialogOpen(false);
        // Refresh user data
        fetchUsers();
      } else {
        toast.error("Transfer failed");
      }
    } catch (error) {
      toast.error("Error processing transfer");
    }
  };

  // Add this helper function for input with icon
  const IconInput = ({ 
    icon: Icon, 
    ...props 
  }: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input {...props} className="pl-10" />
    </div>
  );

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
            <Heading title="Edit User" description="Update user information" />
          </div>
        </div>
        <Separator />

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Status Card - Modified */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Manage account status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Account Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {status ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <Switch
                    checked={status}
                    onCheckedChange={handleStatusChange}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSendMoney}
                  className="w-full"
                >
                  <SendHorizontal className="mr-2 h-4 w-4" />
                  Send Money
                </Button>
              </CardContent>
            </Card>

            {/* Balance Information Card - New */}
            <Card>
              <CardHeader>
                <CardTitle>Current Balance</CardTitle>
                <CardDescription>Available balance information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Recharge Balance
                      </p>
                      <p className="text-2xl font-bold">
                        ₹{parseFloat(balanceData.rch_bal).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Utility Balance
                      </p>
                      <p className="text-2xl font-bold">
                        ₹{parseFloat(balanceData.utility_bal).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        DMT Balance
                      </p>
                      <p className="text-2xl font-bold">
                        ₹{parseFloat(balanceData.dmt_bal).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>User's personal and shop details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="owner_name">Owner Name</Label>
                      <IconInput
                        icon={User}
                        id="owner_name"
                        value={getInputValue(formData.owner_name)}
                        onChange={handleChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shop_name">Shop Name</Label>
                      <IconInput
                        icon={Store}
                        id="shop_name"
                        value={getInputValue(formData.shop_name)}
                        onChange={handleChange}
                        placeholder="Shop Name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email_address">Email</Label>
                      <IconInput
                        icon={Mail}
                        id="email_address"
                        value={getInputValue(formData.email_address)}
                        onChange={handleChange}
                        type="email"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile_number">Mobile Number</Label>
                      <IconInput
                        icon={Phone}
                        id="mobile_number"
                        value={getInputValue(formData.mobile_number)}
                        onChange={handleChange}
                        type="tel"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <IconInput
                      icon={MapPin}
                      id="address"
                      value={getInputValue(formData.address)}
                      onChange={handleChange}
                      placeholder="Full Address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Role and callback configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group_code">Role</Label>
                    <div className="relative">
                      <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Select
                        onValueChange={handleSelectChange}
                        value={formData.group_code}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="callback_url">Callback URL</Label>
                    <IconInput
                      icon={Link2}
                      id="callback_url"
                      value={getInputValue(formData.callback_url)}
                      onChange={handleChange}
                      type="url"
                      placeholder="https://example.com/callback"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Settings</CardTitle>
                <CardDescription>Minimum balance configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rch_min_bal">Recharge Min Balance</Label>
                      <IconInput
                        icon={Wallet}
                        id="rch_min_bal"
                        value={getInputValue(formData.rch_min_bal)}
                        onChange={handleChange}
                        type="number"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="utility_min_bal">Utility Min Balance</Label>
                      <IconInput
                        icon={Wallet}
                        id="utility_min_bal"
                        value={getInputValue(formData.utility_min_bal)}
                        onChange={handleChange}
                        type="number"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dmt_min_bal">DMT Min Balance</Label>
                      <IconInput
                        icon={Wallet}
                        id="dmt_min_bal"
                        value={getInputValue(formData.dmt_min_bal)}
                        onChange={handleChange}
                        type="number"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Update Actions Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Update Actions</CardTitle>
                <CardDescription>Review and save your changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Important Information</AlertTitle>
                    <AlertDescription>
                      Please review all changes carefully before updating. Some changes may affect user's access and permissions.
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>The following changes require special attention:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Changing role affects user permissions</li>
                        <li>Updating minimum balances may impact transactions</li>
                        <li>Mobile number changes affect user login</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/admin/users")}
                      disabled={submitting}
                    >
                      Cancel Changes
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
      <TransferMoneyDialog
        onSubmit={handleTransferSubmit}
        isSubmitting={submitting}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        users={users}
        formData={transferFormData}
        handleChange={handleTransferChange}
        handleSelectChange={handleTransferSelectChange}
      />
    </PageContainer>
  );
}
