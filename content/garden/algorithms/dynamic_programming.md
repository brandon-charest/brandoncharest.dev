+++
title = "Dynamic Programming"
date = "2026-01-05"
description = "Notes on dynamic programming patterns, including the knapsack problem"

[taxonomies]
tags = ["algorithms", "dynamic-programming"]

[extra]
growth = "growing"
+++


## The Knapsack Problem

Dynamic Programming is often a struggle for most developers. The **0/1 Knapsack Problem** was one of the first times I was able to understand the issue on a fundamental level.

Imagine I am a thief with a backpack that holds exactly **$W$ kgs**. I am looking at **$N$ items** that I could steal, each with a specific **weight** and **value**.

- **Goal:** Pack as many items as I can into my bag with the highest possible value.
- **Constraint:** Cannot go overweight limit **$W$**.
- **The (0/1) Constraint:** Cannot break items or take a partial item. It's all (1) or nothing (0).

### Why Greedy Does Not Work

My intuition was just take the most valuable items first, essentially a **Greedy** approach.

> *Example:* Bag with weight($W$) 4.
> * **Item A:** weight = 3kg. value = $4.
> * **Item B:** weight = 2kg. value = $3.
> * **Item C:** weight = 2kg. value = $3.
> 
> **Greedy:** We take Item A, Total Value = $4. 1kg of space left but nothing else fits in it.<br>
> **Optimal:** We take Item B + Item C. Total Value = $6. 0kg space left.

Since we cannot use the Greedy approach we must find a way to identify if it's worth taking an Item and adding it to our bag or not.

## The DP Table

Given items with (weight, value):

- Item 1: (1, 1)
- Item 2: (3, 4)
- Item 3: (4, 5)
- Item 4: (5, 7)

We will start by creating a grid and set all values to 0.

- **Rows ($i$):** Items we are allowed to take.
- **Columns ($w$):** The capacity of our bag.

| Items ↓ / Capacity → | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| :---  | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** (no items)         | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Item 1** (w=1, v=1)    | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Item 2** (w=3, v=4)    | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Item 3** (w=4, v=5)    | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Item 4** (w=5, v=7)    | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

### Filling the DP Table

At each cell we decide:

1. **Don't take item i**: Keep the best value from previous items
2. **Take item i**: Add its value to the best solution with remaining capacity

#### Step-by-Step Example

**Row 0 (Base Case):** No items available, so all values stay 0.
| Items ↓ / Capacity → | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| :---  | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** (no items)         | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Row 1 - Item 1 (w=1, v=1):**

For each capacity column, ask: "Can I fit Item 1 (weight=1)?"
| Items ↓ / Capacity → | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| :---  | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** (no items)         | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Item 1** (w=1, v=1) | 0 | **1** | **1** | **1** | **1** | **1** | **1** | **1** |

**Row 2 - Item 2 (w=3, v=4):**

Finally something interesting... Now we can choose from Item 1 and Item 2.
| Items ↓ / Capacity → | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |  |
| :---  | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** (no items)         | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Item 1** (w=1, v=1) | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 
| **Item 2** (w=3, v=4) | 0 | 1 | 1 | **4** | **5** | **5** | **5** | **5** | 
- **Capacity 0-2**: Item 2 is too heavy (w=3), keep previous best (1)
- **Capacity 3**: Item 2 fits perfectly!
  - **Option A**: Don't take Item 2 → keep just Item 1 value = 1
  - **Option B**: Take Item 2 → value = `4`, no room for anything else
  - **Winner**: Take Item 2! → **4**
- **Capacity 4**: This is where the pattern begins to emerge.
  - **Option A**: Don't take Item 2 → keep just Item 1 value = 1
  - **Option B**: Take Item 2 (weight 3, value 4). We use 3kg, leaving **1kg** of space
    - **Question**: "We have 1kg of weight left to use. What's the best value I can pack with 1kg using items *before* Item 2?"
    - **Answer**: Look at row 1, capacity 1. Value= **1** (that's Item 1!)
    - **Total**: `4 + 1 = 5`
  - **Winner**: Take Item 2 + Item 1 → **5**

### Why Look at the Row Above?

The table is built row by row.

- Row 1 tells us "What's the best value I can make with **only** Item 1 and $w$ capacity".
- Row 2 tells us "What's the best I can do with Items 1-2 and $w$ capacity?"
Since we have 1kg left over we already know what's the best value we can make with Item 1 with a weight of 1. It's **1**

$$
dp[i][w] = \max \begin{cases}
\text{Don't Take It:} & dp[i-1][w] \\\\
\text{Take It:} & \text{Value}[i] + dp[i-1][w-\text{Weight}[i]]
\end{cases}
$$

**Row 3 - Item 3 (w=4, v=5):**

| Items ↓ / Capacity → | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| :---  | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** (no items)         | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Item 1** (w=1, v=1) | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| **Item 2** (w=3, v=4) | 0 | 1 | 1 | 4 | 5 | 5 | 5 | 5 |
| **Item 3** (w=4, v=5) | 0 | 1 | 1 | 4 | **5** | **6** | **6** | **9** |

- **Capacity 0-3**: Item 3 is too heavy (w=4), keep previous best
- **Capacity 4**: Item 3 fits! value = 5 vs previous best = 5. Tie, either works → **5**
- **Capacity 5**: Take Item 3 (5) + best with 1kg remaining (Item 1 = 1) → `5 + 1 = 6` vs previous 5 → **6**
- **Capacity 7**: Take Item 3 (5) + best with 3kg remaining (Item 2 = 4) → `5 + 4 = 9` vs previous 5 → **9**

**Row 4 - Item 4 (w=5, v=7):**

| Items ↓ / Capacity → | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| :---  | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** (no items)         | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Item 1** (w=1, v=1) | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| **Item 2** (w=3, v=4) | 0 | 1 | 1 | 4 | 5 | 5 | 5 | 5 |
| **Item 3** (w=4, v=5) | 0 | 1 | 1 | 4 | 5 | 6 | 6 | 9 |
| **Item 4** (w=5, v=7) | 0 | 1 | 1 | 4 | 5 | **7** | **8** | **9** |

- **Capacity 5**: Item 4 fits perfectly! value = 7 vs previous 6 → **7**
- **Capacity 6**: Take Item 4 (7) + best with 1kg remaining (1) → `7 + 1 = 8` vs previous 6 → **8**
- **Capacity 7**: Take Item 4 (7) + best with 2kg remaining (1) → `7 + 1 = 8` vs previous 9 → keep **9** (Item 2 + Item 3)

**Answer:** The maximum value we can carry with capacity 7 is **$9** (Item 2 + Item 3).

### Implementation

```python
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            # Don't take item i
            dp[i][w] = dp[i - 1][w]

            # Take item i (if it fits)
            if weights[i - 1] <= w:
                take = values[i - 1] + dp[i - 1][w - weights[i - 1]]
                dp[i][w] = max(dp[i][w], take)

    return dp[n][capacity]
```

**Complexity:** $O(N \times W)$ time, $O(N \times W)$ space.

Since each row only depends on the row above it, you can optimize space to $O(W)$ by using a single 1D array and iterating capacity **right-to-left** (so you don't overwrite values you still need).

```python
def knapsack_optimized(weights, values, capacity):
    dp = [0] * (capacity + 1)

    for i in range(len(weights)):
        for w in range(capacity, weights[i] - 1, -1):  # right-to-left
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])

    return dp[capacity]
```
