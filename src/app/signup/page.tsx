'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const result = await signUp(email.trim(), password, username.trim() || undefined)
    if (result.error) { setError(result.error); setLoading(false) }
    else { setSuccess(true) }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Check your email</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">We sent a confirmation link to <strong>{email}</strong></p>
        <Link href="/login" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">Go to login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Track<span className="text-cyan-600 dark:text-cyan-400">stack</span></h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          {error && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-800">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="johndoe"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creating account...' : 'Start free trial'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
          Already have an account? <Link href="/login" className="text-cyan-600 dark:text-cyan-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
