import { SetMetadata } from '@nestjs/common'

export type UserRole =
  | 'buyer'
  | 'seller'
  | 'agent'
  | 'admin'
  | 'super_admin'
  | 'hr_admin'
  | 'accounts_admin'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
