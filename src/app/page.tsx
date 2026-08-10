'use client'
import Link from 'next/link'
import { Package, Shield, Users, BarChart3, Zap, Lock, ArrowRight, Check, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const features = [
  {
    icon: Package,
    title: 'Asset Tracking',
    description: 'Track laptops, monitors, phones, servers, and more. Assign to employees, log serial numbers, and manage warranties — all in one place.',
  },
  {
    icon: Shield,
    title: 'Certificate Management',
    description: 'Never miss an SSL cert or license expiry again. Set reminders and get notified before things expire.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite your team. Everyone sees the same inventory. No more "who has that monitor?" Slack threads.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard at a Glance',
    description: 'See expiring warranties, upcoming cert renewals, and asset counts in a single dashboard.',
  },
  {
    icon: Zap,
    title: 'CSV Import & Export',
    description: 'Drop in your existing spreadsheet inventory. Export anytime. No lock-in.',
  },
  {
    icon: Lock,
    title: 'Secure by Default',
    description: 'Row-level security on Supabase. Your team sees only your company\'s data. TLS everywhere.',
  },
]

const plans = [
  {
    name: 'Solo',
    price: 0,
    period: 'forever',
    description: 'For individuals managing their own gear.',
    features: [
      'Up to 50 assets',
      '2 team members',
      'CSV import & export',
      'QR code labels',
      'Basic dashboard',
    ],
    cta: 'Start Free',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Team',
    price: 19,
    period: '/ month',
    description: 'For growing companies that need shared visibility.',
    features: [
      'Unlimited assets',
      'Unlimited team members',
      'All certificate tracking',
      'Device scanning',
      'Advanced dashboard',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=team',
    featured: true,
  },
]

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
            Track<span className="text-cyan-600">stack</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/demo" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Live Demo
            </Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-1 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 transition-colors">
              Sign up <ChevronRight size={14} />
            </Link>
          </div>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 text-slate-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="sm:hidden px-6 pb-4 space-y-2">
            <Link href="/demo" className="block py-2 text-sm font-medium text-slate-600">Live Demo</Link>
            <Link href="/login" className="block py-2 text-sm font-medium text-slate-600">Log in</Link>
            <Link href="/signup" className="block py-2 text-sm font-medium text-cyan-600">Sign up →</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs font-medium text-cyan-700 mb-6">
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
          Now in public beta
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
          IT asset management<br />
          <span className="text-cyan-600">without the bloat</span>
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Track your company's laptops, monitors, servers, SSL certs, and software licenses.
          No spreadsheets. No enterprise bloatware. Just a fast, clean tool your whole team will actually use.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white text-base font-medium rounded-lg hover:bg-cyan-700 transition-colors shadow-sm">
            Try the demo <ArrowRight size={18} />
          </Link>
          <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 text-base font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Start free →
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">No credit card required. Free tier available.</p>
      </section>

      {/* ── Features ── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why Trackstack?</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Purpose-built for IT teams who want to know where everything is — without learning another enterprise platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-6 hover:border-cyan-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-cyan-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Preview ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900">See it in action</h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">
            Explore a fully populated demo account with sample data. No sign-up required.
          </p>
          <div className="mt-8 bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs text-slate-400">Trackstack — Dashboard</span>
            </div>
            <div className="p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Assets', value: '247', icon: Package, color: 'text-cyan-400', bg: 'bg-white/5' },
                { label: 'Active Certs', value: '38', icon: Shield, color: 'text-emerald-400', bg: 'bg-white/5' },
                { label: 'Team Members', value: '12', icon: Users, color: 'text-purple-400', bg: 'bg-white/5' },
                { label: 'Expiring Soon', value: '5', icon: Shield, color: 'text-amber-400', bg: 'bg-white/5' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-lg p-4 border border-white/10 text-left`}>
                  <div className="flex items-center gap-2 mb-3">
                    <s.icon size={16} className={s.color} />
                    <span className="text-xs text-slate-400">{s.label}</span>
                  </div>
                  <div className={`text-2xl font-light ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
          <Link href="/demo" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors">
            Open full demo <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Simple pricing</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Start free. Upgrade when your team grows. Cancel anytime.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`rounded-xl border bg-white p-6 flex flex-col ${plan.featured ? 'border-cyan-500 ring-2 ring-cyan-100 shadow-md' : 'border-slate-200'}`}
              >
                {plan.featured && (
                  <span className="inline-flex self-start px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-full mb-3">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold text-slate-900">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-slate-400 text-sm">{plan.period}</span>}
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check size={14} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    plan.featured
                      ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Trackstack</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <Link href="/demo" className="hover:text-slate-600 transition-colors">Demo</Link>
            <Link href="/login" className="hover:text-slate-600 transition-colors">Log in</Link>
            <a href="mailto:hello@trackstack.dev" className="hover:text-slate-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
