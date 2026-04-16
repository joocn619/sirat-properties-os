import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { ChatThread } from '@/components/chat/ChatThread'
import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function AgentChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await requireDashboardSession('agent')
  const { supabase, userId } = session

  const { data: chat } = await supabase
    .from('chats')
    .select(`
      id, buyer_id, agent_id,
      properties(title),
      buyer:users!buyer_id(id, profiles(full_name))
    `)
    .eq('id', id)
    .eq('agent_id', userId)
    .single()

  if (!chat) {
    notFound()
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('id, chat_id, sender_id, content, is_read, created_at')
    .eq('chat_id', id)
    .order('created_at', { ascending: true })

  const buyerName = (chat.buyer as any)?.profiles?.full_name ?? 'Buyer'

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Agent chat"
        title={buyerName}
        description={`Conversation about ${(chat.properties as any)?.title ?? 'the connected property'}.`}
        action={
          <Link
            href="/agent/chat"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)] transition hover:border-[rgba(201,169,110,0.22)] hover:text-[var(--color-accent)]"
          >
            <ChevronLeft className="size-4" />
            Back to inbox
          </Link>
        }
      />

      <ChatThread chatId={id} currentUserId={userId} otherUserName={buyerName} initialMessages={messages ?? []} />
    </div>
  )
}
