import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  InternalApiKeyGuard,
  InternalRoute,
  Public,
} from '@tikitu/common';
import { PublishInventoryDto } from './dto/publish-inventory.dto';
import { InventoryService } from './inventory.service';

@Controller('v1')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Public()
  @Get('events')
  async discoverEvents(
    @Query('city') city?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('category') category?: string,
  ) {
    return this.inventoryService.discoverEvents({ city, dateFrom, dateTo, category });
  }

  @Public()
  @Get('events/:id')
  async getEvent(@Param('id') id: string) {
    return this.inventoryService.getEventById(id);
  }

  @InternalRoute()
  @UseGuards(InternalApiKeyGuard)
  @Post('internal/inventory/publish')
  async publishInventory(@Body() body: PublishInventoryDto) {
    return this.inventoryService.publishFromCatalog(body);
  }
}
