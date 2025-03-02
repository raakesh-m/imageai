"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Code2Icon, ImageIcon, Lightbulb, Settings2 } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Learn how to use AI Image Generator effectively and explore its features.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
                <CardDescription>Get up and running in minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold">1. Login</h3>
                <p className="text-sm text-muted-foreground">
                  Access the application using your provided password. This helps maintain
                  controlled access to the image generation service.
                </p>

                <h3 className="font-semibold">2. Create Your First Image</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a descriptive prompt in the text field. Be specific about what
                  you want to see in the generated image.
                </p>

                <h3 className="font-semibold">3. Customize Generation Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Adjust style, aspect ratio, and use negative prompts to fine-tune
                  your results.
                </p>
              </CardContent>
            </Card>

            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Tip</AlertTitle>
              <AlertDescription>
                More detailed prompts generally lead to better results. Try to be specific
                about style, mood, and details you want to see.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Image Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Multiple style options</li>
                    <li>Custom aspect ratios</li>
                    <li>Negative prompts</li>
                    <li>Batch generation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Gallery Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Save favorites</li>
                    <li>Download images</li>
                    <li>Share functionality</li>
                    <li>Bulk actions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2Icon className="h-5 w-5" />
                  API Reference
                </CardTitle>
                <CardDescription>
                  Endpoint and parameter documentation for image generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Generate Image Endpoint</h3>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    POST /api/generate
                  </code>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Parameters</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>prompt (string, required) - Image description</li>
                    <li>style (string) - Generation style</li>
                    <li>aspectRatio (string) - Image dimensions</li>
                    <li>negativePrompt (string) - Elements to avoid</li>
                    <li>numberOfImages (number) - Batch size (1-4)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Response</h4>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    {"{ imageUrls: string[] }"}
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 