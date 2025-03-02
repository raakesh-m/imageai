// app/api/generate/route.ts
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  const { prompt, style, aspectRatio, negativePrompt, numberOfImages } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    // Convert aspect ratio to dimensions
    let width = 768;
    let height = 768;
    switch (aspectRatio) {
      case "16:9":
        width = 1024;
        height = 576;
        break;
      case "4:3":
        width = 1024;
        height = 768;
        break;
      case "3:2":
        width = 1024;
        height = 683;
        break;
      case "9:16":
        width = 576;
        height = 1024;
        break;
    }

    // Enhance prompt based on style
    let enhancedPrompt = prompt;
    if (style !== "realistic") {
      enhancedPrompt = `${prompt}, ${style} style`;
    }

    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt,
        width,
        height,
        num_outputs: numberOfImages || 1,
        scheduler: "K_EULER",
        num_inference_steps: 4,
        guidance_scale: 7.5,
      },
    });

    console.log("Raw output from Replicate:", output);

    let imageUrls: string[] = [];

    if (Array.isArray(output)) {
      for (const item of output) {
        if (item instanceof ReadableStream) {
          const stream = item;
          const reader = stream.getReader();

          const chunks: Uint8Array[] = [];
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
          }

          if (chunks.length === 0) {
            throw new Error("Stream ended without data");
          }

          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const imageData = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            imageData.set(chunk, offset);
            offset += chunk.length;
          }

          const base64String = Buffer.from(imageData).toString("base64");
          imageUrls.push(`data:image/webp;base64,${base64String}`);
        } else if (typeof item === "string") {
          imageUrls.push(item);
        }
      }
    }

    if (imageUrls.length === 0) {
      throw new Error("No images were generated");
    }

    return NextResponse.json({ imageUrls });
  } catch (error: unknown) {
    console.error("Detailed error generating image:", error);
    
    let errorMessage = "Failed to generate image. Please try again.";
    
    if (error instanceof Error) {
      if (error.message.includes("422")) {
        errorMessage = "Invalid generation parameters. Please try different settings.";
      } else if (error.message.includes("429")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.message.includes("503")) {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}