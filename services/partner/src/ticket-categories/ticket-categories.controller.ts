import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TicketCategoriesService } from './ticket-categories.service';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { TicketCategoryCode } from '../../prisma/generated/client';
import { Public } from '@tikitu/common';

@Controller('v1/ticket-categories')
@Public()
export class TicketCategoriesController {
  constructor(private readonly ticketCategoriesService: TicketCategoriesService) {}

  @Post()
  create(@Body() createTicketCategoryDto: CreateTicketCategoryDto) {
    console.log("request coming : ")
    return this.ticketCategoriesService.create(createTicketCategoryDto);
  }

  @Post('bulk')
  createBulk(@Body() createTicketCategoryDtos: CreateTicketCategoryDto[]) {
    return this.ticketCategoriesService.createBulk(createTicketCategoryDtos);
  }

  @Get()
  findAll() {
    return this.ticketCategoriesService.findAll();
  }

  @Get(':categoryCode')
  findOne(@Param('categoryCode') categoryCode: string) {
    return this.ticketCategoriesService.findOne(categoryCode as TicketCategoryCode);
  }

  @Patch(':categoryCode')
  update(
    @Param('categoryCode') categoryCode: string,
    @Body() updateTicketCategoryDto: UpdateTicketCategoryDto,
  ) {
    return this.ticketCategoriesService.update(categoryCode as TicketCategoryCode, updateTicketCategoryDto);
  }

  @Delete(':categoryCode')
  remove(@Param('categoryCode') categoryCode: string) {
    return this.ticketCategoriesService.remove(categoryCode as TicketCategoryCode);
  }
}
