'use client'
import Link from 'next/link'
import { Package, Shield, Users, BarChart3, Zap, Lock, ArrowRight, Check, ChevronRight, Star, Clock, Globe } from 'lucide-react'
import { useState } from 'react'

// ── Features ──
const features = [
  {
    icon: Package,
    title: 'Track Everything',
    description: 'Laptops, monitors, phones, servers, printers — any IT asset. Assign to employees, log serials, track warranties.',
  },
  {
    icon: Shield,
    title: 'Never Miss an Expiry',
    description: 'SSL certs, software licenses, support contracts — all in one dashboard with reminders before they lapse.',
  },
  {
    icon: Users,
    title: 'Your Whole Team',
    description: 'Everyone sees the same inventory. No more "who has the extra monitor?" Slack threads.',
  },
  {
    icon: Zap,
    title: 'Import in Seconds',
    description: 'Drop your existing spreadsheet. Column matching just works. Export anytime — no lock-in.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard at a Glance',
    description: 'Expiring warranties, upcoming renewals, device counts — everything visible in one view.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Row-level security on Supabase. Your team sees only your data. TLS everywhere. No ads, no trackers.',
  },
]

// ── Pricing ──
const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'For individuals and small teams getting started.',
    features: ['Up to 50 assets', '2 team members', 'CSV import & export', 'QR code labels', 'Basic dashboard', 'SSL cert tracking'],
    cta: 'Start Free',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Team',
    price: 19,
    description: 'For growing companies that need shared visibility.',
    features: ['Unlimited assets', 'Unlimited team members', 'Everything in Free', 'Device scanning', 'Priority support'],
    cta: 'Start Free Trial',
    href: '/signup?plan=team',
    featured: true,
  },
]

// ── Comparison table ──
const comparison = [
  { feature: 'Asset tracking', trackstack: true, spreadsheet: 'Manual', snipeit: true },
  { feature: 'Certificate tracking', trackstack: true, spreadsheet: false, snipeit: false },
  { feature: 'Team collaboration', trackstack: true, spreadsheet: false, snipeit: 'Limited' },
  { feature: 'CSV import', trackstack: true, spreadsheet: 'Native', snipeit: true },
  { feature: 'QR code labels', trackstack: true, spreadsheet: false, snipeit: true },
  { feature: 'Free tier', trackstack: true, spreadsheet: 'Free', snipeit: 'Self-host only' },
  { feature: 'No setup required', trackstack: true, spreadsheet: true, snipeit: false },
  { feature: 'Modern UI', trackstack: true, spreadsheet: false, snipeit: false },
]

function CheckCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={16} className="text-cyan-500" />
  if (value === false) return <span className="text-slate-300">—</span>
  return <span className="text-xs text-slate-500">{value}</span>
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
            Track<span className="text-cyan-600">stack</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/demo" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Live Demo</Link>
            <Link href="/#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Log in</Link>
            <Link href="/signup" className="inline-flex items-center gap-1 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 transition-colors">
              Sign up free <ChevronRight size={14} />
            </Link>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 text-slate-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="sm:hidden px-6 pb-4 space-y-2 bg-white border-b border-slate-100">
            <Link href="/demo" className="block py-2 text-sm font-medium text-slate-600">Live Demo</Link>
            <Link href="/#pricing" className="block py-2 text-sm font-medium text-slate-600">Pricing</Link>
            <Link href="/login" className="block py-2 text-sm font-medium text-slate-600">Log in</Link>
            <Link href="/signup" className="block py-2 text-sm font-medium text-cyan-600">Sign up free →</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs font-medium text-cyan-700 mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Free tier available — no credit card required
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Know where every laptop, license, and SSL cert is —{' '}
          <span className="text-cyan-600">without the spreadsheet nightmare</span>
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Trackstack is the simple IT asset manager your team will actually use. 
          Track hardware, certificates, and licenses in one place. Import your existing inventory in seconds. 
          Free for up to 50 assets.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 bg-cyan-600 text-white text-base font-medium rounded-lg hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200">
            Start tracking for free <ArrowRight size={18} />
          </Link>
          <Link href="/demo" className="inline-flex items-center gap-2 px-8 py-3.5 border border-slate-300 text-slate-700 text-base font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Try the live demo →
          </Link>
        </div>
        {/* Social proof row */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Clock size={14} /> Set up in under 2 minutes
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} /> No download required — works in your browser
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
            <span className="ml-1">Free forever tier</span>
          </div>
        </div>
      </section>

      {/* ── Social proof logos ── */}
      <section className="border-y border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">Built for IT teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            <span className="text-lg font-semibold text-slate-600">Startups</span>
            <span className="text-lg font-semibold text-slate-600">Agencies</span>
            <span className="text-lg font-semibold text-slate-600">Schools</span>
            <span className="text-lg font-semibold text-slate-600">Healthcare</span>
            <span className="text-lg font-semibold text-slate-600">Remote Teams</span>
          </div>
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-medium text-cyan-600 mb-3">THE PROBLEM</p>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
              Your IT inventory lives in someone's head. Or a spreadsheet. Both are bad.
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              When Sarah leaves the company, does anyone know which laptop she had? 
              When the SSL cert expires on Saturday at 2am, does anyone get paged? 
              Spreadsheets go stale, get lost in email threads, and nobody updates them.
            </p>
            <div className="space-y-3">
              {[
                '"Who has the spare monitor?" — every Slack thread ever',
                '"The cert expired and now the site is down"',
                '"I think we have 200 devices? Or maybe 190?"',
                'Onboarding takes 3 days because nobody knows what gear is available',
              ].map(q => (
                <div key={q} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="text-red-400 mt-0.5">✕</span> {q}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
            <p className="text-sm font-medium text-emerald-600 mb-3">THE SOLUTION</p>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">One dashboard. Your entire IT inventory. Always up to date.</h3>
            <div className="space-y-3 mb-6">
              {[
                'Every device logged with serial, warranty, and assigned owner',
                'Certificate and license renewals tracked with reminders',
                'Your whole team sees the same data — no more asking around',
                'Import your existing spreadsheet in seconds. Export anytime.',
              ].map(q => (
                <div key={q} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {q}
                </div>
              ))}
            </div>
            <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 transition-colors">
              Start tracking free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-slate-50 py-24" id="features">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need, nothing you don't</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Built for IT teams who want answers, not another tool to maintain.
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
          <h2 className="text-3xl font-bold text-slate-900">See it before you sign up</h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">
            Explore a fully populated demo with real data. No account needed.
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
                { label: 'Total Assets', value: '247', icon: Package, color: 'text-cyan-400' },
                { label: 'Active Certs', value: '38', icon: Shield, color: 'text-emerald-400' },
                { label: 'Team Members', value: '12', icon: Users, color: 'text-purple-400' },
                { label: 'Expiring Soon', value: '5', icon: Shield, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 rounded-lg p-4 border border-white/10 text-left">
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

      {/* ── Comparison Table ── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How Trackstack compares</h2>
            <p className="mt-3 text-slate-500">See why teams switch from spreadsheets and self-hosted tools.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-700">Feature</th>
                  <th className="text-center py-3 px-5 font-medium text-cyan-600 bg-cyan-50/50">Trackstack</th>
                  <th className="text-center py-3 px-5 font-medium text-slate-500">Spreadsheets</th>
                  <th className="text-center py-3 px-5 font-medium text-slate-500">Snipe-IT</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-slate-100 ${i === comparison.length - 1 ? '' : ''}`}>
                    <td className="py-3 px-5 text-slate-700">{row.feature}</td>
                    <td className="py-3 px-5 text-center bg-cyan-50/30"><CheckCell value={row.trackstack} /></td>
                    <td className="py-3 px-5 text-center"><CheckCell value={row.spreadsheet} /></td>
                    <td className="py-3 px-5 text-center"><CheckCell value={row.snipeit} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24" id="pricing">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Simple, transparent pricing</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Start free. Upgrade when your team grows. Cancel anytime. No hidden fees.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`rounded-xl border bg-white p-8 flex flex-col ${plan.featured ? 'border-cyan-500 ring-2 ring-cyan-100 shadow-md' : 'border-slate-200'}`}
              >
                {plan.featured && (
                  <span className="inline-flex self-start px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-full mb-4">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                <div className="mt-6 mb-8">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-slate-400 text-sm">/month</span>}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check size={14} className="text-cyan-500 mt-0.5 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-lg text-sm font-medium transition-colors ${
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

      {/* ── FAQ ── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Is Trackstack really free?', a: 'Yes. The Free plan includes up to 50 assets and 2 team members — no credit card, no time limit. Upgrade to Team ($19/mo) for unlimited everything.' },
              { q: 'How is this different from a spreadsheet?', a: 'Spreadsheets go stale because nobody updates them. Trackstack gives your whole team a shared, real-time view. Plus certificate expiry reminders, QR labels, and device scanning — things spreadsheets can\'t do.' },
              { q: 'Can I import my existing inventory?', a: 'Absolutely. Drop your CSV file and we auto-detect columns. Works with exports from Excel, Google Sheets, Snipe-IT, and most other tools.' },
              { q: 'Is my data secure?', a: 'Yes. All data is encrypted in transit (TLS) and at rest. Supabase row-level security means your team only sees your company\'s data. We don\'t sell, share, or analyze your data.' },
              { q: 'What happens if I exceed the free limits?', a: 'We\'ll let you know with a friendly prompt to upgrade. Your existing data stays safe — you just can\'t add more assets or members until you upgrade.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your billing settings. Your data remains accessible on the Free plan.' },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-slate-200 group">
                <summary className="px-6 py-4 cursor-pointer font-medium text-slate-900 list-none flex justify-between items-center">
                  {faq.q}
                  <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="px-6 pb-4 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900">Stop guessing where your IT assets are</h2>
          <p className="mt-4 text-lg text-slate-500">
            Set up in 2 minutes. Free for up to 50 assets. No credit card needed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 bg-cyan-600 text-white text-base font-medium rounded-lg hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200">
              Start tracking for free <ArrowRight size={18} />
            </Link>
            <Link href="/demo" className="inline-flex items-center gap-2 px-8 py-3.5 border border-slate-300 text-slate-700 text-base font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Try the demo →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Trackstack</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Simple IT asset management for small teams. No bloat, no spreadsheets.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Product</h3>
              <div className="space-y-2 text-sm">
                <div><Link href="/demo" className="text-slate-500 hover:text-slate-700">Live Demo</Link></div>
                <div><Link href="/#pricing" className="text-slate-500 hover:text-slate-700">Pricing</Link></div>
                <div><Link href="/login" className="text-slate-500 hover:text-slate-700">Log in</Link></div>
                <div><Link href="/signup" className="text-slate-500 hover:text-slate-700">Sign up</Link></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Company</h3>
              <div className="space-y-2 text-sm">
                <div><a href="mailto:hello@trackstack.dev" className="text-slate-500 hover:text-slate-700">Contact</a></div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400">
            <span>© {new Date().getFullYear()} Trackstack. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
