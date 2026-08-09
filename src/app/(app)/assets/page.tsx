'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Pencil, Trash2, Package, Upload, Monitor, QrCode, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react'
import { getSettings, addEmployee as addEmp } from '@/lib/settings-store'
import CsvImport from '@/components/csv-import'
import ConfirmDialog from '@/components/confirm-dialog'
import EmployeeAutocomplete from '@/components/employee-autocomplete'
import ScanDevice from '@/components/scan-device'
import QrLabel from '@/components/qr-label'
import { downloadCsv } from '@/lib/export'

interface Asset { id: string; name: string; category: string; manufacturer: string; model: string; serial_number: string; status: string; assigned_to: string; location: string; purchase_date: string | null; warranty_expires: string | null }

function getAssets(): Asset[] { try { return JSON.parse(localStorage.getItem('trackstack_assets') || '[]') } catch { return [] } }
function saveAssets(a: Asset[]) { localStorage.setItem('trackstack_assets', JSON.stringify(a)) }

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]); const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState<Asset|null>(null)
  const [search, setSearch] = useState(''); const [showCsvImport, setShowCsvImport] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [qrAsset, setQrAsset] = useState<Asset | null>(null)
  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkReassignOpen, setBulkReassignOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkReassignName, setBulkReassignName] = useState('')
  const [form, setForm] = useState({ name:'', category:'laptop', manufacturer:'', model:'', serial_number:'', status:'active', assigned_to:'', location:'', purchase_date:'', warranty_expires:'' })
  const settings = getSettings()

  function toggleSort(field: string) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function sortIcon(field: string) {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30" />
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  const filtered = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.assigned_to?.toLowerCase().includes(search.toLowerCase()) || a.serial_number?.toLowerCase().includes(search.toLowerCase()))
  
  const sorted = sortField ? [...filtered].sort((a:any,b:any) => {
    const av = (a[sortField] || '').toString().toLowerCase()
    const bv = (b[sortField] || '').toString().toLowerCase()
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  }) : filtered

  useEffect(() => { setAssets(getAssets()); setLoading(false) }, [])
  function reload() { setAssets(getAssets()) }

  function makeAsset(data: Record<string, string>): Asset {
    return {
      id: Date.now().toString() + Math.random().toString(36).slice(2,6),
      name: data.name || data.asset_name || data['asset name'] || data.model || 'Unknown',
      category: (data.category || 'other').toLowerCase(),
      manufacturer: data.manufacturer || data.make || '',
      model: data.model || '',
      serial_number: data.serial_number || data.serial || data.sn || '',
      status: data.status || 'active',
      assigned_to: data.assigned_to || data.assigned || data.user || '',
      location: data.location || data.site || '',
      purchase_date: data.purchase_date || data.purchased || null,
      warranty_expires: data.warranty_expires || data.warranty || null,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const all = getAssets()
    if (editing) {
      const idx = all.findIndex(a => a.id === editing.id)
      if (idx >= 0) all[idx] = { ...all[idx], ...form, warranty_expires: form.warranty_expires || null, purchase_date: form.purchase_date || null }
    } else {
      all.push({ id: Date.now().toString() + Math.random().toString(36).slice(2,6), ...form, warranty_expires: form.warranty_expires || null, purchase_date: form.purchase_date || null })
    }
    saveAssets(all); reload(); setShowForm(false); setEditing(null)
    if (form.assigned_to.trim()) addEmp(form.assigned_to.trim())
    setForm({ name:'', category:'laptop', manufacturer:'', model:'', serial_number:'', status:'active', assigned_to:'', location:'', purchase_date:'', warranty_expires:'' })
  }

  function toggleSelect(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }
  function toggleAll() {
    if (selected.size === sorted.length) setSelected(new Set())
    else setSelected(new Set(sorted.map((a:Asset) => a.id)))
  }
  function bulkDelete() {
    saveAssets(assets.filter(a => !selected.has(a.id)))
    setSelected(new Set()); setBulkDeleteOpen(false); reload()
  }
  function bulkReassign() {
    const updated = assets.map(a => selected.has(a.id) ? { ...a, assigned_to: bulkReassignName } : a)
    saveAssets(updated); setSelected(new Set()); setBulkReassignOpen(false); setBulkReassignName(''); reload()
    if (bulkReassignName.trim()) addEmp(bulkReassignName.trim())
  }
  function startEdit(a: Asset) {
    setEditing(a); setForm({ name:a.name, category:a.category, manufacturer:a.manufacturer||'', model:a.model||'', serial_number:a.serial_number||'', status:a.status, assigned_to:a.assigned_to||'', location:a.location||'', purchase_date:a.purchase_date||'', warranty_expires:a.warranty_expires||'' })
    setShowForm(true)
  }

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>

  return (<div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-slate-900">Assets</h1>
      <div className="flex gap-2">
        <button onClick={() => setShowCsvImport(true)} className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50"><Upload size={16}/>Import CSV</button>
        <button onClick={() => setShowScanner(true)} className="flex items-center gap-2 px-3 py-2 border border-cyan-300 text-cyan-700 bg-cyan-50 rounded-md text-sm font-medium hover:bg-cyan-100"><Monitor size={16}/>Scan Device</button>
        <button onClick={() => downloadCsv(assets, 'trackstack-assets.csv')} className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50"><Download size={16}/>Export</button>
        <button onClick={()=>{setEditing(null);setShowForm(true)}} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700"><Plus size={16}/>Add Asset</button>
      </div>
    </div>

    <div className="mb-4 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search by name, person, or serial..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"/></div>

    {selected.size > 0 && <div className="mb-4 flex items-center gap-4 px-4 py-3 bg-slate-900 text-white rounded-lg text-sm">
      <span className="font-medium">{selected.size} item{selected.size>1?'s':''} selected</span>
      <button onClick={() => setBulkReassignOpen(true)} className="px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-md text-xs font-medium hover:bg-white/20 transition-colors">Reassign</button>
      <button onClick={() => setBulkDeleteOpen(true)} className="px-3 py-1.5 bg-red-500/30 border border-red-400/40 text-red-100 rounded-md text-xs font-medium hover:bg-red-500/50 transition-colors">Delete</button>
      <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-white/60 hover:text-white">Clear selection</button>
    </div>}

    {bulkDeleteOpen && <ConfirmDialog
      title={`Delete ${selected.size} asset${selected.size>1?'s':''}?`}
      message="This permanently removes them from your inventory. This cannot be undone."
      confirmLabel={`Delete ${selected.size}`}
      onConfirm={bulkDelete}
      onCancel={() => setBulkDeleteOpen(false)}
    />}

    {bulkReassignOpen && <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={() => setBulkReassignOpen(false)} />
      <div className="relative bg-white rounded-lg shadow-xl border border-slate-200 p-6 max-w-md w-full mx-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Reassign {selected.size} asset{selected.size>1?'s':''}</h3>
        <p className="text-sm text-slate-500 mb-4">Assign all selected assets to someone</p>
        <input autoFocus value={bulkReassignName} onChange={e => setBulkReassignName(e.target.value)} placeholder="Employee name..." className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4" onKeyDown={e => { if(e.key==='Enter' && bulkReassignName.trim()) bulkReassign() }} />
        <div className="flex gap-2 justify-end">
          <button onClick={() => { setBulkReassignOpen(false); setBulkReassignName('') }} className="px-4 py-1.5 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={bulkReassign} disabled={!bulkReassignName.trim()} className="px-4 py-1.5 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">Reassign</button>
        </div>
      </div>
    </div>}

    {showCsvImport && <CsvImport
      title="Import Assets from CSV"
      description="Upload your existing inventory spreadsheet. We'll try to match columns like name, model, serial, category, assigned_to, etc."
      sampleData="name,model,serial_number,category,assigned_to,location\nMacBook Pro,MBP 14 M3,SN123456,laptop,John Smith,Zurich Office\nDell XPS 15,XPS 9530,SN789012,laptop,Jane Doe,Geneva Office"
      sampleFilename="inventory.csv"
      onImport={rows => { const newAssets = rows.map(makeAsset); saveAssets([...getAssets(), ...newAssets]); reload() }}
      onClose={() => setShowCsvImport(false)}
    />}

    {showScanner && <ScanDevice
      onImport={data => { 
        const asset: Asset = { id: Date.now().toString() + Math.random().toString(36).slice(2,6), name: data.name || 'Unknown', category: data.category || 'laptop', manufacturer: data.manufacturer || '', model: data.model || '', serial_number: data.serial_number || '', status: 'active', assigned_to: '', location: '', purchase_date: null, warranty_expires: null }
        saveAssets([...getAssets(), asset]); reload() 
      }}
      onClose={() => setShowScanner(false)}
    />}

    {qrAsset && <QrLabel assetId={qrAsset.id} assetName={qrAsset.name} onClose={() => setQrAsset(null)} />}

    {showForm && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-auto border border-slate-200 shadow-xl"><h2 className="text-lg font-semibold mb-4">{editing?'Edit Asset':'New Asset'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3"><div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Name *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" placeholder="e.g. MacBook Pro 14"/></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm">{settings.categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Manufacturer</label><input value={form.manufacturer} onChange={e=>setForm({...form,manufacturer:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" placeholder="Dell / Apple / Lenovo"/></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Model</label><input value={form.model} onChange={e=>setForm({...form,model:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Serial Number</label><input value={form.serial_number} onChange={e=>setForm({...form,serial_number:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm">{settings.statuses.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Assigned To</label>
          <EmployeeAutocomplete value={form.assigned_to} onChange={v => setForm({...form, assigned_to: v})} options={settings.employees} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Location</label><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" placeholder="Office / room"/></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Purchase Date</label><input type="date" value={form.purchase_date} onChange={e=>setForm({...form,purchase_date:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Warranty Expires</label><input type="date" value={form.warranty_expires} onChange={e=>setForm({...form,warranty_expires:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
      </div>
      <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700">{editing?'Save Changes':'Add Asset'}</button><button type="button" onClick={()=>{setShowForm(false);setEditing(null)}} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Cancel</button></div></form></div></div>}

    {filtered.length===0 ? <div className="text-center py-16 text-slate-400"><Package size={48} className="mx-auto mb-3 opacity-50"/><p className="text-lg font-medium">No assets yet</p><p className="text-sm mt-1">Add manually, import a CSV, or drop a file anywhere on this page</p></div> :
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="max-h-[calc(100vh-220px)] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left text-slate-500 bg-slate-50 border-b">
              <th className="py-3 px-4 w-8"><input type="checkbox" checked={selected.size > 0 && selected.size === sorted.length} onChange={toggleAll} className="rounded" /></th>
              {['name','category','assigned_to','status','warranty_expires'].map(f => (
                <th key={f} onClick={() => toggleSort(f)} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700">
                  <span className="inline-flex items-center gap-1">{f==='warranty_expires' ? 'Warranty' : f==='assigned_to' ? 'Assigned To' : f.charAt(0).toUpperCase()+f.slice(1)}{sortIcon(f)}</span>
                </th>
              ))}
              <th className="py-3 px-4 font-medium w-20"></th></tr></thead>
          <tbody>{sorted.map(a=><tr key={a.id} className={`border-b border-slate-100 ${selected.has(a.id) ? 'bg-cyan-50/50' : 'hover:bg-slate-50'}`}>
            <td className="py-2.5 px-4"><input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} className="rounded" /></td>
            <td className="py-2.5 px-4 text-slate-900 font-medium">{a.name}</td><td className="py-2.5 px-4 text-slate-500 capitalize">{a.category}</td><td className="py-2.5 px-4 text-slate-600">{a.assigned_to||'—'}</td><td className="py-2.5 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${a.status==='active'?'bg-emerald-50 text-emerald-700':a.status==='maintenance'?'bg-amber-50 text-amber-700':'bg-slate-100 text-slate-600'}`}>{a.status}</span></td><td className="py-2.5 px-4 text-slate-500">{formatDate(a.warranty_expires)}</td><td className="py-2.5 px-4"><div className="flex gap-1"><button onClick={()=>startEdit(a)} className="p-1 hover:bg-slate-100 rounded"><Pencil size={14} className="text-slate-400"/></button><button onClick={()=>setQrAsset(a)} className="p-1 hover:bg-cyan-50 rounded"><QrCode size={14} className="text-cyan-500"/></button><button onClick={()=>{if(!confirm('Delete?'))return;saveAssets(getAssets().filter(x=>x.id!==a.id));reload()}} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400"/></button></div></td></tr>)}</tbody></table>
      </div>
    </div>}
  </div>)
}
