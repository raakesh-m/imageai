"use client";
import Hero from "@/components/Hero"
import ImageGenerator from "@/components/ImageGenerator"
import Gallery from "@/components/Gallery"
import { useState } from "react";

export default function Home() {
  const [images, setImages] = useState<string[]>([]);

  const addImage = (imageUrl: string) => {
    setImages((prevImages) => [imageUrl, ...prevImages]);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Hero />
      <ImageGenerator onImageGenerated={addImage} />
      <Gallery images={images} />
    </div>
  )
}

