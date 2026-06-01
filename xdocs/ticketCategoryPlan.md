# Goal Description

Add a new `TicketCategory` table with standardized 3-character codes to optimize database storage and references. We will also create a new module with CRUD endpoints so that these ticket categories can be managed via API, and we will update the existing `TicketType` model to reference this new category.

## User Review Required

> [!IMPORTANT]
> Since this is a microservices architecture, we need to decide which service should own the `TicketCategory` model and its CRUD endpoints. 
> 
> **My recommendation:** Add this to the **Partner Service** (`services/partner`), because the `TicketType` model (which will reference these categories) is already located there. Putting it in the Partner Service avoids cross-service synchronous database joins when validating event creation.
>
> If you prefer this to be centrally managed in the **Admin Service** instead, please let me know. 

## Proposed Changes

---

### Prisma Schema (Partner Service)

#### [MODIFY] [schema.prisma](file:///Users/abhishekyadav/Documents/project/tikitu-portfolio-projects/tikitu-app-microservices/services/partner/prisma/schema.prisma)
- **Add Enum**: `TicketCategoryCode` with values `EBD`, `PH2`, `PH3`, `PH4`, `LSL`, `CUP`, `GRL`, `STD`, `GR4`, `PL4`.
- **Add Model**: `TicketCategory` containing `code` (as `@id`), `name`, `description`, `isActive`, and timestamps.
- **Update Model**: `TicketType` to include `categoryCode TicketCategoryCode`, adding a foreign key relation to `TicketCategory`.

---

### NestJS CRUD Endpoints (Partner Service)

#### [NEW] [ticket-categories.module.ts](file:///Users/abhishekyadav/Documents/project/tikitu-portfolio-projects/tikitu-app-microservices/services/partner/src/ticket-categories/ticket-categories.module.ts)
- Create a new module to handle `TicketCategory` logic.

#### [NEW] [ticket-categories.controller.ts](file:///Users/abhishekyadav/Documents/project/tikitu-portfolio-projects/tikitu-app-microservices/services/partner/src/ticket-categories/ticket-categories.controller.ts)
- Expose REST endpoints: 
  - `GET /api/v1/partner/ticket-categories` (List all categories)
  - `GET /api/v1/partner/ticket-categories/:code` (Get specific category)
  - `POST /api/v1/partner/ticket-categories` (Create category - Admin/Superuser)
  - `PATCH /api/v1/partner/ticket-categories/:code` (Update category)
  - `DELETE /api/v1/partner/ticket-categories/:code` (Delete/Deactivate category)

#### [NEW] [ticket-categories.service.ts](file:///Users/abhishekyadav/Documents/project/tikitu-portfolio-projects/tikitu-app-microservices/services/partner/src/ticket-categories/ticket-categories.service.ts)
- Implement the business logic to interact with Prisma for the CRUD operations.

#### [MODIFY] [app.module.ts](file:///Users/abhishekyadav/Documents/project/tikitu-portfolio-projects/tikitu-app-microservices/services/partner/src/app.module.ts)
- Register the new `TicketCategoriesModule`.

## Verification Plan

### Automated Tests
- Run `npm run prisma:generate` to regenerate the Prisma client.
- Run `npm run prisma:migrate` to create the database tables.

### Manual Verification
- Seed the database with the default categories using the new `POST` endpoint.
- Verify that a `GET` request retrieves the newly created categories.
- Ensure the TypeScript compiler `npm run build` succeeds without errors for the Partner service.
