import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KycQueueClient } from '@/components/admin/KycQueueClient'

export default async function AdminKycPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin'].includes(dbUser.role)) redirect('/auth/login')

  const { data: pendingKyc } = await supabase
    .from('kyc_documents')
    .select('*, users(email, profiles(full_name))')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-[var(--text-primary)]">KYC Approval Queue</h1>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          Pending: <span className="font-semibold text-[var(--color-accent)]">{pendingKyc?.length ?? 0}</span>
        </p>
      </div>
      <KycQueueClient initialDocs={(pendingKyc as any) ?? []} />
    </>
  )
}
