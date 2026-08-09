'use client'
import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferred(e); setShow(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-4 max-w-xs">
      <p className="text-sm text-slate-700 mb-3 font-medium">Install Trackstack as an app</p>
      <div className="flex gap-2">
        <button onClick={async () => { deferred.prompt(); setShow(false) }}
          className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white rounded text-xs font-medium hover:bg-cyan-700">
          <Download size={12} /> Install
        </button>
        <button onClick={() => setShow(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">Dismiss</button>
      </div>
    </div>
  )
}
