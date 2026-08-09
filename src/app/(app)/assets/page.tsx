'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Pencil, Trash2, Package, Upload, Monitor, QrCode } from 'lucide-react'
import { getSettings } from '@/lib/settings-store'
import CsvImport from '@/components/csv-import'
import ScanDevice from '@/components/scan-device'
import QrLabel from '@/components/qr-label'

interface Asset { id: string; name: string; category: string; manufacturer: string; model: string; serial_number: string; status: string; assigned_to: string; location: string; purchase_date: string | null; warranty_expires: string | null }

function getAssets(): Asset[] { try { return JSON.parse(localStorage.getItem('trackstack_assets') || '[]') } catch { return [] } }
function saveAssets(a: Asset[]) { localStorage.setItem('trackstack_assets', JSON.stringify(a)) }

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]); const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState<Asset|null>(null)
  const [search, setSearch] = useState(''); const [showCsvImport, setShowCsvImport] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [qrAsset, setQrAsset] = useState<Asset | null>(null)
  const [form, setForm] = useState({ name:'', category:'laptop', manufacturer:'', model:'', serial_number:'', status:'active', assigned_to:'', location:'', purchase_date:'', warranty_expires:'' })
  const settings = getSettings()

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
    setForm({ name:'', category:'laptop', manufacturer:'', model:'', serial_number:'', status:'active', assigned_to:'', location:'', purchase_date:'', warranty_expires:'' })
  }

  function startEdit(a: Asset) {
    setEditing(a); setForm({ name:a.name, category:a.category, manufacturer:a.manufacturer||'', model:a.model||'', serial_number:a.serial_number||'', status:a.status, assigned_to:a.assigned_to||'', location:a.location||'', purchase_date:a.purchase_date||'', warranty_expires:a.warranty_expires||'' })
    setShowForm(true)
  }

  const filtered = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.assigned_to?.toLowerCase().includes(search.toLowerCase()) || a.serial_number?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>

  return (<div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-slate-900">Assets</h1>
      <div className="flex gap-2">
        <button onClick={() => setShowCsvImport(true)} className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50"><Upload size={16}/>Import CSV</button>
        <button onClick={() => setShowScanner(true)} className="flex items-center gap-2 px-3 py-2 border border-cyan-300 text-cyan-700 bg-cyan-50 rounded-md text-sm font-medium hover:bg-cyan-100"><Monitor size={16}/>Scan Device</button>
        <button onClick={()=>{setEditing(null);setShowForm(true)}} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700"><Plus size={16}/>Add Asset</button>
      </div>
    </div>

    <div className="mb-4 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search by name, person, or serial..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"/></div>

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
          {settings.employees.length > 0 ? <select value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"><option value="">— Unassigned —</option>{settings.employees.map(e=><option key={e} value={e}>{e}</option>)}</select>
          : <input value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" placeholder="Person name"/>}</div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Location</label><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" placeholder="Office / room"/></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Purchase Date</label><input type="date" value={form.purchase_date} onChange={e=>setForm({...form,purchase_date:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Warranty Expires</label><input type="date" value={form.warranty_expires} onChange={e=>setForm({...form,warranty_expires:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
      </div>
      <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700">{editing?'Save Changes':'Add Asset'}</button><button type="button" onClick={()=>{setShowForm(false);setEditing(null)}} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Cancel</button></div></form></div></div>}

    {filtered.length===0 ? <div className="text-center py-16 text-slate-400"><Package size={48} className="mx-auto mb-3 opacity-50"/><p className="text-lg font-medium">No assets yet</p><p className="text-sm mt-1">Add manually, import a CSV, or drop a file anywhere on this page</p></div> :
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500 bg-slate-50 border-b"><th className="py-3 px-4 font-medium">Name</th><th className="py-3 px-4 font-medium">Category</th><th className="py-3 px-4 font-medium">Assigned To</th><th className="py-3 px-4 font-medium">Status</th><th className="py-3 px-4 font-medium">Warranty</th><th className="py-3 px-4 font-medium w-20"></th></tr></thead><tbody>{filtered.map(a=><tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-2.5 px-4 text-slate-900 font-medium">{a.name}</td><td className="py-2.5 px-4 text-slate-500 capitalize">{a.category}</td><td className="py-2.5 px-4 text-slate-600">{a.assigned_to||'—'}</td><td className="py-2.5 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${a.status==='active'?'bg-emerald-50 text-emerald-700':a.status==='maintenance'?'bg-amber-50 text-amber-700':'bg-slate-100 text-slate-600'}`}>{a.status}</span></td><td className="py-2.5 px-4 text-slate-500">{formatDate(a.warranty_expires)}</td><td className="py-2.5 px-4"><div className="flex gap-1"><button onClick={()=>startEdit(a)} className="p-1 hover:bg-slate-100 rounded"><Pencil size={14} className="text-slate-400"/></button><button onClick={()=>setQrAsset(a)} className="p-1 hover:bg-cyan-50 rounded"><QrCode size={14} className="text-cyan-500"/></button><button onClick={()=>{if(!confirm('Delete?'))return;saveAssets(getAssets().filter(x=>x.id!==a.id));reload()}} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400"/></button></div></td></tr>)}</tbody></table></div>}
  </div>)
}
