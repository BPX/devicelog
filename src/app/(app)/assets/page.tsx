'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Pencil, Trash2, Package, Upload, Monitor, QrCode, ArrowUpDown, ArrowUp, ArrowDown, Download, Image, Camera } from 'lucide-react'
import { getSettings, addEmployee as addEmp } from '@/lib/settings-store'
import { getAssets, saveAsset, deleteAsset as deleteAssetDb } from '@/lib/data'
import CsvImport from '@/components/csv-import'
import EmployeeAutocomplete from '@/components/employee-autocomplete'
import ScanDevice from '@/components/scan-device'
import QrLabel from '@/components/qr-label'
import ConfirmDialog from '@/components/confirm-dialog'
import { downloadCsv } from '@/lib/export'

interface Asset { id: string; name: string; category: string; manufacturer: string; model: string; serial_number: string; status: string; assigned_to: string; location: string; purchase_date: string | null; warranty_expires: string | null; image?: string }

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]); const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState<Asset|null>(null)
  const [search, setSearch] = useState(''); const [showCsvImport, setShowCsvImport] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [qrAsset, setQrAsset] = useState<Asset | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)
  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [form, setForm] = useState({ name:'', category:'laptop', manufacturer:'', model:'', serial_number:'', status:'active', assigned_to:'', location:'', purchase_date:'', warranty_expires:'', image:'' })
  const [uploading, setUploading] = useState(false)
  const settings = getSettings()
  const employeeNames = settings.employees.map(e => e.name)

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

  async function reload() {
    const data = await getAssets()
    setAssets(data || [])
  }

  useEffect(() => {
    (async () => {
      const data = await getAssets()
      setAssets(data || [])
      setLoading(false)
    })()
    // Auto-open create modal from QuickAdd
    if (typeof window !== 'undefined' && window.location.search.includes('new=true')) {
      setShowForm(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      await deleteAssetDb(editing.id)
    }
    const newAsset: Asset = {
      id: Date.now().toString() + Math.random().toString(36).slice(2,6),
      ...form,
      warranty_expires: form.warranty_expires || null,
      purchase_date: form.purchase_date || null,
    }
    await saveAsset(newAsset)
    await reload()
    setShowForm(false); setEditing(null)
    if (form.assigned_to.trim()) addEmp(form.assigned_to.trim())
    setForm({ name:'', category:'laptop', manufacturer:'', model:'', serial_number:'', status:'active', assigned_to:'', location:'', purchase_date:'', warranty_expires:'', image:'' })
  }

  function startEdit(a: Asset) {
    setEditing(a); setForm({ name:a.name, category:a.category, manufacturer:a.manufacturer||'', model:a.model||'', serial_number:a.serial_number||'', status:a.status, assigned_to:a.assigned_to||'', location:a.location||'', purchase_date:a.purchase_date||'', warranty_expires:a.warranty_expires||'', image:a.image||'' })
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

    {showCsvImport && <CsvImport
      title="Import Assets from CSV"
      description="Upload your existing inventory spreadsheet. We'll try to match columns like name, model, serial, category, assigned_to, etc."
      sampleData={`name,model,serial_number,category,assigned_to,location
MacBook Pro,MBP 14 M3,SN123456,laptop,John Smith,Zurich Office
Dell XPS 15,XPS 9530,SN789012,laptop,Jane Doe,Geneva Office`}
      sampleFilename="inventory.csv"
      onImport={async rows => {
        const newAssets = rows.map(makeAsset)
        for (const a of newAssets) await saveAsset(a)
        await reload()
      }}
      onClose={() => setShowCsvImport(false)}
    />}

    {showScanner && <ScanDevice
      onImport={async data => { 
        const asset: Asset = { id: Date.now().toString() + Math.random().toString(36).slice(2,6), name: data.name || 'Unknown', category: data.category || 'laptop', manufacturer: data.manufacturer || '', model: data.model || '', serial_number: data.serial_number || '', status: 'active', assigned_to: '', location: '', purchase_date: null, warranty_expires: null }
        await saveAsset(asset)
        await reload()
      }}
      onClose={() => setShowScanner(false)}
    />}

    {qrAsset && <QrLabel assetId={qrAsset.id} assetName={qrAsset.name} onClose={() => setQrAsset(null)} />}

    {deletingAsset && <ConfirmDialog
      title={`Delete ${deletingAsset.name}?`}
      message="This permanently removes the asset from your inventory."
      confirmLabel="Delete"
      onConfirm={async () => {
        await deleteAssetDb(deletingAsset.id)
        setDeletingAsset(null)
        await reload()
      }}
      onCancel={() => setDeletingAsset(null)}
    />}

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
          <EmployeeAutocomplete value={form.assigned_to} onChange={v => setForm({...form, assigned_to: v})} options={employeeNames} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Location</label><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm" placeholder="Office / room"/></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Purchase Date</label><input type="date" value={form.purchase_date} onChange={e=>setForm({...form,purchase_date:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Warranty Expires</label><input type="date" value={form.warranty_expires} onChange={e=>setForm({...form,warranty_expires:e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"/></div>
      </div>
      <div className="pt-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">Photo</label>
        {form.image ? (
          <div className="relative inline-block">
            <img src={form.image} alt="Preview" className="h-24 rounded border border-slate-200" />
            <button onClick={() => setForm({...form, image: ''})} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded text-sm text-slate-500 cursor-pointer hover:border-cyan-300 hover:text-cyan-600">
            <Camera size={14} /> {uploading ? 'Uploading...' : 'Add photo'}
            <input type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0]
            if (!f) return
            if (f.size > 500 * 1024) { alert('Image too large. Max 500KB. Please resize.'); return }
            setUploading(true)
            const reader = new FileReader()
            reader.onload = () => { setForm({...form, image: reader.result as string}); setUploading(false) }
            reader.readAsDataURL(f)
            }} />
          </label>
        )}
        {uploading && <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full animate-pulse w-2/3" /></div>}
      </div>
      <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700">{editing?'Save Changes':'Add Asset'}</button><button type="button" onClick={()=>{setShowForm(false);setEditing(null)}} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Cancel</button></div></form></div></div>}

    {filtered.length===0 ? <div className="text-center py-16 text-slate-400"><Package size={48} className="mx-auto mb-3 opacity-50"/><p className="text-lg font-medium">No assets yet</p><p className="text-sm mt-1">Add manually, import a CSV, or drop a file anywhere on this page</p></div> :
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="max-h-[calc(100vh-220px)] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left text-slate-500 bg-slate-50 border-b">
              {['name','category','assigned_to','status','warranty_expires'].map(f => (
                <th key={f} onClick={() => toggleSort(f)} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700">
                  <span className="inline-flex items-center gap-1">{f==='warranty_expires' ? 'Warranty' : f==='assigned_to' ? 'Assigned To' : f.charAt(0).toUpperCase()+f.slice(1)}{sortIcon(f)}</span>
                </th>
              ))}
              <th className="py-3 px-4 font-medium w-20"></th></tr></thead>
          <tbody>{sorted.map(a=><tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-2.5 px-4 text-slate-900 font-medium">
            <div className="flex items-center gap-2">
              {a.image ? <img src={a.image} alt="" className="w-8 h-8 rounded object-cover border border-slate-200" /> : <Package size={16} className="text-slate-300" />}
              {a.name}
            </div>
          </td><td className="py-2.5 px-4 text-slate-500 capitalize">{a.category}</td><td className="py-2.5 px-4 text-slate-600">{a.assigned_to||'—'}</td><td className="py-2.5 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${a.status==='active'?'bg-emerald-50 text-emerald-700':a.status==='maintenance'?'bg-amber-50 text-amber-700':'bg-slate-100 text-slate-600'}`}>{a.status}</span></td><td className="py-2.5 px-4 text-slate-500">{formatDate(a.warranty_expires)}</td><td className="py-2.5 px-4"><div className="flex gap-1"><button onClick={()=>startEdit(a)} className="p-1 hover:bg-slate-100 rounded"><Pencil size={14} className="text-slate-400"/></button><button onClick={()=>setQrAsset(a)} className="p-1 hover:bg-cyan-50 rounded"><QrCode size={14} className="text-cyan-500"/></button><button onClick={()=>setDeletingAsset(a)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400"/></button></div></td></tr>)}</tbody></table>
      </div>
    </div>}
  </div>)
}
