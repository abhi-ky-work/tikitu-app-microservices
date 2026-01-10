# Payment Microservice

Payment service for handling payment processing and transactions in the Tikitu ticket booking system.

## Features

- AWS Cognito authentication
- Payment processing
- Transaction management
- Payment gateway integration support
- Refund handling
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
PAYMENT_DATABASE_URL="postgresql://user:password@localhost:5432/payment_db"
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

The service will run on http://localhost:3003

