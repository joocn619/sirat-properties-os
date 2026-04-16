'use client'

import Link from 'next/link'
import { ChevronDown, LogOut, ShieldCheck, UserCog2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-hot-toast'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function AccountMenu({
  avatarUrl,
  roleLabel,
  userEmail,
  userName,
}: {
  avatarUrl: string | null
  roleLabel: string
  userEmail: string
  userName: string
}) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const previousTouchAction = document.body.style.touchAction

    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.touchAction = previousTouchAction
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  async function handleLogout() {
    if (signingOut) {
      return
    }

    setSigningOut(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      toast.success('Logged out')
      setOpen(false)
      window.location.replace('/auth/login')
    } catch (error) {
      console.error(error)
      toast.error('Logout failed')
      setSigningOut(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="dashboard-account-chip relative z-[60] flex items-center gap-3 rounded-full px-3 py-2 transition hover:border-[rgba(201,169,110,0.22)]"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open account panel"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={userName} className="size-10 rounded-full object-cover ring-1 ring-white/10" />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-[var(--color-accent-glow)] font-semibold text-[var(--color-accent)]">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden max-w-[180px] min-w-0 text-left sm:block">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{userName}</p>
          <p className="truncate text-xs text-[var(--text-secondary)]">{userEmail}</p>
        </div>
        <ChevronDown className={cn('hidden size-4 text-[var(--text-tertiary)] transition sm:block', open && 'rotate-180')} />
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[1000]">
              <div
                className="absolute inset-0 bg-[rgba(5,7,10,0.82)] backdrop-blur-md"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              <div className="absolute inset-y-0 right-0 flex w-full justify-end pointer-events-none">
                <aside
                  className="pointer-events-auto relative flex h-full w-[min(94vw,380px)] flex-col border-l border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.65)]"
                  style={{ background: '#10131b' }}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Account panel"
                  onClick={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div
                    className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-5"
                    style={{ background: '#121620' }}
                  >
                    <div className="min-w-0">
                      <p className="dashboard-label text-[var(--color-accent)]">{roleLabel}</p>
                      <p className="mt-2 truncate text-lg font-semibold text-[var(--text-primary)]">{userName}</p>
                      <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{userEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dashboard-badge" data-tone="gold">Active</span>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="dashboard-icon-button rounded-2xl p-2"
                        aria-label="Close account panel"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ background: '#10131b' }}>
                    <Link
                      href="/auth/profile-setup"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 rounded-[1.35rem] border border-white/10 px-4 py-4 transition hover:border-[rgba(201,169,110,0.24)]"
                      style={{ background: '#1a1e29' }}
                    >
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--color-accent-glow)] text-[var(--color-accent)]">
                        <UserCog2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[var(--text-primary)]">Profile settings</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                          Update name, avatar, and contact details
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/auth/kyc"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 rounded-[1.35rem] border border-white/10 px-4 py-4 transition hover:border-[rgba(59,130,246,0.24)]"
                      style={{ background: '#1a1e29' }}
                    >
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--color-blue-glow)] text-[var(--color-blue)]">
                        <ShieldCheck className="size-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[var(--text-primary)]">KYC status</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                          Review verification progress and re-upload files
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="border-t border-white/8 p-5" style={{ background: '#11151e' }}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={signingOut}
                      className="flex w-full items-center gap-4 rounded-[1.35rem] border border-[rgba(244,63,94,0.24)] px-4 py-4 text-left transition hover:border-[rgba(244,63,94,0.34)] disabled:opacity-60"
                      style={{ background: '#3a1621' }}
                    >
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[rgba(244,63,94,0.16)] text-[var(--color-rose)]">
                        <LogOut className="size-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[var(--text-primary)]">
                          {signingOut ? 'Logging out...' : 'Logout'}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                          Exit this workspace safely
                        </p>
                      </div>
                    </button>
                  </div>
                </aside>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
