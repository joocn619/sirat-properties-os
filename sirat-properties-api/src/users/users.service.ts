import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class UsersService {
  private supabase

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  async findAll(search?: string) {
    let query = this.supabase
      .from('users')
      .select('id, email, phone, role, is_verified, is_blocked, created_at, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`email.ilike.%${search}%,profiles.full_name.ilike.%${search}%`)
    }

    const { data } = await query
    return data ?? []
  }

  async findOne(id: string) {
    const { data } = await this.supabase
      .from('users')
      .select('*, profiles(*)')
      .eq('id', id)
      .single()

    if (!data) throw new NotFoundException('User not found')
    return data
  }

  async blockUser(id: string) {
    const { data } = await this.supabase
      .from('users')
      .update({ is_blocked: true })
      .eq('id', id)
      .select()
      .single()
    return data
  }

  async unblockUser(id: string) {
    const { data } = await this.supabase
      .from('users')
      .update({ is_blocked: false })
      .eq('id', id)
      .select()
      .single()
    return data
  }

  async updateProfile(userId: string, dto: {
    full_name?: string
    bio?: string
    address?: string
    whatsapp_number?: string
    facebook_url?: string
    linkedin_url?: string
    avatar_url?: string
  }) {
    const { data } = await this.supabase
      .from('profiles')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()
    return data
  }

  // KYC endpoints
  async submitKyc(userId: string, dto: { doc_type: string; doc_url: string }) {
    const { data } = await this.supabase
      .from('kyc_documents')
      .insert({ user_id: userId, ...dto })
      .select()
      .single()
    return data
  }

  async getKycQueue() {
    const { data } = await this.supabase
      .from('kyc_documents')
      .select('*, users(email, profiles(full_name))')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    return data ?? []
  }

  async reviewKyc(kycId: string, reviewerId: string, status: 'approved' | 'rejected') {
    const { data } = await this.supabase
      .from('kyc_documents')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', kycId)
      .select()
      .single()

    // Approved হলে user verified করো
    if (status === 'approved' && data) {
      await this.supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', data.user_id)
    }

    // KYC notification পাঠাও
    if (data) {
      await this.supabase.from('notifications').insert({
        user_id: data.user_id,
        title: status === 'approved' ? 'KYC Approved ✅' : 'KYC Rejected',
        body: status === 'approved'
          ? 'আপনার KYC অনুমোদিত হয়েছে। এখন আপনি সব সুবিধা ব্যবহার করতে পারবেন।'
          : 'আপনার KYC প্রত্যাখ্যান করা হয়েছে। পুনরায় আবেদন করুন।',
        type: 'kyc',
        reference_id: kycId,
      })
    }

    return data
  }
}
