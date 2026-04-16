import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class AgentsService {
  private supabase: SupabaseClient

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.get<string>('SUPABASE_URL')!,
      config.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  // ── Agent Apply ──────────────────────────────────────────────

  async applyToListing(agentId: string, propertyId: string) {
    const { data: existing } = await this.supabase
      .from('agent_listings')
      .select('id, status')
      .eq('agent_id', agentId)
      .eq('property_id', propertyId)
      .single()

    if (existing) throw new BadRequestException('Already applied to this listing')

    const { data, error } = await this.supabase
      .from('agent_listings')
      .insert({ agent_id: agentId, property_id: propertyId, status: 'pending' })
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }

  async getAgentApplications(agentId: string) {
    const { data } = await this.supabase
      .from('agent_listings')
      .select(`
        *,
        properties(id, title, location, district, property_type, listing_type, price,
          property_images(url, is_primary))
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
    return data ?? []
  }

  // ── Seller: Manage Agent Applications ────────────────────────

  async getApplicationsForSeller(sellerId: string, propertyId?: string) {
    let query = this.supabase
      .from('agent_listings')
      .select(`
        *,
        properties!inner(id, title, seller_id),
        agents:users!agent_id(id, email, profiles(full_name, avatar_url, whatsapp_number),
          kyc_documents(status))
      `)
      .eq('properties.seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (propertyId) query = query.eq('property_id', propertyId)

    const { data } = await query
    return data ?? []
  }

  async reviewApplication(
    sellerId: string,
    applicationId: string,
    action: 'approved' | 'rejected',
  ) {
    const { data: app } = await this.supabase
      .from('agent_listings')
      .select('*, properties(seller_id)')
      .eq('id', applicationId)
      .single()

    if (!app) throw new NotFoundException('Application not found')
    if ((app.properties as any)?.seller_id !== sellerId)
      throw new ForbiddenException('Not your property')

    const { data, error } = await this.supabase
      .from('agent_listings')
      .update({ status: action })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)

    // Notify agent
    await this.supabase.from('notifications').insert({
      user_id: app.agent_id,
      title: action === 'approved' ? 'Application Approved ✅' : 'Application Rejected',
      body: action === 'approved'
        ? 'আপনার agent application অনুমোদিত হয়েছে।'
        : 'আপনার agent application প্রত্যাখ্যান করা হয়েছে।',
      type: 'commission',
      reference_id: applicationId,
    })

    return data
  }

  // ── Commission Deals ──────────────────────────────────────────

  async createDeal(sellerId: string, dto: {
    property_id: string
    agent_listing_id: string
    commission_type: 'percentage' | 'fixed'
    commission_value: number
    deadline_days: number
  }) {
    const { data: app } = await this.supabase
      .from('agent_listings')
      .select('*, properties(seller_id)')
      .eq('id', dto.agent_listing_id)
      .single()

    if (!app) throw new NotFoundException('Application not found')
    if ((app.properties as any)?.seller_id !== sellerId)
      throw new ForbiddenException('Not your property')
    if (app.status !== 'approved')
      throw new BadRequestException('Agent must be approved first')

    const deadline = new Date()
    deadline.setDate(deadline.getDate() + dto.deadline_days)

    const { data, error } = await this.supabase
      .from('commission_deals')
      .insert({
        property_id: dto.property_id,
        agent_listing_id: dto.agent_listing_id,
        seller_id: sellerId,
        agent_id: app.agent_id,
        commission_type: dto.commission_type,
        commission_value: dto.commission_value,
        deadline: deadline.toISOString().split('T')[0],
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)

    // Notify agent about new deal
    await this.supabase.from('notifications').insert({
      user_id: app.agent_id,
      title: 'নতুন Commission Deal 💰',
      body: 'একটি নতুন commission deal offer পাওয়া গেছে। দেখুন এবং সিদ্ধান্ত নিন।',
      type: 'commission',
      reference_id: data.id,
    })

    return data
  }

  async getDealsForAgent(agentId: string) {
    const { data } = await this.supabase
      .from('commission_deals')
      .select(`
        *,
        properties(id, title, location, district, price),
        seller:users!seller_id(email, profiles(full_name))
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
    return data ?? []
  }

  async getDealsForSeller(sellerId: string) {
    const { data } = await this.supabase
      .from('commission_deals')
      .select(`
        *,
        properties(id, title),
        agent:users!agent_id(email, profiles(full_name, avatar_url))
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
    return data ?? []
  }

  async respondToDeal(
    agentId: string,
    dealId: string,
    action: 'accepted' | 'rejected',
    counter?: { commission_type?: string; commission_value?: number },
  ) {
    const { data: deal } = await this.supabase
      .from('commission_deals')
      .select('agent_id, seller_id')
      .eq('id', dealId)
      .single()

    if (!deal) throw new NotFoundException('Deal not found')
    if (deal.agent_id !== agentId) throw new ForbiddenException()

    const update: Record<string, unknown> = { status: action }
    if (action === 'rejected' && counter) {
      update.counter_type = counter.commission_type
      update.counter_value = counter.commission_value
      update.status = 'countered'
    }

    const { data, error } = await this.supabase
      .from('commission_deals')
      .update(update)
      .eq('id', dealId)
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)

    // Notify seller about agent response
    await this.supabase.from('notifications').insert({
      user_id: deal.seller_id,
      title: action === 'accepted' ? 'Deal Accepted ✅' : 'Deal Countered / Rejected',
      body: action === 'accepted'
        ? 'Agent আপনার commission deal accept করেছেন।'
        : 'Agent আপনার commission deal-এ counter করেছেন।',
      type: 'commission',
      reference_id: dealId,
    })

    return data
  }

  // ── Wallet ────────────────────────────────────────────────────

  async getWallet(agentId: string) {
    const { data: txns } = await this.supabase
      .from('wallet_transactions')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })

    const balance = (txns ?? []).reduce((sum: number, t: any) => {
      return t.type === 'credit' ? sum + Number(t.amount) : sum - Number(t.amount)
    }, 0)

    return { balance, transactions: txns ?? [] }
  }

  async requestWithdraw(agentId: string, dto: {
    amount: number
    bank_name: string
    account_number: string
    account_name: string
  }) {
    const { balance } = await this.getWallet(agentId)
    if (dto.amount > balance) throw new BadRequestException('Insufficient balance')

    const { data, error } = await this.supabase
      .from('withdraw_requests')
      .insert({ agent_id: agentId, ...dto, status: 'pending' })
      .select()
      .single()

    if (error) throw new BadRequestException(error.message)
    return data
  }

  async getWithdrawRequests(agentId?: string) {
    let query = this.supabase
      .from('withdraw_requests')
      .select('*, agent:users!agent_id(email, profiles(full_name))')
      .order('created_at', { ascending: false })

    if (agentId) query = query.eq('agent_id', agentId)

    const { data } = await query
    return data ?? []
  }

  async approveWithdraw(adminId: string, requestId: string, action: 'approved' | 'rejected') {
    const { data: req } = await this.supabase
      .from('withdraw_requests')
      .select('agent_id, amount, status')
      .eq('id', requestId)
      .single()

    if (!req) throw new NotFoundException('Request not found')
    if (req.status !== 'pending') throw new BadRequestException('Already processed')

    await this.supabase
      .from('withdraw_requests')
      .update({ status: action, reviewed_by: adminId })
      .eq('id', requestId)

    if (action === 'approved') {
      await this.supabase.from('wallet_transactions').insert({
        agent_id: req.agent_id,
        type: 'debit',
        amount: req.amount,
        description: 'Withdrawal approved',
        reference_id: requestId,
      })
    }

    return { success: true }
  }

  // ── Browse available listings (for agents) ────────────────────

  async getAvailableListings(agentId: string) {
    const { data: applied } = await this.supabase
      .from('agent_listings')
      .select('property_id')
      .eq('agent_id', agentId)

    const appliedIds = (applied ?? []).map((a: any) => a.property_id)

    let query = this.supabase
      .from('properties')
      .select(`
        id, title, property_type, listing_type, price, location, district,
        property_images(url, is_primary),
        users!seller_id(profiles(full_name))
      `)
      .eq('is_published', true)
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (appliedIds.length > 0) {
      query = query.not('id', 'in', `(${appliedIds.join(',')})`)
    }

    const { data } = await query
    return data ?? []
  }
}
