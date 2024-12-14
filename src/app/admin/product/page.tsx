"use client";

import PageContainer from "@/components/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { DataTable } from "./data-table";
import { DataTableSkeleton } from "@/components/ui/table1/data-table-skeleton";

import type { Product } from "./columns";
import { columns } from "./columns";

export default function Product() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await apiRequest("allProviders", "GET", null, router);
      if (response.success) {
        setProducts(response.data || []);
      } else {
        toast.warning("Products not loaded properly!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch Products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Product"
            description="Manage your products and their status here."
          />
          <Button className="space-x-1">
            <PlusCircleIcon /> Add Product
          </Button>
        </div>
        <Separator />
        {/* Use Skeleton loader during the loading state */}
        <DataTable
          columns={columns}
          data={products}
          pageSizeOptions={[10, 20, 50]}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
}
