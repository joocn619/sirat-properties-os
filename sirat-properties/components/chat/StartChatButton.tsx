'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function StartChatButton({
  buyerId,
  agentId,
  propertyId,
}: {
  buyerId: string
  agentId: string
  propertyId: string
}) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function startChat() {
    setLoading(true)

    // Check existing chat
    const { data: existing } = await supabase
      .from('chats')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('agent_id', agentId)
      .eq('property_id', propertyId)
      .single()

    if (existing) {
      router.push(`/buyer/chat/${existing.id}`)
      return
    }

    // Create new chat
    const { data: created } = await supabase
      .from('chats')
      .insert({ buyer_id: buyerId, agent_id: agentId, property_id: propertyId })
      .select('id')
      .single()

    if (created) {
      router.push(`/buyer/chat/${created.id}`)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={startChat}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
    >
      💬 {loading ? 'Loading...' : 'Chat করুন'}
    </button>
  )
}
