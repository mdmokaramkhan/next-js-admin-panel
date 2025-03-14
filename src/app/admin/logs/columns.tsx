import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, AlertCircle, Info, AlertTriangle, Globe, Clock, Hash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type Log = {
  id: number;
  type: "info" | "warning" | "error";
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
  context: {
    ip?: string;
  } | null;
  requestData: Record<string, any> | null;
  requestPath: string | null;
  createdAt: string;
  updatedAt: string;
};

const JsonViewer = ({ data, title }: { data: Record<string, any>; title: string }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className="gap-1.5">
        <Terminal className="h-3.5 w-3.5" />
        View {title}
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-[800px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          {title}
        </DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[600px]">
        <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

const LogTypeIcon = ({ type }: { type: Log['type'] }) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-600" />;
    default:
      return null;
  }
};

export const logColumns: ColumnDef<Log>[] = [
  {
    accessorKey: "id",
    header: () => (
      <div className="flex items-center gap-1">
        <Hash className="h-4 w-4" />
        <span>ID</span>
      </div>
    ),
    cell: ({ row }) => (
      <code className="font-mono text-xs px-1.5 py-0.5 bg-muted rounded">
        {row.original.id}
      </code>
    ),
  },
  {
    accessorKey: "timestamp",
    header: () => (
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        <span>Timestamp</span>
      </div>
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="font-mono text-sm">
              {format(new Date(row.original.timestamp), "HH:mm:ss")}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{format(new Date(row.original.timestamp), "PPpp")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "type",
    header: "Level",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <div className="flex items-center gap-1.5">
          <LogTypeIcon type={type} />
          <Badge
            variant={
              type === "error"
                ? "destructive"
                : type === "warning"
                ? "secondary"
                : "default"
            }
            className="font-mono text-xs"
          >
            {type.toUpperCase()}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "requestPath",
    header: () => (
      <div className="flex items-center gap-1">
        <Globe className="h-4 w-4" />
        <span>Path</span>
      </div>
    ),
    cell: ({ row }) => {
      const path = row.original.requestPath;
      if (!path) return <span className="text-muted-foreground">-</span>;
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <code className="font-mono text-xs px-1.5 py-0.5 bg-muted rounded truncate max-w-[200px] block">
                {path}
              </code>
            </TooltipTrigger>
            <TooltipContent>
              <p>{path}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div className="max-w-[400px] truncate font-mono text-sm">
        {row.original.message}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Details",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.metadata && Object.keys(row.original.metadata).length > 0 && (
          <JsonViewer data={row.original.metadata} title="Metadata" />
        )}
        {row.original.requestData && Object.keys(row.original.requestData).length > 0 && (
          <JsonViewer data={row.original.requestData} title="Request Data" />
        )}
        {row.original.context && Object.keys(row.original.context).length > 0 && (
          <JsonViewer data={row.original.context} title="Context" />
        )}
      </div>
    ),
  },
];
