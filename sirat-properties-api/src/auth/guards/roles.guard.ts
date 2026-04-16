import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) return true

    const { user } = context.switchToHttp().getRequest()

    // super_admin সব কিছু access করতে পারে
    if (user?.role === 'super_admin') return true

    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException('এই action-এর permission নেই')
    }

    return true
  }
}
