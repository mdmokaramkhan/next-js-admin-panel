"use client";
import { useState, useEffect } from "react";
import type { SmsApi } from "@/types/sms-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface SmsApiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: SmsApi;
}

export function SmsApiModal({ open, onOpenChange, onSuccess, initialData }: SmsApiModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    providerName: "",
    baseUrl: "",
    method: "POST",
    type: "sms",
    params: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        providerName: initialData.providerName,
        baseUrl: initialData.baseUrl,
        method: initialData.method,
        type: initialData.type,
        params: initialData.params,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest(
        initialData ? `sms-api/${initialData.id}` : "sms-api",
        initialData ? "PUT" : "POST",
        formData
      );
      
      if (response.success) {
        toast.success(`SMS API ${initialData ? 'updated' : 'created'} successfully`);
        onSuccess();
        onOpenChange(false);
        resetForm();
      } else {
        throw new Error(response.message || `Failed to ${initialData ? 'update' : 'create'} SMS API`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${initialData ? 'update' : 'create'} SMS API`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      providerName: "",
      baseUrl: "",
      method: "POST",
      type: "sms",
      params: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add New'} SMS API</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="providerName">Provider Name</Label>
            <Input
              id="providerName"
              placeholder="e.g., Twilio, MessageBird"
              value={formData.providerName}
              onChange={(e) =>
                setFormData({ ...formData, providerName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">API Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as 'sms' | 'whatsapp' | 'email' })
              }
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms">SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <Label htmlFor="whatsapp">WhatsApp</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <Select
              value={formData.method}
              onValueChange={(value) =>
                setFormData({ ...formData, method: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              placeholder="https://api.example.com/v1/messages"
              value={formData.baseUrl}
              onChange={(e) =>
                setFormData({ ...formData, baseUrl: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="params">Parameters (JSON format)</Label>
            <Input
              id="params"
              placeholder='{"to": "recipient", "message": "text"}'
              value={formData.params}
              onChange={(e) =>
                setFormData({ ...formData, params: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Update' : 'Create'} API
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
