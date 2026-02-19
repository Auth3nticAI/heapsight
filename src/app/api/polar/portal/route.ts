import { NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { createClient } from "@/lib/supabase-server";

export async function POST() {
  try {
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
      .select("polar_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.polar_customer_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    const session = await polar.customerSessions.create({
      customerId: profile.polar_customer_id,
    });

    return NextResponse.json({ url: session.customerPortalUrl });
  } catch (error: unknown) {
    console.error("[Portal] Error:", error);
    const message =
      error instanceof Error ? error.message : "Portal failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
