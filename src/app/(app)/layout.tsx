'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, Shield, Settings, LogOut, LayoutDashboard, Users, User, Sun, Moon, MessageSquare } from 'lucide-react'
import { getCurrentUsername, signOut } from '@/lib/auth'
import { getTeam } from '@/lib/data'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/theme'
import { supabase } from '@/lib/supabase/client'
import InstallPrompt from '@/components/install-prompt'
import ToastContainer from '@/components/toast'
import QuickAdd from '@/components/quick-add'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Package },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/certificates', label: 'Certifications', icon: Shield },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter()
  const [display, setDisplay] = useState<string | null | 'loading'>('loading')
  const { theme, toggle } = useTheme()

  useEffect(() => {
    async function init() {
      // Use getSession for proper token refresh, not localStorage
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      // Extract username from JWT if not in localStorage yet
      if (!getCurrentUsername()) {
        const tok = localStorage.getItem('sb_token')
        if (tok) {
          try {
            const meta = JSON.parse(atob(tok.split('.')[1])).user_metadata
            if (meta?.username) localStorage.setItem('sb_username', meta.username)
          } catch {}
        }
      }

      // New user without a team? Redirect to setup (unless already on setup/team)
      if (pathname !== '/setup' && pathname !== '/team') {
        const team = await getTeam()
        if (!team) {
          router.replace('/setup')
          return
        }
      }

      setDisplay(getCurrentUsername() || session.user.email || 'User')
    }
    init()
  }, [])

  if (display === 'loading') return null

  return (
    <div className="flex h-screen">
      <aside className="w-56 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-900">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <Link href="/dashboard" className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">device<span className="text-cyan-600 dark:text-cyan-400">log</span></Link>
        </div>
        <div className="px-3 pt-3"><QuickAdd /></div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}><Icon size={16} />{label}</Link>
          })}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 w-full">
            <div className="w-6 h-6 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center text-xs font-medium text-cyan-600 dark:text-cyan-400">{(display as string)[0]?.toUpperCase() || '?'}</div>
            <span className="truncate">{display as string}</span>
          </Link>
          <div className="flex items-center gap-1 mt-1">
            <a
              href="https://github.com/bpx/devicelog/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Request a feature"
            >
              <MessageSquare size={14} />
            </a>
            <button onClick={toggle} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span className="truncate">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
            </button>
            <button onClick={async () => { await signOut(); router.replace('/login') }} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="Sign out"><LogOut size={14} /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
      <InstallPrompt />
      <ToastContainer />
    </div>
  )
}
