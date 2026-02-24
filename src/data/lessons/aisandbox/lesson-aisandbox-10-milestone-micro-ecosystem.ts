import type { Lesson } from "@/types/lesson";

export const lessonAISandbox10: Lesson = {
  id: "aisandbox-10-milestone-micro-ecosystem",
  title: "Milestone: Micro Ecosystem",
  description: "Creatures flock, eat, starve, flee — emergent patterns from simple rules.",
  order: 10,
  xpReward: 300,
  tier: "free",
  concepts: ["ecosystem", "emergence", "behavior composition", "milestone verification"],
  part1: {
    title: "Concept: Emergence From Simple Rules",
    type: "concept",
    instructions: `
# Milestone: Micro Ecosystem

## Mental Model
You have built a complete micro ecosystem from scratch. Fifty creatures, four behaviors (seek, flock, wander, flee), one need (hunger), one consequence (death), and one resource cycle (food respawn). None of these systems is complex on its own. But together, they produce patterns you never explicitly programmed: herding toward food clusters, population oscillation, predator avoidance cascades, and emergent carrying capacity. This is **emergence** — complex global behavior from simple local rules.

## What Breaks Without This
Without a milestone, the student never pauses to observe the whole system. Each lesson focuses on one mechanic. This lesson asks: what does the sum look like? The answer is an ecosystem. Creatures cluster near food, scatter from the mouse, die when food runs out, stabilize when food respawns. No single rule produces this behavior.

## The Fix: Behavior Composition
The behavior priority chain running every frame:

\`\`\`cpp
// 1. Hunger increases
hunger[i] += HUNGER_RATE;

// 2. Death check
if (hunger[i] >= 1.0f) { alive[i] = false; continue; }

// 3. Eat if close to food
if (best_dist < 10.0f) { hunger[i] = 0; food_active[f] = false; }

// 4. Behavior priority: flee > seek > wander
if (threat < FEAR_RADIUS) flee();
else if (food < FLOCK_RADIUS) seek();
else wander();

// 5. Flock always
flock();

// 6. Food respawn timers tick
\`\`\`

Six systems, each 5-20 lines of code. Together: an ecosystem.

## Key Concepts
- Emergence: global patterns from local rules
- Behavior composition: multiple steering behaviors blended
- Carrying capacity: population stabilizes around resource availability
- Ecosystem: a self-sustaining cycle of birth, death, and renewal

## Performance Insight
The full simulation is O(n²) due to flocking neighbor search (50*50 = 2500 distance checks per frame). At 60fps, that is 150,000 sqrtf calls per second. On a modern CPU, this takes about 0.5ms. The simulation is GPU-bound by DrawCircle, not CPU-bound by the steering math.

## Memory Insight
Total simulation memory: cx, cy, cvx, cvy (4 * 512 * 4 = 8KB) + food arrays (4 * 64 * 4 = 1KB) + hunger, alive, wander (512 * 9 = 4.5KB) + food_timer (64 * 4 = 256B). Total: under 14KB. The entire ecosystem fits in L1 cache.

## Your Task
Print a comprehensive verification of all systems. Confirm population, behaviors, ecosystem status, and milestone.

Expected output:
\`\`\`
Population: 50
Behaviors: seek+flock+wander+flee
Ecosystem: active
Milestone: micro-ecosystem
\`\`\`

## Beginner Trap
**Thinking emergence requires complex code.** It does not. Your ecosystem is under 200 lines. Each behavior is simple. The complexity lives in the interactions, not the code. If your code is getting long, you are probably over-engineering. Simple rules, complex behavior.

## Elite Insight
Craig Reynolds' 1987 boids paper demonstrated that three rules (separation, alignment, cohesion) were sufficient for realistic flocking. You have added four more systems (seek, wander, hunger, flee) on top of flocking. The original boids paper is the foundation of every crowd simulation in film (Lord of the Rings, World War Z) and games (Assassin's Creed crowds, Total War armies).

## Systems Thinking Connection
The RPG path builds toward a complete dungeon crawler. The Platformer builds toward a complete platformer. The Shooter builds toward a complete shoot-em-up. This path builds toward a complete ecosystem. Each path composes simple systems into a complex whole. The lesson is the same: emergence comes from composition, not from complexity.

## Skill Reinforcement
Lessons 1-9 each added one system. This lesson observes all systems running together. The next 10 lessons (11-20) will add species diversity, reproduction, predator-prey dynamics, and environmental hazards. The ecosystem grows.

## Mastery Check
Question: What is the minimum number of systems needed for a self-sustaining ecosystem?
Answer: Three: a resource (food), a consumer (creatures), and a renewal mechanism (respawn). Without food, creatures have nothing to eat. Without creatures, food is unused. Without respawn, the resource is non-renewable. These three form the minimal viable ecosystem. Your simulation adds flocking, wander, and flee as enrichments that make the ecosystem interesting, not just functional.
`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int population = 50;
    bool has_seek = true;
    bool has_flock = true;
    bool has_wander = true;
    bool has_flee = true;

    cout << "Population: " << population << endl;

    // TODO 1: Print behaviors string
    // If all four behaviors are active, print:
    // "Behaviors: seek+flock+wander+flee"

    // TODO 2: Print ecosystem status
    // If population > 0 and all behaviors active:
    // "Ecosystem: active"

    // TODO 3: Print milestone
    // "Milestone: micro-ecosystem"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int population = 50;
    bool has_seek = true;
    bool has_flock = true;
    bool has_wander = true;
    bool has_flee = true;

    cout << "Population: " << population << endl;

    if (has_seek && has_flock && has_wander && has_flee) {
        cout << "Behaviors: seek+flock+wander+flee" << endl;
    }

    if (population > 0 && has_seek && has_flock && has_wander && has_flee) {
        cout << "Ecosystem: active" << endl;
    }

    cout << "Milestone: micro-ecosystem" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "t2", description: "All behaviors listed", expectedOutput: "Behaviors: seek+flock+wander+flee" },
      { id: "t3", description: "Ecosystem is active", expectedOutput: "Ecosystem: active" },
      { id: "t4", description: "Milestone verified", expectedOutput: "Milestone: micro-ecosystem" },
    ],
    hints: [
      "Check if all four behavior booleans are true: if (has_seek && has_flock && has_wander && has_flee). Then print the behaviors string.",
      "Ecosystem is active if population > 0 AND all behaviors exist. Just add population > 0 to the same check.",
      "The milestone line is always printed: cout << Milestone: micro-ecosystem << endl;",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Complete Micro Ecosystem",
    type: "game_builder",
    instructions: `
# Build: Complete Micro Ecosystem

## Mental Model
This is the polished version of everything you have built. All systems running together with a comprehensive HUD. Population count, alive count, active food count, and behavior labels. The simulation is the same as Lesson 9 — but with a proper HUD that lets you observe the ecosystem dynamics in real-time.

## What Breaks Without This
Without a HUD, the ecosystem is hard to read. You can see creatures moving, but you cannot see how many are alive, how much food remains, or whether the population is growing or declining. The HUD turns visual noise into readable data.

## The Fix: Comprehensive HUD
Count alive creatures and active food each frame. Display on screen with DrawText:

\`\`\`cpp
int alive_count = 0;
for (int i = 0; i < creature_count; i++)
    if (alive[i]) alive_count++;

int active_food = 0;
for (int f = 0; f < food_count; f++)
    if (food_active[f]) active_food++;

char hud[128];
snprintf(hud, 128, "Alive: %d | Food: %d", alive_count, active_food);
DrawText(hud, 10, 10, 20, WHITE);
\`\`\`

## Your Task
Add a comprehensive HUD to your ecosystem simulation. Display alive count and food count. Print verification output for all systems.

Expected output:
\`\`\`
Population: 50
Behaviors: seek+flock+wander+flee
Ecosystem: active
Milestone: micro-ecosystem
\`\`\`

Click **Run** — the full ecosystem runs with a polished HUD. Observe the alive count stabilize. Move the mouse to scatter creatures. Watch the food cycle sustain the population.

## Beginner Trap
**Counting food or alive creatures only once at startup.** Both counts change every frame. Count them inside the game loop, not outside. A stale count is worse than no count — it gives false confidence about the ecosystem state.

## Elite Insight
Professional simulations always include telemetry dashboards. Epidemiologists track R0 in real-time. Climate scientists track temperature anomalies. Game designers track player retention curves. Your HUD is the telemetry dashboard for your ecosystem. The data it shows is more informative than the visual simulation.

## Mastery Check
Question: How would you determine whether the ecosystem has reached equilibrium?
Answer: Track alive_count over time. If it oscillates around a stable mean (e.g., 35 ± 5) for several hundred frames, the ecosystem is in dynamic equilibrium. If it trends monotonically downward, the ecosystem is collapsing. If it stays constant at the initial value, either food is too abundant or hunger rate is too low.
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
    cout << "Behaviors: seek+flock+wander+flee" << endl;
    cout << "Ecosystem: active" << endl;
    cout << "Milestone: micro-ecosystem" << endl;

    while (!WindowShouldClose()) {
        // Update food timers
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

            // Find nearest food
            float best_dist = 999999.0f;
            int best_food = -1;
            for (int f = 0; f < food_count; f++) {
                if (!food_active[f]) continue;
                float dx = food_x[f] - cx[i];
                float dy = food_y[f] - cy[i];
                float d = sqrtf(dx * dx + dy * dy);
                if (d < best_dist) { best_dist = d; best_food = f; }
            }

            // Eat food if close enough
            if (best_food >= 0 && best_dist < 10.0f) {
                hunger[i] = 0.0f;
                food_active[best_food] = false;
                food_timer[best_food] = 180;
            }

            // Behavior priority: flee > seek > wander
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

            // Flocking
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

        // TODO 1: Count alive creatures
        int alive_count = 0;
        for (int i = 0; i < creature_count; i++)
            if (alive[i]) alive_count++;

        // TODO 2: Count active food
        // int active_food = 0;
        // for (int f = 0; f < food_count; f++)
        //     if (food_active[f]) active_food++;

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

        // TODO 3: Replace HUD with comprehensive version showing alive + food counts
        // char hud[128];
        // snprintf(hud, 128, "Micro Ecosystem | Alive: %d | Food: %d", alive_count, active_food);
        // DrawText(hud, 10, 10, 20, WHITE);
        DrawText("AI Sandbox L10", 10, 10, 20, WHITE);

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
    cout << "Behaviors: seek+flock+wander+flee" << endl;
    cout << "Ecosystem: active" << endl;
    cout << "Milestone: micro-ecosystem" << endl;

    while (!WindowShouldClose()) {
        // Update food timers
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

            // Find nearest food
            float best_dist = 999999.0f;
            int best_food = -1;
            for (int f = 0; f < food_count; f++) {
                if (!food_active[f]) continue;
                float dx = food_x[f] - cx[i];
                float dy = food_y[f] - cy[i];
                float d = sqrtf(dx * dx + dy * dy);
                if (d < best_dist) { best_dist = d; best_food = f; }
            }

            // Eat food if close enough
            if (best_food >= 0 && best_dist < 10.0f) {
                hunger[i] = 0.0f;
                food_active[best_food] = false;
                food_timer[best_food] = 180;
            }

            // Behavior priority: flee > seek > wander
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

            // Flocking
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
        snprintf(hud, 128, "Micro Ecosystem | Alive: %d | Food: %d", alive_count, active_food);
        DrawText(hud, 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "All behaviors active", expectedOutput: "Behaviors: seek+flock+wander+flee" },
      { id: "g3", description: "Ecosystem is active", expectedOutput: "Ecosystem: active" },
      { id: "g4", description: "Milestone verified", expectedOutput: "Milestone: micro-ecosystem" },
    ],
    hints: [
      "Uncomment the active_food counter: int active_food = 0; then loop through food_active[] and count the true entries.",
      "Replace the DrawText line with the snprintf version. Use: snprintf(hud, 128, format_string, alive_count, active_food); then DrawText(hud, ...).",
      "The comprehensive HUD line: char hud[128]; snprintf(hud, 128, Micro Ecosystem | Alive: %d | Food: %d, alive_count, active_food); DrawText(hud, 10, 10, 20, WHITE);",
    ],
    estimatedMinutes: 12,
  },
};