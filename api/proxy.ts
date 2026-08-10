// Vercel Serverless Function — proxy /api/proxy/* → Supabase
// Runs server-side, no CORS, no header size limits

const SUPABASE = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjg0MDAsImV4cCI6MjA2NDYwNDQwMH0.J-DJ0DIs'

// Rewrite /api/proxy/teams?... → /rest/v1/teams?...
function getPath(url: string | undefined): string {
  const raw = (url || '').split('/api/proxy')[1] || ''
  return '/rest/v1' + raw
}

export default async function handler(req: any, res: any) {
  const path = getPath(req.url)

  const headers: Record<string, string> = { apikey: KEY }
  const auth = req.headers.authorization
  if (auth) headers['Authorization'] = auth
  const ct = req.headers['content-type']
  if (ct) headers['Content-Type'] = ct

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? JSON.stringify(req.body)
    : undefined

  const r = await fetch(SUPABASE + path, { method: req.method, headers, body })
  const data = await r.json()
  res.status(r.status).json(data)
}
