+++
title = "Day 1: Secret Entrance"
date = "2025-12-01"
description = "Deciphering the Elfs Safe Combination"
[taxonomies]
    tags = [ "aoc", "rust" ]
[extra]
    status = "stable"
+++


# Lets save Christmas! (again!)

[Day-01 Problem](https://adventofcode.com/2025/day/1). Since we only have 12 days of code challenges this year, I am anticipating to this get pretty difficult fast.

## Part 01

We have to track how many times a dial lands on 0. The main challenge is handling the "wrapping" behavior correctly. We are working with a circular dial (0-99), so we need to ensure that decrementing below 0 wraps back to 99, and incrementing above 99 wraps back to 0.

Being new to Rust I wanted to try and avoid just hacking apart strings so I decided to try and define proper domain models. I created an **Instruction** struct to hold the parsed data and a **Direction** enum to enforce that we only ever deal with **Left** or **Right** turns.

```rust
enum Direction {
    Left,
    Right,
}

struct Instruction {
    direction: Direction,
    amount: i32,
}

struct Dial {
    position: i32,
}
```

For each line in our input I am expecting something like **L68**. Ideally I wanted a simple way to parse this string

```rust
let instr: Instruction = line.parse()?;
```
But in order for **line.parse()** to work for the custom struct I had to implement the [FromStr](@/garden/rust/from-str.md) trait. Essentially we need to tell Rust what the logic is for converting a string to an **Instruction**.

```rust
impl FromStr for Instruction {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self> {
        // Split the string at the first byte. 
        // "L68" becomes "L" and "68".
        let (dir_char, num_str) = s.split_at(1);
        
        // Parse the number part
        let amount = num_str.parse().context("Failed to parse amount")?;
        
        // Map the letter to our Enum type
        let direction = match dir_char {
            "L" => Direction::Left,
            "R" => Direction::Right,
            _ => return Err(anyhow::anyhow!("Invalid direction: {}", dir_char)),
        };

        Ok(Instruction { direction, amount })
    }
}
```

### Handling the Rotation
With our instructions parsed, we need to apply them to the Dial. The roadblock I hit here was how to handle the wrapping in a nice way, because just using the  modulo operator % on a negative number returns a negative number (e.g., **-5 % 100 == -5**), which is not want I want, I want the wrapped around value which is 95. Turns out Rust provides a built-in method specifically for this: [rem_euclid](https://doc.rust-lang.org/std/primitive.i32.html#method.rem_euclid).

```rust
impl Dial {
    fn new(start: i32) -> Self {
        Self { position: start }
    }

    fn rotate(&mut self, instr: &Instruction) -> i32 {
        // Determine the raw change in value
        let change = match instr.direction {
            Direction::Left => -instr.amount,
            Direction::Right => instr.amount,
        };

        // Update position using Euclidean remainder to handle wrapping
        // This ensures -5 becomes 95, rather than staying -5
        self.position = (self.position + change).rem_euclid(100);

        // Return 1 if we landed on 0, otherwise 0
        if self.position == 0 { 1 } else { 0 }
    }
}
```
By returning 1 or 0 directly from the rotate function, we can  simplify our main loop to just sum the results:
```rust
// The main loop becomes very clean
for line in input.lines() {
    let instr: Instruction = line.parse()?;
    total += dial.rotate(&instr);
}
```

## Part 02

Part 2 gives us a new challenge now instead of counting each time we land on 0, we also need to include every time the dial passes over 0. There is probably a more elegant way to handle this, but my logic was to just simply walk through all the instructions provided and keep count of each time we land on 0.

```rust
fn simulate_rotation(&mut self, instr: &Instruction) -> i32 {
    let mut hits = 0;
    for _ in 0..instr.amount {
        match instr.direction {
            Direction::Left => self.position -= 1,
            Direction::Right => self.position += 1,
        };
        // we normalize after each move
        // 99 -> 100 = 0
        // 0 -> -1 = 99
        self.position = self.position.rem_euclid(100);

        if self.position == 0 {
            hits += 1;
        }
    }
    hits
}
```
| Iteration | Start Pos | Action | Raw Value | Wrap (0-99) | Hit 0?  |
| :-------- | :-------- | :----- | :-------- | :---------- | :------ |
| 1         | 98        | + 1    | 99        | 99          | No      |
| 2         | 99        | + 1    | 100       | **0**       | **YES** |
| 3         | 0         | + 1    | 1         | 1           | No      |