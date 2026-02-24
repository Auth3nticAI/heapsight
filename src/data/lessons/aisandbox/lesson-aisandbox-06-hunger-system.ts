import type { Lesson } from "@/types/lesson";

export const lessonAISandbox6: Lesson = {
  id: "aisandbox-6-hunger-system",
  title: "Hunger System",
  description: "Hunger rises over time — eating food resets it. Needs drive behavior.",
  order: 6,
  xpReward: 50,
  tier: "free",
  concepts: ["need system", "hunger float", "depletion rate", "food consumption", "need-driven behavior"],
  part1: {
    title: "Concept: Needs Drive Behavior",
    type: "concept",
    instructions: `
# Hunger System

## Mental Model
Your creatures flock, seek, and wander. But why do they seek food? Right now, they steer toward food because you wrote a seek rule. There is no consequence for ignoring food. No cost. No need. A **need system** changes that. Hunger is a float that rises every frame. When hunger reaches 1.0, something bad happens (next lesson). Eating food resets hunger to 0.0. Now seeking food is not arbitrary — it is survival.

## What Breaks Without This
Without needs, creatures have no motivation. Seek is a reflex, not a drive. There is no urgency, no desperation, no observable change when food runs low. Hunger creates visible pressure — creatures near food are green, creatures far from food turn yellow. You can see starvation approaching.

## The Fix: Hunger Float

\`\`\`cpp
const float HUNGER_RATE = 0.002f; // per frame
float hunger[MAX_CREATURES];       // 0.0 = full, 1.0 = starving

// Each frame:
hunger[i] += HUNGER_RATE;
if (hunger[i] > 1.0f) hunger[i] = 1.0f;

// When creature is within 10px of food:
hunger[i] = 0.0f;
food_active[f] = false; // food consumed
\`\`\`

The hunger value drives color: \`Color c = { (unsigned char)(hunger[i] * 255), 255, 0, 255 };\` lerps from GREEN (0,255,0) to YELLOW (255,255,0).

## Key Concepts
- Hunger is a float: 0.0 = full, 1.0 = starving
- HUNGER_RATE = 0.002f per frame (reaches 1.0 in ~500 frames = ~8 seconds)
- Eating resets hunger to 0.0 and deactivates the food
- Proximity threshold: 10 pixels from food center
- Color lerp visualizes internal state

## Performance Insight
One addition per creature per frame for hunger. One comparison for eating. The proximity check (distance < 10) reuses the same sqrtf already computed for seek. Zero additional cost.

## Memory Insight
One new array: \`float hunger[MAX_CREATURES]\` = 2048 bytes. Total simulation memory is now under 20KB.

## Your Task
Simulate hunger rising over 100 frames and eating food at frame 50. Print the hunger values at key points.

Expected output:
\`\`\`
Frame 0: hunger = 0.000
Frame 49: hunger = 0.098
Ate food at frame 50
Frame 50: hunger = 0.000
Frame 100: hunger = 0.100
Need: hunger
\`\`\`

## Beginner Trap
**Setting hunger to 0.0 every frame instead of accumulating.** Hunger must persist between frames. Each frame adds HUNGER_RATE to the existing value. Resetting to 0 every frame means the creature is never hungry.

## Elite Insight
Utility AI scores every possible action by evaluating need curves. Hunger at 0.8 makes eating score 0.9. Hunger at 0.1 makes eating score 0.2. The creature does not decide to eat — the math decides. This is the foundation of The Sims AI, where eight needs (hunger, fun, hygiene, etc.) each produce a utility score, and the Sim picks the highest.

## Systems Thinking Connection
The RPG path tracks player HP — a need that decreases when hit. The Shooter tracks lives — a need that decreases on death. Hunger is the same pattern: a resource that depletes over time, driving the agent to act before it runs out.

## Skill Reinforcement
Lesson 5 added wander for idle movement. This lesson adds hunger as a motivation system. Lesson 7 adds death when hunger reaches 1.0. Together, these create a survival loop: eat or die.

## Mastery Check
Question: Why use a continuous float (0.0 to 1.0) instead of an integer health counter?
Answer: A continuous float enables smooth color interpolation, proportional urgency (hunger at 0.9 is more urgent than 0.3), and utility scoring. An integer counter is discrete — HP 3 vs HP 2 does not convey urgency. Floats are the language of need systems.
`,
    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

const float HUNGER_RATE = 0.002f;

int main() {
    float hunger = 0.0f;

    for (int frame = 0; frame <= 100; frame++) {
        if (frame == 0) {
            cout << fixed << setprecision(3);
            cout << "Frame 0: hunger = " << hunger << endl;
        }

        // TODO 1: Add HUNGER_RATE to hunger each frame

        // TODO 2: At frame 50, print "Ate food at frame 50" and reset hunger to 0.0

        if (frame == 49) {
            cout << "Frame 49: hunger = " << hunger << endl;
        }
        if (frame == 50) {
            cout << "Frame 50: hunger = " << hunger << endl;
        }
        if (frame == 100) {
            cout << "Frame 100: hunger = " << hunger << endl;
        }
    }
    cout << "Need: hunger" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <iomanip>
using namespace std;

const float HUNGER_RATE = 0.002f;

int main() {
    float hunger = 0.0f;

    for (int frame = 0; frame <= 100; frame++) {
        if (frame == 0) {
            cout << fixed << setprecision(3);
            cout << "Frame 0: hunger = " << hunger << endl;
        }

        hunger += HUNGER_RATE;

        if (frame == 50) {
            cout << "Ate food at frame 50" << endl;
            hunger = 0.0f;
        }

        if (frame == 49) {
            cout << "Frame 49: hunger = " << hunger << endl;
        }
        if (frame == 50) {
            cout << "Frame 50: hunger = " << hunger << endl;
        }
        if (frame == 100) {
            cout << "Frame 100: hunger = " << hunger << endl;
        }
    }
    cout << "Need: hunger" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Frame 0 hunger is zero", expectedOutput: "Frame 0: hunger = 0.000" },
      { id: "t2", description: "Frame 49 hunger accumulated", expectedOutput: "Frame 49: hunger = ", isPattern: true },
      { id: "t3", description: "Ate food at frame 50", expectedOutput: "Ate food at frame 50" },
      { id: "t4", description: "Hunger reset after eating", expectedOutput: "Frame 50: hunger = 0.000" },
      { id: "t5", description: "Need is hunger", expectedOutput: "Need: hunger" },
    ],
    hints: [
      "Add hunger += HUNGER_RATE; inside the loop, before the frame checks.",
      "At frame 50, print the message and then set hunger = 0.0f. The order matters: print Ate food first, then reset.",
      "The eating check should be: if (frame == 50) { cout << Ate food...; hunger = 0.0f; }. After reset, frame 50 prints hunger = 0.000.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Hunger-Driven Ecosystem",
    type: "game_builder",
    instructions: `
# Build: Hunger-Driven Ecosystem

## Mental Model
Your creatures now have a need. Hunger rises every frame. Green creatures are well-fed. Yellow creatures are starving. When a creature gets within 10 pixels of food, it eats — hunger resets to zero, food disappears. Watch the color gradient shift as the simulation runs: green clusters near food, yellow drifters far from any source.

## What Breaks Without This
Without hunger, food has no purpose. Creatures seek it but nothing happens when they reach it. The seek behavior is disconnected from consequence. Hunger connects behavior to outcome: seek food → eat → survive.

## The Fix: Hunger Array + Eating Logic
Three changes to the simulation:
1. Add \`float hunger[MAX_CREATURES]\` initialized to 0.5f
2. Each frame: \`hunger[i] += HUNGER_RATE\` (capped at 1.0)
3. When creature is within 10px of food: reset hunger, deactivate food

Color lerp: \`Color c = { (unsigned char)(hunger[i] * 255), 255, 0, 255 };\`
- hunger=0: (0, 255, 0) = GREEN
- hunger=1: (255, 255, 0) = YELLOW

## Your Task
Add the hunger system to your simulation. Creatures accumulate hunger each frame. They eat food when close enough (within 10 pixels). Color reflects hunger level.

Expected output:
\`\`\`
Population: 50
Need: hunger
Food: 20
\`\`\`

Click **Run** — watch creatures near food stay green while distant creatures turn progressively yellow.

## Beginner Trap
**Checking food distance separately from the seek loop.** The seek loop already computes distance to every food source. Reuse \`best_dist\` — if \`best_dist < 10.0f\`, the creature eats. Do not add a second distance calculation loop.

## Elite Insight
The Sims uses eight need bars. Each need depletes at different rates. The AI picks the action with the highest utility score — utility(eat) = hunger * food_quality. Your single hunger need is the first step toward a full utility AI.

## Mastery Check
Question: Why initialize hunger to 0.5f instead of 0.0f?
Answer: Starting at 0.5 means creatures begin moderately hungry. This creates immediate visual variety (some yellow, some green) and makes seeking food urgent from the first frame. Starting at 0.0 would mean 4 seconds of all-green before any color differentiation.
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

// TODO 1: Declare hunger array
// float hunger[MAX_CREATURES];

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
    }

    // TODO 2: Initialize hunger[i] = 0.5f for each creature

    cout << "Population: " << creature_count << endl;
    cout << "Need: hunger" << endl;
    cout << "Food: " << food_count << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
            // TODO 3: Increase hunger[i] by HUNGER_RATE, cap at 1.0f

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

            // TODO 4: If best_dist < 10.0f, eat the food
            //   hunger[i] = 0.0f;
            //   food_active[best_food] = false;

            // Seek when food is near, wander when far
            if (best_food >= 0 && best_dist < FLOCK_RADIUS) {
                float dx = food_x[best_food] - cx[i];
                float dy = food_y[best_food] - cy[i];
                float desired_vx = (dx / best_dist) * MAX_SPEED;
                float desired_vy = (dy / best_dist) * MAX_SPEED;
                cvx[i] += (desired_vx - cvx[i]) * STEER_WEIGHT;
                cvy[i] += (desired_vy - cvy[i]) * STEER_WEIGHT;
            } else {
                // Wander
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
            // TODO 5: Replace GREEN with color based on hunger
            // Color c = { (unsigned char)(hunger[i] * 255), 255, 0, 255 };
            DrawCircle((int)cx[i], (int)cy[i], 4, GREEN);
            DrawLine((int)cx[i], (int)cy[i],
                     (int)(cx[i] + cvx[i] * 0.1f),
                     (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);
        }

        DrawText("AI Sandbox L6", 10, 10, 20, WHITE);
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
    }

    cout << "Population: " << creature_count << endl;
    cout << "Need: hunger" << endl;
    cout << "Food: " << food_count << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
            hunger[i] += HUNGER_RATE;
            if (hunger[i] > 1.0f) hunger[i] = 1.0f;

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
                // Wander
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
            Color c = { (unsigned char)(hunger[i] * 255), 255, 0, 255 };
            DrawCircle((int)cx[i], (int)cy[i], 4, c);
            DrawLine((int)cx[i], (int)cy[i],
                     (int)(cx[i] + cvx[i] * 0.1f),
                     (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);
        }

        DrawText("AI Sandbox L6", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Need is hunger", expectedOutput: "Need: hunger" },
      { id: "g3", description: "Food count is 20", expectedOutput: "Food: 20" },
    ],
    hints: [
      "Uncomment the hunger array declaration. In the creature spawn loop, add hunger[i] = 0.5f for each creature.",
      "Add hunger[i] += HUNGER_RATE at the start of the per-creature loop. Cap it: if (hunger[i] > 1.0f) hunger[i] = 1.0f. After finding nearest food, check if best_dist < 10.0f to eat.",
      "Eating: if (best_food >= 0 && best_dist < 10.0f) { hunger[i] = 0.0f; food_active[best_food] = false; }. For color: Color c = { (unsigned char)(hunger[i] * 255), 255, 0, 255 }; and use c instead of GREEN.",
    ],
    estimatedMinutes: 15,
  },
};