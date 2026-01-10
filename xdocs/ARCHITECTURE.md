# Tikitu Microservices Architecture

## System Architecture

This document describes the architecture of the Tikitu ticket booking microservices system.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend Application                       │
│                         (React/Next.js Client)                       │
└────────────────────────────┬───────────────────────────────────────┘
                             │ HTTPS + JWT Token
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                    API Gateway (AuthRoute)                          │
│                         Port 3000                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ - JWT Token Verification (AWS Cognito)                       │ │
│  │ - Request Routing                                            │ │
│  │ - CORS & Security Headers                                    │ │
│  │ - Rate Limiting (Future)                                     │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───┬────────┬────────┬────────┬────────┬────────┬──────────────────┘
    │        │        │        │        │        │
    │        │        │        │        │        │
┌───▼───┐┌──▼────┐┌──▼────┐┌──▼────┐┌──▼────┐┌──▼────┐
│ Admin ││Partner││Payment││Notif.  ││Booking││ User  │
│ :3001 ││:3002  ││:3003  ││:3004   ││:3005  ││:3006  │
└───┬───┘└───┬───┘└───┬───┘└───┬────┘└───┬───┘└───┬───┘
    │        │        │        │         │        │
    │        │        │        │         │        │
┌───▼───┐┌──▼────┐┌──▼────┐┌──▼─────┐┌──▼────┐┌──▼────┐
│Admin  ││Partner││Payment││Notif.   ││Booking││ User  │
│  DB   ││  DB   ││  DB   ││  DB     ││  DB   ││  DB   │
└───────┘└───────┘└───────┘└─────────┘└───────┘└───────┘
```

## Service Descriptions

### 1. API Gateway (AuthRoute Service)

**Purpose**: Single entry point for all client requests

**Responsibilities**:
- Authenticate requests using AWS Cognito JWT tokens
- Route requests to appropriate microservices
- Handle CORS and security headers
- Provide unified error responses
- Monitor service health

**Technology**: Next.js with custom middleware

**Port**: 3000

### 2. Admin Service

**Purpose**: Administrative operations and system management

**Responsibilities**:
- Admin user management
- System configuration
- Audit logging
- Platform analytics

**Database**: admin_db (PostgreSQL)
**Port**: 3001

**Key Models**:
- Admin
- AuditLog

### 3. Partner Service

**Purpose**: Manage venue partners and their venues

**Responsibilities**:
- Partner registration and verification
- Venue management
- Partner analytics
- Commission management

**Database**: partner_db (PostgreSQL)
**Port**: 3002

**Key Models**:
- Partner
- Venue

### 4. Payment Service

**Purpose**: Handle all payment transactions

**Responsibilities**:
- Payment processing
- Transaction management
- Refund handling
- Payment gateway integration
- Payment logging

**Database**: payment_db (PostgreSQL)
**Port**: 3003

**Key Models**:
- Payment
- PaymentLog

### 5. Notification Service

**Purpose**: Multi-channel notification delivery

**Responsibilities**:
- Send notifications (Email, SMS, Push, In-App)
- Manage notification templates
- Handle user preferences
- Track notification delivery status
- Integration with AWS SES and SNS

**Database**: notification_db (PostgreSQL)
**Port**: 3004

**Key Models**:
- Notification
- NotificationTemplate
- NotificationPreference

### 6. Booking Service

**Purpose**: Core ticket booking functionality

**Responsibilities**:
- Event management
- Booking creation and management
- Ticket generation and validation
- Seat management
- Booking cancellation

**Database**: booking_db (PostgreSQL)
**Port**: 3005

**Key Models**:
- Event
- Booking
- Ticket

### 7. User Service

**Purpose**: User profile and preference management

**Responsibilities**:
- User profile management
- User preferences
- Address management
- User authentication metadata

**Database**: user_db (PostgreSQL)
**Port**: 3006

**Key Models**:
- User
- UserPreference
- Address

## Authentication Flow

```
┌────────┐      ┌──────────┐      ┌────────────┐      ┌─────────────┐
│ Client │      │AWS Cognito│      │API Gateway │      │Microservice │
└───┬────┘      └─────┬────┘      └──────┬─────┘      └──────┬──────┘
    │                 │                  │                   │
    │ 1. Login        │                  │                   │
    ├────────────────>│                  │                   │
    │                 │                  │                   │
    │ 2. JWT Token    │                  │                   │
    │<────────────────┤                  │                   │
    │                 │                  │                   │
    │ 3. Request + JWT│                  │                   │
    ├─────────────────┴─────────────────>│                   │
    │                                    │                   │
    │                                    │ 4. Verify JWT     │
    │                                    │ (AWS Cognito)     │
    │                                    │                   │
    │                                    │ 5. Forward Request│
    │                                    ├──────────────────>│
    │                                    │                   │
    │                                    │ 6. Response       │
    │                                    │<──────────────────┤
    │                                    │                   │
    │ 7. Response                        │                   │
    │<───────────────────────────────────┤                   │
    │                                    │                   │
