+++
title = "Escaping tutorial hell"
date = "2025-12-27T19:21:19.940Z"
description = "How I stop over-thinking and started shipping"
[taxonomies]
    tags = [ "rust", "aws", "lambda" ]
[extra]
    pinned = true
    type = "blog"
    growth = "evergreen"
+++



## The Analysis Paralysis and the Cycle of Abandoned Projects

I found myself constantly stuck _trying_ to create new projects and had perfected the art of quickly killing it by over-analyzing. Each time I came up with a new idea I found myself constantly stuck trying to create new projects and had perfected the art of killing them before they lived. Each time I came up with a new idea, I'd get lost in the smallest details.

You know when those details mattered? **Never.** Because I never finished any of the projects.

After reflecting on this problem for a little while, I wondered what if I built just a completely ridiculous project, something that had no serious value and was strictly just for fun.

## The "Stupid" Idea: Weaponized Insults

The idea is simple: a user inputs a password, and the API returns a security score... and an insult.

**Try it yourself:** [roastmypassword.com](https://roastmypassword.com/)

Yup, that's it. No stakes, no pressure, just a fun little project.

## The Over-Engineering Trap

I still wanted to learn something along the way, and since I use Python, JavaScript, and Java daily for work, I decided to implement the API in Rust. I have been wanting to learn more about the language for a while, and thought this would be as good a time as any.

### The Trap

No sooner did I start, I caught myself thinking too far ahead...

- _"Whats the best structure I should use so I could scale this easier in the future?"_
- _"What if I need a database?_
- _"What kind of database?"_

..and various other thoughts about clever ways I could implement the insult generator.

### Breaking Free

This time I made myself remember, all these thoughts are not getting me any close to finishing this. So I literally stopped worrying about what **could be** needed and just started writing **only** what I needed right now.

## Embracing the "Good Enough"

Giving myself permission to be _lazy_ was the hardest part of the project. But once I did all the technical decisions became obvious. I did not need a React SPA application with Redux state management, or a database to store insults, or anything complex. I needed a function that took in a string and returned a string.

- **Language:** Rust (because I wanted to learn it and insult users blazingly fast)
- **Backend:** AWS Lambda
- **Frontend:** A single HTML file. No build steps, no node_modules.

The code is simple. It uses the [`zxcvbn`](https://crates.io/crates/zxcvbn) crate to calculate the strength of the password, and a simple "Mad Libs" style insult generator to construct the insult.

## The $0.00 Deployment

In the past, this is where I would have spent the next few hours or days, trying to find a clever solution with my insult generator. I would have tried to come up with a more scalable solution.

Instead, I deployed it.

The frontend is just an index.html file hosting on Cloudflare Pages. The backend is a Rust binary running on Lambda. It costs me $0.00/month to run.

Is it perfect? No, in fact I am almost positive I have some spelling mistakes and bugs. Does it scale to millions of users? Probably not, (but I'm sure Rust helps with that). Does it make me laugh? Yes.

## Moral of the Story

As engineers we are trained to think about the edge cases, scalability, performance, architecture patterns, and "future-proofing".

_(I'm looking at you Database Abstraction Layer. You know, just in case I decide to migrate from PostgreSQL to MongoDB to Cassandra next Tuesday)_

But for a side project, future-proofing is just procrastination with extra steps.

By choosing to build something "stupid", I was able to make that mental shift and removed the pressure to be "smart". I learned more about Rust, and managing my own deployment to AWS in a weekend then I would have if I spent the next few days/months watching more tutorials and researching to build a more "serious" project. Not everything needs to be perfect or serious, sometimes its nice to just have fun.
