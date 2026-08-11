'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Shield, LayoutDashboard, Users, ArrowRight, Sun, Moon, MessageSquare } from 'lucide-react'
import { useTheme } from '@/lib/theme'

const navItems = [
  { href: '/demo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/demo/assets', label: 'Assets', icon: Package },
  { href: '/demo/employees', label: 'Employees', icon: Users },
  { href: '/demo/certificates', label: 'Certs & Licenses', icon: Shield },
]

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <div className="flex h-screen">
      {/* ── Sidebar ── */}
      <aside className="w-56 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-900">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <Link href="/" className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Track<span className="text-cyan-600 dark:text-cyan-400">stack</span>
          </Link>
          <span className="ml-2 px-2 py-0.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
            Demo
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active ? 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <a
            href="https://github.com/bpx/devicelog/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MessageSquare size={14} />
            Request feature
          </a>
          <Link
            href="/signup"
            className="flex items-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors"
          >
            Sign up free <ArrowRight size={14} />
          </Link>
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 w-full transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span className="truncate">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">
        {/* Banner */}
        <div className="sticky top-0 z-10 bg-cyan-50 dark:bg-cyan-950 border-b border-cyan-200 dark:border-cyan-800 px-8 py-2.5 flex items-center justify-between text-sm">
          <span className="text-cyan-800 dark:text-cyan-200">
            <strong>Demo mode</strong> — sample data only. Nothing is saved.
          </span>
          <Link href="/signup" className="text-cyan-700 dark:text-cyan-300 font-medium hover:underline">
            Create your free account →
          </Link>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
