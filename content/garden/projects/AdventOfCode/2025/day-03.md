+++
title = "Day 3: Lobby"
date = "2025-12-03"
description = "Solving the 'Lobby' battery problem"
[taxonomies]
    tags = [ "aoc", "rust" ]
[extra]
    status = "stable"
    problem_link = "[AoC_2025_D03](https://adventofcode.com/2025/day/3)"
+++
# Part 01
We made it to the lobby, but the elevators are broken, because why not.. things have been going so smoothly so far.

Luckily we can fix this, the batteries banks are close by
- 987654321111111
- 811111111111119
- 234234234234278
- 818181911112111

All we need to do, is for each battery bank, create the largest number we can by turning on exactly two batteries in each bank, add those numbers together for our total joltage needed.


- **98**7654321111111, you can make the largest joltage possible, `98`, by turning on the first two batteries.
- **8**1111111111111**9**, you can make the largest joltage possible by turning on the batteries labeled `8` and `9`, producing `89` jolts.
- 2342342342342**78**, you can make `78` by turning on the last two batteries (marked `7` and `8`).
- 818181**9**1111**2**111, the largest joltage you can produce is `92`.

total output joltage = `98 + 89 + 78 + 92 = 357`

```rust
fn highest_voltage(digits: &[u32]) -> u32 {
    let mut highest_voltage = 0;

    // Track the largest starting digit we have fully processed so far.
    let mut best_first_digit = 0;
    for (i, &first) in digits.iter().enumerate() {
        if first <= best_first_digit {
            continue;
        }
        best_first_digit = first;

        for &second in &digits[i + 1..] {
            let voltage = first * 10 + second;
            if voltage > highest_voltage {
                highest_voltage = voltage;
            }
        }
    }
    highest_voltage
}
```

Reflecting back for the second inner loop I could of also used  `.max()`
```rust
if let Some(&max_second) = digits[i + 1..].iter().max() {
    let voltage = first * 10 + max_second;
    highest_voltage = highest_voltage.max(voltage);
}
```

# Part 02

I found this section pretty difficult, we now need to create the largest number in each batter bank by turning on **exactly twelve** batteries.