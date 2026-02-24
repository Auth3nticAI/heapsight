import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Basic validation — only allow alphanumeric codes (8 chars)
  if (!code || !/^[a-z0-9]{4,16}$/i.test(code)) {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  const response = NextResponse.redirect(new URL("/signup", req.url));

  // Store referral code in a client-readable cookie (7-day expiry)
  response.cookies.set("hs_ref", code.toLowerCase(), {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    httpOnly: false, // readable by client JS so onboarding can pick it up
    sameSite: "lax",
  });

  return response;
}
