'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle, ExternalLink, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface KycDoc {
  id: string
  user_id: string
  doc_type: string
  doc_url: string
  status: string
  created_at: string
  users: {
    email: string
    profiles: { full_name: string } | null
  }
}

const DOC_LABELS: Record<string, string> = {
  nid: 'National ID',
  trade_license: 'Trade License',
  passport: 'Passport',
}

export function KycQueueClient({ initialDocs }: { initialDocs: KycDoc[] }) {
  const [docs, setDocs] = useState(initialDocs)
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  async function handleReview(doc: KycDoc, status: 'approved' | 'rejected') {
    setLoading(doc.id)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('kyc_documents')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', doc.id)

    if (status === 'approved') {
      await supabase.from('users').update({ is_verified: true }).eq('id', doc.user_id)
    }

    // Send notification
    try {
      await supabase.from('notifications').insert({
        user_id: doc.user_id,
        title: status === 'approved' ? 'KYC Approved' : 'KYC Rejected',
        body: status === 'approved'
          ? 'Your identity verification has been approved. You can now publish listings.'
          : 'Your identity verification was not approved. Please re-upload a valid document.',
        type: 'kyc',
      })
    } catch { /* non-critical */ }

    // Send email (via API route to access server-side Resend)
    fetch('/api/kyc/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: doc.user_id,
        status,
        userName: doc.users?.profiles?.full_name ?? 'User',
        email: doc.users?.email,
      }),
    }).catch(() => {})

    setDocs((prev) => prev.filter((d) => d.id !== doc.id))
    setLoading(null)
    toast.success(status === 'approved' ? 'KYC approved' : 'KYC rejected')
  }

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
        <CheckCircle2 className="size-10 text-[#10b981]" />
        <p className="text-sm text-[var(--text-tertiary)]">No pending KYC documents</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <div key={doc.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(201,169,110,0.08)]">
                <FileText className="size-4 text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {doc.users?.profiles?.full_name ?? 'N/A'}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">{doc.users?.email}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {DOC_LABELS[doc.doc_type] ?? doc.doc_type}
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--text-tertiary)]">
                  {new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <a
              href={doc.doc_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
            >
              View <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={loading === doc.id}
              onClick={() => handleReview(doc, 'approved')}
              className="flex items-center gap-1.5 rounded-xl bg-[rgba(16,185,129,0.1)] px-4 py-2 text-xs font-semibold text-[#10b981] ring-1 ring-[rgba(16,185,129,0.2)] transition hover:bg-[rgba(16,185,129,0.15)] disabled:opacity-50"
            >
              <CheckCircle2 className="size-3.5" />
              {loading === doc.id ? '…' : 'Approve'}
            </button>
            <button
              type="button"
              disabled={loading === doc.id}
              onClick={() => handleReview(doc, 'rejected')}
              className="flex items-center gap-1.5 rounded-xl bg-[rgba(244,63,94,0.08)] px-4 py-2 text-xs font-semibold text-[#f43f5e] ring-1 ring-[rgba(244,63,94,0.15)] transition hover:bg-[rgba(244,63,94,0.12)] disabled:opacity-50"
            >
              <XCircle className="size-3.5" />
              {loading === doc.id ? '…' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
