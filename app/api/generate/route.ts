// app/api/generate/route.ts
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: { prompt },
    });

    console.log("Raw output from Replicate:", output);

    let imageUrl: string;

    if (Array.isArray(output) && output[0] instanceof ReadableStream) {
      const stream = output[0];
      const reader = stream.getReader();

      // Read the entire stream into a buffer
      const chunks: Uint8Array[] = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      if (chunks.length === 0) {
        throw new Error("Stream ended without data");
      }

      // Combine chunks into a single Uint8Array
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const imageData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        imageData.set(chunk, offset);
        offset += chunk.length;
      }

      // Convert to base64
      const base64String = Buffer.from(imageData).toString("base64");
      imageUrl = `data:image/webp;base64,${base64String}`;
      console.log("Generated base64 image URL (first 50 chars):", imageUrl.substring(0, 50));
    } else if (Array.isArray(output) && typeof output[0] === "string") {
      imageUrl = output[0]; // Direct URL case
    } else {
      throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
    }

    console.log("Final imageUrl (length):", imageUrl.length);
    return NextResponse.json({ imageUrl });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Detailed error generating image:", error);
    return NextResponse.json(
      { error: `Failed to generate image: ${errorMessage}` },
      { status: 500 }
    );
  }
}