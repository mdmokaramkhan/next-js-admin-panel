"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTableWithScroll } from "@/components/ui/table/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react"; // Add this import
import { useReactTable, getCoreRowModel } from "@tanstack/react-table"; // Add this import
import { Group, CashbackSetting, cashbackColumns } from "./columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div className="container py-4 mx-auto h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Left Panel - Groups */}
        <div className="w-full rounded-lg border bg-card shadow-sm flex flex-col max-h-full">
          <div className="p-4 border-b shrink-0">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Groups</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Add New
                  </Button>
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
          
          <div className="flex-1 overflow-y-auto p-3">
            {isGroupsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center py-4">{error}</div>
            ) : (
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-3 rounded-md cursor-pointer transition-all text-sm
                      ${selectedGroup?.id === group.id 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "hover:bg-muted"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{group.group_name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {group.group_panel && `Panel: ${group.group_panel}`}
                          {group.group_child && ` • Child: ${group.group_child}`}
                        </div>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted">
                        {group.group_code}
                      </span>
                    </div>
                    {group.group_description && (
                      <div className="text-xs text-muted-foreground mt-2 line-clamp-1">
                        {group.group_description}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Panel - Cashback Settings */}
        <div className="w-full md:col-span-2 rounded-lg border bg-card shadow-sm flex flex-col max-h-full">
          {selectedGroup ? (
            <>
              <div className="p-4 border-b shrink-0">
                <h2 className="text-lg font-semibold">
                  Cashback Settings - {selectedGroup.group_name}
                </h2>
              </div>
              
              <div className="p-4 border-b bg-muted/50 shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                      min="0"
                      onChange={(e) => setNewCashback({ 
                        ...newCashback, 
                        cashback: parseFloat(e.target.value) || 0
                      })}
                    />
                    <Button
                      onClick={handleCreateCashback}
                      size="sm"
                      disabled={!isValidCashback()}
                      className="px-6"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                {isCashbackLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-sm text-center py-4">{error}</div>
                ) : cashbackSettings.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No cashback settings found for this group
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <DataTableWithScroll 
                      table={table} 
                      columns={cashbackColumns} 
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Select a group to view cashback settings
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
