import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function generateCode(): string {
  // 8-char lowercase alphanumeric (no ambiguous chars like 0/O, 1/l)
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST() {
  const supabaseAuth = await createServerClient();
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Check if code already exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single();

  if (profile?.referral_code) {
    return NextResponse.json({ code: profile.referral_code });
  }

  // Generate a unique code (retry if collision)
  let code = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    code = generateCode();
    const { error } = await supabase
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", user.id);
    if (!error) break;
    code = "";
  }

  if (!code) {
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }

  return NextResponse.json({ code });
}
