// app/components/gallery.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Generated Images</h2>
      {images.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No images generated yet. Start by describing an image above!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <Image
  src={imageUrl || "/placeholder.svg"}
  alt={`Generated image ${index + 1}`}
  width={400}
  height={400}
  className="rounded-lg object-cover w-full h-64 shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(75,85,99,0.5)]"
/>
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => window.open(imageUrl, "_blank")}
                >
                  <Download className="h-4 w-4" />
                </Button>
                
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}