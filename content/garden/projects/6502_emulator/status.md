+++
title = "6502 Status"
date = "2026-01-04"

[taxonomies]
tags = [ "6502", "emulator" ]
[extra]
growth = "growing"
type = "project"
+++

## From `u8` to Type-Safe Flags

Originally I was implementing the Status register as just a `u8`. A single byte which each bit represents a different "flag" (Carry, Zero, etc...). I found writing `status |= 0b0000_0010` really hard to read and confusing after a while. To solve this I decided to treat Status as a struct and use the `bitflags` crate.

```rust
pub struct StatusArgs {
    pub negative: bool,
    pub overflow: bool,
    pub unused: bool,
    pub brk: bool,
    pub decimal_mode: bool,
    pub disable_interrupts: bool,
    pub zero: bool,
    pub carry: bool,
}
```

### Code Comparison

```rust
// I always forgot which bit I was working with
self.registers.status |= 0x02;

// Now this reads just like a sentence and is much easier to read/write
self.registers.status.insert(Status::ZERO);
```

### Why bitflags?

In Rust `bool` takes up an entire byte (8 bits) of memory. Since the Status is supposed to represent in total 8-bits we are going to use [bitflags](https://docs.rs/bitflags/latest/bitflags/) which will help map each bit.

1. `0b0000_0001`: Binary for 1. It tells Rust "This flag owns the 1st slot."
2. `0b0000_0010`: Binary for 2. It tells Rust "This flag owns the 2nd slot."
3. ...
4. `0b1000_0000`: Binary for 1. It tells Rust "This flag owns the 1st slot."

```rust
bitflags! {
    pub struct Status: u8 {
        const NEGATIVE           = 0b1000_0000;
        const OVERFLOW           = 0b0100_0000;
        const UNUSED             = 0b0010_0000; 
        const BRK                = 0b0001_0000;
        const DECIMAL_MODE       = 0b0000_1000;
        const DISABLE_INTERRUPTS = 0b0000_0100;
        const ZERO               = 0b0000_0010;
        const CARRY              = 0b0000_0001;
    }
}
```

### Resetting Status Flags

```rust
impl StatusArgs {
    #[must_use]
    pub const fn none() -> StatusArgs {
        StatusArgs {
            negative: false,
            overflow: false,
            unused: false,
            brk: false,
            decimal_mode: false,
            disable_interrupts: false,
            zero: false,
            carry: false,
        }
    }
}
```

#### What is StatusArgs::none()

This of `StatusArgs` like a checklist. The `none()` returns us a blank checklist, every flag in the struct is set to `false`. This allows us to use a Rust feature ca;ed **Struct Update Syntax (..)**. If I need to create a `Status` where only the carry flag is true, I do not need to write out all 8 flags. I can instead write:

```rust
let my_state = StatusArgs {
    carry: true,
    ..StatusArgs::none() // leave everything else blank"
};
```
