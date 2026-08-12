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
      'https://mbsjxuymiuevankxrgmo.supabase.co/rest/v1/subscriptions?select=*&user_id=eq.' + uid() + '&limit=1',
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

/**
 * Plan limits for the free tier.
 */
const PLAN_LIMITS: Record<string, { assets: number; members: number }> = {
  free: { assets: Infinity, members: Infinity },
  team: { assets: Infinity, members: Infinity },
  enterprise: { assets: Infinity, members: Infinity },
}

export interface LimitCheckResult {
  allowed: boolean
  message: string
}

/**
 * Check if the current user can perform an action given their plan.
 * If they're about to exceed a limit, return the blocking message.
 */
export async function checkPlanLimit(action: 'create_asset' | 'invite_member'): Promise<LimitCheckResult> {
  const sub = await getSubscription()
  const plan = sub?.plan || 'free'
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free

  if (action === 'create_asset') {
    const tok = localStorage.getItem('sb_token')
    if (!tok) return { allowed: false, message: 'Not authenticated' }
    try {
      // RLS auto-scopes: counts team assets if user has team, else personal assets
      const r = await fetch(
        `https://mbsjxuymiuevankxrgmo.supabase.co/rest/v1/assets?select=id&limit=1`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${tok}`,
            Prefer: 'count=exact',
          },
        }
      )
      const range = r.headers.get('content-range')
      const total = range ? parseInt(range.split('/')[1], 10) : 0
      if (total >= limits.assets) {
        return {
          allowed: false,
          message: `Free plan allows ${limits.assets} assets. You have ${total}. Upgrade to Team for unlimited assets.`,
        }
      }
    } catch {
      // Allow on error — don't block users from network issues
      return { allowed: true, message: '' }
    }
  }

  if (action === 'invite_member') {
    const tok = localStorage.getItem('sb_token')
    if (!tok) return { allowed: false, message: 'Not authenticated' }
    try {
      // RLS auto-scopes to the team
      const r = await fetch(
        `https://mbsjxuymiuevankxrgmo.supabase.co/rest/v1/team_members?select=user_id&limit=1`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${tok}`,
            Prefer: 'count=exact',
          },
        }
      )
      const range = r.headers.get('content-range')
      const total = range ? parseInt(range.split('/')[1], 10) : 0
      if (total >= limits.members) {
        return {
          allowed: false,
          message: `Free plan allows ${limits.members} team members. You have ${total}. Upgrade to Team for unlimited members.`,
        }
      }
    } catch {
      return { allowed: true, message: '' }
    }
  }

  return { allowed: true, message: '' }
}
