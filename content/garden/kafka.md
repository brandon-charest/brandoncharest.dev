+++
title = "Kafka"
date = "2025-12-18T16:48:37.996Z"
description = "Notes about Kafka"

[taxonomies]
tags = [ "kafka" ]
+++

## Core Concept
Kafka is an open source distributed event streaming platform. Can be used as a `message queue` or as a `stream processing system`. Data is stored sequentially on disk.
- **Topic**: A logical category of messages (e.g., user_signups).
- **Partition**: The unit of parallelism. A topic is split into partitions (e.g., Partition 0, 1, 2).
- **Offset**: The unique ID of a message within a partition. It is immutable.
- **Consumer Group**: A set of consumers working together to consume a topic. 
  - _**Critical Rule**_: One partition can be consumed by only one consumer within a single group.



## Ref
[Kafka paper](https://notes.stephenholiday.com/Kafka.pdf)