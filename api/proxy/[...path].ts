// Vercel Serverless Function — proxy /api/proxy/TOKEN/path → Supabase
// Token in URL avoids Vercel edge header-too-large (494)
// Catches: /api/proxy/<jwt_token>/<rest_path>

const SUPABASE = 'https://mbsjxuymiuevankxrgmo.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjg0MDAsImV4cCI6MjA2NDYwNDQwMH0.J-DJ0DIs'

export default async function handler(req: any, res: any) {
  // URL: /api/proxy/<token>/teams?select=...
  // Split: ["", "api", "proxy", "<token>", "teams?select=..."]
  const parts = (req.url || '').split('/')
  const proxyIdx = parts.indexOf('proxy')
  
  if (proxyIdx === -1 || parts.length <= proxyIdx + 2) {
    return res.status(400).json({ error: 'missing token or path' })
  }

  const token = parts[proxyIdx + 1]
  const restPath = '/' + parts.slice(proxyIdx + 2).join('/')

  const headers: Record<string, string> = { apikey: KEY }
  if (token && token !== 'anon') headers['Authorization'] = 'Bearer ' + token
  const ct = req.headers['content-type']
  if (ct) headers['Content-Type'] = ct

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? JSON.stringify(req.body)
    : undefined

  const r = await fetch(SUPABASE + '/rest/v1' + restPath, { method: req.method, headers, body })
  const data = await r.json()
  res.status(r.status).json(data)
}
