import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const TRIAL_DAYS = 7;

export async function POST(req: NextRequest) {
  let body: { referralCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const referralCode = (body.referralCode || "").trim().toLowerCase();
  if (!referralCode) {
    return NextResponse.json({ error: "Missing referralCode" }, { status: 400 });
  }

  // Get the current authenticated user (referee)
  const supabaseAuth = await createServerClient();
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const refereeId = user.id;
  const supabase = getServiceClient();

  // Find referrer by referral_code
  const { data: referrer, error: referrerError } = await supabase
    .from("profiles")
    .select("id, pro_trial_until")
    .eq("referral_code", referralCode)
    .single();

  if (referrerError || !referrer) {
    return NextResponse.json({ error: "Referral code not found" }, { status: 404 });
  }

  // Prevent self-referral
  if (referrer.id === refereeId) {
    return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });
  }

  // Check if referee was already referred (UNIQUE constraint on referee_id)
  const { data: existing } = await supabase
    .from("referrals")
    .select("id")
    .eq("referee_id", refereeId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, message: "Already processed" });
  }

  const trialUntil = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Extend referrer's trial: max(current pro_trial_until, now + 7 days)
  const referrerCurrentTrial = referrer.pro_trial_until
    ? new Date(referrer.pro_trial_until)
    : new Date(0);
  const newReferrerTrial =
    referrerCurrentTrial > new Date(trialUntil)
      ? referrer.pro_trial_until
      : trialUntil;

  // Run all updates (best-effort — don't roll back if one fails)
  await Promise.all([
    // Insert referral record
    supabase.from("referrals").insert({
      referrer_id: referrer.id,
      referee_id: refereeId,
      referral_code: referralCode,
      rewarded: true,
    }),
    // Give referee 7 days trial
    supabase
      .from("profiles")
      .update({ referred_by: referrer.id, pro_trial_until: trialUntil })
      .eq("id", refereeId),
    // Extend referrer's trial
    supabase
      .from("profiles")
      .update({ pro_trial_until: newReferrerTrial })
      .eq("id", referrer.id),
  ]);

  return NextResponse.json({ ok: true });
}
