// Hey, this is the main image generator component for Imagica
"use client";

import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Sparkles, Wand2, Settings, X, Info, Zap, Check } from "lucide-react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ImageGeneratorProps {
  onImageGenerated: (imageUrls: string[]) => void;
}

interface GenerationLimitInfo {
  remainingGenerations: number;
  usedGenerations: number;
  timeUntilReset: number;
  nextResetTime: string;
}

// We're limiting to 2 generations per day for now - might increase this later
const DAILY_LIMIT = 2;

export default function ImageGenerator({ onImageGenerated }: ImageGeneratorProps) {
  const { isSignedIn } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [settings, setSettings] = useState({
    style: "realistic",
    negativePrompt: "",
    numberOfImages: 1,
    creativity: 50,
  });
  const [generationLimitInfo, setGenerationLimitInfo] = useState<GenerationLimitInfo | null>(null);

  // These are the style options users can choose from
  const styles = [
    { id: "realistic", name: "Realistic", icon: "🖼️" },
    { id: "anime", name: "Anime", icon: "🎭" },
    { id: "digital-art", name: "Digital Art", icon: "🎨" },
    { id: "photographic", name: "Photographic", icon: "📸" },
    { id: "cinematic", name: "Cinematic", icon: "🎬" },
    { id: "cartoon", name: "Cartoon", icon: "✏️" },
    { id: "fantasy", name: "Fantasy", icon: "🧙" },
    { id: "abstract", name: "Abstract", icon: "🌀" }
  ];

  // Some cool example prompts to help users get started
  const examplePrompts = [
    "A serene mountain landscape at sunset with a lake reflection",
    "Futuristic cyberpunk city with neon lights and flying cars",
    "Cute cartoon fox in a magical forest with glowing mushrooms",
    "Underwater scene with colorful coral reef and tropical fish",
    "Astronaut standing on an alien planet with two moons in the sky"
  ];

  useEffect(() => {
    if (isSignedIn) {
      fetchGenerationLimit();
      // Refresh every 5 minutes to keep the UI up to date
      const interval = setInterval(fetchGenerationLimit, 300000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn]);

  const fetchGenerationLimit = async () => {
    try {
      const response = await fetch("/api/user-generations", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch generation limit");
      }
      const data = await response.json();
      setGenerationLimitInfo(data);
      return data;
    } catch (error) {
      console.error("Error fetching generation limit:", error);
      return null;
    }
  };

  // Helper to format the time until reset in a human-readable way
  const formatTimeUntilReset = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error("You need to provide a description of the image you want to generate", {
        duration: 4000
      });
      return;
    }

    if (!isSignedIn) {
      toast.custom((t) => (
        <div className="bg-destructive text-destructive-foreground relative w-full rounded-lg p-4 shadow-lg">
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium mb-1">Please sign in to generate images</h3>
              <p className="text-sm opacity-90">You need to be signed in to create AI-generated images</p>
            </div>
            <div className="flex items-center">
              <SignInButton mode="modal">
                <button className="bg-background hover:bg-muted text-foreground px-3 py-1.5 text-sm font-medium rounded-md transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      ), {
        duration: 3000
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, increment the generation count
      const limitResponse = await fetch("/api/user-generations", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        cache: "no-store"
      });

      if (!limitResponse.ok) {
        const errorData = await limitResponse.json();
        if (limitResponse.status === 429) {
          toast.error("Generation limit reached", {
            description: `Next generation available in ${formatTimeUntilReset(errorData.timeUntilReset)}`,
            duration: 6000
          });
          await fetchGenerationLimit();
          return;
        }
        throw new Error(errorData.error || "Failed to update generation count");
      }

      // Update generation info after incrementing
      const limitData = await limitResponse.json();
      setGenerationLimitInfo(limitData);

      // Only proceed with image generation after successful count increment
      toast.loading("Creating your masterpiece...", {
        description: "This may take a few moments. Please wait while we generate your image.",
        duration: 10000,
        id: "generation-toast"
      });
      
      // Create request body with default dimensions
      const requestBody = { 
        prompt,
        ...settings,
        width: 1024,
        height: 576,
        creativity: settings.creativity / 100 // Convert to 0-1 range for API
      };
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        toast.dismiss("generation-toast");
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to generate image");
      }

      const data = await response.json();
      
      toast.dismiss("generation-toast");
      toast.success("Image generated successfully!", {
        description: "Your AI-generated image is ready to view",
        duration: 4000
      });
      
      if (data.imageUrls && data.imageUrls.length > 0) {
        onImageGenerated(data.imageUrls);
      } else {
        throw new Error("No images were returned");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      toast.dismiss("generation-toast");
      toast.error("Failed to generate image", {
        description: error instanceof Error ? error.message : "An unexpected error occurred while generating your image",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick way to use one of the example prompts
  const useExamplePrompt = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="max-w-6xl mx-auto mb-12 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-xl shadow-lg p-6 border border-border"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Imagica Generator</h3>
              </div>
              
              {isSignedIn && generationLimitInfo && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={generationLimitInfo.remainingGenerations > 0 ? "outline" : "destructive"} className="flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5" />
                          <span>{generationLimitInfo.remainingGenerations}/{DAILY_LIMIT}</span>
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {generationLimitInfo.remainingGenerations > 0 ? (
                        <p>You have {generationLimitInfo.remainingGenerations} generations remaining today</p>
                      ) : (
                        <p>Generation limit reached. Next generation available in {formatTimeUntilReset(generationLimitInfo.timeUntilReset)}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <div className="relative">
              <Textarea
                placeholder="Describe the image you want to generate in detail..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none pr-10 text-base"
              />
              {prompt && (
                <button 
                  type="button"
                  onClick={() => setPrompt("")}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {examplePrompts.map((examplePrompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => useExamplePrompt(examplePrompt)}
                  className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full text-muted-foreground transition-colors"
                >
                  {examplePrompt.length > 30 ? examplePrompt.substring(0, 30) + "..." : examplePrompt}
                </button>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic" className="flex items-center gap-1.5">
                <Wand2 className="h-4 w-4" />
                <span>Basic</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1.5">
                <Settings className="h-4 w-4" />
                <span>Advanced</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <span>Style</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Choose a visual style for your generated image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {styles.map(style => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSettings({...settings, style: style.id})}
                        className={cn(
                          "flex flex-col items-center justify-center p-2 rounded-md border transition-all",
                          settings.style === style.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span className="text-xl mb-1">{style.icon}</span>
                        <span className="text-xs font-medium">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span>Creativity Level</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Higher values produce more creative but less predictable results</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-xs text-muted-foreground">{settings.creativity}%</span>
                  </label>
                  <Slider
                    value={[settings.creativity]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => setSettings({...settings, creativity: value[0]})}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <span>Negative Prompt</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Specify elements you want to exclude from the image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <Textarea
                    placeholder="Elements to exclude from the image..."
                    value={settings.negativePrompt}
                    onChange={(e) => setSettings({...settings, negativePrompt: e.target.value})}
                    className="resize-none h-20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <span>Number of Images</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Generate multiple variations (uses more of your daily limit)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSettings({...settings, numberOfImages: num})}
                        className={cn(
                          "flex-1 py-2 rounded-md border transition-all",
                          settings.numberOfImages === num 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            type="submit" 
            className="w-full h-12 text-base"
            disabled={isLoading || (isSignedIn && generationLimitInfo?.remainingGenerations === 0)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating your masterpiece...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                {isSignedIn ? "Generate Image" : "Sign in to Generate"}
              </>
            )}
          </Button>

          {isSignedIn && generationLimitInfo && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              {generationLimitInfo.remainingGenerations > 0 ? (
                <span>
                  {generationLimitInfo.usedGenerations}/{DAILY_LIMIT} generations used. {generationLimitInfo.remainingGenerations} {generationLimitInfo.remainingGenerations === 1 ? 'generation' : 'generations'} remaining in the next 24 hours
                </span>
              ) : (
                <span>Generation limit reached ({DAILY_LIMIT}/{DAILY_LIMIT} used). Next generation available in {formatTimeUntilReset(generationLimitInfo.timeUntilReset)}</span>
              )}
            </div>
          )}
        </form>
      </motion.div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}