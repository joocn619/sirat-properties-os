import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { PropertiesModule } from './properties/properties.module'
import { BookingsModule } from './bookings/bookings.module'
import { AgentsModule } from './agents/agents.module'
import { ProjectsModule } from './projects/projects.module'
import { NotificationsModule } from './notifications/notifications.module'
import { HrModule } from './hr/hr.module'
import { AccountsModule } from './accounts/accounts.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    PropertiesModule,
    BookingsModule,
    AgentsModule,
    ProjectsModule,
    NotificationsModule,
    HrModule,
    AccountsModule,
  ],
})
export class AppModule {}
