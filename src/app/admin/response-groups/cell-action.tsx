"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { ResponseGroup } from "./columns";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertModal } from "@/components/modal/alert-modal";
import { AddResponseGroupSheet } from "./_components/add-response-group-modal";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface CellActionProps {
  data: ResponseGroup;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editGroup, setEditGroup] = useState<ResponseGroup | null>(null);
  const router = useRouter();

  const handleDeleteGroup = () => {
    setOpenDeleteModal(true);
  };

  const handleEditGroup = () => {
    setEditGroup(data);
    setOpenEditModal(true);
  };

  const onDeleteConfirm = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        `/responses/${data.id}`, // Changed from response-groups to responses
        "DELETE", 
        { id: data.id }, 
        router
      );
      if (response.success) {
        toast.success("Response group deleted successfully!");
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete response group.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete response group.");
    } finally {
      setLoading(false);
      setOpenDeleteModal(false);
    }
  };

  return (
    <>
      <AddResponseGroupSheet
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        onAddGroup={(newGroup) => {
          router.refresh();
          setOpenEditModal(false);
        }}
        groupToEdit={editGroup}
      />
      
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
          <DropdownMenuItem onClick={handleEditGroup}>
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteGroup}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
