// Download array of objects as CSV file (skips 'id' field)
export function downloadCsv(rows: Record<string, any>[], filename: string) {
  if (rows.length === 0) return
  const skip = ['id']
  const keys = Object.keys(rows[0]).filter(k => !skip.includes(k))
  const labels: Record<string, string> = { name:'Name', category:'Category', manufacturer:'Manufacturer', model:'Model', serial_number:'Serial Number', status:'Status', assigned_to:'Assigned To', location:'Location', purchase_date:'Purchase Date', warranty_expires:'Warranty Expires', type:'Type', issuer:'Issuer', expires_at:'Expires', devices:'Devices' }
  const header = keys.map(k => labels[k] || k).join(',')
  const body = rows.map(r => keys.map(k => {
    const v = (r[k] ?? '').toString()
    return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g,'""')}"` : v
  }).join(','))
  const csv = [header, ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
