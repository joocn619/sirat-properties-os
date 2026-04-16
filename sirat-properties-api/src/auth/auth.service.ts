import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class AuthService {
  private supabase

  constructor(
    private config: ConfigService,
    private jwt: JwtService,
  ) {
    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  // Supabase access token verify করে আমাদের JWT issue করো
  async verifyAndIssueToken(supabaseAccessToken: string) {
    const { data: { user }, error } = await this.supabase.auth.getUser(supabaseAccessToken)

    if (error || !user) throw new UnauthorizedException('Invalid Supabase token')

    const { data: dbUser } = await this.supabase
      .from('users')
      .select('id, role, is_blocked')
      .eq('id', user.id)
      .single()

    if (!dbUser) throw new UnauthorizedException('User not found')
    if (dbUser.is_blocked) throw new UnauthorizedException('Account blocked')

    const token = this.jwt.sign(
      { sub: dbUser.id, email: user.email, role: dbUser.role },
      { expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '7d' },
    )

    return { access_token: token, role: dbUser.role }
  }

  async getProfile(userId: string) {
    const { data } = await this.supabase
      .from('users')
      .select('id, email, role, is_verified, profiles(*)')
      .eq('id', userId)
      .single()

    return data
  }
}
