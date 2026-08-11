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
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-4 max-w-xs">
      <p className="text-sm text-slate-700 dark:text-slate-200 mb-3 font-medium">Install devicelog as an app</p>
      <div className="flex gap-2">
        <button onClick={async () => { deferred.prompt(); setShow(false) }}
          className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 dark:bg-cyan-500 text-white rounded text-xs font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">
          <Download size={12} /> Install
        </button>
        <button onClick={() => setShow(false)} className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Dismiss</button>
      </div>
    </div>
  )
}
