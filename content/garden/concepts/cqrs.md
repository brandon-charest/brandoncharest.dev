+++
title = "Command Query Responsibility Segregation"
date = "2026-01-19T16:48:37.996Z"
description = "Separating read and write models for scalability and clarity in system design"

[taxonomies]
tags = [ "system-design" ]  
[extra]
growth = "seedling"
+++

CQRS is a pattern that separates **read** and **write** operations into distinct models, each optimized for its specific workload.

## Core Idea

In a traditional CRUD application, the same data model handles both reads and writes. CQRS splits this into:

- **Command Model (Write):** Handles mutations — creating, updating, deleting data. Optimized for consistency and validation.
- **Query Model (Read):** Handles data retrieval. Optimized for fast lookups, denormalized views, and flexible querying.

## Why Separate?

Reads and writes have fundamentally different scaling and optimization needs. A product catalog might receive 1000x more reads than writes. The read model can be denormalized, cached, and replicated aggressively without affecting write consistency.

## Trade-offs

- **Complexity:** Two models to maintain, synchronize, and deploy instead of one
- **Eventual consistency:** The read model may lag behind writes, which is unacceptable for some use cases
- **Overkill for simple domains:** If your app is mostly CRUD with low traffic, CQRS adds overhead for little benefit

## When It Makes Sense

- High read-to-write ratios (e.g., product catalogs, dashboards)
- Complex domains where read and write shapes diverge significantly
- Systems that need independent scaling of read vs. write workloads
- Often paired with [Event-Driven Architecture](@/garden/concepts/event_driven_architecture.md) and event sourcing