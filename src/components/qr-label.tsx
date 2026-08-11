'use client'
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Printer } from 'lucide-react'

interface Props { assetId: string; assetName: string; assetSerial?: string; onClose: () => void }

export default function QrLabel({ assetId, assetName, assetSerial, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [url, setUrl] = useState('')

  useEffect(() => {
    const u = `${window.location.origin}/asset?id=${assetId}`
    setUrl(u)
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, u, { width: 200, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
    }
  }, [assetId])

  function download() {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `devicelog-${assetName.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  function print() {
    if (!canvasRef.current) return
    const qrData = canvasRef.current.toDataURL('image/png')
    const safeName = assetName.replace(/'/g, "\\'")
    const win = window.open('', '_blank', 'width=450,height=350')
    if (!win) return
    win.document.write(`
      <html><head><title>${safeName} — devicelog Label</title>
      <style>
        @page { size: 4in 2in; margin: 0.15in; }
        body { margin: 0; font-family: system-ui, sans-serif; }
        .label { display: flex; align-items: center; gap: 16px; padding: 12px; }
        .label img { width: 110px; height: 110px; }
        .info { flex: 1; }
        .info .name { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .info .detail { font-size: 10px; color: #64748b; margin-bottom: 2px; }
        .info .scan { font-size: 9px; color: #94a3b8; margin-top: 6px; }
      </style></head><body>
        <div class="label">
          <img src="${qrData}" />
          <div class="info">
            <div class="name">${safeName}</div>
            ${assetSerial ? `<div class="detail">S/N: ${assetSerial}</div>` : ''}
            <div class="detail">devicelog.dev</div>
            <div class="scan">Scan for details</div>
          </div>
        </div>
        <script>window.print();window.close()</script></body></html>
    `)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-950 rounded-lg p-6 text-center border border-slate-200 dark:border-slate-800 shadow-xl max-w-xs w-full">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">QR Label</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{assetName}</p>
        <canvas ref={canvasRef} className="mx-auto mb-4 rounded" />
        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mb-4 truncate">{url}</p>
        <div className="flex gap-2">
          <button onClick={download} className="flex-1 flex items-center justify-center gap-2 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700"><Download size={14} />Download PNG</button>
          <button onClick={print} className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"><Printer size={14} />Print Label</button>
        </div>
        <button onClick={onClose} className="mt-3 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600">Close</button>
      </div>
    </div>
  )
}