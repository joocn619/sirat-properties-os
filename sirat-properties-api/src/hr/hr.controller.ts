import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { HrService } from './hr.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin', 'hr_admin')
export class HrController {
  constructor(private hr: HrService) {}

  // Employees
  @Get('employees')
  getEmployees() { return this.hr.getEmployees() }

  @Post('employees')
  addEmployee(@Body() dto: any) { return this.hr.addEmployee(dto) }

  @Put('employees/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.hr.updateEmployeeStatus(id, status)
  }

  // Payroll
  @Get('payroll')
  getPayroll(@Query('employee_id') employeeId?: string) {
    return this.hr.getPayroll(employeeId)
  }

  @Post('payroll')
  createPayroll(@Body() dto: any) { return this.hr.createPayroll(dto) }

  @Put('payroll/:id/paid')
  markPaid(@Param('id') id: string) { return this.hr.markPayrollPaid(id) }

  // KPI
  @Get('kpi')
  getKpi(@Query('month') month?: string) { return this.hr.getKpi(month) }

  @Post('kpi')
  upsertKpi(@Body() dto: any) { return this.hr.upsertKpi(dto) }
}
