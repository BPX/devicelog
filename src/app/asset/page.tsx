import type { Metadata } from "next"
import { Suspense } from 'react'
import AssetPageContent from './content'

export const metadata: Metadata = {
  title: "Asset Details",
  robots: { index: false, follow: false },
}

export default function AssetPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">Loading...</div>}>
    <AssetPageContent />
  </Suspense>
}
