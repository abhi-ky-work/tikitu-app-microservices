# Tikitu Microservices - Project Analysis & Strategy

This document captures the architectural understanding and strategic design decisions for the Tikitu Ticket Booking Platform.

## 1. Project Overview
**Tikitu** is a scalable, microservices-based backend for a ticket booking application.

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Database-per-service pattern)
- **Authentication:** AWS Cognito (JWT-based)
- **API Gateway:** Custom Next.js implementation (AuthRoute)

### Core Architecture
The system uses an **API Gateway** as the single entry point (`:3000`), routing requests to specialized downstream services:
- **Admin (`:3001`):** Platform management and audit logs.
- **Partner (`:3002`):** Venue and vendor management.
- **Payment (`:3003`):** Financial transactions and gateway integration.
- **Notification (`:3004`):** Multi-channel messaging (SES/SNS).
- **Booking (`:3005`):** Core event logic and inventory management.
- **User (`:3006`):** Customer profiles and preferences.

---

## 2. Service Boundaries & Business Use Cases

### AuthRoute (Gateway)
- **Boundary:** Entry/Exit logic only.
- **Use Cases:** JWT validation, rate limiting, CORS enforcement, and unified error mapping.

### User Service (Identity Context)
- **Boundary:** Individual customer lifecycle.
- **Use Cases:** Profile management, KYC, "Favorite" venues/events, and address management.

### Partner Service (Vendor Context)
- **Boundary:** Relationship between the platform and sellers (Venues/Promoters).
- **Use Cases:** Partner onboarding, commission management, venue physical attributes (seating charts), and performance analytics.

### Booking Service (Core Transaction Context)
- **Boundary:** Inventory, Scheduling, and Order fulfillment.
- **Use Cases:** Event scheduling, real-time seat inventory, ticket generation (QR codes), and booking state machines.

### Payment Service (Financial Context)
- **Boundary:** External financial gateways.
- **Use Cases:** Payment intent creation, refund processing, ledger maintenance, and tax calculations.

### Notification Service (Communication Context)
- **Boundary:** Abstracted messaging logic.
- **Use Cases:** Email/SMS dispatching, template management, and user preference filtering.

### Admin Service (Control Plane)
- **Boundary:** Operational overrides.
- **Use Cases:** Global configuration, manual refund approvals, platform-wide audit logging, and dispute resolution.

---

## 3. Data Strategy: Event Metadata Location

**Decision:** Event Meta Details must reside in the **Booking Service**.

### Rationale:
1. **Transactional Integrity:** High-traffic "Book a Seat" operations require immediate access to event availability. Keeping events in the Booking service avoids expensive cross-service calls during the critical path of a transaction.
2. **Search & Discovery:** The Booking service is the natural owner of "Inventory." Users searching for events are essentially querying available inventory.
3. **Product vs. Seller Distinction:** 
   - **Partner Service** manages the *Seller* (The Entity).
   - **Booking Service** manages the *Product/SKU* (The Inventory).

### Implementation Workflow:
- **Partner Service** manages `Venue` (Static location data).
- **Booking Service** manages `Event` (The specific instance: price, time, description, total seats).
- The `Event` record in Booking DB references `venueId` and `partnerId` as foreign keys.
