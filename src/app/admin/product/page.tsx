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
import { AddProductSheet } from "./_components/add-product-modal";

import type { Product } from "./columns";
import { columns } from "./columns";

export default function Product() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null); // Track the product being edited
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

  const handleAddProduct = (newProduct: Product) => {
    console.log(newProduct);
    setProducts((prevProducts) =>
      prevProducts.some((prod) => prod.id === newProduct.id)
        ? prevProducts.map((prod) =>
            prod.id === newProduct.id ? newProduct : prod
          )
        : [...prevProducts, newProduct]
    );
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
          <Button className="space-x-1" onClick={() => setIsModalOpen(true)}>
            <PlusCircleIcon /> Add Product
          </Button>
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={products}
          pageSizeOptions={[10, 20, 50]}
          loading={loading}
        />
      </div>
      <AddProductSheet
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null); // Reset the product being edited
        }}
        onAddProduct={handleAddProduct}
        productToEdit={productToEdit} // Pass the product to edit
      />
    </PageContainer>
  );
}
