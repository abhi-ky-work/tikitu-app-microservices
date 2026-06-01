import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationClientService {
  private readonly logger = new Logger(NotificationClientService.name);
  private readonly baseUrl =
    process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
  private readonly apiKey = process.env.INTERNAL_API_KEY || '';

  async sendBookingConfirmation(payload: {
    userId: string;
    bookingId: string;
    bookingRef: string;
    title: string;
  }) {
    try {
      await axios.post(`${this.baseUrl}/api/v1/internal/notifications`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-key': this.apiKey,
        },
        validateStatus: () => true,
      });
    } catch (err) {
      this.logger.warn('Notification dispatch failed (non-blocking)', err);
    }
  }
}
