import { Injectable, Logger } from '@nestjs/common';

/**
 * OpenSearch integration placeholder for consumer discovery at scale.
 * Set OPENSEARCH_URL to enable; until then, discovery uses PostgreSQL + Redis.
 */
@Injectable()
export class OpenSearchService {
  private readonly logger = new Logger(OpenSearchService.name);
  private readonly enabled = Boolean(process.env.OPENSEARCH_URL);

  isEnabled(): boolean {
    return this.enabled;
  }

  async indexEvent(_document: Record<string, unknown>): Promise<void> {
    if (!this.enabled) return;
    this.logger.debug('OpenSearch index stub — configure OPENSEARCH_URL to activate');
  }

  async search(_query: {
    city?: string;
    dateFrom?: string;
    dateTo?: string;
    category?: string;
  }): Promise<null> {
    if (!this.enabled) return null;
    this.logger.debug('OpenSearch search stub');
    return null;
  }
}
