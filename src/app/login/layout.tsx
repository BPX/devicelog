import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your devicelog account to manage your IT assets, certifications, and team.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://devicelog.dev/login" },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
