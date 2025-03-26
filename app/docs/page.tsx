"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoIcon, Code2Icon, ImageIcon, Lightbulb, Settings2 } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Learn how to use our AI Image Generator powered by Stable Diffusion XL.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <div className="rounded-lg border bg-card p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Quick Start Guide</h2>
                <p className="text-muted-foreground">Get up and running in minutes</p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">1. Login</h3>
                <p className="text-sm text-muted-foreground">
                  Access the application using your provided password. This helps maintain
                  controlled access to the image generation service.
                </p>

                <h3 className="font-semibold">2. Create Your First Image</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a descriptive prompt in the text field. Be specific about what
                  you want to see in the generated image. Our implementation of Stable Diffusion XL
                  excels at landscapes, general scenes, and artistic compositions.
                </p>

                <h3 className="font-semibold">3. Customize Generation Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Adjust style, creativity level, and use negative prompts to fine-tune
                  your results. Our service is highly cost-effective
                  for both personal and professional use.
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex gap-2">
                <InfoIcon className="h-4 w-4" />
                <h4 className="font-semibold">Pro Tips</h4>
              </div>
              <p className="mt-2 text-sm">
                While Stable Diffusion XL excels at most scenes, it may need extra guidance for detailed 
                features like hands or faces. Use specific prompts and negative prompts to achieve the best results.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5" />
                  <h3 className="font-semibold">Image Generation</h3>
                </div>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Powered by Stable Diffusion XL</li>
                  <li>Cost-effective image generation</li>
                  <li>Multiple style options</li>
                  <li>Adjustable creativity level</li>
                  <li>Negative prompts support</li>
                  <li>Batch generation</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 className="h-5 w-5" />
                  <h3 className="font-semibold">Gallery Management</h3>
                </div>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Save favorites</li>
                  <li>Download images</li>
                  <li>Share functionality</li>
                  <li>Bulk actions</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5" />
                <h3 className="font-semibold">Pro Tips</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Effective Prompts</h4>
                  <p className="text-sm text-muted-foreground">
                    Include details about style, lighting, mood, and composition in your prompts.
                    Example: "A serene mountain landscape at sunset with dramatic clouds, cinematic lighting, 4K"
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Using Negative Prompts</h4>
                  <p className="text-sm text-muted-foreground">
                    Specify what you don't want to see in the image to improve results.
                    Example: "blurry, low quality, distorted, watermark"
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <div>
                <div className="flex items-center gap-2">
                  <Code2Icon className="h-5 w-5" />
                  <h2 className="text-2xl font-semibold">Technical Details</h2>
                </div>
                <p className="text-muted-foreground mt-2">
                  Implementation details and model specifications
                </p>
              </div>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">Model Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Model: Stable Diffusion XL</li>
                    <li>Output resolution: 1024x1024</li>
                    <li>Average generation time: 3-5 seconds</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Generation Parameters</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>prompt (string, required) - Image description</li>
                    <li>style (string) - Generation style</li>
                    <li>negativePrompt (string) - Elements to avoid</li>
                    <li>numberOfImages (number) - Batch size (1-3)</li>
                    <li>creativity (number) - Creativity level (0-100)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Model Strengths</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Excellent for landscapes and general scenes</li>
                    <li>Fast generation speed</li>
                    <li>Consistent quality</li>
                    <li>Cost-effective for bulk generation</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 