'use client'
import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
}

export default function EmployeeAutocomplete({ value, onChange, options, placeholder = 'Search employees...' }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const [highlighted, setHighlighted] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { setQuery(value) }, [value])

  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  function select(option: string) { setQuery(option); onChange(option); setOpen(false); setHighlighted(-1) }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, -1)) }
    else if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); select(filtered[highlighted]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <input
        ref={inputRef}
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); setHighlighted(-1) }}
        onFocus={() => { if (query.trim()) setOpen(true) }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      {query && (
        <button onClick={() => { setQuery(''); onChange(''); inputRef.current?.focus() }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      )}
      {open && filtered.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {filtered.map((o, i) => (
            <button
              key={o}
              onClick={() => select(o)}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${i === highlighted ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
