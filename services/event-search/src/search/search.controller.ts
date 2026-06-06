import { Controller, Get, Query, BadRequestException, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SearchService } from './search.service';

@Controller('api/v1')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  /**
   * Kafka consumer endpoint listening on event.published topic
   */
  @EventPattern('event.published')
  async handleEventPublished(@Payload() event: any) {
    this.logger.log(`Received Kafka event.published: ${JSON.stringify(event)}`);
    try {
      await this.searchService.ingestEvent(event);
    } catch (err) {
      this.logger.error(`Failed to handle event.published Kafka message: ${err}`);
    }
  }

  /**
   * Search API: GET /api/v1/search
   */
  @Get('search')
  async search(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('city') city?: string,
    @Query('q') query?: string,
    @Query('page') page?: string,
  ) {
    if (!lat || !lon || !city) {
      throw new BadRequestException('Missing required query parameters: lat, lon, city');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid coordinates: lat and lon must be numeric');
    }

    const pageNum = page ? parseInt(page, 10) : 1;

    return this.searchService.search({
      lat: latitude,
      lon: longitude,
      city,
      q: query,
      page: pageNum,
    });
  }

  /**
   * Autocomplete API: GET /api/v1/autocomplete
   */
  @Get('autocomplete')
  async autocomplete(
    @Query('city') city?: string,
    @Query('q') query?: string,
  ) {
    if (!city || !query) {
      throw new BadRequestException('Missing required query parameters: city, q');
    }

    const suggestions = await this.searchService.autocomplete(city, query);
    return { data: suggestions };
  }

  /**
   * Health Check: GET /api/v1/health
   */
  @Get('health')
  async health() {
    return this.searchService.getHealth();
  }
}
