import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env vars");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/github/callback?code=xxx&state=yyy
// Exchange code for access token, store on profiles, redirect back
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/settings?github=error", origin));
  }

  // Verify state JWT
  let userId: string;
  let redirect: string;
  try {
    const secret = new TextEncoder().encode(process.env.GITHUB_STATE_SECRET!);
    const { payload } = await jwtVerify(state, secret);
    userId = payload.user_id as string;
    redirect = (payload.redirect as string) || "/settings";
  } catch {
    console.error("[GitHub Callback] State verification failed (expired or invalid)");
    return NextResponse.redirect(new URL("/settings?github=expired", origin));
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error("[GitHub Callback] Token exchange failed:", tokenData);
    return NextResponse.redirect(new URL("/settings?github=error", origin));
  }

  // Fetch GitHub username
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const githubUser = await userRes.json();

  if (!githubUser.login) {
    console.error("[GitHub Callback] Failed to fetch GitHub user");
    return NextResponse.redirect(new URL("/settings?github=error", origin));
  }

  // Store on profiles using service role client
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({
      github_access_token: tokenData.access_token,
      github_username: githubUser.login,
    })
    .eq("id", userId);

  if (error) {
    console.error("[GitHub Callback] Profile update failed:", error);
    return NextResponse.redirect(new URL("/settings?github=error", origin));
  }

  console.log(`[GitHub] Connected: user ${userId} → @${githubUser.login}`);
  return NextResponse.redirect(new URL(`${redirect}?github=connected`, origin));
}
