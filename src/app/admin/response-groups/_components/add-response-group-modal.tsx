"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { ResponseGroup } from "../columns";

const RequiredLabel = ({ text }: { text: string }) => (
  <div className="mb-2">
    <span className="text-sm text-muted-foreground">{text}</span>
    <span className="text-red-500 ml-1">*</span>
  </div>
);

interface AddResponseGroupSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGroup: (group: ResponseGroup) => void;
  groupToEdit: ResponseGroup | null;
}

export function AddResponseGroupSheet({
  isOpen,
  onClose,
  onAddGroup,
  groupToEdit,
}: AddResponseGroupSheetProps) {
  const [formData, setFormData] = useState<Partial<ResponseGroup>>({
    group_name: "",
    txt_required: "",
    txt_not_required: "",
    txt_b_number: "",
    txt_a_number: "",
    txt_b_amount: "",
    txt_a_amount: "",
    txt_b_sn: "",
    txt_a_sn: "",
    txt_b_refid: "",
    txt_a_refid: "",
    status_code: 0,
    txt_b_module_bal: "",
    txt_a_module_bal: "",
    txt_b_lapu_id: "",
    txt_a_lapu_id: "",
    txt_b_roffer: "",
    txt_a_roffer: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (groupToEdit) {
      setFormData(groupToEdit);
    } else {
      setFormData({
        group_name: "",
        txt_required: "",
        txt_not_required: "",
        txt_b_number: "",
        txt_a_number: "",
        txt_b_amount: "",
        txt_a_amount: "",
        txt_b_sn: "",
        txt_a_sn: "",
        txt_b_refid: "",
        txt_a_refid: "",
        status_code: 0,
        txt_b_module_bal: "",
        txt_a_module_bal: "",
        txt_b_lapu_id: "",
        txt_a_lapu_id: "",
        txt_b_roffer: "",
        txt_a_roffer: "",
      });
    }
  }, [groupToEdit]);

  const handleSubmit = async () => {
    if (!formData.group_name || !formData.txt_required || !formData.status_code) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest(
        groupToEdit ? `responses/${groupToEdit.id}` : "responses",
        groupToEdit ? "PUT" : "POST",
        formData
      );
      
      if (response.success) {
        toast.success(
          groupToEdit
            ? "Response group updated successfully!"
            : "Response group added successfully!"
        );
        onAddGroup(response.data);
      } else {
        toast.error(response.message || "Failed to save response group.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save response group."
      );
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleChange = (field: keyof ResponseGroup, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {groupToEdit ? "Update Response Group" : "Add Response Group"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div>
            <RequiredLabel text="Group Name" />
            <Input
              placeholder="Group Name"
              value={formData.group_name}
              onChange={(e) => handleChange("group_name", e.target.value)}
              required
            />
          </div>
          
          <div>
            <RequiredLabel text="Required Text" />
            <Input
              placeholder="Required Text"
              value={formData.txt_required}
              onChange={(e) => handleChange("txt_required", e.target.value)}
              required
            />
          </div>

          <div>
            <span className="text-sm text-muted-foreground mb-2 block">Not Required Text</span>
            <Input
              placeholder="Not Required Text"
              value={formData.txt_not_required || ""}
              onChange={(e) => handleChange("txt_not_required", e.target.value)}
            />
          </div>

          <div>
            <RequiredLabel text="Before Number Text" />
            <Input
              placeholder="Before Number Text"
              value={formData.txt_b_number}
              onChange={(e) => handleChange("txt_b_number", e.target.value)}
              required
            />
          </div>

          <div>
            <RequiredLabel text="After Number Text" />
            <Input
              placeholder="After Number Text"
              value={formData.txt_a_number}
              onChange={(e) => handleChange("txt_a_number", e.target.value)}
              required
            />
          </div>

          <div>
            <RequiredLabel text="Before Amount Text" />
            <Input
              placeholder="Before Amount Text"
              value={formData.txt_b_amount}
              onChange={(e) => handleChange("txt_b_amount", e.target.value)}
              required
            />
          </div>

          <div>
            <RequiredLabel text="After Amount Text" />
            <Input
              placeholder="After Amount Text"
              value={formData.txt_a_amount}
              onChange={(e) => handleChange("txt_a_amount", e.target.value)}
              required
            />
          </div>

          <div>
            <span className="text-sm text-muted-foreground mb-2 block">Before SN Text</span>
            <Input
              placeholder="Before SN Text"
              value={formData.txt_b_sn || ""}
              onChange={(e) => handleChange("txt_b_sn", e.target.value)}
            />
          </div>

          <div>
            <span className="text-sm text-muted-foreground mb-2 block">After SN Text</span>
            <Input
              placeholder="After SN Text"
              value={formData.txt_a_sn || ""}
              onChange={(e) => handleChange("txt_a_sn", e.target.value)}
            />
          </div>

          <div>
            <RequiredLabel text="Status Code" />
            <Input
              placeholder="Status Code"
              type="number"
              value={formData.status_code}
              onChange={(e) => handleChange("status_code", parseInt(e.target.value))}
              required
            />
          </div>

          <div>
            <RequiredLabel text="Before Module Balance Text" />
            <Input
              placeholder="Before Module Balance Text"
              value={formData.txt_b_module_bal}
              onChange={(e) => handleChange("txt_b_module_bal", e.target.value)}
              required
            />
          </div>

          <div>
            <RequiredLabel text="After Module Balance Text" />
            <Input
              placeholder="After Module Balance Text"
              value={formData.txt_a_module_bal}
              onChange={(e) => handleChange("txt_a_module_bal", e.target.value)}
              required
            />
          </div>

          <div>
            <span className="text-sm text-muted-foreground mb-2 block">Before LAPU ID Text</span>
            <Input
              placeholder="Before LAPU ID Text"
              value={formData.txt_b_lapu_id || ""}
              onChange={(e) => handleChange("txt_b_lapu_id", e.target.value)}
            />
          </div>

          <div>
            <span className="text-sm text-muted-foreground mb-2 block">After LAPU ID Text</span>
            <Input
              placeholder="After LAPU ID Text"
              value={formData.txt_a_lapu_id || ""}
              onChange={(e) => handleChange("txt_a_lapu_id", e.target.value)}
            />
          </div>

          <div>
            <span className="text-sm text-muted-foreground mb-2 block">Before Roffer Text</span>
            <Input
              placeholder="Before Roffer Text"
              value={formData.txt_b_roffer || ""}
              onChange={(e) => handleChange("txt_b_roffer", e.target.value)}
            />
          </div>

          <div>
            <span className="text-sm text-muted-foreground mb-2 block">After Roffer Text</span>
            <Input
              placeholder="After Roffer Text"
              value={formData.txt_a_roffer || ""}
              onChange={(e) => handleChange("txt_a_roffer", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : groupToEdit ? "Update Group" : "Add Group"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
