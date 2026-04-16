import Link from 'next/link'
import { MessageSquare, Search } from 'lucide-react'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function BuyerChatListPage() {
  const session = await requireDashboardSession('buyer')
  const { supabase, userId } = session

  const { data: chats } = await supabase
    .from('chats')
    .select(`
      id, created_at,
      properties(title, location),
      agent:users!agent_id(id, profiles(full_name, avatar_url)),
      messages(id, content, is_read, sender_id, created_at)
    `)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })

  const chatList = (chats ?? []).map((chat: any) => {
    const messages: any[] = chat.messages ?? []
    const lastMessage = messages.sort(
      (first: any, second: any) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
    )[0]
    const unread = messages.filter((message: any) => !message.is_read && message.sender_id !== userId).length
    return { ...chat, lastMessage, unread }
  })

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Buyer inbox"
        title="Conversations with agents"
        description="Every inquiry now sits inside the redesigned dark chat list so you can jump from messages to bookings without losing context."
        action={
          <Link
            href="/buyer/search"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,169,110,0.22)] bg-[var(--gradient-gold)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-inverse)]"
          >
            <Search className="size-4" />
            Search listings
          </Link>
        }
      />

      {chatList.length === 0 ? (
        <div className="dashboard-empty rounded-[2rem] px-6 py-16 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-[var(--color-accent)]">
            <MessageSquare className="size-7" />
          </div>
          <p className="mt-5 text-base font-semibold text-[var(--text-primary)]">No chats yet</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Start from property search and open a chat with an agent when you are ready.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chatList.map((chat: any) => {
            const agentName = chat.agent?.profiles?.full_name ?? 'Agent'
            return (
              <Link
                key={chat.id}
                href={`/buyer/chat/${chat.id}`}
                className="dashboard-panel block rounded-[1.75rem] p-5 transition hover:border-[rgba(201,169,110,0.22)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-glow)] font-semibold text-[var(--color-accent)]">
                    {agentName[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{agentName}</p>
                        <p className="truncate text-sm text-[var(--text-secondary)]">{chat.properties?.title ?? 'Property conversation'}</p>
                      </div>
                      {chat.unread > 0 ? (
                        <span className="dashboard-badge" data-tone="blue">
                          {chat.unread} new
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 truncate text-sm text-[var(--text-tertiary)]">
                      {chat.lastMessage?.content ?? 'No messages yet.'}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
