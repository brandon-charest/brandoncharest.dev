+++
title = "Escaping tutorial hell"
date = "2025-12-27T19:21:19.940Z"
description = "How I stop over-thnking and started shipping"
+++



## The Analysis Paralysis and the Cycle of Abandoned Projects

I found myself constantly stuck 'trying' to create new projects. Each time I came up with a new idea, I had perfected the art of quickly killing it by overanalyzing the idea and getting lost in the smallest details. You know when those little details mattered in all those past projects? Never. Because I never finished any of the projects, I would get too caught up in the long tail of things I thought I needed to do, and each time I would slowly lose enthusiasm and then finally give up. After reflecting on this problem for a little while, I wondered what if I built just a completely ridiculous project, something that had no serious value and was strictly just for fun.

## The "Stupid" Idea: Weaponized Insults

The idea is simple, a user inputs a password that they would like to validate and check how secure it is, and the API will return a score based on how secure the password is, and an insult...

Yup, that's it. No stakes, no pressure, just a fun little project.

## The Over-Engineering Trap

I still wanted to learn something a lot the way, and since I use Python, JavaScript, and Java daily for work, I decided to implement the API in Rust. I have been wanting to learn more about the language for a while, and thought this would be as good a time as any.

No sooner did I start, I caught myself thinking too far ahead, "Whats the best structure I should use so I could scale this easier in the future?", "What if I need a database? What kind of database?", and various other thoughts about clever ways I could implement the insult generator. You know where all those thoughts got me? Nowhere, so I literally stopped worrying about what __could__ be needed and just started writing __only__ what I needed right now.

## Embracing the "Good Enough"

Giving myself permission to be "lazy" was the hardest part of the project. But once I did all the technical decisions became obvious. I did not need a React SPA application with Redux state management, or a database to store insults, or anything complex. I needed a function that took in a string and returned a string.

- Language: Rust (Because I wanted to learn it, and insult users blazingly fast)
- Backend: AWS Lambda
- Frontend: A single HTML file. No build steps, no `node_modules`.

The code is simple. It uses the `zxcvbn` crate to calculate the strength of the password, and a simple "Mad Libs" style insult generator to construct the insult.

## The $0.00 Deployment

In the past, this is where I would have spent the next few hours of days, trying to find a clever solution with my insult generator. I would have tried to come up with a more scalable solution.

Instead, I deployed it.

The frontend is just a `index.html` file hosting on AWS Amplify. The backend is a Rust binary running on Lambda. It costs me __$0.00/month__ to run.

Is it perfect? No, in fact I am almost positive I have some spelling mistakes and bugs. Does it scale to millions of users? Probably not, (but I'm sure Rust helps with that). Does it make me laugh? Yes.

## Moral of the Story

As engineers we are trained to think about the edge cases, scalability, performance, architecture patterns, and "future-proofing".

(I'm looking at you Database Abstraction Layer. You know, __just__ in case I decide to migrate from PostgreSQL to MongoDB to Cassandra next Tuesday).

But for a side project, __future-proofing is just procrastination with addition steps__.

By choosing to build something "stupid", I was able to make that mental shift and removed the pressure to be "smart". I learned more about Rust, and managing my own deployment to AWS in a weekend then I would have if I spent the next few days/months watching more tutorials and researching to build a more "serious" project.

__Stop Over-thinking, Start Shipping, Have Fun__
