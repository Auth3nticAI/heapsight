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

  const { data: profile } = await supabase
    .from("profiles")
    .select("polar_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.polar_customer_id) {
    return NextResponse.json({ error: "No subscription on file" }, { status: 404 });
  }

  try {
    const session = await polar.customerSessions.create({
      customerId: profile.polar_customer_id,
    });
    return NextResponse.json({ url: session.customerPortalUrl });
  } catch (err) {
    console.error("[portal] Polar session error:", err);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
