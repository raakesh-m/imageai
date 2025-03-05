// app/components/gallery.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Share2, Heart, Trash2, Copy, ImageIcon, Maximize2, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GalleryProps {
  images: string[];
  onImagesUpdate?: (imagesToRemove: string[]) => void;
  favorites: Set<string>;
  onFavoriteToggle: (imageUrl: string) => void;
}

export default function Gallery({ 
  images, 
  onImagesUpdate, 
  favorites,
  onFavoriteToggle 
}: GalleryProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to log image dimensions when loaded
  const logImageDimensions = (imageUrl: string, imgElement: HTMLImageElement) => {
    console.log(`Image loaded: ${imageUrl.substring(0, 50)}...`, {
      displayWidth: imgElement.width,
      displayHeight: imgElement.height,
      naturalWidth: imgElement.naturalWidth,
      naturalHeight: imgElement.naturalHeight,
      displayAspectRatio: imgElement.width / imgElement.height,
      naturalAspectRatio: imgElement.naturalWidth / imgElement.naturalHeight
    });
  };

  const toggleSelect = (imageUrl: string, e: React.MouseEvent) => {
    // If clicking on an action button, don't toggle selection
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    setSelectedImages(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(imageUrl)) {
        newSelected.delete(imageUrl);
      } else {
        newSelected.add(imageUrl);
      }
      return newSelected;
    });
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      console.log("Starting download for image:", imageUrl);
      
      // Create a new image element to get the original dimensions
      const img = document.createElement('img');
      img.crossOrigin = "anonymous"; // Add this to handle CORS issues
      img.src = imageUrl;
      
      // Wait for the image to load to get its natural dimensions
      await new Promise<void>((resolve) => {
        img.onload = () => {
          console.log("Image loaded with natural dimensions:", {
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight
          });
          resolve();
        };
        img.onerror = (err) => {
          console.error("Error loading image:", err);
          resolve();
        };
      });
      
      // Create a canvas with the original image dimensions
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      console.log("Canvas created with dimensions:", {
        width: canvas.width,
        height: canvas.height,
        aspectRatio: canvas.width / canvas.height
      });
      
      // Draw the image to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        console.log("Image drawn to canvas");
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            console.log("Blob created with size:", blob.size);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `generated-image-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success("Image downloaded successfully!");
          } else {
            console.error("Failed to create blob from canvas");
          }
        }, 'image/png');
      } else {
        console.error("Failed to get canvas context");
      }
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  const shareImage = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Generated Image",
          text: "Check out this AI-generated image!",
          url: imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success("Image URL copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      toast.error("Failed to share image");
    }
  };

  const deleteSelected = () => {
    const imagesToRemove = Array.from(selectedImages);
    setSelectedImages(new Set());
    onImagesUpdate?.(imagesToRemove);
    toast.success(`${imagesToRemove.length} image${imagesToRemove.length > 1 ? 's' : ''} deleted`);
  };

  const selectAll = () => {
    setSelectedImages(new Set(images));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const sortedImages = [...images].sort((a, b) => {
    if (sortOrder === 'newest') {
      return -1; // Assuming images are already in newest-first order
    } else {
      return 1;
    }
  });

  return (
    <section className="mt-12 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Gallery</h2>
          <Badge variant="outline" className="ml-2">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {selectedImages.size > 0 ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete {selectedImages.size} Selected
              </Button>
            </>
          ) : (
            <>
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-none border-0",
                    sortOrder === 'newest' && "bg-muted"
                  )}
                  onClick={() => setSortOrder('newest')}
                >
                  Newest
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-none border-0",
                    sortOrder === 'oldest' && "bg-muted"
                  )}
                  onClick={() => setSortOrder('oldest')}
                >
                  Oldest
                </Button>
              </div>
              
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-none border-0",
                    isGridView && "bg-muted"
                  )}
                  onClick={() => setIsGridView(true)}
                >
                  Grid
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-none border-0",
                    !isGridView && "bg-muted"
                  )}
                  onClick={() => setIsGridView(false)}
                >
                  List
                </Button>
              </div>
              
              {images.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                >
                  Select All
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg"
          >
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No images yet</h3>
            <p className="text-center text-muted-foreground max-w-md">
              Your generated images will appear here. Start by describing an image above!
            </p>
          </motion.div>
        ) : (
          <div ref={containerRef} className={isGridView 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
          }>
            {sortedImages.map((imageUrl, index) => (
              <motion.div
                key={imageUrl}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative group overflow-hidden",
                  isGridView ? "rounded-lg" : "rounded-lg flex items-center",
                  selectedImages.has(imageUrl) ? "ring-2 ring-primary" : ""
                )}
                onClick={(e) => toggleSelect(imageUrl, e)}
              >
                <Image
                  src={imageUrl}
                  alt={`Generated image ${index + 1}`}
                  width={400}
                  height={400}
                  className={cn(
                    "transition-transform duration-200 group-hover:scale-105",
                    isGridView ? "w-full h-auto" : "h-40 w-auto rounded-lg"
                  )}
                  onLoadingComplete={(img) => logImageDimensions(imageUrl, img)}
                />
                
                {!isGridView && (
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">Image {index + 1}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Generated image</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(imageUrl);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareImage(imageUrl);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </Button>
                      <Button
                        size="sm"
                        variant={favorites.has(imageUrl) ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFavoriteToggle(imageUrl);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Heart
                          className={cn(
                            "h-3.5 w-3.5",
                            favorites.has(imageUrl) && "fill-current"
                          )}
                        />
                        {favorites.has(imageUrl) ? "Favorited" : "Favorite"}
                      </Button>
                    </div>
                  </div>
                )}
                
                {isGridView && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                    <div className="flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Image Preview</DialogTitle>
                            <DialogDescription>
                              Generated image {index + 1}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 flex justify-center">
                            <Image
                              src={imageUrl}
                              alt={`Generated image ${index + 1}`}
                              width={800}
                              height={800}
                              className="max-h-[70vh] w-auto object-contain"
                              onLoadingComplete={(img) => logImageDimensions(imageUrl, img)}
                            />
                          </div>
                          <div className="mt-4 flex justify-center gap-2">
                            <Button
                              onClick={() => downloadImage(imageUrl)}
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => shareImage(imageUrl)}
                              className="flex items-center gap-2"
                            >
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(imageUrl);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareImage(imageUrl);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant={favorites.has(imageUrl) ? "default" : "secondary"}
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFavoriteToggle(imageUrl);
                        }}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            favorites.has(imageUrl) && "fill-current"
                          )}
                        />
                      </Button>
                    </div>
                  </div>
                )}
                
                {selectedImages.has(imageUrl) && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge>Selected</Badge>
                  </div>
                )}
                
                {favorites.has(imageUrl) && !selectedImages.has(imageUrl) && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant="secondary">
                      <Heart className="h-3 w-3 fill-current mr-1" />
                      Favorite
                    </Badge>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}