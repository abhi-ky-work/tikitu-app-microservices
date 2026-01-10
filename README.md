# Tikitu - Microservices Backend

A scalable microservices-based backend for a ticket booking application built with Next.js, Prisma, and AWS Cognito.

## 🏗️ Architecture Overview

This project uses a microservices architecture with the following services:

```
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (Port 3000)                    │
│                      AuthRoute Service                        │
│           (Authentication & Request Routing)                  │
└─────────────┬───────────────────────────────────────────────┘
              │
    ┌─────────┴──────────┬──────────────┬──────────────┬───────────────┬──────────────┐
    │                    │              │              │               │              │
┌───▼────┐      ┌────────▼─────┐  ┌───▼──────┐  ┌────▼──────┐  ┌────▼──────┐  ┌────▼─────┐
│ Admin  │      │   Partner    │  │ Payment  │  │Notification│  │  Booking  │  │   User   │
│ :3001  │      │    :3002     │  │  :3003   │  │   :3004    │  │   :3005   │  │  :3006   │
└────────┘      └──────────────┘  └──────────┘  └───────────┘  └───────────┘  └──────────┘
```

## 🚀 Services

### 1. **AuthRoute Gateway** (Port 3000)
- Entry point for all API requests
- JWT token validation using AWS Cognito
- Routes requests to appropriate microservices
- Handles CORS and security headers

### 2. **Admin Service** (Port 3001)
- Admin user management
- Audit logging
- System configuration

### 3. **Partner Service** (Port 3002)
- Venue partner management
- Venue management
- Partner verification

### 4. **Payment Service** (Port 3003)
- Payment processing
- Transaction management
- Refund handling
- Payment gateway integration support

### 5. **Notification Service** (Port 3004)
- Multi-channel notifications (Email, SMS, Push, In-App)
- Notification templates
- User notification preferences
- AWS SES and SNS integration

### 6. **Booking Service** (Port 3005)
- Event management
- Booking management
- Ticket generation and validation
- Seat management

### 7. **User Service** (Port 3006)
- User profile management
- User preferences
- Address management

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **AWS Account** (for Cognito authentication)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd tikitu-microservices
```

### 2. Install dependencies

```bash
npm install
```

This will install dependencies for all microservices using npm workspaces.

### 3. Set up environment variables

Create a `.env` file in the root directory and each service directory with the following variables:

#### Root `.env` file:

```env
# AWS Cognito Configuration
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=your-user-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id
AWS_COGNITO_ISSUER=https://cognito-idp.{region}.amazonaws.com/{userPoolId}

# Service Ports
ADMIN_SERVICE_PORT=3001
PARTNER_SERVICE_PORT=3002
PAYMENT_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004
BOOKING_SERVICE_PORT=3005
USER_SERVICE_PORT=3006
AUTH_ROUTE_SERVICE_PORT=3000

# Database URLs (one per microservice)
ADMIN_DATABASE_URL="postgresql://user:password@localhost:5432/admin_db"
PARTNER_DATABASE_URL="postgresql://user:password@localhost:5432/partner_db"
PAYMENT_DATABASE_URL="postgresql://user:password@localhost:5432/payment_db"
NOTIFICATION_DATABASE_URL="postgresql://user:password@localhost:5432/notification_db"
BOOKING_DATABASE_URL="postgresql://user:password@localhost:5432/booking_db"
USER_DATABASE_URL="postgresql://user:password@localhost:5432/user_db"

# Node Environment
NODE_ENV=development

# Service URLs (for AuthRoute Gateway)
ADMIN_SERVICE_URL=http://localhost:3001
PARTNER_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004
BOOKING_SERVICE_URL=http://localhost:3005
USER_SERVICE_URL=http://localhost:3006
```

### 4. Set up databases

Create PostgreSQL databases for each microservice:

```bash
createdb admin_db
createdb partner_db
createdb payment_db
createdb notification_db
createdb booking_db
createdb user_db
```

### 5. Generate Prisma clients and run migrations

```bash
# Generate Prisma clients for all services
npm run prisma:generate

# Run migrations for each service
cd services/admin && npm run prisma:migrate
cd ../partner && npm run prisma:migrate
cd ../payment && npm run prisma:migrate
cd ../notification && npm run prisma:migrate
cd ../booking && npm run prisma:migrate
cd ../user && npm run prisma:migrate
cd ../..
```

## 🚀 Running the Application

### Run all services concurrently

```bash
npm run dev:all
```

### Run individual services

```bash
# AuthRoute Gateway (API Gateway)
npm run dev:auth-route

# Admin Service
npm run dev:admin

# Partner Service
npm run dev:partner

# Payment Service
npm run dev:payment

# Notification Service
npm run dev:notification

# Booking Service
npm run dev:booking

# User Service
npm run dev:user
```

## 📡 API Endpoints

All requests go through the API Gateway at `http://localhost:3000`

