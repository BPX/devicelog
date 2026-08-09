// Download array of objects as CSV file
export function downloadCsv(rows: Record<string, any>[], filename: string) {
  if (rows.length === 0) return
  const keys = Object.keys(rows[0])
  const header = keys.join(',')
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
