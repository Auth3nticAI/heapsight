import type { Lesson } from "@/types/lesson";

export const lessonAISandbox8: Lesson = {
  id: "aisandbox-8-food-respawn",
  title: "Food Respawn",
  description: "Eaten food respawns at random locations — the resource cycle sustains life.",
  order: 8,
  xpReward: 50,
  tier: "free",
  concepts: ["resource cycle", "respawn timer", "carrying capacity", "ecosystem balance"],
  part1: {
    title: "Concept: The Resource Cycle",
    type: "concept",
    instructions: `
# Food Respawn

## Mental Model
Your creatures eat food and it vanishes. Once all 20 food sources are consumed, every creature starves. The ecosystem dies in one burst. That is not an ecosystem — it is a countdown. A **resource cycle** fixes this: eaten food respawns after a delay (180 frames = 3 seconds). The ecosystem becomes sustainable. Population stabilizes around the respawn rate. Carrying capacity emerges.

## What Breaks Without This
Without respawn, food is a non-renewable resource. The simulation has a fixed lifespan: total food / eat rate = seconds until extinction. No equilibrium is possible. Respawn creates a renewable resource that sustains a stable population.

## The Fix: Respawn Timer

\`\`\`cpp
int food_timer[MAX_FOOD]; // countdown frames until respawn

// When food is eaten:
food_active[f] = false;
food_timer[f] = 180; // 3 seconds at 60fps

// Each frame, update timers:
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
\`\`\`

The respawn location is random — food appears at a new position, not the old one. This prevents creatures from camping a single food spot.

## Key Concepts
- \`food_timer[f]\`: integer countdown, set to 180 when food is eaten
- Decrement timer each frame for inactive food
- When timer reaches 0: randomize position and reactivate
- 180 frames at 60fps = 3 second respawn delay
- Carrying capacity = f(food_count, respawn_rate, hunger_rate)

## Performance Insight
One decrement per inactive food per frame. With 20 food items, worst case is 20 decrements + 20 comparisons = trivial. The respawn itself (two rngFloat calls + one boolean set) costs nothing.

## Memory Insight
One new array: \`int food_timer[MAX_FOOD]\` = 256 bytes (64 ints * 4 bytes). Total simulation memory remains under 24KB.

## Your Task
Simulate a food respawn timer. Start with food eaten (inactive), count down 180 frames, then respawn.

Expected output:
\`\`\`
Frame 0: food inactive, timer = 180
Frame 90: food inactive, timer = 90
Frame 179: food inactive, timer = 1
Frame 180: food ACTIVE (respawned)
Respawn: 3s
\`\`\`

## Beginner Trap
**Respawning food immediately when eaten.** If food respawns on the same frame it is consumed, the creature can eat it again next frame. The 3-second delay prevents infinite eat loops and gives other creatures time to migrate toward the new food location.

## Elite Insight
Resource respawn rate is the primary tuning knob for carrying capacity. Fast respawn = large population. Slow respawn = small population. In Sim games, resource regeneration rates determine how many entities the world can support. Your 3-second timer is the first tuning knob of your ecosystem.

## Systems Thinking Connection
The Shooter path respawns enemies via wave spawners with cooldown timers. The RPG path respawns items in chests with reload logic. This path respawns food with frame timers. Same pattern: deactivate, count down, reactivate at new state.

## Skill Reinforcement
Lesson 6 added hunger. Lesson 7 added death. This lesson adds food respawn. Together they form the survival loop: creatures eat → food depletes → food respawns → creatures find new food. The population oscillates toward equilibrium.

## Mastery Check
Question: What happens if you set the respawn timer to 1 frame instead of 180?
Answer: Food respawns almost instantly, making starvation nearly impossible. The population stays at 50 because food is always available. A 1-frame timer removes all selection pressure — there is no advantage to being near food. The 180-frame delay creates scarcity, which drives behavior.
`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    bool food_active = false;
    int food_timer = 180;

    for (int frame = 0; frame <= 180; frame++) {
        if (frame == 0) {
            cout << "Frame 0: food inactive, timer = " << food_timer << endl;
        }

        if (!food_active) {
            // TODO 1: Decrement food_timer
            // TODO 2: If food_timer <= 0, set food_active = true
        }

        if (frame == 90) {
            cout << "Frame 90: food inactive, timer = " << food_timer << endl;
        }
        if (frame == 179) {
            cout << "Frame 179: food inactive, timer = " << food_timer << endl;
        }
        if (frame == 180 && food_active) {
            cout << "Frame 180: food ACTIVE (respawned)" << endl;
        }
    }
    cout << "Respawn: 3s" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    bool food_active = false;
    int food_timer = 180;

    for (int frame = 0; frame <= 180; frame++) {
        if (frame == 0) {
            cout << "Frame 0: food inactive, timer = " << food_timer << endl;
        }

        if (!food_active) {
            food_timer--;
            if (food_timer <= 0) {
                food_active = true;
            }
        }

        if (frame == 90) {
            cout << "Frame 90: food inactive, timer = " << food_timer << endl;
        }
        if (frame == 179) {
            cout << "Frame 179: food inactive, timer = " << food_timer << endl;
        }
        if (frame == 180 && food_active) {
            cout << "Frame 180: food ACTIVE (respawned)" << endl;
        }
    }
    cout << "Respawn: 3s" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Initial timer is 180", expectedOutput: "Frame 0: food inactive, timer = 180" },
      { id: "t2", description: "Timer at midpoint", expectedOutput: "Frame 90: food inactive, timer = 90" },
      { id: "t3", description: "Food respawns at frame 180", expectedOutput: "Frame 180: food ACTIVE (respawned)" },
      { id: "t4", description: "Respawn delay is 3s", expectedOutput: "Respawn: 3s" },
    ],
    hints: [
      "Inside the if (!food_active) block, add: food_timer--; to decrement the timer each frame.",
      "After decrementing, check: if (food_timer <= 0) { food_active = true; }",
      "The timer starts at 180 and decrements once per frame. After 180 decrements, it reaches 0 and the food becomes active again.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Sustainable Ecosystem",
    type: "game_builder",
    instructions: `
# Build: Sustainable Ecosystem

## Mental Model
Food now respawns. The ecosystem is sustainable. Creatures eat, food vanishes, a timer counts down, food reappears at a random location. The population no longer collapses to zero — it stabilizes. Watch the alive count settle around a carrying capacity determined by food count and respawn rate.

## What Breaks Without This
Run the L7 simulation for 30 seconds. All food gets consumed. Every creature starves. Population hits zero. Game over. Food respawn prevents extinction and creates a dynamic equilibrium.

## The Fix: Respawn Timer Array
Add \`int food_timer[MAX_FOOD]\` initialized to 0. When food is eaten, set timer to 180. Each frame, decrement inactive food timers. At zero, respawn at random position.

## Your Task
Add food respawn timers. When eaten, food waits 180 frames (3 seconds) then reappears at a random location.

Expected output:
\`\`\`
Population: 50
Respawn: 3s
Cycle: food
\`\`\`

Click **Run** — food dots disappear when eaten, then pop back at new locations after 3 seconds. The population stabilizes instead of going extinct.

## Beginner Trap
**Setting the timer when food is already inactive.** Only set \`food_timer[f] = 180\` at the moment of eating (when transitioning from active to inactive). If you set it every frame the food is inactive, the timer resets and food never respawns.

## Elite Insight
The equilibrium population is approximately: food_count * (respawn_frames / hunger_to_death_frames). With 20 food, 180-frame respawn, and 500-frame starvation time, the carrying capacity is roughly 20 * (500/180) ≈ 55. Your population of 50 is close to this limit, meaning some creatures will die but most will survive.

## Mastery Check
Question: How would you increase the carrying capacity without adding more food sources?
Answer: Decrease the respawn timer (food comes back faster) or decrease HUNGER_RATE (creatures survive longer between meals). Both increase the ratio of food availability to hunger depletion, supporting more creatures.
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

// TODO 1: Declare food_timer array
// int food_timer[MAX_FOOD];

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
        // TODO 2: Initialize food_timer[i] = 0
    }
    food_count = 20;

    for (int i = 0; i < creature_count; i++) {
        wander_angle[i] = rngFloat() * 6.28f;
        hunger[i] = 0.5f;
        alive[i] = true;
    }

    cout << "Population: " << creature_count << endl;
    cout << "Respawn: 3s" << endl;
    cout << "Cycle: food" << endl;

    while (!WindowShouldClose()) {
        // TODO 3: Update food timers - for each inactive food,
        //   decrement food_timer[f], if <= 0 then respawn:
        //   food_x[f] = rngFloat() * SCREEN_W;
        //   food_y[f] = rngFloat() * SCREEN_H;
        //   food_active[f] = true;

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
                // TODO 4: Set food_timer[best_food] = 180
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
        snprintf(hud, 64, "AI Sandbox L8 | Alive: %d", alive_count);
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
    cout << "Respawn: 3s" << endl;
    cout << "Cycle: food" << endl;

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
        snprintf(hud, 64, "AI Sandbox L8 | Alive: %d", alive_count);
        DrawText(hud, 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Respawn delay is 3s", expectedOutput: "Respawn: 3s" },
      { id: "g3", description: "Food cycle active", expectedOutput: "Cycle: food" },
    ],
    hints: [
      "Uncomment the food_timer array. Initialize food_timer[i] = 0 for each food in the setup loop (they start active, so timer is 0).",
      "Add a food timer update loop before the creature loop: for each inactive food, decrement its timer. If timer <= 0, respawn at random position and set active.",
      "When food is eaten (best_dist < 10.0f), add food_timer[best_food] = 180 after setting food_active[best_food] = false. The respawn loop handles the rest.",
    ],
    estimatedMinutes: 15,
  },
};