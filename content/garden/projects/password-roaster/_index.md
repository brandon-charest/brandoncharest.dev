+++
title = "Password Roaster API"
date = "2025-12-27T19:21:19.940Z"
description = "An API that validates your password security and hurts your feelings."
draft = true
+++

# 🛡️ Password Roaster API

Stop validating passwords with regex. Start validating them with shame.

## ⚡ Quick Start

Run this in your terminal to see if your password is secure:

```bash
curl -X POST [https://api.brandoncharest.dev/roast](https://api.brandoncharest.dev/roast) \
  -H "Content-Type: application/json" \
  -d '{"password": "password123"}'
