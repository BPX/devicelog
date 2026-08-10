'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import { Plus, Users } from 'lucide-react'

export default function SetupPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasTeam, setHasTeam] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const user = getCurrentUser()
      if (!user) { router.replace('/login'); return }
      // Check if user already belongs to a team
      const { data } = await supabase.from('team_members').select('team_id').single()
      if (data?.team_id) router.replace('/dashboard')
      else setHasTeam(false)
    }
    check()
  }, [])

  async function createTeam(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    // Create team
    const { data: team, error: teamErr } = await supabase.from('teams').insert({ name: name.trim(), owner_id: user.id }).select('id').single()
    if (teamErr) { setError(teamErr.message); setLoading(false); return }

    // Add creator as admin
    await supabase.from('team_members').insert({ team_id: team.id, user_id: user.id, role: 'admin' })

    // Create default settings
    await supabase.from('settings').insert({ user_id: user.id, team_id: team.id })

    router.push('/dashboard')
  }

  if (hasTeam === null) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-cyan-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Set up your team</h1>
          <p className="text-sm text-slate-500 mt-2">Create a workspace for your organization. You can invite teammates later.</p>
        </div>
        <form onSubmit={createTeam} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Team name</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="Acme Corp IT"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>
    </div>
  )
}
