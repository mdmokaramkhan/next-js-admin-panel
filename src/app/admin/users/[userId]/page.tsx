"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { ChevronLeft, Edit, SendHorizontal } from "lucide-react";

import { apiRequest } from "@/lib/api";
import PageContainer from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransferMoneyDialog from "../components/send-money-modal";
import { User } from "../columns";
import { transferColumns, Transfer } from "./transfers-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "./data-table";
import { transactionColumns, Transaction } from "./transactions-columns";
import { statementColumns } from "./statements-columns";

// Update Statement interface
interface Statement {
  id: number;
  mobile_number: number;
  shop_name: string;
  amount: number;
  price: string;
  transaction_id: number | null;
  transfer_id: number | null;
  inbox_id: number | null;
  wallet_type: string;
  statement_type: number;
  balance: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function UserDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  // Core state
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Transfer dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transferFormData, setTransferFormData] = useState({
    amount: "",
    receiptMobileNumber: "",
    targetWallet: "rch_bal",
  });

  // Tab state
  const [activeTab, setActiveTab] = useState("transactions");
  const [tabLoading, setTabLoading] = useState(false);

  // Initialize date state as null initially
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Add transfers state
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  // Add transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // Add statements state
  const [statements, setStatements] = useState<Statement[]>([]);

  // Add a flag to track initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiRequest(
          `/users/${resolvedParams.userId}`,
          "GET"
        );
        if (response?.success && response.data) {
          setUserData(response.data || []);
          // Set initial date range only after user data is loaded
          if (isInitialLoad) {
            const today = new Date();
            setDate({
              from: today,
              to: today,
            });
            setIsInitialLoad(false);
          }
        } else {
          toast.error("Failed to fetch user data");
          setTimeout(() => router.push("/admin/users"), 1500);
        }
      } catch {
        toast.error("Error fetching user data");
        setTimeout(() => router.push("/admin/users"), 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [resolvedParams.userId, router, isInitialLoad]);

  // Fetch users for transfer dialog
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await apiRequest("users", "GET");
      if (response?.success) setUsers(response.data);
    };
    fetchUsers();
  }, []);

  // Modified fetch data effect
  useEffect(() => {
    const fetchData = async () => {
      if (!date.from || !date.to || !userData?.mobile_number) return;
      
      setTabLoading(true);
      try {
        const dateParams = `startDate=${format(date.from, "yyyy-MM-dd")}&endDate=${format(date.to, "yyyy-MM-dd")}`;
        
        let endpoint = "";
        switch (activeTab) {
          case "transfers":
            endpoint = `transfers/date-range?${dateParams}`;
            break;
          case "transactions":
            endpoint = `transactions/date-range?${dateParams}`;
            break;
          case "statements":
            endpoint = `statements/user/date-range?mobile_number=${userData.mobile_number}&${dateParams}`;
            break;
          default:
            return;
        }

        const response = await apiRequest(endpoint, "GET");
        
        if (response?.success) {
          switch (activeTab) {
            case "transfers":
              setTransfers(response.data);
              break;
            case "transactions":
              setTransactions(response.data);
              break;
            case "statements":
              setStatements(response.data);
              break;
          }
        }
      } catch (error) {
        toast.error(`Failed to fetch ${activeTab}`);
      } finally {
        setTabLoading(false);
      }
    };

    fetchData();
  }, [activeTab, userData?.mobile_number, date.from, date.to]);

  // Transfer money handlers
  const handleSendMoney = (wallet = "rch_bal") => {
    if (!userData) return;
    setTransferFormData({
      amount: "",
      receiptMobileNumber: userData.mobile_number.toString(),
      targetWallet: wallet,
    });
    setIsDialogOpen(true);
  };

  const handleTransferSubmit = async (formData: any) => {
    try {
      const response = await apiRequest(
        "transactions/transfer",
        "POST",
        formData
      );
      if (response.success) {
        toast.success("Money transferred successfully");
        setIsDialogOpen(false);
      } else {
        toast.error("Transfer failed");
      }
    } catch {
      toast.error("Error processing transfer");
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-[120px]" />
              <Skeleton className="h-10 w-[120px]" />
            </div>
          </div>
          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!userData) {
    return (
      <PageContainer>
        <div className="text-center">
          <p className="text-muted-foreground">No user data found</p>
        </div>
      </PageContainer>
    );
  }

  // Replace the existing TabLoadingSkeleton with this new version
  const TabLoadingSkeleton = () => (
    <div>
      <div className="border rounded-md">
        <div className="border-b">
          <div className="flex h-10 items-center gap-4 px-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-[100px]" />
            ))}
          </div>
        </div>
        <div className="p-0">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center gap-4 border-b p-4 last:border-0"
            >
              {[1, 2, 3, 4, 5].map((col) => (
                <Skeleton key={col} className="h-4 w-[100px]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PageContainer>
      {/* Header */}
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
            <Heading title="User Details" description="" />
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => handleSendMoney()} variant="outline">
              <SendHorizontal className="mr-2 h-4 w-4" /> Send Money
            </Button>
            <Button
              onClick={() => router.push(`/admin/users/edit/${userData.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit User
            </Button>
          </div>
        </div>
        <Separator />

        {/* User information cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                User's personal and shop details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Owner Name
                  </p>
                  <p>{userData.owner_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Shop Name
                  </p>
                  <p>{userData.shop_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p>{userData.email_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p>+91 {userData.mobile_number}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Address
                  </p>
                  <p>{userData.address || "N/A"}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge variant={userData.status ? "default" : "destructive"}>
                    {userData.status ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Role
                  </p>
                  <Badge variant="outline">
                    {userData.groupDetails?.group_name}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    KYC Status
                  </p>
                  <Badge
                    variant={userData.isVerified ? "default" : "secondary"}
                  >
                    {userData.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p>{format(new Date(userData.createdAt), "PPP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modified Wallet Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
              <CardDescription>
                Balance and minimum balance details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Recharge Balance
                    </p>
                    <p className="text-2xl font-bold">
                      ₹{userData.rch_bal.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Min: ₹{userData.rch_min_bal.toLocaleString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMoney("rch_bal")}
                      className="w-full mt-2"
                    >
                      <SendHorizontal className="w-4 h-4 mr-2" />
                      Send to Recharge
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Utility Balance
                    </p>
                    <p className="text-2xl font-bold">
                      ₹{userData.utility_bal.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Min: ₹{userData.utility_min_bal.toLocaleString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMoney("utility_bal")}
                      className="w-full mt-2"
                    >
                      <SendHorizontal className="w-4 h-4 mr-2" />
                      Send to Utility
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      DMT Balance
                    </p>
                    <p className="text-2xl font-bold">
                      ₹{userData.dmt_bal.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Min: ₹{userData.dmt_min_bal.toLocaleString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMoney("dmt_bal")}
                      className="w-full mt-2"
                    >
                      <SendHorizontal className="w-4 h-4 mr-2" />
                      Send to DMT
                    </Button>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Callback URL
                  </p>
                  <p className="break-all">
                    {userData.callback_url || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last IP Address
                  </p>
                  <p>{userData.ip_address || "Not available"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Failed Login Attempts
                  </p>
                  <p>{userData.failedLoginAttempts}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </p>
                  <p>{format(new Date(userData.updatedAt), "PPP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs section */}
        <div className="mt-6">
          <Tabs
            defaultValue="transactions"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="transfers">Transfers</TabsTrigger>
                <TabsTrigger value="statements">Statements</TabsTrigger>
                <TabsTrigger value="login-logs">Login Logs</TabsTrigger>
              </TabsList>
              {/* Date range picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={(range) => setDate({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transactions History</CardTitle>
                  <CardDescription>
                    View all transactions made by this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tabLoading ? (
                    <TabLoadingSkeleton />
                  ) : (
                    <DataTable
                      columns={transactionColumns}
                      data={transactions}
                      searchKey="number"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transfers">
              <Card>
                <CardHeader>
                  <CardTitle>Transfer History</CardTitle>
                  <CardDescription>
                    View all transfers made by this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tabLoading ? (
                    <TabLoadingSkeleton />
                  ) : (
                    <DataTable
                      columns={transferColumns}
                      data={transfers}
                      searchKey="end_shop_name"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statements">
              <Card>
                <CardHeader>
                  <CardTitle>Account Statements</CardTitle>
                  <CardDescription>View user's account statements and balance history</CardDescription>
                </CardHeader>
                <CardContent>
                  {tabLoading ? (
                    <TabLoadingSkeleton />
                  ) : (
                    <DataTable
                      columns={statementColumns}
                      data={statements}
                      searchKey="description"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="login-logs">
              <Card>
                <CardHeader>
                  <CardTitle>Login History</CardTitle>
                  <CardDescription>View user's login activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {tabLoading ? <TabLoadingSkeleton /> : <h1>Login infos</h1>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Transfer money dialog */}
        <TransferMoneyDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          onSubmit={handleTransferSubmit}
          users={users}
          formData={transferFormData}
          handleChange={(e) =>
            setTransferFormData((prev) => ({
              ...prev,
              [e.target.id]: e.target.value,
            }))
          }
          handleSelectChange={(value, field) =>
            setTransferFormData((prev) => ({ ...prev, [field]: value }))
          }
          isSubmitting={loading}
        />
      </div>
    </PageContainer>
  );
}
