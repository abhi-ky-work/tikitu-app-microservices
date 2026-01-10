# Booking Microservice

Booking service for managing ticket bookings, events, and tickets in the Tikitu ticket booking system.

## Features

- AWS Cognito authentication
- Event management
- Booking management
- Ticket generation and validation
- Seat management
- Health check endpoint

## API Endpoints

### Health Check
- `GET /api/v1/health` - Service health status

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
BOOKING_DATABASE_URL="postgresql://user:password@localhost:5432/booking_db"
AWS_COGNITO_USER_POOL_ID=your-user-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id
AWS_REGION=us-east-1
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Start the service:
```bash
npm run dev
```

The service will run on http://localhost:3005

