import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { GoneException } from '@nestjs/common';

/**
 * @deprecated Use POST /api/v1/partner/events and POST /api/v1/partner/events/:id/publish
 */
@Controller('v1/createEvent')
export class DeprecatedEventsController {
  @Post()
  @HttpCode(410)
  createEvent() {
    throw new GoneException(
      'createEvent has moved to Partner service: POST /api/v1/partner/events then POST /api/v1/partner/events/:id/publish',
    );
  }

  @Get()
  @HttpCode(410)
  listEvents() {
    throw new GoneException(
      'Partner event listing: GET /api/v1/partner/events',
    );
  }
}
