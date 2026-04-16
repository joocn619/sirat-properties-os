'use client'

import { Camera, MapPinned, MessageSquareText, Phone, UserRound, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters.'),
  whatsapp_number: z
    .string()
    .regex(/^01[3-9]\d{8}$/, 'Use a valid Bangladesh phone number.')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(200, 'Bio must stay under 200 characters.').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export function ProfileSetupForm({ userId, role }: { userId: string; role: string }) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const bioValue = watch('bio') ?? ''

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    toast.success('Photo selected.')
  }

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true)

      let avatar_url: string | undefined

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${userId}/avatar.${ext}`
        await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = data.publicUrl
      }

      const { error } = await supabase.from('profiles').upsert({
        user_id: userId,
        full_name: values.full_name,
        whatsapp_number: values.whatsapp_number || null,
        bio: values.bio || null,
        address: values.address || null,
        ...(avatar_url ? { avatar_url } : {}),
      })

      if (error) throw error

      const dashboardMap: Record<string, string> = {
        buyer: '/buyer/dashboard',
        seller: '/seller/dashboard',
        agent: '/agent/dashboard',
      }

      // Send welcome email (fire-and-forget)
      fetch('/api/auth/welcome', { method: 'POST' }).catch(() => {})

      toast.success('Profile saved. Welcome aboard.')
      router.push(dashboardMap[role] ?? '/buyer/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Profile save failed.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Avatar upload */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => document.getElementById('avatar-input')?.click()}
          className="group relative size-20 shrink-0 overflow-hidden rounded-2xl transition-all duration-300"
          style={{
            background: avatarPreview ? 'transparent' : 'rgba(201,169,110,0.06)',
            border: avatarPreview ? 'none' : '1.5px dashed rgba(201,169,110,0.25)',
            boxShadow: avatarPreview ? '0 0 0 2px rgba(201,169,110,0.3), 0 12px 32px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          {avatarPreview ? (
            <>
              <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                <Camera className="size-5 text-white" />
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1">
              <UserRound className="size-7 text-[var(--color-accent)] opacity-60 transition-opacity group-hover:opacity-100" />
              <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--color-accent)] opacity-60 group-hover:opacity-100">
                Photo
              </span>
            </div>
          )}
        </button>

        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Profile photo</p>
          <p className="mt-0.5 text-xs leading-5 text-[var(--text-tertiary)]">
            Optional — used in chat, listings, and dashboards.
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('avatar-input')?.click()}
            className="mt-2 text-xs font-semibold text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            {avatarPreview ? 'Change photo' : 'Upload photo'}
          </button>
        </div>

        <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

      {/* Full name */}
      <Field label="Full name" required icon={UserRound} error={errors.full_name?.message}>
        <input
          {...register('full_name')}
          placeholder="Enter your full name"
          autoComplete="name"
          className="dashboard-input w-full px-4 py-3 text-sm"
        />
      </Field>

      {/* WhatsApp + Address */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="WhatsApp" icon={Phone} error={errors.whatsapp_number?.message}>
          <input
            {...register('whatsapp_number')}
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
            className="dashboard-input w-full px-4 py-3 text-sm"
          />
        </Field>

        <Field label="Address" icon={MapPinned} error={errors.address?.message}>
          <input
            {...register('address')}
            placeholder="Area, city, or project"
            autoComplete="street-address"
            className="dashboard-input w-full px-4 py-3 text-sm"
          />
        </Field>
      </div>

      {/* Bio */}
      <Field label="Short bio" icon={MessageSquareText} error={errors.bio?.message}>
        <div className="relative">
          <textarea
            {...register('bio')}
            rows={3}
            placeholder="Add a short professional bio for your workspace profile…"
            className="dashboard-textarea w-full resize-none px-4 pb-6 pt-3 text-sm"
          />
          <span className="absolute bottom-2 right-3 text-[10px] text-[var(--text-tertiary)]">
            {bioValue.length}/200
          </span>
        </div>
      </Field>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
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
            <span>Saving profile…</span>
          </>
        ) : (
          <>
            <span>Enter workspace</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  )
}

interface FieldProps {
  children: React.ReactNode
  error?: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  required?: boolean
}

function Field({ children, error, icon: Icon, label, required }: FieldProps) {
  return (
    <div className="space-y-2">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
        <Icon className="size-3.5 text-[var(--color-accent)]" />
        {label}
        {required && <span className="text-[var(--color-rose)]">*</span>}
      </span>
      {children}
      {error && <p className="text-xs text-[var(--color-rose)]">{error}</p>}
    </div>
  )
}
