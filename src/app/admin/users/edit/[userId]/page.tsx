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

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function EditUserPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const response = await apiRequest(`users/${resolvedParams.userId}`, "GET");
        if (mounted && response.success) {
          // Transform null values to empty strings or default values
          const transformedData = {
            owner_name: response.data.owner_name || "",
            email_address: response.data.email_address || "",
            mobile_number: response.data.mobile_number || "",
            shop_name: response.data.shop_name || "",
            address: response.data.address || "",
            group_code: response.data.group_code || "",
            callback_url: response.data.callback_url || "",
            rch_min_bal: response.data.rch_min_bal || 0,
            utility_min_bal: response.data.utility_min_bal || 0,
            dmt_min_bal: response.data.dmt_min_bal || 0,
          };
          setFormData(transformedData);
        } else {
          toast.error("Failed to fetch user data");
          router.push("/admin/users");
        }
      } catch (error) {
        if (mounted) {
          toast.error("Error fetching user data");
          router.push("/admin/users");
        }
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
  }, [resolvedParams.userId, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiRequest(
        `users/${resolvedParams.userId}`,
        "PUT",
        formData
      );
      if (response.success) {
        toast.success("User updated successfully");
        router.push("/admin/users");
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      toast.error("Error updating user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading
            title="Edit User"
            description="Update user information here."
          />
        </div>
        <Separator />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input
                id="owner_name"
                value={getInputValue(formData.owner_name)}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_address">Email Address</Label>
              <Input
                id="email_address"
                value={getInputValue(formData.email_address)}
                onChange={handleChange}
                placeholder="john@example.com"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                value={getInputValue(formData.mobile_number)}
                onChange={handleChange}
                placeholder="1234567890"
                type="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop_name">Shop Name</Label>
              <Input
                id="shop_name"
                value={getInputValue(formData.shop_name)}
                onChange={handleChange}
                placeholder="Shop Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={getInputValue(formData.address)}
                onChange={handleChange}
                placeholder="Full Address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group_code">Role</Label>
              <Select
                onValueChange={handleSelectChange}
                value={formData.group_code}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="callback_url">Callback URL</Label>
              <Input
                id="callback_url"
                value={getInputValue(formData.callback_url)}
                onChange={handleChange}
                placeholder="https://example.com/callback"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rch_min_bal">Recharge Min Balance</Label>
              <Input
                id="rch_min_bal"
                value={getInputValue(formData.rch_min_bal)}
                onChange={handleChange}
                type="number"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utility_min_bal">Utility Min Balance</Label>
              <Input
                id="utility_min_bal"
                value={getInputValue(formData.utility_min_bal)}
                onChange={handleChange}
                type="number"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dmt_min_bal">DMT Min Balance</Label>
              <Input
                id="dmt_min_bal"
                value={getInputValue(formData.dmt_min_bal)}
                onChange={handleChange}
                type="number"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/users")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
