+++
title = "Thread-safe LRU Cache"
date = "2026-01-13"
description = "Using Segmented Locking for thread-safe LRU Cache"

[taxonomies]
tags = ["system-design", "python"]

[extra]
growth = "evergreen"
type="resource"
+++


In order to keep this interesting I will opt to **not** use `OrderedDict` from the standard library as this abstracts away key implementation details that I am trying to understand.

## LRU Cache With Lock

```python
class Node:
    """Doubly-linked list node for LRU ordering."""
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.next = None  # Points to more recently used node
        self.prev = None  # Points to less recently used node

class LRUCache:
    """
    Thread-safe LRU Cache using HashMap + Doubly Linked List.
    
    Data Structure:
    - HashMap: O(1) key lookup to find nodes
    - Doubly Linked List: O(1) add/remove for LRU ordering
    - head → [MRU] ... [LRU] ← tail
    
    Time Complexity: O(1) for get() and put()
    Space Complexity: O(capacity)
    """

    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}  # Key -> Node mapping for O(1) lookup
        self.size = 0
        
        # Dummy head and tail nodes simplify edge cases
        self.head = Node(0, 0)  # Head.next = Most Recently Used (MRU)
        self.tail = Node(0, 0)  # Tail.prev = Least Recently Used (LRU)
        self.head.next = self.tail
        self.tail.prev = self.head
        
        # Global lock for thread safety (simple but contended approach)
        self.lock = threading.Lock()

    def get(self, key):
        """
        Retrieve value and mark as most recently used.
        Returns -1 if key doesn't exist.
        """
        with self.lock:  # Acquire lock for thread-safe read + update
            if key not in self.cache.keys():
                return -1

            node = self.cache[key]
            self._move_to_head(node)  # Update LRU order
            return node.value
        return -1

    def put(self, key, value):
        """
        Insert or update key-value pair.
        Evicts LRU item if capacity exceeded.
        """
        with self.lock:  # Acquire lock for thread-safe write
            if key in self.cache.keys():
                # Update existing key
                node = self.cache[key]
                node.value = value
                self._move_to_head(node)  # Mark as recently used
            else:
                # Insert new key
                new_node = Node(key, value)
                self.cache[key] = new_node
                self.size += 1
                self._add_node(new_node)  # Add to head (MRU position)

                # Evict LRU item if over capacity
                if self.size > self.capacity:
                    last_node = self._remove_from_tail()
                    self.size -= 1
                    del self.cache[last_node.key]  # Remove from hashmap

    def _remove_node(self, node):
        """Remove node from doubly-linked list (doesn't delete from cache)."""
        prev_node = node.prev
        next_node = node.next

        # Bypass the node by linking prev → next
        prev_node.next = next_node
        next_node.prev = prev_node

    def _add_node(self, node):
        """Add node right after head (most recently used position)."""
        next_node = self.head.next

        # Insert: head → node → old_head.next
        self.head.next = node
        node.next = next_node
        next_node.prev = node
        node.prev = self.head
        
    def _move_to_head(self, node):
        """Mark node as most recently used by moving to head."""
        self._remove_node(node)  # Remove from current position
        self._add_node(node)     # Re-add at head

    def _remove_from_tail(self):
        """Remove and return the least recently used node (tail.prev)."""
        node = self.tail.prev
        self._remove_node(node)
        return node
```

## Segmented Locking

The problem with the simple `LRUCache` above is that **every single operation** locks the entire cache. If you have 100 threads all trying to read/write at the same time, they all wait in line for that one lock. Not great for performance.

**Segmented locking** fixes this by splitting the cache into multiple independent "segments" (think of them like mini-caches). Each segment has its own lock, so threads only compete with each other if they happen to access keys that hash to the same segment.

Here's the idea:

- Instead of 1 cache with 1 lock we get 16 mini-caches, each with their own lock
- When you `get(key)` or `put(key, value)`, hash the key to figure out which segment it belongs to
- Only that segment's lock is needed, so 16 threads can operate in parallel (as long as they're hitting different segments)

This is the same technique used in Java's `ConcurrentHashMap` and other high-performance concurrent data structures.

```python
class ShardedLRUCache:
    def __init__(self, total_capacity, num_segments=16):
        self.num_segments = num_segments
        seg_capacity = max(1, total_capacity // num_segments)
        # Create 16 independent LRUCaches
        self.segments = [LRUCache(seg_capacity) for _ in range(num_segments)]

    def _get_segment(self, key):
        # Use built-in hash to pick a segment
        return self.segments[hash(key) % self.num_segments]

    def get(self, key):
        return self._get_segment(key).get(key)

    def put(self, key, value):
        self._get_segment(key).put(key, value)
```

## Let's Race!!

