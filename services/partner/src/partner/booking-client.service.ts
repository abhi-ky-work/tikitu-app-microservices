import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

export interface PublishInventoryPayload {
  catalogEventId: string;
  partnerId: string;
  venueId: string;
  city: string;
  title: string;
  description?: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  category: string;
  totalSeats: number;
  basePrice: number;
  imageUrl?: string | null;
  ticketSalesClose?: string | null;
  noteToAttendees?: string | null;
  termsConditions?: string | null;
  refundPolicy?: string | null;
}

@Injectable()
export class BookingClientService {
  private readonly baseUrl =
    process.env.BOOKING_SERVICE_URL || 'http://localhost:3005';
  private readonly apiKey = process.env.INTERNAL_API_KEY || '';

  async publishInventory(payload: PublishInventoryPayload) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/internal/inventory/publish`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-internal-api-key': this.apiKey,
          },
          validateStatus: () => true,
        },
      );

      if (response.status >= 400) {
        throw new ServiceUnavailableException(
          response.data?.message || 'Booking service rejected publish',
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException(
        `Booking service unavailable: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }
}
