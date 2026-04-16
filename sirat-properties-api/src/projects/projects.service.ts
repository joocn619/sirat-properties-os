import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class ProjectsService {
  private supabase: SupabaseClient

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.get<string>('SUPABASE_URL')!,
      config.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  // ── Projects ──────────────────────────────────────────────────

  async createProject(sellerId: string, dto: {
    property_id: string
    name: string
    slug: string
    description?: string
    start_date?: string
    expected_end_date?: string
  }) {
    const { data: prop } = await this.supabase
      .from('properties')
      .select('seller_id')
      .eq('id', dto.property_id)
      .single()

    if (!prop || prop.seller_id !== sellerId)
      throw new ForbiddenException('Not your property')

    const { data: existing } = await this.supabase
      .from('projects')
      .select('id')
      .eq('slug', dto.slug)
      .single()

    if (existing) throw new BadRequestException('Slug already taken')

    const { data, error } = await this.supabase
      .from('projects')
      .insert({ seller_id: sellerId, ...dto })
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }

  async getSellerProjects(sellerId: string) {
    const { data } = await this.supabase
      .from('projects')
      .select(`
        *,
        properties(id, title, location, district, property_images(url, is_primary)),
        project_updates(id),
        landing_pages(id, is_published, custom_slug)
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
    return data ?? []
  }

  async updateProject(sellerId: string, projectId: string, dto: {
    name?: string
    description?: string
    current_progress?: number
    status?: string
    expected_end_date?: string
  }) {
    const { data: proj } = await this.supabase
      .from('projects')
      .select('seller_id')
      .eq('id', projectId)
      .single()

    if (!proj) throw new NotFoundException()
    if (proj.seller_id !== sellerId) throw new ForbiddenException()

    const { data, error } = await this.supabase
      .from('projects')
      .update(dto)
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }

  // ── Project Updates ───────────────────────────────────────────

  async postUpdate(sellerId: string, projectId: string, dto: {
    title: string
    description: string
    update_type: 'progress' | 'announcement' | 'milestone'
    media_urls?: string[]
  }) {
    const { data: proj } = await this.supabase
      .from('projects')
      .select('seller_id')
      .eq('id', projectId)
      .single()

    if (!proj) throw new NotFoundException('Project not found')
    if (proj.seller_id !== sellerId) throw new ForbiddenException()

    const { data, error } = await this.supabase
      .from('project_updates')
      .insert({
        project_id: projectId,
        posted_by: sellerId,
        ...dto,
        media_urls: dto.media_urls ?? [],
      })
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }

  async getUpdates(projectId: string) {
    const { data } = await this.supabase
      .from('project_updates')
      .select('*, poster:users!posted_by(profiles(full_name, avatar_url))')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    return data ?? []
  }

  async deleteUpdate(sellerId: string, updateId: string) {
    const { data: upd } = await this.supabase
      .from('project_updates')
      .select('posted_by')
      .eq('id', updateId)
      .single()

    if (!upd) throw new NotFoundException()
    if (upd.posted_by !== sellerId) throw new ForbiddenException()

    await this.supabase.from('project_updates').delete().eq('id', updateId)
    return { success: true }
  }

  // ── Landing Pages ─────────────────────────────────────────────

  async upsertLandingPage(sellerId: string, projectId: string, dto: {
    sections: object[]
    custom_slug?: string
  }) {
    const { data: proj } = await this.supabase
      .from('projects')
      .select('seller_id')
      .eq('id', projectId)
      .single()

    if (!proj) throw new NotFoundException()
    if (proj.seller_id !== sellerId) throw new ForbiddenException()

    if (dto.custom_slug) {
      const { data: taken } = await this.supabase
        .from('landing_pages')
        .select('id, project_id')
        .eq('custom_slug', dto.custom_slug)
        .single()
      if (taken && taken.project_id !== projectId)
        throw new BadRequestException('Slug already taken')
    }

    const { data: existing } = await this.supabase
      .from('landing_pages')
      .select('id')
      .eq('project_id', projectId)
      .single()

    if (existing) {
      const { data, error } = await this.supabase
        .from('landing_pages')
        .update({ sections: dto.sections, custom_slug: dto.custom_slug, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw new BadRequestException(error.message)
      return data
    }

    const { data, error } = await this.supabase
      .from('landing_pages')
      .insert({ project_id: projectId, sections: dto.sections, custom_slug: dto.custom_slug })
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }

  async publishLandingPage(sellerId: string, projectId: string, publish: boolean) {
    const { data: proj } = await this.supabase
      .from('projects')
      .select('seller_id')
      .eq('id', projectId)
      .single()

    if (!proj) throw new NotFoundException()
    if (proj.seller_id !== sellerId) throw new ForbiddenException()

    const { data, error } = await this.supabase
      .from('landing_pages')
      .update({ is_published: publish })
      .eq('project_id', projectId)
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }

  async getPublicPage(slug: string) {
    const { data } = await this.supabase
      .from('landing_pages')
      .select(`
        *,
        projects(
          id, name, description, current_progress, status, slug,
          properties(title, location, district, price, property_images(url, is_primary)),
          project_updates(id, title, description, update_type, media_urls, created_at)
        )
      `)
      .eq('custom_slug', slug)
      .eq('is_published', true)
      .single()

    if (!data) throw new NotFoundException('Page not found or not published')
    return data
  }

  async getBuyerProjectFeed(buyerId: string) {
    const { data: bookings } = await this.supabase
      .from('bookings')
      .select('property_id')
      .eq('buyer_id', buyerId)
      .in('status', ['confirmed', 'completed'])

    if (!bookings?.length) return []

    const propertyIds = bookings.map((b: any) => b.property_id)

    const { data } = await this.supabase
      .from('projects')
      .select(`
        id, name, slug, current_progress, status,
        properties(title, location, property_images(url, is_primary)),
        project_updates(id, title, description, update_type, media_urls, created_at)
      `)
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false })

    return data ?? []
  }
}
