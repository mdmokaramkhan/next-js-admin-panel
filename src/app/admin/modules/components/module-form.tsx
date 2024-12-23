import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ModuleFormData {
  id: string;
  module_name: string;
  response_group: string;
  username: string;
  password: string;
  api_key: string;
  method: string;
  balance: number;
  recharge_url: string;
  balance_url: string | null;
}

interface ModuleFormProps {
  module: Partial<ModuleFormData>;
  onSave: (data: Partial<ModuleFormData>) => Promise<void>;
  onCancel: () => void;
}

export function ModuleForm({ module, onSave, onCancel }: ModuleFormProps) {
  const [formData, setFormData] = useState<ModuleFormData>({
    id: module.id || '',
    module_name: module.module_name || '',
    response_group: module.response_group || '',
    username: module.username || '',
    password: module.password || '',
    api_key: module.api_key || '',
    method: module.method || 'GET',
    balance: module.balance || 0,
    recharge_url: module.recharge_url || '',
    balance_url: module.balance_url || '',
  });

  const handleInputChange = (field: keyof ModuleFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await onSave(formData);
    }} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label>Module Name</label>
          <Input 
            required
            value={formData.module_name}
            onChange={(e) => handleInputChange('module_name', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label>Response Group</label>
          <Input 
            required
            value={formData.response_group}
            onChange={(e) => handleInputChange('response_group', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label>Username</label>
          <Input 
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label>Password</label>
          <Input 
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label>API Key</label>
          <Input 
            value={formData.api_key}
            onChange={(e) => handleInputChange('api_key', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label>Method</label>
          <Input 
            required
            value={formData.method}
            onChange={(e) => handleInputChange('method', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label>Balance</label>
          <Input 
            type="number"
            step="0.0001"
            value={formData.balance}
            onChange={(e) => handleInputChange('balance', parseFloat(e.target.value))}
          />
        </div>

        <div className="grid gap-2">
          <label>Recharge URL</label>
          <Input 
            required
            value={formData.recharge_url}
            onChange={(e) => handleInputChange('recharge_url', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label>Balance URL</label>
          <Input 
            value={formData.balance_url || ''}
            onChange={(e) => handleInputChange('balance_url', e.target.value)}
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
