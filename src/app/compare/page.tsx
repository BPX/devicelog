import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, X, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'devicelog vs Snipe-IT & Asset Panda',
  description: 'Compare devicelog with Snipe-IT, spreadsheets, and Asset Panda. See how devicelog gives you modern IT asset tracking without self-hosting, spreadsheets, or enterprise pricing.',
  openGraph: {
    title: 'devicelog vs Snipe-IT & Asset Panda',
    description: 'Compare devicelog with Snipe-IT, spreadsheets, and Asset Panda.',
  },
}

const columns = [
  { key: 'devicelog', label: 'devicelog', color: 'cyan' },
  { key: 'snipeit', label: 'Snipe-IT', color: 'slate' },
  { key: 'spreadsheet', label: 'Spreadsheets', color: 'slate' },
  { key: 'assetpanda', label: 'Asset Panda', color: 'slate' },
]

const rows = [
  { label: 'Pricing', devicelog: 'Free — unlimited', snipeit: 'Free (self-host)', spreadsheet: 'Free', assetpanda: 'From $50/mo' },
  { label: 'Setup time', devicelog: '< 2 minutes', snipeit: 'Hours (server setup)', spreadsheet: 'Minutes', assetpanda: 'Days (onboarding)' },
  { label: 'Hosting', devicelog: 'Cloud (included)', snipeit: 'Self-hosted', spreadsheet: 'Any', assetpanda: 'Cloud' },
  { label: 'Certificate tracking', devicelog: 'Built-in', snipeit: 'No', spreadsheet: 'No', assetpanda: 'No' },
  { label: 'License tracking', devicelog: 'Built-in', snipeit: 'Plugin', spreadsheet: 'No', assetpanda: 'Module' },
  { label: 'Mobile barcode scanning', devicelog: 'Built-in', snipeit: 'Yes', spreadsheet: 'No', assetpanda: 'Yes' },
  { label: 'QR code labels', devicelog: 'Built-in', snipeit: 'Yes', spreadsheet: 'No', assetpanda: 'Add-on' },
  { label: 'CSV import', devicelog: 'Auto-column match', snipeit: 'Manual mapping', spreadsheet: 'Native', assetpanda: 'Limited' },
  { label: 'Team collaboration', devicelog: 'Built-in', snipeit: 'Limited', spreadsheet: 'No', assetpanda: 'Yes' },
  { label: 'Modern UI', devicelog: 'Yes', snipeit: 'Dated', spreadsheet: 'Varies', assetpanda: 'Functional' },
  { label: 'Free tier', devicelog: 'Unlimited assets & users', snipeit: 'Unlimited', spreadsheet: 'Unlimited', assetpanda: 'No' },
  { label: 'Open source', devicelog: 'Source-visible (BSL)', snipeit: 'AGPL', spreadsheet: 'N/A', assetpanda: 'No' },
]

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900 dark:text-slate-100">
            device<span className="text-cyan-600 dark:text-cyan-400">log</span>
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700">
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Compare IT Asset Management Tools
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          See why teams choose devicelog over Snipe-IT, spreadsheets, and Asset Panda. Free. Unlimited. No server required.
        </p>
      </section>

      {/* Comparison Table */}
      <section className="max-w-5xl mx-auto px-6 pb-24 overflow-x-auto">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <th className="text-left py-3.5 px-5 font-semibold text-slate-700 dark:text-slate-200">Feature</th>
                {columns.map(col => (
                  <th key={col.key} className={`text-center py-3.5 px-4 font-semibold ${
                    col.key === 'devicelog' ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/30 dark:bg-cyan-950/30' : 'text-slate-500 dark:text-slate-400'
                  }`}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={`border-b border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? 'bg-slate-50/30 dark:bg-slate-800/30' : ''}`}>
                  <td className="py-3 px-5 text-slate-700 dark:text-slate-300 font-medium">{row.label}</td>
                  {(columns.map(col => (
                    <td key={col.key} className={`py-3 px-4 text-center text-xs ${col.key === 'devicelog' ? 'bg-cyan-50/20 dark:bg-cyan-950/20 font-medium text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                      {(row as any)[col.key]}
                    </td>
                  )))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Verdicts */}
      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-16">
        {/* Snipe-IT */}
        <div id="snipe-it" className="grid sm:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">devicelog vs Snipe-IT</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              Snipe-IT is a solid open-source option if you have the infrastructure to self-host. But for most small-to-medium teams,
              setting up a server, managing SSL, handling upgrades, and maintaining a PHP stack is more work than the asset tracking itself.
              devicelog gives you the same core functionality — plus certificate and license tracking that Snipe-IT doesn't have — without any
              server administration.
            </p>
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div><span className="text-emerald-500 font-semibold">✓</span> <span className="text-slate-600 dark:text-slate-400">No server to maintain</span></div>
              <div><span className="text-emerald-500 font-semibold">✓</span> <span className="text-slate-600 dark:text-slate-400">Certificate + license tracking</span></div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">When Snipe-IT makes sense</p>
            <ul className="space-y-1.5">
              <li>• You already have server infrastructure and IT staff</li>
              <li>• You prefer self-hosted open source under AGPL</li>
              <li>• You require on-premise deployment for compliance</li>
              <li>• You prefer full AGPL open source</li>
            </ul>
          </div>
        </div>

        {/* Spreadsheets */}
        <div id="spreadsheets" className="grid sm:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">devicelog vs Spreadsheets</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              Spreadsheets work great — until they don't. Version conflicts, stale data, no certificate expiry alerts,
              no QR codes, no team visibility. devicelog gives you all the simplicity of a spreadsheet with the structure
              and automation of a real IT asset manager. Import your existing CSV in seconds.
            </p>
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div><span className="text-emerald-500 font-semibold">✓</span> <span className="text-slate-600 dark:text-slate-400">Real-time team sync</span></div>
              <div><span className="text-emerald-500 font-semibold">✓</span> <span className="text-slate-600 dark:text-slate-400">Auto expiry alerts</span></div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">When spreadsheets make sense</p>
            <ul className="space-y-1.5">
              <li>• You have fewer than 10 devices to track</li>
              <li>• You're the only person managing inventory</li>
              <li>• You don't need certificate or warranty tracking</li>
            </ul>
          </div>
        </div>

        {/* Asset Panda */}
        <div id="asset-panda" className="grid sm:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">devicelog vs Asset Panda</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              Asset Panda is a full ITSM suite with asset management as one module. If you need ITIL-compliant change management,
              a service desk, and enterprise reporting, it's the right tool. For teams that just need to track laptops, monitors, certs,
              and licenses, devicelog is simpler and 5x cheaper.
            </p>
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div><span className="text-emerald-500 font-semibold">✓</span> <span className="text-slate-600 dark:text-slate-400">5x cheaper</span></div>
              <div><span className="text-emerald-500 font-semibold">✓</span> <span className="text-slate-600 dark:text-slate-400">Setup in minutes, not days</span></div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">When Asset Panda makes sense</p>
            <ul className="space-y-1.5">
              <li>• You need a full ITSM suite with service desk</li>
              <li>• You have 200+ employees and dedicated IT staff</li>
              <li>• You require ITIL-compliant change management</li>
              <li>• Budget isn't a constraint</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Ready to stop fighting your spreadsheet?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Start tracking your IT assets in under 2 minutes. Free — unlimited everything.
        </p>
        <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700">
          Start free <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  )
}
