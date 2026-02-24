import type { Lesson } from "@/types/lesson";

export const lessonAISandbox14: Lesson = {
  id: "aisandbox-14-soa-formalized",
  title: "SoA Formalized",
  description: "All agent data in named parallel arrays with explicit capacity — the data layout is production-grade.",
  order: 14,
  xpReward: 100,
  tier: "pro",
  concepts: ["SoA formalization", "capacity tracking", "data layout", "cache efficiency", "memory organization"],
  part1: {
    title: "Concept: Formalizing the Data Layout",
    type: "concept",
    instructions: `
# SoA Formalized

## Mental Model
Your SimWorld struct works, but the arrays inside it grew organically. \`\`\`cx\`\`\`, \`\`\`cy\`\`\` were first. Then \`\`\`cvx\`\`\`, \`\`\`cvy\`\`\`. Then \`\`\`hunger\`\`\`, \`\`\`alive\`\`\`, \`\`\`wander_angle\`\`\`. Then \`\`\`species\`\`\`, \`\`\`agent_id\`\`\`. The order is archaeological — you can see when each feature was added. A formalized SoA layout groups arrays by purpose, adds clear section comments, and makes the struct self-documenting.

## What Breaks Without This
Without formal grouping, new developers (or future you) waste time figuring out which arrays belong together. Is \`\`\`wander_angle\`\`\` part of movement or behavior? Is \`\`\`alive\`\`\` part of lifecycle or state? Clear grouping eliminates guesswork. When you add a new system, you know exactly where to put the new array.

## The Fix: Grouped SoA with Section Comments
Reorganize SimWorld with explicit sections:

\`\`\`cpp
struct SimWorld {
    // Position
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    // Velocity
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    // Needs
    float hunger[MAX_CREATURES], fear[MAX_CREATURES];
    // Identity
    int species[MAX_CREATURES], agent_id[MAX_CREATURES];
    // Lifecycle
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
    // Population
    int creature_count = 0;
    int next_id = 0;
    // ... food arrays ...
};
\`\`\`

The grouping matches how systems access data. The movement system reads Position + Velocity. The behavior system reads Needs. The render system reads Position + Identity + Lifecycle. Each system reads contiguous sections.

## Key Concepts
- SoA: Structure of Arrays — each property in its own array
- Formal grouping: arrays organized by purpose (Position, Velocity, Needs, Identity, Lifecycle)
- Section comments: self-documenting struct layout
- Capacity = MAX_CREATURES (compile-time constant)
- 10 creature arrays in the current formalized layout

## Performance Insight
When arrays are grouped by access pattern, the CPU prefetcher can be more effective. If the movement system reads cx[], cy[], cvx[], cvy[] in sequence, and those arrays are declared sequentially in the struct, they are more likely to share cache lines. Formal grouping aligns data layout with access patterns.

## Memory Insight
10 arrays at MAX_CREATURES = 512: 4 floats (cx, cy, cvx, cvy) + 2 floats (hunger, fear) + 2 ints (species, agent_id) + 1 bool (alive) + 1 float (wander_angle) = 10 arrays. At 512 entries: roughly 20KB for creature data. Plus food arrays (~1.5KB). Total SimWorld: under 22KB. Production-grade memory layout in a single struct.

## Your Task
Create a formalized SimWorld struct with grouped sections. Print the layout summary showing array count and capacity.

Expected output:
\`\`\`
Population: 50
Layout: SoA
Arrays: 10
Capacity: 512
\`\`\`

## Beginner Trap
**Adding arrays without section comments.** Once SimWorld has 15+ arrays (and it will), finding the right place to add a new array becomes a guessing game. Section comments are not decoration — they are navigational infrastructure. Every array must belong to a named section.

## Elite Insight
The Bitsquid engine (now Stingray) used formalized SoA structs for its entity system. Each component type was a separate array. The struct declaration included capacity, count, and version metadata. Their GDC talk "A Data-Oriented Entity System" (2014) describes exactly this pattern: named sections, explicit capacity, zero heap allocation.

## Systems Thinking Connection
The RPG path formalizes entity arrays into a WorldState struct. The Platformer formalizes physics arrays into PhysWorld. The Shooter formalizes bullet and enemy arrays into GameState. Every path converges on the same architecture: a single struct with named sections of parallel arrays. The data layout IS the architecture.

## Skill Reinforcement
Lesson 13 added IDs. This lesson formalizes the layout. Lesson 15 formalizes the simulation pipeline. Together, L11—L15 transform messy prototype code into clean production architecture — the same code, the same behavior, but organized for scalability.

## Mastery Check
Question: Why declare capacity as a compile-time constant instead of a runtime variable?
Answer: Compile-time constants allow stack allocation with known size. The compiler can optimize array access with fixed offsets. Runtime capacity would require heap allocation (new/malloc), which adds allocation overhead, fragmentation risk, and cache unpredictability. MAX_CREATURES = 512 means the compiler knows the exact memory layout at compile time.
`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_CREATURES = 512;
const int MAX_FOOD = 64;

// TODO: Define struct SimWorld with grouped sections:
// Position: float cx[MAX_CREATURES], cy[MAX_CREATURES];
// Velocity: float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
// Needs: float hunger[MAX_CREATURES], fear[MAX_CREATURES];
// Identity: int species[MAX_CREATURES], agent_id[MAX_CREATURES];
// Lifecycle: bool alive[MAX_CREATURES]; float wander_angle[MAX_CREATURES];
// Population: int creature_count = 0; int next_id = 0;

int main() {
    // TODO: Create SimWorld sim;
    // Set sim.creature_count = 50;

    int array_count = 10;  // cx,cy,cvx,cvy,hunger,fear,species,agent_id,alive,wander_angle

    cout << "Population: 50" << endl;
    cout << "Layout: SoA" << endl;
    cout << "Arrays: " << array_count << endl;
    cout << "Capacity: " << MAX_CREATURES << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_CREATURES = 512;
const int MAX_FOOD = 64;

struct SimWorld {
    // Position
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    // Velocity
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    // Needs
    float hunger[MAX_CREATURES], fear[MAX_CREATURES];
    // Identity
    int species[MAX_CREATURES], agent_id[MAX_CREATURES];
    // Lifecycle
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
    // Population
    int creature_count = 0;
    int next_id = 0;
};

int main() {
    SimWorld sim;
    sim.creature_count = 50;

    int array_count = 10;

    cout << "Population: " << sim.creature_count << endl;
    cout << "Layout: SoA" << endl;
    cout << "Arrays: " << array_count << endl;
    cout << "Capacity: " << MAX_CREATURES << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "t2", description: "Layout is SoA", expectedOutput: "Layout: SoA" },
      { id: "t3", description: "10 arrays", expectedOutput: "Arrays: 10" },
      { id: "t4", description: "Capacity is 512", expectedOutput: "Capacity: 512" },
    ],
    hints: [
      "Define struct SimWorld { ... }; with all the arrays grouped by section. Add section comments for each group.",
      "Create SimWorld sim; in main and set sim.creature_count = 50. Print sim.creature_count instead of 50.",
      "Count the creature arrays: cx, cy, cvx, cvy, hunger, fear, species, agent_id, alive, wander_angle = 10 arrays.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Production-Grade Data Layout",
    type: "game_builder",
    instructions: `
# Build: Production-Grade Data Layout

## Mental Model
The SimWorld struct is now organized for production. Arrays grouped by purpose. Section comments guide navigation. A \`\`\`fear\`\`\` array is added to the Needs section (initialized to 0, future lessons will use it for predator proximity tracking). The layout is self-documenting — any developer can understand the data model by reading the struct definition.

## What Breaks Without This
Without formalized layout, adding the predator system in future lessons means inserting arrays in random positions. After 20 lessons of ad-hoc additions, the struct becomes unreadable. Formalizing now prevents architectural debt from accumulating.

## The Fix: Reorganized SimWorld
The full formalized struct:

\`\`\`cpp
struct SimWorld {
    // Position
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    // Velocity
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    // Needs
    float hunger[MAX_CREATURES], fear[MAX_CREATURES];
    // Identity
    int species[MAX_CREATURES], agent_id[MAX_CREATURES];
    // Lifecycle
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
    // Population
    int creature_count = 0;
    int next_id = 0;
    // Food
    float food_x[MAX_FOOD], food_y[MAX_FOOD];
    bool food_active[MAX_FOOD];
    int food_timer[MAX_FOOD];
    int food_count = 0;
    // RNG
    uint32_t rng_state = 42;
};
\`\`\`

## Key Concepts
- 10 creature arrays formalized into 5 groups
- fear[] added to Needs (initialized to 0.0f)
- Food arrays grouped under their own section
- RNG state in its own section
- Capacity = MAX_CREATURES = 512

## Performance Insight
Grouping by access pattern means the movement system reads Position + Velocity (4 arrays, contiguous in memory). The behavior system reads Needs (2 arrays, contiguous). Each pass gets maximum cache benefit because related data is physically adjacent in the struct.

## Memory Insight
Adding fear[512] adds 2KB. Total SimWorld is now ~22KB. Still comfortably under the 32KB L1 data cache of most modern CPUs. The formalization adds one array but changes no access patterns — same simulation, cleaner layout.

## Your Task
Reorganize SimWorld with section comments and add the fear[] array. Print layout verification.

Expected output:
\`\`\`
Population: 50
Layout: SoA
Arrays: 10
Capacity: 512
\`\`\`

Click **Run** — the ecosystem behaves identically. The struct is reorganized internally but produces the same simulation.

## Beginner Trap
**Reordering arrays without updating all init loops.** If you move \`\`\`fear\`\`\` into the struct, you must also initialize it in the spawn loop: \`\`\`sim.fear[i] = 0.0f;\`\`\`. Uninitialized fear values could contain garbage, causing erratic behavior when the fear system activates in a later lesson.

## Elite Insight
Mike Acton (Insomniac Games) in his CppCon 2014 talk "Data-Oriented Design and C++" showed that reorganizing struct layout to match access patterns improved cache performance by 3—10x on real game workloads. Your formalization is the same principle: align data layout with system access patterns.

## Mastery Check
Question: If you add a new creature property (e.g., \`\`\`float energy[MAX]\`\`\`), which section does it belong in?
Answer: Needs, alongside hunger and fear. Energy is a consumable resource that drives behavior — it belongs with other need-state arrays. The section comment guides placement. Without sections, you would guess.
`,
    starterCode: `#include <iostream>
#include <cmath>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 600;
const int MAX_CREATURES = 512;
const float FIXED_DT = 1.0f / 60.0f;
const float MAX_SPEED = 80.0f;
const float STEER_WEIGHT = 0.05f;
const int MAX_FOOD = 64;
const float FLOCK_RADIUS = 60.0f;
const float SEP_WEIGHT = 1.5f;
const float ALI_WEIGHT = 1.0f;
const float COH_WEIGHT = 1.0f;
const float WANDER_RADIUS = 30.0f;
const float WANDER_DISTANCE = 50.0f;
const float WANDER_JITTER = 0.3f;
const float HUNGER_RATE = 0.002f;
const float FEAR_RADIUS = 100.0f;

enum AgentType { PREY = 0, PREDATOR = 1 };

// TODO: Reorganize SimWorld with section comments
// Group arrays by purpose: Position, Velocity, Needs, Identity, Lifecycle, Population, Food, RNG
// Add float fear[MAX_CREATURES]; to the Needs section
struct SimWorld {
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    float hunger[MAX_CREATURES];
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
    int species[MAX_CREATURES];
    int agent_id[MAX_CREATURES];
    int next_id = 0;
    float food_x[MAX_FOOD], food_y[MAX_FOOD];
    bool food_active[MAX_FOOD];
    int food_timer[MAX_FOOD];
    int creature_count = 0;
    int food_count = 0;
    uint32_t rng_state = 42;
};
SimWorld sim;

uint32_t rngNext() {
    sim.rng_state = sim.rng_state * 48271u % 0x7fffffffu;
    return sim.rng_state;
}
float rngFloat() { return (float)rngNext() / 0x7fffffffu; }

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight AI Sandbox");
    SetTargetFPS(60);

    for (int i = 0; i < 50; i++) {
        sim.cx[i] = rngFloat() * SCREEN_W;
        sim.cy[i] = rngFloat() * SCREEN_H;
        sim.cvx[i] = (rngFloat() - 0.5f) * 100.0f;
        sim.cvy[i] = (rngFloat() - 0.5f) * 100.0f;
        sim.species[i] = PREY;
        sim.agent_id[i] = sim.next_id++;
        // TODO: Add sim.fear[i] = 0.0f;
    }
    sim.creature_count = 50;

    for (int i = 0; i < 20; i++) {
        sim.food_x[i] = rngFloat() * SCREEN_W;
        sim.food_y[i] = rngFloat() * SCREEN_H;
        sim.food_active[i] = true;
        sim.food_timer[i] = 0;
    }
    sim.food_count = 20;

    for (int i = 0; i < sim.creature_count; i++) {
        sim.wander_angle[i] = rngFloat() * 6.28f;
        sim.hunger[i] = 0.5f;
        sim.alive[i] = true;
    }

    cout << "Population: " << sim.creature_count << endl;
    cout << "Layout: SoA" << endl;
    cout << "Arrays: 10" << endl;
    cout << "Capacity: " << MAX_CREATURES << endl;

    while (!WindowShouldClose()) {
        for (int f = 0; f < sim.food_count; f++) {
            if (!sim.food_active[f]) {
                sim.food_timer[f]--;
                if (sim.food_timer[f] <= 0) {
                    sim.food_x[f] = rngFloat() * SCREEN_W;
                    sim.food_y[f] = rngFloat() * SCREEN_H;
                    sim.food_active[f] = true;
                }
            }
        }

        float mx = (float)GetMouseX();
        float my = (float)GetMouseY();

        for (int i = 0; i < sim.creature_count; i++) {
            if (!sim.alive[i]) continue;

            sim.hunger[i] += HUNGER_RATE;
            if (sim.hunger[i] >= 1.0f) {
                sim.hunger[i] = 1.0f;
                sim.alive[i] = false;
                continue;
            }

            float best_dist = 999999.0f;
            int best_food = -1;
            for (int f = 0; f < sim.food_count; f++) {
                if (!sim.food_active[f]) continue;
                float dx = sim.food_x[f] - sim.cx[i];
                float dy = sim.food_y[f] - sim.cy[i];
                float d = sqrtf(dx * dx + dy * dy);
                if (d < best_dist) { best_dist = d; best_food = f; }
            }

            if (best_food >= 0 && best_dist < 10.0f) {
                sim.hunger[i] = 0.0f;
                sim.food_active[best_food] = false;
                sim.food_timer[best_food] = 180;
            }

            float tdx = sim.cx[i] - mx;
            float tdy = sim.cy[i] - my;
            float threat_dist = sqrtf(tdx * tdx + tdy * tdy);

            if (threat_dist < FEAR_RADIUS && threat_dist > 0.01f) {
                float flee_vx = (tdx / threat_dist) * MAX_SPEED;
                float flee_vy = (tdy / threat_dist) * MAX_SPEED;
                sim.cvx[i] += (flee_vx - sim.cvx[i]) * 0.15f;
                sim.cvy[i] += (flee_vy - sim.cvy[i]) * 0.15f;
            } else if (best_food >= 0 && best_dist < FLOCK_RADIUS) {
                float dx = sim.food_x[best_food] - sim.cx[i];
                float dy = sim.food_y[best_food] - sim.cy[i];
                float desired_vx = (dx / best_dist) * MAX_SPEED;
                float desired_vy = (dy / best_dist) * MAX_SPEED;
                sim.cvx[i] += (desired_vx - sim.cvx[i]) * STEER_WEIGHT;
                sim.cvy[i] += (desired_vy - sim.cvy[i]) * STEER_WEIGHT;
            } else {
                sim.wander_angle[i] += (rngFloat() - 0.5f) * 2.0f * WANDER_JITTER;
                float speed = sqrtf(sim.cvx[i] * sim.cvx[i] + sim.cvy[i] * sim.cvy[i]);
                float hx = (speed > 0.01f) ? sim.cvx[i] / speed : 1.0f;
                float hy = (speed > 0.01f) ? sim.cvy[i] / speed : 0.0f;
                float wcx = sim.cx[i] + hx * WANDER_DISTANCE;
                float wcy = sim.cy[i] + hy * WANDER_DISTANCE;
                float tx = wcx + cosf(sim.wander_angle[i]) * WANDER_RADIUS;
                float ty = wcy + sinf(sim.wander_angle[i]) * WANDER_RADIUS;
                float dx = tx - sim.cx[i];
                float dy = ty - sim.cy[i];
                float d = sqrtf(dx * dx + dy * dy);
                if (d > 0.01f) {
                    sim.cvx[i] += ((dx / d) * MAX_SPEED - sim.cvx[i]) * STEER_WEIGHT;
                    sim.cvy[i] += ((dy / d) * MAX_SPEED - sim.cvy[i]) * STEER_WEIGHT;
                }
            }

            float sep_x = 0, sep_y = 0;
            float ali_vx = 0, ali_vy = 0;
            float coh_cx = 0, coh_cy = 0;
            int n_count = 0;
            for (int j = 0; j < sim.creature_count; j++) {
                if (j == i) continue;
                if (!sim.alive[j]) continue;
                float dx = sim.cx[i] - sim.cx[j];
                float dy = sim.cy[i] - sim.cy[j];
                float d = sqrtf(dx * dx + dy * dy);
                if (d < FLOCK_RADIUS) {
                    if (d < 25.0f && d > 0.01f) {
                        sep_x += dx / d;
                        sep_y += dy / d;
                    }
                    ali_vx += sim.cvx[j];
                    ali_vy += sim.cvy[j];
                    coh_cx += sim.cx[j];
                    coh_cy += sim.cy[j];
                    n_count++;
                }
            }
            if (n_count > 0) {
                ali_vx = ali_vx / n_count - sim.cvx[i];
                ali_vy = ali_vy / n_count - sim.cvy[i];
                coh_cx = coh_cx / n_count - sim.cx[i];
                coh_cy = coh_cy / n_count - sim.cy[i];
            }
            sim.cvx[i] += (sep_x * SEP_WEIGHT + ali_vx * ALI_WEIGHT + coh_cx * COH_WEIGHT) * STEER_WEIGHT;
            sim.cvy[i] += (sep_y * SEP_WEIGHT + ali_vy * ALI_WEIGHT + coh_cy * COH_WEIGHT) * STEER_WEIGHT;

            sim.cx[i] += sim.cvx[i] * FIXED_DT;
            sim.cy[i] += sim.cvy[i] * FIXED_DT;
            if (sim.cx[i] < 0) sim.cx[i] += SCREEN_W;
            if (sim.cx[i] >= SCREEN_W) sim.cx[i] -= SCREEN_W;
            if (sim.cy[i] < 0) sim.cy[i] += SCREEN_H;
            if (sim.cy[i] >= SCREEN_H) sim.cy[i] -= SCREEN_H;
        }

        int alive_count = 0;
        for (int i = 0; i < sim.creature_count; i++)
            if (sim.alive[i]) alive_count++;

        int active_food = 0;
        for (int f = 0; f < sim.food_count; f++)
            if (sim.food_active[f]) active_food++;

        BeginDrawing();
        ClearBackground({20, 25, 20, 255});

        for (int f = 0; f < sim.food_count; f++) {
            if (sim.food_active[f])
                DrawCircle((int)sim.food_x[f], (int)sim.food_y[f], 3, YELLOW);
        }

        for (int i = 0; i < sim.creature_count; i++) {
            if (!sim.alive[i]) continue;
            Color base = (sim.species[i] == PREY) ? GREEN : RED;
            float r = base.r + (255 - base.r) * sim.hunger[i];
            float g = base.g - base.g * sim.hunger[i] * 0.5f;
            Color c = { (unsigned char)r, (unsigned char)g, 0, 255 };
            DrawCircle((int)sim.cx[i], (int)sim.cy[i], 4, c);
            DrawLine((int)sim.cx[i], (int)sim.cy[i],
                     (int)(sim.cx[i] + sim.cvx[i] * 0.1f),
                     (int)(sim.cy[i] + sim.cvy[i] * 0.1f), DARKGREEN);
        }

        DrawCircleLines((int)mx, (int)my, FEAR_RADIUS, RED);

        char hud[128];
        snprintf(hud, 128, "SimWorld | Alive: %d | Food: %d", alive_count, active_food);
        DrawText(hud, 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 600;
const int MAX_CREATURES = 512;
const float FIXED_DT = 1.0f / 60.0f;
const float MAX_SPEED = 80.0f;
const float STEER_WEIGHT = 0.05f;
const int MAX_FOOD = 64;
const float FLOCK_RADIUS = 60.0f;
const float SEP_WEIGHT = 1.5f;
const float ALI_WEIGHT = 1.0f;
const float COH_WEIGHT = 1.0f;
const float WANDER_RADIUS = 30.0f;
const float WANDER_DISTANCE = 50.0f;
const float WANDER_JITTER = 0.3f;
const float HUNGER_RATE = 0.002f;
const float FEAR_RADIUS = 100.0f;

enum AgentType { PREY = 0, PREDATOR = 1 };

struct SimWorld {
    // Position
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    // Velocity
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    // Needs
    float hunger[MAX_CREATURES], fear[MAX_CREATURES];
    // Identity
    int species[MAX_CREATURES], agent_id[MAX_CREATURES];
    // Lifecycle
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
    // Population
    int creature_count = 0;
    int next_id = 0;
    // Food
    float food_x[MAX_FOOD], food_y[MAX_FOOD];
    bool food_active[MAX_FOOD];
    int food_timer[MAX_FOOD];
    int food_count = 0;
    // RNG
    uint32_t rng_state = 42;
};
SimWorld sim;

uint32_t rngNext() {
    sim.rng_state = sim.rng_state * 48271u % 0x7fffffffu;
    return sim.rng_state;
}
float rngFloat() { return (float)rngNext() / 0x7fffffffu; }

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight AI Sandbox");
    SetTargetFPS(60);

    for (int i = 0; i < 50; i++) {
        sim.cx[i] = rngFloat() * SCREEN_W;
        sim.cy[i] = rngFloat() * SCREEN_H;
        sim.cvx[i] = (rngFloat() - 0.5f) * 100.0f;
        sim.cvy[i] = (rngFloat() - 0.5f) * 100.0f;
        sim.species[i] = PREY;
        sim.agent_id[i] = sim.next_id++;
        sim.fear[i] = 0.0f;
    }
    sim.creature_count = 50;

    for (int i = 0; i < 20; i++) {
        sim.food_x[i] = rngFloat() * SCREEN_W;
        sim.food_y[i] = rngFloat() * SCREEN_H;
        sim.food_active[i] = true;
        sim.food_timer[i] = 0;
    }
    sim.food_count = 20;

    for (int i = 0; i < sim.creature_count; i++) {
        sim.wander_angle[i] = rngFloat() * 6.28f;
        sim.hunger[i] = 0.5f;
        sim.alive[i] = true;
    }

    cout << "Population: " << sim.creature_count << endl;
    cout << "Layout: SoA" << endl;
    cout << "Arrays: 10" << endl;
    cout << "Capacity: " << MAX_CREATURES << endl;

    while (!WindowShouldClose()) {
        for (int f = 0; f < sim.food_count; f++) {
            if (!sim.food_active[f]) {
                sim.food_timer[f]--;
                if (sim.food_timer[f] <= 0) {
                    sim.food_x[f] = rngFloat() * SCREEN_W;
                    sim.food_y[f] = rngFloat() * SCREEN_H;
                    sim.food_active[f] = true;
                }
            }
        }

        float mx = (float)GetMouseX();
        float my = (float)GetMouseY();

        for (int i = 0; i < sim.creature_count; i++) {
            if (!sim.alive[i]) continue;

            sim.hunger[i] += HUNGER_RATE;
            if (sim.hunger[i] >= 1.0f) {
                sim.hunger[i] = 1.0f;
                sim.alive[i] = false;
                continue;
            }

            float best_dist = 999999.0f;
            int best_food = -1;
            for (int f = 0; f < sim.food_count; f++) {
                if (!sim.food_active[f]) continue;
                float dx = sim.food_x[f] - sim.cx[i];
                float dy = sim.food_y[f] - sim.cy[i];
                float d = sqrtf(dx * dx + dy * dy);
                if (d < best_dist) { best_dist = d; best_food = f; }
            }

            if (best_food >= 0 && best_dist < 10.0f) {
                sim.hunger[i] = 0.0f;
                sim.food_active[best_food] = false;
                sim.food_timer[best_food] = 180;
            }

            float tdx = sim.cx[i] - mx;
            float tdy = sim.cy[i] - my;
            float threat_dist = sqrtf(tdx * tdx + tdy * tdy);

            if (threat_dist < FEAR_RADIUS && threat_dist > 0.01f) {
                float flee_vx = (tdx / threat_dist) * MAX_SPEED;
                float flee_vy = (tdy / threat_dist) * MAX_SPEED;
                sim.cvx[i] += (flee_vx - sim.cvx[i]) * 0.15f;
                sim.cvy[i] += (flee_vy - sim.cvy[i]) * 0.15f;
            } else if (best_food >= 0 && best_dist < FLOCK_RADIUS) {
                float dx = sim.food_x[best_food] - sim.cx[i];
                float dy = sim.food_y[best_food] - sim.cy[i];
                float desired_vx = (dx / best_dist) * MAX_SPEED;
                float desired_vy = (dy / best_dist) * MAX_SPEED;
                sim.cvx[i] += (desired_vx - sim.cvx[i]) * STEER_WEIGHT;
                sim.cvy[i] += (desired_vy - sim.cvy[i]) * STEER_WEIGHT;
            } else {
                sim.wander_angle[i] += (rngFloat() - 0.5f) * 2.0f * WANDER_JITTER;
                float speed = sqrtf(sim.cvx[i] * sim.cvx[i] + sim.cvy[i] * sim.cvy[i]);
                float hx = (speed > 0.01f) ? sim.cvx[i] / speed : 1.0f;
                float hy = (speed > 0.01f) ? sim.cvy[i] / speed : 0.0f;
                float wcx = sim.cx[i] + hx * WANDER_DISTANCE;
                float wcy = sim.cy[i] + hy * WANDER_DISTANCE;
                float tx = wcx + cosf(sim.wander_angle[i]) * WANDER_RADIUS;
                float ty = wcy + sinf(sim.wander_angle[i]) * WANDER_RADIUS;
                float dx = tx - sim.cx[i];
                float dy = ty - sim.cy[i];
                float d = sqrtf(dx * dx + dy * dy);
                if (d > 0.01f) {
                    sim.cvx[i] += ((dx / d) * MAX_SPEED - sim.cvx[i]) * STEER_WEIGHT;
                    sim.cvy[i] += ((dy / d) * MAX_SPEED - sim.cvy[i]) * STEER_WEIGHT;
                }
            }

            float sep_x = 0, sep_y = 0;
            float ali_vx = 0, ali_vy = 0;
            float coh_cx = 0, coh_cy = 0;
            int n_count = 0;
            for (int j = 0; j < sim.creature_count; j++) {
                if (j == i) continue;
                if (!sim.alive[j]) continue;
                float dx = sim.cx[i] - sim.cx[j];
                float dy = sim.cy[i] - sim.cy[j];
                float d = sqrtf(dx * dx + dy * dy);
                if (d < FLOCK_RADIUS) {
                    if (d < 25.0f && d > 0.01f) {
                        sep_x += dx / d;
                        sep_y += dy / d;
                    }
                    ali_vx += sim.cvx[j];
                    ali_vy += sim.cvy[j];
                    coh_cx += sim.cx[j];
                    coh_cy += sim.cy[j];
                    n_count++;
                }
            }
            if (n_count > 0) {
                ali_vx = ali_vx / n_count - sim.cvx[i];
                ali_vy = ali_vy / n_count - sim.cvy[i];
                coh_cx = coh_cx / n_count - sim.cx[i];
                coh_cy = coh_cy / n_count - sim.cy[i];
            }
            sim.cvx[i] += (sep_x * SEP_WEIGHT + ali_vx * ALI_WEIGHT + coh_cx * COH_WEIGHT) * STEER_WEIGHT;
            sim.cvy[i] += (sep_y * SEP_WEIGHT + ali_vy * ALI_WEIGHT + coh_cy * COH_WEIGHT) * STEER_WEIGHT;

            sim.cx[i] += sim.cvx[i] * FIXED_DT;
            sim.cy[i] += sim.cvy[i] * FIXED_DT;
            if (sim.cx[i] < 0) sim.cx[i] += SCREEN_W;
            if (sim.cx[i] >= SCREEN_W) sim.cx[i] -= SCREEN_W;
            if (sim.cy[i] < 0) sim.cy[i] += SCREEN_H;
            if (sim.cy[i] >= SCREEN_H) sim.cy[i] -= SCREEN_H;
        }

        int alive_count = 0;
        for (int i = 0; i < sim.creature_count; i++)
            if (sim.alive[i]) alive_count++;

        int active_food = 0;
        for (int f = 0; f < sim.food_count; f++)
            if (sim.food_active[f]) active_food++;

        BeginDrawing();
        ClearBackground({20, 25, 20, 255});

        for (int f = 0; f < sim.food_count; f++) {
            if (sim.food_active[f])
                DrawCircle((int)sim.food_x[f], (int)sim.food_y[f], 3, YELLOW);
        }

        for (int i = 0; i < sim.creature_count; i++) {
            if (!sim.alive[i]) continue;
            Color base = (sim.species[i] == PREY) ? GREEN : RED;
            float r = base.r + (255 - base.r) * sim.hunger[i];
            float g = base.g - base.g * sim.hunger[i] * 0.5f;
            Color c = { (unsigned char)r, (unsigned char)g, 0, 255 };
            DrawCircle((int)sim.cx[i], (int)sim.cy[i], 4, c);
            DrawLine((int)sim.cx[i], (int)sim.cy[i],
                     (int)(sim.cx[i] + sim.cvx[i] * 0.1f),
                     (int)(sim.cy[i] + sim.cvy[i] * 0.1f), DARKGREEN);
        }

        DrawCircleLines((int)mx, (int)my, FEAR_RADIUS, RED);

        char hud[128];
        snprintf(hud, 128, "SimWorld | Alive: %d | Food: %d", alive_count, active_food);
        DrawText(hud, 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Layout is SoA", expectedOutput: "Layout: SoA" },
      { id: "g3", description: "10 arrays", expectedOutput: "Arrays: 10" },
      { id: "g4", description: "Capacity is 512", expectedOutput: "Capacity: 512" },
    ],
    hints: [
      "Add section comments inside SimWorld: // Position, // Velocity, // Needs, // Identity, // Lifecycle, // Population, // Food, // RNG.",
      "Add float fear[MAX_CREATURES]; right after hunger[] in the Needs section. Initialize it in the spawn loop: sim.fear[i] = 0.0f;",
      "The struct reorganization does not change any behavior. Move arrays into their correct sections and add section comments. The simulation output stays the same.",
    ],
    estimatedMinutes: 15,
  },
};