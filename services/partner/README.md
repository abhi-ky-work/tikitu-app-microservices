# Partner Microservice

Partner service for managing venue partners and their venues in the Tikitu ticket booking system.

## Features

- AWS Cognito authentication
- Partner management
- Venue management
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
PARTNER_DATABASE_URL="postgresql://user:password@localhost:5432/partner_db"
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

The service will run on http://localhost:3002

