// Service URLs configuration
export const SERVICE_URLS = {
  admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3001',
  partner: process.env.PARTNER_SERVICE_URL || 'http://localhost:3002',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
  booking: process.env.BOOKING_SERVICE_URL || 'http://localhost:3005',
  user: process.env.USER_SERVICE_URL || 'http://localhost:3006',
};

// Service route mapping
export const SERVICE_ROUTES: Record<string, keyof typeof SERVICE_URLS> = {
  admin: 'admin',
  partner: 'partner',
  payment: 'payment',
  notification: 'notification',
  booking: 'booking',
  user: 'user',
};

export function getServiceUrl(serviceName: string): string | null {
  const service = SERVICE_ROUTES[serviceName];
  return service ? SERVICE_URLS[service] : null;
}

export function parseServicePath(pathname: string): { service: string; path: string } | null {
  // Expected format: /api/v1/{service}/{path}
  const match = pathname.match(/^\/api\/v1\/([^/]+)\/(.*)$/);
  
  if (!match) {
    return null;
  }

  const [, service, path] = match;
  return { service, path };
}

