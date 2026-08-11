'use client'
import { useEffect, useState, useCallback } from 'react'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Pencil, Trash2, Package, Upload, Monitor, QrCode, ArrowUpDown, ArrowUp, ArrowDown, Download, Camera, ChevronLeft, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react'
import { getSettings, addEmployee as addEmp } from '@/lib/settings-store'
import { getTeam, queryAssets, saveAsset, saveAssetsBatch, deleteAsset as deleteAssetDb, uploadAssetImage, getTeamSettings } from '@/lib/data'
import { checkPlanLimit } from '@/lib/billing'
import type { Asset } from '@/lib/data'
import CsvImport from '@/components/csv-import'
import EmployeeAutocomplete from '@/components/employee-autocomplete'
import ScanDevice from '@/components/scan-device'
import QrLabel from '@/components/qr-label'
import ConfirmDialog from '@/components/confirm-dialog'
import { downloadCsv } from '@/lib/export'

const PAGE_SIZE = 50

export default function AssetsPage() {
  // ── Team ──
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamLoading, setTeamLoading] = useState(true)

  // ── Data ──
  const [assets, setAssets] = useState<Asset[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Multi-select ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selectedIds.size === assets.length) { setSelectedIds(new Set()); return }
    setSelectedIds(new Set(assets.map(a => a.id)))
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} asset${selectedIds.size > 1 ? 's' : ''}?`)) return
    for (const id of selectedIds) await deleteAssetDb(id)
    setSelectedIds(new Set())
    await fetchAssets()
  }
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Debounce search input — only fire API call after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // ── Modals ──
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [qrAsset, setQrAsset] = useState<Asset | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)

  // ── Form ──
  const [form, setForm] = useState({ name: '', category: 'laptop', manufacturer: '', model: '', serial_number: '', status: 'active', assigned_to: '', location: '', purchase_date: '', warranty_expires: '', image: '' })
  const [uploading, setUploading] = useState(false)

  // ── Settings (localStorage fallback, overridden by team settings from Supabase) ──
  const localSettings = getSettings()
  const [teamSettings, setTeamSettings] = useState<any>(null)
  const settings = teamSettings || localSettings
  const employeeNames = settings.employees?.map((e: any) => e.name) || []

  // Load team settings from Supabase
  useEffect(() => {
    if (teamId) {
      getTeamSettings(teamId).then(s => { if (s && Object.keys(s).length > 0) setTeamSettings(s) })
    }
  }, [teamId])

  // ── Load team ──
  useEffect(() => {
    (async () => {
      const team = await getTeam()
      setTeamId(team?.id || null)
      setTeamLoading(false)
    })()
  }, [])

  // ── Fetch assets ──
  const fetchAssets = useCallback(async () => {
    if (!teamId) { setAssets([]); setTotal(0); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const result = await queryAssets({
        teamId,
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        sortField: sortField || undefined,
        sortDir: sortField ? sortDir : undefined,
      })
      setAssets(result.data)
      setTotal(result.total)
    } catch (e: any) {
      setError(e?.message || 'Failed to load assets')
    }
    setLoading(false)
  }, [teamId, page, debouncedSearch, sortField, sortDir])

  useEffect(() => {
    if (!teamLoading) fetchAssets()
  }, [fetchAssets, teamLoading])

  // Auto-open create modal from QuickAdd
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('new=true')) {
      setShowForm(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  // ── Sort ──
  function toggleSort(field: string) {
    setPage(1)
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  function sortIcon(field: string) {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30" />
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  // ── CSV import — batch ──
  function makeAsset(data: Record<string, string>): Asset {
    return {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
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

  async function handleCsvImport(rows: Record<string, string>[]) {
    if (!teamId) return
    const limit = await checkPlanLimit('create_asset')
    if (!limit.allowed) { alert(limit.message); return }
    const existingSerials = new Set(assets.filter(a => a.serial_number).map(a => a.serial_number.toLowerCase()))
    const newAssets: Asset[] = []
    let skipped = 0
    for (const r of rows) {
      const asset = makeAsset(r)
      if (asset.serial_number && existingSerials.has(asset.serial_number.toLowerCase())) {
        skipped++
        continue
      }
      if (asset.serial_number) existingSerials.add(asset.serial_number.toLowerCase())
      newAssets.push(asset)
    }
    if (newAssets.length === 0) { alert('All rows are duplicates — nothing imported.'); return }
    const result = await saveAssetsBatch(newAssets, teamId)
    await fetchAssets()
    setShowCsvImport(false)
    if (skipped > 0) alert(`Imported ${result.succeeded} assets. Skipped ${skipped} duplicate${skipped > 1 ? 's' : ''}.`)
  }

  // ── Scan device ──
  async function handleScanImport(data: Record<string, string>) {
    if (!teamId) return
    const limit = await checkPlanLimit('create_asset')
    if (!limit.allowed) { alert(limit.message); return }
    const asset: Asset = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      name: data.name || 'Unknown',
      category: data.category || 'laptop',
      manufacturer: data.manufacturer || '',
      model: data.model || '',
      serial_number: data.serial_number || '',
      status: 'active',
      assigned_to: '',
      location: '',
      purchase_date: null,
      warranty_expires: null,
    }
    await saveAsset(asset, teamId)
    await fetchAssets()
  }

  // ── Create / Edit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!teamId) return

    // Check plan limits for new assets (not edits)
    if (!editing) {
      const limit = await checkPlanLimit('create_asset')
      if (!limit.allowed) { alert(limit.message); return }
    }

    if (editing) {
      await deleteAssetDb(editing.id)
    }
    const newAsset: Asset = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      ...form,
      warranty_expires: form.warranty_expires || null,
      purchase_date: form.purchase_date || null,
    }
    await saveAsset(newAsset, teamId)
    await fetchAssets()
    setShowForm(false)
    setEditing(null)
    if (form.assigned_to.trim()) addEmp(form.assigned_to.trim())
    setForm({ name: '', category: 'laptop', manufacturer: '', model: '', serial_number: '', status: 'active', assigned_to: '', location: '', purchase_date: '', warranty_expires: '', image: '' })
  }

  function startEdit(a: Asset) {
    setEditing(a)
    setForm({
      name: a.name, category: a.category, manufacturer: a.manufacturer || '', model: a.model || '',
      serial_number: a.serial_number || '', status: a.status, assigned_to: a.assigned_to || '',
      location: a.location || '', purchase_date: a.purchase_date || '',
      warranty_expires: a.warranty_expires || '', image: a.image || '',
    })
    setShowForm(true)
  }

  async function handleDelete() {
    if (!deletingAsset) return
    await deleteAssetDb(deletingAsset.id)
    setDeletingAsset(null)
    await fetchAssets()
  }

  // ── Photo upload to Supabase Storage ──
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 2 * 1024 * 1024) { alert('Image too large. Max 2MB. Please resize.'); return }
    setUploading(true)
    const url = await uploadAssetImage(f)
    setUploading(false)
    if (url) {
      setForm({ ...form, image: url })
    } else {
      // Fallback to base64 if storage upload fails
      const reader = new FileReader()
      reader.onload = () => setForm({ ...form, image: reader.result as string })
      reader.readAsDataURL(f)
    }
  }

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const showingStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const showingEnd = Math.min(page * PAGE_SIZE, total)

  // ── Loading state ──
  if (teamLoading) return <div className="p-8 text-slate-500 dark:text-slate-400">Loading...</div>

  // ── No team state ──
  if (!teamId) {
    return (
      <div className="text-center py-20">
        <Package size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No team set up</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create or join a team to start tracking assets.</p>
        <a href="/team" className="inline-block mt-4 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">Go to Team</a>
      </div>
    )
  }

  return (<div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Assets</h1>
      <div className="flex gap-2">
        <button onClick={() => setShowCsvImport(true)} className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"><Upload size={16} />Import CSV</button>
        <button onClick={() => setShowScanner(true)} className="flex items-center gap-2 px-3 py-2 border border-cyan-300 text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950 rounded-md text-sm font-medium hover:bg-cyan-100"><Monitor size={16} />Scan Device</button>
        <button onClick={() => downloadCsv(assets, 'devicelog-assets.csv')} className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"><Download size={16} />Export</button>
        <button onClick={() => { setEditing(null); setShowCsvImport(false); setShowScanner(false); setForm({ name: '', category: 'laptop', manufacturer: '', model: '', serial_number: '', status: 'active', assigned_to: '', location: '', purchase_date: '', warranty_expires: '', image: '' }); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400"><Plus size={16} />Add Asset</button>
      </div>
    </div>

    <div className="mb-4 relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <input
        placeholder="Search by name, person, or serial..."
        value={search}
        onChange={e => handleSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
    </div>

    {/* ── Error state ── */}
    {error && (
      <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm">
        <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
        <span className="text-red-800 flex-1">{error}</span>
        <button onClick={fetchAssets} className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs font-medium hover:bg-red-200">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    )}

    {/* ── Modals ── */}
    {showCsvImport && (
      <CsvImport
        title="Import Assets from CSV"
        description="Upload your existing inventory spreadsheet. We'll try to match columns like name, model, serial, category, assigned_to, etc."
        sampleData={`name,model,serial_number,category,assigned_to,location
