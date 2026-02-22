import { NextRequest, NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { createClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// POST /api/polar/verify-checkout
// Called by the success page to confirm payment and upgrade tier.
// Acts as a webhook fallback — works even if the webhook never fires.
export async function POST(request: NextRequest) {
  const { checkoutId } = await request.json();

  if (!checkoutId || typeof checkoutId !== "string") {
    return NextResponse.json({ error: "Missing checkout ID" }, { status: 400 });
  }

  // Auth — ensure caller is a logged-in user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch checkout from Polar
  let checkout;
  try {
    checkout = await polar.checkouts.get({ id: checkoutId });
  } catch (err) {
    console.error("[verify-checkout] Polar fetch error:", err);
    return NextResponse.json({ error: "Checkout not found" }, { status: 404 });
  }

  // Not paid yet
  if (checkout.status !== "succeeded") {
    console.log(`[verify-checkout] checkout ${checkoutId} status=${checkout.status}`);
    return NextResponse.json({ upgraded: false, status: checkout.status });
  }

  // Verify this checkout belongs to the logged-in user
  const meta = checkout.metadata as Record<string, string> | null;
  const checkoutUserId = meta?.supabase_user_id;
  if (checkoutUserId && checkoutUserId !== user.id) {
    console.error("[verify-checkout] user mismatch", { checkoutUserId, userId: user.id });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check if already upgraded (idempotent)
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single();

  if (profile?.tier === "pro") {
    return NextResponse.json({ upgraded: true, alreadyPro: true });
  }

  // Write pro tier — use service role to bypass RLS
  const { error: updateError } = await getSupabaseAdmin()
    .from("profiles")
    .update({
      tier: "pro",
      polar_customer_id: checkout.customerId ?? undefined,
      polar_subscription_id: (checkout as Record<string, unknown>).subscriptionId as string ?? undefined,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("[verify-checkout] Supabase update error:", updateError);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  console.log(`[verify-checkout] user ${user.id} upgraded to Pro via checkout ${checkoutId}`);
  return NextResponse.json({ upgraded: true });
}
