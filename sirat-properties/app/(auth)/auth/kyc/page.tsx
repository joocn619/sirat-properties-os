import { redirect } from 'next/navigation'

import { AuthShell } from '@/components/auth/AuthShell'
import { KycUploadForm } from '@/components/auth/KycUploadForm'
import { createClient } from '@/lib/supabase/server'

export default async function KycPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()

  if (!dbUser) {
    redirect('/auth/role')
  }

  if (dbUser.role === 'buyer') {
    redirect('/auth/profile-setup')
  }

  const { data: existingKyc } = await supabase.from('kyc_documents').select('id, status').eq('user_id', user.id).single()

  if (existingKyc) {
    redirect('/auth/profile-setup')
  }

  return (
    <AuthShell
      eyebrow="Verification"
      heading="Upload documents to unlock publishing and deal flow."
      description="Seller and agent workspaces require identity verification before listings, offers, and commission actions become fully active."
      step="Step 3 / KYC"
      stepNumber={3}
    >
      <KycUploadForm userId={user.id} userRole={dbUser.role} />
    </AuthShell>
  )
}
