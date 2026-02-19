import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_SERVER || "sandbox") as "sandbox" | "production",
});

export const POLAR_PRODUCT_IDS = {
  monthly: process.env.POLAR_PRODUCT_ID_MONTHLY || "",
  yearly: process.env.POLAR_PRODUCT_ID_YEARLY || "",
} as const;

export function getPolarProductId(
  billingPeriod: "monthly" | "yearly"
): string {
  return POLAR_PRODUCT_IDS[billingPeriod];
}
