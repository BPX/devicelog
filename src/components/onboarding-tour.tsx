'use client'
import { useState, useEffect, useCallback } from 'react'
import Joyride, { CallBackProps, Step, STATUS } from 'react-joyride'
import { usePathname } from 'next/navigation'

const STORAGE_KEY = 'devicelog-onboarding-done'

const steps: Record<string, Step[]> = {
  '/dashboard': [
    {
      target: 'body',
      placement: 'center',
      title: 'Welcome to devicelog 👋',
      content: 'Here\'s a quick tour to get you started. Your IT asset tracking journey begins here.',
      disableBeacon: true,
    },
    {
      target: '.stat-cards',
      title: 'Your Dashboard',
      content: 'These cards show your IT inventory at a glance — total assets, team members, active certifications, and what needs attention.',
      placement: 'bottom',
    },
    {
      target: '.quick-add-button',
      title: 'Quick Add',
      content: 'Add assets, certifications, or team members from anywhere with Quick Add. Your most-used action, always one click away.',
      placement: 'left',
    },
    {
      target: '.sidebar-nav',
      title: 'Navigation',
      content: 'Switch between Assets, Certifications, Employees, Team, and Settings here.',
      placement: 'right',
    },
  ],
  '/assets': [
    {
      target: '.asset-table',
      title: 'Assets Table',
      content: 'All your laptops, monitors, phones, and servers live here. Click column headers to sort. Use the search bar to filter.',
      placement: 'top',
    },
    {
      target: '.add-asset-btn',
      title: 'Add Your First Asset',
      content: 'Click here to add an asset manually. You can fill in name, category, serial number, assigned person, warranty dates, and upload a photo.',
      placement: 'bottom',
    },
  ],
  '/certificates': [
    {
      target: '.cert-table',
      title: 'Certifications',
      content: 'Track SSL certs, software licenses, and support contracts here. Items expiring within 30 days show in amber — expired ones in red.',
      placement: 'top',
    },
  ],
  '/employees': [
    {
      target: '.employee-table',
      title: 'Team Members',
      content: 'Manage your team here. Each employee\'s device count is shown — red means they have no assigned devices.',
      placement: 'top',
    },
  ],
}

const joyrideStyles = {
  options: {
    primaryColor: '#0891b2',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    arrowColor: '#ffffff',
    zIndex: 1000,
  },
  tooltipContainer: { textAlign: 'left' as const },
  buttonNext: { fontSize: '13px', fontWeight: 600, borderRadius: '6px', padding: '6px 14px' },
  buttonBack: { fontSize: '13px', color: '#64748b', marginRight: 8 },
  buttonSkip: { fontSize: '13px', color: '#94a3b8' },
}

export default function OnboardingTour() {
  const pathname = usePathname()
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (done) return
    // Start tour on dashboard, or show page-specific tour
    if (steps[pathname]) {
      setRun(true)
      setStepIndex(0)
    }
  }, [pathname])

  const handleCallback = useCallback((data: CallBackProps) => {
    const { status, action, index, type } = data

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false)
      localStorage.setItem(STORAGE_KEY, '1')
    }
  }, [])

  if (!steps[pathname]) return null

  return (
    <Joyride
      steps={steps[pathname]}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      disableOverlayClose
      disableScrolling={false}
      spotlightClicks
      callback={handleCallback}
      styles={joyrideStyles}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Got it',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  )
}
