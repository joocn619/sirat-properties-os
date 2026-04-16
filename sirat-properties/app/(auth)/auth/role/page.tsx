import { redirect } from 'next/navigation'

import { AuthShell } from '@/components/auth/AuthShell'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { createClient } from '@/lib/supabase/server'

export default async function RolePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: existingUser } = await supabase.from('users').select('role').eq('id', user.id).single()

  // Only skip role selection for admin roles — regular users always confirm their role here
  const adminRoles = ['admin', 'super_admin', 'hr_admin', 'accounts_admin']
  if (existingUser?.role && adminRoles.includes(existingUser.role)) {
    redirect('/admin/dashboard')
  }

  return (
    <AuthShell
      eyebrow="Role setup"
      heading="Choose the workspace that fits your next move."
      description="Your role shapes the tools, dashboards, and actions you see first. Pick carefully before entering the main product."
      step="Step 2 / Role"
      stepNumber={2}
    >
      <RoleSelector userId={user.id} userEmail={user.email} />
    </AuthShell>
  )
}
