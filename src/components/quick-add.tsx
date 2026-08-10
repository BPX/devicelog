'use client'
import { useState, useRef, useEffect } from 'react'
import { Plus, Package, User, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function QuickAdd() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function navigate(path: string) {
    setOpen(false)
    router.push(path + '?new=true')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full px-3 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors"
      >
        <Plus size={16} /> Create New
      </button>
      {open && (
        <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
          <button onClick={() => navigate('/assets')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
            <Package size={14} className="text-slate-400" /> New Asset
          </button>
          <button onClick={() => navigate('/employees')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
            <User size={14} className="text-slate-400" /> New Employee
          </button>
          <button onClick={() => navigate('/certificates')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
            <Shield size={14} className="text-slate-400" /> New Certificate
          </button>
        </div>
      )}
    </div>
  )
}
