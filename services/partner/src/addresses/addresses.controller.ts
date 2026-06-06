import { Controller, Get, Post, Body, Query, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { RolesGuard, Roles, AuthenticatedRequest } from '@tikitu/common';
import { Request } from '@nestjs/common';

@Controller('v1/addresses')
@UseGuards(RolesGuard)
@Roles('partner')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get('autocomplete')
  async autocomplete(@Query('text') text: string) {
    return this.addressesService.autocomplete(text);
  }

  @Get('place')
  async getPlaceDetails(@Query('placeId') placeId: string) {
    return this.addressesService.getPlaceDetails(placeId);
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
    return this.addressesService.createAddress(cognitoId, {
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
    return this.addressesService.getAddresses(cognitoId);
  }
}
