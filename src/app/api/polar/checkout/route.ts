import { NextRequest, NextResponse } from "next/server";
import { polar, getPolarProductId } from "@/lib/polar";
import { createClient } from "@/lib/supabase-server";

// GET /api/polar/checkout?billing=monthly|yearly
// Server-side auth → Polar checkout session → 302 redirect to Polar-hosted checkout
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const billingPeriod =
    searchParams.get("billing") === "monthly" ? "monthly" : "yearly";

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, polar_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.tier === "pro") {
    return NextResponse.redirect(new URL("/account", origin));
  }

  const productId = getPolarProductId(billingPeriod);
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || origin;

  const checkout = await polar.checkouts.create({
    products: [productId],
    customerEmail: user.email ?? undefined,
    customerId: profile?.polar_customer_id ?? undefined,
    successUrl: `${baseUrl}/upgrade/success?checkout_id={CHECKOUT_ID}`,
    metadata: {
      supabase_user_id: user.id,
      billing_period: billingPeriod,
    },
    allowDiscountCodes: true,
  });

  console.log(`[Checkout] Polar session created: ${checkout.id}`);
  return NextResponse.redirect(checkout.url);
}
