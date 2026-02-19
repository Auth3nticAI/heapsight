import { Lesson } from "@/types/lesson";

export const lessonRPG29: Lesson = {
  id: "rpg-29-allocation-counter-v0",
  title: "Allocation Counter v0",
  description: "Track heap allocations per tick. If the counter rises during gameplay, something is allocating.",
  order: 29,
  xpReward: 100,
  tier: "pro",
  concepts: ["allocation tracking", "operator new override", "heap awareness", "memory discipline"],
  part1: {
    title: "Concept: Allocation Counting",
    type: "concept",
    instructions: `# Allocation Counter v0

## Mental Model
You can't fix what you can't measure. An allocation counter is a global integer that increments every time the program allocates heap memory. By printing this counter each tick, you can see exactly when and how many allocations happen. If the counter rises during the game loop, you have a leak in your discipline.

## What Breaks Without This
Without allocation tracking, heap usage is invisible. A single std::string concatenation allocates. A vector::push_back might reallocate. You won't know until you run out of memory or hit a stutter. The allocation counter makes the invisible visible.

## The Fix: Override operator new
\`\`\`cpp
static int alloc_count = 0;

void* operator new(size_t size) {
    alloc_count++;
    return malloc(size);
}

void operator delete(void* ptr) noexcept {
    free(ptr);
}
\`\`\`

Every \`new\` in the program now increments alloc_count. You can print it at the start and end of each tick to see if any allocations happened.

## Key Concepts
- Override global operator new to count allocations
- alloc_count is a simple integer counter
- Print counter per tick to detect runtime allocations
- Zero allocations in the game loop = heap freeze achieved

## Performance Insight
The counter adds one increment per allocation — negligible. The real performance benefit is what the counter reveals: eliminating allocations makes the game loop cache-friendly and stutter-free.

## Memory Insight
The counter itself is 4 bytes of static storage. The override doesn't change allocation behavior — it just counts. malloc still handles the actual memory management.

## Your Task
Override operator new with a counter. Demonstrate allocations from new/delete, then show a game loop tick with zero allocations.

## Beginner Trap: Forgetting noexcept on operator delete
The delete operator override must be noexcept. Without it, the compiler may generate different code paths. Always mark it noexcept.

## Elite Insight: Per-Tick vs Total Count
For debugging, track both total allocations and per-tick delta. Reset a per_tick_count at the start of each tick. If per_tick_count > 0, that tick allocated. Production engines assert(per_tick_alloc == 0) in release builds.

## Systems Thinking Connection
This counter is the enforcement mechanism for Gate A (L30). Without it, the heap freeze is an honor system. With it, violations are caught automatically.

## Skill Reinforcement
- From L26-28: Fixed-size containers that avoid heap
- New: Runtime allocation detection
- Preview: L30 uses this counter to enforce heap freeze

## Mastery Check
You know you've got it when:
- operator new override counts every allocation
- Game loop tick shows zero new allocations
- Intentional allocation (new int) increments the counter`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

static int alloc_count = 0;

// TODO: Override operator new(size_t size)
// Increment alloc_count, return malloc(size)

// TODO: Override operator delete(void* ptr) noexcept
// Call free(ptr)

int main() {
    cout << "BEFORE|" << alloc_count << endl;

    // This should trigger allocation
    int* p = new int(42);
    cout << "AFTER_NEW|" << alloc_count << endl;

    delete p;

    // Simulate a game tick with no allocations
    int before_tick = alloc_count;
    int x = 5, y = 10;
    int sum = x + y;
    int after_tick = alloc_count;
    cout << "TICK_ALLOCS|" << (after_tick - before_tick) << endl;
    cout << "TOTAL|" << alloc_count << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

static int alloc_count = 0;

void* operator new(size_t size) {
    alloc_count++;
    return malloc(size);
}

void operator delete(void* ptr) noexcept {
    free(ptr);
}

int main() {
    cout << "BEFORE|" << alloc_count << endl;

    int* p = new int(42);
    cout << "AFTER_NEW|" << alloc_count << endl;

    delete p;

    int before_tick = alloc_count;
    int x = 5, y = 10;
    int sum = x + y;
    int after_tick = alloc_count;
    cout << "TICK_ALLOCS|" << (after_tick - before_tick) << endl;
    cout << "TOTAL|" << alloc_count << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Starts at zero", expectedOutput: "BEFORE|0", isPattern: false },
      { id: "t2", description: "New detected", expectedOutput: "AFTER_NEW|1", isPattern: false },
      { id: "t3", description: "Tick zero allocs", expectedOutput: "TICK_ALLOCS|0", isPattern: false },
      { id: "t4", description: "Total count", expectedOutput: "TOTAL|1", isPattern: false },
    ],
    hints: [
      "void* operator new(size_t size) { alloc_count++; return malloc(size); }",
      "void operator delete(void* ptr) noexcept { free(ptr); }",
      "The game tick does only stack operations, so alloc_count stays unchanged.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Per-Tick Allocation Monitor",
    type: "game_builder",
    instructions: `# Per-Tick Allocation Monitor

## Mental Model
A game loop runs multiple ticks. Before each tick, snapshot the allocation count. After the tick, compare. If the delta is non-zero, that tick allocated. Print per-tick allocation reports. This is the monitoring system that feeds into Gate A.

## What Breaks Without This
Without per-tick monitoring, you know total allocations but not which tick caused them. A single tick that allocates is invisible in the total count. Per-tick delta isolates the offending tick.

## The Fix: Delta per Tick
\`\`\`cpp
for (int tick = 0; tick < num_ticks; tick++) {
    int before = alloc_count;
    // ... tick logic ...
    int delta = alloc_count - before;
    cout << "TICK|" << tick << "|ALLOCS|" << delta << endl;
}
\`\`\`

## Key Concepts
- Snapshot alloc_count before and after each tick
- Delta = after - before = allocations in that tick
- Zero delta = heap freeze maintained
- Non-zero delta = violation detected

## Performance Insight
Two integer reads and one subtraction per tick. The monitoring overhead is effectively zero.

## Memory Insight
Two local ints (before, delta) = 8 bytes per tick, on the stack. No heap overhead from monitoring.

## Your Task
Run a 3-tick game loop. Tick 0 and 2 do no allocations. Tick 1 intentionally creates a new int (simulating a bug). Print per-tick allocation reports.

## Beginner Trap: Not Deleting the Test Allocation
If you new an int in tick 1 for testing, delete it. Otherwise you have a memory leak. The counter catches allocations, not leaks.

## Elite Insight: Assert on Violation
In production, replace the print with assert(delta == 0). If any tick allocates, the program crashes with a clear message. This is how Gate A works: zero tolerance for heap in the game loop.

## Mastery Check
You know you've got it when:
- Per-tick reports show delta for each tick
- Clean ticks show ALLOCS|0
- The intentional allocation tick shows ALLOCS|1`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;
static int alloc_count=0;
void* operator new(size_t s){alloc_count++;return malloc(s);}
void operator delete(void* p) noexcept{free(p);}

int main(){
    // TODO: Run 3 ticks
    // Tick 0: stack-only work (x+y)
    // Tick 1: intentionally allocate (new int), then delete
    // Tick 2: stack-only work
    // Print TICK|n|ALLOCS|delta for each
    cout<<"TOTAL|"<<alloc_count<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;
static int alloc_count=0;
void* operator new(size_t s){alloc_count++;return malloc(s);}
void operator delete(void* p) noexcept{free(p);}

int main(){
    for(int tick=0;tick<3;tick++){
        int before=alloc_count;
        if(tick==0){ int x=5,y=10; int s=x+y; (void)s; }
        else if(tick==1){ int* p=new int(99); delete p; }
        else { int a=1,b=2; int c=a+b; (void)c; }
        int delta=alloc_count-before;
        cout<<"TICK|"<<tick<<"|ALLOCS|"<<delta<<endl;
    }
    cout<<"TOTAL|"<<alloc_count<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Tick 0 clean", expectedOutput: "TICK|0|ALLOCS|0", isPattern: false },
      { id: "g2", description: "Tick 1 allocates", expectedOutput: "TICK|1|ALLOCS|1", isPattern: false },
      { id: "g3", description: "Tick 2 clean", expectedOutput: "TICK|2|ALLOCS|0", isPattern: false },
      { id: "g4", description: "Total count", expectedOutput: "TOTAL|1", isPattern: false },
    ],
    hints: [
      "Snapshot before each tick: int before = alloc_count; After tick: int delta = alloc_count - before;",
      "In tick 1, create and delete an int: int* p = new int(99); delete p;",
      "Ticks 0 and 2 should only use stack variables, producing delta 0.",
    ],
    estimatedMinutes: 10,
  },
};