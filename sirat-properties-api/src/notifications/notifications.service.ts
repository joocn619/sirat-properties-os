import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class NotificationsService {
  private supabase

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  async create(
    userId: string,
    title: string,
    body: string,
    type: 'booking' | 'commission' | 'kyc' | 'task' | 'general',
    referenceId?: string,
  ) {
    await this.supabase.from('notifications').insert({
      user_id: userId,
      title,
      body,
      type,
      reference_id: referenceId ?? null,
    })
  }
}
