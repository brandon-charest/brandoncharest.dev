+++
title = "LC 210: Course Schedule II"
date = "2026-01-15"
description = "Finding a valid course ordering using topological sort with cycle detection"
transparent = false

[taxonomies]
tags = [ "leetcode", "graph", "medium" ]

[extra]
math = true
growth = "evergreen"
problem_link = "[https://leetcode.com/problems/](https://leetcode.com/problems/course-schedule-ii/description/)"
problem_number = "210"
+++

There are a total of numCourses courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course $b_i$ first if you want to take course $a_i$.

 For example, the pair [0, 1], indicates that to take course 0 you have to first take course 1.

Return the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.

## Intuition

This is a graph problem, essentially we need to detect if there is a cycle. We can achieve this with topological sort using [kahn's algorithm](https://www.geeksforgeeks.org/dsa/topological-sorting-indegree-based-solution/).

Having solved [LC-207: Course Schedule](@/garden/algorithms/leetcode/207-course-schedule.md), we can reuse the same solution. The only change we need to make is instead of taking a count of `courses_taken` we turn it into a list and add each course we take to it.

At the end we compare the number of items in `courses_taken` to `numCourses`. If they are equal, then we have successfully taken all the courses and we can return the array `courses_taken`. Otherwise, we return an empty array.

## Approach

```python
def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
    # Track how many prerequisites each course has (in-degree)
    in_degree = [0] * numCourses
    
    # Map each course to the list of courses that depend on it
    # course_map[A] = [B, C] means "after taking A, you can take B and C"
    course_map = defaultdict(list)

    # Build the graph
    for pre, course in prerequisites:
        in_degree[course] += 1           # This course has one more prerequisite
        course_map[pre].append(course)    # pre -> course
    
    # Counter for how many courses we can successfully take
    courses_taken = []
    
    # Start with courses that have no prerequisites (in-degree = 0)
    # These are our entry points - we can take them immediately
    current = deque()
    for i in range(len(in_degree)):
        if in_degree[i] == 0:
            current.append(i)
    
    # If no courses have 0 prerequisites, there's a cycle (every course depends on something)
    if not current:
        return []
    
    # Process courses using topological sort (Kahn's algorithm)
    while current:
        course = current.popleft()
        courses_taken.append(course)

        # For each course that depends on the one we just took
        for nxt in course_map[course]:
            in_degree[nxt] -= 1  # Remove this prerequisite requirement

            # If this course now has all prerequisites met, we can take it
            if in_degree[nxt] == 0:
                current.append(nxt)

    # If we took all courses, there's no cycle. Otherwise, there's a cycle.
    if len(courses_taken) == numCourses:
        return courses_taken
    else:
        return []
```

## Complexity

- **Time:** $O(V + E)$
- **Space:** $O(V + E)$
