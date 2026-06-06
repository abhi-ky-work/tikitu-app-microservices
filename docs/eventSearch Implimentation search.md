# Event Search Ingestion & Publish Workflow Implementation Plan

Based on your feedback, we will proceed with creating the `eventSearch` NestJS microservice, utilizing **Kafka** as our message broker, and **OpenSearch** as our search engine. 

As requested, we will skip the data synchronization script for now and focus purely on establishing the ingestion pipeline (Event creation flow ➔ Kafka ➔ eventSearch ➔ OpenSearch).

## User Review Required

Please review the proposed architectural and UI workflow changes below before I begin execution.

## Proposed Changes

### Phase 1: Infrastructure Expansion (Docker)
- Update `/docker-compose.yml` to include:
  - **OpenSearch** (single-node cluster, port 9200)
  - **Kafka** (Zookeeper & Kafka brokers, port 9092)

### Phase 2: Frontend Workflow (UI)
- **Modify `create-event/page.tsx`**:
  - Change the primary "Publish Event" button text to **"Save Draft"**.
  - When the user clicks "Save Draft", it hits the existing `POST /api/v1/partner/events` endpoint (which creates the event with `eventStatus: 0` or `DRAFT` in the DB).
  - Upon successful draft save, flip the UI state to show a **"Preview"** button instead of "Save Draft". (We'll store the newly created `eventId` in the component state).
  - Clicking **"Preview"** triggers a Modal component (`PreviewEventModal`).
  - Inside `PreviewEventModal`, there will be a **"Publish"** button.
  - Clicking "Publish" makes a `POST /api/v1/partner/events/:id/publish` call.

### Phase 3: Partner Service (Producer)
- **Install Kafka Client**: Add `@nestjs/microservices` and `kafkajs` to the `partner` service `package.json`.
- **Kafka Producer Setup**: Configure a `KafkaClient` module inside the partner service that connects to `localhost:9092`.
- **Publish Endpoint**: 
  - Expose `POST /events/:id/publish` in `events.controller.ts`.
  - Update `events.service.ts` to fetch the event, update `eventStatus` to `PUBLISHED` (or `1`).
  - After DB update, emit an `EventPublished` message payload (containing event ID, location, title, etc.) to the Kafka topic `event.published`.

### Phase 4: Event Search Service (Consumer)
- **Scaffold Service**: Generate a new NestJS application `eventSearch` inside `/services/eventSearch`.
- **Dependencies**: Install `@nestjs/microservices`, `kafkajs`, `@opensearch-project/opensearch`, and `ioredis`.
- **Module Configuration**: 
  - Connect NestJS Microservice to Kafka broker listening on `event.published` topic.
  - Initialize OpenSearch client connection to `localhost:9200`.
- **Ingestion Controller (`ingestion.controller.ts`)**: 
  - Implement `@EventPattern('event.published')` to consume the payload.
  - Map the payload to the OpenSearch index format (ensuring `geo_point` mapping for location).
  - Execute the index operation into OpenSearch.

## Verification Plan
1. Ensure `docker-compose up` cleanly boots Kafka and OpenSearch alongside Postgres.
2. Go through the frontend UI: create an event, ensure it's saved as DRAFT, preview it, and hit Publish.
3. Check Partner Service logs to confirm `EventPublished` Kafka message was emitted.
4. Check `eventSearch` service logs to confirm Kafka message was consumed.
5. Query the OpenSearch `events` index directly via cURL to ensure the document was ingested successfully.
