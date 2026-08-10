'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Shield, LayoutDashboard, Users, ArrowRight } from 'lucide-react'

const navItems = [
  { href: '/demo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/demo/assets', label: 'Assets', icon: Package },
  { href: '/demo/employees', label: 'Employees', icon: Users },
  { href: '/demo/certificates', label: 'Certs & Licenses', icon: Shield },
]

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      {/* ── Sidebar ── */}
      <aside className="w-56 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-5 border-b border-slate-200">
          <Link href="/" className="text-lg font-semibold text-slate-900 tracking-tight">
            Track<span className="text-cyan-600">stack</span>
          </Link>
          <span className="ml-2 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-full">
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
                  active ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors"
          >
            Sign up free <ArrowRight size={14} />
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">
        {/* Banner */}
        <div className="sticky top-0 z-10 bg-cyan-50 border-b border-cyan-200 px-8 py-2.5 flex items-center justify-between text-sm">
          <span className="text-cyan-800">
            <strong>Demo mode</strong> — sample data only. Nothing is saved.
          </span>
          <Link href="/signup" className="text-cyan-700 font-medium hover:underline">
            Create your free account →
          </Link>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
