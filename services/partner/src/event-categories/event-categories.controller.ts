import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Public } from '@tikitu/common';
import { EventCategoriesService } from './event-categories.service';

@Controller('v1/event-categories')
@Public()
export class EventCategoriesController {
  constructor(private readonly eventCategoriesService: EventCategoriesService) {}

  @Post()
  async create(@Body() body: any) {
    if (Array.isArray(body)) {
      return this.eventCategoriesService.createBulk(body);
    }
    return this.eventCategoriesService.create(body);
  }

  @Get()
  async findAll() {
    return this.eventCategoriesService.findAll();
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    return this.eventCategoriesService.findOne(code);
  }

  @Patch(':code')
  async update(
    @Param('code') code: string,
    @Body() data: { name?: string; description?: string; isActive?: boolean },
  ) {
    return this.eventCategoriesService.update(code, data);
  }

  @Delete(':code')
  async remove(@Param('code') code: string) {
    return this.eventCategoriesService.remove(code);
  }
}
