import type { Lesson } from "@/types/lesson";

export const lessonAISandbox15: Lesson = {
  id: "aisandbox-15-milestone-clean-architecture",
  title: "Milestone: Clean Architecture",
  description: "Named simulation passes, stable order, single struct — the pipeline is formalized.",
  order: 15,
  xpReward: 300,
  tier: "pro",
  concepts: ["simulation pipeline", "system ordering", "clean architecture", "milestone verification", "named passes"],
  part1: {
    title: "Concept: The Simulation Pipeline",
    type: "concept",
    instructions: `
# Milestone: Clean Architecture

## Mental Model
Your simulation works. It has 50 creatures, hunger, food, flocking, fleeing, wrapping — all the mechanics. But the game loop is a wall of code with no structure. Behaviors blend into integration, integration blends into rendering. If you need to add a new system (predator AI, reproduction, environmental hazards), where does it go? You cannot tell. A **simulation pipeline** formalizes the loop into named passes with explicit order.

## What Breaks Without This
Without named passes, systems interact in unpredictable ways. If you add predator-prey collision AFTER rendering, dead prey appear on screen for one frame. If you add food respawn BEFORE hunger, creatures eat food that should not exist yet. Order matters. Named passes make order explicit.

## The Fix: Named Simulation Passes
Formalize the game loop into 7 passes:

\`\`\`cpp
while (!WindowShouldClose()) {
    // SENSE    — (future: neighbor queries, spatial grid)
    // DECIDE   — (future: behavior trees, state machines)
    // STEER    — apply seek/flock/wander/flee steering
    // INTEGRATE — velocity * dt, screen wrapping
    // INTERACT  — eat food, check starvation
    // CLEANUP   — remove dead, respawn food
    // RENDER    — draw everything, HUD
}
\`\`\`

Each pass runs in order, every frame. SENSE reads the world. DECIDE picks actions. STEER applies forces. INTEGRATE moves entities. INTERACT resolves collisions and consumption. CLEANUP removes the dead and respawns resources. RENDER draws the result. This is the standard simulation pipeline used in every data-oriented game engine.

## Key Concepts
- Pipeline: a fixed sequence of named passes
- SENSE: perception (future: spatial queries)
- DECIDE: cognition (future: behavior trees)
- STEER: locomotion (seek, flock, wander, flee)
- INTEGRATE: physics (velocity * dt, wrapping)
- INTERACT: game logic (eat food, starvation)
- CLEANUP: lifecycle (remove dead, respawn food)
- RENDER: presentation (draw creatures, food, HUD)

## Performance Insight
Named passes enable future optimization. If STEER is the bottleneck, you can profile it in isolation. If RENDER is slow, you can batch draw calls. Without named passes, profiling shows "the game loop is slow" with no detail about which part. Named passes give you per-system performance data.

## Memory Insight
The pipeline does not add memory. It reorganizes existing code into labeled sections. The SimWorld struct is unchanged. The data layout is unchanged. Only the code structure improves.

## Your Task
Identify the 7 pipeline passes and print them. This is a verification exercise — confirm that you understand the pipeline order.

Expected output:
\`\`\`
Population: 50
Pipeline: sense|decide|steer|integrate|interact|cleanup|render
Architecture: clean
Milestone: clean-architecture
\`\`\`

## Beginner Trap
**Putting rendering before cleanup.** If you render before removing dead creatures, dead creatures appear on screen for one frame with stale data. The render pass must always be last — it draws the result of all other passes.

## Elite Insight
Unity ECS uses a formalized system pipeline: \`\`\`SimulationSystemGroup\`\`\` runs before \`\`\`PresentationSystemGroup\`\`\`. Within simulation, \`\`\`BeginSimulationEntityCommandBufferSystem\`\`\` runs before physics, which runs before AI. The order is explicit, documented, and enforced by the engine. Your 7-pass pipeline follows the same principle at a smaller scale.

## Systems Thinking Connection
The RPG path formalizes its turn into: Input → Intent → Resolve → Apply → Render. The Platformer formalizes its loop into: Input → Physics → Collision → Render. The Shooter has: Spawn → Move → Collide → Cleanup → Render. Every path converges on named passes with explicit order. The names differ. The architecture is identical.

## Skill Reinforcement
Lessons 11–14 cleaned the data (struct, types, IDs, SoA). This lesson cleans the code (pipeline passes). Together, L11–15 transform prototype code into production architecture. Lessons 16–20 will add predators, reproduction, and environmental pressure — the clean architecture makes those additions straightforward.

## Mastery Check
Question: If you add a "reproduction" system, which pass does it belong in?
Answer: INTERACT. Reproduction is a game logic event: two creatures meet, conditions are met, a new creature spawns. It happens after INTEGRATE (positions are final) and before CLEANUP (new creature needs to be alive). INTERACT is for all game-logic events: eating, breeding, combat.
`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int population = 50;

    cout << "Population: " << population << endl;

    // TODO: Print the pipeline passes
    // The 7 passes in order: sense, decide, steer, integrate, interact, cleanup, render
    // cout << "Pipeline: sense|decide|steer|integrate|interact|cleanup|render" << endl;

    // TODO: Print architecture status
    // cout << "Architecture: clean" << endl;

    // TODO: Print milestone
    // cout << "Milestone: clean-architecture" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int population = 50;

    cout << "Population: " << population << endl;
    cout << "Pipeline: sense|decide|steer|integrate|interact|cleanup|render" << endl;
    cout << "Architecture: clean" << endl;
    cout << "Milestone: clean-architecture" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "t2", description: "Pipeline passes listed", expectedOutput: "Pipeline: sense|decide|steer|integrate|interact|cleanup|render" },
      { id: "t3", description: "Architecture is clean", expectedOutput: "Architecture: clean" },
      { id: "t4", description: "Milestone verified", expectedOutput: "Milestone: clean-architecture" },
    ],
    hints: [
      "Uncomment the three cout lines. The pipeline string is: sense|decide|steer|integrate|interact|cleanup|render.",
      "The architecture status is simply: Architecture: clean. Print it as a string literal.",
      "The milestone line: Milestone: clean-architecture. All three lines must be present for tests to pass.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Formalized Simulation Pipeline",
    type: "game_builder",
    instructions: `
# Build: Formalized Simulation Pipeline

## Mental Model
The game loop becomes a pipeline. Every frame executes 7 named passes in fixed order. The code is the same simulation from Lesson 14 — but reorganized with pass labels. Each section has a comment banner. When you need to add predator behavior, you know exactly where: the DECIDE and STEER passes. When you need to optimize, you profile individual passes instead of the entire loop.

## What Breaks Without This
Without named passes, the game loop grows into an unmaintainable monolith. At 300 lines, nobody can find where food respawn happens. At 500 lines, bugs hide between unlabeled sections. Named passes are navigational infrastructure — they make the codebase searchable.

## The Fix: Comment Banners for Each Pass
The reorganized game loop:

\`\`\`cpp
// === SENSE === (future: spatial queries)

// === DECIDE === (future: behavior trees)

// === STEER === seek/flock/wander/flee
// ... all steering code ...

// === INTEGRATE === velocity * dt, wrapping
// ... movement + wrapping code ...

// === INTERACT === eat food, starvation
// ... hunger + eating code ...

// === CLEANUP === remove dead, respawn food
// ... death check + food respawn code ...

// === RENDER === draw everything
// ... all drawing code ...
\`\`\`

## Key Concepts
- Each pass is labeled with a comment banner
- Pass order: SENSE → DECIDE → STEER → INTEGRATE → INTERACT → CLEANUP → RENDER
- SENSE and DECIDE are empty placeholders for future systems
- The simulation behavior is unchanged — only code organization improves
- HUD shows alive count, food count, and generation label

## Performance Insight
Named passes enable future parallelization. SENSE could run on a worker thread while RENDER uses the GPU. STEER and INTEGRATE are pure math — SIMD-friendly. CLEANUP modifies the arrays and must run single-threaded. The pipeline makes these dependencies explicit.

## Memory Insight
No new memory. The pipeline is a code reorganization, not a data change. SimWorld is unchanged. The same arrays, the same struct, the same ~22KB footprint.

## Your Task
Reorganize the game loop into 7 named passes with comment banners. Move hunger and starvation into INTERACT. Move death cleanup and food respawn into CLEANUP. Move all drawing into RENDER.

Expected output:
\`\`\`
Population: 50
Pipeline: sense|decide|steer|integrate|interact|cleanup|render
Architecture: clean
Milestone: clean-architecture
\`\`\`

Click **Run** — the ecosystem runs identically. The code is now a clean pipeline. Every pass has a name.

## Beginner Trap
**Moving code between passes without understanding dependencies.** Eating food (INTERACT) must happen after movement (INTEGRATE) so creatures are at their final positions when checking proximity. Starvation check (INTERACT) must happen before cleanup (CLEANUP) so dead creatures are marked before being removed. The order is not arbitrary — it encodes data dependencies.

## Elite Insight
The Godot engine documents its main loop as: physics_process → process → draw. Unreal uses: tick groups (pre-physics, during-physics, post-physics) → render. Your 7-pass pipeline is more granular than these production engines because your domain (agent simulation) requires finer control over behavior, physics, and lifecycle ordering.

## Mastery Check
Question: Why are SENSE and DECIDE empty passes?
Answer: They are placeholder infrastructure. SENSE will hold spatial grid queries (finding nearest neighbors efficiently). DECIDE will hold behavior tree evaluation (choosing which steering behavior to activate). Right now, sensing is inline (the nearest-food search) and decisions are implicit (if/else chains). Future lessons will extract these into proper SENSE and DECIDE passes. The placeholders ensure the pipeline structure exists before the systems that fill them.
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
    cout << "Pipeline: sense|decide|steer|integrate|interact|cleanup|render" << endl;
    cout << "Architecture: clean" << endl;
    cout << "Milestone: clean-architecture" << endl;

    // TODO: Reorganize the game loop into 7 named passes
    // Add comment banners: // === SENSE ===, // === DECIDE ===, etc.
    // Move hunger/starvation into INTERACT
    // Move death check + food respawn into CLEANUP
    // Move all drawing into RENDER
    while (!WindowShouldClose()) {
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
        snprintf(hud, 128, "Clean Architecture | Alive: %d | Food: %d", alive_count, active_food);
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
    cout << "Pipeline: sense|decide|steer|integrate|interact|cleanup|render" << endl;
    cout << "Architecture: clean" << endl;
    cout << "Milestone: clean-architecture" << endl;

    while (!WindowShouldClose()) {
        float mx = (float)GetMouseX();
        float my = (float)GetMouseY();

        // === SENSE ===
        // (future: spatial grid neighbor queries)

        // === DECIDE ===
        // (future: behavior tree evaluation)

        // === STEER ===
        for (int i = 0; i < sim.creature_count; i++) {
            if (!sim.alive[i]) continue;

            float best_dist = 999999.0f;
            int best_food = -1;
            for (int f = 0; f < sim.food_count; f++) {
                if (!sim.food_active[f]) continue;
                float dx = sim.food_x[f] - sim.cx[i];
                float dy = sim.food_y[f] - sim.cy[i];
                float d = sqrtf(dx * dx + dy * dy);
                if (d < best_dist) { best_dist = d; best_food = f; }
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
        }

        // === INTEGRATE ===
        for (int i = 0; i < sim.creature_count; i++) {
            if (!sim.alive[i]) continue;
            sim.cx[i] += sim.cvx[i] * FIXED_DT;
            sim.cy[i] += sim.cvy[i] * FIXED_DT;
            if (sim.cx[i] < 0) sim.cx[i] += SCREEN_W;
            if (sim.cx[i] >= SCREEN_W) sim.cx[i] -= SCREEN_W;
            if (sim.cy[i] < 0) sim.cy[i] += SCREEN_H;
            if (sim.cy[i] >= SCREEN_H) sim.cy[i] -= SCREEN_H;
        }

        // === INTERACT ===
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
        }

        // === CLEANUP ===
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

        // === RENDER ===
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
        snprintf(hud, 128, "Clean Architecture | Alive: %d | Food: %d", alive_count, active_food);
        DrawText(hud, 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Pipeline passes listed", expectedOutput: "Pipeline: sense|decide|steer|integrate|interact|cleanup|render" },
      { id: "g3", description: "Architecture is clean", expectedOutput: "Architecture: clean" },
      { id: "g4", description: "Milestone verified", expectedOutput: "Milestone: clean-architecture" },
    ],
    hints: [
      "Add comment banners above each section of code: // === SENSE ===, // === DECIDE ===, // === STEER ===, etc.",
      "Move hunger increase and eating logic into a separate INTERACT loop. Move food respawn into a separate CLEANUP loop.",
      "Split the monolithic creature loop into three passes: STEER (steering forces), INTEGRATE (movement + wrapping), INTERACT (hunger + eating). Each is its own for loop over creatures.",
    ],
    estimatedMinutes: 18,
  },
};