"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { ResponseGroup } from "../columns";

interface CheckResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: ResponseGroup[];
}

export function CheckResponseDialog({
  open,
  onOpenChange,
  groups,
}: CheckResponseDialogProps) {
  const [message, setMessage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Get unique groups
  const uniqueGroups = Array.from(
    new Map(groups.map(group => [group.group_name, group])).values()
  );

  const handleCheck = async () => {
    if (!message || !selectedGroup) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("responses/check", "POST", {
        message: message, // Send raw message without additional processing
        group: selectedGroup,
      });

      console.log("Request payload:", { message, group: selectedGroup });
      console.log("API Response:", response);

      if (!response) {
        toast.error("No response received from server");
        return;
      }

      if (response.success) {
        if (response.data?.response === null) {
          setResult(response.data);
          toast.warning("No matching response found for this message");
          return;
        }

        setResult(response.data);
        toast.success("Response checked successfully");
      } else {
        if (response.error === "No response data found") {
          toast.warning("No response data found");
        } else {
          toast.error(response.message || "Failed to process response check");
        }
      }
    } catch (error) {
      console.error("Request Error Details:", error);
      toast.error("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setSelectedGroup("");
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Check Response</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Select
              value={selectedGroup}
              onValueChange={setSelectedGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {uniqueGroups.map((group) => (
                  <SelectItem key={group.id} value={group.group_name}>
                    {group.group_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Enter response message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>
          {result && (
            <div className="rounded-lg bg-muted p-4">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleCheck} disabled={loading}>
              {loading ? "Checking..." : "Check Response"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
