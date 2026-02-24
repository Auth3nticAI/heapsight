import type { Lesson } from "@/types/lesson";

export const lessonAISandbox1: Lesson = {
  id: "aisandbox-1-spawn-population",
  title: "Spawn Population",
  description: "Fifty green creatures appear on a dark world — autonomous agents from parallel arrays.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: ["SoA agent arrays", "velocity", "population spawning", "deterministic RNG", "autonomous agents"],
  part1: {
    title: "Concept: Populations, Not Players",
    type: "concept",
    instructions: `
# Spawn Population

## Mental Model
In the RPG, you controlled ONE player through a command pipeline. In this path, you control ZERO entities. You write rules. The creatures obey the rules. When 50 creatures all follow the same velocity rules, patterns emerge that you never explicitly programmed.

## What Breaks Without This
Without a population of agents, there is nothing to observe. No emergence. No patterns. No simulation. A single agent is just a game character. Fifty agents following simple rules is the beginning of an ecosystem.

## The Fix: Parallel Arrays for Agent State
Instead of one \`Agent\` struct per creature, store each property in its own array:

\`\`\`cpp
const int MAX_CREATURES = 512;
float cx[MAX_CREATURES], cy[MAX_CREATURES];       // position
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];     // velocity
int creature_count = 0;
\`\`\`

Creature 0 lives at \`cx[0], cy[0]\` with velocity \`cvx[0], cvy[0]\`. Same index = same creature. This is Structure of Arrays (SoA) — the same pattern used in every data-oriented game engine.

A deterministic RNG seeds the initial positions. Same seed = same starting population = reproducible simulation.

## Key Concepts
- SoA: one array per property, same index = same agent
- Population count tracks active agents
- Deterministic RNG from a fixed seed — no stdlib rand()
- Velocity is a 2D vector (vx, vy) applied per frame

## Performance Insight
When your movement pass loops over \`cx[]\` and \`cvx[]\`, the CPU prefetcher loads the next position before you ask for it. With 500 agents, SoA means the movement pass touches only position and velocity data — no hunger, no species, no fear loaded into cache. Each system reads only what it needs.

## Memory Insight
512 creatures x 4 floats (cx, cy, cvx, cvy) x 4 bytes = 8KB total. Fits in L1 cache on any CPU. No heap. No allocation. No fragmentation. All arrays live at file scope with fixed size.

## Your Task
Create a population of 50 creatures with deterministic positions and velocities. Print the population count and the first creature's position.

Expected output:
\`\`\`
Population: 50
Creature 0: pos(337, 286) vel(15, -22)
Species: prey
\`\`\`

## Beginner Trap
**Using \`std::rand()\` for positions.** stdlib rand() is non-deterministic across platforms. Same seed gives different results on MSVC vs GCC. Use a simple LCG: \`rng_state = rng_state * 48271u % 0x7fffffffu\`. Same seed, same population, every time.

## Elite Insight
Craig Reynolds' original boids simulation (1987) stored birds as parallel arrays of position and velocity. Three rules (separation, alignment, cohesion) applied to these arrays produced flocking that looked alive. Your 50 creatures are the same foundation — position and velocity arrays that will gain behaviors over the next 9 lessons.

## Systems Thinking Connection
This SoA pattern is identical to the Space Shooter's entity arrays — \`bullet_x[]\`, \`bullet_y[]\`, \`bullet_active[]\`. The Shooter processes bullets in batches. Your sandbox processes creatures in batches. Different domain, same data layout.

## Skill Reinforcement
This lesson establishes the population data layout. Lesson 2 adds screen wrapping. Lesson 3 adds steering. By Lesson 4, these creatures will flock.

## Mastery Check
Question: Why use a fixed-size array instead of std::vector for creature storage?
Answer: Fixed-size arrays have zero allocation cost, predictable memory layout, and no reallocation surprises. With MAX_CREATURES = 512, you know exactly how much memory the simulation uses before it runs. std::vector can reallocate mid-frame, causing stalls.
`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_CREATURES = 512;

float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
float rngFloat() { return (float)rngNext() / 0x7fffffffu; }

int main() {
    // TODO: Spawn 50 creatures with random positions (0..800, 0..600)
    // and random velocities (-50..+50)
    // Use rngFloat() * 800 for x, rngFloat() * 600 for y
    // Use (rngFloat() - 0.5f) * 100.0f for vx and vy
    // Don't forget to set creature_count

    cout << "Population: " << creature_count << endl;
    cout << "Creature 0: pos(" << (int)cx[0] << ", " << (int)cy[0]
         << ") vel(" << (int)cvx[0] << ", " << (int)cvy[0] << ")" << endl;
    cout << "Species: prey" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_CREATURES = 512;

float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
float rngFloat() { return (float)rngNext() / 0x7fffffffu; }

int main() {
    for (int i = 0; i < 50; i++) {
        cx[i] = rngFloat() * 800;
        cy[i] = rngFloat() * 600;
        cvx[i] = (rngFloat() - 0.5f) * 100.0f;
        cvy[i] = (rngFloat() - 0.5f) * 100.0f;
    }
    creature_count = 50;

    cout << "Population: " << creature_count << endl;
    cout << "Creature 0: pos(" << (int)cx[0] << ", " << (int)cy[0]
         << ") vel(" << (int)cvx[0] << ", " << (int)cvy[0] << ")" << endl;
    cout << "Species: prey" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "t2", description: "Creature 0 position printed", expectedOutput: "Creature 0: pos(", isPattern: true },
      { id: "t3", description: "Species is prey", expectedOutput: "Species: prey" },
    ],
    hints: [
      "Use a for loop from 0 to 49. Inside, call rngFloat() four times per creature for cx, cy, cvx, cvy.",
      "cx[i] = rngFloat() * 800 gives x in range 0-800. cy[i] = rngFloat() * 600 gives y in range 0-600.",
      "For velocity: cvx[i] = (rngFloat() - 0.5f) * 100.0f gives a range of -50 to +50. Set creature_count = 50 after the loop.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Living Population",
    type: "game_builder",
    instructions: `
# Build: Living Population

## Mental Model
A population is not a static array — it is a simulation. Each frame, every creature moves according to its velocity. The window becomes a world. Fifty green dots drift across a dark background. No creature knows about any other creature yet. That comes in Lesson 3. Right now, they just exist and move.

## What Breaks Without This
Without rendering, you can't see the population. Without movement, the dots are frozen. Without both, there is no simulation — just numbers in memory. The student must see the creatures move to believe the population is alive.

## The Fix: Movement Integration + Rendering
Each frame:
1. Apply velocity to position: \`cx[i] += cvx[i] * dt\`
2. Draw each creature as a green circle
3. Draw velocity indicator as a short line from center

The fixed timestep \`FIXED_DT = 1.0f / 60.0f\` ensures framerate-independent movement.

## Key Concepts
- Integration: position += velocity * dt
- Fixed timestep for deterministic movement
- DrawCircle for creature body, DrawLine for velocity vector
- ClearBackground every frame (dark forest green)

## Performance Insight
The movement pass is O(n) — 50 additions per axis per frame. The render pass is 50 DrawCircle + 50 DrawLine calls. Total frame cost: trivial. This scales to 500+ creatures before GPU becomes the bottleneck.

## Memory Insight
No new memory allocated. The same arrays from Part 1 are used. Movement modifies \`cx[]\` and \`cy[]\` in-place. Rendering reads from arrays without copying.

## Your Task
Add the raylib game loop. Spawn 50 creatures, apply velocity each frame, and render each as a green circle with a velocity indicator line.

Expected output:
\`\`\`
Population: 50
Species: prey
\`\`\`

Click **Run** and you should see 50 green dots moving across a dark background. Each dot has a short line showing its direction.

## Beginner Trap
**Forgetting \`* FIXED_DT\` in the integration step.** Without it, creatures move at pixels-per-frame instead of pixels-per-second. The simulation runs differently at different framerates. Always multiply velocity by dt.

## Elite Insight
Craig Reynolds' 1987 boids paper started exactly here — a population of agents with position and velocity, rendered as triangles. No steering behaviors yet. Just dots that move. The magic comes when you add rules in Lessons 3-5. But without this foundation — a population that renders and moves — there is nothing to steer.

## Mastery Check
Question: Why use \`FIXED_DT\` instead of \`GetFrameTime()\`?
Answer: GetFrameTime() varies every frame. A spike to 30fps would double the movement distance. FIXED_DT = 1/60 ensures every creature moves the exact same distance regardless of framerate. This is the foundation of deterministic simulation.
`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 600;
const int MAX_CREATURES = 512;
const float FIXED_DT = 1.0f / 60.0f;

float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
float rngFloat() { return (float)rngNext() / 0x7fffffffu; }

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight AI Sandbox");
    SetTargetFPS(60);

    // Spawn 50 creatures
    for (int i = 0; i < 50; i++) {
        cx[i] = rngFloat() * SCREEN_W;
        cy[i] = rngFloat() * SCREEN_H;
        cvx[i] = (rngFloat() - 0.5f) * 100.0f;
        cvy[i] = (rngFloat() - 0.5f) * 100.0f;
    }
    creature_count = 50;

    cout << "Population: " << creature_count << endl;
    cout << "Species: prey" << endl;

    while (!WindowShouldClose()) {
        // TODO: Move each creature by its velocity * FIXED_DT
        // cx[i] += cvx[i] * FIXED_DT
        // cy[i] += cvy[i] * FIXED_DT

        BeginDrawing();
        ClearBackground({20, 25, 20, 255});

        // TODO: Draw each creature as a green circle (radius 4)
        // DrawCircle((int)cx[i], (int)cy[i], 4, GREEN);
        // TODO: Draw velocity indicator line from creature center
        // DrawLine((int)cx[i], (int)cy[i],
        //          (int)(cx[i] + cvx[i] * 0.1f),
        //          (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);

        DrawText("AI Sandbox L1", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 600;
const int MAX_CREATURES = 512;
const float FIXED_DT = 1.0f / 60.0f;

float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
float rngFloat() { return (float)rngNext() / 0x7fffffffu; }

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight AI Sandbox");
    SetTargetFPS(60);

    // Spawn 50 creatures
    for (int i = 0; i < 50; i++) {
        cx[i] = rngFloat() * SCREEN_W;
        cy[i] = rngFloat() * SCREEN_H;
        cvx[i] = (rngFloat() - 0.5f) * 100.0f;
        cvy[i] = (rngFloat() - 0.5f) * 100.0f;
    }
    creature_count = 50;

    cout << "Population: " << creature_count << endl;
    cout << "Species: prey" << endl;

    while (!WindowShouldClose()) {
        // Move each creature
        for (int i = 0; i < creature_count; i++) {
            cx[i] += cvx[i] * FIXED_DT;
            cy[i] += cvy[i] * FIXED_DT;
        }

        BeginDrawing();
        ClearBackground({20, 25, 20, 255});

        for (int i = 0; i < creature_count; i++) {
            DrawCircle((int)cx[i], (int)cy[i], 4, GREEN);
            DrawLine((int)cx[i], (int)cy[i],
                     (int)(cx[i] + cvx[i] * 0.1f),
                     (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);
        }

        DrawText("AI Sandbox L1", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Species is prey", expectedOutput: "Species: prey" },
    ],
    hints: [
      "You need two loops inside the while loop — one for movement, one for drawing inside BeginDrawing/EndDrawing.",
      "Movement loop: cx[i] += cvx[i] * FIXED_DT and cy[i] += cvy[i] * FIXED_DT for each creature.",
      "Draw loop: DrawCircle((int)cx[i], (int)cy[i], 4, GREEN) for the body, then DrawLine for the velocity indicator from (cx[i], cy[i]) to (cx[i] + cvx[i]*0.1f, cy[i] + cvy[i]*0.1f).",
    ],
    estimatedMinutes: 12,
  },
};