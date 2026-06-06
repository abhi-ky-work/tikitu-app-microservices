import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import Redis from 'ioredis';

// Geohash encoder implementation
function encodeGeohash(latitude: number, longitude: number, precision: number = 5): string {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let isEven = true;
  let latMin = -90, latMax = 90;
  let lonMin = -180, lonMax = 180;
  let geohash = '';
  let bit = 0;
  let ch = 0;

  while (geohash.length < precision) {
    let mid;
    if (isEven) {
      mid = (lonMin + lonMax) / 2;
      if (longitude > mid) {
        ch |= (1 << (4 - bit));
        lonMin = mid;
      } else {
        lonMax = mid;
      }
    } else {
      mid = (latMin + latMax) / 2;
      if (latitude > mid) {
        ch |= (1 << (4 - bit));
        latMin = mid;
      } else {
        latMax = mid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return geohash;
}

@Injectable()
export class SearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SearchService.name);
  private openSearchClient!: Client;
  private redisClient!: Redis;

  async onModuleInit() {
    // Connect to OpenSearch
    const openSearchNode = process.env.OPENSEARCH_NODE || 'http://localhost:9200';
    this.openSearchClient = new Client({
      node: openSearchNode,
    });

    // Connect to Redis
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redisClient = new Redis(redisUrl);

    this.logger.log('Connected to OpenSearch and Redis.');

    // Initialize index
    await this.initIndex();
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  private async initIndex() {
    const indexName = 'events';
    try {
      const { body: exists } = await this.openSearchClient.indices.exists({
        index: indexName,
      });

      if (!exists) {
        this.logger.log(`Creating index '${indexName}' with geo_point mappings...`);
        await this.openSearchClient.indices.create({
          index: indexName,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                name: {
                  type: 'text',
                  fields: {
                    keyword: { type: 'keyword', ignore_above: 256 }
                  }
                },
                category: { type: 'keyword' },
                description: { type: 'text' },
                backgroundImage: { type: 'keyword', index: false },
                eventDate: { type: 'date' },
                startTime: { type: 'keyword' },
                endTime: { type: 'keyword' },
                venueName: { type: 'text' },
                location: { type: 'geo_point' },
                city: { type: 'keyword' },
                state: { type: 'keyword' },
                zipCode: { type: 'keyword' },
                ticketSalesClose: { type: 'date' },
                noteToAttendees: { type: 'text' },
                termsConditions: { type: 'text' },
                refundPolicy: { type: 'text' },
                ticketTypes: {
                  type: 'nested',
                  properties: {
                    id: { type: 'keyword' },
                    name: { type: 'text' },
                    categoryCode: { type: 'keyword' },
                    price: { type: 'float' },
                    quantity: { type: 'integer' }
                  }
                }
              }
            }
          }
        });
        this.logger.log(`Index '${indexName}' created successfully.`);
      } else {
        this.logger.log(`Index '${indexName}' already exists.`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize OpenSearch index:', error);
    }
  }

  /**
   * Ingest a published event from Kafka into OpenSearch and Redis indexes
   */
  async ingestEvent(event: any) {
    this.logger.log(`Ingesting event ${event.id} into OpenSearch and Redis...`);

    const latitude = parseFloat(event.latitude);
    const longitude = parseFloat(event.longitude);

    // 1. OpenSearch indexing
    const document: Record<string, any> = {
      id: event.id,
      name: event.name,
      category: event.category,
      description: event.description,
      backgroundImage: event.backgroundImage,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      venueName: event.venueName,
      city: event.city,
      state: event.state,
      zipCode: event.zipCode,
      ticketSalesClose: event.ticketSalesClose,
      noteToAttendees: event.noteToAttendees,
      termsConditions: event.termsConditions,
      refundPolicy: event.refundPolicy,
      ticketTypes: event.ticketTypes,
    };

    if (!isNaN(latitude) && !isNaN(longitude)) {
      document.location = {
        lat: latitude,
        lon: longitude,
      };
    }

    await this.openSearchClient.index({
      index: 'events',
      id: event.id,
      body: document,
      refresh: true, // force refresh for real-time visibility in dev
    });

    // 2. Redis Tier 1: Static Category Dropdown
    if (event.city && event.category) {
      const cityKey = event.city.toLowerCase().trim();
      const categoriesKey = `city:${cityKey}:categories`;
      await this.redisClient.sadd(categoriesKey, event.category.toLowerCase());
    }

    // 3. Redis Tier 2: Real-time Autocomplete prefix match
    if (event.city && event.name) {
      const cityKey = event.city.toLowerCase().trim();
      const autocompleteKey = `autocomplete:city:${cityKey}`;
      // Add the title to autocomplete ZSET with score 0
      await this.redisClient.zadd(autocompleteKey, 0, event.name.toLowerCase().trim());
    }

    // Invalidate cached query results for this city to force update
    if (event.city) {
      const cityKey = event.city.toLowerCase().trim();
      const keysPattern = `search:city:${cityKey}:*`;
      const keys = await this.redisClient.keys(keysPattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    }

    this.logger.log(`Event ${event.id} ingested successfully.`);
  }

  /**
   * Search API implementation with Tier 3 Geohash & Query caching
   */
  async search(params: {
    lat: number;
    lon: number;
    city: string;
    q?: string;
    page?: number;
  }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const cityKey = params.city.toLowerCase().trim();
    const sanitizedQuery = (params.q || '').toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');
    const gHash = encodeGeohash(params.lat, params.lon, 5); // Level 5 precision (~4.9km)

    // Normalize date to YYYYMMDD
    const today = new Date();
    const yyyymmdd = today.toISOString().split('T')[0].replace(/-/g, '');

    // Cache key: search:city:{city}:geohash:{g_hash}:date:{YYYYMMDD}:q:{q}:page:{page}
    const cacheKey = `search:city:${cityKey}:geohash:${gHash}:date:${yyyymmdd}:q:${sanitizedQuery}:page:${page}`;

    // Try cache lookup
    try {
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`);
        return { data: JSON.parse(cached), cached: true };
      }
    } catch (cacheErr) {
      this.logger.warn(`Failed to read search cache: ${cacheErr}`);
    }

    this.logger.debug(`Cache miss for key: ${cacheKey}. Querying OpenSearch...`);

    // Construct OpenSearch query
    const mustQueries: any[] = [
      {
        term: {
          city: cityKey,
        },
      },
    ];

    if (sanitizedQuery) {
      mustQueries.push({
        match: {
          name: {
            query: sanitizedQuery,
            fuzziness: 'AUTO',
          },
        },
      });
    }

    const body: any = {
      from: offset,
      size: limit,
      query: {
        bool: {
          must: mustQueries,
          filter: [
            {
              geo_distance: {
                distance: '5km',
                location: {
                  lat: params.lat,
                  lon: params.lon,
                },
              },
            },
          ],
        },
      },
      sort: [
        {
          _geo_distance: {
            location: {
              lat: params.lat,
              lon: params.lon,
            },
            order: 'asc',
            unit: 'km',
          },
        },
      ],
    };

    const searchResponse = await this.openSearchClient.search({
      index: 'events',
      body,
    });

    const hits = searchResponse.body.hits.hits;
    const results = hits.map((hit: any) => ({
      ...hit._source,
      distance: hit.sort ? hit.sort[0] : null,
    }));

    // Cache results in Redis (5-minute TTL / 300 seconds)
    try {
      await this.redisClient.setex(cacheKey, 300, JSON.stringify(results));
      this.logger.debug(`Cached search results for key: ${cacheKey}`);
    } catch (cacheErr) {
      this.logger.warn(`Failed to write search cache: ${cacheErr}`);
    }

    return { data: results, cached: false };
  }

  /**
   * Autocomplete API using Redis ZSET lex matching
   */
  async autocomplete(city: string, query: string) {
    if (!city || !query) {
      return [];
    }

    const cityKey = city.toLowerCase().trim();
    const autocompleteKey = `autocomplete:city:${cityKey}`;
    const cleanedQuery = query.toLowerCase().trim();

    try {
      // Lex range match: range starting from [cleanedQuery to [cleanedQuery + \xff
      const results = await this.redisClient.zrangebylex(
        autocompleteKey,
        `[${cleanedQuery}`,
        `[${cleanedQuery}\xff`,
        'LIMIT',
        0,
        5
      );
      return results;
    } catch (error) {
      this.logger.error(`Failed to autocomplete from Redis: ${error}`);
      return [];
    }
  }

  async getHealth() {
    let openSearchStatus = 'unknown';
    let redisStatus = 'unknown';

    try {
      const info = await this.openSearchClient.info();
      if (info) openSearchStatus = 'healthy';
    } catch (err) {
      openSearchStatus = `unhealthy: ${err instanceof Error ? err.message : String(err)}`;
    }

    try {
      const ping = await this.redisClient.ping();
      if (ping === 'PONG') redisStatus = 'healthy';
    } catch (err) {
      redisStatus = `unhealthy: ${err instanceof Error ? err.message : String(err)}`;
    }

    return {
      status: openSearchStatus === 'healthy' && redisStatus === 'healthy' ? 'healthy' : 'degraded',
      services: {
        opensearch: openSearchStatus,
        redis: redisStatus,
      },
    };
  }
}
