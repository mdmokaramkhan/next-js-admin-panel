"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTableWithScroll } from "@/components/ui/table/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { Loader2, ArrowDownIcon, Settings2 } from "lucide-react"; // Add this import
import { useReactTable, getCoreRowModel } from "@tanstack/react-table"; // Add this import
import { Group, CashbackSetting, cashbackColumns } from "./columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default function GroupsCashbackManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [cashbackSettings, setCashbackSettings] = useState<CashbackSetting[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ group_code: "", group_name: "", group_panel: "", group_child: "", group_description: "" });
  const [newCashback, setNewCashback] = useState({ 
    status: true, // Add default status as boolean
    group_code: "", 
    provider_code: "", 
    cashback_type: "", 
    cashback: 0 
  });
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [isCashbackLoading, setIsCashbackLoading] = useState(false);
  const [error, setError] = useState("");

  const table = useReactTable({
    data: cashbackSettings,
    columns: cashbackColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const cashbackTypes = [
    { value: "cashback_percentage", label: "Cashback Percentage" },
    { value: "cashback_flat", label: "Cashback Flat" },
    { value: "surcharge_percentage", label: "Surcharge Percentage" },
    { value: "surcharge_flat", label: "Surcharge Flat" },
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchCashbackSettings(selectedGroup.group_code);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    setIsGroupsLoading(true);
    setError("");
    try {
      const response = await apiRequest("allGroups", "GET");
      setGroups(response);
    } catch (error) {
      setError("Failed to fetch groups");
      console.error("Error fetching groups:", error);
    } finally {
      setIsGroupsLoading(false);
    }
  };

  const fetchCashbackSettings = async (groupCode: string) => {
    setIsCashbackLoading(true);
    setError("");
    try {
      const response = await apiRequest(`cashbacksByGroup/${groupCode}`, "GET");
      // Initialize as empty array if no data
      setCashbackSettings(response?.data || []);
    } catch (error) {
      setError("Failed to fetch cashback settings");
      console.error("Error fetching cashback settings:", error);
      setCashbackSettings([]); // Reset cashback settings on error
    } finally {
      setIsCashbackLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      await apiRequest("createGroup", "POST", newGroup);
      fetchGroups();
      setNewGroup({ group_code: "", group_name: "", group_panel: "", group_child: "", group_description: "" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleCreateCashback = async () => {
    try {
      const cashbackData = {
        ...newCashback,
        cashback: parseFloat(newCashback.cashback.toString()), // Ensure number type
        group_code: selectedGroup?.group_code ?? "", // Ensure group_code is set
        status: true // Ensure boolean status
      };
      
      await apiRequest("createCashback", "POST", cashbackData);
      fetchCashbackSettings(selectedGroup?.group_code ?? "");
      setNewCashback({ 
        status: true,
        group_code: "", 
        provider_code: "", 
        cashback_type: "", 
        cashback: 0 
      });
    } catch (error) {
      console.error("Error creating cashback setting:", error);
    }
  };

  const isValidCashback = () => {
    return (
      newCashback.provider_code.trim() !== "" &&
      newCashback.cashback_type !== "" &&
      newCashback.cashback > 0
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="border-b">
        <div className="container py-4">
          <Heading
            title="Cashback Management"
            description="Configure cashback and surcharge settings for provider groups"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container py-4">
        <div className="grid h-[calc(100vh-8rem)] grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Panel - Groups */}
          <div className="h-full flex flex-col rounded-lg border bg-card text-card-foreground shadow">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold tracking-tight">Provider Groups</h3>
                  <p className="text-sm text-muted-foreground">
                    {groups.length} total groups
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">New group</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Group</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="Group Code"
                        value={newGroup.group_code}
                        onChange={(e) => setNewGroup({ ...newGroup, group_code: e.target.value })}
                      />
                      <Input
                        placeholder="Group Name"
                        value={newGroup.group_name}
                        onChange={(e) => setNewGroup({ ...newGroup, group_name: e.target.value })}
                      />
                      <Input
                        placeholder="Group Panel"
                        value={newGroup.group_panel}
                        onChange={(e) => setNewGroup({ ...newGroup, group_panel: e.target.value })}
                      />
                      <Input
                        placeholder="Group Child"
                        value={newGroup.group_child}
                        onChange={(e) => setNewGroup({ ...newGroup, group_child: e.target.value })}
                      />
                      <Input
                        placeholder="Group Description"
                        value={newGroup.group_description}
                        onChange={(e) => setNewGroup({ ...newGroup, group_description: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleCreateGroup} className="w-full">Save Group</Button>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-2">
              {isGroupsLoading ? (
                <div className="flex h-[150px] items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex h-[150px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full text-left p-3 rounded-md transition-colors text-sm
                        ${selectedGroup?.id === group.id 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent/50"
                        }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <p className="font-medium leading-none">{group.group_name}</p>
                          {(group.group_panel || group.group_child) && (
                            <p className="text-xs text-muted-foreground">
                              {group.group_panel && `Panel: ${group.group_panel}`}
                              {group.group_child && ` • Child: ${group.group_child}`}
                            </p>
                          )}
                        </div>
                        <span className="text-xs rounded-md bg-muted px-2 py-1">
                          {group.group_code}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="h-full md:col-span-2 flex flex-col rounded-lg border bg-card text-card-foreground shadow">
            {selectedGroup ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold tracking-tight">Cashback Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Managing {selectedGroup.group_name}
                      </p>
                    </div>
                    <span className="text-sm rounded-md bg-accent px-2.5 py-1.5">
                      {selectedGroup.group_code}
                    </span>
                  </div>
                </div>

                <div className="p-4 border-b bg-card">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Provider Code"
                      value={newCashback.provider_code}
                      onChange={(e) => setNewCashback({ 
                        ...newCashback, 
                        provider_code: e.target.value,
                        group_code: selectedGroup.group_code 
                      })}
                    />
                    <Select
                      value={newCashback.cashback_type}
                      onValueChange={(value) => setNewCashback({ 
                        ...newCashback, 
                        cashback_type: value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cashbackTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={newCashback.cashback}
                        onChange={(e) => setNewCashback({ 
                          ...newCashback, 
                          cashback: parseFloat(e.target.value) || 0
                        })}
                      />
                      <Button
                        onClick={handleCreateCashback}
                        disabled={!isValidCashback()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  {isCashbackLoading ? (
                    <div className="flex h-[200px] items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : cashbackSettings.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center">
                      <p className="text-sm text-muted-foreground">No cashback settings configured</p>
                    </div>
                  ) : (
                    <div className="h-full overflow-auto">
                      <DataTableWithScroll 
                        table={table} 
                        columns={cashbackColumns} 
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center text-center p-8">
                  <Settings2 className="h-10 w-10 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-medium">No Group Selected</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a group from the left to manage its cashback settings
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
