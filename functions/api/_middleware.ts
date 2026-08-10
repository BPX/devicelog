// Cloudflare Pages Function — proxy /api/* to Supabase
export async function onRequest(context: any) {
  const url = new URL(context.request.url)
  const SUPABASE = 'https://mbsjxuymiuevankxrgmo.supabase.co'
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcwOTQsImV4cCI6MjEwMTkzMzA5NH0.TUV0c2eIYkr00MTuzCiC84D9fThHeGEiMIvm4090DIs'

  const path = url.pathname.replace('/api', '/rest/v1') + url.search
  
  const headers = new Headers(context.request.headers)
  headers.set('apikey', KEY)
  
  const body = context.request.method !== 'GET' && context.request.method !== 'HEAD' 
    ? await context.request.text() 
    : undefined

  const res = await fetch(SUPABASE + path, { method: context.request.method, headers, body })
  return new Response(res.body, { status: res.status, headers: res.headers })
}
