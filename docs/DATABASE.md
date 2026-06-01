# Database Strategy

All microservices use **PostgreSQL** as the primary database (one database per service).

## Per-service databases

| Service | Database | Purpose |
|---------|----------|---------|
| User | `user_db` | Consumer profiles, preferences, addresses |
| Partner | `partner_db` | Business accounts, venues, catalog events, ticket types |
| Booking | `booking_db` | Event inventory, bookings, tickets |
| Payment | `payment_db` | Payments, outbox |
| Notification | `notification_db` | Notification delivery state |
| Admin | `admin_db` | Admin users, audit logs |

## Schema flexibility

Use **JSONB `metadata`** on Partner `Venue` and `Event` for vertical-specific fields (arenas, corporate events) without MongoDB.

## Read scaling

- **Redis** — cache public event discovery (`GET /api/v1/booking/events`)
- **Read replicas** — set `BOOKING_DATABASE_READ_URL`, `USER_DATABASE_READ_URL` (same URL as primary in dev)
- **OpenSearch** — set `OPENSEARCH_URL` when full-text search is required

## Partitioning (production)

Partition large tables by month:

- `event_inventory` / catalog `Event` by `eventDate`
- `Booking`, `Ticket`, `Payment` by `createdAt`

## Cross-service IDs

| ID | Source |
|----|--------|
| `cognitoId` | AWS Cognito `sub` |
| `userId` | User service UUID |
| `partnerId` | Partner service UUID |
| `catalogEventId` | Partner catalog `Event.id` |
| `venueId` | Partner `Venue.id` |

Never store Cognito `sub` as `partnerId` in booking inventory.
