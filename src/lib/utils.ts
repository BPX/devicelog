import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) { return clsx(inputs) }

export function formatDate(date: string | Date | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function daysUntil(date: string | Date): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}
