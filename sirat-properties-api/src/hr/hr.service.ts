import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class HrService {
  private supabase

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }

  // ── Employees ─────────────────────────────────────────────────

  async getEmployees() {
    const { data } = await this.supabase
      .from('employees')
      .select('*, users(email, profiles(full_name, avatar_url))')
      .order('created_at', { ascending: false })
    return data ?? []
  }

  async addEmployee(dto: {
    user_id?: string
    employee_id: string
    department: string
    designation: string
    join_date: string
    base_salary: number
  }) {
    const { data, error } = await this.supabase
      .from('employees')
      .insert(dto)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async updateEmployeeStatus(id: string, status: 'active' | 'resigned' | 'terminated') {
    const { data } = await this.supabase
      .from('employees')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    return data
  }

  // ── Payroll ───────────────────────────────────────────────────

  async getPayroll(employeeId?: string) {
    let query = this.supabase
      .from('payroll')
      .select('*, employees(employee_id, designation, users(profiles(full_name)))')
      .order('month', { ascending: false })

    if (employeeId) query = query.eq('employee_id', employeeId)
    const { data } = await query
    return data ?? []
  }

  async createPayroll(dto: {
    employee_id: string
    month: string
    base_salary: number
    bonus?: number
    deductions?: number
  }) {
    const net = dto.base_salary + (dto.bonus ?? 0) - (dto.deductions ?? 0)
    const { data, error } = await this.supabase
      .from('payroll')
      .insert({ ...dto, bonus: dto.bonus ?? 0, deductions: dto.deductions ?? 0, net_salary: net })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async markPayrollPaid(id: string) {
    const { data } = await this.supabase
      .from('payroll')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return data
  }

  // ── KPI ───────────────────────────────────────────────────────

  async getKpi(month?: string) {
    let query = this.supabase
      .from('kpi_records')
      .select('*, users(email, profiles(full_name))')
      .order('month', { ascending: false })

    if (month) query = query.eq('month', month)
    const { data } = await query
    return data ?? []
  }

  async upsertKpi(dto: {
    user_id: string
    month: string
    leads_generated?: number
    sales_closed?: number
    tasks_completed?: number
    score?: number
    notes?: string
  }) {
    const { data } = await this.supabase
      .from('kpi_records')
      .upsert(dto, { onConflict: 'user_id,month' })
      .select()
      .single()
    return data
  }
}
