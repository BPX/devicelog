'use client'
import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface Props {
  onImport: (rows: Record<string, string>[]) => void
  onClose: () => void
  title: string
  description: string
  sampleData?: string
  sampleFilename?: string
}

export default function CsvImport({ onImport, onClose, title, description, sampleData, sampleFilename }: Props) {
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [step, setStep] = useState<'upload'|'confirm'>('upload')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    const h = lines[0].split(',').map(s => s.trim().replace(/^"|"$/g, ''))
    setHeaders(h)
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      const row: Record<string, string> = {}
      h.forEach((k, i) => { if (vals[i] !== undefined) row[k] = vals[i] })
      return row
    }).filter(r => Object.keys(r).length > 0)
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => { const rows = parseCSV(reader.result as string); setPreview(rows); if(rows.length) setStep('confirm') }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0])}}>
      <div className="bg-white rounded-lg p-6 w-full max-w-xl border border-slate-200 shadow-xl">
        <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose}><X size={18} className="text-slate-400" /></button></div>

        {step === 'upload' ? (<>
          <p className="text-sm text-slate-500 mb-4">{description}</p>
          <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-cyan-400 bg-cyan-50' : 'border-slate-300 hover:border-cyan-300'}`}
            onClick={() => fileRef.current?.click()}>
            <Upload size={32} className="mx-auto mb-3 text-slate-400" />
            <p className="text-sm text-slate-600 font-medium">Drop CSV here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">.csv files only</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
          {sampleData && <div className="mt-4 p-3 bg-slate-50 rounded text-xs font-mono text-slate-500">
            <p className="mb-1">Expected format ({sampleFilename || 'sample.csv'}):</p>
            <pre className="whitespace-pre-wrap">{sampleData}</pre>
          </div>}
        </>) : (<>
          <p className="text-sm text-slate-500 mb-3">{preview.length} rows found with {headers.length} columns: {headers.join(', ')}</p>
          <div className="max-h-60 overflow-auto mb-4 border rounded">
            <table className="w-full text-xs"><thead><tr className="bg-slate-50">{headers.map(h=><th key={h} className="p-2 text-left font-medium text-slate-600 border-b">{h}</th>)}</tr></thead>
              <tbody>{preview.slice(0,10).map((r,i)=><tr key={i} className="border-b">{headers.map(h=><td key={h} className="p-2 text-slate-700">{r[h]||'—'}</td>)}</tr>)}</tbody></table>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onImport(preview); onClose() }} className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700">Import {preview.length} rows</button>
            <button onClick={() => { setStep('upload'); setPreview([]) }} className="px-4 py-2 border rounded text-sm text-slate-600">Back</button>
          </div>
        </>)}
      </div>
    </div>
  )
}
