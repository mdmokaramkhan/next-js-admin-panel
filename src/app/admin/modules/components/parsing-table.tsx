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
  onStatusChange: (id: string, status: boolean) => Promise<boolean>; // Modified to return success status
  onEdit: (parsing: any) => void;
  onDelete: (parsing: any) => void;
}

export function ParsingTable({ moduleId, data, onStatusChange, onEdit, onDelete }: ParsingTableProps) {
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
        <TableRow>
          <TableHead>Provider</TableHead>
          <TableHead>Parsing</TableHead>
          <TableHead>Allowed Amounts</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={`/images/${item.provider.provider_logo}`} 
                    alt={item.provider.provider_name} 
                  />
                  <AvatarFallback>{item.provider.provider_name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.provider.provider_name}</span>
                  <span className="text-xs text-muted-foreground">{item.provider.provider_type} ~ {item.provider_code}</span>
                </div>
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">{item.parsing}</TableCell>
            <TableCell>{item.allowed_amounts}</TableCell>
            <TableCell>
              <Switch
                checked={getItemStatus(item)}
                onCheckedChange={(checked) => handleStatusChange(item.id, checked)}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
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
                  className="text-red-500"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
