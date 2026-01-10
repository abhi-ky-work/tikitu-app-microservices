import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateRequest } from './lib/auth';
import { parseServicePath, getServiceUrl } from './lib/services';
import { proxyRequest } from './lib/proxy';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/v1/user/register',
  '/api/v1/booking/events',
  '/api/health',
];

// Health check routes for each service
const HEALTH_CHECK_ROUTES = [
  '/api/v1/admin/health',
  '/api/v1/partner/health',
  '/api/v1/payment/health',
  '/api/v1/notification/health',
  '/api/v1/booking/health',
  '/api/v1/user/health',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route)) ||
         HEALTH_CHECK_ROUTES.some(route => pathname === route);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle gateway health check
  if (pathname === '/api/health') {
    return NextResponse.json({
      status: 'healthy',
      service: 'auth-route-gateway',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  }

  // Parse service and path from URL
  const parsed = parseServicePath(pathname);
  
  if (!parsed) {
    return NextResponse.json(
      { error: 'Invalid request path' },
      { status: 400 }
    );
  }

  const { service, path } = parsed;
  const serviceUrl = getServiceUrl(service);

  if (!serviceUrl) {
    return NextResponse.json(
      { error: 'Service not found' },
      { status: 404 }
    );
  }

  // Check if route requires authentication
  if (!isPublicRoute(pathname)) {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing authentication token' },
        { status: 401 }
      );
    }
  }

  // Proxy the request to the appropriate microservice
  return proxyRequest(serviceUrl, request, path);
}

export const config = {
  matcher: '/api/v1/:path*',
};

