"use client";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Upload, X, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BANNER_API_URL = "https://spdpay.in/application-content/banners/banners.php";
const CARD_API_URL = "https://spdpay.in/application-content/cards/cards.php";
const ICON_UPLOAD_URL = "https://spdpay.in/application-content/uploads.php";

interface Banner {
  name: string;
  status: 'active' | 'inactive';
  backgroundColor: string;
}

interface Card {
  id: string;
  icon: string;
  title: string;
  description: string;
  long_description: string;
  action_path: string;
  type: 'home' | 'mobile';
}

const COLOR_PRESETS = [
  // Base Colors
  { value: '#FFFFFF', name: 'White' },
  { value: '#F8F9FA', name: 'Light Gray' },
  { value: '#1A1A1A', name: 'Dark' },
  { value: '#111827', name: 'Deep Dark' },
  
  // Modern Blues
  { value: '#2563EB', name: 'Royal Blue' },
  { value: '#3B82F6', name: 'Bright Blue' },
  { value: '#60A5FA', name: 'Sky Blue' },
  
  // Fresh Greens
  { value: '#059669', name: 'Emerald' },
  { value: '#10B981', name: 'Green' },
  { value: '#34D399', name: 'Mint' },
  
  // Warm Colors
  { value: '#DC2626', name: 'Red' },
  { value: '#F97316', name: 'Orange' },
  { value: '#F59E0B', name: 'Amber' },
  
  // Cool Accents
  { value: '#6366F1', name: 'Indigo' },
  { value: '#8B5CF6', name: 'Purple' },
  { value: '#EC4899', name: 'Pink' },
  
  // Modern Neutrals
  { value: '#6B7280', name: 'Gray' },
  { value: '#4B5563', name: 'Slate' },
  { value: '#374151', name: 'Cool Gray' }
];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rgb = hexToRgb(color);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      onChange(newColor.toUpperCase());
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Color code copied to clipboard!");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer group">
          <Label className="text-xs text-muted-foreground cursor-pointer">
            {label}:
          </Label>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md border border-border group-hover:border-primary transition-colors"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
              {color.toUpperCase()}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex gap-3">
            {/* Color Preview and Values */}
            <div
              className="w-16 h-16 rounded-md border border-border"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onChange(e.target.value.toUpperCase())}
                  className="w-8 h-8 rounded-md cursor-pointer p-0 border-0"
                />
                <Input
                  value={color.toUpperCase()}
                  onChange={handleColorChange}
                  className="flex-1 h-8 font-mono text-xs"
                  maxLength={7}
                  placeholder="#000000"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">RGB</span>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : 'N/A'}
                </code>
              </div>
            </div>
          </div>

          {/* Preset Colors */}
          <div className="grid grid-cols-8 gap-1.5">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onChange(preset.value)}
                className="w-full aspect-square rounded-md border border-border hover:border-primary transition-colors relative"
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              >
                {color.toLowerCase() === preset.value.toLowerCase() && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function BannersPage() {
  // Existing banner states
  const [images, setImages] = useState<Banner[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newBannerColor, setNewBannerColor] = useState('#FFFFFF');

  // New card states
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [cardIcon, setCardIcon] = useState<File | null>(null);
  const [cardIconPreview, setCardIconPreview] = useState<string | null>(null);

  const fetchImages = async () => {
    const loadingToast = toast.loading("Fetching banners...");
    try {
      const response = await fetch(BANNER_API_URL);
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
    formData.append('backgroundColor', newBannerColor);

    try {
      const response = await fetch(BANNER_API_URL, {
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
        setNewBannerColor('#FFFFFF'); // Reset color for next upload
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
      const formData = new URLSearchParams();
      formData.append('filename', filename);

      const response = await fetch(BANNER_API_URL, {
        method: 'DELETE',
        body: formData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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

  const updateBannerData = async (banner: Banner, updates: { status?: 'active' | 'inactive', backgroundColor?: string }) => {
    const loadingToast = toast.loading(`Updating banner...`);
    try {
      const formData = new URLSearchParams();
      formData.append('filename', banner.name);
      if (updates.status) formData.append('status', updates.status);
      if (updates.backgroundColor) formData.append('backgroundColor', updates.backgroundColor);

      const response = await fetch(BANNER_API_URL, {
        method: 'PATCH',
        body: formData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast.success("Banner updated", {
          id: loadingToast,
        });
        fetchImages();
      } else {
        throw new Error(data.message);
      }
    } catch {
      toast.error("Failed to update banner", {
        id: loadingToast,
      });
    }
  };

  const toggleStatus = (banner: Banner) => {
    updateBannerData(banner, { status: banner.status === 'active' ? 'inactive' : 'active' });
  };

  const updateBackgroundColor = (banner: Banner, color: string) => {
    updateBannerData(banner, { backgroundColor: color });
  };

  const fetchCards = async () => {
    const loadingToast = toast.loading("Fetching cards...");
    try {
      const response = await fetch(CARD_API_URL);
      const data = await response.json();
      if (data.success) {
        setCards(data.cards);
        toast.success("Cards fetched successfully", { id: loadingToast });
      } else {
        throw new Error(data.message);
      }
    } catch {
      toast.error("Failed to fetch cards", { id: loadingToast });
    }
  };

  const handleCardIconUpload = async () => {
    if (!cardIcon) return null;
    
    const formData = new FormData();
    formData.append('icon', cardIcon);

    try {
      const response = await fetch(ICON_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        return data.path;
      }
      throw new Error(data.message);
    } catch (error) {
      throw error;
    }
  };

  const handleCardSubmit = async (formData: FormData) => {
    const loadingToast = toast.loading(selectedCard ? "Updating card..." : "Creating card...");
    try {
      const iconPath = cardIcon ? await handleCardIconUpload() : selectedCard?.icon;
      if (!iconPath) throw new Error("Icon upload failed");

      const cardData = {
        icon: iconPath,
        title: formData.get('title'),
        description: formData.get('description'),
        long_description: formData.get('long_description'),
        action_path: formData.get('action_path'),
        type: formData.get('type'),
      };

      const response = await fetch(selectedCard ? `${CARD_API_URL}/${selectedCard.id}` : CARD_API_URL, {
        method: selectedCard ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Card ${selectedCard ? 'updated' : 'created'} successfully`, { id: loadingToast });
        fetchCards();
        setIsCardDialogOpen(false);
        setSelectedCard(null);
        setCardIcon(null);
        setCardIconPreview(null);
      } else {
        throw new Error(data.message);
      }
    } catch {
      toast.error(`Failed to ${selectedCard ? 'update' : 'create'} card`, { id: loadingToast });
    }
  };

  const handleDeleteCard = async (id: string) => {
    const loadingToast = toast.loading("Deleting card...");
    try {
      const response = await fetch(`${CARD_API_URL}/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Card deleted successfully", { id: loadingToast });
        fetchCards();
      } else {
        throw new Error(data.message);
      }
    } catch {
      toast.error("Failed to delete card", { id: loadingToast });
    }
  };

  useEffect(() => {
    fetchImages();
    fetchCards();
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
                    style={{ backgroundColor: newBannerColor }}
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
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Background Color</Label>
                    <div className="flex gap-2 items-center">
                      <div
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: newBannerColor }}
                      />
                      <Input
                        type="text"
                        value={newBannerColor}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewBannerColor(value);
                          // Only uppercase when it's a valid hex color
                          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                            setNewBannerColor(value.toUpperCase());
                          }
                        }}
                        placeholder="#FFFFFF"
                        className="font-mono"
                      />
                    </div>
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

        <Tabs defaultValue="banners" className="space-y-4">
          <TabsList>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="banners" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((banner) => (
                <Card key={banner.name} className="group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-48 w-full" style={{ backgroundColor: banner.backgroundColor }}>
                      <Image
                        src={`https://spdpay.in/application-content/banners/${banner.name}`}
                        alt={banner.name}
                        fill
                        className="object-contain p-2"
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
                    <div className="p-3 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {banner.name}
                        </p>
                        <Badge variant={banner.status === 'active' ? 'default' : 'secondary'}>
                          {banner.status}
                        </Badge>
                      </div>
                      <ColorPicker
                        color={banner.backgroundColor}
                        onChange={(color) => updateBackgroundColor(banner, color)}
                        label="Background"
                      />
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

          <TabsContent value="cards" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => {
                setSelectedCard(null);
                setCardIcon(null);
                setCardIconPreview(null);
                setIsCardDialogOpen(true);
              }}>
                Add Card
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <Card key={card.id} className="group overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative h-12 w-12">
                        <Image
                          src={card.icon}
                          alt={card.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{card.title}</h3>
                        <p className="text-sm text-muted-foreground">{card.type}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedCard(card);
                          setIsCardDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selectedCard ? 'Edit Card' : 'Add New Card'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCardSubmit(new FormData(e.currentTarget));
          }}>
            <div className="flex gap-8 py-4">
              {/* Left Column - Icon Upload */}
              <div className="w-1/3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer relative aspect-square border-2 border-dashed rounded-lg flex items-center justify-center"
                >
                  {(cardIconPreview || selectedCard?.icon) ? (
                    <Image
                      src={cardIconPreview || selectedCard?.icon || ''}
                      alt="Preview"
                      fill
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload icon
                      </p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCardIcon(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCardIconPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>

              {/* Right Column - Form Fields */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    defaultValue={selectedCard?.title}
                    className="w-full mt-1 border rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <input
                    id="description"
                    name="description"
                    defaultValue={selectedCard?.description}
                    className="w-full mt-1 border rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="long_description" className="text-sm font-medium">
                    Long Description
                  </label>
                  <textarea
                    id="long_description"
                    name="long_description"
                    defaultValue={selectedCard?.long_description}
                    className="w-full mt-1 border rounded-md px-3 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="action_path" className="text-sm font-medium">
                    Action Path
                  </label>
                  <input
                    id="action_path"
                    name="action_path"
                    defaultValue={selectedCard?.action_path}
                    className="w-full mt-1 border rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="text-sm font-medium">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    defaultValue={selectedCard?.type || 'home'}
                    className="w-full mt-1 border rounded-md px-3 py-2"
                    required
                  >
                    <option value="home">Home</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" type="button" onClick={() => setIsCardDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedCard ? 'Update' : 'Create'} Card
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
