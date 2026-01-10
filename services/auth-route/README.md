# AuthRoute Gateway Service

API Gateway service for authenticating and routing requests to microservices in the Tikitu ticket booking system.

## Features

- AWS Cognito authentication and authorization
- Request routing to appropriate microservices
- Centralized authentication checking
- Service health monitoring
- Request/response proxying

## Architecture

The AuthRoute gateway acts as a single entry point for all client requests. It:
1. Validates AWS Cognito JWT tokens
2. Routes authenticated requests to the appropriate microservice
3. Handles CORS and headers
4. Provides unified error handling

## API Gateway Routes

All requests follow the pattern: `http://localhost:3000/api/v1/{service}/{endpoint}`

### Service Routing

- `/api/v1/admin/*` → Admin Service (Port 3001)
- `/api/v1/partner/*` → Partner Service (Port 3002)
- `/api/v1/payment/*` → Payment Service (Port 3003)
- `/api/v1/notification/*` → Notification Service (Port 3004)
- `/api/v1/booking/*` → Booking Service (Port 3005)
- `/api/v1/user/*` → User Service (Port 3006)

### Health Check

- `GET /api/health` - Gateway health status and service configuration

### Public Routes (No Authentication Required)

- `/api/v1/user/register`
- `/api/v1/booking/events`
- All health check endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# AWS Cognito
AWS_COGNITO_USER_POOL_ID=your-user-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id
AWS_REGION=us-east-1

# Service URLs
ADMIN_SERVICE_URL=http://localhost:3001
PARTNER_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004
BOOKING_SERVICE_URL=http://localhost:3005
USER_SERVICE_URL=http://localhost:3006
```

3. Start the gateway:
```bash
npm run dev
```

The gateway will run on http://localhost:3000

## Usage Example

### With Authentication

```bash
curl -X GET http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_COGNITO_TOKEN"
```

### Public Endpoint (No Auth)

```bash
curl -X GET http://localhost:3000/api/v1/booking/events
```

## Security

- All routes require valid AWS Cognito JWT tokens (except public routes)
- Tokens are verified on every request
- Invalid or expired tokens receive 401 Unauthorized responses
- Role-based access control is enforced at the service level

