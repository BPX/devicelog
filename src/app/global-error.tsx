'use client'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => { console.error('devicelog crash:', error) }, [error])
  return (
    <html>
      <body style={{ fontFamily: 'system-ui', padding: 40, background: '#f8fafc', color: '#0f172a' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: '#64748b', marginTop: 8 }}>Try clearing your data and refreshing.</p>
        <button
          onClick={() => { localStorage.clear(); location.reload() }}
          style={{ marginTop: 16, padding: '8px 16px', background: '#0891b2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}
        >
          Reset All Data &amp; Reload
        </button>
        <pre style={{ marginTop: 24, fontSize: 12, color: '#94a3b8', whiteSpace: 'pre-wrap' }}>
          {error?.message || 'Unknown error'}
        </pre>
      </body>
    </html>
  )
}
