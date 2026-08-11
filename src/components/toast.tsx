'use client'
import { useEffect, useState, useCallback } from 'react'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

interface ToastMessage {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

let nextId = 0
let listeners: ((toasts: ToastMessage[]) => void)[] = []
let currentToasts: ToastMessage[] = []

function addToast(message: string, type: ToastMessage['type'] = 'info') {
  const id = nextId++
  currentToasts = [...currentToasts, { id, message, type }]
  listeners.forEach(fn => fn(currentToasts))
  setTimeout(() => removeToast(id), 4000)
}

function removeToast(id: number) {
  currentToasts = currentToasts.filter(t => t.id !== id)
  listeners.forEach(fn => fn(currentToasts))
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  warning: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  info: 'bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200',
}

export { addToast, removeToast }

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    listeners.push(setToasts)
    return () => { listeners = listeners.filter(fn => fn !== setToasts) }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => {
        const Icon = icons[t.type]
        return (
          <div key={t.id} className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border shadow-lg text-sm animate-in slide-in-from-right ${colors[t.type]}`}>
            <Icon size={16} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="flex-shrink-0 hover:opacity-70">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
