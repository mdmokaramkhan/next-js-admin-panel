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

const JsonViewer = ({ data }: { data: Record<string, any> }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="link" className="text-blue-500 underline">
        View Details
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Details</DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[400px]">
        <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

export const logColumns: ColumnDef<Log>[] = [
  {
    accessorKey: "timestamp",
    header: "Time",
    cell: ({ row }) => format(new Date(row.original.timestamp), "PPpp"),
  },
  {
    accessorKey: "type",
    header: "Level",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge
          variant={
            type === "error"
              ? "destructive"
              : type === "warning"
              ? "secondary"
              : "default"
          }
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "requestPath",
    header: "Path",
    cell: ({ row }) => row.original.requestPath || "-",
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div className="max-w-[400px] truncate">{row.original.message}</div>
    ),
  },
  {
    accessorKey: "metadata",
    header: "Details",
    cell: ({ row }) => <JsonViewer data={row.original.metadata} />,
  }
];