My assumption was that the segmented lock LRU cache would be faster than the simple Lock LRU cache. Intuitively it makes sense, we are reducing the amount of contention on the lock. 

So I created a stress test to find out.

```python
def run_stress_test(cache_name, cache_instance, num_threads=50, ops_per_thread=2000):
    print(f"🔥 Starting {cache_name} Stress Test...")

    # Pre-generate operations to ensure equal work
    # Ops format: (type, key, value)
    ops_list = []
    keys = list(range(1000))  # Working set of 1000 keys

    start_time = time.time()

    def worker():
        for _ in range(ops_per_thread):
            op = random.random()
            key = random.choice(keys)

            if op < 0.5:  # 50% Writes
                cache_instance.put(key, f"val_{key}")
            else:  # 50% Reads
                cache_instance.get(key)

    threads = []
    for _ in range(num_threads):
        t = threading.Thread(target=worker)
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    duration = time.time() - start_time
    print(f"✅ {cache_name} Finished in {duration:.4f} seconds")
    return duration

if __name__ == "__main__":
    # Settings
    THREADS = 50
    OPS = 5000  # Total Ops = 50 * 5000 = 250,000 operations

    print(f"🏁 BENCHMARK CONFIG: {THREADS} Threads, {OPS} Ops/Thread\n")

    # 1. Test Standard LRU
    standard_cache = LRUCache(capacity=1000)
    time_standard = run_stress_test("Standard LRU", standard_cache, THREADS, OPS)
    print("-" * 40)

    # 2. Test Sharded LRU
    sharded_cache = ShardedLRUCache(total_capacity=1000, num_segments=16)
    time_sharded = run_stress_test("Sharded LRU ", sharded_cache, THREADS, OPS)
    print("-" * 40)

    # 3. Results
    speedup = time_standard / time_sharded
    print(f"\n🏆 WINNER: {'Sharded' if speedup > 1 else 'Standard'}")
    print(f"🚀 Speedup Factor: {speedup:.2f}x faster")
```

```txt
🏁 BENCHMARK CONFIG: 50 Threads, 5000 Ops/Thread

🔥 Starting Standard LRU Stress Test...
✅ Standard LRU Finished in 0.1890 seconds
----------------------------------------
🔥 Starting Sharded LRU  Stress Test...
✅ Sharded LRU  Finished in 0.2262 seconds
----------------------------------------

🏆 WINNER: Standard
🚀 Speedup Factor: 0.84x faster
```

WHAT!? I was shocked to see that the standard locking was actually faster!

### Global Interpreter Lock (GIL)

Ah, python... 😓

I did a little digging and came across this article: [Python Global Interpreter Lock (GIL) Explained](https://realpython.com/python-gil/)

{{ note(header="Global Interpreter Lock (GIL)", body="The Python Global Interpreter Lock or GIL, in simple words, is a mutex (or a lock) that allows only one thread to hold the control of the Python interpreter.

This means that only one thread can be in a state of execution at any point in time...") }}

So Lock sharding just adds complexity without bypassing the GIL for CPU-bound tasks.

well that's boring....

## Race #2: Electric Boogaloo

Ok, so I decided to try and mimic network traffic by adding a small sleep, and needed to change `Lock` to `RLock` to allow for re-entrancy.

```python
class SlowStandardLRU(LRUCache):
    def put(self, key, value):
        with self.lock:
            time.sleep(0.001) # Added sleep to simulate network latency
            super().put(key, value)

    def get(self, key):
        with self.lock:
            time.sleep(0.001) # Added sleep to simulate network latency
            return super().get(key)

class SlowShardedLRU(ShardedLRUCache):
    def __init__(self, capacity):
        super().__init__(capacity)
        self.segments = [SlowStandardLRU(capacity // 16) for _ in range(16)]
```

```txt
🏁 BENCHMARK CONFIG: 50 Threads, 5000 Ops/Thread

🔥 Starting Standard LRU Stress Test...
✅ Standard LRU Finished in 473.1808 seconds
----------------------------------------
🔥 Starting Sharded LRU  Stress Test...
✅ Sharded LRU  Finished in 37.9625 seconds
----------------------------------------

🏆 WINNER: Sharded
🚀 Speedup Factor: 12.46x faster
```

That's the result I was looking for! You would have thought that since I added a sleep maybe I would have reduced the number of operations... well I didn't, it was a long wait...

## Takeaway

The lesson here is that segmented locking shines when threads actually block on I/O (network calls, disk reads, etc.) — not when the GIL is already serializing CPU-bound work. In a real-world cache sitting in front of a database or API, the sharded approach would dominate because threads spend most of their time waiting on external resources, and that's time other segments can use. Pure in-memory Python operations? The GIL makes the extra complexity pointless.
