import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface ParsingTableProps {
  moduleId: string;
  data: any[];
  modules?: any[]; // Add modules prop
  onStatusChange: (id: string, status: boolean) => Promise<boolean>; // Modified to return success status
  onEdit: (parsing: any) => void;
  onDelete: (parsing: any) => void;
}

export function ParsingTable({ data, modules = [], onStatusChange, onEdit, onDelete }: ParsingTableProps) {
  const [localStatuses, setLocalStatuses] = useState<Record<string, boolean>>({});

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    // Store the previous status
    const previousStatus = localStatuses[id] ?? data.find(item => item.id === id)?.status ?? false;
    
    // Optimistically update the UI
    setLocalStatuses(prev => ({ ...prev, [id]: newStatus }));

    // Try to update the status
    const success = await onStatusChange(id, newStatus);

    if (!success) {
      // Revert to previous state if the update failed
      setLocalStatuses(prev => ({ ...prev, [id]: previousStatus }));
    }
  };

  const getItemStatus = (item: any) => {
    return localStatuses[item.id] ?? item.status;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>{/* Remove whitespace between elements */}
          <TableHead>Provider</TableHead>{/* Remove whitespace between elements */}
          <TableHead>Module</TableHead>{/* Remove whitespace between elements */}
          <TableHead>Parsing</TableHead>{/* Remove whitespace between elements */}
          <TableHead>Allowed Amounts</TableHead>{/* Remove whitespace between elements */}
          <TableHead>Status</TableHead>{/* Remove whitespace between elements */}
          <TableHead className="text-right">Actions</TableHead>{/* Remove whitespace between elements */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>{/* Remove whitespace between elements */}
            <TableCell className="font-medium">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/images/${item.provider.provider_logo}`} alt={item.provider.provider_name}/>{/* Remove whitespace */}
                  <AvatarFallback>{item.provider.provider_name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.provider.provider_name}</span>
                  <span className="text-xs text-muted-foreground">{item.provider.provider_type} ~ {item.provider_code}</span>
                </div>
              </div>
            </TableCell>{/* Remove whitespace between elements */}
            <TableCell>
              <span className="text-sm">{modules.find(m => m.id === item.module_id)?.module_name || 'Unknown Module'}</span>
            </TableCell>{/* Remove whitespace between elements */}
            <TableCell className="max-w-[200px] truncate">{item.parsing}</TableCell>{/* Remove whitespace between elements */}
            <TableCell>{item.allowed_amounts}</TableCell>{/* Remove whitespace between elements */}
            <TableCell>
              <Switch checked={getItemStatus(item)} onCheckedChange={(checked) => handleStatusChange(item.id, checked)}/>
            </TableCell>{/* Remove whitespace between elements */}
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                  <Pencil className="h-4 w-4"/>
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDelete(item)}>
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </div>
            </TableCell>{/* Remove whitespace between elements */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
