"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api"; // Adjust the path as needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentTransfers() {
  const [transfers, setTransfers] = useState<any[]>([]); // Store the recent transfers

  useEffect(() => {
    // Fetch recent transfers from the API
    const fetchTransfers = async () => {
      try {
        const data = await apiRequest("getAllTransfers", "GET"); // Adjust the endpoint as needed
        setTransfers(data);
      } catch (error) {
        console.error("Error fetching transfers:", error);
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

  return (
    <div className="space-y-8">
      {transfers.map((transfer) => (
        <div key={transfer.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            {/* Avatar Image is based on a logic, here we are using a fallback */}
            <AvatarImage src={`/avatars/${transfer.id}.png`} alt="Avatar" />
            <AvatarFallback>
              {transfer.end_shop_name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transfer.end_shop_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {transfer.description}
            </p>
          </div>
          <div className="ml-auto font-medium">
            <span
              className={
                transfer.amount > 0 ? "text-green-500" : "text-red-500"
              }
            >
              {formatAmount(transfer.amount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
