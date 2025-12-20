+++
title = "LC 443: String Compression"
date = "2025-12-20T13:48:58.468Z"
description = "Solved using HashMap and Two Pointers."
transparent = false

[taxonomies]
tags = [ "leetcode", "two-pointers", "medium" ]

[extra]
problem_link = "[https://leetcode.com/problems/](https://leetcode.com/problems/string-compression/description/)"
problem_number = "443"
status="stable"
+++

The problem asks us to compress a list of characters **in-place** and return the new length. Since we need to modify the array while reading it, a **Two Pointer** approach is perfect. One pointer (`read_index`) reads through the original characters to find groups, and another pointer (`write_index`) keeps track of where we are writing the compressed result.

## Approach
1. Initalize two pointers:
   - `read_index`: used to iterate through the array and counting consecutive characters.
   - `write_index`: used to overwrite `chars` with our compressed results.
2. Iterate through the array `while read_index < len(chars)`.
3. Inside the loop, we identify the current character (`ch`) and count its consecutive occurrences using an inner `while` loop.
4. Once we have the count:
   - We write the character `ch` to the `write_index` position.
   - If the count is greater than 1, we convert the count to a string and write each digit to the `chars` array, incrementing `write_index` as we go.
5. Finally, we return `write_index`, which represents the new length of the compressed array.


### Example Trace: chars = ["a", "a", "b", "b", "c"]
1. Start Pointers **read_index** (`R`) and **write_index** (`W`) start at the beginning.
```bash
["a", "a", "b", "b", "c"]
  ^    ^
  W    R
```
1. Process Group `a`. We find two `a`s. We write `a` and `2`.
```bash
["a", "2", "b", "b", "c"]
            ^    ^
            W    R
```
1. Process Group `b` We find two `b`s. We write `b` and `2`.
```bash
["a", "2", "b", "2", "c"]
                      ^    ^
                      W    R
```
1. Process Group `c` We find one `c`. We write `c`. _(no number needed)_
```bash
["a", "2", "b", "2", "c"]
                           ^ (Done)
                           W
```

## Code
```python
def compress(self, chars: List[str]) -> int:
    if not chars:
        return 0
    write_index = 0
    read_index = 0
    N = len(chars)

    while read_index < N:
        current_char = chars[read_index]
        count = 0

        while read_index < N and chars[read_index] == current_char:
            count += 1
            read_index += 1

        chars[write_index] = current_char
        write_index += 1

        if count > 1:
            for digit in str(count):
                chars[write_index] = digit
                write_index += 1
    return write_index
```

## Complexity
- **Time complexity:** $O(N)$<br>
  We iterate through the `chars` array exactly once.

- **Space complexity:** $O(1)$<br>
  We perform the compression in-place.