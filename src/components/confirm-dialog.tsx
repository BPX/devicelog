'use client'
import { AlertTriangle } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Yes', onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl border border-slate-200 p-6 max-w-md w-full mx-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onCancel} className="px-4 py-1.5 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
