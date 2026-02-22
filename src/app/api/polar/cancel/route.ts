import { NextRequest, NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { createClient } from "@/lib/supabase-server";

// POST /api/polar/cancel
// Cancels the current user's subscription at period end.
// Requires: polar_customer_id + polar_subscription_id in profiles table.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let reason = "";
  let feedback = "";
  try {
    const body = await request.json();
    reason = body.reason ?? "";
    feedback = body.feedback ?? "";
  } catch {
    // body is optional
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("polar_customer_id, polar_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.polar_customer_id) {
    return NextResponse.json({ error: "No customer ID on file" }, { status: 404 });
  }

  if (!profile?.polar_subscription_id) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 });
  }

  try {
    // The customer portal cancel endpoint needs a customer session token, not the org token.
    const session = await polar.customerSessions.create({
      customerId: profile.polar_customer_id,
    });

    // Cancel at period end — user keeps Pro until currentPeriodEnd.
    // Must use polar.customerPortal.subscriptions (PolarSubscriptions) which accepts
    // a customer session token, not polar.subscriptions (org-level, no cancel method).
    const subscription = await polar.customerPortal.subscriptions.cancel(
      { customerSession: session.token },
      { id: profile.polar_subscription_id }
    );

    console.log(`[cancel] user=${user.id} reason="${reason}" endsAt=${subscription.currentPeriodEnd}`);
    if (feedback) console.log(`[cancel] feedback: ${feedback}`);

    return NextResponse.json({
      success: true,
      endsAt: subscription.currentPeriodEnd,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const detail = (err as Record<string, unknown>)?.body ?? message;
    console.error("[cancel] Polar error:", { message, detail });
    return NextResponse.json(
      { error: "Cancellation failed", detail: String(detail) },
      { status: 500 }
    );
  }
}
