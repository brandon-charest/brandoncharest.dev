+++
title = "Rendering Experiments"
date = "2026-01-02"
description = "Exploring different rendering approaches: Canvas, WebGL, and WebGPU"

[taxonomies]
tags = ["rust", "wasm", "webgl", "webgpu", "graphics"]

[extra]
growth = "seedling"
type = "project"
+++

## The Problem

The basic tutorial uses a 2D canvas with black and white dots. **That's ugly.**

For a generative art tool, I need:
- High resolution (4K exports)
- Millions of particles
- Visual effects (bloom, chromatic aberration)
- Custom color palettes

---

## Rendering Options

### 1. Canvas 2D (Current)

**Pros:**
- Simple API
- Easy to get started

**Cons:**
- Performance tanks with >10k cells
- Limited visual effects
- Can't handle millions of particles

### 2. WebGL

**Pros:**
- GPU accelerated
- Can handle millions of particles
- Shader support for effects

**Cons:**
- More complex API
- Verbose boilerplate
- GLSL shader language

### 3. WebGPU (Future)

**Pros:**
- Modern GPU API
- Better performance than WebGL
- Compute shaders for simulation
- WGSL shader language (more Rust-like)

**Cons:**
- Still experimental
- Limited browser support
- Steeper learning curve

---

## Current Focus: WebGL Migration

### Plan

1. **Vertex shader:** Position particles on screen
2. **Fragment shader:** Apply colors and effects
3. **Bloom effect:** Make particles glow
4. **Chromatic aberration:** RGB color split for artistic look

### Resources I'm Following

- [WebGPU Fundamentals](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html)
- Rust `wgpu` crate documentation
- Three.js shaders for inspiration

---

## Experiments Log

- [ ] Basic WebGL point rendering
- [ ] Color palette system
- [ ] Bloom post-processing
- [ ] 4K export functionality
- [ ] Performance comparison: 1M vs 10M cells

---

## Questions to Explore

- Can I use compute shaders to run Game of Life logic on GPU?
- How to export high-res frames to video format (MP4/WebM)?
- What's the performance difference between WebGL and WebGPU?
