'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getCurrentUsername, signOut } from '@/lib/auth'
import { Camera, Trash2, CreditCard, Check, AlertTriangle } from 'lucide-react'
import ConfirmDialog from '@/components/confirm-dialog'
import { startCheckout, getSubscription } from '@/lib/billing'

const U = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const REST = U + '/rest/v1'
import { K as SUPABASE_KEY } from '@/lib/auth'

export default function ProfilePage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const router = useRouter()

  // ── Billing ──
  const [sub, setSub] = useState<{ plan: string; status: string; current_period_end: string | null } | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const loadSubscription = useCallback(async () => {
    const s = await getSubscription()
    setSub(s)
  }, [])

  useEffect(() => {
    async function load() {
      const user = getCurrentUser()
      if (!user) { router.replace('/login'); return }
      setEmail(user)
      let uname = getCurrentUsername() || ''
      if (!uname) {
        const tok = localStorage.getItem('sb_token')
        if (tok) {
          try {
            const meta = JSON.parse(atob(tok.split('.')[1])).user_metadata
            if (meta?.username) uname = meta.username
          } catch {}
        }
      }
      setUsername(uname)
      setNewUsername(uname)
      loadSubscription()
      setLoading(false)
    }
    load()
  }, [loadSubscription])

  async function changeUsername() {
    if (!newUsername.trim() || newUsername.trim() === username) return
    setSaving(true); setError(''); setSuccess('')
    try {
      const tok = localStorage.getItem('sb_token')
      if (!tok) { setError('Not authenticated'); setSaving(false); return }
      const userId = JSON.parse(atob(tok.split('.')[1])).sub
      const r = await window.fetch(REST + '/user_profiles?user_id=eq.' + userId, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          'Authorization': 'Bearer ' + tok,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ username: newUsername.trim() }),
      })
      if (!r.ok) {
        const j = await r.json()
        setError(j?.message || j?.msg || 'Username taken or invalid')
      } else {
        localStorage.setItem('sb_username', newUsername.trim())
        setUsername(newUsername.trim())
        setSuccess('Username updated')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (e: any) { setError(e.message || 'Failed') }
    setSaving(false)
  }

  async function changeEmail() {
    if (!newEmail.trim()) return
    setSaving(true); setError(''); setSuccess('')
    const r = await window.fetch(U + '/auth/v1/user', {
      method: 'PUT',
      headers: {
        apikey: SUPABASE_KEY,
        'Authorization': 'Bearer ' + (localStorage.getItem('sb_token') || ''),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newEmail.trim() }),
    })
    if (!r.ok) { const j = await r.json(); setError(j.msg || 'Failed') }
    else {
      localStorage.setItem('sb_email', newEmail.trim())
      setEmail(newEmail.trim())
      setSuccess('Confirmation email sent to ' + newEmail)
    }
    setSaving(false)
  }

  async function handleUpgrade(plan: string) {
    setCheckoutLoading(true)
    setCheckoutError('')
    // Replace these with your actual Stripe price IDs from the Stripe dashboard
    const priceIds: Record<string, string> = {
      team: 'price_1U2zDrADDM2ycEh2PcdFsp1B',
      enterprise: 'price_1U2zDrADDM2ycEh2PcdFsp1B', // same for now — create Enterprise price in Stripe later
    }
    const result = await startCheckout(
      priceIds[plan] || 'price_team_placeholder',
      window.location.origin + '/dashboard?checkout=success',
      window.location.origin + '/profile?checkout=canceled'
    )
    if (result.error) {
      setCheckoutError(result.error)
    }
    setCheckoutLoading(false)
  }

  async function deleteAccount() {
    setSaving(true); setError('')
    try {
      const tok = localStorage.getItem('sb_token')
      if (!tok) { setError('Not authenticated'); setSaving(false); return }
      const r = await window.fetch(U + '/rest/v1/rpc/delete_my_account', {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, 'Authorization': 'Bearer ' + tok },
      })
      if (!r.ok) { setError('Failed to delete account. Try again.'); setSaving(false); return }
      await signOut()
      router.replace('/login')
    } catch { setError('Failed to delete account'); setSaving(false) }
    setShowDelete(false)
  }

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Profile</h1>

      <div className="max-w-lg space-y-6">
        {/* Avatar */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-medium text-slate-900 mb-3">Profile Picture</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center overflow-hidden border border-slate-200">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xl font-medium text-cyan-600">{(username || email)[0]?.toUpperCase()}</span>}
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-medium text-slate-900 mb-3">Username</h2>
          <p className="text-sm text-slate-500 mb-3">Current: <span className="text-slate-700 font-medium">{username || '(not set)'}</span></p>
          {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          {success && <div className="mb-3 text-sm text-emerald-600 bg-emerald-50 p-2 rounded">{success}</div>}
          <div className="flex gap-2">
            <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="newusername" className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm" />
            <button onClick={changeUsername} disabled={saving} className="px-4 py-1.5 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700 disabled:opacity-50">{saving ? 'Saving...' : 'Change'}</button>
          </div>
        </div>

        {/* Email */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-medium text-slate-900 mb-3">Email</h2>
          <p className="text-sm text-slate-500 mb-3">Current: <span className="text-slate-700">{email}</span></p>
          <div className="flex gap-2">
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@email.com" className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm" />
            <button onClick={changeEmail} disabled={saving} className="px-4 py-1.5 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700 disabled:opacity-50">{saving ? 'Sending...' : 'Change'}</button>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-cyan-600" /> Billing
          </h2>
          {checkoutError && (
            <div className="mb-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              <AlertTriangle size={14} /> {checkoutError}
            </div>
          )}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-600">Current plan</span>
              <span className="text-sm font-medium text-slate-900 capitalize">{sub?.plan || 'free'}</span>
            </div>
            {sub?.status && sub.status !== 'active' && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-600">Status</span>
                <span className={`text-sm font-medium capitalize ${sub.status === 'past_due' ? 'text-red-600' : 'text-amber-600'}`}>{sub.status.replace('_', ' ')}</span>
              </div>
            )}
            {sub?.current_period_end && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-600">Renews</span>
                <span className="text-sm text-slate-700">{new Date(sub.current_period_end).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            {(!sub || sub.plan === 'free') ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">Upgrade to unlock unlimited assets, team collaboration, and priority support.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpgrade('team')}
                    disabled={checkoutLoading}
                    className="flex-1 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {checkoutLoading ? 'Redirecting...' : 'Upgrade to Team — $19/mo'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-500 mb-3">You're on the <strong className="text-slate-700 capitalize">{sub.plan}</strong> plan.</p>
                <p className="text-xs text-slate-400">To manage your subscription (cancel, update payment method), visit the Stripe customer portal or contact support.</p>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-red-200 rounded-lg p-5">
          <h2 className="font-medium text-red-700 mb-1">Delete Account</h2>
          <p className="text-sm text-slate-500 mb-3">Permanently delete your account and all data. This cannot be undone.</p>
          <button onClick={() => setShowDelete(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">
            <Trash2 size={14} /> Delete my account
          </button>
        </div>
      </div>

      {showDelete && <ConfirmDialog
        title="Delete your account?"
        message="This permanently deletes your account and all your data. There is no undo."
        confirmLabel="Delete Forever"
        onConfirm={deleteAccount}
        onCancel={() => setShowDelete(false)}
      />}
    </div>
  )
}
