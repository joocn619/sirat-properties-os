import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PrintButton } from '@/components/booking/PrintButton'

export default async function AppointmentLetterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: emp } = await supabase
    .from('employees')
    .select('*, users(email, profiles(full_name, address))')
    .eq('id', id)
    .single()

  if (!emp) notFound()

  const name = (emp.users as any)?.profiles?.full_name ?? 'Employee'
  const address = (emp.users as any)?.profiles?.address ?? ''
  const joinDate = new Date(emp.join_date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold text-gray-900">Appointment Letter</h1>
        <PrintButton />
      </div>

      <div id="receipt-wrapper" className="bg-white border rounded-xl p-10 text-sm leading-relaxed font-serif">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">সিরাত প্রপার্টিজ</h1>
          <p className="text-gray-500 text-xs mt-1">Real Estate OS — Human Resources</p>
          <div className="w-24 h-0.5 bg-gray-300 mx-auto mt-4" />
        </div>

        <p className="text-right text-gray-500 mb-6">তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p className="mb-1 font-semibold">প্রিয় {name},</p>
        {address && <p className="text-gray-600 mb-4">{address}</p>}

        <p className="mb-4">
          আমরা আপনাকে সিরাত প্রপার্টিজ-এ <strong>{emp.designation}</strong> পদে নিয়োগ দিতে পেরে অত্যন্ত আনন্দিত।
          আপনার নিয়োগ নিম্নলিখিত শর্তে কার্যকর হবে:
        </p>

        <table className="w-full border-collapse mb-6">
          <tbody>
            {[
              ['Employee ID', emp.employee_id],
              ['পদ', emp.designation],
              ['বিভাগ', emp.department],
              ['যোগদানের তারিখ', joinDate],
              ['মূল বেতন', `৳${Number(emp.base_salary).toLocaleString()} প্রতি মাস`],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-600 w-40">{label}</td>
                <td className="py-2 font-medium text-gray-900">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-4 text-gray-600">
          আপনার কর্মদক্ষতা ও আচরণ কোম্পানির নিয়ম-নীতি ও SOP অনুযায়ী মূল্যায়ন করা হবে।
          যেকোনো সমস্যায় HR বিভাগের সাথে যোগাযোগ করুন।
        </p>

        <p className="text-gray-700 mb-8">
          আপনার সুস্বাস্থ্য ও সাফল্য কামনা করি।
        </p>

        <div className="mt-12 flex justify-between">
          <div>
            <div className="w-40 h-0.5 bg-gray-400" />
            <p className="text-xs text-gray-500 mt-1">কর্মীর স্বাক্ষর</p>
          </div>
          <div className="text-right">
            <div className="w-40 h-0.5 bg-gray-400 ml-auto" />
            <p className="text-xs text-gray-500 mt-1">কর্তৃপক্ষের স্বাক্ষর</p>
            <p className="text-xs text-gray-400">সিরাত প্রপার্টিজ</p>
          </div>
        </div>
      </div>
    </div>
  )
}
