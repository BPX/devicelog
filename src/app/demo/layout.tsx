import type { Metadata } from "next"
import DemoLayoutClient from "./layout-client"

export const metadata: Metadata = {
  title: "Live Demo",
  description: "Explore devicelog's IT asset management dashboard, assets, certifications, and team features. No signup required.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://devicelog.dev/demo" },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoLayoutClient>{children}</DemoLayoutClient>
}
