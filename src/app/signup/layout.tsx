import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your free devicelog account. Unlimited assets, unlimited team members, QR labels, SSL cert monitoring. No credit card required.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://devicelog.dev/signup" },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
