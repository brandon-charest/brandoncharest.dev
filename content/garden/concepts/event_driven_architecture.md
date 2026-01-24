+++
title = "Event-Driven Architecture"
date = "2026-01-19T16:48:37.996Z"
description = "Moving from monolithic transactions to distributed orchestration in a global digital supply chain"

[taxonomies]
tags = [ "system-design", "distributed-systems" ]  
[extra]
growth = "seedling"
+++

## The Monolith: Simple and Safe

In a classic monolith application, you have one big database for everything. Transaction state is much easier to manage and trace because everything lives in the same system.

### Example: Streaming Service Content Deal

Imagine we're building a streaming service. We've had success with indie content, but now we're big enough to work with major studios. We just signed a contract with Disney to stream the Star Wars trilogy for $50 million.

Our application handles legal contracts, financial transactions, and content management—all within a **single monolithic system** sharing **one database**.

{% mermaid() %}
graph TD
    A[Monolith Application] --> B[(Shared Database)]
    B --> C[Contracts Table]
    B --> D[Payments Table]
    B --> E[Movies Table]
    
    style A fill:#4CAF50
    style B fill:#2196F3
{% end %}

### The Transaction

When we activate the Disney contract, we need to:
1. Record the payment of $50 million
2. Make the Star Wars movies visible to our users

In a monolith with a single database, this is **straightforward**:

```sql
-- Single atomic transaction
BEGIN TRANSACTION;
  
  -- Record the payment
  INSERT INTO payments (contract_id, amount, status, created_at)
  VALUES (1001, 50000000, 'PAID', NOW());
  
  -- Update our account balance
  UPDATE accounts 
  SET balance = balance - 50000000 
  WHERE account_id = 1;
  
  -- Make the movies visible
  UPDATE movies 
  SET is_visible = true, available_date = NOW()
  WHERE contract_id = 1001;
  
  -- Update contract status
  UPDATE contracts 
  SET status = 'ACTIVE', activated_at = NOW()
  WHERE id = 1001;

COMMIT;
```

### Automatic Rollback on Failure

In our monolithic system, if server crashes mid update, the database will automatically roll back all changes. Its all or nothing.

```sql
BEGIN TRANSACTION;
  INSERT INTO payments (...);         -- ✅ Executed
  UPDATE accounts SET balance = ...;  -- ✅ Executed
  UPDATE movies SET is_visible = ...; -- ✅ Executed
  -- 💥 SERVER CRASHES HERE
  UPDATE contracts SET status = ...;  -- ❌ Never executed
COMMIT;                               -- ❌ Never reached
```

**Result**: 
- Payment record:   ❌ Not inserted
- Account balance:  ❌ Unchanged
- Movies:           ❌ Still invisible
- Contract:         ❌ Still pending

### The Problem with Distributed Systems

But lets say our financial system is handled by a 3rd party. Now we have a distributed system where the payment processing happens in a separate service. We can't use a traditional database transaction anymore.

```sql
-- This doesn't work across different services!
BEGIN TRANSACTION;
  -- Call external payment API (different service/database)
  POST https://payment-service.com/api/charge
  -- Update our database
  UPDATE Movies_Table SET is_visible = true;
COMMIT;
```

What happens if:
- The payment succeeds but our server crashes before updating the movie visibility?
- Our database update succeeds but the payment API is down?
- The payment API responds with a timeout but actually processed the payment?

This is where **Event-Driven Architecture** comes in.

## Event-Driven Architecture (EDA)

Event-Driven Architecture is a design pattern where services communicate by producing and consuming events rather than making direct API calls. An event is an immutable record of something that happened in the system.

### Key Components

- **Event Producers**: Services that publish facts (e.g., `VideoUploaded`).
- **Event Bus/Broker**: Middleware like Kafka that routes events.
- **Event Consumers**: Services that react to events (e.g., a "Search Service" updating its index).



## Choreography vs Orchestration

### Choreography (Decentralized)
Each service knows what to do when it sees specific events. No central coordinator.

