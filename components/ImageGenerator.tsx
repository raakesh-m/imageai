// app/components/ImageGenerator.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ImageGeneratorProps {
  onImageGenerated: (imageUrls: string[]) => void;
}

export default function ImageGenerator({ onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    style: "realistic",
    aspectRatio: "1:1",
    negativePrompt: "",
    numberOfImages: 1
  });

  const styles = [
    "realistic", "anime", "digital-art", "photographic", 
    "cinematic", "cartoon", "fantasy", "abstract"
  ];

  const aspectRatios = ["1:1", "16:9", "4:3", "3:2", "9:16"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt,
          ...settings
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      onImageGenerated(data.imageUrls);
      console.log("Generated image URLs:", data.imageUrls);
    } catch (error) {
      console.error("Error generating image:", error);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mb-12 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <Input
            type="text"
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-grow"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Negative Prompt (what to avoid)</label>
          <Input
            type="text"
            placeholder="Elements to exclude from the image..."
            value={settings.negativePrompt}
            onChange={(e) => setSettings({...settings, negativePrompt: e.target.value})}
            className="flex-grow"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Style</label>
            <select 
              className="w-full p-2 border rounded-md bg-background"
              value={settings.style}
              onChange={(e) => setSettings({...settings, style: e.target.value})}
            >
              {styles.map(style => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Aspect Ratio</label>
            <select 
              className="w-full p-2 border rounded-md bg-background"
              value={settings.aspectRatio}
              onChange={(e) => setSettings({...settings, aspectRatio: e.target.value})}
            >
              {aspectRatios.map(ratio => (
                <option key={ratio} value={ratio}>{ratio}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Images</label>
          <Input
            type="number"
            min="1"
            max="4"
            value={settings.numberOfImages}
            onChange={(e) => setSettings({...settings, numberOfImages: parseInt(e.target.value)})}
            className="w-32"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating
            </>
          ) : (
            "Generate Image"
          )}
        </Button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}