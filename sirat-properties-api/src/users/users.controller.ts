import {
  Controller, Get, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  // Admin: সব user দেখো
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  findAll(@Query('search') search?: string) {
    return this.users.findAll(search)
  }

  // নিজের profile দেখো
  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.users.findOne(user.id)
  }

  // Profile update করো
  @Put('profile')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: {
      full_name?: string
      bio?: string
      address?: string
      whatsapp_number?: string
      facebook_url?: string
      linkedin_url?: string
      avatar_url?: string
    },
  ) {
    return this.users.updateProfile(user.id, dto)
  }

  // Admin: user block করো
  @Put(':id/block')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  block(@Param('id') id: string) {
    return this.users.blockUser(id)
  }

  // Admin: user unblock করো
  @Put(':id/unblock')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  unblock(@Param('id') id: string) {
    return this.users.unblockUser(id)
  }

  // KYC queue (admin)
  @Get('kyc/queue')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  getKycQueue() {
    return this.users.getKycQueue()
  }

  // KYC approve/reject (admin)
  @Put('kyc/:id/review')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  reviewKyc(
    @Param('id') kycId: string,
    @Body('status') status: 'approved' | 'rejected',
    @CurrentUser() reviewer: { id: string },
  ) {
    return this.users.reviewKyc(kycId, reviewer.id, status)
  }
}
