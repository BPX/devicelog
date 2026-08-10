'use client'
import Link from 'next/link'
import { Package, Shield, AlertTriangle, Users, ArrowRight, Monitor, Laptop, Server, Smartphone, Printer } from 'lucide-react'

// ── Sample data ──

const stats = [
  { label: 'Total Assets', value: 247, icon: Package, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { label: 'Active Certs', value: 38, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Team Members', value: 12, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Expiring Soon', value: 5, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
]

const sampleAssets = [
  { name: 'MacBook Pro 14" M3', category: 'laptop', assigned_to: 'Sarah Chen', status: 'active', warranty_expires: '2027-03-15', serial: 'MBP-M3-00142' },
  { name: 'Dell XPS 15 9530', category: 'laptop', assigned_to: 'Marcus Rivera', status: 'active', warranty_expires: '2026-11-30', serial: 'XPS-9530-0089' },
  { name: 'ThinkPad X1 Carbon Gen 12', category: 'laptop', assigned_to: 'Priya Patel', status: 'active', warranty_expires: '2028-01-20', serial: 'X1C-12-0451' },
  { name: 'Dell UltraSharp U2723QE', category: 'monitor', assigned_to: 'James Wilson', status: 'active', warranty_expires: '2026-06-01', serial: 'U2723QE-7731' },
  { name: 'iPhone 16 Pro', category: 'phone', assigned_to: 'Sarah Chen', status: 'active', warranty_expires: '2027-09-22', serial: 'IP16P-10234' },
  { name: 'HP LaserJet Pro M404', category: 'printer', assigned_to: 'Office - Floor 2', status: 'maintenance', warranty_expires: '2025-08-15', serial: 'M404-33210' },
  { name: 'Synology DS923+ NAS', category: 'server', assigned_to: 'IT Admin', status: 'active', warranty_expires: '2027-12-01', serial: 'DS923-88745' },
  { name: 'iPad Air M2', category: 'tablet', assigned_to: 'Emma Thompson', status: 'active', warranty_expires: '2027-04-18', serial: 'IPA-M2-5567' },
  { name: 'Lenovo ThinkVision P27u-20', category: 'monitor', assigned_to: 'Priya Patel', status: 'active', warranty_expires: '2026-08-10', serial: 'P27U-22451' },
  { name: 'Samsung Galaxy S25', category: 'phone', assigned_to: 'Marcus Rivera', status: 'lost', warranty_expires: '2026-02-28', serial: 'SGS25-99831' },
]

const sampleCerts = [
  { name: 'trackstack.com SSL', type: 'ssl_cert', issuer: "Let's Encrypt", expires: '2027-06-15', days: 308 },
  { name: 'api.trackstack.dev SSL', type: 'ssl_cert', issuer: "Let's Encrypt", expires: '2027-04-03', days: 234 },
  { name: 'Office 365 E5', type: 'software_license', issuer: 'Microsoft', expires: '2026-12-31', days: 140 },
  { name: 'JetBrains All Products Pack', type: 'software_license', issuer: 'JetBrains', expires: '2026-08-01', days: 12 },
  { name: 'Slack Enterprise Grid', type: 'software_license', issuer: 'Slack', expires: '2027-01-15', days: 155 },
  { name: 'Cisco Meraki MX95 Support', type: 'support_contract', issuer: 'Cisco', expires: '2026-04-20', days: -5 },
  { name: 'Vercel Pro', type: 'software_license', issuer: 'Vercel', expires: '2026-09-30', days: 72 },
  { name: '1Password Business', type: 'software_license', issuer: '1Password', expires: '2027-03-01', days: 201 },
]

// ── Helpers ──

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    maintenance: 'bg-amber-50 text-amber-700',
    retired: 'bg-slate-100 text-slate-600',
    lost: 'bg-red-50 text-red-700',
  }
  return colors[status] || 'bg-slate-100 text-slate-600'
}

function categoryIcon(category: string) {
  switch (category) {
    case 'laptop': return <Laptop size={16} className="text-slate-300" />
    case 'server': return <Server size={16} className="text-slate-300" />
    case 'phone': return <Smartphone size={16} className="text-slate-300" />
    case 'printer': return <Printer size={16} className="text-slate-300" />
    case 'monitor': return <Monitor size={16} className="text-slate-300" />
    default: return <Package size={16} className="text-slate-300" />
  }
}

export default function DemoPage() {
  return (
    <div>
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
              Track<span className="text-cyan-600">stack</span>
            </Link>
            <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-full">
              Demo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 transition-colors"
            >
              Sign up free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Banner ── */}
        <div className="mb-8 flex items-center justify-between gap-4 px-5 py-4 bg-cyan-50 border border-cyan-200 rounded-xl">
          <div>
            <p className="font-medium text-cyan-800">This is a demo account with sample data.</p>
            <p className="text-sm text-cyan-600 mt-0.5">Explore freely — nothing here is saved permanently.</p>
          </div>
          <Link
            href="/signup"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 transition-colors"
          >
            Create your account <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Key alerts ── */}
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <span className="text-red-800">
            1 cert expired. 1 warranty expired.{' '}
            <span className="underline font-medium cursor-pointer">Review now →</span>
          </span>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className={`${s.bg} rounded-lg p-5 border border-slate-200`}>
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={18} className={s.color} />
                <span className="text-sm text-slate-600">{s.label}</span>
              </div>
              <div className={`text-3xl font-light ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Tables ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Assets */}
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
              <h2 className="font-medium text-slate-900">Recent Assets</h2>
              <span className="text-xs text-slate-400">Showing 10 of 247</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 bg-slate-50 border-b">
                  <th className="py-2.5 px-4 font-medium">Name</th>
                  <th className="py-2.5 px-4 font-medium">Assigned To</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleAssets.map(a => (
                  <tr key={a.serial} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-900 font-medium">
                      <div className="flex items-center gap-2">
                        {categoryIcon(a.category)}
                        <div>
                          <div>{a.name}</div>
                          <div className="text-xs text-slate-400 font-normal">{a.serial}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{a.assigned_to}</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Certificates */}
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
              <h2 className="font-medium text-slate-900">Certificates & Licenses</h2>
              <span className="text-xs text-slate-400">38 total</span>
            </div>
            <div className="divide-y">
              {sampleCerts.map(c => (
                <div key={c.name} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.issuer} · {c.type.replace('_', ' ')}</div>
                  </div>
                  <span className={`text-xs font-medium ${c.days <= 0 ? 'text-red-600' : c.days <= 30 ? 'text-amber-600' : 'text-slate-500'}`}>
                    {c.days <= 0 ? 'EXPIRED' : c.days <= 30 ? `${c.days}d left` : `${c.days}d`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-12 text-center pb-8">
          <h2 className="text-2xl font-bold text-slate-900">Ready to track your own assets?</h2>
          <p className="mt-2 text-slate-500">Free for solo users. Unlimited assets on Team plan.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white text-base font-medium rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Start free <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 text-base font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
