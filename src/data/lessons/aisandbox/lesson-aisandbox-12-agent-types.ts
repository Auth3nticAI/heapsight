import type { Lesson } from "@/types/lesson";

export const lessonAISandbox12: Lesson = {
  id: "aisandbox-12-agent-types",
  title: "Agent Types",
  description: "An AgentType enum brings type safety — prey and predator are data, not magic numbers.",
  order: 12,
  xpReward: 100,
  tier: "pro",
  concepts: ["enum type", "agent classification", "type safety", "species array", "data-driven identity"],
  part1: {
    title: "Concept: Type Safety With Enums",
    type: "concept",
    instructions: `
# Agent Types

## Mental Model
Your creatures are all identical. Every one of the 50 agents has the same color, the same behavior, the same rendering. If you want to add predators, you need a way to distinguish prey from predator. You could use magic numbers — 0 for prey, 1 for predator — but a month from now, will you remember what 0 means? An enum makes the intent explicit: \`\`\`AgentType::PREY\`\`\` is self-documenting. No comments needed. No guessing.

## What Breaks Without This
Without an enum, you use raw ints. \`\`\`species[i] = 0\`\`\` means prey. Or does it mean default? Or uninitialized? Raw integers have no semantic meaning. The compiler cannot warn you if you accidentally assign 7 to a species field. An enum restricts the domain to valid values.

## The Fix: enum AgentType
Define an enum and add a species array to SimWorld:

\`\`\`cpp
enum AgentType { PREY = 0, PREDATOR = 1 };

struct SimWorld {
    // ... existing fields ...
    int species[MAX_CREATURES];
};
\`\`\`

At spawn time, set every creature to PREY:
\`\`\`cpp
sim.species[i] = PREY;
\`\`\`

In the render loop, use species to choose color:
\`\`\`cpp
Color base = (sim.species[i] == PREY) ? GREEN : RED;
\`\`\`

Right now all creatures are PREY. Predators come in a later lesson. But the infrastructure — the enum, the species array, the color switch — must exist before predators can be added.

## Key Concepts
- enum: a named set of integer constants
- AgentType: PREY = 0, PREDATOR = 1
- species array: parallel to other creature arrays in SimWorld
- Color-by-type: renders prey and predator differently
- Data-driven identity: the species array IS the type system

## Performance Insight
An int enum is 4 bytes per creature. 512 creatures = 2KB for the species array. The branch in the render loop (PREY vs PREDATOR) is free — branch prediction learns it immediately since all creatures are currently PREY.

## Memory Insight
The species array is inside SimWorld, contiguous with all other creature data. When the render loop reads species[i], the value is likely already in the cache line loaded for alive[i] or hunger[i]. Zero cache miss cost for the type check.

## Your Task
Define an AgentType enum and count creatures of each type. Print the type names and count of species 0 (PREY).

Expected output:
\`\`\`
Population: 50
Types: prey|predator
Species 0: 50
\`\`\`

## Beginner Trap
**Using strings for types.** Storing \`\`\`species[i] = "prey"\`\`\` means a string comparison for every type check. Enums are integers — comparison is a single CPU instruction. Strings are arrays — comparison is a loop. For 500 creatures checked every frame, the difference matters.

## Elite Insight
The Unreal Engine uses \`\`\`UENUM()\`\`\` macros for type-safe enums that are also serializable, network-replicable, and editor-visible. Your enum is the same concept at a smaller scale — a named integer that restricts the domain of valid values.

## Systems Thinking Connection
The RPG path uses entity types (player, enemy, NPC) stored as parallel arrays. The Shooter uses entity types (bullet, enemy, powerup). Your sandbox uses agent types (prey, predator). Same pattern: an integer enum that drives behavior branching in system loops.

## Skill Reinforcement
Lesson 11 grouped state into SimWorld. This lesson adds the species dimension to that struct. Lesson 13 adds unique IDs. By Lesson 15, every creature has identity (ID), classification (species), and state (position, velocity, hunger).

## Mastery Check
Question: Why use an enum instead of a bool isPredator?
Answer: A bool limits you to two types forever. An enum extends to PREY, PREDATOR, SCAVENGER, PLANT without changing the species array type. Booleans encode one distinction. Enums encode categories.
`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_CREATURES = 512;

// TODO: Define enum AgentType { PREY = 0, PREDATOR = 1 };

int main() {
    int species[MAX_CREATURES];
    int creature_count = 50;

    // All creatures start as PREY
    for (int i = 0; i < creature_count; i++) {
        species[i] = 0;  // TODO: Use PREY instead of 0
    }

    cout << "Population: " << creature_count << endl;
    cout << "Types: prey|predator" << endl;

    // TODO: Count how many creatures have species == PREY
    // int prey_count = 0;
    // for (int i = 0; i < creature_count; i++)
    //     if (species[i] == PREY) prey_count++;
    // cout << "Species 0: " << prey_count << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_CREATURES = 512;

enum AgentType { PREY = 0, PREDATOR = 1 };

int main() {
    int species[MAX_CREATURES];
    int creature_count = 50;

    for (int i = 0; i < creature_count; i++) {
        species[i] = PREY;
    }

    cout << "Population: " << creature_count << endl;
    cout << "Types: prey|predator" << endl;

    int prey_count = 0;
    for (int i = 0; i < creature_count; i++)
        if (species[i] == PREY) prey_count++;
    cout << "Species 0: " << prey_count << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "t2", description: "Types listed", expectedOutput: "Types: prey|predator" },
      { id: "t3", description: "All prey counted", expectedOutput: "Species 0: 50" },
    ],
    hints: [
      "Define enum AgentType { PREY = 0, PREDATOR = 1 }; before main(). Then replace species[i] = 0 with species[i] = PREY.",
      "Uncomment the prey_count loop. It counts how many entries in species[] equal PREY.",
      "The full counting loop: int prey_count = 0; for (int i = 0; i < creature_count; i++) if (species[i] == PREY) prey_count++; Then print it.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Species-Aware Ecosystem",
    type: "game_builder",
    instructions: `
# Build: Species-Aware Ecosystem

## Mental Model
Every creature now has a species tag. Right now they are all PREY — but the rendering distinguishes them by type. GREEN for prey, RED for predator. The visual infrastructure is ready. When predators arrive in a future lesson, they will render red automatically — no rendering code changes needed.

## What Breaks Without This
Without species types, adding predators means adding a separate set of arrays — predator_x[], predator_y[], predator_vx[], etc. That doubles your code. With a species array, predators live in the same arrays as prey. The species field tells the behavior system what to do.

## The Fix: species Array in SimWorld
Add \`\`\`int species[MAX_CREATURES]\`\`\` to SimWorld. Set all to PREY at spawn. Render with color based on species:

\`\`\`cpp
Color base = (sim.species[i] == PREY) ? GREEN : RED;
float r = base.r + (255 - base.r) * sim.hunger[i];
float g = base.g - base.g * sim.hunger[i] * 0.5f;
Color c = { (unsigned char)r, (unsigned char)g, 0, 255 };
\`\`\`

Prey fade from green to yellow with hunger. Predators would fade from red to orange. The color-by-type system is already flexible.

## Key Concepts
- enum AgentType { PREY = 0, PREDATOR = 1 }
- species[MAX_CREATURES] added to SimWorld
- All current creatures are PREY
- Color driven by species type
- Infrastructure ready for predator behavior

## Performance Insight
The species check in the render loop is a single integer comparison — effectively free. The ternary operator compiles to a conditional move on modern CPUs, avoiding branch misprediction entirely.

## Memory Insight
Adding species[512] adds 2KB to SimWorld. Total struct size grows from ~14KB to ~16KB. Still fits comfortably in L1 cache.

## Your Task
Add the AgentType enum, add species to SimWorld, set all creatures to PREY, and render with species-based colors.

Expected output:
\`\`\`
Population: 50
Types: prey|predator
Species 0: 50
\`\`\`

Click **Run** — creatures render green (prey). The color blending with hunger still works. The HUD updates.

## Beginner Trap
**Forgetting to initialize the species array at spawn.** Uninitialized memory in C++ contains garbage. If you skip \`\`\`sim.species[i] = PREY\`\`\`, some creatures may render as red (if the garbage value equals 1). Always initialize every field at spawn time.

## Elite Insight
Dwarf Fortress stores creature type as an enum index into a type table. The type drives behavior, rendering, combat stats, and diet. Adding a new creature type means adding one enum value and one table row — no code changes. Your species array follows the same table-driven pattern.

## Mastery Check
Question: What changes when you add a third type (SCAVENGER)?
Answer: Add SCAVENGER = 2 to the enum. In the render loop, add a third color (e.g., ORANGE). In the behavior system, add scavenger-specific steering. The species array, SimWorld struct, and spawn/cleanup code need zero changes. That is the power of enum-driven type systems.
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

// TODO: Define enum AgentType { PREY = 0, PREDATOR = 1 };

struct SimWorld {
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    float hunger[MAX_CREATURES];
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
    // TODO: Add int species[MAX_CREATURES]; to SimWorld
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
        // TODO: Set sim.species[i] = PREY;
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

    // TODO: Count prey and print type info
    int prey_count = 0;
    // for (int i = 0; i < sim.creature_count; i++)
    //     if (sim.species[i] == PREY) prey_count++;

    cout << "Population: " << sim.creature_count << endl;
    cout << "Types: prey|predator" << endl;
    // cout << "Species 0: " << prey_count << endl;

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
            // TODO: Use species-based color instead of fixed green
            // Color base = (sim.species[i] == PREY) ? GREEN : RED;
            // float r = base.r + (255 - base.r) * sim.hunger[i];
            // float g = base.g - base.g * sim.hunger[i] * 0.5f;
            // Color c = { (unsigned char)r, (unsigned char)g, 0, 255 };
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
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    float hunger[MAX_CREATURES];
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
    int species[MAX_CREATURES];
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

    int prey_count = 0;
    for (int i = 0; i < sim.creature_count; i++)
        if (sim.species[i] == PREY) prey_count++;

    cout << "Population: " << sim.creature_count << endl;
    cout << "Types: prey|predator" << endl;
    cout << "Species 0: " << prey_count << endl;

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
      { id: "g2", description: "Types listed", expectedOutput: "Types: prey|predator" },
      { id: "g3", description: "All prey counted", expectedOutput: "Species 0: 50" },
    ],
    hints: [
      "Add enum AgentType { PREY = 0, PREDATOR = 1 }; before the struct. Add int species[MAX_CREATURES]; inside SimWorld.",
      "In the spawn loop, add sim.species[i] = PREY; after the velocity setup. Then add the prey_count loop before the cout lines.",
      "For color: replace the old Color c line with Color base = (sim.species[i] == PREY) ? GREEN : RED; then blend with hunger.",
    ],
    estimatedMinutes: 15,
  },
};