'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/demo-auth'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const result = signUp(email.trim(), password)
    if (result.error) setError(result.error)
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Track<span className="text-cyan-600">stack</span></h1>
          <p className="text-sm text-slate-500 mt-1">Start your 14-day free trial</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creating account...' : 'Start free trial'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account? <Link href="/login" className="text-cyan-600 hover:underline">Sign in</Link>
        </p>
        <p className="text-center text-xs text-slate-400 mt-2">Demo mode — data stored in your browser</p>
      </div>
    </div>
  )
}
