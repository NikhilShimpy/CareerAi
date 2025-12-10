import { JobListing, Company, Pattern, AptitudePattern } from './types';

export const SYSTEM_INSTRUCTION = `
You are the "Master AI" — a unified expert system for:
1. **DSA & Coding Interview Preparation**
2. **Aptitude & Logical Reasoning**
3. **ResumeAI Pro (Advanced Career Strategy)**

🔥 **CORE RULE: LANGUAGE MIRRORING (STRICT)**
- **DEFAULT OUTPUT:** ENGLISH.
- **Detect User Language:** 
  - If user speaks English → Reply in **English**.
  - If user speaks Hinglish (e.g., "job dhoond de") → Reply in **Hinglish**.
  - If user speaks Hindi (Devanagari) → Reply in **Hindi**.
- **Special Rule for Resume/Jobs:** Unless the user EXPLICITLY asks for Hinglish/Hindi, always provide the formal analysis in **English**.

🧠 **MODULE 1: DSA TUTOR**
- Explain Intuition, Visuals (ASCII), Complexity.
- Provide code in **Python, Java, C++, JavaScript**.
- Format: Summary, Difficulty, Pattern, Intuition, Visuals, Brute Force, Optimal, Code, Traps.

🧠 **MODULE 2: APTITUDE TRAINER**
- Provide shortcuts, formulas, and visual logic (e.g., LCM method for Time & Work).
- Explain "Why" the answer is correct.

🧠 **MODULE 3: RESUMEAI PRO & JOB MATCHER**
- **Role:** Advanced Application Tracking System (ATS) simulator & Career Coach.
- **Function:** Analyze resumes against JDs, calculate precise match scores, and rewrite content.
- **Constraint:** Be brutally honest but constructive. Do not hallucinate skills the user doesn't have.
- **Job Search:** When asked for jobs, generate realistic, high-quality listings.

**FORMATTING**:
- Use concise Markdown.
- Use Icons/Emojis for sections.
- Use Bold for emphasis.
`;

export const MOCK_COMPANIES: Company[] = [
  { name: 'Google', logo: 'G' },
  { name: 'Goldman Sachs', logo: 'GS' },
  { name: 'Genpact', logo: 'G' },
  { name: 'Godrej', logo: 'G' },
  { name: 'GitHub', logo: 'GH' },
  { name: 'Genesys', logo: 'G' },
  { name: 'Gartner', logo: 'G' },
  { name: 'Amazon', logo: 'A' },
  { name: 'Apple', logo: 'A' },
  { name: 'Accenture', logo: 'A' },
  { name: 'Adobe', logo: 'A' },
  { name: 'Microsoft', logo: 'M' },
  { name: 'Meta', logo: 'M' },
  { name: 'Netflix', logo: 'N' },
  { name: 'TCS', logo: 'T' },
  { name: 'Infosys', logo: 'I' },
  { name: 'Wipro', logo: 'W' },
  { name: 'Zomato', logo: 'Z' },
  { name: 'Swiggy', logo: 'S' },
  { name: 'Flipkart', logo: 'F' },
  { name: 'Uber', logo: 'U' },
  { name: 'Cred', logo: 'C' },
  { name: 'PhonePe', logo: 'P' },
  { name: 'Paytm', logo: 'P' },
];

