export function formatCurrency(value: number | null | undefined) {
  if (!value && value !== 0) {
    return 'Negotiable'
  }

  return `BDT ${Number(value).toLocaleString('en-US')}`
}
