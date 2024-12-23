"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { providerOptions } from "@/constants/options";
import { apiRequest } from "@/lib/api";
import { Product } from "../columns";

interface AddProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void; // Function to handle both add and update
  productToEdit: Product | null;
}

export function AddProductSheet({
  isOpen,
  onClose,
  onAddProduct,
  productToEdit,
}: AddProductSheetProps) {
  const [providerName, setProviderName] = useState("");
  const [providerCode, setProviderCode] = useState("");
  const [providerType, setProviderType] = useState("");
  const [providerLogo, setProviderLogo] = useState("");
  const [minAmount, setMinAmount] = useState<number | string>("");
  const [maxAmount, setMaxAmount] = useState<number | string>("");
  const [blockedAmount, setBlockedAmount] = useState<string | null>("");
  const [minLength, setMinLength] = useState<number | string>("");
  const [maxLength, setMaxLength] = useState<number | string>("");
  const [targetWallet, setTargetWallet] = useState<"rch_bal" | "utility_bal" | "dmt_bal">("rch_bal");
  const [loading, setLoading] = useState(false); // Add loading state

  // Sync state with productToEdit when it changes
  useEffect(() => {
    if (productToEdit) {
      setProviderName(productToEdit.provider_name || "");
      setProviderCode(productToEdit.provider_code || "");
      setProviderType(productToEdit.provider_type || "");
      setProviderLogo(productToEdit.provider_logo || "");
      setMinAmount(productToEdit.min_amount || "");
      setMaxAmount(productToEdit.max_amount || "");
      setBlockedAmount(productToEdit.blocked_amount || "");
      setMinLength(productToEdit.min_length || "");
      setMaxLength(productToEdit.max_length || "");
      setTargetWallet(productToEdit.target_wallet || "rch_bal");
    }
  }, [productToEdit]);

  const handleSubmit = async () => {
    if (
      !providerName ||
      !providerCode ||
      !providerType ||
      !providerLogo ||
      !minAmount ||
      !maxAmount ||
      !minLength ||
      !maxLength ||
      !targetWallet
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const newProduct: Partial<Product> & Omit<Product, 'id'> = {
      provider_name: providerName,
      provider_code: providerCode,
      provider_type: providerType,
      provider_logo: providerLogo,
      min_amount: parseInt(minAmount as string, 10),
      max_amount: parseInt(maxAmount as string, 10),
      blocked_amount: blockedAmount || null,
      min_length: parseInt(minLength as string, 10),
      max_length: parseInt(maxLength as string, 10),
      target_wallet: targetWallet,
      status: true,
    };

    if (productToEdit) {
      // If updating, include the product ID
      newProduct.id = productToEdit.id;
    }

    setLoading(true); // Start loading state

    try {
      const response = await apiRequest(
        productToEdit ? `providers/${productToEdit.id}` : "providers",
        productToEdit ? "PUT" : "POST",
        newProduct
      );
      if (response.success) {
        toast.success(
          productToEdit
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        onAddProduct(response.data); // Pass the updated/added product to parent component
      } else {
        toast.error(response.message || "Failed to add/update product.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add/update product."
      );
    } finally {
      setLoading(false); // End loading state
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setProviderName("");
    setProviderCode("");
    setProviderType("");
    setProviderLogo("");
    setMinAmount("");
    setMaxAmount("");
    setBlockedAmount("");
    setMinLength("");
    setMaxLength("");
    setTargetWallet("rch_bal");
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{productToEdit ? "Update Product" : "Add Product"}</SheetTitle>
          <p className="text-sm text-gray-500 mt-2">
            {productToEdit ? "Update the details of this product." : "Fill in the details below to add a new product."}
          </p>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <Input
            placeholder="Provider Name"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            required
          />
          <Input
            placeholder="Provider Code"
            value={providerCode}
            onChange={(e) => setProviderCode(e.target.value)}
            required
          />
          <Select value={providerType} onValueChange={setProviderType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Provider Type" />
            </SelectTrigger>
            <SelectContent>
              {providerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Provider Logo URL"
            value={providerLogo}
            onChange={(e) => setProviderLogo(e.target.value)}
            required
          />
          <Input
            placeholder="Minimum Amount"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            required
          />
          <Input
            placeholder="Maximum Amount"
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            required
          />
          <Input
            placeholder="Blocked Amount (Optional)"
            value={blockedAmount || ""}
            onChange={(e) => setBlockedAmount(e.target.value)}
          />
          <Input
            placeholder="Minimum Length"
            type="number"
            value={minLength}
            onChange={(e) => setMinLength(e.target.value)}
            required
          />
          <Input
            placeholder="Maximum Length"
            type="number"
            value={maxLength}
            onChange={(e) => setMaxLength(e.target.value)}
            required
          />
          <Select value={targetWallet} onValueChange={(value) => setTargetWallet(value as "rch_bal" | "utility_bal" | "dmt_bal")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Wallet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rch_bal">RCH Wallet</SelectItem>
              <SelectItem value="utility_bal">Utility Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : productToEdit ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
