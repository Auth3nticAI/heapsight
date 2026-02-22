import { NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { createClient } from "@/lib/supabase-server";

// GET /api/polar/portal
// Returns { url } for the Polar Customer Portal, or { error } if not found.
// The caller (settings page) does window.location.href = data.url.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("polar_customer_id")
    .eq("id", user.id)
    .single();

  console.log("[portal] profile lookup:", { userId: user.id, profileError, polar_customer_id: profile?.polar_customer_id });

  if (!profile?.polar_customer_id) {
    return NextResponse.json({ error: "No subscription on file", detail: "polar_customer_id is null or profile not found" }, { status: 404 });
  }

  try {
    console.log("[portal] creating customer session for:", profile.polar_customer_id);
    const session = await polar.customerSessions.create({
      customerId: profile.polar_customer_id,
    });
    console.log("[portal] session created, url:", session.customerPortalUrl);
    return NextResponse.json({ url: session.customerPortalUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const detail = (err as Record<string, unknown>)?.body ?? (err as Record<string, unknown>)?.response ?? message;
    console.error("[portal] Polar session error:", { message, detail, customerId: profile.polar_customer_id });
    return NextResponse.json({ error: "Failed to create portal session", detail: String(detail), customerId: profile.polar_customer_id }, { status: 500 });
  }
}
