"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Loader2, Settings2, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ModuleDetails } from "./components/module-details";
import { ModuleForm } from "./components/module-form";
import { ParsingTable } from "./components/parsing-table";
import { ParsingForm } from "./components/parsing-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type Module = {
  id: string;
  module_name: string;
  response_group: string;
  balance: number;
}

type Parsing = {
  id: string;
  status: boolean;
  provider_code: string;
  parsing: string;
  allowed_amounts: string;
}

type ViewMode = "none" | "view" | "edit";

export default function Overview() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("none");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [parsings, setParsings] = useState<Parsing[]>([]);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [parsingFormOpen, setParsingFormOpen] = useState(false);
  const [selectedParsing, setSelectedParsing] = useState<Parsing | null>(null);
  const [deleteParsingDialog, setDeleteParsingDialog] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await apiRequest("allModules", "GET");
        setModules(response.data || []);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleView = (module: Module) => {
    setSelectedModule(module);
    setViewMode("view");
  };

  const handleEdit = (module: Module) => {
    setSelectedModule(module);
    setViewMode("edit");
  };

  const handleDelete = async (module: Module) => {
    try {
      await apiRequest(`module/${module.id}`, "DELETE");
      setModules(modules.filter(m => m.id !== module.id));
      setDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete module:", error);
    }
  };

  const handleSave = async (data: Partial<Module>) => {
    try {
      const response = await apiRequest(`module/${selectedModule?.id}`, "PUT", data);
      setModules(modules.map(m => m.id === selectedModule?.id ? response.data : m));
      setViewMode("view");
    } catch (error) {
      console.error("Failed to update module:", error);
    }
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      await apiRequest(`parsing/${id}`, "PUT", { status });
      setParsings(parsings.map(p => 
        p.id === id ? { ...p, status } : p
      ));
    } catch (error) {
      console.error("Failed to update parsing status:", error);
    }
  };

  const fetchParsings = async (moduleId: string) => {
    try {
      const response = await apiRequest(`allParsings`, "GET");
      setParsings(response.data || []);
    } catch (error) {
      console.error("Failed to fetch parsings:", error);
    }
  };

  const handleCreateParsing = async (data: Partial<Parsing>) => {
    try {
      const response = await apiRequest(`parsing/${selectedModule?.id}`, "POST", data);
      setParsings([...parsings, response.data]);
      setParsingFormOpen(false);
    } catch (error) {
      console.error("Failed to create parsing:", error);
    }
  };

  const handleUpdateParsing = async (data: Partial<Parsing>) => {
    try {
      const response = await apiRequest(`parsing/${selectedParsing?.id}`, "PUT", data);
      setParsings(parsings.map(p => p.id === selectedParsing?.id ? response.data : p));
      setParsingFormOpen(false);
    } catch (error) {
      console.error("Failed to update parsing:", error);
    }
  };

  const handleDeleteParsing = async () => {
    try {
      await apiRequest(`parsing/${selectedParsing?.id}`, "DELETE");
      setParsings(parsings.filter(p => p.id !== selectedParsing?.id));
      setDeleteParsingDialog(false);
    } catch (error) {
      console.error("Failed to delete parsing:", error);
    }
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between space-y-2">
          <Heading
            title="Modules Management"
            description="Manage your SMS gateway modules and their parsings"
          />
        </div>
        <Separator />
        <div className="grid h-[calc(100vh-10rem)] grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Panel - Modules List */}
          <div className="h-full flex flex-col rounded-md border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Module List</h3>
                  <p className="text-sm text-muted-foreground">
                    {modules.length} total modules
                  </p>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">New Module</Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader className="sticky top-0 z-10 bg-background pb-4">
                      <SheetTitle>Create New Module</SheetTitle>
                    </SheetHeader>
                    <div className="py-6">
                      <ModuleForm 
                        module={{ id: '', module_name: '', response_group: '', balance: 0 }}
                        onSave={handleSave}
                        onCancel={() => setEditDialog(false)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {loading ? (
                <div className="flex h-[150px] items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {modules.map((module) => (
                    <div key={module.id} className="flex items-center">
                      <button
                        onClick={() => {
                          setSelectedModule(module);
                          fetchParsings(module.id);
                        }}
                        className={`flex-1 text-left p-4 rounded-md transition-colors
                          ${selectedModule?.id === module.id
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                          }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {module.module_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Balance: ₹{module.balance}
                            </p>
                          </div>
                          <span className="text-xs font-medium rounded-md bg-secondary px-2.5 py-0.5">
                            {module.response_group}
                          </span>
                        </div>
                      </button>
                      <div className="flex gap-1 mr-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModule(module);
                            setEditDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => {
                            setSelectedModule(module);
                            setDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Parsings */}
          <div className="h-full md:col-span-2 flex flex-col rounded-md border">
            {selectedModule ? (
              <>
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Parsing Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Managing {selectedModule.module_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setParsingFormOpen(true)}>
                        Add Parsing
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-auto">
                    <ParsingTable
                      moduleId={selectedModule.id}
                      data={parsings}
                      onStatusChange={handleStatusChange}
                      onEdit={(parsing) => {
                        setSelectedParsing(parsing);
                        setParsingFormOpen(true);
                      }}
                      onDelete={(parsing) => {
                        setSelectedParsing(parsing);
                        setDeleteParsingDialog(true);
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center text-center p-8">
                  <Settings2 className="h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-medium">No Module Selected</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a module from the left to manage its parsing settings
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Module Sheet */}
      <Sheet open={editDialog} onOpenChange={setEditDialog}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="sticky top-0 z-10 bg-background pb-4">
            <SheetTitle>Edit Module</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            {selectedModule && (
              <ModuleForm 
                module={selectedModule}
                onSave={async (data) => {
                  await handleSave(data);
                  setEditDialog(false);
                }}
                onCancel={() => setEditDialog(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the module.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedModule && handleDelete(selectedModule)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={parsingFormOpen} onOpenChange={setParsingFormOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedParsing ? "Edit" : "Add"} Parsing</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <ParsingForm
              parsing={selectedParsing || {
                provider_code: '',
                parsing: '',
                allowed_amounts: '',
                status: true
              }}
              onSave={selectedParsing ? handleUpdateParsing : handleCreateParsing}
              onCancel={() => {
                setParsingFormOpen(false);
                setSelectedParsing(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteParsingDialog} onOpenChange={setDeleteParsingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Parsing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this parsing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteParsing}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