{% mermaid() %}
graph LR
    A[Order Service] -->|OrderPlaced| B[Event Bus]
    B -->|OrderPlaced| C[Payment Service]
    B -->|OrderPlaced| D[Inventory Service]
    C -->|PaymentReceived| B
    B -->|PaymentReceived| E[Shipping Service]
{% end %}

**Pros**: Loose coupling, resilient, scalable
**Cons**: Hard to understand flow, difficult to debug

### Orchestration (Centralized)
A coordinator service manages the workflow and tells each service what to do.

{% mermaid() %}
graph TD
    A[Order Orchestrator] -->|Process Payment| B[Payment Service]
    B -->|Success| A
    A -->|Reserve Inventory| C[Inventory Service]
    C -->|Success| A
    A -->|Schedule Shipping| D[Shipping Service]
{% end %}

**Pros**: Clear workflow, easier to understand and debug
**Cons**: Orchestrator becomes single point of failure, tight coupling

## Eventual Consistency

In event-driven systems, we accept **eventual consistency** instead of immediate consistency. The system will eventually reach a consistent state, but there may be a delay.

**Example**: When you place an order on Amazon:
1. You immediately see "Order placed!" (order service updated)
2. A few seconds later: "Payment successful" (payment service processed)
3. A minute later: "Preparing for shipment" (warehouse service notified)

Each step happens asynchronously via events.

## The Saga Pattern

A saga is a sequence of local transactions coordinated through events or orchestration. Each transaction updates the database and publishes an event. If a step fails, compensating transactions undo the changes.

### Example: E-commerce Order Saga

```
Order Placed
  → Reserve Inventory (SUCCESS)
    → Process Payment (FAILURE)
      → Release Inventory (COMPENSATE)
        → Cancel Order
```

**Forward Flow**:
1. OrderPlaced → Reserve inventory
2. InventoryReserved → Process payment
3. PaymentProcessed → Ship order

**Compensation Flow** (if payment fails):
1. PaymentFailed → Release inventory
2. InventoryReleased → Cancel order

## Outbox Pattern

To ensure events are published reliably, use the **outbox pattern**:

1. In the same database transaction that changes business data, insert the event into an "outbox" table
2. A background worker polls the outbox table
3. The worker publishes events to the event bus
4. Once published, mark the event as sent

This guarantees **at-least-once delivery** because the event survives even if the application crashes.

```sql
-- Single atomic transaction
BEGIN TRANSACTION;
  UPDATE orders SET status = 'CONFIRMED';
  INSERT INTO outbox_events (event_type, payload) 
    VALUES ('OrderConfirmed', '{"orderId": 123}');
COMMIT;

-- Background worker
SELECT * FROM outbox_events WHERE status = 'PENDING';
-- Publish to event bus
-- Mark as sent
UPDATE outbox_events SET status = 'SENT';
```

## Best Practices

### 1. **Idempotency**
Events may be delivered more than once. Ensure consumers can safely process the same event multiple times.

```javascript
// Use idempotency key
async function processPayment(event) {
  const { paymentId } = event.payload;
  
  // Check if already processed
  const existing = await db.findOne('payments', { id: paymentId });
  if (existing) {
    console.log('Already processed, skipping');
    return;
  }
  
  // Process payment...
}
```

### 2. **Event Versioning**
Events are contracts. Version them to handle schema changes.

```javascript
{
  eventType: 'OrderPlaced',
  version: 2,
  payload: {
    orderId: 123,
    userId: 456,
    // New field in v2
    couponCode: 'SAVE20'
  }
}
```

### 3. **Dead Letter Queues**
When event processing fails repeatedly, move the event to a dead letter queue for manual inspection.

### 4. **Event Schemas**
Define and validate event schemas (e.g., using JSON Schema, Avro, Protobuf).

### 5. **Observability**
- Assign correlation IDs to track events across services
- Log all event publications and consumptions
- Monitor event lag and processing times

## Trade-offs

**Advantages**:
- Loose coupling between services
- Natural fit for microservices
- Scalability and resilience
- Audit trail (event sourcing)

**Challenges**:
- Complexity in debugging distributed flows
- Eventual consistency requires careful design
- Need robust event infrastructure
- Duplicate event handling (idempotency)
- Ordering guarantees can be difficult
