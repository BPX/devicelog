'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, Shield, Settings, LogOut, LayoutDashboard } from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/demo-auth'
import { useEffect, useState } from 'react'
import InstallPrompt from '@/components/install-prompt'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Package },
  { href: '/certificates', label: 'Certs & Licenses', icon: Shield },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) router.push('/login')
    else setEmail(user)

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])

  if (!email) return <div className="p-8 text-slate-500">Checking auth...</div>

  return (
    <div className="flex h-screen">
      <aside className="w-56 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-5 border-b border-slate-200">
          <Link href="/dashboard" className="text-lg font-semibold text-slate-900 tracking-tight">Track<span className="text-cyan-600">stack</span></Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><Icon size={16} />{label}</Link>
          })}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 truncate px-3 mb-2">{email}</div>
          <button onClick={() => { signOut(); router.push('/login') }} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-500 hover:bg-slate-100 w-full"><LogOut size={14} />Sign out</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
      <InstallPrompt />
    </div>
  )
}
