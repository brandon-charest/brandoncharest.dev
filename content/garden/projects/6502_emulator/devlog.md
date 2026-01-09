+++
title = "Rust 6502 Dev Log"
date = "2026-01-06"
description = "A chronological record of my suffering."
[taxonomies]
tags = ["devlog"]
[extra]
type = "log" 
growth = "growing" 
+++


# 🏗️ Build Log

*A chronological record of my suffering.*

[Main Branch](https://github.com/brandon-charest/Rust6502)

## 📅 2026-01-08

### CPU Refactoring

The CPU file was starting to become way too large and was a pain to read. I decided to move the instructions into their own files.

```bash
src/hardware/cpu/
├── instructions/
│   ├── arithmetic.rs
│   ├── branch.rs
│   ├── compare.rs
│   ├── control.rs
│   ├── flags.rs
│   ├── increment.rs
│   ├── load.rs
│   ├── logic.rs
│   ├── mod.rs
│   ├── noop.rs
│   ├── shift.rs
│   ├── stack.rs
│   └── transfer.rs
├── addressing.rs
├── mod.rs
└── tests.rs
```

### Testing the NES 6502

I as able to make good progress with Klaus Dormann's functional tests, until I keep running into some loop traps. After debugging for longer than I am willing to admit, I realized it is because I have not implemented the Decimal Mode flag.

So for now ill abandon the Klaus Dormann's functional tests, and instead for on testing again known good NES ROM logs. Specifically the [NES Test ROMs](https://github.com/christopherpow/nes-test-roms/tree/master).

This means I need to look into loading ROMs into memory and running them.

## 📅 2026-01-07

### Refactor For `AccessMode`

Logic for the operations that handled reading and writing seemed to follow a similar pattern. To keep the structure I was creating  with `get_operand_address` and having most of the complexity there. I introduced a struct:

```rust
enum AccessMode {
    Read,  // LDA, LDX, LDY, EOR, AND, ORA, ADC, SBC, CMP, BIT
    Write, // STA, STX, STY, INC, DEC, ASL, LSR, ROL, ROR
}
```

This allows me to further refine my logic for specific calls, unifying the logic for read and write. Which also allows my `step()` function to remain clean.

(I hope future me does not come back and realize this is a terrible idea.)

```rust
AddressingMode::AbsoluteX => {
    let base = self.fetch_u16(bus);
    let addr = base.wrapping_add(self.registers.x_register as u16);
    let page_crossed = (base & 0xFF00) != (addr & 0xFF00);
    // the nes 6502 always used a cycle on write operations,
    if access_mode == AccessMode::Write || page_crossed {
        // Writing/Crossing Page, Burn a cycle
        let _ = self.read(bus, addr.wrapping_sub(0x0100));
    }

    addr
}


pub fn step(&mut self, bus: &mut dyn Bus) {
    let raw_data = self.fetch_byte(bus);
    let opcode = Opcode::from_u8(raw_data).expect("Unknown Opcode");

    match opcode.syntax {
        OpcodeSyntax::LDA => {
            let addr = self.get_operand_address(&opcode.mode, bus, AccessMode::Read);
            let value = self.read(bus, addr);
            self.registers.accumulator = value;
            self.update_nz_flags(value);
        }
        OpcodeSyntax::STA => {
            let addr = self.get_operand_address(&opcode.mode, bus, AccessMode::Write);
            self.write(bus, addr, self.registers.accumulator);
        }
```

The nice part of all that was since I am writing unit tests for the opcodes as I go, verifying correct cycle count and memory locations I was able to perform this refactor and rerun all my existing tests. Passing let me know I didn't break anything... yet

### Klaus Dormann's 6502 Functional Test framework

I just found [6502 Functional Test framework](https://github.com/klaus-dormann/6502-functional-test-framework). And I have already written and unit tested a good amount of the opcodes, so I thought let's start this sooner rather than later.

I set it up to run and.....  it failed. Not only did it fail, it failed on the VERY FIRST LINE!! 😂

```bash
0000: PC=$0400 OP=$D8 A=$00 X=$00 Y=$00 SP=$FD P=24
```

missing opcode Clear Decimal Mode (CLD=$D8)

## 📅 2026-01-04

### The "Panic Driven" Development Strategy

There are a lot of opcodes that need to be implemented and I do not thinking writing them all and then just doing a full send on the CPU is a great idea. So Ill just build it in steps one code at a time, and have the CPU yell at me when I miss something.

```rust
// cpu.rs
match opcode {
    0xEA => { self.cycles += 1; } // NOP
    _ => todo!("Opcode {:#X} not implemented!", opcode), 
}
```

Ill have to find a more robust solution later. Also need a way to have accurate testing, maybe there are already logs of what expected states an emulator should be in given a set of input.

## Moving to Structs

I am going to look into moving opcode into a more readable form, although I just started I think looking at just raw opcode will become difficult or confusing in the long run. My current thought is an opcode is really made up of multiple parts

```rust
#[derive(Debug, PartialEq, Eq)]
pub enum OpcodeSyntax {
    BRK,
    NOP,
}

#[derive(Debug, PartialEq, Eq)]
pub enum AddressingMode {
    Immediate,
}

pub struct Opcode {
    pub code: u8,
    pub syntax: OpcodeSyntax,
    pub mode: AddressingMode,
    pub bytes: u8,
    pub cycles: u8,
}

impl Opcode {
    fn from_u8(code: u8) -> Option<Self> {
        match code {
            0xEA => Some(Opcode {
                code: 0xEA,
                syntax: OpcodeSyntax::NOP,
                mode: AddressingMode::Immediate,
                bytes: 1,
                cycles: 2,
            }),
            _ => todo!("Opcode {:#X} not implemented!", code),
        }
    }
}
```

## Clock Cycles

I need to find a way to implement proper clock cycles, each opcode or read/write will consume some number of cycles.

ref: [6502 Opcodes](http://www.6502.org/tutorials/6502opcodes.html)

## 📅 2026-01-02

Spent a few hours trying to put Bus inside CPU. I want to have a debugger (maybe visual) and implement graphics. I'm worried I will run into borrow checker issues if the CPU **owns** the `Bus`.

- **Problem**: If CPU owns Bus, and Bus needs to trigger an interrupt on CPU, we have a reference cycle.

- **Solution:** Dependency Injection. I'm passing `&mut Bus` into `step()` every single cycle. Hopefully this will not bite me in the ass. 😁
