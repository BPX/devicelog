'use client'

import { K as SUPABASE_KEY } from './auth'

const EDGE_URL = 'https://mbsjxuymiuevankxrgmo.supabase.co/functions/v1'

function token(): string {
  return localStorage.getItem('sb_token') || 'anon'
}

/**
 * Open a Stripe Checkout session for the given price.
 * Redirects the browser to Stripe's hosted checkout page.
 */
export async function startCheckout(
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ error?: string }> {
  const tok = token()
  if (tok === 'anon') return { error: 'Not authenticated' }

  try {
    const r = await fetch(`${EDGE_URL}/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tok}`,
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({ priceId, successUrl, cancelUrl }),
    })

    const data = await r.json()
    if (!r.ok) return { error: data.error || 'Failed to start checkout' }

    // Redirect to Stripe
    if (data.url) {
      window.location.href = data.url
    }
    return {}
  } catch (e: any) {
    return { error: e?.message || 'Network error' }
  }
}

/**
 * Fetch the current user's subscription status from Supabase.
 */
export async function getSubscription(): Promise<{
  plan: string
  status: string
  current_period_end: string | null
} | null> {
  const tok = token()
  if (tok === 'anon') return null

  try {
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbsjxuymiuevankxrgmo.supabase.co'}/rest/v1/subscriptions?select=*&user_id=eq.${uid()}&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${tok}`,
        },
      }
    )
    if (!r.ok) return null
    const data = await r.json()
    return data?.[0] || null
  } catch {
    return null
  }
}

function uid(): string {
  const t = localStorage.getItem('sb_token')
  if (!t) return 'anon'
  try {
    return JSON.parse(atob(t.split('.')[1])).sub || 'anon'
  } catch {
    return 'anon'
  }
}