MacBook Pro,MBP 14 M3,SN123456,laptop,John Smith,Zurich Office
Dell XPS 15,XPS 9530,SN789012,laptop,Jane Doe,Geneva Office`}
        sampleFilename="inventory.csv"
        onImport={handleCsvImport}
        onClose={() => setShowCsvImport(false)}
      />
    )}

    {showScanner && (
      <ScanDevice
        onImport={handleScanImport}
        onClose={() => setShowScanner(false)}
      />
    )}

    {qrAsset && <QrLabel assetId={qrAsset.id} assetName={qrAsset.name} onClose={() => setQrAsset(null)} />}

    {deletingAsset && (
      <ConfirmDialog
        title={`Delete ${deletingAsset.name}?`}
        message="This permanently removes the asset from your inventory."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingAsset(null)}
      />
    )}

    {/* ── Add / Edit modal ── */}
    {showForm && (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-950 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-auto border border-slate-200 dark:border-slate-800 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Asset' : 'New Asset'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" placeholder="e.g. MacBook Pro 14" /></div>
              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm">{(settings.categories as string[]).map((c: string) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Manufacturer</label><input value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} list="manufacturers" className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" placeholder="Dell / Apple / Lenovo" /><datalist id="manufacturers">{["Apple","Dell","Lenovo","HP","Cisco","Synology","Samsung","Logitech","Ubiquiti","APC","Sony","Raspberry Pi","Google","Microsoft","Intel","AMD","NVIDIA","ASUS","Acer","LG","BenQ","Epson","Brother","Canon","Fujitsu","Panasonic","Toshiba","Supermicro"].map(m => <option key={m} value={m} />)}</datalist></div>
              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Model</label><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Serial Number</label><input value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm">{(settings.statuses as string[]).map((s: string) => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Assigned To</label>
                <EmployeeAutocomplete value={form.assigned_to} onChange={v => setForm({ ...form, assigned_to: v })} options={employeeNames} /></div>
              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" placeholder="Office / room" /></div>
              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Purchase Date</label><input type="date" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Warranty Expires</label><input type="date" value={form.warranty_expires} onChange={e => setForm({ ...form, warranty_expires: e.target.value })} className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm" /></div>
            </div>
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Photo</label>
              {form.image ? (
                <div className="relative inline-block">
                  <img src={form.image} alt="Preview" className="h-24 rounded border border-slate-200 dark:border-slate-800" />
                  <button onClick={() => setForm({ ...form, image: '' })} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:border-cyan-300 hover:text-cyan-600 dark:text-cyan-400">
                  <Camera size={14} /> {uploading ? 'Uploading...' : 'Add photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
              {uploading && <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full animate-pulse w-2/3" /></div>}
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded text-sm font-medium hover:bg-cyan-700 dark:hover:bg-cyan-400">{editing ? 'Save Changes' : 'Add Asset'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* ── Table ── */}
    {loading && assets.length === 0 ? (
      <div className="text-center py-16 text-slate-400 dark:text-slate-500"><RefreshCw size={32} className="mx-auto mb-3 animate-spin opacity-50" /><p className="text-sm">Loading assets...</p></div>
    ) : assets.length === 0 ? (
      <div className="text-center py-16 text-slate-400 dark:text-slate-500">
        <Package size={48} className="mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">{search ? 'No assets match your search' : 'No assets yet'}</p>
        <p className="text-sm mt-1">{search ? 'Try a different search term.' : 'Add manually, import a CSV, or drop a file anywhere on this page.'}</p>
      </div>
    ) : (
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-cyan-50 dark:bg-cyan-950 border-b border-cyan-200 dark:border-cyan-800 text-sm">
            <span className="text-cyan-800 dark:text-cyan-200 font-medium">{selectedIds.size} selected</span>
            <button onClick={bulkDelete} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600">Delete</button>
            <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-600 dark:text-slate-400">Clear</button>
          </div>
        )}
        <div className="max-h-[calc(100vh-260px)] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-b">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" checked={selectedIds.size === assets.length && assets.length > 0} onChange={selectAll} className="rounded border-slate-300" />
                </th>
                {['name', 'category', 'assigned_to', 'status', 'warranty_expires'].map(f => (
                  <th key={f} onClick={() => toggleSort(f)} className="py-3 px-4 font-medium cursor-pointer select-none hover:text-slate-700 dark:text-slate-200">
                    <span className="inline-flex items-center gap-1">
                      {f === 'warranty_expires' ? 'Warranty' : f === 'assigned_to' ? 'Assigned To' : f.charAt(0).toUpperCase() + f.slice(1)}
                      {sortIcon(f)}
                    </span>
                  </th>
                ))}
                <th className="py-3 px-4 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => (
                <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="py-2.5 px-4">
                    <input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)} className="rounded border-slate-300" />
                  </td>
                  <td className="py-2.5 px-4 text-slate-900 dark:text-slate-100 font-medium">
                    <div className="flex items-center gap-2">
                      {a.image ? <img src={a.image} alt="" className="w-8 h-8 rounded object-cover border border-slate-200 dark:border-slate-800" /> : <Package size={16} className="text-slate-300 dark:text-slate-600" />}
                      {a.name}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 capitalize">{a.category}</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{a.assigned_to || '—'}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${a.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : a.status === 'maintenance' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : a.status === 'planned' ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{a.status}</span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{formatDate(a.warranty_expires)}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(a)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Pencil size={14} className="text-slate-400 dark:text-slate-500" /></button>
                      <button onClick={() => setQrAsset(a)} className="p-1 hover:bg-cyan-50 dark:bg-cyan-950 rounded"><QrCode size={14} className="text-cyan-500 dark:text-cyan-400" /></button>
                      <button onClick={() => setDeletingAsset(a)} className="p-1 hover:bg-red-50 dark:bg-red-950 rounded"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-400">
          <span>{total} asset{total !== 1 ? 's' : ''} · Showing {showingStart}–{showingEnd}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded text-sm font-medium ${pageNum === page ? 'bg-cyan-600 dark:bg-cyan-500 text-white' : 'hover:bg-slate-200 text-slate-600 dark:text-slate-400'}`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    )}
  </div>)
}
