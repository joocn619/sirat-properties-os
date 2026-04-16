import { notFound, redirect } from 'next/navigation'
import { PrintButton } from '@/components/booking/PrintButton'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string; installmentId: string }>
}) {
  const { id: bookingId, installmentId } = await params
  const { supabase, userId } = await requireDashboardSession('buyer')
  const user = { id: userId }

  const { data: inst } = await supabase
    .from('installments')
    .select(`
      *,
      bookings(
        id, booking_type, total_amount, advance_amount, created_at,
        properties(title, location, district, address),
        property_units(unit_number),
        buyer:users!buyer_id(email, profiles(full_name, whatsapp_number))
      )
    `)
    .eq('id', installmentId)
    .single()

  if (!inst) notFound()
  if (inst.status !== 'paid') redirect(`/buyer/bookings/${bookingId}`)

  const booking = inst.bookings as any
  const buyer = booking?.buyer?.profiles
  const property = booking?.properties

  const receiptNo = `REC-${bookingId.slice(0, 6).toUpperCase()}-${inst.installment_number.toString().padStart(3, '0')}`

  return (
    <>
      {/* Print button — screen only */}
      <div className="max-w-2xl mx-auto px-6 pt-6 print:hidden">
        <PrintButton />
      </div>

      {/* Receipt */}
      <div id="receipt-wrapper" className="max-w-2xl mx-auto p-8 print:p-0 print:max-w-none">
        <div className="border rounded-2xl p-8 print:border-0 print:rounded-none bg-white">

          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">সিরাত প্রপার্টিজ</h1>
              <p className="text-sm text-gray-500">Real Estate Operating System</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-800">Payment Receipt</p>
              <p className="text-sm text-gray-500">{receiptNo}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Paid By</p>
              <p className="font-semibold text-gray-900">{buyer?.full_name ?? booking?.buyer?.email}</p>
              {buyer?.whatsapp_number && (
                <p className="text-sm text-gray-600">{buyer.whatsapp_number}</p>
              )}
              <p className="text-sm text-gray-600">{booking?.buyer?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Payment Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(inst.paid_at!).toLocaleDateString('bn-BD', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Booking: {new Date(booking?.created_at).toLocaleDateString('bn-BD')}
              </p>
            </div>
          </div>

          {/* Property info */}
          <div className="bg-gray-50 rounded-xl p-5 mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Property</p>
            <p className="font-semibold text-gray-900">{property?.title}</p>
            {[property?.location, property?.district].filter(Boolean).length > 0 && (
              <p className="text-sm text-gray-600 mt-0.5">
                {[property?.location, property?.district].filter(Boolean).join(', ')}
              </p>
            )}
            {property?.address && (
              <p className="text-sm text-gray-500 mt-0.5">{property.address}</p>
            )}
            {booking?.property_units?.unit_number && (
              <p className="text-sm text-gray-600 mt-1">Unit: {booking.property_units.unit_number}</p>
            )}
          </div>

          {/* Payment breakdown */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Payment Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">মোট Deal পরিমাণ</span>
                <span className="font-medium">৳{Number(booking?.total_amount ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Installment #{inst.installment_number}</span>
                <span className="font-medium">৳{Number(inst.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Due Date ছিল</span>
                <span className="font-medium">
                  {new Date(inst.due_date).toLocaleDateString('bn-BD', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between py-3 bg-green-50 px-3 rounded-lg mt-2">
                <span className="font-bold text-green-800">এই কিস্তিতে পরিশোধ</span>
                <span className="font-bold text-green-800 text-lg">৳{Number(inst.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400">এটি একটি computer-generated receipt।</p>
              <p className="text-xs text-gray-400">সিরাত প্রপার্টিজ Real Estate OS</p>
            </div>
            <div className="text-right">
              <div className="w-32 border-b border-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body > * { display: none; }
          #receipt-wrapper { display: block !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </>
  )
}
