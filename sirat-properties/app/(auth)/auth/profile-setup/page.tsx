import { redirect } from 'next/navigation'

import { AuthShell } from '@/components/auth/AuthShell'
import { ProfileSetupForm } from '@/components/auth/ProfileSetupForm'
import { createClient } from '@/lib/supabase/server'

export default async function ProfileSetupPage() {
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

  return (
    <AuthShell
      eyebrow="Profile"
      heading="Finish the profile details your workspace needs."
      description="Add identity, contact, and short bio details so listings, chats, notifications, and internal operations stay consistent from day one."
      step="Step 4 / Profile"
      stepNumber={4}
    >
      <ProfileSetupForm userId={user.id} role={dbUser.role} />
    </AuthShell>
  )
}
