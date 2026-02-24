import type { Lesson } from "@/types/lesson";

export const lessonAISandbox7: Lesson = {
  id: "aisandbox-7-starvation",
  title: "Starvation",
  description: "Hunger reaches 1.0 — the creature dies. Death from unmet needs.",
  order: 7,
  xpReward: 50,
  tier: "free",
  concepts: ["death condition", "alive flag", "population decay", "need consequence"],
  part1: {
    title: "Concept: Death From Unmet Needs",
    type: "concept",
    instructions: `
# Starvation

## Mental Model
Hunger without consequence is just a number. Starvation is the consequence. When hunger reaches 1.0, the creature dies. Death is not destruction — the array slot remains, but the \`alive\` flag flips to false. Every loop (movement, steering, rendering) skips dead creatures. The population shrinks. The simulation loses agents. This is the first time your ecosystem can decay.

## What Breaks Without This
Without death, hunger is cosmetic. Creatures turn yellow but nothing happens. There is no population pressure, no selection, no urgency. Death makes the ecosystem dynamic — populations shrink when food is scarce, creating observable carrying capacity.

## The Fix: Alive Flag

\`\`\`cpp
bool alive[MAX_CREATURES]; // initialized to true

// In the update loop:
if (hunger[i] >= 1.0f) {
    alive[i] = false; // creature dies
}

// Skip dead creatures everywhere:
for (int i = 0; i < creature_count; i++) {
    if (!alive[i]) continue;
    // ... movement, steering, eating ...
}
\`\`\`

Track \`alive_count\` by counting alive creatures each frame. Display on HUD.

## Key Concepts
- \`alive[i]\`: boolean flag, true at spawn, false when starved
- Death condition: \`hunger[i] >= 1.0f\`
- All loops must check \`if (!alive[i]) continue;\`
- \`alive_count\`: recount each frame for HUD
- Dead creatures are skipped in rendering (they disappear)

## Performance Insight
One boolean check per creature per loop. Branch prediction handles this efficiently. When most creatures are alive, the branch is almost always taken. When many are dead, the loop runs faster because skip iterations cost nearly nothing.

## Memory Insight
One new array: \`bool alive[MAX_CREATURES]\` = 512 bytes. Booleans in C++ are 1 byte each. Total simulation memory remains under 24KB.

## Your Task
Simulate 5 creatures with different hunger rates. Print which ones survive after 100 frames.

Expected output:
\`\`\`
Creature 0: alive (hunger 0.200)
Creature 1: alive (hunger 0.400)
Creature 2: alive (hunger 0.600)
Creature 3: alive (hunger 0.800)
Creature 4: DEAD (hunger 1.000)
Death: starvation
\`\`\`

## Beginner Trap
**Deleting dead creatures by shifting array elements.** Never compact the array mid-simulation. Shifting 49 creatures every time one dies is O(n) per death. Instead, use the alive flag to skip dead creatures. The array slot stays allocated but unused. This is the standard approach in every ECS.

## Elite Insight
In Dwarf Fortress, death from unmet needs cascades. A dwarf starves, their friends get sad, productivity drops, more dwarves starve. Your ecosystem has the same potential: as creatures die, fewer creatures eat food, leaving food for survivors — or not, if all food was already consumed. Population dynamics emerge from the alive flag.

## Systems Thinking Connection
The Shooter path uses \`bullet_active[]\` to skip despawned bullets. The Platformer uses HP to determine game over. This path uses \`alive[]\` to skip dead creatures. Same pattern: a boolean flag that controls whether an entity participates in the simulation.

## Skill Reinforcement
Lesson 6 added hunger as a need. This lesson adds death as the consequence. Lesson 8 adds food respawn to prevent total extinction. The survival loop tightens: eat → survive, starve → die, food respawns → cycle continues.

## Mastery Check
Question: Why count alive creatures each frame instead of decrementing a counter on death?
Answer: A counter that decrements can drift if you have bugs (double-death, resurrection). Recounting from the alive array each frame is authoritative — the count is always correct regardless of how many systems modify the alive flags. Authoritative counts prevent desync bugs.
`,
    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

const int COUNT = 5;
const float HUNGER_RATE = 0.002f;

int main() {
    float hunger[COUNT] = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f};
    bool alive[COUNT] = {true, true, true, true, true};
    // Different starting hungers to show varied outcomes
    hunger[0] = 0.0f;
    hunger[1] = 0.2f;
    hunger[2] = 0.4f;
    hunger[3] = 0.6f;
    hunger[4] = 0.8f;

    // Simulate 100 frames
    for (int frame = 0; frame < 100; frame++) {
        for (int i = 0; i < COUNT; i++) {
            if (!alive[i]) continue;

            // TODO 1: Add HUNGER_RATE to hunger[i]
            // TODO 2: If hunger[i] >= 1.0f, set alive[i] = false and cap hunger at 1.0f
        }
    }

    cout << fixed << setprecision(3);
    for (int i = 0; i < COUNT; i++) {
        cout << "Creature " << i << ": ";
        if (alive[i]) {
            cout << "alive (hunger " << hunger[i] << ")" << endl;
        } else {
            cout << "DEAD (hunger " << hunger[i] << ")" << endl;
        }
    }
    cout << "Death: starvation" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <iomanip>
using namespace std;

const int COUNT = 5;
const float HUNGER_RATE = 0.002f;

int main() {
    float hunger[COUNT] = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f};
    bool alive[COUNT] = {true, true, true, true, true};
    hunger[0] = 0.0f;
    hunger[1] = 0.2f;
    hunger[2] = 0.4f;
    hunger[3] = 0.6f;
    hunger[4] = 0.8f;

    for (int frame = 0; frame < 100; frame++) {
        for (int i = 0; i < COUNT; i++) {
            if (!alive[i]) continue;
            hunger[i] += HUNGER_RATE;
            if (hunger[i] >= 1.0f) {
                hunger[i] = 1.0f;
                alive[i] = false;
            }
        }
    }

    cout << fixed << setprecision(3);
    for (int i = 0; i < COUNT; i++) {
        cout << "Creature " << i << ": ";
        if (alive[i]) {
            cout << "alive (hunger " << hunger[i] << ")" << endl;
        } else {
            cout << "DEAD (hunger " << hunger[i] << ")" << endl;
        }
    }
    cout << "Death: starvation" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Creature 0 survives", expectedOutput: "Creature 0: alive", isPattern: true },
      { id: "t2", description: "Creature 4 dies", expectedOutput: "Creature 4: DEAD", isPattern: true },
      { id: "t3", description: "Death from starvation", expectedOutput: "Death: starvation" },
    ],
    hints: [
      "Inside the inner loop, add: hunger[i] += HUNGER_RATE; This increases hunger by 0.002 each frame.",
      "After incrementing hunger, check: if (hunger[i] >= 1.0f) { hunger[i] = 1.0f; alive[i] = false; }",
      "Creature 4 starts at 0.8. After 100 frames: 0.8 + 100*0.002 = 1.0 which triggers death. Creatures 0-3 survive with lower hunger.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Population Decay",
    type: "game_builder",
    instructions: `
# Build: Population Decay

## Mental Model
Your ecosystem now has death. Creatures that fail to reach food in time die and vanish. The population counter on the HUD ticks down. Watch the alive count — it drops as starving creatures at the edges expire. Clusters near food survive. Isolated wanderers perish. Natural selection without genetics.

## What Breaks Without This
Without death, the population is fixed at 50 forever. There is no tension, no loss, no observable ecosystem dynamics. Death creates a declining population that makes every food source precious and every survival a victory.

## The Fix: Alive Flag + Skip Pattern
Add \`bool alive[MAX_CREATURES]\` and check it in every loop:

\`\`\`cpp
// At start of creature update loop:
if (!alive[i]) continue;

// After hunger update:
if (hunger[i] >= 1.0f) {
    alive[i] = false;
    continue;
}

// Count alive each frame for HUD:
int alive_count = 0;
for (int i = 0; i < creature_count; i++)
    if (alive[i]) alive_count++;
\`\`\`

## Your Task
Add the alive flag to your simulation. Creatures die when hunger reaches 1.0. Skip dead creatures in all loops. Display alive count on the HUD.

Expected output:
\`\`\`
Population: 50
Death: starvation
Alive: 50
\`\`\`

Click **Run** — watch the alive count decrease as creatures far from food starve and vanish. The initial alive count is 50, but it drops over time.

## Beginner Trap
**Forgetting to skip dead creatures in the render loop.** If you only skip in the update loop, dead creatures still render as frozen dots. Add \`if (!alive[i]) continue;\` to the render loop too.

## Elite Insight
Conway's Game of Life has two rules: birth and death. Your ecosystem has one death rule (starvation) and zero birth rules (yet). Even with just death, you get population dynamics — carrying capacity emerges from the number of food sources. With 20 food items and 50 creatures, not everyone can eat.

## Mastery Check
Question: What determines the carrying capacity of this ecosystem?
Answer: The number of food sources and their spatial distribution. With 20 foods, at most 20 creatures can eat simultaneously. The rest starve unless they reach food before hunger hits 1.0. Carrying capacity emerges from the ratio of food to creatures and the eat radius.
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

float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

float food_x[MAX_FOOD], food_y[MAX_FOOD];
bool food_active[MAX_FOOD];
int food_count = 0;

float wander_angle[MAX_CREATURES];
float hunger[MAX_CREATURES];

// TODO 1: Declare alive array
// bool alive[MAX_CREATURES];

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
    }
    food_count = 20;

    for (int i = 0; i < creature_count; i++) {
        wander_angle[i] = rngFloat() * 6.28f;
        hunger[i] = 0.5f;
        // TODO 2: Set alive[i] = true
    }

    cout << "Population: " << creature_count << endl;
    cout << "Death: starvation" << endl;
    cout << "Alive: " << creature_count << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
            // TODO 3: Skip dead creatures: if (!alive[i]) continue;

            hunger[i] += HUNGER_RATE;
            if (hunger[i] > 1.0f) hunger[i] = 1.0f;

            // TODO 4: If hunger[i] >= 1.0f, set alive[i] = false and continue

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
            }

            // Seek when food is near, wander when far
            if (best_food >= 0 && best_dist < FLOCK_RADIUS) {
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

        BeginDrawing();
        ClearBackground({20, 25, 20, 255});

        for (int f = 0; f < food_count; f++) {
            if (food_active[f])
                DrawCircle((int)food_x[f], (int)food_y[f], 3, YELLOW);
        }

        for (int i = 0; i < creature_count; i++) {
            // TODO 5: Skip dead creatures in render loop: if (!alive[i]) continue;
            Color c = { (unsigned char)(hunger[i] * 255), 255, 0, 255 };
            DrawCircle((int)cx[i], (int)cy[i], 4, c);
            DrawLine((int)cx[i], (int)cy[i],
                     (int)(cx[i] + cvx[i] * 0.1f),
                     (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);
        }

        DrawText("AI Sandbox L7", 10, 10, 20, WHITE);
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

float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

float food_x[MAX_FOOD], food_y[MAX_FOOD];
bool food_active[MAX_FOOD];
int food_count = 0;

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
    }
    food_count = 20;

    for (int i = 0; i < creature_count; i++) {
        wander_angle[i] = rngFloat() * 6.28f;
        hunger[i] = 0.5f;
        alive[i] = true;
    }

    cout << "Population: " << creature_count << endl;
    cout << "Death: starvation" << endl;
    cout << "Alive: " << creature_count << endl;

    while (!WindowShouldClose()) {
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
            }

            // Seek when food is near, wander when far
            if (best_food >= 0 && best_dist < FLOCK_RADIUS) {
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

        // Count alive
        int alive_count = 0;
        for (int i = 0; i < creature_count; i++)
            if (alive[i]) alive_count++;

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

        char hud[64];
        snprintf(hud, 64, "AI Sandbox L7 | Alive: %d", alive_count);
        DrawText(hud, 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Death type is starvation", expectedOutput: "Death: starvation" },
      { id: "g3", description: "Alive count printed", expectedOutput: "Alive: ", isPattern: true },
    ],
    hints: [
      "Uncomment the alive array declaration. In the init loop, add alive[i] = true alongside hunger[i] = 0.5f.",
      "At the start of the creature update loop, add: if (!alive[i]) continue; After hunger update, add: if (hunger[i] >= 1.0f) { hunger[i] = 1.0f; alive[i] = false; continue; }",
      "In the render loop, add if (!alive[i]) continue; before DrawCircle. Also skip dead creatures in the flock neighbor loop: if (!alive[j]) continue;",
    ],
    estimatedMinutes: 15,
  },
};