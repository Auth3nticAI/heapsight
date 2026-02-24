import type { Lesson } from "@/types/lesson";

export const lessonAISandbox11: Lesson = {
  id: "aisandbox-11-god-object-refactor",
  title: "God Object Refactor",
  description: "Scattered globals become a single SimWorld struct — one struct to rule all simulation state.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["god object", "struct refactor", "SimWorld", "data grouping", "mutable vs immutable"],
  part1: {
    title: "Concept: The God Object Problem",
    type: "concept",
    instructions: `
# God Object Refactor

## Mental Model
Your simulation works. Fifty creatures flock, eat, starve, flee. But look at the top of your file: 14 global arrays and counters scattered like debris after an explosion. \`\`\`cx\`\`\`, \`\`\`cy\`\`\`, \`\`\`cvx\`\`\`, \`\`\`cvy\`\`\`, \`\`\`hunger\`\`\`, \`\`\`alive\`\`\`, \`\`\`wander_angle\`\`\`, \`\`\`food_x\`\`\`, \`\`\`food_y\`\`\`, \`\`\`food_active\`\`\`, \`\`\`food_timer\`\`\`, \`\`\`creature_count\`\`\`, \`\`\`food_count\`\`\`, \`\`\`rng_state\`\`\`. Which ones belong to creatures? Which to food? Which to the simulation itself? You cannot tell at a glance. This is the **god object problem** — except worse, because there is no object at all. Just loose globals.

## What Breaks Without This
Without grouping, every new system must hunt through globals to find the data it needs. Want to save the simulation state? You must manually list every array. Want to reset? Same problem. Want to run two simulations side by side? Impossible — globals are singular. A struct fixes all three problems.

## The Fix: struct SimWorld
Move ALL mutable simulation state into a single struct:

\`\`\`cpp
struct SimWorld {
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    float hunger[MAX_CREATURES];
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
    float food_x[MAX_FOOD], food_y[MAX_FOOD];
    bool food_active[MAX_FOOD];
    int food_timer[MAX_FOOD];
    int creature_count = 0;
    int food_count = 0;
    uint32_t rng_state = 42;
};
SimWorld sim;
\`\`\`

Constants like \`\`\`SCREEN_W\`\`\`, \`\`\`MAX_CREATURES\`\`\`, \`\`\`FIXED_DT\`\`\` stay global — they are immutable configuration, not simulation state. The RNG functions (\`\`\`rngNext\`\`\`, \`\`\`rngFloat\`\`\`) access \`\`\`sim.rng_state\`\`\` through the global \`\`\`sim\`\`\` instance.

After the refactor, every mutable variable is prefixed with \`\`\`sim.\`\`\`. When you read \`\`\`sim.hunger[i]\`\`\`, you know exactly where that data lives. When you want to save the simulation, you serialize one struct. When you want to reset, you zero one struct.

## Key Concepts
- God object: a single entity that holds too much unrelated state (the anti-pattern you are FIXING)
- struct: groups related data under one name
- SimWorld: the single source of truth for all mutable simulation state
- Mutable vs immutable: only mutable state goes in the struct; constants stay global
- \`\`\`sim.\`\`\` prefix: makes ownership explicit in every line of code

## Performance Insight
Moving globals into a struct changes nothing about performance. The arrays are still contiguous. The CPU prefetcher still works. But the struct gives the compiler a single "this" pointer to reason about, which can improve alias analysis in optimizing compilers. Struct > scattered globals for both humans and compilers.

## Memory Insight
The struct is still on the stack (file-scope static). No heap allocation. No indirection. \`\`\`sim.cx[i]\`\`\` compiles to the same memory access as the old \`\`\`cx[i]\`\`\` — a direct offset from a known base address. Zero runtime cost.

## Your Task
Define a SimWorld struct containing creature_count, a food_count, and a species field. Print the struct name and population.

Expected output:
\`\`\`
Struct: SimWorld
Population: 50
Species: prey
\`\`\`

## Beginner Trap
**Putting constants inside the struct.** \`\`\`SCREEN_W\`\`\`, \`\`\`MAX_CREATURES\`\`\`, \`\`\`FIXED_DT\`\`\` are immutable configuration. They do not change during simulation. Putting them in the struct bloats it with data that never changes and cannot vary between instances. Only mutable state belongs in SimWorld.

## Elite Insight
The Quake engine stores all game state in a single \`\`\`server_t\`\`\` struct. Save game = serialize the struct. Load game = deserialize it. Reset = zero it. John Carmack called this "the most important architectural decision in the engine." Your SimWorld follows the same principle.

## Systems Thinking Connection
The RPG path groups entity data into parallel arrays inside a world struct. The Platformer groups physics state into a PhysWorld. Your SimWorld groups creature and food state. Same pattern, same benefit: one struct to save, reset, or duplicate the entire simulation.

## Skill Reinforcement
Lessons 1–10 built the ecosystem with scattered globals. This lesson groups them. Lesson 12 adds species types. Lesson 14 formalizes the SoA layout. By Lesson 15, the architecture is clean enough to add predators, reproduction, and evolution.

## Mastery Check
Question: Why is SimWorld a struct and not a class?
Answer: In C++, struct and class differ only in default access (public vs private). For data-oriented design, all fields should be public — systems read and write them directly. A struct signals "this is data, not behavior." If you add methods, you are drifting toward OOP. Keep SimWorld as pure data.
`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_CREATURES = 512;

// TODO: Define struct SimWorld with:
//   int creature_count;
//   int food_count;
//   const char* species;

int main() {
    // TODO: Create a SimWorld instance called sim
    // Set sim.creature_count = 50
    // Set sim.food_count = 20
    // Set sim.species = "prey"

    cout << "Struct: SimWorld" << endl;
    // TODO: Print population from sim.creature_count
    // cout << "Population: " << sim.creature_count << endl;
    // TODO: Print species from sim.species
    // cout << "Species: " << sim.species << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_CREATURES = 512;

struct SimWorld {
    int creature_count;
    int food_count;
    const char* species;
};

int main() {
    SimWorld sim;
    sim.creature_count = 50;
    sim.food_count = 20;
    sim.species = "prey";

    cout << "Struct: SimWorld" << endl;
    cout << "Population: " << sim.creature_count << endl;
    cout << "Species: " << sim.species << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Struct name printed", expectedOutput: "Struct: SimWorld" },
      { id: "t2", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "t3", description: "Species is prey", expectedOutput: "Species: prey" },
    ],
    hints: [
      "Define a struct with the keyword struct SimWorld { ... }; with three fields inside the braces.",
      "Create an instance: SimWorld sim; Then use dot notation: sim.creature_count = 50;",
      "Print with: cout << Population: << sim.creature_count << endl; and cout << Species: << sim.species << endl;",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: SimWorld Struct Refactor",
    type: "game_builder",
    instructions: `
# Build: SimWorld Struct Refactor

## Mental Model
The simulation works with scattered globals. Now move every mutable array and counter into \`\`\`struct SimWorld\`\`\`. Every \`\`\`cx[i]\`\`\` becomes \`\`\`sim.cx[i]\`\`\`. Every \`\`\`creature_count\`\`\` becomes \`\`\`sim.creature_count\`\`\`. The behavior is identical — the architecture is transformed. One struct owns all state.

## What Breaks Without This
Try to save your simulation state. You need to list 14 separate globals. Miss one and the save is corrupt. With SimWorld, you serialize one struct. Try to run two simulations. Impossible with globals. With SimWorld, you create two instances. The struct makes the impossible possible.

## The Fix: Move Everything Into SimWorld
The struct contains ALL mutable simulation state:

\`\`\`cpp
struct SimWorld {
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    float hunger[MAX_CREATURES];
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
    float food_x[MAX_FOOD], food_y[MAX_FOOD];
    bool food_active[MAX_FOOD];
    int food_timer[MAX_FOOD];
    int creature_count = 0;
    int food_count = 0;
    uint32_t rng_state = 42;
};
SimWorld sim;
\`\`\`

Then replace every bare global with \`\`\`sim.\`\`\` prefix. The RNG functions access \`\`\`sim.rng_state\`\`\`. The movement loop reads \`\`\`sim.cx[i]\`\`\`. The food loop reads \`\`\`sim.food_active[f]\`\`\`. Every piece of mutable state has an explicit owner.

## Key Concepts
- All 14 mutable arrays/counters move into SimWorld
- Constants (SCREEN_W, MAX_CREATURES, FIXED_DT, weights) stay global
- RNG functions access sim.rng_state
- Every mutable access gets sim. prefix
- Behavior is identical — only ownership changes

## Performance Insight
The struct is a file-scope global (\`\`\`SimWorld sim;\`\`\`). The compiler places it in BSS. Array access compiles to the same machine code — a base address plus offset. Zero performance cost for the refactor.

## Memory Insight
SimWorld is approximately 14KB (same as the scattered globals). It lives at file scope, not on the stack of main(). This avoids any stack overflow risk with large arrays. The struct is just a named region of the same memory.

## Your Task
Move all mutable globals into struct SimWorld. Prefix every access with sim. The simulation must behave identically.

Expected output:
\`\`\`
Population: 50
Struct: SimWorld
Refactor: complete
\`\`\`

Click **Run** — the ecosystem looks identical. But the code is cleaner. Every piece of state has a home.

## Beginner Trap
**Forgetting to update the RNG functions.** \`\`\`rngNext()\`\`\` and \`\`\`rngFloat()\`\`\` still reference \`\`\`rng_state\`\`\`. After the refactor, they must reference \`\`\`sim.rng_state\`\`\`. Miss this and the compiler will say \`\`\`rng_state\`\`\` is undeclared.

## Elite Insight
The Quake III Arena source code stores all game state in \`\`\`level_locals_t\`\`\` and \`\`\`game_locals_t\`\`\` structs. Save/load is memcpy of the struct. Server-side prediction copies the struct, runs a tick, then diffs. Your SimWorld enables the same patterns — copy the struct to snapshot, diff to detect changes, reset to restart.

## Mastery Check
Question: If you wanted to run two independent ecosystems, what would you change?
Answer: Create two instances: SimWorld sim1, sim2. Each has its own creature arrays, food arrays, and RNG state. The RNG functions would need to take a SimWorld reference parameter instead of accessing a global. Two ecosystems, zero shared state, zero interference.
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

// TODO: Move ALL these mutable globals into struct SimWorld { ... };
// Then create a single instance: SimWorld sim;
// Prefix every access with sim. (e.g., cx[i] becomes sim.cx[i])
float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

float food_x[MAX_FOOD], food_y[MAX_FOOD];
bool food_active[MAX_FOOD];
int food_count = 0;
int food_timer[MAX_FOOD];

float wander_angle[MAX_CREATURES];
float hunger[MAX_CREATURES];
bool alive[MAX_CREATURES];

uint32_t rng_state = 42;

// TODO: Update rngNext to use sim.rng_state
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

    for (int i = 0; i < 20; i++) {
        food_x[i] = rngFloat() * SCREEN_W;
        food_y[i] = rngFloat() * SCREEN_H;
        food_active[i] = true;
        food_timer[i] = 0;
    }
    food_count = 20;

    for (int i = 0; i < creature_count; i++) {
        wander_angle[i] = rngFloat() * 6.28f;
        hunger[i] = 0.5f;
        alive[i] = true;
    }

    cout << "Population: " << creature_count << endl;
    cout << "Struct: SimWorld" << endl;
    cout << "Refactor: complete" << endl;

    while (!WindowShouldClose()) {
        for (int f = 0; f < food_count; f++) {
            if (!food_active[f]) {
                food_timer[f]--;
                if (food_timer[f] <= 0) {
                    food_x[f] = rngFloat() * SCREEN_W;
                    food_y[f] = rngFloat() * SCREEN_H;
                    food_active[f] = true;
                }
            }
        }

        float mx = (float)GetMouseX();
        float my = (float)GetMouseY();

        for (int i = 0; i < creature_count; i++) {
            if (!alive[i]) continue;

            hunger[i] += HUNGER_RATE;
            if (hunger[i] >= 1.0f) {
                hunger[i] = 1.0f;
                alive[i] = false;
                continue;
            }

            float best_dist = 999999.0f;
            int best_food = -1;
            for (int f = 0; f < food_count; f++) {
                if (!food_active[f]) continue;
                float dx = food_x[f] - cx[i];
                float dy = food_y[f] - cy[i];
                float d = sqrtf(dx * dx + dy * dy);
                if (d < best_dist) { best_dist = d; best_food = f; }
            }

            if (best_food >= 0 && best_dist < 10.0f) {
                hunger[i] = 0.0f;
                food_active[best_food] = false;
                food_timer[best_food] = 180;
            }

            float tdx = cx[i] - mx;
            float tdy = cy[i] - my;
            float threat_dist = sqrtf(tdx * tdx + tdy * tdy);

            if (threat_dist < FEAR_RADIUS && threat_dist > 0.01f) {
                float flee_vx = (tdx / threat_dist) * MAX_SPEED;
                float flee_vy = (tdy / threat_dist) * MAX_SPEED;
                cvx[i] += (flee_vx - cvx[i]) * 0.15f;
                cvy[i] += (flee_vy - cvy[i]) * 0.15f;
            } else if (best_food >= 0 && best_dist < FLOCK_RADIUS) {
                float dx = food_x[best_food] - cx[i];
                float dy = food_y[best_food] - cy[i];
                float desired_vx = (dx / best_dist) * MAX_SPEED;
                float desired_vy = (dy / best_dist) * MAX_SPEED;
                cvx[i] += (desired_vx - cvx[i]) * STEER_WEIGHT;
                cvy[i] += (desired_vy - cvy[i]) * STEER_WEIGHT;
            } else {
                wander_angle[i] += (rngFloat() - 0.5f) * 2.0f * WANDER_JITTER;
                float speed = sqrtf(cvx[i] * cvx[i] + cvy[i] * cvy[i]);
                float hx = (speed > 0.01f) ? cvx[i] / speed : 1.0f;
                float hy = (speed > 0.01f) ? cvy[i] / speed : 0.0f;
                float wcx = cx[i] + hx * WANDER_DISTANCE;
                float wcy = cy[i] + hy * WANDER_DISTANCE;
                float tx = wcx + cosf(wander_angle[i]) * WANDER_RADIUS;
                float ty = wcy + sinf(wander_angle[i]) * WANDER_RADIUS;
                float dx = tx - cx[i];
                float dy = ty - cy[i];
                float d = sqrtf(dx * dx + dy * dy);
                if (d > 0.01f) {
                    cvx[i] += ((dx / d) * MAX_SPEED - cvx[i]) * STEER_WEIGHT;
                    cvy[i] += ((dy / d) * MAX_SPEED - cvy[i]) * STEER_WEIGHT;
                }
            }

            float sep_x = 0, sep_y = 0;
            float ali_vx = 0, ali_vy = 0;
            float coh_cx = 0, coh_cy = 0;
            int n_count = 0;
            for (int j = 0; j < creature_count; j++) {
                if (j == i) continue;
                if (!alive[j]) continue;
                float dx = cx[i] - cx[j];
                float dy = cy[i] - cy[j];
                float d = sqrtf(dx * dx + dy * dy);
                if (d < FLOCK_RADIUS) {
                    if (d < 25.0f && d > 0.01f) {
                        sep_x += dx / d;
                        sep_y += dy / d;
                    }
                    ali_vx += cvx[j];
                    ali_vy += cvy[j];
                    coh_cx += cx[j];
                    coh_cy += cy[j];
                    n_count++;
                }
            }
            if (n_count > 0) {
                ali_vx = ali_vx / n_count - cvx[i];
                ali_vy = ali_vy / n_count - cvy[i];
                coh_cx = coh_cx / n_count - cx[i];
                coh_cy = coh_cy / n_count - cy[i];
            }
            cvx[i] += (sep_x * SEP_WEIGHT + ali_vx * ALI_WEIGHT + coh_cx * COH_WEIGHT) * STEER_WEIGHT;
            cvy[i] += (sep_y * SEP_WEIGHT + ali_vy * ALI_WEIGHT + coh_cy * COH_WEIGHT) * STEER_WEIGHT;

            cx[i] += cvx[i] * FIXED_DT;
            cy[i] += cvy[i] * FIXED_DT;
            if (cx[i] < 0) cx[i] += SCREEN_W;
            if (cx[i] >= SCREEN_W) cx[i] -= SCREEN_W;
            if (cy[i] < 0) cy[i] += SCREEN_H;
            if (cy[i] >= SCREEN_H) cy[i] -= SCREEN_H;
        }

        int alive_count = 0;
        for (int i = 0; i < creature_count; i++)
            if (alive[i]) alive_count++;

        int active_food = 0;
        for (int f = 0; f < food_count; f++)
            if (food_active[f]) active_food++;

        BeginDrawing();
        ClearBackground({20, 25, 20, 255});

        for (int f = 0; f < food_count; f++) {
            if (food_active[f])
                DrawCircle((int)food_x[f], (int)food_y[f], 3, YELLOW);
        }

        for (int i = 0; i < creature_count; i++) {
            if (!alive[i]) continue;
            Color c = { (unsigned char)(hunger[i] * 255), 255, 0, 255 };
            DrawCircle((int)cx[i], (int)cy[i], 4, c);
            DrawLine((int)cx[i], (int)cy[i],
                     (int)(cx[i] + cvx[i] * 0.1f),
                     (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);
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

struct SimWorld {
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    float hunger[MAX_CREATURES];
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
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
    cout << "Struct: SimWorld" << endl;
    cout << "Refactor: complete" << endl;

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
            Color c = { (unsigned char)(sim.hunger[i] * 255), 255, 0, 255 };
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
      { id: "g2", description: "SimWorld struct used", expectedOutput: "Struct: SimWorld" },
      { id: "g3", description: "Refactor complete", expectedOutput: "Refactor: complete" },
    ],
    hints: [
      "Create struct SimWorld { ... }; with all the mutable arrays inside. Then SimWorld sim; after the struct definition.",
      "Replace every bare array access with sim. prefix: cx[i] becomes sim.cx[i], creature_count becomes sim.creature_count, etc.",
      "Do not forget to update rngNext() to use sim.rng_state instead of rng_state. The function accesses the global sim instance.",
    ],
    estimatedMinutes: 15,
  },
};