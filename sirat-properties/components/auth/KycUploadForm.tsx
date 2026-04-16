'use client'

import { ArrowRight, CheckCircle2, FileBadge2, Landmark, SkipForward, UploadCloud } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

const DOC_TYPES = [
  { value: 'nid', label: 'National ID', note: 'Best for individual sellers and agents.', icon: Landmark },
  { value: 'trade_license', label: 'Trade License', note: 'Use this for company or developer verification.', icon: FileBadge2 },
  { value: 'passport', label: 'Passport', note: 'Accepted for cross-border identity verification.', icon: CheckCircle2 },
]

const DASHBOARD_MAP: Record<string, string> = {
  seller: '/seller/dashboard',
  agent: '/agent/dashboard',
  buyer: '/buyer/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/admin/dashboard',
}

export function KycUploadForm({ userId: _, userRole }: { userId: string; userRole: string }) {
  const [docType, setDocType] = useState('nid')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!file) {
      const message = 'Select a verification file before submitting.'
      setError(message)
      toast.error(message)
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      const message = 'File size must stay under 5 MB.'
      setError(message)
      toast.error(message)
      return
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      const message = 'Upload JPG, PNG, WEBP, or PDF only.'
      setError(message)
      toast.error(message)
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('docType', docType)

    const res = await fetch('/api/kyc/upload', { method: 'POST', body: formData })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const message = data.error ?? 'Upload failed. Please try again.'
      setError(message)
      toast.error(message)
      setLoading(false)
      return
    }

    toast.success('Verification uploaded successfully.')

    const dashboardMap: Record<string, string> = {
      seller: '/seller/dashboard',
      agent: '/agent/dashboard',
      buyer: '/buyer/dashboard',
      admin: '/admin/dashboard',
      super_admin: '/admin/dashboard',
    }

    router.push(DASHBOARD_MAP[data.role] ?? '/buyer/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <p className="dashboard-label">Document type</p>
        <div className="grid gap-3">
          {DOC_TYPES.map((documentType) => {
            const Icon = documentType.icon
            const active = docType === documentType.value

            return (
              <label
                key={documentType.value}
                data-selected={active}
                className="auth-option flex cursor-pointer items-start gap-4 rounded-[1.5rem] p-4"
              >
                <input
                  type="radio"
                  name="docType"
                  value={documentType.value}
                  checked={active}
                  onChange={() => setDocType(documentType.value)}
                  className="sr-only"
                />
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(201,169,110,0.14)] text-[var(--color-accent)]">
                  <Icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{documentType.label}</p>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">{documentType.note}</p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="dashboard-label">Upload file</p>
        <button
          type="button"
          onClick={() => document.getElementById('kyc-file')?.click()}
          className={`w-full rounded-[1.75rem] border border-dashed px-5 py-8 text-left transition ${
            file
              ? 'border-[rgba(201,169,110,0.28)] bg-[rgba(201,169,110,0.08)]'
              : 'border-white/10 bg-white/[0.03] hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05]'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-[rgba(201,169,110,0.14)] text-[var(--color-accent)]">
              <UploadCloud className="size-6" />
            </div>
            {file ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{file.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{(file.size / 1024 / 1024).toFixed(2)} MB uploaded</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Select a file to upload</p>
                <p className="text-xs text-[var(--text-secondary)]">JPG, PNG, WEBP, or PDF up to 5 MB.</p>
              </div>
            )}
          </div>
          <input
            id="kyc-file"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
            onChange={(event) => {
              setError('')
              setFile(event.target.files?.[0] ?? null)
              if (event.target.files?.[0]) {
                toast.success('Document ready to submit.')
              }
            }}
          />
        </button>
      </div>

      {error ? (
        <p className="rounded-2xl border border-[rgba(244,63,94,0.22)] bg-[rgba(244,63,94,0.12)] px-4 py-3 text-sm text-[var(--color-rose)]">
          {error}
        </p>
      ) : null}

      <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
        <p className="dashboard-label text-[var(--color-accent)]">Review window</p>
        <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
          Verified files usually clear in 1-2 business days. Once approved, your workspace unlocks publishing and deal
          actions automatically.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !file}
        className="group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #C9A96E 0%, #B8954F 40%, #D4AF7A 100%)',
          boxShadow: '0 8px 32px rgba(201,169,110,0.28), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          color: '#1a1208',
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.18)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-full"
          aria-hidden
        />
        {loading ? (
          <>
            <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Uploading…</span>
          </>
        ) : (
          <>
            <span>Submit verification</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      {/* Skip */}
      <button
        type="button"
        onClick={() => router.push(DASHBOARD_MAP[userRole] ?? '/buyer/dashboard')}
        className="flex w-full items-center justify-center gap-2 py-2 text-sm text-[var(--text-tertiary)] transition hover:text-[var(--text-secondary)]"
      >
        <SkipForward className="size-3.5" />
        Skip for now — I&apos;ll verify later
      </button>
    </form>
  )
}
