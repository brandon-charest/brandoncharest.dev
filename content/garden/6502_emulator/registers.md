+++
title = "6502 Registers"
date = "2025-12-19T15:34:29.514Z"

[taxonomies]
tags = [ "6502", "emulator" ]
[extra]
type = "reference"
+++

# Modeling the 6502 Registers

### Why does a CPU need registers? 
Lets imagine for a moment that a large bookshelf is in front of you, you are the CPU, and the bookshelf represents RAM. We can think of your hands as registers, our hands will pick books from the bookshelf for us to read, or write in, when we are done, we return it to the bookshelf.

### Ok... but why u8?
The 6502 chip has 8 physical wires attached to it, it can physically only consume one byte at a time. This means the `ALU` which is essentially the calculator part within the chip itself, can only handle 8-bits at a time. If we need to add two 16-bit numbers together, the `ALU` needs to perform two separate 8-bit additions. _(one for the low byte, one for the high byte)_

```rust
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct Registers {
    pub accumulator: u8,
    pub x_register: u8,
    pub y_register: u8,
    pub stack_pointer: u8,
    pub program_counter: u16,
    pub status_register: u8
}

impl Default for Registers {
    fn default() -> Self {
        Self::new()
    }
}

impl Registers {
    #[must_use]
    pub fn new() -> Self {
        Self {
            accumulator: 0,
            x_register: 0,
            y_register: 0,
            stack_pointer: 0,
            program_counter: 0,
            status_register: 0
        }
    }
}
```
### Hang on... the Program Counter is 16-bits??
Even though the CPU thinks in terms of 8-bits we would need more then memory then what 8-bits can provide. An 8-bit number only has a range of `0-255` where as a 16-bit gives us 64KB of space to use. In order to achieve this the 6502 uses two 8-bit registers.



# Registers
| Register | Size (bits) | Purpose|
| :--- | :--- | :--- |
| Accumulator (**A**) | 8 | Used to perform calculations on data. Instructions can operate directly on the accumulator instead of spending CPU cycles to access memory|
| X register (**X**)| 8 | Used as an index in some addressing modes|
| Y register (**Y**)| 8 | Used as an index in some addressing modes|
| Program Counter (**PC**)| 16 | Points to the address of the next instruction to be executed|
| Stack Pointer (**SP**)| 8 | Stores the stack index into which the next stack element will be inserted. The address of this position is **`$0100`** + **`SP`**. **`SP`** is initially set to **`$FD`**|
| Status (**P**)| 8 | Each bit represents a status flag.<br>Flags indicate the state of the CPU, or information about the result of the previous instruction. PHP and PLP can save/restore P from the stack. Various instructions can directly set or clear bits in P: SEC, CLC, SEI, CLI, SED, CLD, CLV.<br>See the table below for a description of each flag.  |

# Status Register

| Bit | Symbol | Name | Description |
| :--- | :--- | :--- | :--- |
| 7 | N | Negative | Set if the result was negative. |
| 6 | V | Overflow | Set if signed overflow occured during addition or subtraction. |
| 5 | - | (Unused) | Always set |
| 4 | B | Break |Set if an interrupt request has been triggered by a **`BRK`** instruction  |
| 3 | D | Decimal mode: mathematical instructions will treat the inputs and outputs as "Binary Coded Decimal"   |
| 2 | I | (Unused) |Interrupt Disable  |Disables **`IRQ`** interrupts while set. NMIs and RESETs are not affected. |
| 1 | Z | Zero | Compare: Set if the register's value is equal to the input value.<br>BIT: Set if the result of logically ANDing the accumulator with the input results in 0.<br>Otherwise: Set if result was zero.  |
| 0 | C | Carry | Carry/Borrow flag used in math and rotate operations<br>Arithmetic: Set if an unsigned overflow occurred during addition or subtraction, i.e. the result is less than the initial value (or equal to the initial value, if the carry flag was set going in)<br>Compare: Set if register's value is greater than or equal to the input value<br>Shifting: Set to the value of the eliminated bit of the input, i.e. bit 7 when shifting left, or bit 0 when shifting right  |
