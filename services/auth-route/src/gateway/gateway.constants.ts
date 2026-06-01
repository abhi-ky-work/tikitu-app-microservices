export const PUBLIC_ROUTES = [
  '/api/v1/user/register',
  '/api/v1/booking/events',
  '/api/health',
];

export const HEALTH_CHECK_ROUTES = [
  '/api/v1/admin/health',
  '/api/v1/partner/health',
  '/api/v1/payment/health',
  '/api/v1/notification/health',
  '/api/v1/booking/health',
  '/api/v1/user/health',
];

export const SERVICE_URLS: Record<string, string | undefined> = {
  admin: process.env.ADMIN_SERVICE_URL,
  partner: process.env.PARTNER_SERVICE_URL,
  payment: process.env.PAYMENT_SERVICE_URL,
  notification: process.env.NOTIFICATION_SERVICE_URL,
  booking: process.env.BOOKING_SERVICE_URL,
  user: process.env.USER_SERVICE_URL,
};

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
  const envVar = `${service.toUpperCase()}_SERVICE_URL`;
  return process.env[envVar] || SERVICE_URLS[service] || null;
}

export function parseServicePath(pathname: string): { service: string; path: string } | null {
  const match = pathname.match(/^\/api\/v1\/([^/]+)\/(.*)$/);
  if (!match) return null;
  const [, service, path] = match;
  return { service, path };
}

export function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    HEALTH_CHECK_ROUTES.some((route) => pathname === route)
  );
}
