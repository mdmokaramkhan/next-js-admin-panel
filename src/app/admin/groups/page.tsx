"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTableWithScroll } from "@/components/ui/table/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { Loader2, Settings2, Pencil, Plus, Search } from "lucide-react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Group, CashbackSetting, createCashbackColumns } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PageContainer from "@/components/page-container";
import { cn } from "@/lib/utils";
import { AlertCircle, FolderIcon } from "lucide-react";

export default function GroupsCashbackManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [cashbackSettings, setCashbackSettings] = useState<CashbackSetting[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    group_code: "",
    group_name: "",
    group_panel: "",
    group_child: "",
    group_description: "",
  });
  const [newCashback, setNewCashback] = useState({
    status: true,
    group_code: "",
    provider_code: "",
    cashback_type: "",
    cashback: 0,
    min_amount: 0,
    max_amount: 0,
  });
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [isCashbackLoading, setIsCashbackLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingCashback, setEditingCashback] =
    useState<CashbackSetting | null>(null);
  const [isAddCashbackOpen, setIsAddCashbackOpen] = useState(false);

  const columns = createCashbackColumns((cashback) =>
    setEditingCashback(cashback)
  );

  const table = useReactTable({
    data: cashbackSettings,
    columns,
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
      const response = await apiRequest("groups", "GET");
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
      const response = await apiRequest(`/cashbacks/group/${groupCode}`, "GET");
      setCashbackSettings(response?.data || []);
    } catch (error) {
      setError("Failed to fetch cashback settings");
      console.error("Error fetching cashback settings:", error);
      setCashbackSettings([]);
    } finally {
      setIsCashbackLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      await apiRequest("groups", "POST", newGroup);
      fetchGroups();
      setNewGroup({
        group_code: "",
        group_name: "",
        group_panel: "",
        group_child: "",
        group_description: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleCreateCashback = async () => {
    try {
      const cashbackData = {
        ...newCashback,
        cashback: parseFloat(newCashback.cashback.toString()),
        min_amount: parseFloat(newCashback.min_amount.toString()),
        max_amount: parseFloat(newCashback.max_amount.toString()),
        group_code: selectedGroup?.group_code ?? "",
        status: true,
      };

      await apiRequest("cashbacks", "POST", cashbackData);
      fetchCashbackSettings(selectedGroup?.group_code ?? "");
      setNewCashback({
        status: true,
        group_code: "",
        provider_code: "",
        cashback_type: "",
        cashback: 0,
        min_amount: 0,
        max_amount: 0,
      });
    } catch (error) {
      console.error("Error creating cashback setting:", error);
    }
  };

  const handleEditGroup = async () => {
    if (!editingGroup) return;
    try {
      await apiRequest(`groups/${editingGroup.id}`, "PUT", editingGroup);
      fetchGroups();
      setEditingGroup(null);
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  const handleEditCashback = async () => {
    if (!editingCashback) return;
    try {
      const updateData = {
        id: editingCashback.id,
        group_code: editingCashback.group_code,
        provider_code: editingCashback.provider_code,
        cashback_type: editingCashback.cashback_type,
        cashback: parseFloat(editingCashback.cashback.toString()),
        min_amount: parseFloat(editingCashback.min_amount?.toString() || "0"),
        max_amount: parseFloat(editingCashback.max_amount?.toString() || "0"),
        status: editingCashback.status,
      };

      await apiRequest(`cashbacks/${editingCashback.id}`, "PUT", updateData);
      fetchCashbackSettings(selectedGroup?.group_code ?? "");
      setEditingCashback(null);
    } catch (error) {
      console.error("Error updating cashback:", error);
    }
  };

  const isValidCashback = () => {
    return (
      newCashback.provider_code.trim() !== "" &&
      newCashback.cashback_type !== "" &&
      newCashback.cashback > 0 &&
      newCashback.min_amount >= 0 &&
      newCashback.max_amount >= 0 &&
      (!newCashback.max_amount || newCashback.max_amount >= newCashback.min_amount)
    );
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Heading
              title="Cashback Management"
              description="Configure cashback and surcharge settings for provider groups"
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="h-10">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Group
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
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        group_code: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Group Name"
                    value={newGroup.group_name}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        group_name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Group Panel"
                    value={newGroup.group_panel}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        group_panel: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Group Child"
                    value={newGroup.group_child}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        group_child: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Group Description"
                    value={newGroup.group_description}
                    onChange={(e) =>
                      setNewGroup({
                        ...newGroup,
                        group_description: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={handleCreateGroup} className="w-full">
                  Save Group
                </Button>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel - Groups List */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-4">
              <div className="rounded-lg border bg-card shadow-sm">
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Provider Groups</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {groups.length} total groups
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-2 pb-2">
                  {isGroupsLoading ? (
                    <div className="flex h-[300px] items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading groups...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex h-[300px] items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-destructive">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <FolderIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No groups found</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-md transition-colors cursor-pointer",
                            selectedGroup?.id === group.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                          onClick={() => setSelectedGroup(group)}
                        >
                          <div className="flex flex-col items-start gap-1 min-w-0">
                            <span className="font-medium truncate w-full">
                              {group.group_name}
                            </span>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full",
                                selectedGroup?.id === group.id
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-muted-foreground/20 text-muted-foreground"
                              )}>
                                {group.group_code}
                              </span>
                              {group.group_panel && (
                                <span className="text-muted-foreground truncate">
                                  {group.group_panel}
                                </span>
                              )}
                            </div>
                          </div>
                          <div 
                            className="ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingGroup(group);
                            }}
                          >
                            <Button
                              variant={selectedGroup?.id === group.id ? "secondary" : "ghost"}
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Cashback Settings */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-4">
              <div className="rounded-lg border bg-card shadow-sm">
                {selectedGroup ? (
                  <>
                    <div className="border-b">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-semibold tracking-tight">
                                {selectedGroup.group_name}
                              </h2>
                              <div className="flex items-center gap-2">
                                <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                  {selectedGroup.group_code}
                                </span>
                                {selectedGroup.group_panel && (
                                  <span className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground">
                                    {selectedGroup.group_panel}
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedGroup.group_description && (
                              <p className="text-muted-foreground">
                                {selectedGroup.group_description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => setEditingGroup(selectedGroup)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Group
                            </Button>
                            <Button onClick={() => setIsAddCashbackOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Cashback
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-0">
                      {isCashbackLoading ? (
                        <div className="flex h-[400px] items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading cashback settings...</p>
                          </div>
                        </div>
                      ) : cashbackSettings.length === 0 ? (
                        <div className="flex h-[400px] items-center justify-center">
                          <div className="flex flex-col items-center gap-2 text-center">
                            <Settings2 className="h-12 w-12 text-muted-foreground/40" />
                            <h3 className="font-medium text-lg">No Cashback Settings</h3>
                            <p className="text-sm text-muted-foreground max-w-[300px]">
                              Get started by adding a new cashback setting
                            </p>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => setIsAddCashbackOpen(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Cashback Setting
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <DataTableWithScroll
                            table={table}
                            columns={columns}
                          />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-[600px] items-center justify-center">
                    <div className="flex flex-col items-center text-center p-8">
                      <Settings2 className="h-16 w-16 text-muted-foreground/40" />
                      <h3 className="mt-6 text-xl font-semibold">No Group Selected</h3>
                      <p className="mt-2 text-sm text-muted-foreground max-w-[300px]">
                        Select a provider group from the left panel to view and manage its cashback settings
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Cashback Dialog */}
        <Dialog open={isAddCashbackOpen} onOpenChange={setIsAddCashbackOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Cashback Setting</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Provider Code"
                value={newCashback.provider_code}
                onChange={(e) =>
                  setNewCashback({
                    ...newCashback,
                    provider_code: e.target.value,
                    group_code: selectedGroup?.group_code ?? "",
                  })
                }
              />
              <Select
                value={newCashback.cashback_type}
                onValueChange={(value) =>
                  setNewCashback({
                    ...newCashback,
                    cashback_type: value,
                  })
                }
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
              <Input
                placeholder="Cashback Amount"
                value={newCashback.cashback}
                onChange={(e) =>
                  setNewCashback({
                    ...newCashback,
                    cashback: parseFloat(e.target.value) || 0,
                  })
                }
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min Amount"
                  value={newCashback.min_amount}
                  onChange={(e) =>
                    setNewCashback({
                      ...newCashback,
                      min_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Input
                  placeholder="Max Amount"
                  value={newCashback.max_amount}
                  onChange={(e) =>
                    setNewCashback({
                      ...newCashback,
                      max_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <Button 
              onClick={() => {
                handleCreateCashback();
                setIsAddCashbackOpen(false);
              }} 
              disabled={!isValidCashback()}
            >
              Add Cashback
            </Button>
          </DialogContent>
        </Dialog>

        {/* Edit Group Dialog */}
        <Dialog
          open={!!editingGroup}
          onOpenChange={() => setEditingGroup(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Group Name"
                value={editingGroup?.group_name ?? ""}
                onChange={(e) =>
                  setEditingGroup((prev) =>
                    prev ? { ...prev, group_name: e.target.value } : null
                  )
                }
              />
              <Input
                placeholder="Group Panel"
                value={editingGroup?.group_panel ?? ""}
                onChange={(e) =>
                  setEditingGroup((prev) =>
                    prev ? { ...prev, group_panel: e.target.value } : null
                  )
                }
              />
              <Input
                placeholder="Group Description"
                value={editingGroup?.group_description ?? ""}
                onChange={(e) =>
                  setEditingGroup((prev) =>
                    prev ? { ...prev, group_description: e.target.value } : null
                  )
                }
              />
            </div>
            <Button onClick={handleEditGroup}>Save Changes</Button>
          </DialogContent>
        </Dialog>

        {/* Edit Cashback Dialog */}
        <Dialog
          open={!!editingCashback}
          onOpenChange={() => setEditingCashback(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Cashback Setting</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="status">Status</Label>
                <Switch
                  id="status"
                  checked={editingCashback?.status ?? false}
                  onCheckedChange={(checked) =>
                    setEditingCashback((prev) =>
                      prev ? { ...prev, status: checked } : null
                    )
                  }
                />
              </div>
              <Select
                value={editingCashback?.cashback_type ?? ""}
                onValueChange={(value) =>
                  setEditingCashback((prev) =>
                    prev
                      ? {
                          ...prev,
                          cashback_type: value as
                            | "cashback_percentage"
                            | "cashback_flat"
                            | "surcharge_percentage"
                            | "surcharge_flat",
                        }
                      : null
                  )
                }
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
              <Input
                placeholder="Amount"
                value={editingCashback?.cashback ?? 0}
                onChange={(e) =>
                  setEditingCashback((prev) =>
                    prev
                      ? { ...prev, cashback: parseFloat(e.target.value) || 0 }
                      : null
                  )
                }
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min Amount"
                  value={editingCashback?.min_amount ?? 0}
                  onChange={(e) =>
                    setEditingCashback((prev) =>
                      prev
                        ? { ...prev, min_amount: parseFloat(e.target.value) || 0 }
                        : null
                    )
                  }
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Input
                  placeholder="Max Amount"
                  value={editingCashback?.max_amount ?? 0}
                  onChange={(e) =>
                    setEditingCashback((prev) =>
                      prev
                        ? { ...prev, max_amount: parseFloat(e.target.value) || 0 }
                        : null
                    )
                  }
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <Button onClick={handleEditCashback}>Save Changes</Button>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
