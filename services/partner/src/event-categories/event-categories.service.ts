import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { code: string; name: string; description?: string }) {
    const existing = await this.prisma.eventCategories.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new ConflictException(`Category with code ${data.code} already exists`);
    }
    return this.prisma.eventCategories.create({ data });
  }

  async createBulk(items: Array<{ code: string; name: string; description?: string }>) {
    const results: any[] = [];
    for (const item of items) {
      const res = await this.prisma.eventCategories.upsert({
        where: { code: item.code },
        update: {
          name: item.name,
          description: item.description,
        },
        create: item,
      });
      results.push(res);
    }
    return results;
  }

  async findAll() {
    return this.prisma.eventCategories.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(code: string) {
    const category = await this.prisma.eventCategories.findUnique({
      where: { code },
    });
    if (!category) {
      throw new NotFoundException(`Category with code ${code} not found`);
    }
    return category;
  }

  async update(code: string, data: { name?: string; description?: string; isActive?: boolean }) {
    await this.findOne(code);
    return this.prisma.eventCategories.update({
      where: { code },
      data,
    });
  }

  async remove(code: string) {
    await this.findOne(code);
    return this.prisma.eventCategories.update({
      where: { code },
      data: { isActive: false },
    });
  }
}