```

## Inter-Service Communication

Currently, services are independent and communicate through the API Gateway. Future enhancements may include:

- **Direct Service-to-Service**: For internal operations
- **Message Queue**: For async operations (RabbitMQ/AWS SQS)
- **Event Bus**: For event-driven architecture
- **Service Mesh**: For advanced routing and observability

## Database Architecture

### Database per Service Pattern

Each microservice has its own PostgreSQL database:

**Benefits**:
- Service independence
- Technology flexibility
- Scalability
- Fault isolation

**Considerations**:
- Data consistency (eventual consistency)
- Distributed transactions (use Saga pattern if needed)
- Data duplication (acceptable for microservices)

### Sample Schema Relationships

```
User Service:
  User ──┬── UserPreference
         └── Address[]

Partner Service:
  Partner ── Venue[]

Booking Service:
  Event ── Booking[] ── Ticket[]

Payment Service:
  Payment ── PaymentLog[]

Notification Service:
  Notification
  NotificationTemplate
  NotificationPreference
```

## API Versioning Strategy

All APIs follow versioned endpoints: `/api/v1/{service}/{endpoint}`

**Example**:
- `/api/v1/booking/events`
- `/api/v1/user/profile`
- `/api/v1/payment/transactions`

**Future Versions**:
- `/api/v2/{service}/{endpoint}` - with backward compatibility

## Security Architecture

### Authentication
- **AWS Cognito** for user authentication
- **JWT tokens** for API authentication
- **Token verification** at API Gateway level

### Authorization
- **Cognito User Groups**: admin, partner, user
- **Role-based access control** at service level
- **Resource-level permissions** in business logic

### Data Security
- **HTTPS** for all communications
- **Environment variables** for secrets
- **Database encryption** at rest
- **SQL injection protection** via Prisma ORM

## Scalability Considerations

### Horizontal Scaling
Each service can be scaled independently:
- Deploy multiple instances
- Use load balancer
- Stateless services design

### Database Scaling
- Connection pooling
- Read replicas
- Database sharding (if needed)

### Caching Strategy (Future)
- Redis for session management
- API response caching
- Database query caching

## Monitoring & Observability (Future)

### Metrics
- Service health checks
- Response times
- Error rates
- Request throughput

### Logging
- Centralized logging (ELK stack)
- Structured logging
- Log correlation with request IDs

### Tracing
- Distributed tracing (Jaeger/Zipkin)
- Request flow tracking
- Performance bottleneck identification

## Deployment Architecture

### Development
- Local development with npm workspaces
- PostgreSQL on localhost
- Individual service ports

### Staging/Production
- **Container Orchestration**: Kubernetes or AWS ECS
- **Database**: AWS RDS (PostgreSQL)
- **API Gateway**: AWS API Gateway or custom
- **Load Balancing**: AWS ALB/NLB
- **CDN**: CloudFront
- **Monitoring**: CloudWatch, DataDog

### CI/CD Pipeline (Recommended)
```
Code Push → GitHub Actions → Build → Test → Deploy
    │
    ├─> Build Docker Images
    ├─> Run Unit Tests
    ├─> Run Integration Tests
    ├─> Security Scanning
    └─> Deploy to Environment
```

## Disaster Recovery

### Backup Strategy
- Automated database backups
- Point-in-time recovery
- Cross-region replication

### Failover
- Multi-AZ deployment
- Health checks and auto-recovery
- Circuit breaker pattern

## Future Enhancements

1. **Service Mesh** (Istio/Linkerd)
   - Advanced routing
   - Observability
   - Security

2. **Event-Driven Architecture**
   - Message queues (RabbitMQ/AWS SQS)
   - Event streaming (Kafka)

3. **API Documentation**
   - Swagger/OpenAPI
   - GraphQL API

4. **Advanced Monitoring**
   - APM (Application Performance Monitoring)
   - Real-time alerts
   - Custom dashboards

5. **Rate Limiting & Throttling**
   - API rate limits
   - DDoS protection

6. **WebSocket Support**
   - Real-time notifications
   - Live booking updates

7. **Background Jobs**
   - Scheduled tasks
   - Async processing
   - Job queues

## Technology Stack Summary

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | AWS Cognito |
| API Gateway | Next.js Middleware |
| Container | Docker |
| Orchestration | Kubernetes/ECS (Production) |

## Contact & Support

For architecture questions or suggestions:
- Create an issue in the repository
- Contact the architecture team
- Review the detailed README.md

---

Last Updated: November 2025

