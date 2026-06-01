import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { OpenSearchService } from '../search/opensearch.service';
import { PublishInventoryDto } from './dto/publish-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly openSearch: OpenSearchService,
  ) {}

  async publishFromCatalog(dto: PublishInventoryDto) {
    const existing = await this.prisma.eventInventory.findUnique({
      where: { catalogEventId: dto.catalogEventId },
    });

    if (existing) {
      throw new ConflictException('Inventory already published for this catalog event');
    }

    const inventory = await this.prisma.eventInventory.create({
      data: {
        catalogEventId: dto.catalogEventId,
        partnerId: dto.partnerId,
        venueId: dto.venueId,
        city: dto.city,
        title: dto.title,
        description: dto.description,
        eventDate: new Date(dto.eventDate),
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        category: dto.category,
        totalSeats: dto.totalSeats,
        availableSeats: dto.totalSeats,
        basePrice: dto.basePrice,
        imageUrl: dto.imageUrl,
        ticketSalesClose: dto.ticketSalesClose ? new Date(dto.ticketSalesClose) : null,
        noteToAttendees: dto.noteToAttendees,
        termsConditions: dto.termsConditions,
        refundPolicy: dto.refundPolicy,
      },
    });

    await this.invalidateDiscoveryCache(dto.city);
    await this.openSearch.indexEvent({
      id: inventory.id,
      city: inventory.city,
      title: inventory.title,
      eventDate: inventory.eventDate.toISOString(),
      category: inventory.category,
    });
    return inventory;
  }

  async discoverEvents(filters: {
    city?: string;
    dateFrom?: string;
    dateTo?: string;
    category?: string;
  }) {
    const cacheKey = this.redis.cacheKey('events', {
      city: filters.city,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      category: filters.category,
    });

    const cached = await this.redis.get<unknown[]>(cacheKey);
    if (cached) {
      return { data: cached, cached: true };
    }

    const osResults = await this.openSearch.search(filters);
    if (osResults) {
      return { data: osResults, cached: false, source: 'opensearch' };
    }

    const where: {
      isActive: boolean;
      city?: { equals: string; mode: 'insensitive' };
      category?: string;
      eventDate?: { gte?: Date; lte?: Date };
    } = { isActive: true };

    if (filters.city) {
      where.city = { equals: filters.city, mode: 'insensitive' };
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.eventDate = {};
      if (filters.dateFrom) where.eventDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.eventDate.lte = new Date(filters.dateTo);
    }

    const events = await this.prisma.eventInventory.findMany({
      where,
      orderBy: { eventDate: 'asc' },
      take: 100,
    });

    const ttl = parseInt(process.env.EVENTS_CACHE_TTL_SECONDS || '60', 10);
    await this.redis.set(cacheKey, events, ttl);

    return { data: events, cached: false };
  }

  async getEventById(id: string) {
    const cacheKey = this.redis.cacheKey('event', { id });
    const cached = await this.redis.get<unknown>(cacheKey);
    if (cached) return { data: cached, cached: true };

    const event = await this.prisma.eventInventory.findFirst({
      where: { id, isActive: true },
    });

    if (event) {
      const ttl = parseInt(process.env.EVENT_DETAIL_CACHE_TTL_SECONDS || '120', 10);
      await this.redis.set(cacheKey, event, ttl);
    }

    return { data: event, cached: false };
  }

  async decrementSeats(
    eventInventoryId: string,
    quantity: number,
    expectedVersion: number,
  ): Promise<boolean> {
    const result = await this.prisma.eventInventory.updateMany({
      where: {
        id: eventInventoryId,
        availableSeats: { gte: quantity },
        version: expectedVersion,
      },
      data: {
        availableSeats: { decrement: quantity },
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      return false;
    }

    const inv = await this.prisma.eventInventory.findUnique({
      where: { id: eventInventoryId },
    });
    if (inv) {
      await this.invalidateDiscoveryCache(inv.city);
    }
    return true;
  }

  private async invalidateDiscoveryCache(city: string) {
    await this.redis.del(this.redis.cacheKey('events', { city }));
  }
}
