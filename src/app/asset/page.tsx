import { Suspense } from 'react'
import AssetPageContent from './content'

export default function AssetPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>}>
    <AssetPageContent />
  </Suspense>
}
