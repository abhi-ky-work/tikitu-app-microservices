import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  AuthenticatedRequest,
  Roles,
  RolesGuard,
} from '@tikitu/common';
import { PartnerProfileService } from './partner-profile.service';

@Controller('v1')
@UseGuards(RolesGuard)
export class PartnerController {
  constructor(private readonly partnerProfileService: PartnerProfileService) {}

  @Post('savePartnerProfileDetails')
  @Roles('partner')
  async savePartnerProfileDetails(
    @Req() req: AuthenticatedRequest,
    @Body() body: { name?: string; companyName?: string; phone?: string; email?: string },
  ) {
    return this.partnerProfileService.savePartnerProfileDetails(req.user!, body);
  }
}
