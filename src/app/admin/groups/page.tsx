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
import { Loader2, Settings2, Pencil } from "lucide-react"; // Add this import
import { useReactTable, getCoreRowModel } from "@tanstack/react-table"; // Add this import
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
import { Switch } from "@/components/ui/switch"; // Add this import
import { Label } from "@/components/ui/label"; // Add this import
import PageContainer from "@/components/page-container";

export default function GroupsCashbackManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [cashbackSettings, setCashbackSettings] = useState<CashbackSetting[]>(
    []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    group_code: "",
    group_name: "",
    group_panel: "",
    group_child: "",
    group_description: "",
  });
  const [newCashback, setNewCashback] = useState({
    status: true, // Add default status as boolean
    group_code: "",
    provider_code: "",
    cashback_type: "",
    cashback: 0,
  });
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [isCashbackLoading, setIsCashbackLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingCashback, setEditingCashback] =
    useState<CashbackSetting | null>(null);

  // Create columns with edit handler
  const columns = createCashbackColumns((cashback) =>
    setEditingCashback(cashback)
  );

  // Update table initialization
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
        cashback: parseFloat(newCashback.cashback.toString()), // Ensure number type
        group_code: selectedGroup?.group_code ?? "", // Ensure group_code is set
        status: true, // Ensure boolean status
      };

      await apiRequest("cashbacks", "POST", cashbackData);
      fetchCashbackSettings(selectedGroup?.group_code ?? "");
      setNewCashback({
        status: true,
        group_code: "",
        provider_code: "",
        cashback_type: "",
        cashback: 0,
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
      newCashback.cashback > 0
    );
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between space-y-2">
          <Heading
            title="Cashback Management"
            description="Configure cashback and surcharge settings for provider groups"
          />
        </div>
        <Separator />
        <div className="grid h-[calc(100vh-10rem)] grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Panel - Groups */}
          <div className="h-full flex flex-col rounded-md border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Provider Groups</h3>
                  <p className="text-sm text-muted-foreground">
                    {groups.length} total groups
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">New group</Button>
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
            </div>

            <div className="flex-1 overflow-auto p-4">
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
                    <div key={group.id} className="flex items-center">
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className={`flex-1 text-left p-4 rounded-md transition-colors
                        ${
                          selectedGroup?.id === group.id
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {group.group_name}
                            </p>
                            {(group.group_panel || group.group_child) && (
                              <p className="text-xs text-muted-foreground">
                                {group.group_panel &&
                                  `Panel: ${group.group_panel}`}
                                {group.group_child &&
                                  ` • Child: ${group.group_child}`}
                              </p>
                            )}
                          </div>
                          <span className="text-xs font-medium rounded-md bg-secondary px-2.5 py-0.5">
                            {group.group_code}
                          </span>
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingGroup(group)}
                        className="mr-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="h-full md:col-span-2 flex flex-col rounded-md border">
            {selectedGroup ? (
              <>
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Cashback Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Managing {selectedGroup.group_name}
                      </p>
                    </div>
                    <span className="text-sm font-medium rounded-md bg-secondary px-2.5 py-1.5">
                      {selectedGroup.group_code}
                    </span>
                  </div>
                </div>

                <div className="p-6 border-b bg-card">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Provider Code"
                      value={newCashback.provider_code}
                      onChange={(e) =>
                        setNewCashback({
                          ...newCashback,
                          provider_code: e.target.value,
                          group_code: selectedGroup.group_code,
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
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={newCashback.cashback}
                        onChange={(e) =>
                          setNewCashback({
                            ...newCashback,
                            cashback: parseFloat(e.target.value) || 0,
                          })
                        }
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
                      <p className="text-sm text-muted-foreground">
                        No cashback settings configured
                      </p>
                    </div>
                  ) : (
                    <div className="h-full overflow-auto">
                      <DataTableWithScroll
                        table={table}
                        columns={columns} // Make sure to pass columns here
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center text-center p-8">
                  <Settings2 className="h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-medium">
                    No Group Selected
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a group from the left to manage its cashback settings
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

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
                type="number"
                placeholder="Amount"
                value={editingCashback?.cashback ?? 0}
                onChange={(e) =>
                  setEditingCashback((prev) =>
                    prev
                      ? { ...prev, cashback: parseFloat(e.target.value) || 0 }
                      : null
                  )
                }
              />
            </div>
            <Button onClick={handleEditCashback}>Save Changes</Button>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
