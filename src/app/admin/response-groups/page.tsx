"use client";

import PageContainer from "@/components/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { DataTable } from "./data-table";
import { AddResponseGroupSheet } from "./_components/add-response-group-modal";

import type { ResponseGroup } from "./columns";
import { columns } from "./columns";

export default function ResponseGroups() {
  const [responseGroups, setResponseGroups] = useState<ResponseGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [groupToEdit, setGroupToEdit] = useState<ResponseGroup | null>(null);
  const router = useRouter();

  const fetchResponseGroups = useCallback(async () => {
    try {
      const response = await apiRequest("responses", "GET", null, router); // Changed from response-groups to responses
      if (response.success) {
        setResponseGroups(response.data || []);
      } else {
        toast.warning("Response Groups not loaded properly!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch Response Groups."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleAddResponseGroup = (newGroup: ResponseGroup) => {
    setResponseGroups((prevGroups) =>
      prevGroups.some((group) => group.id === newGroup.id)
        ? prevGroups.map((group) =>
            group.id === newGroup.id ? newGroup : group
          )
        : [...prevGroups, newGroup]
    );
  };

  useEffect(() => {
    fetchResponseGroups();
  }, [fetchResponseGroups]);

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Response Groups"
            description="Manage response groups and their configurations here."
          />
          <Button className="space-x-1" onClick={() => setIsModalOpen(true)}>
            <PlusCircleIcon /> Add Response Group
          </Button>
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={responseGroups}
          pageSizeOptions={[10, 20, 50]}
          loading={loading}
        />
      </div>
      <AddResponseGroupSheet
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setGroupToEdit(null);
        }}
        onAddGroup={handleAddResponseGroup}
        groupToEdit={groupToEdit}
      />
    </PageContainer>
  );
}
