import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common'
import { PropertiesService } from './properties.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('properties')
export class PropertiesController {
  constructor(private svc: PropertiesService) {}

  // Public: search
  @Get()
  findAll(@Query() filters: {
    location?: string
    district?: string
    property_type?: string
    listing_type?: string
    min_price?: string
    max_price?: string
    min_area?: string
    max_area?: string
    amenities?: string
    is_featured?: string
    page?: string
    limit?: string
  }) {
    return this.svc.findAll({
      ...filters,
      min_price: filters.min_price ? Number(filters.min_price) : undefined,
      max_price: filters.max_price ? Number(filters.max_price) : undefined,
      min_area: filters.min_area ? Number(filters.min_area) : undefined,
      max_area: filters.max_area ? Number(filters.max_area) : undefined,
      amenities: filters.amenities ? filters.amenities.split(',') : undefined,
      is_featured: filters.is_featured === 'true',
      page: filters.page ? Number(filters.page) : 1,
      limit: filters.limit ? Number(filters.limit) : 20,
    })
  }

  // Public: single property
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id)
  }

  // Seller: নিজের listings
  @Get('seller/my-listings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  myListings(@CurrentUser() user: { id: string }) {
    return this.svc.findBySeller(user.id)
  }

  // Seller: নতুন property তৈরি
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: any,
  ) {
    return this.svc.create(user.id, dto)
  }

  // Seller: property update
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: any,
  ) {
    return this.svc.update(id, user.id, dto)
  }

  // Seller: publish
  @Put(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  publish(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.publish(id, user.id)
  }

  // Seller: unpublish
  @Put(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  unpublish(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.unpublish(id, user.id)
  }

  // Seller: delete
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.remove(id, user.id)
  }

  // Images
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  addImage(
    @Param('id') propertyId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: { url: string; is_primary?: boolean; media_type?: string },
  ) {
    return this.svc.addImage(propertyId, user.id, dto)
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  removeImage(
    @Param('imageId') imageId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.removeImage(imageId, user.id)
  }

  // Units
  @Get(':id/units')
  getUnits(@Param('id') id: string) {
    return this.svc.getUnits(id)
  }

  @Post(':id/units')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  addUnit(
    @Param('id') propertyId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: { unit_number: string; floor?: number; area_sqft?: number; price?: number },
  ) {
    return this.svc.addUnit(propertyId, user.id, dto)
  }

  @Put('units/:unitId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  updateUnit(
    @Param('unitId') unitId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: { status?: string; price?: number; area_sqft?: number },
  ) {
    return this.svc.updateUnit(unitId, user.id, dto)
  }

  @Get(':id/inventory')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin', 'super_admin')
  getInventory(@Param('id') id: string) {
    return this.svc.getInventoryStats(id)
  }
}
