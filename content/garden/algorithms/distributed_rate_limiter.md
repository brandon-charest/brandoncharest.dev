+++
title = "Building a Distributed Rate Limiter"
date = "2026-01-12"
description = "Thread-safe Python reference implementations"

[taxonomies]
tags = ["system-design", "python"]

[extra]
growth = "evergreen"
type = "reference"
+++


## Overview

First, let's define what a rate limiter is. It's a system that controls the rate at which requests are processed. Ok, simple enough. But how does this work in a distributed system? Each service  cannot have its own logic for rate limiting as it would cause issues with consistency.

So that means we need a single source of truth for rate limiting. For this example we will use [Redis](@/garden/concepts/redis.md) as our rate limiter. More specifically we will create a python implementation that interfaces with Redis using `INCR` and `EXPIRE` commands to implement a token bucket.

## Token Bucket

Token bucket is a rate limiting algorithm that allows a fixed number of requests per second. It works by maintaining a bucket of tokens, and each request consumes a token. If the bucket is empty, the request is rejected.

$$
\text{tokens}(t) = \min\left(\text{capacity}, \text{tokens}(t_0) + \text{rate} \times (t - t_0)\right)
$$

Where:
- $\text{tokens}(t)$ = available tokens at time $t$
- $\text{capacity}$ = maximum bucket size
- $\text{rate}$ = token refill rate (tokens per second)
- $t_0$ = last refill time

A request is **allowed** if:

$$
\text{tokens}(t) \geq \text{cost}
$$

## Simple Implementation

```python
class SimpleLimiter:
    def __init__(self, capacity, fill_rate):
        self.capacity = capacity
        self.fill_rate = fill_rate
        self.tokens = capacity
        self.last_timestamp = time.time()

    def allow_request(self, tokens=1):
        now = time.time()
        # 1. Refill tokens based on time passed
        seconds_passed = now - self.last_timestamp
        self.tokens += seconds_passed * self.fill_rate

        # 2. Cap at capacity
        if self.tokens > self.capacity:
            self.tokens = self.capacity
        self.last_timestamp = now

        # 3. Check if we have enough
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False
```

#### The Problem

This fails immediately in a multi-threaded environment (like Flask or Django). Two threads could read `self.tokens` at the exact same time (e.g., value 5), both subtract 1, and write back 4. But it should be 3. This is a **Race Condition**.

### Thread Safety

In order to deal with this race condition we have to make sure that the `allow_request` method is thread-safe. In Python this can be achieved using a `Lock` (Mutex).

```python
class SimpleLimiter:
    def __init__(self, capacity, fill_rate):
        self.capacity = capacity
        self.fill_rate = fill_rate
        self.tokens = capacity
        self.last_timestamp = time.time()
        self.lock = threading.Lock() # Mutex

    def allow_request(self, tokens=1):
        # Acquire the lock
        with self.lock:
            now = time.time()

            seconds_passed = now - self.last_timestamp
            self.tokens += seconds_passed * self.fill_rate
            if self.tokens > self.capacity:
                self.tokens = self.capacity
            self.last_timestamp = now

            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
        return False
```

Excellent! Now we have a thread-safe implementation, this will work great... on **one server**. 

**Scenario:**

- `User A` makes a request to Server 1, they get a token
- `User A` makes a request to Server 2. Server 2 has no idea that `User A` already got a token from Server 1. All it knows is that this user as far as its concerned has 1 token left. So it allows the request.

`User A` effectively now has `Limit * Number of Servers` tokens.

This is where we need a distributed rate limiter.

### Distributed State

```python
class DistributedRateLimiter:
    def __init__(self, redis_client, key, capacity, fill_rate):
        self.redis = redis_client
        self.key = key
        self.capacity = capacity
        self.fill_rate = fill_rate
        self.last_timestamp_key = f"{key}:ts"

    def allow_request(self, tokens_needed=1):
        """
        Lua script to atomicaly:
        1. Refill tokens based on time passed.
        2. Check if enough tokens exist.
        3. Decrement and update timestamp.
        """
        lua_script = """
        local tokens_key = KEYS[1]
        local timestamp_key = KEYS[2]
        local capacity = tonumber(ARGV[1])
        local fill_rate = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        local requested = tonumber(ARGV[4])

        -- Get current state
        local last_tokens = tonumber(redis.call("get", tokens_key)) or capacity
        local last_refill = tonumber(redis.call("get", timestamp_key)) or now

        -- Refill tokens
        local delta = math.max(0, now - last_refill)
        local filled_tokens = math.min(capacity, last_tokens + (delta * fill_rate))

        -- Check if allowed
        if filled_tokens >= requested then
            local new_tokens = filled_tokens - requested
            redis.call("set", tokens_key, new_tokens)
            redis.call("set", timestamp_key, now)
            return 1 -- Allowed
        end

        return 0 -- Denied
        """

        cmd = self.redis.register_script(lua_script)
        return bool(cmd(
            keys=[self.key, self.last_timestamp_key],
            args=[self.capacity, self.fill_rate, time.time(), tokens_needed]
        ))
```

Notice how we are not using `Lock`. This is because the Lua script is atomic. It will execute in a single step and no other thread can access the state in between.

## What's Next

The token bucket is just one approach. Other rate limiting algorithms worth exploring:
- **Sliding Window Log** — tracks exact timestamps of each request, more precise but uses more memory
- **Sliding Window Counter** — hybrid of fixed window and sliding log, good balance of accuracy and efficiency
- **Leaky Bucket** — smooths out burst traffic by processing requests at a fixed rate