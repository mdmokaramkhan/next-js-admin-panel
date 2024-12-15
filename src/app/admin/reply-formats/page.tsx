"use client";

import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageTemplate, messageTemplateColumns } from "./columns";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { DataTable } from "./data-table";

export default function ReplyFormats() {
  const [replyFormats, setReplyFormats] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchReplyFormats = async () => {
    try {
      const response = await apiRequest(
        "allMessageTemplates",
        "GET",
        null,
        router
      );
      if (response.success) {
        setReplyFormats(response.data || []);
      } else {
        toast.warning("ReplyFormats not loaded properly!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch ReplyFormats."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplyFormats();
  }, []);
  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Notification Formats"
            description="Manage your reply formats and their status here."
          />
          <Button className="space-x-1">
            <PlusCircleIcon /> Manage Formats
          </Button>
        </div>
        <Separator />
        <DataTable
          columns={messageTemplateColumns}
          data={replyFormats}
          pageSizeOptions={[10, 20, 50]}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
}
