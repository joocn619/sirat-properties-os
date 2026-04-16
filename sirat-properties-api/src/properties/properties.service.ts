import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class PropertiesService {
  private supabase

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  async create(sellerId: string, dto: {
    title: string
    description?: string
    property_type: string
    listing_type: string
    price?: number
    area_sqft?: number
    location?: string
    district?: string
    address?: string
    amenities?: string[]
    floor_number?: number
    total_floors?: number
    facing?: string
  }) {
    const { data, error } = await this.supabase
      .from('properties')
      .insert({ seller_id: sellerId, ...dto, status: 'available', is_published: false })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async findAll(filters: {
    location?: string
    district?: string
    property_type?: string
    listing_type?: string
    min_price?: number
    max_price?: number
    min_area?: number
    max_area?: number
    amenities?: string[]
    is_featured?: boolean
    page?: number
    limit?: number
  }) {
    const page = filters.page ?? 1
    const limit = Math.min(filters.limit ?? 20, 50)
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = this.supabase
      .from('properties')
      .select(`
        id, title, description, property_type, listing_type,
        price, area_sqft, location, district, address, amenities,
        floor_number, total_floors, facing, status, is_featured,
        created_at,
        property_images(url, is_primary),
        agents:agent_listings(
          agents(user_id, profiles(full_name, avatar_url, whatsapp_number))
        )
      `, { count: 'exact' })
      .eq('is_published', true)
      .eq('status', 'available')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filters.location) query = query.ilike('location', `%${filters.location}%`)
    if (filters.district) query = query.eq('district', filters.district)
    if (filters.property_type) query = query.eq('property_type', filters.property_type)
    if (filters.listing_type) query = query.eq('listing_type', filters.listing_type)
    if (filters.min_price) query = query.gte('price', filters.min_price)
    if (filters.max_price) query = query.lte('price', filters.max_price)
    if (filters.min_area) query = query.gte('area_sqft', filters.min_area)
    if (filters.max_area) query = query.lte('area_sqft', filters.max_area)
    if (filters.is_featured) query = query.eq('is_featured', true)
    if (filters.amenities?.length) {
      query = query.contains('amenities', filters.amenities)
    }

    const { data, count } = await query
    return { data: data ?? [], total: count ?? 0, page, limit }
  }

  async findOne(id: string) {
    const { data } = await this.supabase
      .from('properties')
      .select(`
        *,
        property_images(*),
        property_units(*),
        seller:users!seller_id(
          id, email,
          profiles(full_name, avatar_url, whatsapp_number)
        ),
        agent_listings(
          status,
          agents(
            user_id,
            profiles(full_name, avatar_url, whatsapp_number)
          ),
          commission_deals(commission_type, commission_value, status)
        )
      `)
      .eq('id', id)
      .single()

    if (!data) throw new NotFoundException('Property not found')
    return data
  }

  async findBySeller(sellerId: string) {
    const { data } = await this.supabase
      .from('properties')
      .select(`
        *,
        property_images(url, is_primary),
        property_units(id, status)
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    return data ?? []
  }

  async update(id: string, sellerId: string, dto: Partial<{
    title: string
    description: string
    price: number
    area_sqft: number
    location: string
    district: string
    address: string
    amenities: string[]
    floor_number: number
    total_floors: number
    facing: string
    property_type: string
    listing_type: string
  }>) {
    const { data: prop } = await this.supabase
      .from('properties')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (!prop) throw new NotFoundException('Property not found')
    if (prop.seller_id !== sellerId) throw new ForbiddenException('Not your property')

    const { data } = await this.supabase
      .from('properties')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    return data
  }

  async publish(id: string, sellerId: string) {
    // Seller KYC verified কিনা check
    const { data: user } = await this.supabase
      .from('users')
      .select('is_verified')
      .eq('id', sellerId)
      .single()

    if (!user?.is_verified) {
      throw new ForbiddenException('KYC verify না হওয়া পর্যন্ত publish করা যাবে না')
    }

    const { data } = await this.supabase
      .from('properties')
      .update({ is_published: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('seller_id', sellerId)
      .select()
      .single()

    return data
  }

  async unpublish(id: string, sellerId: string) {
    const { data } = await this.supabase
      .from('properties')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('seller_id', sellerId)
      .select()
      .single()

    return data
  }

  async remove(id: string, sellerId: string) {
    const { data: prop } = await this.supabase
      .from('properties')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (!prop) throw new NotFoundException('Property not found')
    if (prop.seller_id !== sellerId) throw new ForbiddenException('Not your property')

    await this.supabase.from('properties').delete().eq('id', id)
    return { success: true }
  }

  // Images
  async addImage(propertyId: string, sellerId: string, dto: {
    url: string
    is_primary?: boolean
    media_type?: string
  }) {
    const { data: prop } = await this.supabase
      .from('properties')
      .select('seller_id')
      .eq('id', propertyId)
      .single()

    if (prop?.seller_id !== sellerId) throw new ForbiddenException()

    if (dto.is_primary) {
      await this.supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId)
    }

    const { data } = await this.supabase
      .from('property_images')
      .insert({ property_id: propertyId, ...dto })
      .select()
      .single()

    return data
  }

  async removeImage(imageId: string, sellerId: string) {
    const { data: img } = await this.supabase
      .from('property_images')
      .select('property_id')
      .eq('id', imageId)
      .single()

    if (!img) throw new NotFoundException()

    const { data: prop } = await this.supabase
      .from('properties')
      .select('seller_id')
      .eq('id', img.property_id)
      .single()

    if (prop?.seller_id !== sellerId) throw new ForbiddenException()

    await this.supabase.from('property_images').delete().eq('id', imageId)
    return { success: true }
  }

  // Units
  async getUnits(propertyId: string) {
    const { data } = await this.supabase
      .from('property_units')
      .select('*')
      .eq('property_id', propertyId)
      .order('floor')
      .order('unit_number')

    return data ?? []
  }

  async addUnit(propertyId: string, sellerId: string, dto: {
    unit_number: string
    floor?: number
    area_sqft?: number
    price?: number
  }) {
    const { data: prop } = await this.supabase
      .from('properties')
      .select('seller_id')
      .eq('id', propertyId)
      .single()

    if (prop?.seller_id !== sellerId) throw new ForbiddenException()

    const { data } = await this.supabase
      .from('property_units')
      .insert({ property_id: propertyId, ...dto })
      .select()
      .single()

    return data
  }

  async updateUnit(unitId: string, sellerId: string, dto: {
    status?: string
    price?: number
    area_sqft?: number
  }) {
    const { data: unit } = await this.supabase
      .from('property_units')
      .select('property_id')
      .eq('id', unitId)
      .single()

    if (!unit) throw new NotFoundException()

    const { data: prop } = await this.supabase
      .from('properties')
      .select('seller_id')
      .eq('id', unit.property_id)
      .single()

    if (prop?.seller_id !== sellerId) throw new ForbiddenException()

    const { data } = await this.supabase
      .from('property_units')
      .update(dto)
      .eq('id', unitId)
      .select()
      .single()

    return data
  }

  async getInventoryStats(propertyId: string) {
    const { data: units } = await this.supabase
      .from('property_units')
      .select('status')
      .eq('property_id', propertyId)

    const total = units?.length ?? 0
    const sold = units?.filter((u) => u.status === 'sold').length ?? 0
    const booked = units?.filter((u) => u.status === 'booked').length ?? 0
    const available = units?.filter((u) => u.status === 'available').length ?? 0

    return { total, sold, booked, available }
  }
}
