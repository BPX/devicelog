'use client'
import { useState } from 'react'
import { Monitor, Copy, Check, Terminal } from 'lucide-react'

interface Props { onImport: (data: Record<string, string>) => void; onClose: () => void }

export default function ScanDevice({ onImport, onClose }: Props) {
  const [step, setStep] = useState<'instructions'|'paste'>('instructions')
  const [pasteValue, setPasteValue] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [scanCode] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase())

  const command = `python3 scanner.py --code ${scanCode}`

  function handlePaste() {
    setError('')
    const input = pasteValue.trim()

    // Try v1 format: DEVICELOG_SCAN_V1:base64blob
    const v1Match = input.match(/^DEVICELOG_SCAN_V1:(.+)$/)
    if (v1Match) {
      try {
        const encoded = v1Match[1]
        const key = scanCode.repeat(Math.ceil(1000 / scanCode.length)).slice(0, 1000)
        const decoded = atob(encoded)
        const payload = decoded.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('')
        const data = JSON.parse(payload)
        onImport({
          name: `${data.manufacturer || ''} ${data.model || data.hostname || 'Unknown Device'}`.trim(),
          manufacturer: data.manufacturer || '',
          model: data.model || '',
          serial_number: data.serial_number || '',
          category: 'laptop',
          notes: `CPU: ${data.cpu || '?'} / RAM: ${data.ram_gb || '?'} / OS: ${data.os || '?'} / Hostname: ${data.hostname || '?'}`,
        })
        return
      } catch { setError('Invalid scan code. Make sure you ran the scanner on the same device with the correct code.') }
    }

    // Try v0 fallback: plain base64 JSON
    const v0Match = input.match(/^DEVICELOG_SCAN_V0:(.+)$/)
    if (v0Match) {
      try {
        const data = JSON.parse(atob(v0Match[1]))
        onImport({
          name: `${data.manufacturer || ''} ${data.model || data.hostname || 'Unknown Device'}`.trim(),
          manufacturer: data.manufacturer || '',
          model: data.model || '',
          serial_number: data.serial_number || '',
          category: 'laptop',
          notes: `CPU: ${data.cpu || '?'} / RAM: ${data.ram_gb || '?'} / OS: ${data.os || '?'}`,
        })
        return
      } catch { setError('Could not decode scan data. Try scanning again.') }
    }

    // Try raw JSON
    try {
      const data = JSON.parse(input)
      if (data.serial_number || data.model) {
        onImport({
          name: `${data.manufacturer || ''} ${data.model || data.hostname || 'Unknown Device'}`.trim(),
          manufacturer: data.manufacturer || '',
          model: data.model || '',
          serial_number: data.serial_number || '',
          category: 'laptop',
          notes: `CPU: ${data.cpu || '?'} / RAM: ${data.ram_gb || '?'} / OS: ${data.os || '?'}`,
        })
        return
      }
    } catch {}

    setError('Could not recognize scan output. Run the scanner with --code and paste the result here.')
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg border border-slate-200 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center"><Monitor size={20} className="text-cyan-600" /></div>
          <div><h2 className="text-lg font-semibold">Scan Device</h2><p className="text-sm text-slate-500">Auto-detect hardware specs</p></div>
        </div>

        {step === 'instructions' ? (<>
          <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm mb-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-2"><Terminal size={12} /> Terminal</div>
            <div className="mb-1"><span className="text-cyan-400">$</span> curl -O https://thought-grade-phoenix-quality.trycloudflare.com/scanner.py</div>
            <div><span className="text-cyan-400">$</span> {command}</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800"><strong>Scan code:</strong> <span className="font-mono bg-amber-100 px-2 py-0.5 rounded">{scanCode}</span></p>
            <p className="text-xs text-amber-600 mt-1">This code links the scan to your session. Run the scanner on the device you want to add.</p>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => { navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-900">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy Command'}
            </button>
            <button onClick={() => setStep('paste')}
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700">
              I ran it — paste results
            </button>
          </div>
        </>) : (<>
          <p className="text-sm text-slate-500 mb-3">Paste the scanner output below:</p>
          <textarea value={pasteValue} onChange={e => setPasteValue(e.target.value)}
            className="w-full h-32 p-3 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-3"
            placeholder="DEVICELOG_SCAN_V1:eyJ..." />
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-3">{error}</div>}
          <div className="flex gap-2">
            <button onClick={handlePaste} className="flex-1 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700">Import Device</button>
            <button onClick={() => { setStep('instructions'); setError(''); setPasteValue('') }} className="px-4 py-2 border rounded text-sm text-slate-600">Back</button>
          </div>
        </>)}

        <button onClick={onClose} className="mt-4 w-full text-center text-sm text-slate-400 hover:text-slate-600">Cancel</button>
      </div>
    </div>
  )
}
