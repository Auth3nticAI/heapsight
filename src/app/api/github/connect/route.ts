import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { SignJWT } from "jose";

// GET /api/github/connect?redirect=/settings
// Server-side auth → signed state JWT → 302 redirect to GitHub OAuth
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const redirect = searchParams.get("redirect") || "/settings";

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const stateSecret = process.env.GITHUB_STATE_SECRET;
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!stateSecret || !clientId) {
    console.error("[GitHub Connect] Missing GITHUB_STATE_SECRET or GITHUB_CLIENT_ID");
    return NextResponse.redirect(new URL("/settings?github=error", origin));
  }

  // Signed JWT state prevents CSRF and carries user_id + redirect target
  const secret = new TextEncoder().encode(stateSecret);
  const state = await new SignJWT({ user_id: user.id, redirect })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);

  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || origin;
  const githubUrl = new URL("https://github.com/login/oauth/authorize");
  githubUrl.searchParams.set("client_id", clientId);
  githubUrl.searchParams.set("redirect_uri", `${baseUrl}/api/github/callback`);
  githubUrl.searchParams.set("scope", "repo");
  githubUrl.searchParams.set("state", state);

  return NextResponse.redirect(githubUrl.toString());
}
