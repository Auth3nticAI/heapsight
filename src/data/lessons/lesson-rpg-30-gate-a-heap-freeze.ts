import { Lesson } from "@/types/lesson";

export const lessonRPG30: Lesson = {
  id: "rpg-30-gate-a-heap-freeze",
  title: "GATE A: Heap Freeze",
  description: "Allocation counter stays flat during gameplay. No new, no delete in the game loop. Zero heap in tick.",
  order: 30,
  xpReward: 300,
  tier: "pro",
  concepts: ["heap freeze", "zero allocation game loop", "memory discipline gate", "production discipline"],
  part1: {
    title: "Concept: Heap Freeze Gate",
    type: "concept",
    instructions: `# GATE A: Heap Freeze

## Mental Model
After this lesson, no \`new\` or \`delete\` is allowed inside the game loop. All dynamic storage must be preallocated at startup. The allocation counter from L29 enforces this: if it increments during any tick, the gate fails. This is the first systems engineering gate — a non-negotiable production discipline checkpoint.

## What Breaks Without This
Without heap freeze, every tick might allocate. Allocations cause cache misses, memory fragmentation, and unpredictable latency spikes. In a real-time system (game, robot, trading engine), a single allocation in the hot path can cause a frame skip or missed deadline. Heap freeze eliminates this entire class of bugs.

## The Fix: Preallocate Everything
\`\`\`cpp
// STARTUP: allocate all containers
const int MAX_ENTITIES = 16;
int entity_x[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
int entity_count = 0;

const int MAX_ITEMS = 5;
int inventory[MAX_ITEMS];
int inv_count = 0;

const int MAX_COMMANDS = 8;
int cmd_type[MAX_COMMANDS];
int cmd_count = 0;

// GAME LOOP: zero allocation
for (int tick = 0; tick < num_ticks; tick++) {
    int before = alloc_count;
    // input → commands → resolve → cleanup → render
    int delta = alloc_count - before;
    if (delta > 0) cout << "GATE_FAIL|" << tick << endl;
}
\`\`\`

Every container is a fixed-size array on the stack. Entity management, inventory, commands, loot — all preallocated. The game loop only reads and writes existing memory.

## Key Concepts
- Heap freeze: no allocation inside the game loop
- All containers are fixed-size arrays
- Allocation counter enforces the rule at runtime
- Gate violation = architecture bug, not a code bug

## Performance Insight
A heap-frozen game loop has predictable performance. Every tick accesses the same memory regions. The CPU prefetcher learns the access pattern. No cache misses from fresh allocations. No GC pauses. No fragmentation. This is why AAA engines preallocate.

## Memory Insight
All game state: 16 entities * 2 arrays * 4 bytes + 5 items * 4 bytes + 8 commands * 4 bytes = 180 bytes. That's less than 3 cache lines. The entire game state fits in L1 cache. This is the reward of heap discipline.

## Your Task
Run a multi-tick game loop with entities, inventory, and commands — all using fixed-size arrays. Assert zero allocations per tick. Print GATE_A|PASS if all ticks are clean.

## Beginner Trap: Sneaky Allocations
std::string allocates. cout << to_string() allocates. std::vector allocates. Even temporary string concatenation allocates. Use only fixed-size arrays and integer arithmetic in the loop. If in doubt, check the allocation counter.

## Elite Insight: Memory Pools
What if you need dynamic-sized data? Use a memory pool: preallocate a large block at startup, then hand out chunks from it. The pool itself never calls new. This is how production engines handle dynamic content within a heap-frozen loop. You'll build one in L30's Phase 4.

## Systems Thinking Connection
Gate A is the dividing line between "learning C++" and "engineering systems." Everything before L30 builds toward this discipline. Everything after L30 must maintain it. The allocation counter is your proof.

## Skill Reinforcement
- From L06: Fixed-size entity arrays
- From L16: Fixed-size command queue
- From L26: Fixed-size inventory
- From L29: Allocation counter
- Gate: All systems combined, zero heap in loop

## Mastery Check
You know you've got it when:
- Multiple ticks run with zero allocations
- All game systems use fixed-size arrays
- GATE_A|PASS prints at the end
- Intentionally adding \`new\` in the loop triggers GATE_FAIL`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

static int alloc_count = 0;
void* operator new(size_t s) { alloc_count++; return malloc(s); }
void operator delete(void* p) noexcept { free(p); }

const int MAX_ENTITIES = 8;
const int MAX_ITEMS = 5;
const int MAX_CMDS = 4;

int main() {
    // Preallocate
    int ex[MAX_ENTITIES], ey[MAX_ENTITIES], ehp[MAX_ENTITIES];
    int entity_count = 0;
    int inv[MAX_ITEMS], inv_count = 0;
    int cmd[MAX_CMDS], cmd_count = 0;

    // Setup: spawn entities
    ex[entity_count]=1; ey[entity_count]=1; ehp[entity_count]=10;
    entity_count++;
    ex[entity_count]=3; ey[entity_count]=3; ehp[entity_count]=5;
    entity_count++;

    int startup_allocs = alloc_count;
    cout << "STARTUP_ALLOCS|" << startup_allocs << endl;

    // TODO: Run 5 ticks. Each tick:
    // 1. Snapshot alloc_count
    // 2. Do game work (move entities, process commands, etc)
    // 3. Check delta == 0
    // 4. Print TICK|n|ALLOCS|delta

    // TODO: Print GATE_A|PASS if all ticks had zero allocs
    // TODO: Print GATE_A|FAIL if any tick allocated

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

static int alloc_count = 0;
void* operator new(size_t s) { alloc_count++; return malloc(s); }
void operator delete(void* p) noexcept { free(p); }

const int MAX_ENTITIES = 8;
const int MAX_ITEMS = 5;
const int MAX_CMDS = 4;

int main() {
    int ex[MAX_ENTITIES], ey[MAX_ENTITIES], ehp[MAX_ENTITIES];
    int entity_count = 0;
    int inv[MAX_ITEMS], inv_count = 0;
    int cmd[MAX_CMDS], cmd_count = 0;

    ex[entity_count]=1; ey[entity_count]=1; ehp[entity_count]=10;
    entity_count++;
    ex[entity_count]=3; ey[entity_count]=3; ehp[entity_count]=5;
    entity_count++;

    int startup_allocs = alloc_count;
    cout << "STARTUP_ALLOCS|" << startup_allocs << endl;

    bool gate_pass = true;
    for (int tick = 0; tick < 5; tick++) {
        int before = alloc_count;

        // Game tick: stack-only operations
        cmd_count = 0;
        cmd[cmd_count++] = 1; // move command
        for (int c = 0; c < cmd_count; c++) {
            if (cmd[c] == 1 && entity_count > 0) {
                ex[0] += 1;
            }
        }
        // Combat pass
        for (int e = 1; e < entity_count; e++) {
            if (ex[0] == ex[e] && ey[0] == ey[e]) {
                ehp[e] -= 3;
            }
        }
        // Cleanup pass
        for (int e = entity_count - 1; e >= 1; e--) {
            if (ehp[e] <= 0) {
                ex[e] = ex[entity_count-1];
                ey[e] = ey[entity_count-1];
                ehp[e] = ehp[entity_count-1];
                entity_count--;
            }
        }

        int delta = alloc_count - before;
        cout << "TICK|" << tick << "|ALLOCS|" << delta << endl;
        if (delta > 0) gate_pass = false;
    }

    cout << "GATE_A|" << (gate_pass ? "PASS" : "FAIL") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Startup allocs reported", expectedOutput: "STARTUP_ALLOCS|", isPattern: true },
      { id: "t2", description: "Tick 0 zero allocs", expectedOutput: "TICK|0|ALLOCS|0", isPattern: false },
      { id: "t3", description: "All ticks clean", expectedOutput: "TICK|4|ALLOCS|0", isPattern: false },
      { id: "t4", description: "Gate passes", expectedOutput: "GATE_A|PASS", isPattern: false },
    ],
    hints: [
      "Use a bool gate_pass = true. If any tick has delta > 0, set it to false.",
      "All game operations must use only the preallocated arrays. No new, no string, no vector.",
      "Print GATE_A|PASS or GATE_A|FAIL at the end based on gate_pass.",
    ],
    estimatedMinutes: 15,
  },
  part2: {
    title: "Build: Full Pipeline Heap Freeze",
    type: "game_builder",
    instructions: `# Full Pipeline Heap Freeze

## Mental Model
The complete game pipeline — input, commands, combat, cleanup, inventory, loot, render — all running within a heap-frozen loop. Every system you've built in Phases 1-3 must work with zero allocations. This is the synthesis of everything.

## What Breaks Without This
If any single system sneaks in an allocation, the gate fails. A hidden std::string in the render pass. A vector in the loot system. A temporary allocation in command resolution. Every system must be audited.

## The Fix: Integrated Zero-Alloc Pipeline
\`\`\`cpp
// All containers preallocated
// Game loop:
for (int tick = 0; tick < ticks; tick++) {
    int before = alloc_count;
    // 1. Input → intent
    // 2. Intent → commands
    // 3. Resolve commands (move, attack)
    // 4. Combat pass
    // 5. Loot pass (deterministic)
    // 6. Cleanup pass
    // 7. Render
    int delta = alloc_count - before;
    if (delta > 0) gate_fail();
}
\`\`\`

## Key Concepts
- Every Phase 1-3 system in one loop
- Zero allocations across all systems
- Allocation counter as runtime assertion
- Gate pass = production quality game loop

## Performance Insight
With heap freeze, the entire game loop is predictable. No allocation jitter, no cache pollution from new objects, no garbage collection. Frame time is consistent tick to tick.

## Memory Insight
Total game state across all systems: under 500 bytes. All on the stack. This is the payoff of 30 lessons of memory discipline.

## Your Task
Build a complete game tick with entities, commands, combat, inventory, and seeded RNG loot. Run multiple ticks. All zero allocation. Print GATE_A|PASS.

## Beginner Trap: Testing Only Happy Path
Test with combat kills, loot drops, inventory adds, entity removal. Every code path must be allocation-free, not just the idle tick.

## Elite Insight: Profiler Validation
In production, you'd run a profiler (Valgrind, Tracy, Instruments) to verify zero allocations. The allocation counter is a simplified version of this. In L78, you'll learn actual profiling tools.

## Mastery Check
You know you've got it when:
- Full pipeline runs with multiple ticks
- Combat, loot, inventory all work
- Every tick reports ALLOCS|0
- GATE_A|PASS prints at the end`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;
static int alloc_count=0;
void* operator new(size_t s){alloc_count++;return malloc(s);}
void operator delete(void* p) noexcept{free(p);}

const int MAX_ENT=8,MAX_INV=5,MAX_CMD=4;
unsigned int rng_state=42;
unsigned int nextRandom(){rng_state^=rng_state<<13;rng_state^=rng_state>>17;rng_state^=rng_state<<5;return rng_state;}

int main(){
    int ex[MAX_ENT],ey[MAX_ENT],ehp[MAX_ENT];int ec=0;
    int inv[MAX_INV];int ic=0;
    int cmd_dx[MAX_CMD],cmd_dy[MAX_CMD];int cc=0;
    int loot[]={3,3,1,4};

    // Setup
    ex[ec]=1;ey[ec]=1;ehp[ec]=20;ec++; // player
    ex[ec]=3;ey[ec]=1;ehp[ec]=5;ec++;  // enemy

    int startup=alloc_count;
    cout<<"STARTUP|"<<startup<<endl;

    // TODO: Run 5 ticks with full pipeline
    // Input: move right each tick
    // Combat: if adjacent, deal 3 damage
    // Loot: on kill, roll from loot table, add to inv
    // Cleanup: remove dead entities
    // Assert zero allocs per tick
    // Print GATE_A|PASS or GATE_A|FAIL

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;
static int alloc_count=0;
void* operator new(size_t s){alloc_count++;return malloc(s);}
void operator delete(void* p) noexcept{free(p);}

const int MAX_ENT=8,MAX_INV=5,MAX_CMD=4;
unsigned int rng_state=42;
unsigned int nextRandom(){rng_state^=rng_state<<13;rng_state^=rng_state>>17;rng_state^=rng_state<<5;return rng_state;}

int main(){
    int ex[MAX_ENT],ey[MAX_ENT],ehp[MAX_ENT];int ec=0;
    int inv[MAX_INV];int ic=0;
    int loot[]={3,3,1,4};

    ex[ec]=1;ey[ec]=1;ehp[ec]=20;ec++;
    ex[ec]=3;ey[ec]=1;ehp[ec]=5;ec++;

    int startup=alloc_count;
    cout<<"STARTUP|"<<startup<<endl;

    bool gate=true;
    for(int tick=0;tick<5;tick++){
        int before=alloc_count;

        // Move player right
        ex[0]+=1;

        // Combat: check adjacency with enemies
        for(int e=1;e<ec;e++){
            int dx=ex[0]-ex[e]; if(dx<0)dx=-dx;
            int dy=ey[0]-ey[e]; if(dy<0)dy=-dy;
            if(dx+dy<=1) ehp[e]-=3;
        }

        // Loot on kill
        for(int e=ec-1;e>=1;e--){
            if(ehp[e]<=0){
                int drop=loot[nextRandom()%4];
                if(ic<MAX_INV) inv[ic++]=drop;
                ex[e]=ex[ec-1];ey[e]=ey[ec-1];ehp[e]=ehp[ec-1];
                ec--;
            }
        }

        int delta=alloc_count-before;
        cout<<"TICK|"<<tick<<"|ALLOCS|"<<delta<<endl;
        if(delta>0) gate=false;
    }

    cout<<"INV|"<<ic;
    for(int i=0;i<ic;i++) cout<<"|"<<inv[i];
    cout<<endl;
    cout<<"GATE_A|"<<(gate?"PASS":"FAIL")<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Startup reported", expectedOutput: "STARTUP|", isPattern: true },
      { id: "g2", description: "First tick clean", expectedOutput: "TICK|0|ALLOCS|0", isPattern: false },
      { id: "g3", description: "Inventory populated", expectedOutput: "INV|", isPattern: true },
      { id: "g4", description: "Gate passes", expectedOutput: "GATE_A|PASS", isPattern: false },
    ],
    hints: [
      "Move player each tick: ex[0] += 1. Check adjacency with enemies for combat.",
      "On enemy death, roll loot from table, add to inv array, swap-with-last remove entity.",
      "Every operation uses only fixed arrays and integer math. No new, no string, no vector.",
    ],
    estimatedMinutes: 20,
  },
};