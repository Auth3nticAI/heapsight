import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ["/learn", "/lesson", "/onboarding", "/settings",
    "/account", "/paths", "/progress", "/leaderboard", "/practice", "/upgrade"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If logged in and visiting login/signup, redirect based on profile state
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/learn";
    return NextResponse.redirect(url);
  }

  // If authed user hits /learn or /lesson but hasn't selected a template → /onboarding
  if (
    user &&
    !pathname.startsWith("/onboarding") &&
    (pathname.startsWith("/learn") || pathname.startsWith("/lesson"))
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("selected_game_template, onboarding_completed")
      .eq("id", user.id)
      .single();

    if (!profile?.selected_game_template || !profile?.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/learn/:path*",
    "/lesson/:path*",
    "/login",
    "/signup",
    "/onboarding",
    "/reset-password",
    "/update-password",
    "/settings",
    "/account",
    "/paths",
    "/progress",
    "/leaderboard",
    "/practice",
    "/upgrade",
  ],
};
