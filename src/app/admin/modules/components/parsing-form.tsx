"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface ParsingFormData {
  id?: string;
  provider_code: string;
  parsing: string;
  allowed_amounts: string;
  status: boolean;
}

interface ParsingFormProps {
  parsing: Partial<ParsingFormData>;
  onSave: (data: Partial<ParsingFormData>) => Promise<void>;
  onCancel: () => void;
}

export function ParsingForm({ parsing, onSave, onCancel }: ParsingFormProps) {
  const [formData, setFormData] = useState<ParsingFormData>({
    id: parsing.id || '',
    provider_code: parsing.provider_code || '',
    parsing: parsing.parsing || '',
    allowed_amounts: parsing.allowed_amounts || '',
    status: parsing.status ?? true,
  });

  const handleInputChange = (field: keyof ParsingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await onSave(formData);
    }} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label>Provider Code</label>
          <Input 
            required
            value={formData.provider_code}
            onChange={(e) => handleInputChange('provider_code', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label>Parsing String</label>
          <Textarea 
            required
            value={formData.parsing}
            onChange={(e) => handleInputChange('parsing', e.target.value)}
            className="min-h-[100px] font-mono text-sm"
            placeholder="Enter parsing configuration..."
          />
        </div>

        <div className="grid gap-2">
          <label>Allowed Amounts</label>
          <Input
            value={formData.allowed_amounts}
            onChange={(e) => handleInputChange('allowed_amounts', e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <label className="text-base">Active Status</label>
            <div className="text-sm text-muted-foreground">
              Enable or disable this parsing configuration
            </div>
          </div>
          <Switch
            checked={formData.status}
            onCheckedChange={(checked) => handleInputChange('status', checked)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Save Changes</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
