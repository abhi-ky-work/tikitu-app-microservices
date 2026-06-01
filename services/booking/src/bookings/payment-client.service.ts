import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentClientService {
  private readonly baseUrl =
    process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';
  private readonly apiKey = process.env.INTERNAL_API_KEY || '';

  async createPayment(payload: {
    bookingId: string;
    userId: string;
    amount: number;
    paymentMethod: string;
    idempotencyKey: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/internal/payments`,
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
          response.data?.message || 'Payment service error',
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('Payment service unavailable');
    }
  }
}
