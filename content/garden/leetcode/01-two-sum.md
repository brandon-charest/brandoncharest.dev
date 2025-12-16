+++
title = "LC: Two Sum"
date = "2025-12-16T20:49:19.749Z"
description = "Solved using HashMap and Two Pointers."
transparent = false
[taxonomies]
tags = [ "leetcode", "easy", "hashmap"]

[extra]
problem_link = "[https://leetcode.com/problems/](https://leetcode.com/problems/two-sum/description/)"
problem_number = "0001"
+++

# Two Sum
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

**Examples**
```text
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Because nums[0] + nums[1] == 9, we return [0, 1].


Input: nums = [3,2,4], target = 6
Output: [1,2]


Input: nums = [3,3], target = 6
Output: [0,1]
```

## The Process
Before coding, I like to whiteboard the approach. Since we are looking for two numbers `a + b = target`, we are essentially iterating through `a` and checking if `b` (which is `target - a`) exists in the array.

```text
nums = [2,7,11,15], target = 9
solution = [0,1] 

because nums[0] = 2, nums[1] = 7
2 + 7 == 9
```

### Brute Force Way:
The most intuitive approach is a nested loop. We take each number and add it to every other number to see if they match the target.

pseudo code:
``` python
def twoSum(nums, target):
    # Iterate through the first number
    for i in range(len(nums)):
        # Iterate through the second number (starting after i)
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
```
- Time Complexity: $O(n^2)$ - We loop through the array twice.
- Space Complexity: $O(1)$ - We don't store any extra data.



_Can we do better? Turns out we can bring the runtime down to O(n)._

### The Solution: One-Pass Hash Map

``` python
def twoSum(self, nums: List[int], target: int) -> List[int]:
    prev_map = {} # val -> index

    for idx, num in enumerate(nums):
        diff = target - num
        
        # Check if we have seen the difference before
        if diff in prev_map:
            return [prev_map[diff], idx]
        
        # If not, store the current number and index
        prev_map[num] = idx
    return []
```
Analysis
- Time Complexity: $O(n)$ We only iterate through the list once. Dictionary lookups are $O(1)$ on average.
- Space Complexity: $O(n)$ In the worst case, we might store every element in the dictionary before finding a match.