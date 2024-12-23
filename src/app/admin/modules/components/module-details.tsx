interface Module {
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

interface ModuleDetailsProps {
  module: Module | null;
}

export function ModuleDetails({ module }: ModuleDetailsProps) {
  if (!module) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <h4 className="font-medium">Module Name</h4>
        <p className="text-sm text-muted-foreground">{module.module_name}</p>
      </div>
      <div className="grid gap-2">
        <h4 className="font-medium">Response Group</h4>
        <p className="text-sm text-muted-foreground">{module.response_group}</p>
      </div>
      <div className="grid gap-2">
        <h4 className="font-medium">Username</h4>
        <p className="text-sm text-muted-foreground">{module.username || 'Not set'}</p>
      </div>
      <div className="grid gap-2">
        <h4 className="font-medium">API Key</h4>
        <p className="text-sm text-muted-foreground">{module.api_key || 'Not set'}</p>
      </div>
      <div className="grid gap-2">
        <h4 className="font-medium">Method</h4>
        <p className="text-sm text-muted-foreground">{module.method}</p>
      </div>
      <div className="grid gap-2">
        <h4 className="font-medium">Balance</h4>
        <p className="text-sm text-muted-foreground">₹ {module.balance}</p>
      </div>
      <div className="grid gap-2">
        <h4 className="font-medium">Recharge URL</h4>
        <p className="text-sm text-muted-foreground break-all">{module.recharge_url}</p>
      </div>
      {module.balance_url && (
        <div className="grid gap-2">
          <h4 className="font-medium">Balance URL</h4>
          <p className="text-sm text-muted-foreground break-all">{module.balance_url}</p>
        </div>
      )}
    </div>
  );
}
