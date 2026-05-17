import Stripe from "stripe";
import { getRequiredEnv } from "@/lib/env";

export function getStripe() {
  return new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-04-22.dahlia",
    typescript: true
  });
}
