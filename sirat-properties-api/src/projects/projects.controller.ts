import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ── Public ────────────────────────────────────────────────────

  @Get('public/:slug')
  getPublicPage(@Param('slug') slug: string) {
    return this.projectsService.getPublicPage(slug)
  }

  // ── Authenticated ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('seller')
  create(@Request() req: any, @Body() body: {
    property_id: string; name: string; slug: string
    description?: string; start_date?: string; expected_end_date?: string
  }) {
    return this.projectsService.createProject(req.user.id, body)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my')
  @Roles('seller')
  myProjects(@Request() req: any) {
    return this.projectsService.getSellerProjects(req.user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @Roles('seller')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.projectsService.updateProject(req.user.id, id, body)
  }

  // ── Updates ───────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/updates')
  @Roles('seller')
  postUpdate(@Request() req: any, @Param('id') id: string, @Body() body: {
    title: string; description: string
    update_type: 'progress' | 'announcement' | 'milestone'; media_urls?: string[]
  }) {
    return this.projectsService.postUpdate(req.user.id, id, body)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/updates')
  getUpdates(@Param('id') id: string) {
    return this.projectsService.getUpdates(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('updates/:updateId')
  @Roles('seller')
  deleteUpdate(@Request() req: any, @Param('updateId') updateId: string) {
    return this.projectsService.deleteUpdate(req.user.id, updateId)
  }

  // ── Landing Pages ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/landing')
  @Roles('seller')
  upsertLanding(@Request() req: any, @Param('id') id: string, @Body() body: {
    sections: object[]; custom_slug?: string
  }) {
    return this.projectsService.upsertLandingPage(req.user.id, id, body)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/landing/publish')
  @Roles('seller')
  publishLanding(@Request() req: any, @Param('id') id: string, @Body() body: { publish: boolean }) {
    return this.projectsService.publishLandingPage(req.user.id, id, body.publish)
  }

  // ── Buyer feed ────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('buyer/feed')
  @Roles('buyer')
  buyerFeed(@Request() req: any) {
    return this.projectsService.getBuyerProjectFeed(req.user.id)
  }
}
