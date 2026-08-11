'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react'

const STORAGE_KEY = 'devicelog-onboarding-done'

interface TourStep {
  title: string
  content: string
  cta?: string
  ctaHref?: string
}

const dashboardSteps: TourStep[] = [
  { title: 'Welcome to devicelog 👋', content: 'Your simple IT asset tracker. Track laptops, certs, and licenses — no spreadsheets needed. This quick tour shows you around.' },
  { title: 'Dashboard Cards', content: 'These cards show your IT inventory at a glance — total assets, employees, active certifications, and what needs attention.' },
  { title: 'Quick Add', content: 'Add assets, certifications, or team members from anywhere. Your most-used action, always one click away — look for the cyan button in the sidebar.' },
  { title: 'Navigate', content: 'Use the sidebar to switch between Assets, Certifications, Employees, Team, and Settings.' },
  { title: "You're all set!", content: 'Start by adding your first asset or importing a CSV. Need help? Check GitHub Issues for support.', cta: 'Go to Assets', ctaHref: '/assets' },
]

export default function OnboardingTour() {
  const pathname = usePathname()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    if (pathname === '/dashboard') {
      setVisible(true)
      setStep(0)
    }
  }, [pathname])

  if (!visible || pathname !== '/dashboard') return null

  const s = dashboardSteps[step]
  const isLast = step === dashboardSteps.length - 1

  function next() {
    if (isLast) { dismiss(); return }
    setStep(step + 1)
  }

  function dismiss() {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  return (
    <div className="fixed inset-0 z-[99] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={dismiss} />

      {/* Card */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-4">
          {dashboardSteps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? 'bg-cyan-500 w-6' : 'bg-slate-200 dark:bg-slate-700 w-3'}`} />
          ))}
        </div>

        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{s.title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{s.content}</p>

        <div className="flex items-center justify-between">
          <button onClick={dismiss} className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1">
            <X size={14} /> Skip
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <ArrowLeft size={14} /> Back
              </button>
            )}
            {s.cta ? (
              <button onClick={() => { dismiss(); router.push(s.ctaHref!) }} className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400">
                {s.cta} <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={next} className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400">
                {isLast ? <><Check size={14} /> Done</> : <>Next <ArrowRight size={14} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
