+++
title = "First Heartbeat: Implementing the 6502 Reset and Loop"
date = "2026-01-06"
description = "Conducting the initial smoke test for the emulator."

[taxonomies]
tags = [ "6502", "emulator" ]

[extra]
growth = "seedling"
type = "project"
+++

## Why this Matters

Up until this point, the emulator was just a collection of structs and functions. This is the first time all the pieces work together:

- The CPU can fetch instructions from memory
- The program counter advances correctly
- Clock cycles are tracked
- The reset vector properly initializes the system

Might not look like it does much, but it's a huge milestone.

## The Reset Vector

When the 6502 powers on or receives a reset signal, it doesn't just start executing from address `$0000`. Instead, it looks at a special location in memory called the **Reset Vector**, which is a hard-wired address at `$FFFC-$FFFD`.

These two bytes form a 16-bit address ([little-endian](https://www.geeksforgeeks.org/dsa/little-and-big-endian-mystery/)) that tells the CPU where to begin execution:

```rust
memory.write(0xFFFC, 0x00); // Low byte
memory.write(0xFFFD, 0x80); // High byte
// This creates the address $8000
```

The 6502 reads these bytes during reset and sets the program counter (PC) to `$8000`, where our program begins.

## Memory Map

Here's what our test program looks like in memory:

```text
Address   Value    Description
───────────────────────────────────
$8000:    EA       NOP (do nothing)
$8001:    EA       NOP
$8002:    EA       NOP  
$8003:    00       BRK (halt)
...
$FFFC:    00       Reset vector (low byte)
$FFFD:    80       Reset vector (high byte)
                   → Points to $8000
```

## Understanding the Debug Output

I want to create a way to be able to see the memory states of the 6502 for debugging. The first iteration of this debugging will be just writing to the console, soon I want to find a way to visualize this.

Each line shows the CPU state after executing an instruction:

```bash
--- Starting 6502 Emulation ---
PC: 8000 | A: 00 X: 00 Y: 00 | SP: FD | Flags: nv-bdIzc | MEM: EA EA EA 00 00 00 00 00 | Cycles: 2
PC: 8001 | A: 00 X: 00 Y: 00 | SP: FD | Flags: nv-bdIzc | MEM: EA EA 00 00 00 00 00 00 | Cycles: 4
PC: 8002 | A: 00 X: 00 Y: 00 | SP: FD | Flags: nv-bdIzc | MEM: EA 00 00 00 00 00 00 00 | Cycles: 6
PC: 8003 | A: 00 X: 00 Y: 00 | SP: FD | Flags: nv-bdIzc | MEM: 00 00 00 00 00 00 00 00 | Cycles: 8
BRK (0x00) detected. Halting.
--- Emulation Finished ---
```

**Breaking it down:**

| Field | Meaning |
| :-- | :-- |
| `PC: 8000` | Program Counter at `$8000` |
| `A: 00` | Accumulator register = 0 |
| `X: 00` | X index register = 0 |
| `Y: 00` | Y index register = 0 |
| `SP: FD` | Stack Pointer at `$01FD` |
| `Flags: nv-bdIzc` | Status flags (lowercase = not set, uppercase = set) |
| `Cycles: 2` | Total CPU cycles elapsed (NOP takes 2 cycles) |

For more on registers, see [registers.md](@/garden/projects/6502_emulator/registers.md). For status flags, see [status.md](@/garden/projects/6502_emulator/status.md).

**What's changing:**

- **PC increments** from `$8000` → `$8001` → `$8002` → `$8003`
- **Cycles increase** by 2 each time (NOP takes 2 cycles)
- Everything else stays the same (NOP doesn't modify registers or flags)

## The Main Loop

Here's the Rust code that runs the emulator:

```rust
fn main() {
    let mut cpu = CPU::new();
    let mut memory = Memory::new();
    
    // Load our test program
    memory.write(0x8000, 0xEA); // NOP
    memory.write(0x8001, 0xEA); // NOP
    memory.write(0x8002, 0xEA); // NOP
    memory.write(0x8003, 0x00); // BRK (treat as halt)

    // Set reset vector to $8000
    memory.write(0xFFFC, 0x00); // Low byte
    memory.write(0xFFFD, 0x80); // High byte

    cpu.reset(&mut memory);
    println!("--- Starting 6502 Emulation ---");
    
    loop {
        cpu.debug_info(&memory);

        let current_opcode = memory.read(cpu.registers.program_counter);
        if current_opcode == 0x00 {
            println!("BRK (0x00) detected. Halting.");
            break;
        }

        cpu.step(&mut memory);
    }

    println!("--- Emulation Finished ---");
}
```

The pattern is simple:

1. **Display** the current CPU state
2. **Fetch** the next opcode at PC
3. **Check** if it's a halt condition (BRK)
4. **Execute** the instruction via `cpu.step()`
5. **Repeat**

## What I Learned

### The Reset Sequence

The 6502 doesn't just start running—it has a bootstrap process:

1. Read reset vector from `$FFFC-$FFFD`
2. Set PC to that address
3. Initialize stack pointer to `$FD`
4. Set specific status flags


### Fetch-Decode-Execute Cycle

Even though `NOP` does nothing, it still follows the CPU cycle:

1. **Fetch** opcode from memory at PC
2. **Decode** (look up what `$EA` means)
3. **Execute** (do nothing)
4. **Increment PC** and consume 2 cycles

This foundational pattern will apply to every instruction, and confirms our `step()` function is working.

## What's Next

With this basic loop working correctly, I can move onto the next fundamental instruction **LDA (Load Accumulator)**. This will allow the emulator to:
- Read values from memory
- Store them in the accumulator register
- Update the Zero and Negative flags based on the loaded value