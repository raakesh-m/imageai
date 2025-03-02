// app/components/gallery.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Share2, Heart, Trash2, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

  const toggleSelect = (imageUrl: string) => {
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
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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
  };

  return (
    <section className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Generated Images</h2>
        {selectedImages.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelected}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedImages.size})
            </Button>
          </div>
        )}
      </div>

      {images.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No images generated yet. Start by describing an image above!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className={`relative group rounded-lg overflow-hidden ${
                selectedImages.has(imageUrl) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => toggleSelect(imageUrl)}
            >
              <Image
                src={imageUrl}
                alt={`Generated image ${index + 1}`}
                width={400}
                height={400}
                className="rounded-lg object-cover w-full h-64 transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
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
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavoriteToggle(imageUrl);
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favorites.has(imageUrl) ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}