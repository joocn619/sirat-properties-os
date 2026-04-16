import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const POLICIES = [
  {
    title: 'KYC Verification Policy',
    body: `• সব buyer, seller ও agent-এর KYC জমা দেওয়া বাধ্যতামূলক।
• NID, Passport অথবা Trade License গ্রহণযোগ্য।
• KYC review সময়সীমা: ২৪–৪৮ ঘণ্টা।
• Rejected KYC-এর ক্ষেত্রে user-কে পুনরায় submit করতে বলুন।
• Verified ব্যবহারকারীরাই property publish করতে পারবেন।`,
  },
  {
    title: 'Property Listing SOP',
    body: `• Seller-কে অবশ্যই verified হতে হবে।
• Property description সত্য ও সম্পূর্ণ হতে হবে।
• কমপক্ষে ১টি property image আপলোড করতে হবে।
• Misleading তথ্য দিলে listing suspend করা হবে।
• Admin যেকোনো listing অপ্রকাশিত করার অধিকার রাখে।`,
  },
  {
    title: 'Agent Commission Policy',
    body: `• Commission deal seller ও agent উভয়ের সম্মতিতে চূড়ান্ত হয়।
• Commission হয় percentage (%) অথবা fixed amount হতে পারে।
• Commission release করবে Accounts Admin।
• Release-এর আগে agent wallet-এ credit হবে না।
• কোনো বিরোধে Admin-এর সিদ্ধান্তই চূড়ান্ত।`,
  },
  {
    title: 'Booking & Payment Policy',
    body: `• Booking confirm হলে unit status "booked" হয়ে যায়।
• Installment payment সময়মতো করতে হবে।
• Overdue installment-এর ক্ষেত্রে seller মামলা করতে পারবে।
• Booking cancel করলে advance amount ফেরত নাও পাওয়া যেতে পারে।
• সব receipt সিস্টেমে সংরক্ষিত থাকবে।`,
  },
  {
    title: 'Data Privacy Policy',
    body: `• ব্যবহারকারীর ব্যক্তিগত তথ্য তৃতীয় পক্ষের সাথে share করা হবে না।
• KYC document শুধুমাত্র Admin দেখতে পারবে।
• সব লেনদেন encrypted ও secured।
• যেকোনো ডেটা সংক্রান্ত অভিযোগের জন্য Admin-কে জানান।`,
  },
]

export default async function SopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin', 'hr_admin', 'accounts_admin'].includes(dbUser.role)) redirect('/auth/login')

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SOP & Policy</h1>
        <p className="text-sm text-gray-500 mt-1">সিরাত প্রপার্টিজ অপারেশন নীতিমালা</p>
      </div>

      <div className="space-y-6">
        {POLICIES.map((policy, i) => (
          <div key={i} className="bg-white border rounded-xl p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {policy.title}
            </h2>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {policy.body}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-400 text-center">
        এই নীতিমালা সর্বশেষ আপডেট: ২০২৬ — সিরাত প্রপার্টিজ কর্তৃপক্ষ
      </div>
    </div>
  )
}
