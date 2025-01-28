"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUpCircle, Router, Crown, ChevronDown, ChevronUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModuleForm } from "./components/module-form";
import { ParsingTable } from "./components/parsing-table";
import { ParsingForm } from "./components/parsing-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type Module = {
  id: string;
  module_name: string;
  response_group: string;
  balance: number;
};

type Provider = {
  provider_name: string;
  provider_code: string;
  provider_type: string;
  provider_logo: string;
};

type Parsing = {
  id: string;
  status: boolean;
  provider_code: string;
  parsing: string;
  allowed_amounts: string;
  provider: Provider;
  module_id: string;
  createdAt: string;
  updatedAt: string;
};

type ViewMode = "none" | "view" | "edit";

export default function Overview() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("none");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [parsings, setParsings] = useState<Parsing[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [parsingFormOpen, setParsingFormOpen] = useState(false);
  const [selectedParsing, setSelectedParsing] = useState<Parsing | null>(null);
  const [deleteParsingDialog, setDeleteParsingDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [showModules, setShowModules] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [modulesResponse, parsingsResponse] = await Promise.all([
          apiRequest("modules", "GET"),
          apiRequest("parsings", "GET")
        ]);
        
        setModules(modulesResponse.data || []);
        setParsings(parsingsResponse.data || []);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleDelete = async (module: Module) => {
    try {
      await apiRequest(`modules/${module.id}`, "DELETE");
      setModules(modules.filter((m) => m.id !== module.id));
      setDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete module:", error);
    }
  };

  const handleSave = async (data: Partial<Module>) => {
    try {
      let response;
      if (selectedModule?.id) {
        // Update existing module
        response = await apiRequest(
          `modules/${selectedModule.id}`,
          "PUT",
          data
        );
        if (response.success) {
          // Refresh the modules list
          const updatedModules = await apiRequest("modules", "GET");
          setModules(updatedModules.data || []);
        }
      } else {
        // Create new module
        // Remove id from data to avoid conflicts
        delete data.id;
        response = await apiRequest("modules", "POST", data);
        if (response.success) {
          // Refresh the modules list
          const updatedModules = await apiRequest("modules", "GET");
          setModules(updatedModules.data || []);
        }
      }
      setViewMode("view");
      setEditDialog(false);
    } catch (error) {
      console.error("Failed to save module:", error);
    }
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      const parsing = parsings.find((p) => p.id === id);
      if (!parsing) {
        throw new Error("Parsing not found");
      }

      let moduleId = selectedModule?.id;
      if (!moduleId) {
        moduleId = parsing.module_id;
      }

      const updateData = {
        id: parsing.id,
        status,
        module_id: parseInt(moduleId, 10),
        provider_code: parsing.provider_code,
        parsing: parsing.parsing,
      };

      const response = await apiRequest(`parsings/${id}`, "PUT", updateData);

      if (response.success) {
        // Update the local state instead of fetching
        setParsings(parsings.map(p => p.id === id ? { ...p, status } : p));
        toast.success("Parsing status updated successfully!", {
          id: loadingToast,
        });
        return true;
      }
      toast.error("Failed to update parsing status.", {
        id: loadingToast,
      });
      return false;
    } catch {
      toast.error("Failed to update parsing status.", {
        id: loadingToast,
      });
      return false;
    }
  };

  const handleCreateParsing = async (data: Partial<Parsing>) => {
    try {
      // delete id from data to avoid conflicts
      delete data.id;
      // Include the module ID in the data
      const parsingData = {
        ...data,
        module_id: selectedModule?.id,
      };
      const response = await apiRequest(`parsings`, "POST", parsingData);
      setParsings([...parsings, response.data]);
      setParsingFormOpen(false);
      setSelectedParsing(null); // Reset selected parsing
    } catch (error) {
      console.error("Failed to create parsing:", error);
    }
  };

  const handleUpdateParsing = async (data: Partial<Parsing>) => {
    try {
      let moduleId = selectedModule?.id;
      if (!moduleId) {
        moduleId = data.module_id;
      }

      const parsingData = {
        ...data,
        module_id: moduleId,
      };
      const response = await apiRequest(`/parsings/${selectedParsing?.id}`, "PUT", parsingData);

      if (response.success) {
        // Update local state instead of fetching
        setParsings(parsings.map(p => 
          p.id === selectedParsing?.id ? { ...p, ...response.data } : p
        ));
      }

      setParsingFormOpen(false);
      setSelectedParsing(null);
    } catch (error) {
      console.error("Failed to update parsing:", error);
    }
  };

  const handleDeleteParsing = async () => {
    try {
      await apiRequest(`parsings/${selectedParsing?.id}`, "DELETE");
      setParsings(parsings.filter((p) => p.id !== selectedParsing?.id));
      setDeleteParsingDialog(false);
    } catch (error) {
      console.error("Failed to delete parsing:", error);
    }
  };

  // Add sorting function for parsings
  const sortedParsings = [...parsings].sort((a, b) => 
    a.provider_code.localeCompare(b.provider_code)
  );

  // Get unique providers from parsings

  // Get unique providers with their full details
  const uniqueProviders = Array.from(
    new Map(
      parsings.map(p => [
        p.provider.provider_name,
        p.provider // Keep the full provider object
      ])
    ).values()
  );

  // Update filteredParsings to include provider filter
  const filteredParsings = sortedParsings
    .filter(parsing => {
      const moduleMatch = selectedModule ? parsing.module_id === selectedModule.id : true;
      const providerMatch = selectedProvider === "all" ? true : parsing.provider.provider_name === selectedProvider;
      return moduleMatch && providerMatch;
    });

  const handleModuleSelect = (module: Module) => {
    // Toggle selection if clicking the same module
    if (selectedModule?.id === module.id) {
      setSelectedModule(null);
    } else {
      setSelectedModule(module);
    }
  };

  const handleCheckBalance = async (moduleId: string) => {
    const loadingToast = toast.loading("Checking balance...");
    try {
      const response = await apiRequest(`modules/${moduleId}/balance`, "GET");
      if (response.success) {
        toast.success("Balance updated successfully!", {
          id: loadingToast,
        });
        // Update module balance in the list
        setModules(modules.map(m => 
          m.id === moduleId ? { ...m, balance: response.data.balance } : m
        ));
      } else {
        toast.error("Failed to check balance.", {
          id: loadingToast,
        });
      }
    } catch {
      toast.error("Failed to check balance.", {
        id: loadingToast,
      });
    }
  };

  return (
    <PageContainer>
      <div className="h-full flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Modules</h2>
            <Badge variant="outline" className="font-normal">
              {modules.length} total
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowModules(!showModules)}>
              {showModules ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Modules
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show Modules
                </>
              )}
            </Button>
            <Button onClick={() => setEditDialog(true)}>Add New Module</Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Modules Grid */}
          <div className={`grid md:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-300 ease-in-out ${
            showModules ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            {modules.map(module => (
              <Card 
                key={module.id} 
                className={`hover:shadow-md transition-all cursor-pointer relative overflow-hidden group ${
                  selectedModule?.id === module.id 
                    ? 'ring-2 ring-primary/50 bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleModuleSelect(module)}
              >
                <div className="absolute top-0 right-0 w-[120px] h-[120px] -mr-8 -mt-8 bg-gradient-to-br from-primary/5 to-muted rounded-full transition-all group-hover:scale-110" />
                
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between relative">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full transition-colors ${
                          selectedModule?.id === module.id 
                            ? 'bg-primary shadow-lg shadow-primary/25 animate-pulse' 
                            : 'bg-muted-foreground/30'
                        }`} />
                        <CardTitle className="text-sm font-semibold">
                          {module.module_name}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Crown className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {module.response_group}
                        </span>
                      </div>
                    </div>
                    {selectedModule?.id === module.id && (
                      <Badge variant="secondary" className="h-5 text-[10px] font-medium px-2 bg-primary/10 text-primary">
                        Selected
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold tracking-tight">₹{module.balance}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Balance</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-1 pt-2 border-t border-dashed" onClick={e => e.stopPropagation()}>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckBalance(module.id);
                            }}
                          >
                            <ArrowUpCircle className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Check Balance</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModule(module);
                              setParsingFormOpen(true);
                            }}
                          >
                            <Router className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add Parsing</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModule(module);
                              setEditDialog(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Module</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModule(module);
                              setDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Module</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Parsings Section */}
          <Card className="mt-6">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">
                    {selectedModule 
                      ? `${selectedModule.module_name} Parsings`
                      : 'All Parsings'}
                  </CardTitle>
                  <Badge variant="outline" className="font-normal">
                    {filteredParsings.length} total
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedProvider}
                    onValueChange={setSelectedProvider}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue>
                        {selectedProvider === "all" ? (
                          "All Providers"
                        ) : (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={`/images/${uniqueProviders.find(p => p.provider_name === selectedProvider)?.provider_logo}`}
                                alt={selectedProvider}
                              />
                              <AvatarFallback>{selectedProvider.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            {selectedProvider}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {uniqueProviders.map(provider => (
                        <SelectItem 
                          key={provider.provider_name} 
                          value={provider.provider_name}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={`/images/${provider.provider_logo}`}
                                alt={provider.provider_name}
                              />
                              <AvatarFallback>
                                {provider.provider_name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {provider.provider_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedModule && (
                    <Button size="sm" className="h-8" onClick={() => setParsingFormOpen(true)}>
                      Add Parsing
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ParsingTable
                moduleId={selectedModule?.id || ''}
                data={filteredParsings}
                modules={modules}
                onStatusChange={handleStatusChange}
                onEdit={parsing => {
                  setSelectedModule(modules.find(m => m.id === parsing.module_id) || null);
                  setSelectedParsing(parsing);
                  setParsingFormOpen(true);
                }}
                onDelete={parsing => {
                  setSelectedModule(modules.find(m => m.id === parsing.module_id) || null);
                  setSelectedParsing(parsing);
                  setDeleteParsingDialog(true);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Module Sheet */}
      <Sheet open={editDialog} onOpenChange={setEditDialog}>
        <SheetContent
          side="right"
          className="w-[400px] sm:w-[540px] overflow-y-auto"
        >
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
              This action cannot be undone. This will permanently delete the
              module.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedModule && handleDelete(selectedModule)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet
        open={parsingFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedParsing(null); // Reset selected parsing when closing
          }
          setParsingFormOpen(open);
        }}
      >
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedParsing ? "Edit" : "Add"} Parsing</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <ParsingForm
              parsing={
                selectedParsing || {
                  provider_code: "",
                  parsing: "",
                  allowed_amounts: "",
                  status: true,
                }
              }
              onSave={
                selectedParsing ? handleUpdateParsing : handleCreateParsing
              }
              onCancel={() => {
                setParsingFormOpen(false);
                setSelectedParsing(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={deleteParsingDialog}
        onOpenChange={setDeleteParsingDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Parsing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this parsing? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteParsing}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
