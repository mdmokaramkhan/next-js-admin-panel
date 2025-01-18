"use client";
import { useState, useEffect, useCallback } from "react";
import type { SmsApi } from "@/types/sms-api";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Search, PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { SmsApiModal } from "@/app/admin/sms-apis/_components/sms-api-modal";
import { Switch } from "@/components/ui/switch";

// Remove the local SmsApi interface since we're now importing it

export default function SmsApisPage() {
  const [smsApis, setSmsApis] = useState<SmsApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("providerName");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApi, setSelectedApi] = useState<SmsApi | undefined>(undefined);
  const router = useRouter();

  const fetchSmsApis = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("sms-api", "GET", null, router);
      if (response.success) {
        setSmsApis(response.data || []);
        toast.success("SMS APIs fetched successfully");
      } else {
        toast.warning("SMS APIs not loaded properly!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch SMS APIs."
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const toggleStatus = async (api: SmsApi) => {
    try {
      const response = await apiRequest(
        `sms-api/${api.id}`,
        "PUT",
        {
          ...api,
          isActive: !api.isActive
        },
        router
      );

      if (response.success) {
        toast.success("API status updated successfully");
        fetchSmsApis();
      } else {
        throw new Error(response.message || "Failed to update API status");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update API status"
      );
    }
  };

  const handleEdit = (api: SmsApi) => {
    setSelectedApi(api);
    setShowAddModal(true);
  };

  const handleModalClose = (open: boolean) => {
    setShowAddModal(open);
    if (!open) {
      setSelectedApi(undefined);
    }
  };

  const filteredApis = smsApis.filter(api => 
    api.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.baseUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedApis = [...filteredApis].sort((a, b) => {
    if (sortBy === "providerName") return a.providerName.localeCompare(b.providerName);
    if (sortBy === "type") return a.type.localeCompare(b.type);
    return 0;
  });

  useEffect(() => {
    fetchSmsApis();
  }, [fetchSmsApis]);

  return (
    <PageContainer scrollable>
      <div className="space-y-4 pb-4 h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">SMS APIs 📱</h2>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New API
          </Button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search APIs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="providerName">Provider Name</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All APIs</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApis.map((api) => (
                <Card key={api.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{api.providerName}</h3>
                        <Badge variant={api.type === 'sms' ? 'default' : 'secondary'}>
                          {api.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(api)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={api.isActive}
                            onCheckedChange={() => toggleStatus(api)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {api.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Endpoint</p>
                      <p className="text-muted-foreground break-all bg-secondary/20 p-2 rounded">
                        {api.baseUrl}
                      </p>
                      <p className="font-medium">Method</p>
                      <Badge variant="outline">{api.method}</Badge>
                      <p className="font-medium">Parameters</p>
                      <p className="text-muted-foreground break-all bg-secondary/20 p-2 rounded">
                        {api.params}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {smsApis.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-10">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin mb-4" />
                      <p>Loading SMS APIs...</p>
                    </>
                  ) : (
                    "No SMS APIs found"
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApis.filter(api => api.isActive).map((api) => (
                <Card key={api.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{api.providerName}</h3>
                        <Badge variant={api.type === 'sms' ? 'default' : 'secondary'}>
                          {api.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(api)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={api.isActive}
                            onCheckedChange={() => toggleStatus(api)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {api.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Endpoint</p>
                      <p className="text-muted-foreground break-all bg-secondary/20 p-2 rounded">
                        {api.baseUrl}
                      </p>
                      <p className="font-medium">Method</p>
                      <Badge variant="outline">{api.method}</Badge>
                      <p className="font-medium">Parameters</p>
                      <p className="text-muted-foreground break-all bg-secondary/20 p-2 rounded">
                        {api.params}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {smsApis.filter(api => api.isActive).length === 0 && (
                <div className="col-span-full flex items-center justify-center text-muted-foreground py-10">
                  No active SMS APIs found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <SmsApiModal
          open={showAddModal}
          onOpenChange={handleModalClose}
          onSuccess={fetchSmsApis}
          initialData={selectedApi}
        />
      </div>
    </PageContainer>
  );
}
