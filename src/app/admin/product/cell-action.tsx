"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Product } from "./columns";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertModal } from "@/components/modal/alert-modal";
import { AddProductSheet } from "./_components/add-product-modal";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface CellActionProps {
  data: Product;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);  // Track product to be edited
  const router = useRouter();

  const handleDeleteProduct = () => {
    setOpenDeleteModal(true);
  };

  const handleEditProduct = () => {
    setEditProduct(data); // Set the product data to be edited
    setOpenEditModal(true); // Open the edit modal
  };

  const onDeleteConfirm = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`/providers/${data.id}`, "DELETE", { id: data.id }, router);
      if (response.success) {
        toast.success("Product deleted successfully!");
      } else {
        toast.error(response.message || "Failed to delete product.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product.");
    } finally {
      setLoading(false);
      setOpenDeleteModal(false);
    }
  };

  return (
    <>
      {/* Edit Product Modal */}
      <AddProductSheet
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        onAddProduct={(newProduct) => {
          // Handle add or update logic here
          // Removed debug log to prevent sensitive data exposure
          setOpenEditModal(false);
        }}
        productToEdit={editProduct} // Pass product data to the edit modal
      />
      
      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={onDeleteConfirm}
        loading={loading}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {/* Update product */}
          <DropdownMenuItem onClick={handleEditProduct}>
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>

          {/* Delete product */}
          <DropdownMenuItem onClick={handleDeleteProduct}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
