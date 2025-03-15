"use client";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Upload, X, Copy, ChevronDown } from "lucide-react";
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
const CARD_API_URL = "https://spdpay.in/application-content/cards/cards.php/banners";
const ICON_UPLOAD_URL = "https://spdpay.in/application-content/uploads.php";
const ICON_BASE_URL = "https://spdpay.in/application-content/icons";

// Helper function to get full icon URL
const getIconUrl = (iconPath: string) => {
  if (iconPath.startsWith('http')) return iconPath;
  return `${ICON_BASE_URL}/${iconPath.replace(/^icons\//, '')}`;
};

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
  type: 'home' | 'notification' | 'promotion' | 'alert';
  category: 'general' | 'payment' | 'offer' | 'security' | 'feature';
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

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted/30 p-4 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default function BannersPage() {
  // Existing banner states
  const [images, setImages] = useState<Banner[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [newBannerColor, setNewBannerColor] = useState('#FFFFFF');

  // New card states
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [cardIcon, setCardIcon] = useState<File | null>(null);
  const [cardIconPreview, setCardIconPreview] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

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
    if (!bannerFileInputRef.current?.files?.[0]) return;

    const loadingToast = toast.loading("Uploading banner...");
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('image', bannerFileInputRef.current.files[0]);
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
        if (bannerFileInputRef.current) {
          bannerFileInputRef.current.value = '';
        }
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
      const url = filterType === 'all' ? CARD_API_URL : `${CARD_API_URL}?type=${filterType}`;
      console.log('Fetching cards from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Cards API response:', data);
      
      if (response.ok) {
        if (Array.isArray(data)) {
          setCards(data);
          toast.success("Cards fetched successfully", { id: loadingToast });
        } else if (data.cards && Array.isArray(data.cards)) {
          setCards(data.cards);
          toast.success("Cards fetched successfully", { id: loadingToast });
        } else {
          throw new Error("Invalid response format");
        }
      } else {
        throw new Error(data.message || 'Failed to fetch cards');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error(`Failed to fetch cards: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: loadingToast });
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
      let iconPath: string = selectedCard?.icon || '';
      
      if (cardIcon) {
        const uploadedPath = await handleCardIconUpload();
        if (!uploadedPath) throw new Error("Icon upload failed");
        // Remove the base URL if it's included
        iconPath = uploadedPath.replace(ICON_BASE_URL + '/', '');
        if (!iconPath.startsWith('icons/')) {
          iconPath = `icons/${iconPath}`;
        }
      }

      if (!iconPath) throw new Error("Icon is required");

      const cardData = {
        icon: iconPath,
        title: formData.get('title'),
        description: formData.get('description'),
        long_description: formData.get('long_description'),
        action_path: formData.get('action_path'),
        type: formData.get('type'),
        category: formData.get('category')
      };

      console.log('Submitting card data:', cardData);

      const url = selectedCard ? `${CARD_API_URL}/${selectedCard.id}` : CARD_API_URL;
      console.log('Submitting to URL:', url);

      const response = await fetch(url, {
        method: selectedCard ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cardData),
      });

      const data = await response.json();
      console.log('Card submit response:', data);

      if (response.ok) {
        toast.success(`Card ${selectedCard ? 'updated' : 'created'} successfully`, { id: loadingToast });
        fetchCards();
        setIsCardDialogOpen(false);
        setSelectedCard(null);
        setCardIcon(null);
        setCardIconPreview(null);
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting card:', error);
      toast.error(`Failed to ${selectedCard ? 'update' : 'create'} card: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: loadingToast });
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

  const filteredCards = cards.filter(card => {
    const matchesType = filterType === 'all' || card.type === filterType;
    const matchesCategory = filterCategory === 'all' || card.category === filterCategory;
    return matchesType && matchesCategory;
  });

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    fetchCards();
  }, [filterType, filterCategory]);

  return (
    <PageContainer>
      <div className="h-full flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Manage your application's banners and promotional cards.
          </p>
        </div>

        <Tabs defaultValue="banners" className="h-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="banners" className="text-base">Banners</TabsTrigger>
              <TabsTrigger value="cards" className="text-base">Cards</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
              <TabsContent value="banners" className="m-0">
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Banner
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </TabsContent>
              <TabsContent value="cards" className="m-0">
                <Button 
                  onClick={() => {
                    setSelectedCard(null);
                    setCardIcon(null);
                    setCardIconPreview(null);
                    setIsCardDialogOpen(true);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </TabsContent>
            </div>
          </div>

          {/* Banners Content */}
          <TabsContent value="banners" className="mt-0 h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((banner) => (
                <Card key={banner.name} className="group overflow-hidden">
                  <CardContent className="p-0">
                    <div 
                      className="relative h-48 w-full transition-all" 
                      style={{ backgroundColor: banner.backgroundColor }}
                    >
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
                    <div className="p-4 space-y-3 border-t">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate font-medium">
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
                <div className="col-span-full">
                  <EmptyState
                    icon={<Upload className="h-8 w-8" />}
                    title="No banners found"
                    description="Upload a banner to get started"
                    action={
                      <Button onClick={() => setOpenDialog(true)}>
                        Upload Banner
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Cards Content */}
          <TabsContent value="cards" className="mt-0 h-full space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-muted/30 rounded-lg p-3">
              <div className="flex-1 flex items-center gap-3">
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-[140px] h-9 rounded-md border border-input bg-background pl-3 pr-8 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none"
                  >
                    <option value="all">All Types</option>
                    <option value="home">Home</option>
                    <option value="notification">Notification</option>
                    <option value="promotion">Promotion</option>
                    <option value="alert">Alert</option>
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-[140px] h-9 rounded-md border border-input bg-background pl-3 pr-8 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="general">General</option>
                    <option value="payment">Payment</option>
                    <option value="offer">Offer</option>
                    <option value="security">Security</option>
                    <option value="feature">Feature</option>
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
                {(filterType !== 'all' || filterCategory !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setFilterType('all');
                      setFilterCategory('all');
                    }}
                    className="h-9 px-3"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{filteredCards.length}</span>
                <span>cards found</span>
                {(filterType !== 'all' || filterCategory !== 'all') && (
                  <span className="flex items-center gap-1">
                    <span>•</span>
                    <span>Filtered</span>
                  </span>
                )}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card) => (
                <Card key={card.id} className="group overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 rounded-lg border bg-muted/10 p-2">
                        <Image
                          src={getIconUrl(card.icon)}
                          alt={card.title}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg truncate">{card.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="capitalize">
                            {card.type}
                          </Badge>
                          <Badge className="capitalize bg-primary/10 text-primary hover:bg-primary/20">
                            {card.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                      <p className="text-xs text-muted-foreground/75 line-clamp-2">{card.long_description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <code className="text-xs bg-muted px-2 py-1 rounded-md font-mono">
                        {card.action_path}
                      </code>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCard(card);
                            setIsCardDialogOpen(true);
                          }}
                          className="h-8 px-2"
                        >
                          <span className="sr-only">Edit</span>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCard(card.id)}
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <span className="sr-only">Delete</span>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredCards.length === 0 && (
                <div className="col-span-full">
                  <EmptyState
                    icon={<Upload className="h-8 w-8" />}
                    title="No cards found"
                    description={
                      filterType === 'all' && filterCategory === 'all'
                        ? "Get started by creating your first card"
                        : "No cards match your filters"
                    }
                    action={
                      filterType === 'all' && filterCategory === 'all' ? (
                        <Button 
                          onClick={() => {
                            setSelectedCard(null);
                            setCardIcon(null);
                            setCardIconPreview(null);
                            setIsCardDialogOpen(true);
                          }}
                        >
                          Create Card
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setFilterType('all');
                            setFilterCategory('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )
                    }
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Banner Upload Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
              ref={bannerFileInputRef}
            />
            <div
              onClick={() => bannerFileInputRef.current?.click()}
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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      if (bannerFileInputRef.current) {
                        bannerFileInputRef.current.value = '';
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
              <Label>Background Color</Label>
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

      {/* Card Dialog */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedCard ? 'Edit Card' : 'Add New Card'}</DialogTitle>
            <DialogDescription>
              {selectedCard ? 'Update the details of your existing card.' : 'Create a new card to display in your application.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCardSubmit(new FormData(e.currentTarget));
          }}>
            <div className="flex flex-col lg:flex-row gap-8 py-4">
              {/* Left Column - Icon Upload */}
              <div className="w-full lg:w-1/3 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Card Icon</Label>
                  <div
                    onClick={() => cardFileInputRef.current?.click()}
                    className="cursor-pointer relative aspect-square rounded-lg border-2 border-dashed hover:border-primary/50 transition-colors bg-muted/5"
                  >
                    {(cardIconPreview || selectedCard?.icon) ? (
                      <>
                        <Image
                          src={cardIconPreview || (selectedCard?.icon ? getIconUrl(selectedCard.icon) : '')}
                          alt="Preview"
                          fill
                          className="object-contain p-4"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCardIcon(null);
                            setCardIconPreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Upload className="h-12 w-12 mb-2" />
                        <p className="text-sm font-medium">Click to upload icon</p>
                        <p className="text-xs mt-1">SVG, PNG or JPG (max. 800x800px)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="flex-1 grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={selectedCard?.title}
                    className="mt-1.5"
                    placeholder="Enter card title"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={selectedCard?.description}
                    className="mt-1.5"
                    placeholder="Brief description of the card"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="long_description">Detailed Description</Label>
                  <textarea
                    id="long_description"
                    name="long_description"
                    defaultValue={selectedCard?.long_description}
                    className="w-full mt-1.5 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Provide a detailed description"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="action_path">Action Path</Label>
                  <Input
                    id="action_path"
                    name="action_path"
                    defaultValue={selectedCard?.action_path}
                    className="mt-1.5 font-mono"
                    placeholder="/path/to/action"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    name="type"
                    defaultValue={selectedCard?.type || 'home'}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="home">Home</option>
                    <option value="notification">Notification</option>
                    <option value="promotion">Promotion</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={selectedCard?.category || 'general'}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="general">General</option>
                    <option value="payment">Payment</option>
                    <option value="offer">Offer</option>
                    <option value="security">Security</option>
                    <option value="feature">Feature</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCardDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedCard ? 'Update' : 'Create'} Card
              </Button>
            </div>
          </form>
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
            ref={cardFileInputRef}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
