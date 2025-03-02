"use client";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import Hero from "@/components/Hero";
import ImageGenerator from "@/components/ImageGenerator";
import Gallery from "@/components/Gallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to safely parse JSON from localStorage
const getStorageItem = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export default function Home() {
  // Use empty initial states to avoid hydration mismatch
  const [images, setImages] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // Load data from localStorage after hydration
  useEffect(() => {
    setImages(getStorageItem("generatedImages", []));
    setFavorites(new Set(getStorageItem("favorites", [])));
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever state changes, but only after hydration
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem("generatedImages", JSON.stringify(images));
    } catch (error) {
      console.error("Error saving images to localStorage:", error);
    }
  }, [images, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem("favorites", JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  }, [favorites, isHydrated]);

  const addImages = (newImageUrls: string[]) => {
    setImages(prevImages => {
      const updatedImages = [...newImageUrls, ...prevImages];
      if (isHydrated) {
        try {
          localStorage.setItem("generatedImages", JSON.stringify(updatedImages));
        } catch (error) {
          console.error("Error saving images:", error);
        }
      }
      return updatedImages;
    });
  };

  const removeImages = (imagesToRemove: string[]) => {
    setImages(prevImages => {
      const updatedImages = prevImages.filter(img => !imagesToRemove.includes(img));
      if (isHydrated) {
        try {
          localStorage.setItem("generatedImages", JSON.stringify(updatedImages));
        } catch (error) {
          console.error("Error saving images:", error);
        }
      }
      return updatedImages;
    });
    
    // Also remove from favorites if present
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      imagesToRemove.forEach(img => newFavorites.delete(img));
      if (isHydrated) {
        try {
          localStorage.setItem("favorites", JSON.stringify(Array.from(newFavorites)));
        } catch (error) {
          console.error("Error saving favorites:", error);
        }
      }
      return newFavorites;
    });
  };

  const toggleFavorite = (imageUrl: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageUrl)) {
        newFavorites.delete(imageUrl);
      } else {
        newFavorites.add(imageUrl);
      }
      if (isHydrated) {
        try {
          localStorage.setItem("favorites", JSON.stringify(Array.from(newFavorites)));
        } catch (error) {
          console.error("Error saving favorites:", error);
        }
      }
      return newFavorites;
    });
  };

  // If not hydrated yet, show a minimal UI that matches the server
  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Hero />
        <ImageGenerator onImageGenerated={addImages} />
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="all">All Images</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Gallery
              images={[]}
              onImagesUpdate={removeImages}
              favorites={new Set()}
              onFavoriteToggle={toggleFavorite}
            />
          </TabsContent>
          <TabsContent value="favorites">
            <Gallery
              images={[]}
              onImagesUpdate={removeImages}
              favorites={new Set()}
              onFavoriteToggle={toggleFavorite}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Hero />
        <ImageGenerator onImageGenerated={addImages} />
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="all">All Images</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Gallery
              images={images}
              onImagesUpdate={removeImages}
              favorites={favorites}
              onFavoriteToggle={toggleFavorite}
            />
          </TabsContent>
          
          <TabsContent value="favorites">
            <Gallery
              images={Array.from(favorites)}
              onImagesUpdate={(imagesToRemove) => {
                setFavorites(prev => {
                  const newFavorites = new Set(prev);
                  imagesToRemove.forEach(img => newFavorites.delete(img));
                  if (isHydrated) {
                    try {
                      localStorage.setItem("favorites", JSON.stringify(Array.from(newFavorites)));
                    } catch (error) {
                      console.error("Error saving favorites:", error);
                    }
                  }
                  return newFavorites;
                });
              }}
              favorites={favorites}
              onFavoriteToggle={toggleFavorite}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

