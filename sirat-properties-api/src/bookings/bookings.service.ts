import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class BookingsService {
  private supabase

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  async create(buyerId: string, dto: {
    property_id: string
    unit_id?: string
    booking_type: 'full_payment' | 'installment' | 'rent'
    total_amount: number
    advance_amount?: number
    installment_count?: number   // কত কিস্তি
    installment_interval_days?: number  // কত দিন পর পর (default 30)
    notes?: string
  }) {
    // Property available কিনা check
    const { data: property } = await this.supabase
      .from('properties')
      .select('id, status, seller_id')
      .eq('id', dto.property_id)
      .single()

    if (!property) throw new NotFoundException('Property not found')
    if (property.status === 'sold') throw new BadRequestException('Property already sold')

    // Unit check (if provided)
    if (dto.unit_id) {
      const { data: unit } = await this.supabase
        .from('property_units')
        .select('status')
        .eq('id', dto.unit_id)
        .single()

      if (!unit) throw new NotFoundException('Unit not found')
      if (unit.status !== 'available') throw new BadRequestException('Unit is not available')
    }

    // Booking তৈরি
    const { data: booking, error } = await this.supabase
      .from('bookings')
      .insert({
        buyer_id: buyerId,
        property_id: dto.property_id,
        unit_id: dto.unit_id ?? null,
        booking_type: dto.booking_type,
        total_amount: dto.total_amount,
        advance_amount: dto.advance_amount ?? null,
        status: 'pending',
        notes: dto.notes ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Unit status → booked
    if (dto.unit_id) {
      await this.supabase
        .from('property_units')
        .update({ status: 'booked', booked_by: buyerId })
        .eq('id', dto.unit_id)
    }

    // Installment schedule auto-generate
    if (dto.booking_type === 'installment' && dto.installment_count) {
      await this.generateInstallmentSchedule(
        booking.id,
        dto.total_amount,
        dto.advance_amount ?? 0,
        dto.installment_count,
        dto.installment_interval_days ?? 30,
      )
    }

    // Seller-কে notification
    await this.supabase.from('notifications').insert({
      user_id: property.seller_id,
      title: 'নতুন Booking Request',
      body: 'একটি property-তে নতুন booking request এসেছে।',
      type: 'booking',
      reference_id: booking.id,
    })

    return booking
  }

  private async generateInstallmentSchedule(
    bookingId: string,
    totalAmount: number,
    advanceAmount: number,
    count: number,
    intervalDays: number,
  ) {
    const remaining = totalAmount - advanceAmount
    const perInstallment = Math.ceil(remaining / count)
    const installments: { booking_id: string; installment_number: number; due_date: string; amount: number; status: string }[] = []

    let dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + intervalDays)

    for (let i = 1; i <= count; i++) {
      const isLast = i === count
      const amount = isLast
        ? remaining - perInstallment * (count - 1)
        : perInstallment

      installments.push({
        booking_id: bookingId,
        installment_number: i,
        due_date: dueDate.toISOString().split('T')[0],
        amount: amount > 0 ? amount : perInstallment,
        status: 'pending',
      })

      dueDate = new Date(dueDate)
      dueDate.setDate(dueDate.getDate() + intervalDays)
    }

    await this.supabase.from('installments').insert(installments)
  }

  async findByBuyer(buyerId: string) {
    const { data } = await this.supabase
      .from('bookings')
      .select(`
        *,
        properties(id, title, location, district, property_images(url, is_primary)),
        property_units(unit_number, floor),
        installments(id, installment_number, due_date, amount, status)
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })

    return data ?? []
  }

  async findBySeller(sellerId: string) {
    const { data } = await this.supabase
      .from('bookings')
      .select(`
        *,
        properties!inner(id, title, seller_id),
        property_units(unit_number),
        buyer:users!buyer_id(id, email, profiles(full_name, whatsapp_number))
      `)
      .eq('properties.seller_id', sellerId)
      .order('created_at', { ascending: false })

    return data ?? []
  }

  async findOne(id: string) {
    const { data } = await this.supabase
      .from('bookings')
      .select(`
        *,
        properties(id, title, location, district, address, property_images(url, is_primary)),
        property_units(unit_number, floor),
        buyer:users!buyer_id(id, email, profiles(full_name, whatsapp_number, avatar_url)),
        installments(* )
      `)
      .eq('id', id)
      .single()

    if (!data) throw new NotFoundException('Booking not found')
    return data
  }

  async updateStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed', actorId: string) {
    const { data: booking } = await this.supabase
      .from('bookings')
      .select('*, properties(seller_id)')
      .eq('id', id)
      .single()

    if (!booking) throw new NotFoundException('Booking not found')

    const isBuyer = booking.buyer_id === actorId
    const isSeller = booking.properties?.seller_id === actorId

    if (!isBuyer && !isSeller) throw new ForbiddenException()

    const { data } = await this.supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    // Confirmed হলে property status update
    if (status === 'confirmed' && booking.unit_id) {
      // Unit already 'booked', property নিজে available থাকতে পারে
    }

    // Completed / sold হলে unit sold করো
    if (status === 'completed') {
      if (booking.unit_id) {
        await this.supabase
          .from('property_units')
          .update({ status: 'sold' })
          .eq('id', booking.unit_id)
      } else {
        await this.supabase
          .from('properties')
          .update({ status: 'sold' })
          .eq('id', booking.property_id)
      }
    }

    // Cancelled হলে unit আবার available
    if (status === 'cancelled' && booking.unit_id) {
      await this.supabase
        .from('property_units')
        .update({ status: 'available', booked_by: null })
        .eq('id', booking.unit_id)
    }

    // Buyer-কে notification
    await this.supabase.from('notifications').insert({
      user_id: booking.buyer_id,
      title: `Booking ${status}`,
      body: `আপনার booking ${status === 'confirmed' ? 'confirm' : status === 'cancelled' ? 'cancel' : 'complete'} হয়েছে।`,
      type: 'booking',
      reference_id: id,
    })

    return data
  }

  async getInstallments(bookingId: string) {
    const { data } = await this.supabase
      .from('installments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('installment_number')

    return data ?? []
  }

  async markInstallmentPaid(installmentId: string, actorId: string) {
    // Booking owner বা seller কিনা verify
    const { data: inst } = await this.supabase
      .from('installments')
      .select('booking_id, status')
      .eq('id', installmentId)
      .single()

    if (!inst) throw new NotFoundException('Installment not found')
    if (inst.status === 'paid') throw new BadRequestException('Already paid')

    const { data: booking } = await this.supabase
      .from('bookings')
      .select('buyer_id, properties(seller_id)')
      .eq('id', inst.booking_id)
      .single()

    const isBuyer = booking?.buyer_id === actorId
    const isSeller = (booking?.properties as any)?.seller_id === actorId

    if (!isBuyer && !isSeller) throw new ForbiddenException()

    const { data } = await this.supabase
      .from('installments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', installmentId)
      .select()
      .single()

    // Overdue installments check করে update করো
    await this.supabase
      .from('installments')
      .update({ status: 'overdue' })
      .eq('booking_id', inst.booking_id)
      .eq('status', 'pending')
      .lt('due_date', new Date().toISOString().split('T')[0])

    return data
  }

  async getReceipt(installmentId: string, actorId: string) {
    const { data: inst } = await this.supabase
      .from('installments')
      .select(`
        *,
        bookings(
          id, booking_type, total_amount, advance_amount,
          buyer:users!buyer_id(email, profiles(full_name, whatsapp_number)),
          properties(title, location, district, address)
        )
      `)
      .eq('id', installmentId)
      .single()

    if (!inst) throw new NotFoundException()
    if (inst.status !== 'paid') throw new BadRequestException('Installment not paid yet')

    const booking = inst.bookings as any
    if (booking?.buyer?.id !== actorId) {
      // Seller check
      const { data: prop } = await this.supabase
        .from('properties')
        .select('seller_id')
        .eq('id', booking?.property_id)
        .single()
      if (prop?.seller_id !== actorId) throw new ForbiddenException()
    }

    return inst
  }
}
