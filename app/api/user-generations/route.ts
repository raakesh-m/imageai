// Imagica's user generation tracking API
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

interface Generation {
  timestamp: number;
}

// We're allowing 2 generations per day per user
const DAILY_LIMIT = 2;
const HOURS_24 = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const COOKIE_NAME = "user_generations";

// Get the user's generation history from cookies
function getUserGenerations(userId: string): Generation[] {
  const cookieStore = cookies();
  const generationsCookie = cookieStore.get(COOKIE_NAME + "_" + userId);
  
  if (!generationsCookie?.value) {
    return [];
  }
  
  try {
    return JSON.parse(generationsCookie.value);
  } catch (error) {
    console.error("Error parsing generations cookie:", error);
    return [];
  }
}

// Save the user's generation history to cookies
function setUserGenerations(userId: string, generations: Generation[]) {
  const cookieStore = cookies();
  cookieStore.set({
    name: COOKIE_NAME + "_" + userId,
    value: JSON.stringify(generations),
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "strict"
  });
}

// Remove generations older than 24 hours
function cleanupOldGenerations(userId: string): Generation[] {
  const generations = getUserGenerations(userId);
  const now = Date.now();
  
  // Filter out generations older than 24 hours
  const validGenerations = generations
    .filter(gen => {
      const timeDiff = now - gen.timestamp;
      return timeDiff < HOURS_24;
    })
    .sort((a, b) => a.timestamp - b.timestamp);
  
  // Update cookie with cleaned up generations
  setUserGenerations(userId, validGenerations);
  
  return validGenerations;
}

// Calculate generation limits and time until reset
function getGenerationInfo(validGenerations: Generation[]) {
  const now = Date.now();
  const usedGenerations = validGenerations.length;
  const remainingGenerations = Math.max(0, DAILY_LIMIT - usedGenerations);
  
  let timeUntilReset = HOURS_24;
  
  if (validGenerations.length > 0) {
    const oldestGeneration = validGenerations[0];
    const resetTime = oldestGeneration.timestamp + HOURS_24;
    timeUntilReset = Math.max(0, resetTime - now);
  }

  return {
    remainingGenerations,
    usedGenerations,
    timeUntilReset,
    nextResetTime: new Date(now + timeUntilReset).toISOString()
  };
}

// GET endpoint to check how many generations a user has left
export async function GET(request: NextRequest) {
  const { userId } = await getAuth(request);
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const validGenerations = cleanupOldGenerations(userId);
  const info = getGenerationInfo(validGenerations);
  
  return NextResponse.json(info);
}

// POST endpoint to record a new generation and check limits
export async function POST(request: NextRequest) {
  const { userId } = await getAuth(request);
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Clean up old generations first
  const validGenerations = cleanupOldGenerations(userId);
  
  // Check if limit is reached
  if (validGenerations.length >= DAILY_LIMIT) {
    const oldestGeneration = validGenerations[0];
    const resetTime = oldestGeneration.timestamp + HOURS_24;
    const timeUntilReset = Math.max(0, resetTime - Date.now());
    
    return new NextResponse(
      JSON.stringify({
        error: "Generation limit reached",
        timeUntilReset,
        nextResetTime: new Date(Date.now() + timeUntilReset).toISOString()
      }), 
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  // Add new generation
  const now = Date.now();
  const newGenerations = [...validGenerations, { timestamp: now }];
  
  // Update cookie storage
  setUserGenerations(userId, newGenerations);

  const info = getGenerationInfo(newGenerations);

  return NextResponse.json(info);
} 