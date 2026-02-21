// Service URLs configuration - only enabled services have URLs
export const SERVICE_URLS: Record<string, string | undefined> = {
  admin: process.env.ADMIN_SERVICE_URL,
  partner: process.env.PARTNER_SERVICE_URL,
  payment: process.env.PAYMENT_SERVICE_URL,
  notification: process.env.NOTIFICATION_SERVICE_URL,
  booking: process.env.BOOKING_SERVICE_URL,
  user: process.env.USER_SERVICE_URL,
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
  if (!service) return null;
  
  const url = SERVICE_URLS[service];
  return url || null; // Return null if service URL is not configured
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

