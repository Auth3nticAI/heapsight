import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env vars");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

type AnyData = Record<string, unknown>;

async function activatePro(data: AnyData) {
  const metadata = data.metadata as Record<string, string> | undefined;
  const userId = metadata?.supabase_user_id;
  if (!userId) {
    console.error("[Polar Webhook] subscription.active: no user ID in metadata");
    return;
  }
  await getSupabaseAdmin()
    .from("profiles")
    .update({
      tier: "pro",
      polar_customer_id: data.customerId as string,
      polar_subscription_id: data.id as string,
    })
    .eq("id", userId);
  console.log(`[Polar Webhook] subscription.active: user ${userId} → Pro`);
}

async function downgradeFree(data: AnyData) {
  const customerId = data.customerId as string;
  const { data: profile } = await getSupabaseAdmin()
    .from("profiles")
    .select("id")
    .eq("polar_customer_id", customerId)
    .single();
  if (profile) {
    await getSupabaseAdmin()
      .from("profiles")
      .update({ tier: "free", polar_subscription_id: null })
      .eq("id", profile.id);
    console.log(`[Polar Webhook] downgraded: user ${profile.id} → Free`);
  }
}

async function handleSubscriptionUpdated(data: AnyData) {
  const customerId = data.customerId as string;
  const status = data.status as string;
  const { data: profile } = await getSupabaseAdmin()
    .from("profiles")
    .select("id, tier")
    .eq("polar_customer_id", customerId)
    .single();
  if (!profile) return;
  if (status === "canceled" || status === "revoked") {
    await getSupabaseAdmin()
      .from("profiles")
      .update({ tier: "free", polar_subscription_id: null })
      .eq("id", profile.id);
  } else if (status === "active" && profile.tier !== "pro") {
    await getSupabaseAdmin()
      .from("profiles")
      .update({ tier: "pro", polar_subscription_id: data.id as string })
      .eq("id", profile.id);
  }
  console.log(`[Polar Webhook] subscription.updated: user ${profile.id}, status=${status}`);
}

async function handleOrderPaid(data: AnyData) {
  const subscriptionId = data.subscriptionId as string | null;
  if (!subscriptionId) return;
  const customerId = data.customerId as string;
  const { data: profile } = await getSupabaseAdmin()
    .from("profiles")
    .select("id, tier")
    .eq("polar_customer_id", customerId)
    .single();
  if (profile && profile.tier !== "pro") {
    await getSupabaseAdmin()
      .from("profiles")
      .update({ tier: "pro", polar_subscription_id: subscriptionId })
      .eq("id", profile.id);
    console.log(`[Polar Webhook] order.paid: user ${profile.id} → Pro restored`);
  }
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionActive: async ({ data }) => {
    await activatePro(data as unknown as AnyData);
  },
  onSubscriptionCanceled: async ({ data }) => {
    await downgradeFree(data as unknown as AnyData);
  },
  onSubscriptionRevoked: async ({ data }) => {
    await downgradeFree(data as unknown as AnyData);
  },
  onSubscriptionUpdated: async ({ data }) => {
    await handleSubscriptionUpdated(data as unknown as AnyData);
  },
  onOrderPaid: async ({ data }) => {
    await handleOrderPaid(data as unknown as AnyData);
  },
});
