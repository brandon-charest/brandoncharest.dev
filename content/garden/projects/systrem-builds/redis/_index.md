+++
title = "Redis in Rust"
description = "Re-implementing Redis from scratch in Rust"
sort_by = "date"
template = "section.html"
+++
Building Redis from the ground up in Rust.

[Github-Repo](https://github.com/brandon-charest/redis-lite)

## 📚 Learning Notes
### Core Concepts
- [RESP Protocol](resp-protocol) 🌱 - Parsing the Redis serialization protocol
- [TCP Server](tcp-server) 🌱 - Connection handling and async I/O
- [Command Handling](command-handling) 🌱 - Dispatching PING, GET, SET, etc.
### Advanced Topics
- [Key Expiry](key-expiry) 🌱 - TTL and expiration strategies
- [Replication](replication) 🌱 - Master/replica sync
- [RDB Persistence](rdb-persistence) 🌱 - File format and serialization
- [Concurrency](concurrency) 🌱 - Shared state in async Rust