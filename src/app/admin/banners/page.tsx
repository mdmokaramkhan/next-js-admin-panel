"use client";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const API_URL = "https://spdpay.in/application-content/banners/banners.php";

interface Banner {
  name: string;
  status: 'active' | 'inactive';
}

export default function BannersPage() {
  const [images, setImages] = useState<Banner[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    const loadingToast = toast.loading("Fetching banners...");
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.status === 'success') {
        setImages(data.images);
        toast.success("Banners fetched successfully", {
          id: loadingToast,
        });
      } else {
        throw new Error(data.message);
      }
    } catch {
      toast.error("Failed to fetch banners", {
        id: loadingToast,
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    const loadingToast = toast.loading("Uploading banner...");
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('image', fileInputRef.current.files[0]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast.success("Banner uploaded successfully", {
          id: loadingToast,
        });
        fetchImages();
        setOpenDialog(false);
        setPreview(null);
      } else {
        throw new Error(data.message);
      }
    } catch {
      toast.error("Failed to upload banner", {
        id: loadingToast,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    const loadingToast = toast.loading("Deleting banner...");
    try {
      // Create URLSearchParams for the request body
      const formData = new URLSearchParams();
      formData.append('filename', filename);

      const response = await fetch(API_URL, {
        method: 'DELETE',
        body: formData.toString(), // Send as URL-encoded form data
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Change content type
        },
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast.success("Banner deleted successfully", {
          id: loadingToast,
        });
        fetchImages();
      } else {
        throw new Error(data.message);
      }
    } catch {
      toast.error("Failed to delete banner", {
        id: loadingToast,
      });
    }
  };

  const toggleStatus = async (banner: Banner) => {
    const loadingToast = toast.loading(`Updating banner status...`);
    try {
      const formData = new URLSearchParams();
      formData.append('filename', banner.name);
      formData.append('status', banner.status === 'active' ? 'inactive' : 'active');

      const response = await fetch(API_URL, {
        method: 'PATCH',
        body: formData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast.success("Banner status updated", {
          id: loadingToast,
        });
        fetchImages();
      } else {
        throw new Error(data.message);
      }
    } catch {
      toast.error("Failed to update banner status", {
        id: loadingToast,
      });
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <PageContainer scrollable>
      <div className="space-y-2 pb-4 h-full">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Manage Banners 🎯
          </h2>
          <div className="flex items-center space-x-2">
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>Upload Banner</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Banner</DialogTitle>
                  <DialogDescription>
                    Choose an image file to upload as a banner.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/40 transition-colors"
                  >
                    {preview ? (
                      <>
                        <Image
                          src={preview}
                          alt="Preview"
                          fill
                          className="object-contain p-2"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <p className="text-sm">Click to choose a banner image</p>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!preview || isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Banner'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Banners</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((banner) => (
                <Card key={banner.name} className="group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-48 w-full">
                      <Image
                        src={`https://spdpay.in/application-content/banners/${banner.name}`}
                        alt={banner.name}
                        fill
                        className="object-contain bg-muted/20 p-2"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleStatus(banner)}
                        >
                          {banner.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(banner.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 border-t flex justify-between items-center">
                      <p className="text-xs text-muted-foreground truncate">
                        {banner.name}
                      </p>
                      <Badge variant={banner.status === 'active' ? 'default' : 'secondary'}>
                        {banner.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {images.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-10">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin mb-4" />
                      <p>Uploading banner...</p>
                    </>
                  ) : (
                    "No banners found"
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.filter(banner => banner.status === 'active').map((banner) => (
                <Card key={banner.name} className="group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-48 w-full">
                      <Image
                        src={`https://spdpay.in/application-content/banners/${banner.name}`}
                        alt={banner.name}
                        fill
                        className="object-contain bg-muted/20 p-2"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleStatus(banner)}
                        >
                          Deactivate
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(banner.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 border-t flex justify-between items-center">
                      <p className="text-xs text-muted-foreground truncate">
                        {banner.name}
                      </p>
                      <Badge>active</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {images.filter(banner => banner.status === 'active').length === 0 && (
                <div className="col-span-full flex items-center justify-center text-muted-foreground py-10">
                  No active banners found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
