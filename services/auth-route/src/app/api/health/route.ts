import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'auth-route-gateway',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    description: 'API Gateway for Tikitu Microservices',
    services: {
      admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3001',
      partner: process.env.PARTNER_SERVICE_URL || 'http://localhost:3002',
      payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
      notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
      booking: process.env.BOOKING_SERVICE_URL || 'http://localhost:3005',
      user: process.env.USER_SERVICE_URL || 'http://localhost:3006',
    },
  });
}

