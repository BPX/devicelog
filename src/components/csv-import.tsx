'use client'
import { useState, useRef, useMemo } from 'react'
import { Upload, X, ArrowRight } from 'lucide-react'

interface Field {
  key: string
  label: string
  required?: boolean
  guess?: string[] // header names to auto-match
}

interface Props {
  onImport: (rows: Record<string, string>[]) => void
  onClose: () => void
  title: string
  description: string
  fields: Field[]
  sampleData?: string
  sampleFilename?: string
}

function fuzzyMatch(header: string, guesses: string[]): boolean {
  const h = header.toLowerCase().replace(/[^a-z0-9]/g, '')
  return guesses.some(g => {
    const g2 = g.toLowerCase().replace(/[^a-z0-9]/g, '')
    return h.includes(g2) || g2.includes(h)
  })
}

export default function CsvImport({ onImport, onClose, title, description, fields, sampleData, sampleFilename }: Props) {
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [step, setStep] = useState<'upload'|'map'|'confirm'>('upload')
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    const h = lines[0].split(',').map(s => s.trim().replace(/^"|"$/g, ''))
    setHeaders(h)

    // Auto-guess mapping
    const m: Record<string, string> = {}
    for (const header of h) {
      let best: string | null = null
      for (const field of fields) {
        if (field.guess && fuzzyMatch(header, field.guess)) {
          best = field.key
          break
        }
      }
      m[header] = best || 'skip'
    }
    setMapping(m)

    return lines.slice(1).map(line => {
      const vals = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      const row: Record<string, string> = {}
      h.forEach((k, i) => { if (vals[i] !== undefined) row[k] = vals[i] })
      return row
    }).filter(r => Object.keys(r).length > 0)
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const rows = parseCSV(reader.result as string)
      setPreview(rows)
      if (rows.length) setStep('map')
    }
    reader.readAsText(file)
  }

  const mappedPreview = useMemo(() => {
    return preview.slice(0, 3).map(row => {
      const mapped: Record<string, string> = {}
      for (const h of headers) {
        const fieldKey = mapping[h]
        if (fieldKey && fieldKey !== 'skip') mapped[fieldKey] = row[h] || ''
      }
      return mapped
    })
  }, [preview, headers, mapping])

  const activeFields = useMemo(() => {
    return fields.filter(f => Object.values(mapping).includes(f.key))
  }, [fields, mapping])

  function handleImport() {
    const mapped = preview.map(row => {
      const m: Record<string, string> = {}
      for (const h of headers) {
        const fieldKey = mapping[h]
        if (fieldKey && fieldKey !== 'skip') m[fieldKey] = row[h] || ''
      }
      return m
    })
    onImport(mapped)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}>
      <div className="bg-white dark:bg-slate-950 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>

        {step === 'upload' && (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950' : 'border-slate-300 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700'}`}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={32} className="mx-auto mb-3 text-slate-400" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Drop CSV here or click to browse</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">.csv files only</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
            {sampleData && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded text-xs font-mono text-slate-500 dark:text-slate-400">
                <p className="mb-1">Expected format ({sampleFilename || 'sample.csv'}):</p>
                <pre className="whitespace-pre-wrap">{sampleData}</pre>
              </div>
            )}
          </>
        )}

        {step === 'map' && (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {headers.length} columns found in your file. Match them to the right fields:
            </p>

            <div className="space-y-2 mb-4">
              {headers.map(header => (
                <div key={header} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium w-32 truncate text-right shrink-0" title={header}>
                    {header}
                  </span>
                  <ArrowRight size={14} className="text-slate-300 shrink-0" />
                  <select
                    value={mapping[header] || 'skip'}
                    onChange={e => setMapping(prev => ({ ...prev, [header]: e.target.value }))}
                    className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                  >
                    {fields.map(f => (
                      <option key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</option>
                    ))}
                    <option value="skip">— Skip this column —</option>
                  </select>
                  {mapping[header] === 'skip' && (
                    <span className="text-xs text-slate-400 w-16 text-right">ignored</span>
                  )}
                </div>
              ))}
            </div>

            {/* Live preview */}
            {activeFields.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Preview (first {Math.min(3, preview.length)} row{preview.length > 1 ? 's' : ''}):</p>
                <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900">
                        {activeFields.map(f => (
                          <th key={f.key} className="p-2 text-left font-medium text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            {f.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mappedPreview.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                          {activeFields.map(f => (
                            <td key={f.key} className="p-2 text-slate-700 dark:text-slate-300">
                              {row[f.key] || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleImport} className="flex-1 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">
                Import {preview.length} row{preview.length !== 1 ? 's' : ''}
              </button>
              <button onClick={() => { setStep('upload'); setPreview([]); setMapping({}) }} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
