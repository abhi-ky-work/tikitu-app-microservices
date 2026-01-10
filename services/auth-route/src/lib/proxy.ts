import axios, { AxiosRequestConfig } from 'axios';
import { NextRequest } from 'next/server';

export async function proxyRequest(
  targetUrl: string,
  request: NextRequest,
  path: string
): Promise<Response> {
  const url = new URL(request.url);
  const targetEndpoint = `${targetUrl}/api/v1/${path}${url.search}`;

  try {
    const config: AxiosRequestConfig = {
      method: request.method,
      url: targetEndpoint,
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      validateStatus: () => true, // Don't throw on any status
    };

    // Add body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const body = await request.text();
        if (body) {
          config.data = body;
        }
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }

    const response = await axios(config);

    return new Response(
      typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
      {
        status: response.status,
        headers: {
          'Content-Type': response.headers['content-type'] || 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Proxy request failed:', error);
    return new Response(
      JSON.stringify({
        error: 'Service unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

