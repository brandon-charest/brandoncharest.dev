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