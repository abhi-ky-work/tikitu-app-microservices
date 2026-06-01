import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BookingClientService {
  private readonly logger = new Logger(BookingClientService.name);
  private readonly baseUrl =
    process.env.BOOKING_SERVICE_URL || 'http://localhost:3005';
  private readonly apiKey = process.env.INTERNAL_API_KEY || '';

  async confirmBooking(bookingId: string, paymentId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/internal/bookings/confirm`,
        { bookingId, paymentId },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-internal-api-key': this.apiKey,
          },
          validateStatus: () => true,
        },
      );

      if (response.status >= 400) {
        this.logger.error('Booking confirm failed', response.data);
      }
    } catch (err) {
      this.logger.error('Booking service unreachable for confirm', err);
    }
  }
}
