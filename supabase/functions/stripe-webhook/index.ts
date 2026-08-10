import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature")
  if (!signature) return new Response("No signature", { status: 400 })

  try {
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    )

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const userId = session.metadata?.user_id
        const customerId = session.customer as string
        const subId = session.subscription as string

        if (userId && subId) {
          const sub = await stripe.subscriptions.retrieve(subId)

          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subId,
            plan: sub.items.data[0]?.price.id === Deno.env.get("STRIPE_TEAM_PRICE_ID") ? "team" : "enterprise",
            status: sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object
        const customerId = sub.customer as string

        // Find user by Stripe customer ID
        const { data } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (data?.user_id) {
          await supabase.from("subscriptions").upsert({
            user_id: data.user_id,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err: any) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }
})
