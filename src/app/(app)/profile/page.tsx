'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getCurrentUsername, signOut } from '@/lib/auth'
import { Camera, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/confirm-dialog'

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

  useEffect(() => {
    async function load() {
      const user = getCurrentUser()
      if (!user) { router.replace('/login'); return }
      setEmail(user)
      setUsername(getCurrentUsername() || '')
      setNewUsername(getCurrentUsername() || '')
      setLoading(false)
    }
    load()
  }, [])

  async function changeUsername() {
    if (!newUsername.trim() || newUsername.trim() === username) return
    setSaving(true); setError(''); setSuccess('')
    try {
      const tok = localStorage.getItem('sb_token')
      if (!tok) { setError('Not authenticated'); setSaving(false); return }
      // Update user_profiles table
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

  async function deleteAccount() {
    // Sign out — data is orphaned but inaccessible without token
    await signOut()
    router.replace('/login')
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
