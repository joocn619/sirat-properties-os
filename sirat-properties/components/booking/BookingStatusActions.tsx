'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'

interface Props {
  bookingId: string
  role: 'buyer' | 'seller'
}

export function BookingStatusActions({ bookingId, role }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function updateStatus(status: string) {
    setLoading(status)
    const response = await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      toast.error(data.error ?? 'Booking status update failed')
      setLoading(null)
      return
    }

    toast.success(`Booking updated to ${status}`)
    router.refresh()
    setLoading(null)
  }

  if (role === 'seller') {
    return (
      <div className="flex gap-3">
        <Button
          onClick={() => updateStatus('confirmed')}
          disabled={!!loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading === 'confirmed' ? '...' : '✓ Confirm করুন'}
        </Button>
        <Button
          onClick={() => updateStatus('cancelled')}
          disabled={!!loading}
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          {loading === 'cancelled' ? '...' : '✕ Cancel করুন'}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Button
        onClick={() => updateStatus('cancelled')}
        disabled={!!loading}
        variant="outline"
        className="text-red-600 border-red-300 hover:bg-red-50"
        size="sm"
      >
        {loading === 'cancelled' ? '...' : 'Booking Cancel করুন'}
      </Button>
    </div>
  )
}
