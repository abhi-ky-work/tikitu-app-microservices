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

// Add CORS headers to the response
function withCors(response: Response, origin: string | null) {
  // Create a new NextResponse from the original response body and status
  const finalResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
  });

  // Copy all original headers first
  response.headers.forEach((value, key) => {
    finalResponse.headers.set(key, value);
  });
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>withCors headers:', finalResponse.headers);
  // CORS headers logic
  // If we have an origin, we MUST echo it back to allow credentials
  if (origin) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>withCors origin:', origin);
    finalResponse.headers.set('Access-Control-Allow-Origin', origin);
    finalResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    finalResponse.headers.set('Vary', 'Origin');
  } else if (process.env.NODE_ENV === 'development') {
    // Fallback for development if no origin is present
    finalResponse.headers.set('Access-Control-Allow-Origin', '*');
  }

  // Common CORS headers for all responses
  finalResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  finalResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  finalResponse.headers.set('Access-Control-Allow-Private-Network', 'true');
  finalResponse.headers.set('Access-Control-Max-Age', '86400');

  return finalResponse;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get('origin');

  // Handle CORS Preflight request
  if (request.method === 'OPTIONS') {
    return withCors(new Response(null, { status: 204 }), origin);
  }

  // Handle gateway health check
  if (pathname === '/api/health') {
    return withCors(NextResponse.json({
      status: 'healthy',
      service: 'auth-route-gateway',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }), origin);
  }

  // Parse service and path from URL
  const parsed = parseServicePath(pathname);
  
  if (!parsed) {
    return withCors(NextResponse.json(
      { error: 'Invalid request path' },
      { status: 400 }
    ), origin);
  }

  const { service, path } = parsed;
  const serviceUrl = getServiceUrl(service);

  if (!serviceUrl) {
    return withCors(NextResponse.json(
      { error: 'Service not available', message: `The '${service}' service is not enabled` },
      { status: 503 }
    ), origin);
  }

  // Check if route requires authentication
  if (!isPublicRoute(pathname)) {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return withCors(NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing authentication token' },
        { status: 401 }
      ), origin);
    }
  }

  // Proxy the request to the appropriate microservice
  const proxyResponse = await proxyRequest(serviceUrl, request, path);
  return withCors(proxyResponse, origin);
}

export const config = {
  matcher: ['/api/v1/:path*', '/api/health'],
};
