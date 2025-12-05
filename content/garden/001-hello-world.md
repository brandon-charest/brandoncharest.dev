+++
title = "Initializing the Emulator"
date = 2025-12-05
description = "First boot sequence. Setting up the Rust environment and defining the basic CPU struct for the 6502 architecture."

[taxonomies]
tags = ["rust", "emulator", "6502"]

[extra]
# This triggers your yellow status dot in the card grid
status = "building" 
+++

# > System Boot

I finally decided to port my brain from Python to **Rust**. The goal is to build a cycle-accurate MOS 6502 emulator.

## Why 6502?
It's the chip that powered the NES, Commodore 64, and Apple II. If I can understand this, I can understand anything.

### The CPU Struct
Here is the initial definition. I'm using `u8` for registers because the 6502 is an 8-bit chip.

```rust
pub struct CPU {
    pub register_a: u8,
    pub register_x: u8,
    pub status: u8,
    pub program_counter: u16,
}

impl CPU {
    pub fn new() -> Self {
        CPU {
            register_a: 0,
            register_x: 0,
            status: 0,
            program_counter: 0,
        }
    }
}
```

Next Steps

    Implement the 0x00 (BRK) opcode.

    Build the memory bus.

    Figure out how to print "Hello World" without an OS.