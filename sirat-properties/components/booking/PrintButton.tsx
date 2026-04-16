'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
    >
      🖨️ Print / PDF হিসেবে Save করুন
    </button>
  )
}
