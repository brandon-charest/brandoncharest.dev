+++
title = "Opcode"
date = "2025-12-05"
description = "Handling interrupts and pushing the program counter to the stack."
[taxonomies]
tags = ["emulator"]
[extra]
type = "notes"
growth = "growing"
local_image="images/6502/6502-opcode-table.png"
+++


## Shift Instructions

Implementing the NES 6502 in Rust has been quiet the adventure. I was trying to keep the logic simple, avoid magic numbers and make it easy to read. Then I got to the shift instructions...

By no means am I an expert in bitwise logic, in fact I actively avoid it when solving leetcode or any other problems. Luckily it does not come up a whole lot in day to day life for me. But I knew implementing the 6502, this was only going to be a matter of time.

### ASL - Arithmetic Shift Left

- ASL shifts either the accumulator or the address memory location 1 bit to the left.
- Bit 0 always being set to 0 and the input bit 7 being stored in the carry flag.
- ASL either shifts the accumulator left 1 bit or is a read/modify/write instruction that affects only memory.

**INITIAL STATE**

We have the value 172 (Binary 1010 1100).

```text
    [ Carry ]             [ Bit 7 ............ Bit 0 ]
   +---------+           +---------------------------+
   |    ?    |           |  1  0  1  0   1  1  0  0 |
   +---------+           +---------------------------+
                            ^
                            |
                     This '1' is about to fall off!
```

**THE SHIFT (<<<<)**

Everything moves one spot to the left.
A new '0' is always inserted at the right (Bit 0).
```
        /---- The '1' is pushed out...
        |
        v
   +---------+           +---------------------------+
   |    1    |  <------- |  0  1  0  1   1  0  0  0 |  <-- [0]
   +---------+           +---------------------------+      New 0
        ^                                                   enters
        |
   CAPTURED!
 ```  


**WHY WE NEED CARRY:**

1. Data Preservation: That '1' isn't lost; it's saved in the Status Register.
2. Multi-Byte Math: If this was the lower half of a 16-bit number,
   the next instruction (ROL) would pick this '1' up and move it 
   into the upper byte.


### Where I Went Wrong

I wanted a helper function called `shift_left` (how imaginative right?)

```rust
fn shift_left(cpu: &mut CPU, data: u8) -> u8 {
    // Check if the 7th bit is non-zero
    if data & (1 << 7) == 1 {
        cpu.registers.status.insert(Status::CARRY);
    } else {
        cpu.registers.status.remove(Status::CARRY);
    }

    let result = data << 1;
    cpu.update_nz_flags(result);
    result
}
```

What I imagined would happen is this would check if the 7th bit is 1, if so set the carry flag, otherwise clear it. 

Right? **WRONG**

- `1 << 7` equals 128 (`1000 0000`).
- **AND**ing `data` with `128` is either `0` or `128`.
- The result will never be `1`!

#### The Fix

```rust
fn shift_left(cpu: &mut CPU, data: u8) -> u8 {
    // Check if the 7th bit is non-zero
    if (data & (1 << 7)) != 0 {
        cpu.registers.status.insert(Status::CARRY);
    } else {
        cpu.registers.status.remove(Status::CARRY);
    }

    let result = data << 1;
    cpu.update_nz_flags(result);
    result
}
```

### Read-Modify-Write

Up until this point I was fine using:

```rust
pub(crate) enum AccessMode {
    Read,  // LDA, LDX, LDY, EOR, AND, ORA, ADC, SBC, CMP, BIT
    Write, // STA, STX, STY, INC, DEC
```

Until I realized that these instructions technically do both a read and a write.

*(it's a little more complex than that but I'll get into that later)*.

I could have made a `ReadModifyWrite` but since this is the only type of instruction that does both a read and a write, I decided to keep it simple.

```rust
pub fn asl(cpu: &mut CPU, bus: &mut dyn Bus, mode: &AddressingMode) {
    if *mode == AddressingMode::Accumulator {
        cpu.read(bus, cpu.registers.program_counter);
        let value = cpu.registers.accumulator;
        cpu.registers.accumulator = shift_left(cpu, value);
    } else {
        let addr = cpu.get_operand_address(mode, bus, AccessMode::Write);
        let value = cpu.read(bus, addr);
        cpu.write(bus, addr, value);
        let new_val = shift_left(cpu, value);
        cpu.write(bus, addr, new_val);
    }
}
```

## OpCodes

![OpCodes](/images/6502/6502-opcode-table.png)


