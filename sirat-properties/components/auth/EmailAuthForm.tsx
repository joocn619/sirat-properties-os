'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup'

export function EmailAuthForm() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(err.message === 'Invalid login credentials'
          ? 'Wrong email or password. Please try again.'
          : err.message)
        setLoading(false)
        return
      }
      // Hard redirect so cookies are sent with the new request
      window.location.href = '/auth/role'
    } else {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      setSuccess('Account created! Check your email and click the confirmation link to activate your account.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1">
        {(['signin', 'signup'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(''); setSuccess('') }}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold uppercase tracking-widest transition ${
              mode === m
                ? 'bg-[var(--color-accent)] text-[#0A0A0F]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {m === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-[rgba(244,63,94,0.22)] bg-[rgba(244,63,94,0.08)] px-4 py-3 text-sm text-[var(--color-rose,#f43f5e)]">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-[rgba(16,185,129,0.22)] bg-[rgba(16,185,129,0.08)] px-4 py-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#10b981]" />
          <p className="text-sm text-[#10b981]">{success}</p>
        </div>
      )}

      {/* Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className="h-12 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[rgba(201,169,110,0.4)] focus:bg-white/[0.06]"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Password'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="h-12 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-11 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[rgba(201,169,110,0.4)] focus:bg-white/[0.06]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] transition hover:text-[var(--text-secondary)]"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.06] text-sm font-semibold text-[var(--text-primary)] transition hover:bg-white/[0.1] disabled:opacity-50"
          >
            {loading
              ? <><Loader2 className="size-4 animate-spin" /> Processing…</>
              : mode === 'signin' ? 'Sign In with Email' : 'Create Account'
            }
          </button>

          {mode === 'signin' && (
            <p className="text-center text-xs text-[var(--text-tertiary)]">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => setMode('signup')} className="text-[var(--color-accent)] hover:underline">
                Sign up free
              </button>
            </p>
          )}
        </form>
      )}
    </div>
  )
}
