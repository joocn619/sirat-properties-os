import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Frontend থেকে Supabase token পাঠালে আমাদের JWT দেবো
  @Post('token')
  async exchangeToken(@Body('access_token') accessToken: string) {
    return this.authService.verifyAndIssueToken(accessToken)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: { id: string }) {
    return this.authService.getProfile(user.id)
  }
}
