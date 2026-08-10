'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Users, Plus, X, Copy, Trash2, Mail } from 'lucide-react'

interface Member { user_id: string; role: string; email?: string }

export default function TeamPage() {
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: mem } = await supabase.from('team_members').select('team_id,role').eq('user_id', user.id).single()
      if (!mem?.team_id) { setLoading(false); return }
      
      const { data: t } = await supabase.from('teams').select('*').eq('id', mem.team_id).single()
      setTeam(t)
      
      const { data: m } = await supabase.from('team_members').select('user_id,role').eq('team_id', mem.team_id)
      if (m) {
        const enriched = m.map((mb: any) => ({ ...mb, email: mb.user_id?.slice(0,8) + '...' || 'Unknown' }))
        setMembers(enriched)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function invite() {
    if (!inviteEmail.trim()) return
    setError('')
    // Simple approach: user must sign up first, then we add them
    const { data: existing } = await supabase.from('team_members').select('user_id').eq('team_id', team.id)
    // Check if invited email is already a user
    const { data: profiles } = await supabase.from('auth.users').select('id').eq('email', inviteEmail.trim())
    
    // For now, copy invite link
    const link = `${window.location.origin}/signup`
    await navigator.clipboard.writeText(`Join my Trackstack team: ${link}\nTeam: ${team.name}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setInviteEmail('')
  }

  async function removeMember(userId: string) {
    if (!confirm('Remove this member?')) return
    await supabase.from('team_members').delete().eq('team_id', team.id).eq('user_id', userId)
    setMembers(members.filter(m => m.user_id !== userId))
  }

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>
  if (!team) return <div className="p-8 text-slate-500">No team found. Create one in Settings.</div>

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
          <p className="text-sm text-slate-500 mb-4">Share your signup link — they join automatically under your team.</p>
          <div className="flex gap-2">
            <button onClick={async () => {
              await navigator.clipboard.writeText(`${window.location.origin}/signup\nTeam code: ${team.id.slice(0,8)}`)
              setCopied(true); setTimeout(() => setCopied(false), 2000)
            }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700">
              <Copy size={14} /> {copied ? 'Copied!' : 'Copy Invite Link'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-medium text-slate-900 mb-1">Members</h2>
          <div className="space-y-1 mt-3">
            {members.map(m => (
              <div key={m.user_id} className="flex items-center justify-between px-3 py-2 rounded hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                    {(m.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-slate-700">{m.email || m.user_id.slice(0,8)}</div>
                    <div className="text-xs text-slate-400 capitalize">{m.role}</div>
                  </div>
                </div>
                <button onClick={() => removeMember(m.user_id)} className="p-1 hover:bg-red-50 rounded">
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
