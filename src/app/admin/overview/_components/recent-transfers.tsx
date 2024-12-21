"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api"; // Adjust the path as needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentTransfers() {
  const [transfers, setTransfers] = useState<any[]>([]); // Store the recent transfers
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    // Fetch recent transfers from the API
    const fetchTransfers = async () => {
      setLoading(true); // Start loading
      setError(null); // Clear any previous errors
      try {
        const data = await apiRequest("getAllTransfers", "GET"); // Adjust the endpoint as needed
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
            {/* Avatar Image with a fallback */}
            <AvatarImage src={`/avatars/${transfer.id}.png`} alt="Avatar" />
            <AvatarFallback>
              {transfer.end_shop_name ? transfer.end_shop_name.slice(0, 2) : "NA"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transfer.end_shop_name || "Unnamed Shop"}
            </p>
            <p className="text-sm text-muted-foreground">
              {transfer.description || "No description available"}
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
