"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api"; // Adjust the path as needed
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AddMoney {
  id: number;
  mobile_number: number;
  shop_name: string;
  amount: number;
  wallet_type: string;
  balance: string;
  description: string;
  createdAt: string;
}

export function RecentAddMoney() {
  const [addMoneyRecords, setAddMoneyRecords] = useState<AddMoney[]>([]); // Store the recent "Add Money" records
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    // Fetch the last 5 "Add Money" records from the API
    const fetchAddMoney = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest("/transfers/recent", "GET"); // Adjust the endpoint as needed
        if (data.success) {
          setAddMoneyRecords(data.data || []); // Set the fetched data or fallback to an empty array
        } else {
          setAddMoneyRecords([]); // Fallback if the response is not successful
        }
      } catch (err) {
        console.error("Error fetching Add Money records:", err);
        setError("Failed to load Add Money records. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddMoney();
  }, []);

  // Function to format the amount to INR currency format
  // const formatAmount = (amount: number) => {
  //   return new Intl.NumberFormat("en-IN", {
  //     style: "currency",
  //     currency: "INR",
  //     minimumFractionDigits: 0,
  //   }).format(amount);
  // };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center animate-pulse space-x-4"
          >
            {/* Skeleton Avatar */}
            <div className="h-9 w-9 rounded-full bg-gray-200"></div>
            {/* Skeleton Text */}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
            </div>
            {/* Skeleton Amount */}
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (addMoneyRecords.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No Add Money records found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {addMoneyRecords.map((record) => (
        <div key={record.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {record.shop_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {record.shop_name}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {record.description}
              </p>
              <Badge variant="secondary" className="capitalize text-xs">
                {record.wallet_type.replace('_bal', '').toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(record.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-medium text-green-500">
              +₹{record.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Balance: ₹{parseFloat(record.balance).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
