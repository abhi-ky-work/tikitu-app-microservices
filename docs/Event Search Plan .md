Act as an expert Principal Software Engineer and Systems Architect. I need you to generate a production-ready implementation plan and code templates for a **Location-Based Event Search Service** utilizing a microservices architecture. 

The system must handle a scale of **100,000+ concurrent users** querying events near major metro areas (e.g., Bangalore, Delhi-NCR) without degrading performance or overloading the primary data stores.

---

### 1. System Topology & Flow Requirements
The system must follow an event-driven, decoupled read/write architecture:
1. **Write Path (Transactional):** An Event Management Service saves event listings (with `title`, `category`, `date`, `city`, and `lat/lon` coordinates) to a primary relational database (PostgreSQL/MySQL). It then emits an `EventCreated` payload to a message broker (Kafka/RabbitMQ).
2. **Read Path (Search Ingestion):** The Search Service consumes the message, indexes the document into Elasticsearch, and updates the relevant Redis autocomplete indexes.
3. **Query Path (User Browsing):** The client application talks exclusively to the Search Service, hitting Redis first for localized, pre-computed cache queries before falling back to Elasticsearch.

---

### 2. Component Specifications & Data Modeling

#### A. Elasticsearch Index & Mapping
Define an explicit mapping for the `events` index. 
- Ensure that the `location` field utilizes the `geo_point` data type.
- Optimize the `title` field for text analysis with fuzzy capabilities.
- Keep `category`, `city`, and `date` optimized for exact filter matching.

#### B. Redis Cache Layers
Implement three distinct Redis data structures to maximize cache-hit ratios and prevent cache bloat:

1. **Tier 1: Static Category Dropdown (Pre-fetched)**
   - **Structure:** Redis `SET` per city.
   - **Key:** `city:{city_name}:categories`
   - **Goal:** Prefetched by frontend on landing to populate standard dropdown options (e.g., "music-concert", "sports").

2. **Tier 2: Real-time Autocomplete Suggestions (Prefix Matching)**
   - **Structure:** Redis Sorted Set (`ZSET`) per city using alphabetical prefix weighting (scores set to `0`).
   - **Key:** `autocomplete:city:{city_name}`
   - **Goal:** Real-time prefix scanning using `ZRANGEBYSCORE` or `ZRANGE` with `[lex]` matching as users type specific event names (e.g., typing "pun" suggests "punjabi night*").

3. **Tier 3: Hybrid Geohash & Query Result Cache**
   - **Structure:** Key-Value strings holding paginated, sorted JSON arrays of the top 20 closest events.
   - **Key Format:** `search:city:{city}:geohash:{g_hash}:date:{YYYYMMDD}:q:{sanitized_query}:page:{page_num}`
   - **Caching Strategy:** - Backend must normalize high-precision GPS coordinates into a **Level 5 or 6 Geohash** (~1km to 5km area) to serve as the `{g_hash}` placeholder.
     - Enforce a strict Time-To-Live (TTL) of **2 to 5 minutes** to prevent memory explosion from ad-hoc searches.
     - Implement query sanitization (lowercasing, trimming, removing special characters) before evaluating the cache key.

---

### 3. Core Logic & API Endpoints to Implement

Please generate clean, optimized boilerplate code (Node.js/TypeScript, Python, or Go—whichever is best for performance) for the following components:

1. **The Ingestion Handler:**
   Code that consumes the event from the message bus, indexes it to Elasticsearch, and splits the event title into prefixes to push into the Redis `ZSET` autocomplete directory.

2. **The Search API Handler (`GET /api/v1/events/search`):**
   Logic that accepts `lat`, `lon`, `date`, `q` (search string), and `page`. It must:
   - Convert `lat/lon` to a Geohash.
   - Clean the query string `q`.
   - Construct the Tier 3 Redis key and perform a cache lookup.
   - On a **Cache Hit**, return the payload immediately.
   - On a **Cache Miss**, execute an Elasticsearch query that combines a fuzzy text match on `title` (`fuzziness: "AUTO"`), a `geo_distance` filter (e.g., 5km), and orders results by `_geo_distance` ascending. Populates Redis with a 5-minute TTL before returning the data.

3. **The Autocomplete API Handler (`GET /api/v1/events/autocomplete`):**
   Logic that queries the Redis Sorted Set using lexically bounded constraints to return the top 5 closest phrase completions matching the user's partial keystrokes.