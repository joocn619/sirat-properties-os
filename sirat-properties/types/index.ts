export type UserRole =
  | 'buyer'
  | 'seller'
  | 'agent'
  | 'admin'
  | 'super_admin'
  | 'hr_admin'
  | 'accounts_admin'

export interface User {
  id: string
  email?: string
  phone?: string
  role: UserRole
  is_verified: boolean
  is_blocked: boolean
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  full_name?: string
  avatar_url?: string
  bio?: string
  address?: string
  facebook_url?: string
  linkedin_url?: string
  whatsapp_number?: string
  updated_at: string
}

export interface Property {
  id: string
  seller_id: string
  title: string
  description?: string
  property_type: 'flat' | 'land_share' | 'commercial' | 'duplex' | 'plot'
  listing_type: 'sale' | 'rent' | 'installment'
  price?: number
  area_sqft?: number
  location?: string
  district?: string
  address?: string
  amenities: string[]
  floor_number?: number
  total_floors?: number
  facing?: string
  status: 'available' | 'booked' | 'sold'
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  buyer_id: string
  property_id: string
  unit_id?: string
  booking_type: 'full_payment' | 'installment' | 'rent'
  total_amount?: number
  advance_amount?: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  agent_id?: string
  notes?: string
  created_at: string
}
