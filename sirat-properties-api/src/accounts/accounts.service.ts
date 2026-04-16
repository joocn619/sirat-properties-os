import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class AccountsService {
  private supabase

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  // ── Expenses ──────────────────────────────────────────────────

  async getExpenses(category?: string, from?: string, to?: string) {
    let query = this.supabase
      .from('expenses')
      .select('*, users(profiles(full_name))')
      .order('expense_date', { ascending: false })

    if (category) query = query.eq('category', category)
    if (from) query = query.gte('expense_date', from)
    if (to) query = query.lte('expense_date', to)

    const { data } = await query
    return data ?? []
  }

  async addExpense(recordedBy: string, dto: {
    category: string
    amount: number
    description: string
    expense_date: string
    receipt_url?: string
  }) {
    const { data, error } = await this.supabase
      .from('expenses')
      .insert({ recorded_by: recordedBy, ...dto })
      .select()
      .single()
    if (error) throw new Error(error.message)

    // Auto-add to ledger
    await this.supabase.from('ledger').insert({
      type: 'expense',
      amount: dto.amount,
      description: dto.description,
      reference_id: data.id,
      recorded_by: recordedBy,
      transaction_date: dto.expense_date,
    })

    return data
  }

  // ── Ledger ────────────────────────────────────────────────────

  async getLedger(from?: string, to?: string) {
    let query = this.supabase
      .from('ledger')
      .select('*')
      .order('transaction_date', { ascending: false })

    if (from) query = query.gte('transaction_date', from)
    if (to) query = query.lte('transaction_date', to)

    const { data } = await query
    return data ?? []
  }

  async addLedgerEntry(recordedBy: string, dto: {
    type: 'income' | 'expense'
    amount: number
    description: string
    transaction_date: string
    reference_id?: string
  }) {
    const { data, error } = await this.supabase
      .from('ledger')
      .insert({ recorded_by: recordedBy, ...dto })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  // ── Commission Approval ───────────────────────────────────────

  async getPendingCommissions() {
    const { data } = await this.supabase
      .from('commission_deals')
      .select(`
        *,
        properties(id, title),
        seller:users!seller_id(profiles(full_name)),
        agent:users!agent_id(profiles(full_name))
      `)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
    return data ?? []
  }

  async releaseCommission(dealId: string, recordedBy: string) {
    const { data: deal } = await this.supabase
      .from('commission_deals')
      .select('agent_id, commission_value, commission_type, properties(price)')
      .eq('id', dealId)
      .single()

    if (!deal) throw new Error('Deal not found')

    const amount = deal.commission_type === 'percentage'
      ? (Number((deal.properties as any)?.price ?? 0) * deal.commission_value) / 100
      : deal.commission_value

    // Credit agent wallet
    await this.supabase.from('wallet_transactions').insert({
      agent_id: deal.agent_id,
      type: 'credit',
      amount,
      description: 'Commission payment',
      reference_id: dealId,
    })

    // Ledger entry
    await this.supabase.from('ledger').insert({
      type: 'expense',
      amount,
      description: 'Agent commission released',
      reference_id: dealId,
      recorded_by: recordedBy,
      transaction_date: new Date().toISOString().split('T')[0],
    })

    // Mark deal released
    await this.supabase
      .from('commission_deals')
      .update({ status: 'released' })
      .eq('id', dealId)

    return { released: true, amount }
  }

  // ── Monthly Summary ───────────────────────────────────────────

  async getMonthlySummary(month: string) {
    const from = `${month}-01`
    const to = `${month}-31`

    const [bookings, expenses, commissions, newUsers] = await Promise.all([
      this.supabase
        .from('bookings')
        .select('total_amount, status')
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59'),
      this.supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', from)
        .lte('expense_date', to),
      this.supabase
        .from('commission_deals')
        .select('commission_value')
        .eq('status', 'released')
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59'),
      this.supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59'),
    ])

    const totalBookingValue = (bookings.data ?? [])
      .filter((b: any) => b.status !== 'cancelled')
      .reduce((sum: number, b: any) => sum + Number(b.total_amount ?? 0), 0)
    const totalExpenses = (expenses.data ?? []).reduce((sum: number, e: any) => sum + Number(e.amount ?? 0), 0)
    const totalCommissions = (commissions.data ?? []).reduce((sum: number, c: any) => sum + Number(c.commission_value ?? 0), 0)

    return {
      month,
      totalBookingValue,
      totalExpenses,
      totalCommissions,
      newUsers: newUsers.count ?? 0,
      bookingCount: (bookings.data ?? []).length,
    }
  }
}