### Health Check Endpoints

```bash
# Gateway health
GET http://localhost:3000/api/health

# Service health checks
GET http://localhost:3000/api/v1/admin/health
GET http://localhost:3000/api/v1/partner/health
GET http://localhost:3000/api/v1/payment/health
GET http://localhost:3000/api/v1/notification/health
GET http://localhost:3000/api/v1/booking/health
GET http://localhost:3000/api/v1/user/health
```

### API Versioning

All APIs follow the versioning pattern: `/api/v1/{service}/{endpoint}`

Examples:
- `/api/v1/booking/events`
- `/api/v1/user/profile`
- `/api/v1/admin/users`
- `/api/v1/partner/venues`
- `/api/v1/payment/transactions`
- `/api/v1/notification/send`

## 🔐 Authentication

### AWS Cognito Setup

1. Create a User Pool in AWS Cognito
2. Create an App Client
3. Configure User Groups: `admin`, `partner`, `user`
4. Update environment variables with your Cognito details

### Making Authenticated Requests

Include the JWT token in the Authorization header:

```bash
curl -X GET http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_COGNITO_JWT_TOKEN"
```

### Public Routes (No Authentication Required)

- `/api/v1/user/register`
- `/api/v1/booking/events`
- All health check endpoints

## 🗄️ Database Schema

Each microservice has its own PostgreSQL database with Prisma ORM. See individual service README files for detailed schema information:

- [Admin Schema](./services/admin/README.md)
- [Partner Schema](./services/partner/README.md)
- [Payment Schema](./services/payment/README.md)
- [Notification Schema](./services/notification/README.md)
- [Booking Schema](./services/booking/README.md)
- [User Schema](./services/user/README.md)

## 🏗️ Project Structure

```
tikitu-microservices/
├── services/
│   ├── auth-route/         # API Gateway (Port 3000)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── services.ts
│   │   │   │   └── proxy.ts
│   │   │   └── middleware.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── admin/              # Admin Service (Port 3001)
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   └── api/v1/health/
│   │   │   └── lib/
│   │   │       ├── auth.ts
│   │   │       └── prisma.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── partner/            # Partner Service (Port 3002)
│   ├── payment/            # Payment Service (Port 3003)
│   ├── notification/       # Notification Service (Port 3004)
│   ├── booking/            # Booking Service (Port 3005)
│   └── user/               # User Service (Port 3006)
│
├── package.json            # Root package.json with workspaces
├── .gitignore
└── README.md
```

## 🔧 Development

### Adding a New Microservice

1. Create a new directory under `services/`
2. Initialize Next.js with TypeScript
3. Add Prisma with appropriate schema
4. Implement health check endpoint at `/api/v1/health`
5. Add authentication middleware
6. Update the AuthRoute gateway to include the new service
7. Update root `package.json` workspace scripts

### Database Migrations

```bash
# Create a new migration
cd services/{service-name}
npm run prisma:migrate

# View database in Prisma Studio
npm run prisma:studio
```

### Building for Production

```bash
# Build all services
npm run build:all

# Or build individually
cd services/{service-name}
npm run build
```

## 📦 Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: AWS Cognito
- **API Architecture**: Microservices with API Gateway
- **HTTP Client**: Axios

## 🧪 Testing

```bash
# Run tests for all services
npm test --workspaces

# Run tests for a specific service
npm test --workspace=services/{service-name}
```

## 🚢 Deployment

Each microservice can be deployed independently. Recommended deployment options:

- **AWS ECS/EKS**: For containerized deployments
- **AWS Lambda**: For serverless deployments
- **Vercel**: For Next.js deployments
- **Docker**: For containerization

### Docker Deployment (Example)

```dockerfile
# Dockerfile for a microservice
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "start"]
```

## 📝 Environment Variables Reference

### Required for All Services
- `AWS_COGNITO_USER_POOL_ID`
- `AWS_COGNITO_CLIENT_ID`
- `AWS_REGION`
- `NODE_ENV`

### Service-Specific
- `{SERVICE}_DATABASE_URL` - PostgreSQL connection string
- `{SERVICE}_SERVICE_URL` - Service URL (for gateway)
- `{SERVICE}_SERVICE_PORT` - Service port

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Roadmap

- [ ] Add comprehensive unit and integration tests
- [ ] Implement rate limiting
- [ ] Add API documentation with Swagger/OpenAPI
- [ ] Implement distributed tracing
- [ ] Add monitoring and logging (ELK stack)
- [ ] Implement caching (Redis)
- [ ] Add message queue (RabbitMQ/AWS SQS)
- [ ] Implement circuit breaker pattern
- [ ] Add Docker Compose configuration
- [ ] Implement Kubernetes deployment manifests

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito)
- [Microservices Pattern](https://microservices.io)

---

Built with ❤️ for Tikitu Ticket Booking Platform

