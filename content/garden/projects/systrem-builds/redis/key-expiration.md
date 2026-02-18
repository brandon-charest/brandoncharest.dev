+++
title = "Thread-Safe Storage & Lazy Expiration"
date = "2026-02-12"
description = "Handling concurrent writes and implementing TTL (Time-To-Live) in Rust."

[taxonomies]
tags = [ "concurrency", "rust" ]

[extra]
growth = "growing"
type = "project"
+++

## Architecture

To share the database state across async tasks, I wrapped the HashMap in an Arc (Atomic Reference Count) and a Mutex.

```rust
// src/db.rs
#[derive(Clone)]
pub struct Db {
    // Mutex ensures only one thread writes at a time
    state: Arc<Mutex<DbState>>,
}

struct DbState {
    // Key-Value store. 
    kv: HashMap<String, (DataType, Option<Instant>)>,
}
```

## Lazy Expiration

Instead of a background thread to continously scan and check our values for expired time. I decided to just go with lazy checking. Every time a key is accessed via get(), we check if it has expired before returning it.

```rust
// src/db.rs
pub fn get(&self, key: &str) -> Option<DataType> {
    let mut lock = self.state.lock().unwrap();

    if let Some((_val, Some(expiry))) = lock.kv.get(key) {
        // If the current time is past the expiry, delete it immediately.
        if Instant::now() > *expiry {
            lock.kv.remove(key);
            return None;
        }
    }

    // Return the value if valid
    lock.kv.get(key).map(|(val, _)| val.clone())
}
```