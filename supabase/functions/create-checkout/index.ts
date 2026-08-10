import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno"

const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY")
if (!STRIPE_KEY) throw new Error("STRIPE_SECRET_KEY not set")
console.log("Stripe key loaded, length:", STRIPE_KEY.length, "prefix:", STRIPE_KEY.slice(0, 12))

const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
  maxNetworkRetries: 1,
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Force redeploy to pick up secrets

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const body = await req.json()
    const { priceId, successUrl, cancelUrl } = body

    if (!priceId || !successUrl || !cancelUrl) {
      return new Response(JSON.stringify({ error: "Missing priceId, successUrl, or cancelUrl" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // Get user from JWT
    const jwt = authHeader.replace("Bearer ", "")
    const payload = JSON.parse(atob(jwt.split(".")[1]))
    const userId = payload.sub

    // Look up existing Stripe customer or create one
    const { data: subs } = await stripe.customers.list({ email: payload.email, limit: 1 })
    let customerId: string

    if (subs.length > 0) {
      customerId = subs[0].id
    } else {
      const customer = await stripe.customers.create({
        email: payload.email,
        metadata: { user_id: userId },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { user_id: userId },
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  } catch (err: any) {
    console.error("Checkout error:", err.message, err.type)
    return new Response(JSON.stringify({ error: err.message, type: err.type, raw: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
