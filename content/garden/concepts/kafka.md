+++
title = "Kafka"
date = "2025-12-18T16:48:37.996Z"
description = "Notes about Kafka"

[taxonomies]
tags = [ "kafka" ]
[extra]
growth = "growing"
+++

## Core Concept

Kafka is an open source distributed event streaming platform. Can be used as a `message queue` or as a `stream processing system`. Data is stored sequentially on disk.

- **Topic**: A logical category of messages (e.g., user_signups).
- **Partition**: The unit of parallelism. A topic is split into partitions (e.g., Partition 0, 1, 2).
- **Offset**: The unique ID of a message within a partition. It is immutable.
- **Consumer Group**: A set of consumers working together to consume a topic.
  - _**Critical Rule**_: One partition can be consumed by only one consumer within a single group.

## Why Disk Storage Works

This seems counterintuitive — disk is slow, right? Kafka gets away with it because it uses **sequential I/O**. Reading/writing in order from disk is shockingly fast compared to random access. The OS page cache does most of the heavy lifting, meaning frequently accessed data is served from memory anyway. This also gives Kafka durability for free — messages survive broker restarts without any extra work.

## Consumer Groups

Consumer groups are how Kafka achieves parallel consumption. Each consumer in a group is assigned a subset of partitions.

```
Topic: order_events (3 partitions)

Consumer Group: "order-processors"
├── Consumer A → Partition 0
├── Consumer B → Partition 1
└── Consumer C → Partition 2
```

When a consumer joins or leaves the group, Kafka triggers a **rebalance** — partitions get reassigned across the remaining consumers. If Consumer C dies, its Partition 2 gets handed to either A or B. If you add a 4th consumer and only have 3 partitions, it sits idle (one partition per consumer max within a group).

This is why the number of partitions is effectively a cap on your parallelism within a single consumer group.

## Offset Management

Each consumer tracks its position in a partition via an **offset**. After processing a message, the consumer commits the offset back to Kafka (stored in an internal `__consumer_offsets` topic). On restart, the consumer picks up right where it left off.

This is what makes Kafka different from traditional message queues — messages aren't deleted after consumption. Multiple consumer groups can each read the same topic independently at their own pace.

## Related

- [Event-Driven Architecture](@/garden/concepts/event_driven_architecture.md) — Kafka as the event bus in EDA patterns

## Ref

[Kafka paper](https://notes.stephenholiday.com/Kafka.pdf)