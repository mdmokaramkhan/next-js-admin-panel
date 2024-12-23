"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api"; // Adjust the path as needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Transfer {
  id: number;
  mobile_number: number;
  shop_name: string;
  amount: number;
  end_mobile_number: number;
  end_shop_name: string;
  transfer_type: number;
  target_wallet: string;
  balance: string;
  description: string;
  createdAt: string;
}

export function RecentTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]); // Store the recent transfers
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    // Fetch recent transfers from the API
    const fetchTransfers = async () => {
      setLoading(true); // Start loading
      setError(null); // Clear any previous errors
      try {
        const data = await apiRequest("transfers", "GET"); // Adjust the endpoint as needed
        if (data.success) {
          setTransfers(data.data || []); // Set transfers data or fallback to an empty array
        } else {
          setTransfers([]); // Fallback in case of no success
        }
      } catch (err) {
        console.error("Error fetching transfers:", err);
        setError("Failed to load transfers. Please try again later.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchTransfers();
  }, []);

  // Function to format the balance to INR currency format
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center">Loading transfers...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (transfers.length === 0) {
    return <div className="text-center text-muted-foreground">No transfers found.</div>;
  }

  return (
    <div className="space-y-8">
      {transfers.map((transfer) => (
        <div key={transfer.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {transfer.end_shop_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transfer.end_shop_name}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                To: {transfer.end_mobile_number}
              </p>
              <Badge variant="secondary" className="capitalize text-xs">
                {transfer.target_wallet.replace('_bal', '').toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(transfer.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-medium text-red-500">
              -₹{transfer.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Balance: ₹{parseFloat(transfer.balance).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
