import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { AgentsService } from './agents.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  // ── Agent endpoints ───────────────────────────────────────────

  @Get('agent-listings/browse')
  @Roles('agent')
  browseListings(@Request() req: any) {
    return this.agentsService.getAvailableListings(req.user.id)
  }

  @Post('agent-listings/apply')
  @Roles('agent')
  apply(@Request() req: any, @Body() body: { property_id: string }) {
    return this.agentsService.applyToListing(req.user.id, body.property_id)
  }

  @Get('agent-listings/my-applications')
  @Roles('agent')
  myApplications(@Request() req: any) {
    return this.agentsService.getAgentApplications(req.user.id)
  }

  @Get('commission-deals/my-deals')
  @Roles('agent')
  myDeals(@Request() req: any) {
    return this.agentsService.getDealsForAgent(req.user.id)
  }

  @Put('commission-deals/:id/respond')
  @Roles('agent')
  respondToDeal(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { action: 'accepted' | 'rejected'; counter?: { commission_type?: string; commission_value?: number } },
  ) {
    return this.agentsService.respondToDeal(req.user.id, id, body.action, body.counter)
  }

  @Get('wallet')
  @Roles('agent')
  getWallet(@Request() req: any) {
    return this.agentsService.getWallet(req.user.id)
  }

  @Post('wallet/withdraw')
  @Roles('agent')
  requestWithdraw(@Request() req: any, @Body() body: {
    amount: number
    bank_name: string
    account_number: string
    account_name: string
  }) {
    return this.agentsService.requestWithdraw(req.user.id, body)
  }

  @Get('wallet/withdrawals')
  @Roles('agent')
  myWithdrawals(@Request() req: any) {
    return this.agentsService.getWithdrawRequests(req.user.id)
  }

  // ── Seller endpoints ──────────────────────────────────────────

  @Get('seller/agent-applications')
  @Roles('seller')
  sellerApplications(@Request() req: any, @Query('property_id') propertyId?: string) {
    return this.agentsService.getApplicationsForSeller(req.user.id, propertyId)
  }

  @Put('agent-listings/:id/review')
  @Roles('seller')
  reviewApplication(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { action: 'approved' | 'rejected' },
  ) {
    return this.agentsService.reviewApplication(req.user.id, id, body.action)
  }

  @Post('commission-deals')
  @Roles('seller')
  createDeal(@Request() req: any, @Body() body: {
    property_id: string
    agent_listing_id: string
    commission_type: 'percentage' | 'fixed'
    commission_value: number
    deadline_days: number
  }) {
    return this.agentsService.createDeal(req.user.id, body)
  }

  @Get('seller/commission-deals')
  @Roles('seller')
  sellerDeals(@Request() req: any) {
    return this.agentsService.getDealsForSeller(req.user.id)
  }

  // ── Admin endpoints ───────────────────────────────────────────

  @Get('admin/withdraw-requests')
  @Roles('admin', 'super_admin', 'accounts_admin')
  allWithdrawals() {
    return this.agentsService.getWithdrawRequests()
  }

  @Put('admin/withdraw-requests/:id/review')
  @Roles('admin', 'super_admin', 'accounts_admin')
  approveWithdraw(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { action: 'approved' | 'rejected' },
  ) {
    return this.agentsService.approveWithdraw(req.user.id, id, body.action)
  }
}
