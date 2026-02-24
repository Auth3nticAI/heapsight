import type { Lesson } from "@/types/lesson";

export const lessonAISandbox2: Lesson = {
  id: "aisandbox-2-screen-wrapping",
  title: "Screen Wrapping",
  description: "Creatures wrap at screen edges — the world becomes continuous and infinite.",
  order: 2,
  xpReward: 50,
  tier: "free",
  concepts: ["toroidal wrapping", "boundary handling", "continuous world", "modular arithmetic"],
  part1: {
    title: "Concept: Continuous Worlds",
    type: "concept",
    instructions: `
# Screen Wrapping

## Mental Model
Your creatures drift off the screen and vanish forever. That is not a world — it is a drain. A continuous world wraps: leave the right edge, appear on the left. Leave the top, appear at the bottom. The world becomes a torus — infinite in all directions from the creature's perspective.

## What Breaks Without This
Without wrapping, creatures that leave the screen are lost. The population drains away within seconds. The simulation dies. Wrapping keeps the world populated and the ecosystem alive.

## The Fix: Toroidal Wrapping
After each movement step, check if the creature has left the screen:

\`\`\`cpp
if (cx[i] < 0) cx[i] += SCREEN_W;
if (cx[i] >= SCREEN_W) cx[i] -= SCREEN_W;
if (cy[i] < 0) cy[i] += SCREEN_H;
if (cy[i] >= SCREEN_H) cy[i] -= SCREEN_H;
\`\`\`

This is cheaper than \`fmod()\` and handles negative values correctly. The creature's position is always in bounds.

## Key Concepts
- Toroidal topology: wrap around all four edges
- Check after integration, not during
- Use addition/subtraction, not modulo (avoids negative float issues)
- The world appears infinite to the agent

## Performance Insight
Four comparisons and at most two additions per creature per frame. For 500 creatures, that is 2000 comparisons — trivial. No branching cost because branch prediction learns the pattern quickly (most creatures are in-bounds).

## Memory Insight
Zero additional memory. Wrapping modifies the existing position arrays in-place. No buffers, no copies.

## Your Task
Implement wrapping logic for a 1D creature. Print position after wrapping off the right edge and the left edge.

Expected output:
\`\`\`
Before: 810
After wrap: 10
Before: -20
After wrap: 780
Topology: toroidal
\`\`\`

## Beginner Trap
**Using \`fmod()\` for wrapping.** \`fmod(-10, 800)\` returns -10, not 790. The simple if-check works correctly for both directions and is faster than any modulo-based approach.

## Elite Insight
The Pac-Man tunnel is a 1D toroidal wrap. Asteroids wraps in 2D — exactly what you are building. Every particle system in modern games uses this same wrap logic to keep particles in bounds without destroying and respawning them.

## Systems Thinking Connection
The Platformer path uses screen clamping (player stops at edges). The Shooter path uses screen bounds to despawn bullets. This path uses wrapping — the world is continuous. Same problem (entity leaves bounds), three different solutions based on the domain.

## Skill Reinforcement
Lesson 1 established movement. This lesson keeps creatures visible. Lesson 3 adds steering toward food — wrapping ensures creatures can always reach food across the boundary.

## Mastery Check
Question: Why wrap after integration instead of clamping velocity at the boundary?
Answer: Clamping velocity would change the creature's direction at the edge, creating artificial boundaries. Wrapping preserves the original velocity — the creature continues in the same direction, just on the other side. This maintains natural movement.
`,
    starterCode: `#include <iostream>
using namespace std;

const int SCREEN_W = 800;

int main() {
    float x1 = 810;
    cout << "Before: " << (int)x1 << endl;
    // TODO: If x1 >= SCREEN_W, subtract SCREEN_W

    cout << "After wrap: " << (int)x1 << endl;

    float x2 = -20;
    cout << "Before: " << (int)x2 << endl;
    // TODO: If x2 < 0, add SCREEN_W

    cout << "After wrap: " << (int)x2 << endl;
    cout << "Topology: toroidal" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int SCREEN_W = 800;

int main() {
    float x1 = 810;
    cout << "Before: " << (int)x1 << endl;
    if (x1 >= SCREEN_W) x1 -= SCREEN_W;
    cout << "After wrap: " << (int)x1 << endl;

    float x2 = -20;
    cout << "Before: " << (int)x2 << endl;
    if (x2 < 0) x2 += SCREEN_W;
    cout << "After wrap: " << (int)x2 << endl;
    cout << "Topology: toroidal" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Right edge wraps to 10", expectedOutput: "After wrap: 10" },
      { id: "t2", description: "Left edge wraps to 780", expectedOutput: "After wrap: 780" },
      { id: "t3", description: "Topology is toroidal", expectedOutput: "Topology: toroidal" },
    ],
    hints: [
      "Check if x1 is past the right edge (>= SCREEN_W). If so, subtract SCREEN_W.",
      "For the left edge, check if x2 < 0. If so, add SCREEN_W.",
      "x1 = 810: 810 >= 800 is true, so x1 -= 800 gives 10. x2 = -20: -20 < 0 is true, so x2 += 800 gives 780.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Continuous World",
    type: "game_builder",
    instructions: `
# Build: Continuous World

## Mental Model
The world is now a torus. Creatures that drift off the right appear on the left. The population stays intact. Watch the creatures flow — they never disappear, never pile up at edges. The world feels infinite.

## What Breaks Without This
Run Lesson 1's code for 30 seconds. Half your creatures are offscreen, never to return. The world empties. Wrapping prevents this — the population stays dense and visible.

## The Fix: Wrap After Integration
After moving each creature, wrap both axes:

\`\`\`cpp
cx[i] += cvx[i] * FIXED_DT;
cy[i] += cvy[i] * FIXED_DT;
if (cx[i] < 0) cx[i] += SCREEN_W;
if (cx[i] >= SCREEN_W) cx[i] -= SCREEN_W;
if (cy[i] < 0) cy[i] += SCREEN_H;
if (cy[i] >= SCREEN_H) cy[i] -= SCREEN_H;
\`\`\`

## Your Task
Add screen wrapping to the Lesson 1 simulation. Creatures should wrap around all four edges.

Expected output:
\`\`\`
Population: 50
Wrap: toroidal
Species: prey
\`\`\`

Click **Run** — creatures now flow continuously, reappearing on the opposite edge when they leave.

## Beginner Trap
**Wrapping before integration.** If you check bounds before applying velocity, a creature at x=799 with vx=10 will wrap to x=0 and THEN move to x=0.16, making it stutter at the edge. Always integrate first, then wrap.

## Elite Insight
The Asteroids arcade game (1979) used toroidal wrapping for both the ship and asteroids. This created gameplay where skilled players shot across the screen boundary to hit asteroids on the other side. Your creatures will eventually do the same — steering toward food across the wrap boundary (Lesson 3).

## Mastery Check
Question: What happens if a creature has velocity so high it crosses the entire screen in one frame?
Answer: A single if-check only handles one wrap per frame. For extreme velocities, you would need a while-loop or true modulo. At 50 pixels/second max velocity and 1/60 dt, the maximum displacement is ~0.83 pixels per frame — far less than 800. The simple if-check is sufficient.
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

    for (int i = 0; i < 50; i++) {
        cx[i] = rngFloat() * SCREEN_W;
        cy[i] = rngFloat() * SCREEN_H;
        cvx[i] = (rngFloat() - 0.5f) * 100.0f;
        cvy[i] = (rngFloat() - 0.5f) * 100.0f;
    }
    creature_count = 50;

    cout << "Population: " << creature_count << endl;
    cout << "Wrap: toroidal" << endl;
    cout << "Species: prey" << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
            cx[i] += cvx[i] * FIXED_DT;
            cy[i] += cvy[i] * FIXED_DT;
            // TODO: Wrap x — if cx[i] < 0, add SCREEN_W; if cx[i] >= SCREEN_W, subtract SCREEN_W
            // TODO: Wrap y — same pattern with SCREEN_H
        }

        BeginDrawing();
        ClearBackground({20, 25, 20, 255});

        for (int i = 0; i < creature_count; i++) {
            DrawCircle((int)cx[i], (int)cy[i], 4, GREEN);
            DrawLine((int)cx[i], (int)cy[i],
                     (int)(cx[i] + cvx[i] * 0.1f),
                     (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);
        }

        DrawText("AI Sandbox L2", 10, 10, 20, WHITE);
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

    for (int i = 0; i < 50; i++) {
        cx[i] = rngFloat() * SCREEN_W;
        cy[i] = rngFloat() * SCREEN_H;
        cvx[i] = (rngFloat() - 0.5f) * 100.0f;
        cvy[i] = (rngFloat() - 0.5f) * 100.0f;
    }
    creature_count = 50;

    cout << "Population: " << creature_count << endl;
    cout << "Wrap: toroidal" << endl;
    cout << "Species: prey" << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
            cx[i] += cvx[i] * FIXED_DT;
            cy[i] += cvy[i] * FIXED_DT;
            if (cx[i] < 0) cx[i] += SCREEN_W;
            if (cx[i] >= SCREEN_W) cx[i] -= SCREEN_W;
            if (cy[i] < 0) cy[i] += SCREEN_H;
            if (cy[i] >= SCREEN_H) cy[i] -= SCREEN_H;
        }

        BeginDrawing();
        ClearBackground({20, 25, 20, 255});

        for (int i = 0; i < creature_count; i++) {
            DrawCircle((int)cx[i], (int)cy[i], 4, GREEN);
            DrawLine((int)cx[i], (int)cy[i],
                     (int)(cx[i] + cvx[i] * 0.1f),
                     (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);
        }

        DrawText("AI Sandbox L2", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Wrap mode is toroidal", expectedOutput: "Wrap: toroidal" },
      { id: "g3", description: "Species is prey", expectedOutput: "Species: prey" },
    ],
    hints: [
      "Add four if-statements after the velocity integration, before EndDrawing.",
      "For x: if (cx[i] < 0) cx[i] += SCREEN_W; if (cx[i] >= SCREEN_W) cx[i] -= SCREEN_W;",
      "Same pattern for y: if (cy[i] < 0) cy[i] += SCREEN_H; if (cy[i] >= SCREEN_H) cy[i] -= SCREEN_H;",
    ],
    estimatedMinutes: 10,
  },
};