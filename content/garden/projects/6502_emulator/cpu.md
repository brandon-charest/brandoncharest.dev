+++
title = "From Monolithic Match to Modular Dispatch"
date = "2026-01-08T22:34:21.000Z"
description = "Refactoring the 6502 CPU to use a dispatch table instead of a monolithic match statement."

[taxonomies]
tags = [ "6502", "emulator", "rust" ]

[extra]
growth = "growing"
type = "project"
+++


The heart of the emulator: the CPU. What started as a small match statement just handling LDA, LDX, LDY, STA, STX, STY, NOP.

## Initial Design

`step` function was the core functionality for the CPU performing three main tasks:

1. Fetch the next instruction
2. Decode the instruction
3. Execute the instruction

```rust
pub fn step(&mut self, bus: &mut dyn Bus) {
    let opcode = Opcode::from_u8(raw_data)
        .unwrap_or_else(|| panic!("Unknown opcode ${:02X}", raw_data));

    match opcode {
        OpcodeSyntax::LDA => { // ADC Immediate
            let value = self.fetch(bus);
            // ... couple lines of logic for each addressing mode...
        },
        OpcodeSyntax::LDX => { // ADC Zero Page
            let value = bus.fetch();
            // ... same couple lines of logic for each addressing mode...
        },
        // ... repeat for 150+ opcodes
    }
}
```

I am also writing unit tests for each opcode to ensure they are working as expected and that I don't break anything along the way. This ended up helping me big time later when I decided to do this refactor and was able to quickly catch issues.

Besides this file growing in size, there was also **a lot** of code duplication, and got really difficult to find specific opcodes to modify or debug.

## The Dispatch Table

Broke the CPU logic into files based on function. 

- `arithmetic.rs`: Math (ADC, SBC)
- `branch.rs`: Branching (BCC, BCS, BEQ, BMI, BNE, BPL, BVC, BVS)
- `compare.rs`: Compare (CPX, CPY, CMP)
- `control.rs`: Jumps and branches (JMP, JSR, RTS, RTI, BRK)
- `flag.rs`: Flag (CLC, CLD, CLI, CLV, SEC, SED, SEI)
- `increment.rs`: Increment (INC, INX, INY, DEC, DEX, DEY)
- `load.rs`: Load and store (LDA, LDX, LDY, STA, STX, STY)
- `shift.rs`: Bit movement (ASL, LSR, ROL, ROR)
- `stack.rs`: Stack (PHA, PLA, PHP, PLP)
- `transfer.rs`: Transfer (TAX, TAY, TXA, TYA)
- `noop.rs`: No Operation (NOP)

Now all the logic lives in their respective locations, the CPU does not know how to add, but it does know who to ask.

```rust
pub fn step(&mut self, bus: &mut dyn Bus) {
    let opcode = self.fetch_decoded(bus);

    match opcode.syntax {
        OpcodeSyntax::ADC => arithmetic::adc(self, bus, &opcode.mode),
        OpcodeSyntax::ROL => shift::rol(self, bus, &opcode.mode),
        OpcodeSyntax::JMP => control::jmp(self, bus, &opcode.mode),
        // ... 
    }
}
```

## Address Resolver

Perhaps the single biggest win in this refactor was consolidating the memory calculation logic.

### The Issue

The 6502 has complex addressing modes. "Indirect Indexed" `(d),Y` works very differently from "Indexed Indirect" `(d,X)`. In my original code, I was copy-pasting the logic to calculate these addresses inside every single instruction.

    ADC needed to know how to handle (d),Y.

    LDA needed to know how to handle (d),Y.

    CMP needed to know how to handle (d),Y.

    ...

I could quickly see that where this was going...

- change needs to be made in multiple places
- **absolutely** miss updating one location 
- spend a whole bunch of time debugging
- find the issue
- be mad at all the time I wasted
- fix it
- move on to the next issue...

### The Solution: `get_operand_address`

```rust
fn get_operand_address(
        &mut self,
        mode: &AddressingMode,
        bus: &mut dyn Bus,
        access_mode: AccessMode,
    ) -> u16 {
        match mode {
            AddressingMode::Absolute => {
                let addr = self.fetch_u16(bus);
                addr
            }
            AddressingMode::AbsoluteX => {
                let base = self.fetch_u16(bus);
                let addr = base.wrapping_add(self.registers.x_register as u16);
                let page_crossed = (base & 0xFF00) != (addr & 0xFF00);
                if access_mode == AccessMode::Write || page_crossed {
                    // Crossing Page, Burn a cycle
                    let _ = self.read(bus, addr.wrapping_sub(0x0100));
                }

                addr
            }
            // ... repeat for all modes
        }
}
```