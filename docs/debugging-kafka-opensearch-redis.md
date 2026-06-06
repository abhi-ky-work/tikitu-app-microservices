# Debugging & Inspecting Ingestion Components

This guide provides command-line instructions for inspecting, querying, and verifying entries in **Kafka**, **OpenSearch**, and **Redis** when debugging the event publishing pipeline.

---

## 1. Inspecting Kafka Broker (`tikitu-kafka`)

You can consume messages from the `event.published` topic directly from the terminal to see if the `partner-service` is successfully publishing payloads.

### Read Messages from the Beginning
```bash
docker exec -it tikitu-kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic event.published \
  --from-beginning
```

### Describe Topic Configuration
```bash
docker exec -it tikitu-kafka kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --topic event.published
```

---

## 2. Querying OpenSearch Database (`tikitu-opensearch`)

OpenSearch exposes its REST API on port `9200`. You can query indices and documents using standard `curl` commands.

### Check Index Health & Document Count
```bash
curl -s http://localhost:9200/_cat/indices/events?v
```

### Search All Indexed Events
```bash
curl -s http://localhost:9200/events/_search?pretty
```

### Fetch Count of Indexed Events
```bash
curl -s http://localhost:9200/events/_count?pretty
```

### Perform proximity/filter queries (Simulate the Search service)
```bash
curl -s -X GET "http://localhost:9200/events/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        { "term": { "city": "los angeles" } }
      ],
      "filter": [
        {
          "geo_distance": {
            "distance": "5km",
            "location": {
              "lat": 34.0522,
              "lon": -118.2437
            }
          }
        }
      ]
    }
  }
}'
```

---

## 3. Querying Redis Cache (`tikitu-redis`)

Interact with your local Redis keyspace using `redis-cli` in the Redis container.

### Connect to Redis CLI
```bash
docker exec -it tikitu-redis redis-cli
```

Once inside the interactive prompt (`127.0.0.1:6379>`), use the following commands:

### List All Active Keys
```redis
KEYS *
```

### View Static Categories (Tier 1)
```redis
SMEMBERS city:los_angeles:categories
```

### View Autocomplete Lexical Indices (Tier 2)
```redis
ZRANGE autocomplete:city:los_angeles 0 -1
```

### View Autocomplete Prefix Search (Case-insensitive)
```redis
ZRANGEBYLEX autocomplete:city:los_angeles "[sum" "[sum\xff"
```

### Retrieve Geohash Query Cache (Tier 3)
```redis
# Replace with one of the keys retrieved from "KEYS *"
GET search:city:los_angeles:geohash:9q5cs:date:20260606:q::page:1
```

### Inspect Ticket Type Inventory (Booking Service Transaction Layer)
```redis
# Replace with your specific event and ticket IDs
GET event:bd914985-7470-4f5f-bb29-06ace029aa54:ticketType:a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d:inventory
```
