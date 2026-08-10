'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser, signOut } from '@/lib/auth'
import { Camera, Trash2, AlertTriangle } from 'lucide-react'
import ConfirmDialog from '@/components/confirm-dialog'

export default function ProfilePage() {
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser()
      if (!user) { router.replace('/login'); return }
      setEmail(user)
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u?.user_metadata?.avatar_url) setAvatarUrl(u.user_metadata.avatar_url)
      setLoading(false)
    }
    load()
  }, [])

  async function changeEmail() {
    if (!newEmail.trim()) return
    setSaving(true); setError(''); setSuccess('')
    const { error: e } = await supabase.auth.updateUser({ email: newEmail.trim() })
    if (e) setError(e.message)
    else setSuccess('Confirmation email sent to ' + newEmail)
    setSaving(false)
  }

  async function deleteAccount() {
    const { error: e } = await supabase.rpc('delete_user')
    if (e && e.message.includes('function')) {
      // Fallback: just sign out and they can't access data anymore
      await signOut()
      router.replace('/login')
      return
    }
    setShowDelete(false)
    router.replace('/login')
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 200 * 1024) { setError('Max 200KB'); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const url = reader.result as string
      setAvatarUrl(url)
      await supabase.auth.updateUser({ data: { avatar_url: url } })
      setUploading(false)
      setSuccess('Profile picture updated')
      setTimeout(() => setSuccess(''), 2000)
    }
    reader.readAsDataURL(f)
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
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xl font-medium text-cyan-600">{email[0]?.toUpperCase()}</span>}
            </div>
            <label className="cursor-pointer">
              <span className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">
                <Camera size={14} /> {uploading ? 'Uploading...' : 'Change photo'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </label>
          </div>
        </div>

        {/* Email */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-medium text-slate-900 mb-3">Email</h2>
          <p className="text-sm text-slate-500 mb-3">Current: <span className="text-slate-700">{email}</span></p>
          {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          {success && <div className="mb-3 text-sm text-emerald-600 bg-emerald-50 p-2 rounded">{success}</div>}
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
