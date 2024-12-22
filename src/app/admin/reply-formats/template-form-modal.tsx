"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { MessageTemplate, modeOptions } from "./columns";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: MessageTemplate;
  onSuccess: () => void;
}

export function TemplateFormModal({ isOpen, onClose, template, onSuccess }: TemplateFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<MessageTemplate>>(template || {
    type: "",
    mode: "email",
    active: true,
    subject: "",
    template: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const method = "POST";
      const path = template ? "updateMessageTemplate" : "createMessageTemplate";
      const response = await apiRequest(
        path,
        method,
        { ...formData, id: template?.id }
      );

      if (response.success) {
        toast.success(template ? "Template updated" : "Template created");
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || "Failed to save template");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Create Template"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label>Type</label>
              <Input
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label>Mode</label>
              <Select
                value={formData.mode}
                onValueChange={(value: any) => setFormData({ ...formData, mode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {modeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {formData.mode === "email" && (
            <div className="space-y-2">
              <label>Subject</label>
              <Input
                value={formData.subject || ""}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label>Template</label>
            <Textarea
              required
              rows={8}
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <label>Active</label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (template ? "Update" : "Create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
