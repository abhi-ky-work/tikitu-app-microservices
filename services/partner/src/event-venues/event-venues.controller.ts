import { Controller, Get, Post, Body, Query, UseGuards, UnauthorizedException } from '@nestjs/common';
import { EventVenuesService } from './event-venues.service';
import { RolesGuard, Roles, AuthenticatedRequest } from '@tikitu/common';
import { Request } from '@nestjs/common';

@Controller('v1/event-venues')
@UseGuards(RolesGuard)
@Roles('partner')
export class EventVenuesController {
  constructor(private readonly eventVenuesService: EventVenuesService) {}

  @Get('autocomplete')
  async autocomplete(@Query('text') text: string) {
    return this.eventVenuesService.autocomplete(text);
  }

  @Get('place')
  async getPlaceDetails(@Query('placeId') placeId: string) {
    return this.eventVenuesService.getPlaceDetails(placeId);
  }

  @Post()
  async createAddress(
    @Request() req: AuthenticatedRequest,
    @Body() body: any,
  ) {
    if (!req.user || !req.user.sub) {
      throw new UnauthorizedException('User not found');
    }
    const cognitoId = req.user.sub;
    return this.eventVenuesService.createEventVenue(cognitoId, {
      customAddressName: body.customAddressName,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      country: body.country,
      latitude: body.latitude,
      longitude: body.longitude,
    });
  }

  @Get()
  async getAddresses(@Request() req: AuthenticatedRequest) {
    if (!req.user || !req.user.sub) {
      throw new UnauthorizedException('User not found');
    }
    const cognitoId = req.user.sub;
    return this.eventVenuesService.getEventVenues(cognitoId);
  }
}
