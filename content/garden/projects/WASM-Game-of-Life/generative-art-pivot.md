+++
title = "Generative Art Station Pivot"
date = "2026-01-02"
description = "Transforming Game of Life from tutorial to a generative art tool for designers"
draft = true
[taxonomies]
tags = ["rust", "wasm", "webgl"]

[extra]
growth = "growing"
type = "project"
+++

## The Vision

Turn the basic Game of Life tutorial into a professional tool for designers to create high-resolution, loopable, abstract video backgrounds or textures.

**Target users:** Web designers, VJs, motion graphics artists, content creators

## The Product

### Free Tier
- Play with the simulation in the browser
- Customize color palettes and patterns
- Preview effects in real-time

### Paid Tier ($10)
- Export 4K video loops (MP4/WebM)
- SVG vector exports
- High-resolution PNG sequences
- No watermark

---

## Technical Challenges

### 1. WebGL/WGPU Renderer

The tutorial uses basic 2D canvas. I need to rewrite the renderer to support:

- ✅ Millions of particles
- 🔄 Bloom effects
- 🔄 Chromatic aberration
- 🔄 Custom color palettes
- ⏳ Motion blur
- ⏳ Particle trails

### 2. Video Export

**Challenge:** Browser APIs don't easily export high-res video.

**Options:**
- Canvas Capture API + MediaRecorder
- Frame-by-frame PNG export → FFmpeg
- Server-side rendering with `headless-gl`?

### 3. Performance

**Target:** Maintain 60 FPS with 1M+ particles at 1080p

**Optimizations needed:**
- GPU compute shaders for simulation
- Instanced rendering for particles
- Web Workers for frame encoding

---

## Design Decisions

### Color Palette System

Instead of black/white, allow:
- Predefined palettes (vaporwave, cyberpunk, nature)
- Custom hex color picker
- Gradient mapping based on cell age

### UI/UX

- Minimal controls (don't overwhelm users)
- Real-time preview
- Preset patterns (glider guns, pulsars, etc.)

---

## Monetization Ideas

### Option 1: One-time Purchase
- $10 for lifetime access to exports
- Simple, no subscription fatigue

### Option 2: Credit System
- Free: 5 exports/month
- $5: 20 exports
- $15: Unlimited

### Option 3: Gumroad
- Sell as a web app link
- Easy payment processing
- No hosting costs (Cloudflare Pages)

---

## Progress Tracker

- [x] Basic Game of Life implementation
- [ ] WebGL renderer with effects
- [ ] Color palette system
- [ ] Export to 4K video
- [ ] Marketing landing page
- [ ] Payment integration

---

## Questions to Answer

- Is there market demand for this? (Research on Reddit, Twitter)
- What's the pricing sweet spot? ($5 vs $10 vs $20)
- Should I release as open-source with paid hosting?
- Competition: Any similar tools out there?

---

## Related Notes

- [[rendering-experiments]] - Technical rendering details
- [[game-of-life-algorithm]] - Core algorithm
