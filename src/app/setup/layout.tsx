import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Set Up Your Team",
  robots: { index: false, follow: false },
}

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
