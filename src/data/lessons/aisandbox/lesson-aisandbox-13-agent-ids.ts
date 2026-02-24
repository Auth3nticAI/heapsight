import type { Lesson } from "@/types/lesson";

export const lessonAISandbox13: Lesson = {
  id: "aisandbox-13-agent-ids",
  title: "Agent IDs",
  description: "Integer IDs replace raw indices — stable references that survive pool compaction.",
  order: 13,
  xpReward: 100,
  tier: "pro",
  concepts: ["entity IDs", "stable references", "ID generation", "index vs identity", "pool compaction"],
  part1: {
    title: "Concept: Index vs Identity",
    type: "concept",
    instructions: `
# Agent IDs

## Mental Model
Right now, creature 7 is whatever happens to live at index 7 in the arrays. If creature 3 dies and you compact the array (swap-and-pop), creature 7 is now at index 6. Any system holding \`\`\`target = 7\`\`\` is now pointing at the wrong creature — or a dead one. This is the **index instability problem**: array indices are positions, not identities.

## What Breaks Without This
Without stable IDs, any system that stores a reference to a creature (predator tracking prey, parent-child links, event logs) breaks when the array compacts. The predator chases the wrong target. The log references a creature that no longer exists. Indices lie after compaction. IDs never lie.

## The Fix: Unique Agent IDs
Add two fields to SimWorld:

\`\`\`cpp
int agent_id[MAX_CREATURES];  // unique ID per creature
int next_id = 0;              // monotonically increasing counter
\`\`\`

At spawn time, each creature gets a unique ID:
\`\`\`cpp
sim.agent_id[i] = sim.next_id++;
\`\`\`

IDs are never reused. If creature with ID 5 dies and a new creature spawns at the same index, the new creature gets ID 50 (or whatever next_id is). The ID distinguishes \`\`\`who\`\`\` a creature is from \`\`\`where\`\`\` it lives in the array.

To find a creature by ID, you scan the array: \`\`\`for (int i = 0; i < count; i++) if (agent_id[i] == target) ...\`\`\`. This is O(n) but fine for 50—500 creatures. At larger scales, you would add an ID-to-index lookup table.

## Key Concepts
- Index: where the creature lives in the array (changes on compaction)
- ID: who the creature is (never changes, never reused)
- next_id: monotonic counter that guarantees uniqueness
- After 50 spawns, next_id == 50 (IDs 0 through 49 assigned)
- ID lookup is O(n) scan — acceptable for small populations

## Performance Insight
Assigning an ID at spawn is one integer increment and one store — free. ID lookup is O(n) but only happens when you need to find a specific creature by reference. The movement, steering, and rendering loops never use IDs — they iterate by index. IDs add zero cost to the hot path.

## Memory Insight
agent_id[512] adds 2KB to SimWorld. next_id is 4 bytes. Total cost: ~2KB. The IDs are contiguous integers stored in a parallel array — same cache-friendly layout as all other creature data.

## Your Task
Create an agent_id array and a next_id counter. Assign unique IDs to 50 creatures. Print the population and verify IDs are unique and the counter is correct.

Expected output:
\`\`\`
Population: 50
IDs: unique
Next ID: 50
\`\`\`

## Beginner Trap
**Reusing IDs when creatures respawn.** If creature at index 3 dies (ID=3) and a new creature spawns at index 3, giving it ID=3 means two different creatures had the same ID. Any log entry referencing ID 3 is now ambiguous. Always increment next_id — never recycle.

## Elite Insight
The Entity Component System (ECS) in Unity DOTS uses generational IDs: a 32-bit index plus a 32-bit generation counter. If the entity at index 3 dies and index 3 is reused, the generation increments. Old references with generation 0 fail to match generation 1. Your monotonic next_id achieves the same safety with simpler code.

## Systems Thinking Connection
The RPG path uses entity IDs for the combat log — "Entity 3 attacked Entity 7." The Shooter uses bullet IDs for hit detection replay. Your sandbox uses agent IDs for predator-prey tracking. Same pattern: a stable integer reference that outlives array reshuffling.

## Skill Reinforcement
Lesson 12 added species types. This lesson adds unique identity. Lesson 14 formalizes the full SoA layout. By Lesson 15, every creature has position, velocity, hunger, species, ID, and lifecycle state — a complete agent record.

## Mastery Check
Question: Why not use the array index as the ID?
Answer: Because indices change when you compact the array. Swap-and-pop moves the last element into the dead slot. The moved element now has a different index. Any external reference to it (by index) breaks. IDs are stable because they are assigned once and never change.
`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_CREATURES = 512;

int main() {
    int agent_id[MAX_CREATURES];
    int next_id = 0;
    int creature_count = 50;

    // TODO: Assign unique IDs to each creature
    // for (int i = 0; i < creature_count; i++)
    //     agent_id[i] = next_id++;

    cout << "Population: " << creature_count << endl;

    // TODO: Verify all IDs are unique
    // Check that no two creatures have the same ID
    bool all_unique = true;
    // for (int i = 0; i < creature_count; i++)
    //     for (int j = i + 1; j < creature_count; j++)
    //         if (agent_id[i] == agent_id[j]) all_unique = false;

    if (all_unique)
        cout << "IDs: unique" << endl;

    // TODO: Print the next_id value
    // cout << "Next ID: " << next_id << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_CREATURES = 512;

int main() {
    int agent_id[MAX_CREATURES];
    int next_id = 0;
    int creature_count = 50;

    for (int i = 0; i < creature_count; i++)
        agent_id[i] = next_id++;

    cout << "Population: " << creature_count << endl;

    bool all_unique = true;
    for (int i = 0; i < creature_count; i++)
        for (int j = i + 1; j < creature_count; j++)
            if (agent_id[i] == agent_id[j]) all_unique = false;

    if (all_unique)
        cout << "IDs: unique" << endl;

    cout << "Next ID: " << next_id << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "t2", description: "IDs are unique", expectedOutput: "IDs: unique" },
      { id: "t3", description: "Next ID is 50", expectedOutput: "Next ID: 50" },
    ],
    hints: [
      "Uncomment the spawn loop: for (int i = 0; i < creature_count; i++) agent_id[i] = next_id++;",
      "Uncomment the uniqueness check: the nested loop compares every pair of IDs.",
      "Uncomment the last print: cout << Next ID: << next_id << endl; After 50 spawns, next_id should be 50.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Identified Agents",
    type: "game_builder",
    instructions: `
# Build: Identified Agents

## Mental Model
Every creature now has a permanent identity. Agent ID 0 was the first creature spawned. If it dies and its array slot is reused, the new creature gets a different ID. The index changes. The identity does not. This is the foundation for tracking, targeting, and logging.

## What Breaks Without This
When you add predator-prey tracking in future lessons, the predator needs to remember which prey it is chasing. Without IDs, the predator stores an index. If that prey dies and the array compacts, the predator is now chasing the wrong creature — or a ghost.

## The Fix: agent_id and next_id in SimWorld
Add to SimWorld:
\`\`\`cpp
int agent_id[MAX_CREATURES];
int next_id = 0;
\`\`\`

At spawn: \`\`\`sim.agent_id[i] = sim.next_id++;\`\`\`

The IDs appear in the HUD and the console output. After spawning 50 creatures, next_id is 50. Every creature has a unique integer identity.

## Key Concepts
- agent_id array parallel to other creature arrays
- next_id monotonically increases, never resets
- IDs assigned at spawn time only
- ID 0 through 49 for the initial 50 creatures
- next_id == 50 means 50 IDs have been assigned

## Performance Insight
Assigning IDs at spawn is negligible — one increment per creature. The IDs are never read during the hot simulation loop (movement, steering, flocking). They are metadata for debugging, logging, and future targeting systems.

## Memory Insight
agent_id[512] = 2KB. next_id = 4 bytes. Total added to SimWorld: ~2KB. The struct grows from ~16KB to ~18KB. Still fits in L1 cache with room to spare.

## Your Task
Add agent_id[MAX_CREATURES] and next_id to SimWorld. Assign unique IDs at spawn. Print population, uniqueness verification, and next_id value.

Expected output:
\`\`\`
Population: 50
IDs: unique
Next ID: 50
\`\`\`

Click **Run** — the ecosystem runs identically, but now every creature has a permanent identity.

## Beginner Trap
**Assigning IDs inside the game loop instead of at spawn.** IDs must be assigned once, at creation time. If you assign them every frame, every creature gets a new ID every frame — defeating the entire purpose of stable identity.

## Elite Insight
Diablo II uses 32-bit entity IDs for network sync. When a monster dies on the server, the client receives a message: "entity ID 12345 died." The client finds entity 12345 by scanning its local entity table and plays the death animation. If the server sent an array index instead, network latency could cause the index to be stale by the time the client processes it. IDs are network-safe. Indices are not.

## Mastery Check
Question: What happens to next_id if you never reset it and the simulation runs for hours?
Answer: next_id keeps incrementing. After 2 billion spawns, a 32-bit int overflows. For a 50-creature simulation running at 60fps with occasional deaths and respawns, overflow would take years. For production code, use uint32_t or uint64_t. For this lesson, int is fine.
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
    float cx[MAX_CREATURES], cy[MAX_CREATURES];
    float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
    float hunger[MAX_CREATURES];
    bool alive[MAX_CREATURES];
    float wander_angle[MAX_CREATURES];
    int species[MAX_CREATURES];
    // TODO: Add int agent_id[MAX_CREATURES];
    // TODO: Add int next_id = 0;
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
        // TODO: Assign unique ID: sim.agent_id[i] = sim.next_id++;
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

    // TODO: Verify uniqueness and print
    // bool all_unique = true;
    // for (int i = 0; i < sim.creature_count; i++)
    //     for (int j = i + 1; j < sim.creature_count; j++)
    //         if (sim.agent_id[i] == sim.agent_id[j]) all_unique = false;

    cout << "Population: " << sim.creature_count << endl;
    // if (all_unique) cout << "IDs: unique" << endl;
    // cout << "Next ID: " << sim.next_id << endl;

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

    bool all_unique = true;
    for (int i = 0; i < sim.creature_count; i++)
        for (int j = i + 1; j < sim.creature_count; j++)
            if (sim.agent_id[i] == sim.agent_id[j]) all_unique = false;

    cout << "Population: " << sim.creature_count << endl;
    if (all_unique) cout << "IDs: unique" << endl;
    cout << "Next ID: " << sim.next_id << endl;

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
      { id: "g2", description: "IDs are unique", expectedOutput: "IDs: unique" },
      { id: "g3", description: "Next ID is 50", expectedOutput: "Next ID: 50" },
    ],
    hints: [
      "Add int agent_id[MAX_CREATURES]; and int next_id = 0; inside the SimWorld struct.",
      "In the spawn loop, add sim.agent_id[i] = sim.next_id++; after setting species.",
      "Before the cout lines, add the uniqueness check loop and uncomment the IDs: unique and Next ID: prints.",
    ],
    estimatedMinutes: 15,
  },
};