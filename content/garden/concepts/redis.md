+++
title = "Redis"
date = "2025-12-18T14:40:23.172Z"
description = "Notes about Redis"

[taxonomies]
tags = [ "redis" ]
[extra]
growth = "growing"
+++

## Core Concept

Redis is a single threaded, in-memory key-value store. Known for its incredible speed and the fact that a single Redis server can handle around 100k QPS.
It's speed comes from its operations which is run purely on memory, whereas most other databases rely on disk.

{{ note(header="Why Single Threaded?", body="It avoids the complexity of locking mechanisms and race conditions. Since Redis is CPU-bound (operations are simple memory reads/writes), the bottleneck is usually the Network I/O, not the CPU execution time.") }}

### Data Structures

| Data Structure | Fundamental Concept | Potential Use Case |
| :--- | :--- | :--- |
| **String** | Key-Value | **Caching** (HTML fragments, JSON blobs), **Distributed Locks** (`SETNX`). |
| **List** | Linked List (Doubly) | **Message Queues** (Twitter timelines, job queues). O(1) push/pop. |
| **Set** | Unordered Unique collection | **Social Graphs** (User A follows User B), Tags, filtering duplicates. |
| **Sorted Set (ZSet)** | Unique collection + Score | **Leaderboards** (Gaming), Priority Queues, Rate Limiting (Sliding Window Log). |
| **Hash** | Map within a key | **Object Storage** (User Sessions, Profiles). Saves memory vs. serializing JSON strings. |
| **HyperLogLog** | Probabilistic Data Structure | **Analytics** (Unique visitors count). Uses constant small memory (12kb) for millions of items with <1% error. |
| **[Bloom Filter](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/)** | Probabilistic (Module/Bitmaps) | **Existence Checks** (Did this user already read this post?). Prevents cache penetration. |
| **Geospatial** | Geo-indexing | **Proximity Search** (Uber/Lyft "drivers near me"). |

### Replication

high level notes

- replication is async
- non-blocking on master
- replicas are read-only

Why would we need replication?

- high availability
- spread of read load
- can be used in place of persistence

### Data Persistence

Redis does have the ability to save data onto disk and uses two mechanisms.

- Redis Database (RDB): A point in time snapshot of the current data is saved to disk as defined intervals.
  - pro: Compact file format, faster startups
  - con: Data loss window
- Append Only File (AOF): Every write option is written to a file which can be read back in order to restore.
  - pro: High durability, can sync every second
  - con: Large file size, slower replay on restart

### Clusters

Custer information uses gossip protocols. Each node knows the state of every other node including:

- role
- availability
- hash slots they serve
Each node will periodically will send a heartbeat message to another random sub-set of nodes.

Cluster data sharding uses `hash slot`. There are **16384** hash slots in Redis Cluster and computing a hash:  `CRC16(key) % 16384`.

For example, a Redis Cluster with 3 nodes:

- Node A contains hash slots from 0 to 5500.
- Node B contains hash slots from 5501 to 11000.
- Node C contains hash slots from 11001 to 16383.

### Redis Streams Vs. [Kafka](@/garden/concepts/kafka.md)

## RESP Protocol

RESP is a binary protocol that uses control sequences encoded in ASCII.


### Payload Structure

![RESP Protocol Structure](/images/resp_protocol_structure.png)

The first byte of every RESP message acts as a **type indicator**, determining how the rest of the payload should be parsed:

| Type Indicator | Data Type | Structure | Example |
| :--- | :--- | :--- | :--- |
| `+` | **Simple String** | `+<string>\r\n` | `+OK\r\n` |
| `-` | **Error** | `-<error message>\r\n` | `-ERR unknown command\r\n` |
| `:` | **Integer** | `:<number>\r\n` | `:1000\r\n` |
| `$` | **Bulk String** | `$<length>\r\n<data>\r\n` | `$6\r\nfoobar\r\n` |
| `*` | **Array** | `*<count>\r\n<elements>` | `*2\r\n$3\r\nfoo\r\n$3\r\nbar\r\n` |

**Key Points:**
- **Simple Strings** and **Errors** are human-readable, single-line responses
- **Bulk Strings** are binary-safe and prefixed with their length
- **Arrays** can contain nested RESP messages of any type
- `\r\n` (**CLRF**) is the *terminator* for this protocol.


## Ref

- [redis.io](https://redis.io/)
- [Redis Replication](https://www.youtube.com/watch?v=esbRryo0Ty8)
- [Why is Redis so fast](https://www.youtube.com/watch?v=5TRFpFBccQM)
