import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { TicketCategoryCode } from '../../prisma/generated/client';

@Injectable()
export class TicketCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketCategoryDto: CreateTicketCategoryDto) {
    const existing = await this.prisma.ticketCategories.findUnique({
      where: { categoryCode: createTicketCategoryDto.categoryCode as TicketCategoryCode },
    });
    if (existing) {
      throw new ConflictException(`Category with code ${createTicketCategoryDto.categoryCode} already exists`);
    }

    return this.prisma.ticketCategories.create({
      data: {
        categoryCode: createTicketCategoryDto.categoryCode as TicketCategoryCode,
        name: createTicketCategoryDto.name,
        description: createTicketCategoryDto.description,
        isActive: createTicketCategoryDto.isActive ?? true,
      },
    });
  }

  async createBulk(createTicketCategoryDtos: CreateTicketCategoryDto[]) {
    // using createMany to insert multiple records
    return this.prisma.ticketCategories.createMany({
      data: createTicketCategoryDtos.map((dto) => ({
        categoryCode: dto.categoryCode as TicketCategoryCode,
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
      })),
      skipDuplicates: true,
    });
  }

  async findAll() {
    return this.prisma.ticketCategories.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(categoryCode: TicketCategoryCode) {
    const category = await this.prisma.ticketCategories.findUnique({
      where: { categoryCode },
    });
    if (!category) {
      throw new NotFoundException(`Category with code ${categoryCode} not found`);
    }
    return category;
  }

  async update(categoryCode: TicketCategoryCode, updateTicketCategoryDto: UpdateTicketCategoryDto) {
    await this.findOne(categoryCode); // Verify existence

    return this.prisma.ticketCategories.update({
      where: { categoryCode },
      data: updateTicketCategoryDto,
    });
  }

  async remove(categoryCode: TicketCategoryCode) {
    await this.findOne(categoryCode); // Verify existence

    // Deactivate instead of delete to preserve foreign keys
    return this.prisma.ticketCategories.update({
      where: { categoryCode },
      data: { isActive: false },
    });
  }
}
