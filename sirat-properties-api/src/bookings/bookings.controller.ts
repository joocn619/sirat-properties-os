import {
  Controller, Get, Post, Put, Body, Param, UseGuards,
} from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private svc: BookingsService) {}

  // Buyer: booking তৈরি
  @Post()
  @UseGuards(RolesGuard)
  @Roles('buyer')
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: {
      property_id: string
      unit_id?: string
      booking_type: 'full_payment' | 'installment' | 'rent'
      total_amount: number
      advance_amount?: number
      installment_count?: number
      installment_interval_days?: number
      notes?: string
    },
  ) {
    return this.svc.create(user.id, dto)
  }

  // Buyer: নিজের bookings
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('buyer')
  myBookings(@CurrentUser() user: { id: string }) {
    return this.svc.findByBuyer(user.id)
  }

  // Seller: নিজের property-র bookings
  @Get('seller')
  @UseGuards(RolesGuard)
  @Roles('seller')
  sellerBookings(@CurrentUser() user: { id: string }) {
    return this.svc.findBySeller(user.id)
  }

  // Single booking
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.findOne(id)
  }

  // Status update
  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'confirmed' | 'cancelled' | 'completed',
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.updateStatus(id, status, user.id)
  }

  // Installments
  @Get(':id/installments')
  getInstallments(@Param('id') id: string) {
    return this.svc.getInstallments(id)
  }

  @Put('installments/:installmentId/pay')
  markPaid(
    @Param('installmentId') installmentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.markInstallmentPaid(installmentId, user.id)
  }

  @Get('installments/:installmentId/receipt')
  getReceipt(
    @Param('installmentId') installmentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.getReceipt(installmentId, user.id)
  }
}
