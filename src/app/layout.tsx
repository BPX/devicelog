import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trackstack — Free IT Asset Management Software | Track Laptops, Certs & Licenses",
  description: "Simple IT asset management for small teams. Track laptops, monitors, SSL certificates, and software licenses. Free tier, CSV import, QR labels. No bloat.",
  manifest: "/manifest.json",
  keywords: ["IT asset management", "asset tracking", "IT inventory", "certificate tracking", "warranty tracking", "software license management"],
  openGraph: {
    title: "Trackstack — Simple IT Asset Management",
    description: "Track your company's laptops, monitors, SSL certs, and software licenses. Free for small teams.",
    url: "https://trackstack.dev",
    siteName: "Trackstack",
    type: "website",
    images: [{ url: "https://trackstack.dev/og-image.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trackstack — Simple IT Asset Management",
    description: "Track your company's laptops, monitors, SSL certs, and software licenses. Free for small teams.",
    images: ["https://trackstack.dev/og-image.svg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://trackstack.dev" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply dark class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('trackstack-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')})()`,
          }}
        />
        <link rel="dns-prefetch" href="https://mbsjxuymiuevankxrgmo.supabase.co" />
        <link rel="preconnect" href="https://mbsjxuymiuevankxrgmo.supabase.co" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0891b2" />
        <meta name="color-scheme" content="dark light" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Trackstack",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "Simple IT asset management for small teams. Track laptops, monitors, SSL certificates, and software licenses.",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free tier with up to 50 assets" },
              "url": "https://trackstack.dev",
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
