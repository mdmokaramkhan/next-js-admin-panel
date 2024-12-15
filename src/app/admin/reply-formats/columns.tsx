import * as React from "react";
const beautify = require('js-beautify').html;
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Replace with your modal components
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type MessageTemplate = {
  id?: number;
  type: string;
  mode: "email" | "sms" | "whatsapp";
  active: boolean;
  subject?: string | null;
  template: string; // This contains the HTML content
  createdAt?: Date;
  updatedAt?: Date;
};

export const modeOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
];

export const messageTemplateColumns: ColumnDef<MessageTemplate, unknown>[] = [
  {
    id: "select",
    header: ({ table }: { table: any }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }: { row: any }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <span>{row.original.type}</span>,
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ row }) => {
      const mode = modeOptions.find(
        (option) => option.value === row.original.mode
      );
      return <span>{mode?.label || "Unknown"}</span>;
    },
    filterFn: "equals",
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => (
      <span>{row.original.active ? "Active" : "Inactive"}</span>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => <span>{row.original.subject || "N/A"}</span>,
  },
  {
    accessorKey: "template",
    header: "Template",
    cell: ({ row }) => {
      const mode = row.original.mode;
      const template = row.original.template;

      return mode === "email" ? (
        <ViewTemplateButton template={template} />
      ) : (
        <span>{template}</span> // Render template directly for non-email modes
      );
    },
  },
  {
    header: "",
    accessorKey: "actions",
    id: "actions",
    cell: ({ row }: { row: any }) => <CellAction data={row.original} />,
  },
];

// ViewTemplateButton Component
const ViewTemplateButton = ({ template }: { template: string }) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  // Format HTML Code
  const formatHtml = (html: string) => {
    try {
      return beautify(html, {
        indent_size: 2, // Adjust indent size
        max_preserve_newlines: 2, // Maximum newlines to preserve
      });
    } catch (error) {
      console.error("Error formatting HTML:", error);
      return html; // Return unformatted HTML in case of an error
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-blue-500 underline">
          View Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px]">
        {" "}
        {/* Limit dialog width */}
        <DialogHeader>
          <DialogTitle>Template Viewer</DialogTitle>
        </DialogHeader>
        {/* Tabs for Preview and Code */}
        <Tabs
          defaultValue="preview"
          onValueChange={(value) => setActiveTab(value as "preview" | "code")}
          className="space-y-4"
        >
          {/* Tab List */}
          <TabsList className="flex justify-start space-x-2">
            <TabsTrigger value="preview" className="text-sm">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="text-sm">
              Code
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="preview">
            <div
              className="border rounded-md p-4 bg-muted overflow-auto max-h-[400px]"
              dangerouslySetInnerHTML={{ __html: template }}
            />
          </TabsContent>
          <TabsContent value="code">
            <div className="border rounded-md p-4 bg-muted overflow-auto max-h-[400px]">
              <pre className="whitespace-pre-wrap text-sm">
                {formatHtml(template)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
