export type DashboardScope = 'buyer' | 'seller' | 'agent' | 'admin'

export interface TopbarNotification {
  id: string
  title: string
  body: string
  type: string
  is_read: boolean
  created_at: string
}

export function titleFromSegment(segment: string) {
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
