+++
title = "WASM Setup & Tooling"
date = "2026-01-02"
description = "Build process, tools, and gotchas when working with Rust WASM"

[taxonomies]
tags = ["rust", "wasm", "tooling"]

[extra]
growth = "seedling"
type = "reference"
+++

## Build Tools

### Wasm-Pack

Rust has native WASM support via [`wasm-pack`](https://github.com/rustwasm/wasm-pack).

**Build command:**

```bash
wasm-pack build --target web
```

This compiles your Rust code to WebAssembly and generates JavaScript bindings.

## Key Dependencies

### Wasm-Bindgen

[`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen) facilitates communication between WebAssembly and JavaScript.

**Use case:** Exposing Rust functions to JS, importing JS functions into Rust

### Console Error Panic Hook

[`console_error_panic_hook`](https://github.com/rustwasm/console_error_panic_hook) provides better error messages when Rust panics in WASM.

**Add to `Cargo.toml`:**

```toml
[dependencies]
wasm-bindgen = "0.2"
console_error_panic_hook = "0.1"
```

## Common Gotchas

### Memory Management

- WASM has a linear memory model
- Need to be careful with memory allocation between JS and Rust
- Use `web-sys` for DOM manipulation

### Async Operations

- Rust's async/await works differently in WASM
- Need `wasm-bindgen-futures` for promise integration

### File Size

- Debug builds can be large (several MB)
- Use `--release` flag and `wasm-opt` for production

## Resources

- [Rust WASM Book](https://rustwasm.github.io/book/)
- [WebGPU Fundamentals](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html)
