import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ParsingTableProps {
  moduleId: string;
  data: any[];
  onStatusChange: (id: string, status: boolean) => void;
  onEdit: (parsing: any) => void;
  onDelete: (parsing: any) => void;
}

export function ParsingTable({ moduleId, data, onStatusChange, onEdit, onDelete }: ParsingTableProps) {
  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-5 gap-4 p-4 font-medium">
        <div>Provider Code</div>
        <div>Parsing</div>
        <div>Allowed Amounts</div>
        <div>Status</div>
        <div>Actions</div>
      </div>
      {data.map((item) => (
        <div key={item.id} className="grid grid-cols-5 gap-4 p-4 border-t items-center">
          <div>{item.provider_code}</div>
          <div className="truncate max-w-[200px]" title={item.parsing}>
            {item.parsing}
          </div>
          <div>{item.allowed_amounts}</div>
          <div>
            <Switch
              checked={item.status}
              onCheckedChange={(checked) => onStatusChange(item.id, checked)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item)}
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