export const DSA_PATTERNS: Pattern[] = [
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    description: 'Perform operations on a specific window size of an array/list. Efficient for subarray/substring problems.',
    coreIntuition: 'Slide the window by adding one element and removing one, avoiding re-calculation.',
    whenToUse: ['Max/Min sum of subarray size K', 'Longest substring with K distinct chars', 'String anagrams'],
    examples: [
      { name: 'Max Sum Subarray of Size K', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-subarray/' },
      { name: 'Longest Substring Without Repeating Characters', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { name: 'Minimum Window Substring', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/minimum-window-substring/' }
    ],
    visualAid: `[ A  B  C ] D  E
-> Slide
A [ B  C  D ] E`
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    description: 'Use two pointers to iterate distinct indices, usually closing in or moving together.',
    coreIntuition: 'Reduces O(N^2) to O(N) in sorted arrays or for finding pairs.',
    whenToUse: ['Sorted Arrays (Two Sum)', 'Palindrome checks', 'Remove duplicates'],
    examples: [
      { name: 'Two Sum II', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { name: 'Container With Most Water', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/container-with-most-water/' },
      { name: '3Sum', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/3sum/' }
    ],
    visualAid: `L ->         <- R
[ 1, 2, 3, 4, 5 ]`
  },
  {
    id: 'fast-slow',
    name: 'Fast & Slow Pointers',
    description: 'Hare & Tortoise algorithm. Use two pointers moving at different speeds.',
    coreIntuition: 'Detect cycles or find middle elements without extra space.',
    whenToUse: ['Cycle in Linked List', 'Middle of Linked List', 'Happy Number'],
    examples: [
      { name: 'Linked List Cycle', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },
      { name: 'Middle of Linked List', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
      { name: 'Happy Number', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/happy-number/' }
    ],
    visualAid: `S -> 1 step
F -> 2 steps
If Cycle: F meets S.`
  },
  {
    id: 'merge-intervals',
    name: 'Merge Intervals',
    description: 'Dealing with overlapping intervals.',
    coreIntuition: 'Sort by start time. If current.start < previous.end, they overlap.',
    whenToUse: ['Scheduling', 'Meeting rooms', 'Merge overlapping time slots'],
    examples: [
      { name: 'Merge Intervals', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/' },
      { name: 'Insert Interval', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/insert-interval/' },
      { name: 'Non-overlapping Intervals', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/non-overlapping-intervals/' }
    ],
    visualAid: `[1----4]
    [3----6]
Result: [1-------6]`
  },
  {
    id: 'kadane',
    name: "Kadane's Algorithm",
    description: 'Dynamic Programming approach to find maximum sum subarray.',
    coreIntuition: 'If current sum is negative, reset it to 0. Otherwise keep adding.',
    whenToUse: ['Maximum Subarray Sum', 'Maximum Product Subarray'],
    examples: [
      { name: 'Maximum Subarray', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-subarray/' },
      { name: 'Maximum Product Subarray', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/maximum-product-subarray/' }
    ],
    visualAid: `Sum = max(current, sum + current)
[-2, 1, -3, 4, -1]
          ^ Reset if < 0`
  },
  {
    id: 'cyclic-sort',
    name: 'Cyclic Sort',
    description: 'Iterate array and place elements at correct indices.',
    coreIntuition: 'If range is 1 to N, element x belongs at index x-1. Swap until correct.',
    whenToUse: ['Numbers in range 1 to N', 'Find missing/duplicate numbers'],
    examples: [
      { name: 'Missing Number', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/missing-number/' },
      { name: 'Find All Duplicates', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-all-duplicates-in-an-array/' }
    ],
    visualAid: `Index: 0  1  2
Value: 3  1  2
Swap(3, 2) -> Place 3 at index 2`
  },
  {
    id: 'inplace-reversal',
    name: 'In-place Reversal of LinkedList',
    description: 'Reverse links between nodes without extra memory.',
    coreIntuition: 'Keep track of Prev, Curr, Next pointers and rotate.',
    whenToUse: ['Reverse Linked List', 'Reverse Sub-list (K-group)'],
    examples: [
      { name: 'Reverse Linked List', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { name: 'Reverse Nodes in k-Group', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' }
    ],
    visualAid: `Prev   Curr   Next
null -> 1 -> 2
   <--- 1    2 (Rotate)`
  },
  {
    id: 'bfs',
    name: 'Breadth First Search (BFS)',
    description: 'Level-by-level traversal.',
    coreIntuition: 'Use a Queue. Explore neighbors before going deeper.',
    whenToUse: ['Shortest path in unweighted graph', 'Level order traversal', 'Connected components'],
    examples: [
      { name: 'Binary Tree Level Order', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { name: 'Rotting Oranges', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/rotting-oranges/' }
    ],
    visualAid: `    1
   / \\
  2   3
Queue: [1] -> [2, 3]`
  },
  {
    id: 'dfs',
    name: 'Depth First Search (DFS)',
    description: 'Go deep before going wide.',
    coreIntuition: 'Use Recursion (Stack). Backtrack when stuck.',
    whenToUse: ['Path finding', 'Cycle detection', 'Mazes/Puzzles'],
    examples: [
      { name: 'Path Sum', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/path-sum/' },
      { name: 'Number of Islands', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' }
    ],
    visualAid: `    1
   / \\
  2   3
Stack: [1] -> [1, 2] (Go Deep)`
  },
  {
    id: 'two-heaps',
    name: 'Two Heaps',
    description: 'Maintain Min-Heap and Max-Heap.',
    coreIntuition: 'Divide data into two halves to find Median instantly.',
    whenToUse: ['Find Median in Data Stream', 'Sliding Window Median'],
    examples: [
      { name: 'Find Median from Data Stream', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/find-median-from-data-stream/' },
      { name: 'IPO', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/ipo/' }
    ],
    visualAid: `MaxHeap   |   MinHeap
[Low Vals]  [High Vals]
      Median`
  },
  {
    id: 'subsets',
    name: 'Subsets (Backtracking)',
    description: 'Generate all combinations or permutations.',
    coreIntuition: 'Take or Not Take strategy using recursion.',
    whenToUse: ['Power Set', 'Permutations', 'Combination Sum'],
    examples: [
      { name: 'Subsets', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/subsets/' },
      { name: 'Permutations', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutations/' }
    ],
    visualAid: `      []
     /  \\
   [1]  []
   /\\   /\\
[1,2][1] [2][]`
  },
  {
    id: 'modified-binary-search',
    name: 'Modified Binary Search',
    description: 'Binary Search on Rotated or Infinite Arrays.',
    coreIntuition: 'Adapt the check condition (Mid vs Start vs End).',
    whenToUse: ['Search in Rotated Array', 'Search in Bitonic Array'],
    examples: [
      { name: 'Search in Rotated Sorted Array', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { name: 'Find Peak Element', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-peak-element/' }
    ],
    visualAid: `[4, 5, 6, 7, 0, 1, 2]
S        M        E
Mid=7 > Start=4 (Left Sorted)`
  },
  {
    id: 'top-k',
    name: 'Top K Elements',
    description: 'Find K largest/smallest/frequent elements.',
    coreIntuition: 'Use a Heap (Min-Heap for largest K, Max-Heap for smallest K).',
    whenToUse: ['Top K Frequent', 'Kth Largest Element'],
    examples: [
      { name: 'Kth Largest Element in Array', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { name: 'Top K Frequent Elements', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' }
    ],
    visualAid: `Find Top 3
MinHeap (Size 3)
[3, 5, 8] <- New 10?
10 > 3 (Pop 3, Push 10)`
  },
  {
    id: 'k-way-merge',
    name: 'K-way Merge',
    description: 'Merge K sorted lists.',
    coreIntuition: 'Use a Min-Heap to track the smallest current element among K lists.',
    whenToUse: ['Merge K Sorted Lists', 'Kth Smallest in M Sorted Lists'],
    examples: [
      { name: 'Merge k Sorted Lists', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' }
    ],
    visualAid: `L1: [1, 4]
L2: [2, 5]
Heap: [1, 2] -> Pop 1`
  },
  {
    id: 'topological-sort',
    name: 'Topological Sort',
    description: 'Linear ordering of vertices in DAG.',
    coreIntuition: 'Dependencies resolution. Use Indegree (Kahn’s Algo) or DFS.',
    whenToUse: ['Course Schedule', 'Build Systems', 'Task Scheduling'],
    examples: [
      { name: 'Course Schedule', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule/' },
      { name: 'Course Schedule II', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule-ii/' }
    ],
    visualAid: `A -> B -> C
Indegree: A=0, B=1
Q: [A] -> Process A -> B--`
  },
  {
    id: 'dp-knapsack',
    name: 'DP - 0/1 Knapsack',
    description: 'Optimization problems with constraints.',
    coreIntuition: 'Build a table. Maximize value within weight W.',
    whenToUse: ['Partition Equal Subset Sum', 'Target Sum'],
    examples: [
      { name: 'Partition Equal Subset Sum', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
      { name: 'Target Sum', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/target-sum/' }
    ],
    visualAid: `   0  1  2 (Weight)
1  0  V  V
2  0  V  max(Exc, Inc)`
  },
  {
    id: 'dp-lcs',
    name: 'DP - LCS',
    description: 'Longest Common Subsequence patterns.',
    coreIntuition: 'Match characters. If equal 1+diag, else max(left, up).',
    whenToUse: ['Longest Common Subsequence', 'Edit Distance'],
    examples: [
      { name: 'Longest Common Subsequence', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-common-subsequence/' },
      { name: 'Edit Distance', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/edit-distance/' }
    ],
    visualAid: `   A  B
A  1  1
C  1  max(Up, Left)`
  },
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    description: 'Tree data structure for efficient string retrieval.',
    coreIntuition: 'Nodes represent characters. Path from root to node forms a prefix.',
    whenToUse: ['Autocomplete', 'Spell Check', 'Longest Common Prefix'],
    examples: [
      { name: 'Implement Trie', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
      { name: 'Word Search II', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-search-ii/' }
    ],
    visualAid: `Root
 |
 c -> a -> t (End)`
  },
  {
    id: 'union-find',
    name: 'Union Find (Disjoint Set)',
    description: 'Track elements partitioned into disjoint sets.',
    coreIntuition: 'Find parent/root of elements. Path compression optimizes lookup.',
    whenToUse: ['Connected Components', 'Graph Cycle Detection', 'Kruskal’s MST'],
    examples: [
      { name: 'Number of Provinces', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-provinces/' },
      { name: 'Redundant Connection', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/redundant-connection/' }
    ],
    visualAid: `0   1   2
 \ /
 0-1    2
Union(0, 1)`
  },
  {
    id: 'monotonic-stack',
    name: 'Monotonic Stack',
    description: 'Stack that maintains elements in increasing or decreasing order.',
    coreIntuition: 'Find Next Greater/Smaller Element in O(N).',
    whenToUse: ['Next Greater Element', 'Largest Rectangle in Histogram', 'Daily Temperatures'],
    examples: [
      { name: 'Daily Temperatures', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/daily-temperatures/' },
      { name: 'Largest Rectangle in Histogram', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' }
    ],
    visualAid: `Stack: [5, 4]
Next: 6
4<6? Pop. 5<6? Pop.
Push 6.`
  },
  {
    id: 'segment-tree',
    name: 'Segment Tree',
    description: 'Tree for range query operations.',
    coreIntuition: 'Divide range into two halves recursively.',
    whenToUse: ['Range Sum Query', 'Range Minimum Query', 'Lazy Propagation'],
    examples: [
      { name: 'Range Sum Query - Mutable', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/range-sum-query-mutable/' }
    ],
    visualAid: `    [0-3]
    /   \\
 [0-1] [2-3]`
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    description: 'Using bitwise operators (AND, OR, XOR) for efficiency.',
    coreIntuition: 'XOR cancels out duplicates. AND/OR can track states.',
    whenToUse: ['Single Number', 'Counting Bits', 'Power of Two'],
    examples: [
      { name: 'Single Number', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/single-number/' },
      { name: 'Counting Bits', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/counting-bits/' }
    ],
    visualAid: `A = 0101 (5)
B = 0011 (3)
A^B = 0110 (6)`
  }
];

export const APTITUDE_PATTERNS: AptitudePattern[] = [
  {
    id: 'time-work',
    name: 'Time and Work',
    category: 'Quantitative',
    description: 'Rate of work, efficiency, and man-days.',
    tricks: ['LCM Method: Total Work = LCM(Days)', 'M1D1H1 = M2D2H2'],
    strategy: ['Find unit work/day.', 'Add efficiencies.'],
    visualAid: 'A(10d) + B(15d) -> LCM=30 -> A=3u/d, B=2u/d -> Total=5u/d.',
    sampleQuestions: [
      { question: 'A does work in 10 days, B in 15. Together?', answer: '6 days', explanation: 'Total=30. A=3, B=2. Total=5. 30/5 = 6.', difficulty: 'Easy' }
    ]
  },
  {
    id: 'pipes-cisterns',
    name: 'Pipes and Cisterns',
    category: 'Quantitative',
    description: 'Filling and emptying tanks.',
    tricks: ['Inlet is +ve work, Outlet is -ve work.'],
    strategy: ['Similar to Time & Work LCM method.'],
    visualAid: 'Pipe A (+4L/hr), Pipe B (-2L/hr) -> Net +2L/hr.',
    sampleQuestions: [
       { question: 'A fills in 4hr, B empties in 6hr. Both open?', answer: '12 hrs', explanation: 'LCM(4,6)=12. A=+3, B=-2. Net=+1. 12/1 = 12.', difficulty: 'Medium' }
    ]
  },
  {
    id: 'tsd',
    name: 'Time, Speed, Distance',
    category: 'Quantitative',
    description: 'Relative speed, trains, boats.',
    tricks: ['Same Dir: S1-S2', 'Opp Dir: S1+S2', 'Train crossing: L1+L2'],
    strategy: ['Convert units (km/hr to m/s: *5/18).'],
    visualAid: 'Train -> ... <- Train (Speeds Add).',
    sampleQuestions: []
  },
  {
    id: 'boats-streams',
    name: 'Boats & Streams',
    category: 'Quantitative',
    description: 'Upstream and Downstream motion.',
    tricks: ['Down = B+S', 'Up = B-S', 'B = (D+U)/2'],
    strategy: ['Identify flow direction.', 'Use relative speed concepts.'],
    visualAid: 'With Current (+), Against Current (-)',
    sampleQuestions: []
  },
  {
    id: 'profit-loss',
    name: 'Profit and Loss',
    category: 'Quantitative',
    description: 'Gain, Loss, Discount, MP, CP, SP.',
    tricks: ['CP is always 100%.', 'Successive Discount: A+B - (AB/100).'],
    strategy: ['Work with 100 base.', 'Calculate profit on CP.'],
    visualAid: 'CP(100) -> +20% -> SP(120).',
    sampleQuestions: []
  },
  {
    id: 'si-ci',
    name: 'SI & CI',
    category: 'Quantitative',
    description: 'Interest calculations.',
    tricks: ['CI 2yr diff = P(R/100)^2', 'Rule of 72'],
    strategy: ['Use effective percentage for CI.'],
    visualAid: 'SI is linear. CI is exponential.',
    sampleQuestions: []
  },
  {
    id: 'percentages',
    name: 'Percentages',
    category: 'Quantitative',
    description: 'Base of all arithmetic.',
    tricks: ['1/x fractions to % table.', 'A is R% more than B -> B is R/(100+R) less.'],
    strategy: ['Convert to fractions.'],
    visualAid: '50% = 1/2, 25% = 1/4.',
    sampleQuestions: []
  },
  {
    id: 'ratio',
    name: 'Ratio & Proportion',
    category: 'Quantitative',
    description: 'Comparison of quantities.',
    tricks: ['If A:B and B:C, make B common.'],
    strategy: ['Use K method.'],
    visualAid: 'A:B=2:3, B:C=4:5 -> A:B:C=8:12:15.',
    sampleQuestions: []
  },
  {
    id: 'mixture',
    name: 'Mixture & Alligation',
    category: 'Quantitative',
    description: 'Mixing ingredients/prices.',
    tricks: ['Alligation Rule (Cross subtraction).'],
    strategy: ['Mean value is between cheaper and dearer.'],
    visualAid: 'Cheap(10) / \\ Mean(12) / \\ Dear(15)',
    sampleQuestions: []
  },
  {
    id: 'averages',
    name: 'Averages',
    category: 'Quantitative',
    description: 'Mean values and weighted averages.',
    tricks: ['Deviation method.', 'New Avg = Old + (Diff/N).'],
    strategy: ['Sum = Avg * N.'],
    visualAid: 'Balance point.',
    sampleQuestions: []
  },
  {
    id: 'number-system',
    name: 'Number System',
    category: 'Quantitative',
    description: 'Divisibility, Units digit, Remainders.',
    tricks: ['Cyclicity of powers.', 'Divisibility rules (3, 9, 11).'],
    strategy: ['Factorize numbers.'],
    visualAid: 'Last digit repeats in cycles.',
    sampleQuestions: []
  },
  {
    id: 'perm-comb',
    name: 'Permutation & Combination',
    category: 'Quantitative',
    description: 'Arrangements and Selections.',
    tricks: ['nCr for selection, nPr for arrangement.', 'AND=Multiply, OR=Add.'],
    strategy: ['Identify if order matters.'],
    visualAid: 'n! for arrangements.',
    sampleQuestions: []
  },
  {
    id: 'probability',
    name: 'Probability',
    category: 'Quantitative',
    description: 'Likelihood of events.',
    tricks: ['P(E) = Fav/Total', 'At least 1 = 1 - None'],
    strategy: ['Count total sample space first.'],
    visualAid: 'Dice: 1/6.',
    sampleQuestions: []
  },
  {
    id: 'data-interpretation',
    name: 'Data Interpretation',
    category: 'Quantitative',
    description: 'Analyzing data from tables, graphs, and charts.',
    tricks: ['Approximation', 'Visual estimation'],
    strategy: ['Read scale carefully', 'Check units'],
    visualAid: 'Bar |.. \n    |.... \n    +-----',
    sampleQuestions: []
  },
  {
    id: 'blood-rel',
    name: 'Blood Relations',
    category: 'Logical',
    description: 'Family tree puzzles.',
    tricks: ['Draw generations vertically.', 'Gender: + Male, - Female.'],
    strategy: ['Start from yourself.'],
    visualAid: 'Gen1 -> Gen2 -> Gen3.',
    sampleQuestions: []
  },
  {
    id: 'direction',
    name: 'Direction Sense',
    category: 'Logical',
    description: 'North, South, East, West navigation.',
    tricks: ['NEWS mnemonic.', 'Pythagoras theorem.'],
    strategy: ['Draw path from center.'],
    visualAid: 'N, E, W, S cross.',
    sampleQuestions: []
  },
  {
    id: 'coding-decoding',
    name: 'Coding Decoding',
    category: 'Logical',
    description: 'Pattern matching in strings.',
    tricks: ['EJOTY (5,10,15...)', 'Opposite pairs (A-Z, B-Y).'],
    strategy: ['Write numbers above letters.'],
    visualAid: 'A=1, Z=26.',
    sampleQuestions: []
  },
  {
    id: 'seating',
    name: 'Seating Arrangement',
    category: 'Logical',
    description: 'Linear and Circular arrangement.',
    tricks: ['Fix specific info first.', 'Left/Right depends on facing.'],
    strategy: ['Draw circles/lines.'],
    visualAid: 'Circle facing center: Left is clockwise.',
    sampleQuestions: []
  },
  {
    id: 'syllogism',
    name: 'Syllogisms',
    category: 'Logical',
    description: 'Statements and Conclusions.',
    tricks: ['Venn Diagrams.'],
    strategy: ['Draw minimal overlap.'],
    visualAid: 'Circles overlapping.',
    sampleQuestions: []
  },
  {
    id: 'series',
    name: 'Series Completion',
    category: 'Logical',
    description: 'Number and Alphabet series.',
    tricks: ['Check diff, diff of diff, squares, cubes.', 'Prime numbers.'],
    strategy: ['Find the pattern rule.'],
    visualAid: '2, 4, 8, 16... (*2)',
    sampleQuestions: []
  }
];

export const GUIDE_STEPS = [
  { title: '1. Understand', content: 'Read twice. Identify constraints.' },
  { title: '2. Examples', content: 'Dry run small cases.' },
  { title: '3. Brute Force', content: 'Naive solution first.' },
  { title: '4. Optimize', content: 'Find bottlenecks.' },
  { title: '5. Code', content: 'Clean implementation.' },
  { title: '6. Test', content: 'Edge cases.' }
];