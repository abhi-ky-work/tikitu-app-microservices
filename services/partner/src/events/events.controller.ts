import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AuthenticatedRequest,
  Roles,
  RolesGuard,
} from '@tikitu/common';
import { EventStatus } from '../../prisma/generated/client';
import { EventsService } from './events.service';

@Controller('v1/events')
@UseGuards(RolesGuard)
@Roles('partner')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(201)
  async createDraft(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    return this.eventsService.createDraftEvent(req.user!, body);
  }

  @Get()
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: EventStatus,
  ) {
    return this.eventsService.listPartnerEvents(req.user!, status);
  }

  @Post(':id/publish')
  async publish(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.eventsService.publishEvent(req.user!, id);
  }
}
