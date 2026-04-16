import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private supabase

  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    })

    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  async validate(payload: { sub: string; email: string }) {
    const { data: user } = await this.supabase
      .from('users')
      .select('id, email, role, is_verified, is_blocked')
      .eq('id', payload.sub)
      .single()

    if (!user) throw new UnauthorizedException('User not found')
    if (user.is_blocked) throw new UnauthorizedException('Account blocked')

    return user
  }
}
