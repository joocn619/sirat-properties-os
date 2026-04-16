'use client'

import { SendHorizonal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface ChatThreadProps {
  chatId: string
  currentUserId: string
  otherUserName: string
  initialMessages: Message[]
}

export function ChatThread({ chatId, currentUserId, otherUserName, initialMessages }: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const unread = initialMessages
      .filter((message) => message.sender_id !== currentUserId && !message.is_read)
      .map((message) => message.id)

    if (unread.length) {
      void supabase.from('messages').update({ is_read: true }).in('id', unread)
    }
  }, [currentUserId, initialMessages, supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload: any) => {
          const message = payload.new as Message

          setMessages((current) => {
            if (current.find((item) => item.id === message.id)) {
              return current
            }
            return [...current, message]
          })

          if (message.sender_id !== currentUserId) {
            void supabase.from('messages').update({ is_read: true }).eq('id', message.id)
          }

          bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [chatId, currentUserId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [])

  async function sendMessage() {
    if (!text.trim() || sending) {
      return
    }

    setSending(true)
    const content = text.trim()
    setText('')
    await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: currentUserId,
      content,
    })
    setSending(false)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div className="dashboard-panel flex h-[calc(100vh-220px)] min-h-[520px] flex-col overflow-hidden rounded-[2rem]">
      <div className="flex items-center gap-3 border-b border-white/8 bg-white/[0.03] px-5 py-4">
        <div className="flex size-11 items-center justify-center rounded-full bg-[var(--color-accent-glow)] font-semibold text-[var(--color-accent)]">
          {otherUserName?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{otherUserName}</p>
          <p className="text-xs text-[var(--color-emerald)]">Conversation active</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.length === 0 ? (
          <div className="dashboard-empty rounded-[1.75rem] px-5 py-12 text-center text-sm">
            No messages yet. Send the first note to start the conversation.
          </div>
        ) : null}

        {messages.map((message) => {
          const isMine = message.sender_id === currentUserId

          return (
            <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] rounded-[1.5rem] px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[70%] ${
                  isMine
                    ? 'rounded-br-md border border-[rgba(201,169,110,0.22)] bg-[linear-gradient(135deg,rgba(201,169,110,0.95),rgba(162,123,63,0.95))] text-[var(--text-inverse)]'
                    : 'rounded-bl-md border border-white/8 bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)]'
                }`}
              >
                <p>{message.content}</p>
                <p className={`mt-2 text-[0.72rem] ${isMine ? 'text-black/65' : 'text-[var(--text-tertiary)]'}`}>
                  {new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  {isMine ? <span className="ml-1">{message.is_read ? 'Seen' : 'Sent'}</span> : null}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/8 bg-white/[0.03] p-3 sm:p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Write a message..."
            className="dashboard-textarea min-h-12 flex-1 resize-none px-4 py-3 text-sm"
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!text.trim() || sending}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-[rgba(201,169,110,0.22)] bg-[var(--gradient-gold)] text-[var(--text-inverse)] shadow-[0_14px_30px_rgba(201,169,110,0.18)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendHorizonal className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
