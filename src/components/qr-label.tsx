'use client'
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Printer } from 'lucide-react'

interface Props { assetId: string; assetName: string; onClose: () => void }

export default function QrLabel({ assetId, assetName, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [url, setUrl] = useState('')

  useEffect(() => {
    const u = `${window.location.origin}/asset?id=${assetId}`
    setUrl(u)
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, u, { width: 300, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
    }
  }, [assetId])

  function download() {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `trackstack-${assetName.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  function print() {
    if (!canvasRef.current) return
    const win = window.open('', '_blank', 'width=400,height=550')
    if (!win) return
    win.document.write(`
      <html><head><title>${assetName} — Trackstack Label</title>
      <style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:system-ui}
      .label{text-align:center;padding:20px}
      .label img{max-width:280px}
      .label p{margin:8px 0;font-size:13px;color:#334155}
      .label .name{font-weight:600;font-size:15px;color:#0f172a}
      </style></head><body>
      <div class="label">
        <img src="${canvasRef.current.toDataURL('image/png')}" />
        <p class="name">${assetName}</p>
        <p>Scan for asset details</p>
      </div>
      <script>window.print();window.close()</script></body></html>
    `)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 text-center border border-slate-200 shadow-xl max-w-sm w-full">
        <h2 className="font-semibold text-slate-900 mb-1">QR Label</h2>
        <p className="text-sm text-slate-500 mb-4">{assetName}</p>
        <canvas ref={canvasRef} className="mx-auto mb-4 rounded" />
        <p className="text-xs text-slate-400 font-mono mb-4 truncate">{url}</p>
        <div className="flex gap-2">
          <button onClick={download} className="flex-1 flex items-center justify-center gap-2 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700"><Download size={14} />Download PNG</button>
          <button onClick={print} className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"><Printer size={14} />Print Label</button>
        </div>
        <button onClick={onClose} className="mt-3 text-sm text-slate-400 hover:text-slate-600">Close</button>
      </div>
    </div>
  )
}
