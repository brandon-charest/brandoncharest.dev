+++
title = "Day 2: Gift Shop"
date = "2025-12-02"
description = "Finding invalid product IDs"
[taxonomies]
    tags = [ "aoc", "rust" ]
[extra]
    status = "stable"
    problem_link = "[AoC_2025_D02](https://adventofcode.com/2025/day/2)"
+++
# Part 01
Day 1 done, we made it to the gift shop! (who is even visiting this shop??).

An elf has added a bunch of invalid product IDs to their database, and we are given a list of ranges we need to check. 
```text
11-22,95-115,998-1012,1188511880-1188511890,222220-222224,...
```
An invalid product ID is made only of some sequence of digits repeated twice. So, 55 (5 twice), 6464 (64 twice), and 123123 (123 twice).

First step is to parse the input into a more manageable state. Rust allows us to write a small compact "one-liner", which is in a functional style. [chaining-methods](@/garden/rust/chaining-methods.md)
```rust
// create a struct to hold our range
struct Range {
    start: i64,
    end: i64,
}

// parsing the input
let ranges: Vec<Range> = input
    .split(',')
    .map(|s| s.parse()) // Range must implement FromStr
    .collect::<Result<Vec<_>>>()?;
```

Since we are parsing a string to our `Range` struct we need to [FromStr](@/garden/rust/from-str.md).

```rust
impl FromStr for Range {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self> {
        let (start_str, end_str) = s // Ex. s="11-22"
            .split_once('-') 
            .ok_or_else(|| anyhow::anyhow!("Invalid format"))?;

        Ok(Range {
            start: start_str.parse().context("Invalid start")?,
            end: end_str.parse().context("Invalid end")?,
        })
    }
}
```

With that out of the way we now need to loop through all our nicely parsed data.
```rust
impl Range {
    fn iter(&self) -> std::ops::RangeInclusive<i64> {
        self.start..=self.end
    }
}


for range in ranges {
    println!("Proccessing range: {}-{}, ", range.start, range.end);

    for num in range.iter() { // NOTE: we implemented the iter function
        if valid_pattern(num) {
            total += num
        }
    }
}
```

We didn't need to implement a custom [iter](@/garden/rust/iter.md) on our object we could have...
```rust
for num in range.start..=range.end {
    // awesome logic here..
}
```
But since I am doing this to learn some Rust I figured why not...

## Pattern

One observation we can make is that the invalid product IDs will have have some sequence of its numbers repeated twice. Meaning only numbers that have an even amount of digits in them can be considered!

Since we know the sub sequence is repeated twice that means that if we split the number in half, the first half **must** equal the second half

```rust
fn valid_pattern(num: i64) -> bool {
    // Convert the number to a string so we can slice it
    let num_str = num.to_string();

    // Optimization: A number with an odd length (e.g., 12345) 
    // cannot possibly be composed of two identical halves.
    if num_str.len() % 2 == 0 {

        // Calculate the midpoint. 
        let size = num_str.len() / 2;
        let (first_half, second_half) = num_str.split_at(size);
        return first_half == second_half;
    } 
    false
}
```

# Part 02

For part 02 the added twist is a product ID is invalid if it is made only of some sequence of digits repeated **at least** twice.

```rust
fn valid_pattern2(num: i64) -> bool {
    let num_str = num.to_string();
    let total_len = num_str.len();
    
    // We only need to check up to half the length.
    // A pattern longer than 50% can't repeat at least twice.
    let mid = total_len / 2;

    for i in 0..mid {
        let pattern_len = i + 1; // 1-based length

        // Only check lengths that divide evenly into the total.
        // e.g. For a length of 10, only check patterns of length 1, 2, and 5.
        if total_len % pattern_len != 0 {
            continue;
        }

        let pattern = &num_str[0..pattern_len];
        let repeat_count = total_len / pattern_len;

        if num_str == pattern.repeat(repeat_count) {
            return true;
        }
    }
    false
}
```
Ex. `123123123` length = 9
| Iteration | Pattern Length | Divisible? (9 % len) | Candidate | Check | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| i = 0 | **1** | Yes | `1` | `111111111` | ❌ Fail |
| i = 1 | **2** | No | - | - | *Skip* |
| i = 2 | **3** | Yes | `123` | `123123123` | ✅ **Match** |