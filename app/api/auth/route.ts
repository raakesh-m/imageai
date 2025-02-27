import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CORRECT_PASSWORD = process.env.SITE_PASSWORD || "your-default-password";
const AUTH_COOKIE_NAME = "auth_token";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === CORRECT_PASSWORD) {
    // Set a cookie to maintain the session
    const cookieStore = cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Invalid password" },
    { status: 401 }
  );
} 