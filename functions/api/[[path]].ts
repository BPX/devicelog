// Cloudflare Pages Function — proxies /api/* to Supabase
// Fixes CORS by making all requests same-origin
export async function onRequest(context: any) {
  const { request } = context
  const url = new URL(request.url)
  
  // Strip /api prefix, forward to Supabase REST
  const supabaseUrl = 'https://mbsjxuymiuevankxrgmo.supabase.co'
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2p4dXltaXVldmFua3hyZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcwOTQsImV4cCI6MjEwMTkzMzA5NH0.TUV0c2eIYkr00MTuzCiC84D9fThHeGEiMIvm4090DIs'

  // Build Supabase URL — preserve query params
  const path = url.pathname.replace(/^\/api/, '/rest/v1') + url.search
  
  // Forward request with original headers + apikey
  const headers = new Headers(request.headers)
  headers.set('apikey', apiKey)
  
  const response = await fetch(supabaseUrl + path, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined
  })
  
  // Return Supabase response as-is
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  })
}
