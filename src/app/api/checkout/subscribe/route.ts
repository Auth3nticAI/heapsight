import { NextRequest, NextResponse } from "next/server";
import { polar, getPolarProductId } from "@/lib/polar";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { billingPeriod } = await request.json();

    if (billingPeriod !== "monthly" && billingPeriod !== "yearly") {
      return NextResponse.json(
        { error: "Invalid billing period" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, polar_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.tier === "pro") {
      return NextResponse.json(
        { error: "Already a Pro user" },
        { status: 400 }
      );
    }

    const productId = getPolarProductId(billingPeriod);
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: user.email || undefined,
      customerId: profile.polar_customer_id || undefined,
      successUrl: `${baseUrl}/upgrade/success?checkout_id={CHECKOUT_ID}`,
      metadata: {
        supabase_user_id: user.id,
        billing_period: billingPeriod,
      },
      allowDiscountCodes: true,
    });

    console.log(`[Checkout] Polar session created: ${checkout.id}`);

    return NextResponse.json({ checkoutId: checkout.id, url: checkout.url });
  } catch (error: unknown) {
    console.error("[Checkout] Error:", error);
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
