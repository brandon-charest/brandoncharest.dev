+++
title = "LC 295: Find Median from Data Stream"
date = "2026-01-10"
description = "Solved using two heaps to maintain a running median."
transparent = false

[taxonomies]
tags = [ "leetcode", "heap", "hard" ]

[extra]
growth = "evergreen"
problem_link = "[https://leetcode.com/problems/](https://leetcode.com/problems/find-median-from-data-stream/description/)"
problem_number = "295"
+++

## The Idea

We need to find the median of a growing stream of numbers efficiently. Sorting every time would be $O(n \log n)$ per insert — way too slow.

The trick: split the numbers into two halves using two heaps.

- **Max-heap** (`lo`): stores the smaller half. The top is the largest of the small numbers.
- **Min-heap** (`hi`): stores the larger half. The top is the smallest of the large numbers.

If both heaps are the same size, the median is the average of both tops. If one heap has one extra element, that top is the median.

```
Stream: [2, 3, 1, 5, 4]

After 2:     lo=[2]        hi=[]         → median = 2
After 3:     lo=[2]        hi=[3]        → median = (2+3)/2 = 2.5
After 1:     lo=[1,2]      hi=[3]        → median = 2
After 5:     lo=[1,2]      hi=[3,5]      → median = (2+3)/2 = 2.5
After 4:     lo=[1,2,3]    hi=[4,5]      → median = 3
```

## Implementation

```python
import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []  # max-heap (negate values since Python only has min-heap)
        self.hi = []  # min-heap

    def addNum(self, num: int) -> None:
        # Always add to max-heap first
        heapq.heappush(self.lo, -num)

        # Ensure max of lo <= min of hi
        if self.lo and self.hi and (-self.lo[0] > self.hi[0]):
            val = -heapq.heappop(self.lo)
            heapq.heappush(self.hi, val)

        # Balance sizes: lo can have at most 1 more element than hi
        if len(self.lo) > len(self.hi) + 1:
            val = -heapq.heappop(self.lo)
            heapq.heappush(self.hi, val)
        elif len(self.hi) > len(self.lo):
            val = heapq.heappop(self.hi)
            heapq.heappush(self.lo, -val)

    def findMedian(self) -> float:
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2.0
```

## Complexity

- **addNum**: $O(\log n)$ — heap push/pop operations
- **findMedian**: $O(1)$ — just peek at the tops
- **Space**: $O(n)$ — storing all elements across both heaps

