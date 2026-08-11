'use client'
import { useEffect, useState } from 'react'
import { getTeam, getTeamMembers, createTeam, removeMember, lookupUserByEmail, inviteMember, getUserProfile } from '@/lib/data'
import { checkPlanLimit } from '@/lib/billing'
import { Users, Plus, Trash2, UserPlus, Mail, AlertTriangle } from 'lucide-react'

interface Member { user_id: string; role: string; username?: string }

export default function TeamPage() {
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  // ── Invite ──
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  useEffect(() => {
    async function load() {
      const t = await getTeam()
      if (t) {
        setTeam(t)
        const m = await getTeamMembers(t.id)
        // Fetch usernames for display
        const enriched = await Promise.all(
          (m || []).map(async (member: Member) => {
            const profile = await getUserProfile(member.user_id)
            return { ...member, username: profile?.username }
          })
        )
        setMembers(enriched)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleCreate() {
    if (!teamName.trim()) return
    setCreating(true); setError('')
    const result = await createTeam(teamName.trim())
    if (result.error) { setError(result.error); setCreating(false); return }
    window.location.reload()
  }

  async function handleRemove(userId: string) {
    if (!team) return
    await removeMember(team.id, userId)
    setMembers(members.filter(m => m.user_id !== userId))
  }

  async function handleInvite() {
    const email = inviteEmail.trim().toLowerCase()
    if (!email) return

    // Check plan limits
    const limit = await checkPlanLimit('invite_member')
    if (!limit.allowed) { setInviteError(limit.message); return }

    setInviting(true)
    setInviteError('')
    setInviteSuccess('')

    // Already a member?
    if (members.some(m => m.user_id)) {
      const user = await lookupUserByEmail(email)
      if (user && members.some(m => m.user_id === user.user_id)) {
        setInviteError('This person is already a team member.')
        setInviting(false)
        return
      }
    }

    const user = await lookupUserByEmail(email)
    if (!user) {
      setInviteError('No account found with that email. Ask them to sign up first at /signup.')
      setInviting(false)
      return
    }

    const result = await inviteMember(team.id, user.user_id)
    if (result.error) {
      setInviteError(typeof result.error === 'string' ? result.error : 'Failed to invite.')
      setInviting(false)
      return
    }

    setInviteSuccess(`Invited ${user.username || email}`)
    setInviteEmail('')
    setInviting(false)

    // Refresh members
    const m = await getTeamMembers(team.id)
    const enriched = await Promise.all(
      (m || []).map(async (member: Member) => {
        const profile = await getUserProfile(member.user_id)
        return { ...member, username: profile?.username }
      })
    )
    setMembers(enriched)
  }

  if (loading) return <div className="p-8 text-slate-500 dark:text-slate-400">Loading...</div>

  if (!team) return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Team</h1>
      <div className="max-w-md">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center">
          <Users size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No team yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Create a team to collaborate with your colleagues.</p>
          <button onClick={() => { setShowCreate(true); setTeamName(''); setError('') }} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">
            <Plus size={16} /> Create Team
          </button>
        </div>
      </div>
      {showCreate && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-950 rounded-lg p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-xl"><h2 className="text-lg font-semibold mb-4">Create Team</h2>
        <div className="space-y-3">
          {error && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-800">{error}</div>}
          <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Team Name</label><input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Acme Corp IT" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" autoFocus /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleCreate} disabled={creating || !teamName.trim()} className="flex-1 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400 disabled:opacity-50">{creating ? 'Creating...' : 'Create Team'}</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
          </div>
        </div>
      </div></div>}
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Team</h1>
      <div className="max-w-2xl space-y-6">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="font-medium text-slate-900 dark:text-slate-100">{team.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* ── Invite by email ── */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h2 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Invite Members</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Enter the email of someone who already has a devicelog account.</p>

          {inviteError && (
            <div className="mb-3 flex items-start gap-2 px-3 py-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{inviteError}</span>
            </div>
          )}
          {inviteSuccess && (
            <div className="mb-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded text-sm text-emerald-700 dark:text-emerald-300">
              {inviteSuccess}
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setInviteError(''); setInviteSuccess('') }}
                onKeyDown={e => { if (e.key === 'Enter') handleInvite() }}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400 disabled:opacity-50"
            >
              <UserPlus size={14} /> {inviting ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </div>

        {/* ── Members list ── */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h2 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Members</h2>
          <div className="space-y-1 mt-3">
            {members.map(m => (
              <div key={m.user_id} className="flex items-center justify-between px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
                    {(m.username || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-slate-700 dark:text-slate-200">{m.username || m.user_id.slice(0, 8) + '...'}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 capitalize">{m.role}</div>
                  </div>
                </div>
                <button onClick={() => handleRemove(m.user_id)} className="p-1 hover:bg-red-50 dark:bg-red-950 rounded">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
