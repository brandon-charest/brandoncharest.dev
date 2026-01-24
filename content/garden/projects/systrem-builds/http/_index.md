+++
title = "HTTP Server from Scratch"
description = "Reinventing the wheel to learn how the road works. Building a compliant HTTP/1.1 server using only Rust std::net."
date = "2025-01-24"
updated = "2025-01-24"
template = "section.html"
sort_by = "date"
weight = 1
transparent = true

[taxonomies]
tags = ["rust", "systems", "http", "networking"]
+++

> **"Imagine not using AI in the Lord's year 2025..."** — ThePrimeagen

## The Objective
To build a fully functional HTTP/1.1 server without touching `Actix`, `Axum`, or `Tokio`. We are going raw `std::net::TcpListener` to understand the magic behind the frameworks.

This project follows **The Codeholic / ThePrimeagen's** "From TCP to HTTP" course, but translated from Go to **Rust**.

**Specs:**
* **Lang:** Rust 🦀
* **Crates Allowed:** `std` only (maybe `anyhow` if I get lazy)
* **Protocol:** HTTP/1.1 (RFC 9110 / 9112)

---

## Implementation Roadmap

### Phase 1: Setup
Before we speak HTTP, we must master the socket.
- [ ] **Ch 1: HTTP Streams**
    * *Goal:* Create a continuous read loop that doesn't panic on empty bytes.
- [ ] **Ch 2: TCP**
    * *Goal:* Bind `std::net::TcpListener` to port 4221 and handle the 3-way handshake.

### Phase 2: Parsing Inbound (Request)
Turning raw bytes into a strongly typed Rust struct.
- [ ] **Ch 3: Requests**
    * *Goal:* Define the `Request` struct and basic lifecycle.
- [ ] **Ch 4: Request Lines**
    * *Goal:* Parse the "start-line": `METHOD URI VERSION` (e.g., `GET /index.html HTTP/1.1`).
- [ ] **Ch 5: HTTP Headers**
    * *Goal:* Parse `Key: Value` pairs into a `HashMap`, handling the `\r\n` delimiters.
- [ ] **Ch 6: HTTP Body**
    * *Goal:* Read the payload based on `Content-Length` (avoiding the infinite hang).

### Phase 3: Parsing Outbound (Response)
Sending data back without breaking the client.
- [ ] **Ch 7: HTTP Responses**
    * *Goal:* Implement a `Response` builder that formats the status line and headers correctly.

### Phase 4: Advanced Delivery
The complex stuff that makes the internet work.
- [ ] **Ch 8: Chunked Encoding**
    * *Goal:* Implement `Transfer-Encoding: chunked` for streaming data of unknown length.
- [ ] **Ch 9: Binary Data**
    * *Goal:* Serving images and files (handling raw `[u8]` vs `String`).

---

## Resources
* [The Video (ThePrimeagen)](https://www.youtube.com/watch?v=esbRryo0Ty8)