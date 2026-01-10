# Notification Microservice

Notification service for managing email, SMS, push, and in-app notifications in the Tikitu ticket booking system.

## Features

- AWS Cognito authentication
- Multi-channel notifications (Email, SMS, Push, In-App)
- Notification templates
- User notification preferences
- AWS SES and SNS integration support
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
NOTIFICATION_DATABASE_URL="postgresql://user:password@localhost:5432/notification_db"
AWS_COGNITO_USER_POOL_ID=your-user-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@example.com
AWS_SNS_TOPIC_ARN=your-sns-topic-arn
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

The service will run on http://localhost:3004

