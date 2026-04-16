import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin', 'accounts_admin')
export class AccountsController {
  constructor(private accounts: AccountsService) {}

  @Get('expenses')
  getExpenses(
    @Query('category') category?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) { return this.accounts.getExpenses(category, from, to) }

  @Post('expenses')
  addExpense(@CurrentUser() user: { id: string }, @Body() dto: any) {
    return this.accounts.addExpense(user.id, dto)
  }

  @Get('ledger')
  getLedger(@Query('from') from?: string, @Query('to') to?: string) {
    return this.accounts.getLedger(from, to)
  }

  @Post('ledger')
  addLedgerEntry(@CurrentUser() user: { id: string }, @Body() dto: any) {
    return this.accounts.addLedgerEntry(user.id, dto)
  }

  @Get('commissions')
  getPendingCommissions() { return this.accounts.getPendingCommissions() }

  @Put('commissions/:id/release')
  releaseCommission(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.accounts.releaseCommission(id, user.id)
  }

  @Get('summary')
  getSummary(@Query('month') month: string) {
    return this.accounts.getMonthlySummary(month)
  }
}
