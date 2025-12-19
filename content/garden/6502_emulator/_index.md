+++
title = "6502 Emulator Project"
description = "Cycle-accurate emulation of the MOS 6502 processor."
sort_by = "date"
template = "section.html"
transparent = true
+++

# The 6502 CPU

The [6502](https://en.wikipedia.org/wiki/MOS_Technology_6502) is a 8-bit microprocessor, with a 16-bit address bus which gives a memory range of `0x0000~0xffff`, _(a whole 64k of ram! oh boy!)_, and supports 56 opcodes.

```text
┌───────────┐
│           │
│           │
│           │
|  General  | $0200 - $FFFF
│  Purpose  │
|           |
│           │ 
|           |
│           │
├───────────┤
│ Stack     │ $0100 - $01FF
├───────────┤
│ Zero Page │ $0000 - $00FF   
└───────────┘
```

# Resources
[nes-dev-wiki](https://www.nesdev.org/wiki/Nesdev_Wiki)
[6502-emulators](http://www.6502.org/tools/emu/)
[NES Emulator: Javidx9](https://www.youtube.com/watch?v=8XmxKPJDGU0)