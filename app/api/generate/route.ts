// Imagica's image generation API endpoint
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  const { prompt, style, negativePrompt, numberOfImages, width, height, creativity } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    // Use provided width and height, or default to 1:1 aspect ratio
    const finalWidth = width || 1024;
    const finalHeight = height || 1024;

    // Enhance prompt based on style - this makes the style more pronounced
    let enhancedPrompt = prompt;
    if (style !== "realistic") {
      enhancedPrompt = `${prompt}, ${style} style`;
    }

    // Set up the parameters for the Replicate API call
    const replicateInput = {
      prompt: enhancedPrompt,
      negative_prompt: negativePrompt,
      width: finalWidth,
      height: finalHeight,
      num_outputs: numberOfImages || 1,
      scheduler: "K_EULER",
      num_inference_steps: 4,
      guidance_scale: 7.5,
    };

    // Make the actual API call to generate the image
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: replicateInput,
    });

    let imageUrls: string[] = [];

    // Process the output from Replicate
    if (Array.isArray(output)) {
      for (const item of output) {
        if (item instanceof ReadableStream) {
          // Handle stream data (binary image data)
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

          // Combine all chunks into a single image
          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const imageData = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            imageData.set(chunk, offset);
            offset += chunk.length;
          }

          // Convert to base64 for easy display in the browser
          const base64String = Buffer.from(imageData).toString("base64");
          imageUrls.push(`data:image/webp;base64,${base64String}`);
        } else if (typeof item === "string") {
          // Handle URL strings directly
          imageUrls.push(item);
        }
      }
    }

    if (imageUrls.length === 0) {
      throw new Error("No images were generated");
    }

    return NextResponse.json({ imageUrls });
  } catch (error: unknown) {
    console.error("Error generating image:", error);
    
    // Provide a friendly error message based on the error type
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