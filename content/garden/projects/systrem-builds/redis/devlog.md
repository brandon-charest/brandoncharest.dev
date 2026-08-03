+++
title = "Redis From Scratch Dev Log"
date = "2026-01-24"
description = "A chronological record of my suffering."

[taxonomies]
tags = ["devlog"]
[extra]
type = "log" 
growth = "growing" 
+++

# Build Log

*A chronological record of my suffering.*

[Main Branch](https://github.com/brandon-charest/redis-lite)

## 2026-02-18

### Blocking retrieval BLPOP

Need to find a way to make these executions async. Perhaps addings a "waiting" queue. Each time we get a `RPUSH` or `LPUSH` we can check "waiting" to see if any client is waiting for this key.

```rust
// Map of Keys to the clients waiting
waiting: HashMap<String, VecDeque<oneshot::Sender<String>>>,
```