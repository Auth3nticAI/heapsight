import { NextRequest, NextResponse } from "next/server";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { createClient } from "@supabase/supabase-js";

// Admin client bypasses RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let event;

  try {
    event = validateEvent(body, headers, process.env.POLAR_WEBHOOK_SECRET!);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error("[Polar Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
    throw error;
  }

  // Use unknown cast to work with Polar SDK types safely
  // The SDK uses camelCase (customerId, subscriptionId) but we access via generic record
  const data = event.data as unknown as Record<string, unknown>;

  try {
    switch (event.type) {
      case "subscription.active":
        await handleSubscriptionActive(data);
        break;

      case "subscription.canceled":
        await handleSubscriptionCanceled(data);
        break;

      case "subscription.revoked":
        await handleSubscriptionRevoked(data);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(data);
        break;

      case "order.paid":
        await handleOrderPaid(data);
        break;

      default:
        console.log(`[Polar Webhook] Unhandled: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 202 });
  } catch (error) {
    console.error("[Polar Webhook] Handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}

type WebhookData = Record<string, unknown>;

async function handleSubscriptionActive(data: WebhookData) {
  const metadata = data.metadata as Record<string, string> | undefined;
  const userId = metadata?.supabase_user_id;
  if (!userId) {
    console.error("[Polar Webhook] No user ID in metadata");
    return;
  }

  const customerId = data.customerId as string;
  const subscriptionId = data.id as string;

  console.log(`[Polar Webhook] Activating subscription for user ${userId}`);

  await supabaseAdmin
    .from("profiles")
    .update({
      tier: "pro",
      polar_customer_id: customerId,
      polar_subscription_id: subscriptionId,
    })
    .eq("id", userId);

  console.log(`[Polar Webhook] User ${userId} upgraded to Pro`);
}

async function handleSubscriptionCanceled(data: WebhookData) {
  const customerId = data.customerId as string;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("polar_customer_id", customerId)
    .single();

  if (profile) {
    console.log(`[Polar Webhook] Downgrading user ${profile.id} to Free`);

    await supabaseAdmin
      .from("profiles")
      .update({ tier: "free", polar_subscription_id: null })
      .eq("id", profile.id);
  }
}

async function handleSubscriptionRevoked(data: WebhookData) {
  const customerId = data.customerId as string;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("polar_customer_id", customerId)
    .single();

  if (profile) {
    console.log(`[Polar Webhook] Revoking subscription for user ${profile.id}`);

    await supabaseAdmin
      .from("profiles")
      .update({ tier: "free", polar_subscription_id: null })
      .eq("id", profile.id);
  }
}

async function handleSubscriptionUpdated(data: WebhookData) {
  const customerId = data.customerId as string;
  const status = data.status as string;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, tier")
    .eq("polar_customer_id", customerId)
    .single();

  if (!profile) return;

  console.log(
    `[Polar Webhook] Subscription updated for user ${profile.id}: ${status}`
  );

  if (status === "canceled" || status === "revoked") {
    await supabaseAdmin
      .from("profiles")
      .update({ tier: "free", polar_subscription_id: null })
      .eq("id", profile.id);
  } else if (status === "active" && profile.tier !== "pro") {
    await supabaseAdmin
      .from("profiles")
      .update({ tier: "pro", polar_subscription_id: data.id as string })
      .eq("id", profile.id);
  }
}

async function handleOrderPaid(data: WebhookData) {
  const subscriptionId = data.subscriptionId as string | null;
  if (!subscriptionId) return;

  const customerId = data.customerId as string;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, tier")
    .eq("polar_customer_id", customerId)
    .single();

  if (profile && profile.tier !== "pro") {
    console.log(
      `[Polar Webhook] Restoring Pro access for user ${profile.id}`
    );

    await supabaseAdmin
      .from("profiles")
      .update({
        tier: "pro",
        polar_subscription_id: subscriptionId,
      })
      .eq("id", profile.id);
  }
}
