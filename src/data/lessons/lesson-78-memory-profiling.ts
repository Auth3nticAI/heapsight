import type { Lesson } from "@/types/lesson";

export const lesson78: Lesson = {
  id: "78-memory-profiling",
  title: "Memory Profiling",
  description: "Profile pool memory usage to find peak allocation and waste.",
  order: 78,
  xpReward: 200,
  tier: "pro",
  concepts: ["memory profiling", "pool analysis", "usage tracking", "peak detection"],
  part1: {
    title: "Concept: Memory Profiling",
    type: "concept",
    instructions: `# Memory Profiling — You Cannot Optimize What You Cannot Measure

Your pool has 30 slots. How many are used at peak? You do not know. How many allocations happen per frame? You do not know. How much of the pool is wasted on dead entities waiting for cleanup? You do not know. Without profiling, every pool size is a guess. Guesses cause either wasted memory or pool exhaustion. Profile first. Decide second.

## What Breaks Without This

Without profiling, you set pool size to "big enough" and hope. Then a boss fight spawns 25 entities and the pool overflows. Or you set it to 100 and waste 70 slots for the entire session. Profiling records usage over time so you can set the pool to exactly the right size — peak usage plus a small margin.

## The Fix

Sample the pool state every frame. Record: used slots, free slots, peak used, allocations this frame, frees this frame. Store samples in an array. After the session, analyze: which frame had peak usage? What was the average? How much margin exists between peak and pool size?

\\\`\\\`\\\`
struct PoolSample {
    int frame;
    int used;
    int free;
    int peak;
    int allocs;
    int frees;
};
\\\`\\\`\\\`

The profiler is a passive observer. It reads pool state but never modifies it. Zero overhead beyond the sampling itself. The analysis runs after the session, never during gameplay.

## Your Task

1. Define a PoolSample struct: frame, used, free, peak, allocs, frees
2. Simulate a pool of size 30 over 10 frames with varying entity counts
3. Frame 1: spawn 8 enemies (allocs=8, frees=0, used=8)
4. Frame 5: spawn 5, free 3 (allocs=5, frees=3, used=18 — cumulative)
5. Frame 7: spawn 6, free 2 (peak frame, used=22)
6. Frame 10: spawn 2, free 8 (used=6 — entities cleaned up)
7. Track peak across all frames
8. Print per frame: \\\`MEMORY|frame|<f>|used|<u>|free|<fr>|peak|<p>|allocs|<a>|frees|<d>\\\`
9. Print: \\\`MEMORY_PROFILE|peak_frame|7|peak_used|22|pool_size|30|peak_util|73%\\\`
10. Print: \\\`MEMORY_SUMMARY|total_allocs|35|total_frees|29|net|6|peak|22\\\`

Expected output:
\\\`\\\`\\\`
MEMORY|frame|1|used|8|free|22|peak|8|allocs|8|frees|0
MEMORY|frame|5|used|18|free|12|peak|18|allocs|5|frees|3
MEMORY|frame|7|used|22|free|8|peak|22|allocs|6|frees|2
MEMORY|frame|10|used|6|free|24|peak|22|allocs|2|frees|8
MEMORY_PROFILE|peak_frame|7|peak_used|22|pool_size|30|peak_util|73%
MEMORY_SUMMARY|total_allocs|35|total_frees|29|net|6|peak|22
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Confusing per-frame allocations with cumulative used count. Allocs and frees are per-frame deltas. Used is the running total: used = previousUsed + allocs - frees. Peak is the maximum used ever seen. These are four distinct values — do not conflate them.

## Elite Insight

Commercial engines have built-in memory profilers that record every allocation with call stack, size, and lifetime. They generate flame graphs showing where memory is consumed. Your per-frame sampling is the lightweight version — good enough to size pools and detect leaks. The pattern scales from your 30-slot pool to a gigabyte heap.

## Cross-Path Echo

Database connection pool monitoring is this exact pattern. Track active connections, idle connections, peak connections, connection churn. If peak approaches pool size, scale up. If average is far below pool size, scale down. Your memory profiler is a connection pool monitor for game entities.`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
const int MAX_SAMPLES = 20;

struct PoolSample {
    int frame;
    int used;
    int free;
    int peak;
    int allocs;
    int frees;
};

PoolSample samples[MAX_SAMPLES];
int sampleCount = 0;

int currentUsed = 0;
int peakUsed = 0;
int totalAllocs = 0;
int totalFrees = 0;
int peakFrame = 0;

// TODO: Write recordSample(frame, allocs, frees)
//   Update currentUsed += allocs - frees
//   Update peakUsed and peakFrame if new peak
//   Accumulate totalAllocs, totalFrees
//   Store sample in samples array

// TODO: Write printSample(index)
//   Print MEMORY|frame|...|used|...|free|...|peak|...|allocs|...|frees|...

// TODO: Write printProfile()
//   Print MEMORY_PROFILE with peak_frame, peak_used, pool_size, peak_util%

// TODO: Write printSummary()
//   Print MEMORY_SUMMARY with total_allocs, total_frees, net, peak

int main() {
    // TODO: Record samples for 10 frames:
    //   Frame 1: allocs=8, frees=0
    //   Frame 2: allocs=4, frees=1
    //   Frame 3: allocs=3, frees=2
    //   Frame 4: allocs=2, frees=3
    //   Frame 5: allocs=5, frees=3
    //   Frame 6: allocs=3, frees=1
    //   Frame 7: allocs=6, frees=2
    //   Frame 8: allocs=1, frees=4
    //   Frame 9: allocs=1, frees=5
    //   Frame 10: allocs=2, frees=8
    // TODO: Print samples for frames 1, 5, 7, 10
    // TODO: Print profile and summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
const int MAX_SAMPLES = 20;

struct PoolSample {
    int frame;
    int used;
    int free;
    int peak;
    int allocs;
    int frees;
};

PoolSample samples[MAX_SAMPLES];
int sampleCount = 0;

int currentUsed = 0;
int peakUsed = 0;
int totalAllocs = 0;
int totalFrees = 0;
int peakFrame = 0;

void recordSample(int frame, int allocs, int frees) {
    currentUsed += allocs - frees;
    totalAllocs += allocs;
    totalFrees += frees;
    if (currentUsed > peakUsed) {
        peakUsed = currentUsed;
        peakFrame = frame;
    }
    samples[sampleCount].frame = frame;
    samples[sampleCount].used = currentUsed;
    samples[sampleCount].free = POOL_SIZE - currentUsed;
    samples[sampleCount].peak = peakUsed;
    samples[sampleCount].allocs = allocs;
    samples[sampleCount].frees = frees;
    sampleCount++;
}

void printSample(int index) {
    PoolSample &s = samples[index];
    cout << "MEMORY|frame|" << s.frame << "|used|" << s.used
         << "|free|" << s.free << "|peak|" << s.peak
         << "|allocs|" << s.allocs << "|frees|" << s.frees << endl;
}

void printProfile() {
    int util = peakUsed * 100 / POOL_SIZE;
    cout << "MEMORY_PROFILE|peak_frame|" << peakFrame << "|peak_used|" << peakUsed
         << "|pool_size|" << POOL_SIZE << "|peak_util|" << util << "%" << endl;
}

void printSummary() {
    int net = totalAllocs - totalFrees;
    cout << "MEMORY_SUMMARY|total_allocs|" << totalAllocs << "|total_frees|"
         << totalFrees << "|net|" << net << "|peak|" << peakUsed << endl;
}

int main() {
    int frameAllocs[] = {8, 4, 3, 2, 5, 3, 6, 1, 1, 2};
    int frameFrees[]  = {0, 1, 2, 3, 3, 1, 2, 4, 5, 8};

    for (int i = 0; i < 10; i++) {
        recordSample(i + 1, frameAllocs[i], frameFrees[i]);
    }

    // Print selected frames: 1, 5, 7, 10
    printSample(0);   // frame 1
    printSample(4);   // frame 5
    printSample(6);   // frame 7
    printSample(9);   // frame 10

    printProfile();
    printSummary();

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 memory state", expectedOutput: "MEMORY\\|frame\\|1\\|used\\|8\\|free\\|22\\|peak\\|8\\|allocs\\|8\\|frees\\|0", isPattern: true },
      { id: "t2", description: "Frame 5 memory state", expectedOutput: "MEMORY\\|frame\\|5\\|used\\|18\\|free\\|12\\|peak\\|18\\|allocs\\|5\\|frees\\|3", isPattern: true },
      { id: "t3", description: "Frame 7 peak usage", expectedOutput: "MEMORY\\|frame\\|7\\|used\\|22\\|free\\|8\\|peak\\|22\\|allocs\\|6\\|frees\\|2", isPattern: true },
      { id: "t4", description: "Frame 10 cleanup", expectedOutput: "MEMORY\\|frame\\|10\\|used\\|6\\|free\\|24\\|peak\\|22\\|allocs\\|2\\|frees\\|8", isPattern: true },
      { id: "t5", description: "Profile peak detection", expectedOutput: "MEMORY_PROFILE\\|peak_frame\\|7\\|peak_used\\|22\\|pool_size\\|30\\|peak_util\\|73%", isPattern: true },
      { id: "t6", description: "Memory summary", expectedOutput: "MEMORY_SUMMARY\\|total_allocs\\|35\\|total_frees\\|29\\|net\\|6\\|peak\\|22", isPattern: true },
    ],
    hints: [
      "currentUsed tracks the running total. Each frame: currentUsed += allocs - frees. Frame 1: 0+8-0=8. Frame 2: 8+4-1=11. Frame 3: 11+3-2=12. Continue through frame 10.",
      "Peak updates whenever currentUsed exceeds the previous peak. Track peakFrame alongside peakUsed. After frame 7: used=22 which is the highest, so peakFrame=7.",
      "Total allocs = sum of all per-frame allocs = 8+4+3+2+5+3+6+1+1+2 = 35. Total frees = 0+1+2+3+3+1+2+4+5+8 = 29. Net = 35-29 = 6. Peak utilization = 22*100/30 = 73%.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Memory Profiling",
    type: "game_builder",
    instructions: `# Game Builder: Memory Profiling — Pool Usage Analysis

Your pool has 30 slots. During gameplay, entities constantly spawn and die. Without profiling, you have no idea whether the pool is right-sized, oversized, or about to overflow. The profiler samples pool state each frame and reports peak usage, allocation churn, and utilization. After the session, you know exactly whether to grow, shrink, or keep the pool as-is.

## What Breaks Without This

Without profiling, pool sizing is guesswork. Too small: entities fail to spawn during boss fights and the game breaks. Too large: memory is wasted on slots that never get used. The profiler gives you data instead of guesses. Peak utilization of 73% on a 30-slot pool means you have 8 slots of headroom — probably safe. Peak of 95% means you are one wave away from overflow.

## The Fix

Sample every frame. Record used count, free count, allocations, frees. Track peak across all frames. After the session, report peak frame, utilization percentage, and total allocation churn. Use this data to size the pool for the next build.

\\\`\\\`\\\`
// Each frame: sample(frame, allocs, frees)
// After session: report peak_frame, peak_util, total churn
\\\`\\\`\\\`

## Your Task

1. Define PoolSample struct: frame, used, free, peak, allocs, frees
2. Simulate 10 frames with varying allocation/free patterns
3. Track running used count, peak, total allocs and frees
4. Print: \\\`MEMORY|frame|1|used|8|free|22|peak|8|allocs|8|frees|0\\\`
5. Print: \\\`MEMORY|frame|5|used|18|free|12|peak|18|allocs|5|frees|3\\\`
6. Print: \\\`MEMORY|frame|7|used|22|free|8|peak|22|allocs|6|frees|2\\\`
7. Print: \\\`MEMORY|frame|10|used|6|free|24|peak|22|allocs|2|frees|8\\\`
8. Print: \\\`MEMORY_PROFILE|peak_frame|7|peak_used|22|pool_size|30|peak_util|73%\\\`
9. Print: \\\`MEMORY_SUMMARY|total_allocs|35|total_frees|29|net|6|peak|22\\\`

## Beginner Trap

**Common Mistake:** Resetting currentUsed each frame instead of accumulating. Used is a running total that persists across frames. Only allocs and frees are per-frame values. The running total is what tells you how much memory is consumed right now.

## Elite Insight

Production profilers like Valgrind and AddressSanitizer track every allocation with full call stacks. They detect leaks by finding allocations with no matching free. Your net count (totalAllocs - totalFrees) is the simplest leak detector: if net is positive at session end, something was not freed. If net is negative, you have a double-free bug.

## Cross-Path Echo

Cloud resource monitoring works identically. AWS tracks EC2 instance launches and terminations. Peak instances determine your bill. If you launch 22 instances during a traffic spike but usually run 6, you are paying for burst capacity. Your peak_util metric is the AWS cost optimization dashboard.`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
const int MAX_SAMPLES = 20;

struct PoolSample {
    int frame;
    int used;
    int free;
    int peak;
    int allocs;
    int frees;
};

PoolSample samples[MAX_SAMPLES];
int sampleCount = 0;

int currentUsed = 0;
int peakUsed = 0;
int totalAllocs = 0;
int totalFrees = 0;
int peakFrame = 0;

// TODO: Write recordSample(frame, allocs, frees)
//   Update currentUsed, peak, totals. Store in samples array.

// TODO: Write printSample(index)

// TODO: Write printProfile() — peak_frame, peak_used, pool_size, peak_util

// TODO: Write printSummary() — total_allocs, total_frees, net, peak

int main() {
    // TODO: Record 10 frames with alloc/free data:
    //   Frame 1: 8/0, Frame 2: 4/1, Frame 3: 3/2, Frame 4: 2/3
    //   Frame 5: 5/3, Frame 6: 3/1, Frame 7: 6/2, Frame 8: 1/4
    //   Frame 9: 1/5, Frame 10: 2/8
    // TODO: Print frames 1, 5, 7, 10
    // TODO: Print profile and summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
const int MAX_SAMPLES = 20;

struct PoolSample {
    int frame;
    int used;
    int free;
    int peak;
    int allocs;
    int frees;
};

PoolSample samples[MAX_SAMPLES];
int sampleCount = 0;

int currentUsed = 0;
int peakUsed = 0;
int totalAllocs = 0;
int totalFrees = 0;
int peakFrame = 0;

void recordSample(int frame, int allocs, int frees) {
    currentUsed += allocs - frees;
    totalAllocs += allocs;
    totalFrees += frees;
    if (currentUsed > peakUsed) {
        peakUsed = currentUsed;
        peakFrame = frame;
    }
    samples[sampleCount].frame = frame;
    samples[sampleCount].used = currentUsed;
    samples[sampleCount].free = POOL_SIZE - currentUsed;
    samples[sampleCount].peak = peakUsed;
    samples[sampleCount].allocs = allocs;
    samples[sampleCount].frees = frees;
    sampleCount++;
}

void printSample(int index) {
    PoolSample &s = samples[index];
    cout << "MEMORY|frame|" << s.frame << "|used|" << s.used
         << "|free|" << s.free << "|peak|" << s.peak
         << "|allocs|" << s.allocs << "|frees|" << s.frees << endl;
}

void printProfile() {
    int util = peakUsed * 100 / POOL_SIZE;
    cout << "MEMORY_PROFILE|peak_frame|" << peakFrame << "|peak_used|" << peakUsed
         << "|pool_size|" << POOL_SIZE << "|peak_util|" << util << "%" << endl;
}

void printSummary() {
    int net = totalAllocs - totalFrees;
    cout << "MEMORY_SUMMARY|total_allocs|" << totalAllocs << "|total_frees|"
         << totalFrees << "|net|" << net << "|peak|" << peakUsed << endl;
}

int main() {
    int frameAllocs[] = {8, 4, 3, 2, 5, 3, 6, 1, 1, 2};
    int frameFrees[]  = {0, 1, 2, 3, 3, 1, 2, 4, 5, 8};

    for (int i = 0; i < 10; i++) {
        recordSample(i + 1, frameAllocs[i], frameFrees[i]);
    }

    printSample(0);   // frame 1
    printSample(4);   // frame 5
    printSample(6);   // frame 7
    printSample(9);   // frame 10

    printProfile();
    printSummary();

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 memory state", expectedOutput: "MEMORY\\|frame\\|1\\|used\\|8\\|free\\|22\\|peak\\|8\\|allocs\\|8\\|frees\\|0", isPattern: true },
      { id: "t2", description: "Frame 5 memory state", expectedOutput: "MEMORY\\|frame\\|5\\|used\\|18\\|free\\|12\\|peak\\|18\\|allocs\\|5\\|frees\\|3", isPattern: true },
      { id: "t3", description: "Frame 7 peak usage", expectedOutput: "MEMORY\\|frame\\|7\\|used\\|22\\|free\\|8\\|peak\\|22\\|allocs\\|6\\|frees\\|2", isPattern: true },
      { id: "t4", description: "Frame 10 cleanup", expectedOutput: "MEMORY\\|frame\\|10\\|used\\|6\\|free\\|24\\|peak\\|22\\|allocs\\|2\\|frees\\|8", isPattern: true },
      { id: "t5", description: "Profile peak detection", expectedOutput: "MEMORY_PROFILE\\|peak_frame\\|7\\|peak_used\\|22\\|pool_size\\|30\\|peak_util\\|73%", isPattern: true },
      { id: "t6", description: "Memory summary", expectedOutput: "MEMORY_SUMMARY\\|total_allocs\\|35\\|total_frees\\|29\\|net\\|6\\|peak\\|22", isPattern: true },
    ],
    hints: [
      "currentUsed is a running total. Start at 0. Frame 1: 0+8-0=8. Frame 2: 8+4-1=11. Continue accumulating through all 10 frames.",
      "Peak updates only when currentUsed exceeds peakUsed. After frame 7, currentUsed reaches 22, which is the session maximum. peakFrame records which frame hit the peak.",
      "Sum all per-frame allocs: 8+4+3+2+5+3+6+1+1+2=35. Sum all frees: 0+1+2+3+3+1+2+4+5+8=29. Net=6. Util=22*100/30=73%.",
    ],
    estimatedMinutes: 10,
  },
};
