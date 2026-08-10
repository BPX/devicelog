'use client'
import { useEffect, useState } from 'react'
import { getTeam, getTeamMembers, createTeam, removeMember } from '@/lib/data'
import { getCurrentUser } from '@/lib/auth'
import { Users, Plus, Copy, Trash2 } from 'lucide-react'

interface Member { user_id: string; role: string }

export default function TeamPage() {
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const user = getCurrentUser()
      if (!user) return
      const t = await getTeam()
      if (t) {
        setTeam(t)
        const m = await getTeamMembers(t.id)
        setMembers(m || [])
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

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>

  if (!team) return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Team</h1>
      <div className="max-w-md">
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-medium text-slate-900 mb-2">No team yet</h2>
          <p className="text-sm text-slate-500 mb-6">Create a team to collaborate with your colleagues.</p>
          <button onClick={() => { setShowCreate(true); setTeamName(''); setError('') }} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700">
            <Plus size={16} /> Create Team
          </button>
        </div>
      </div>
      {showCreate && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 w-full max-w-sm border border-slate-200 shadow-xl"><h2 className="text-lg font-semibold mb-4">Create Team</h2>
        <div className="space-y-3">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Team Name</label><input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Acme Corp IT" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" autoFocus /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleCreate} disabled={creating || !teamName.trim()} className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700 disabled:opacity-50">{creating ? 'Creating...' : 'Create Team'}</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </div></div>}
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Team</h1>
      <div className="max-w-2xl space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-cyan-600" />
            </div>
            <div>
              <h2 className="font-medium text-slate-900">{team.name}</h2>
              <p className="text-sm text-slate-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-medium text-slate-900 mb-1">Invite Members</h2>
          <p className="text-sm text-slate-500 mb-4">Share the signup link — they join your team automatically.</p>
          <button onClick={async () => {
            await navigator.clipboard.writeText(window.location.origin + '/signup')
            setCopied(true); setTimeout(() => setCopied(false), 2000)
          }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700">
            <Copy size={14} /> {copied ? 'Copied!' : 'Copy Signup Link'}
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-medium text-slate-900 mb-1">Members</h2>
          <div className="space-y-1 mt-3">
            {members.map(m => (
              <div key={m.user_id} className="flex items-center justify-between px-3 py-2 rounded hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">?</div>
                  <div>
                    <div className="text-sm text-slate-700">{m.user_id.slice(0, 8) + '...'}</div>
                    <div className="text-xs text-slate-400 capitalize">{m.role}</div>
                  </div>
                </div>
                <button onClick={() => handleRemove(m.user_id)} className="p-1 hover:bg-red-50 rounded">
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
