import type { Lesson } from "@/types/lesson";

export const lessonAISandbox5: Lesson = {
  id: "aisandbox-5-wander-behavior",
  title: "Wander Behavior",
  description: "Idle creatures wander naturally with a jittered heading circle — organic movement from math.",
  order: 5,
  xpReward: 50,
  tier: "free",
  concepts: ["wander circle", "jittered heading", "noise steering", "idle behavior", "sinf/cosf"],
  part1: {
    title: "Concept: The Wander Circle",
    type: "concept",
    instructions: `
# Wander Behavior

## Mental Model
Your creatures seek food and flock with neighbors. But when no food is nearby, what should they do? Stand still? That looks dead. Move randomly? That looks jittery. Craig Reynolds invented the **wander circle**: project a circle ahead of the creature, pick a random point on the circle, steer toward it. Each frame, jitter the angle slightly. The result is smooth, organic wandering — the creature looks like it is exploring.

## What Breaks Without This
Without wander, creatures with no food target either freeze (zero steering) or continue in a straight line forever. Neither looks alive. Wander gives idle creatures a natural-looking exploration behavior that fills the screen with organic movement.

## The Fix: Wander Circle Technique

\`\`\`cpp
const float WANDER_RADIUS = 30.0f;    // size of the circle
const float WANDER_DISTANCE = 50.0f;  // how far ahead to project it
const float WANDER_JITTER = 0.3f;     // angular noise per frame

float wander_angle[MAX_CREATURES];     // persistent heading per creature

// Each frame:
wander_angle[i] += (rngFloat() - 0.5f) * 2.0f * WANDER_JITTER;

// Project circle center ahead of creature
float speed = sqrtf(cvx[i]*cvx[i] + cvy[i]*cvy[i]);
float heading_x = (speed > 0.01f) ? cvx[i]/speed : 1.0f;
float heading_y = (speed > 0.01f) ? cvy[i]/speed : 0.0f;
float circle_cx = cx[i] + heading_x * WANDER_DISTANCE;
float circle_cy = cy[i] + heading_y * WANDER_DISTANCE;

// Pick point on circle using wander_angle
float target_x = circle_cx + cosf(wander_angle[i]) * WANDER_RADIUS;
float target_y = circle_cy + sinf(wander_angle[i]) * WANDER_RADIUS;

// Steer toward that target
float dx = target_x - cx[i];
float dy = target_y - cy[i];
float dist = sqrtf(dx*dx + dy*dy);
if (dist > 0.01f) {
    cvx[i] += ((dx/dist) * MAX_SPEED - cvx[i]) * STEER_WEIGHT;
    cvy[i] += ((dy/dist) * MAX_SPEED - cvy[i]) * STEER_WEIGHT;
}
\`\`\`

The key: the wander angle is **persistent** and only jitters by a small amount each frame. This creates a smooth, curving path instead of random jerking.

## Key Concepts
- \`cosf(angle)\` and \`sinf(angle)\` place a point on a circle
- The wander circle is projected AHEAD of the creature (WANDER_DISTANCE)
- WANDER_RADIUS controls how much the target can deviate
- WANDER_JITTER controls how fast the angle changes (low = smooth, high = erratic)
- The angle is stored per creature and persists between frames

## Performance Insight
\`sinf()\` and \`cosf()\` cost about 15-25 CPU cycles each. For 50 creatures, that is 100 trig calls per frame (about 0.003ms). Modern CPUs have hardware trig approximation via SIMD. Not a bottleneck until thousands of creatures.

## Memory Insight
One new array: \`float wander_angle[MAX_CREATURES]\` = 2048 bytes (512 floats * 4 bytes). Still trivial. Total simulation memory is now under 16KB — position, velocity, food, and wander angles.

## Your Task
Compute the wander target position for a creature moving right. Print the circle center, the target point, and the angle.

Expected output:
\`\`\`
Circle center: (150, 100)
Wander angle: 45 degrees
Target: (171, 121)
Wander: circle
\`\`\`

## Beginner Trap
**Using random positions instead of a jittered angle.** If you pick a completely random point each frame, the creature zigzags wildly. The wander circle constrains movement to smooth curves by only jittering the persistent angle. Random position = noise. Jittered angle = organic.

## Elite Insight
Reynolds described wander as "the Swiss Army knife of idle behaviors." It works for fish drifting in an aquarium, NPCs patrolling a village, or bacteria in a Petri dish. The wander circle is parameterized: large radius = wide curves, small radius = tight circles, high jitter = erratic, low jitter = lazy drift.

## Systems Thinking Connection
The RPG path uses scripted patrol routes for NPCs. The Platformer uses fixed jump arcs. This path uses emergent wander — no script, no path, just math. Same goal (make entities move believably), radically different approach. Wander is cheaper to author because there is nothing to author.

## Skill Reinforcement
Lesson 3 added seek. Lesson 4 added flocking. This lesson adds wander. By the end, creatures have a complete behavior stack: wander when idle, seek when food is near, flock always. Three behaviors blended creates organic life.

## Mastery Check
Question: Why project the circle ahead of the creature instead of around it?
Answer: If the circle is centered on the creature, the target can be behind it, causing the creature to spin in place. Projecting ahead ensures the target is always in the forward direction, creating smooth forward-biased curves instead of oscillation.
`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    // Creature at (100, 100) moving right at speed 60
    float cx = 100.0f, cy = 100.0f;
    float cvx = 60.0f, cvy = 0.0f;

    float WANDER_DISTANCE = 50.0f;
    float WANDER_RADIUS = 30.0f;
    float wander_angle = 0.785f; // ~45 degrees in radians

    // Step 1: Compute heading (normalize velocity)
    float speed = sqrtf(cvx * cvx + cvy * cvy);
    float hx = cvx / speed;
    float hy = cvy / speed;

    // TODO 1: Compute circle center = position + heading * WANDER_DISTANCE
    float circle_cx = 0.0f;
    float circle_cy = 0.0f;

    // TODO 2: Compute target on circle using cosf/sinf
    // target = circle_center + (cosf(angle) * RADIUS, sinf(angle) * RADIUS)
    float target_x = 0.0f;
    float target_y = 0.0f;

    cout << "Circle center: (" << (int)circle_cx << ", " << (int)circle_cy << ")" << endl;
    cout << "Wander angle: " << (int)(wander_angle * 180.0f / 3.14159f) << " degrees" << endl;
    cout << "Target: (" << (int)target_x << ", " << (int)target_y << ")" << endl;
    cout << "Wander: circle" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float cx = 100.0f, cy = 100.0f;
    float cvx = 60.0f, cvy = 0.0f;

    float WANDER_DISTANCE = 50.0f;
    float WANDER_RADIUS = 30.0f;
    float wander_angle = 0.785f;

    float speed = sqrtf(cvx * cvx + cvy * cvy);
    float hx = cvx / speed;
    float hy = cvy / speed;

    float circle_cx = cx + hx * WANDER_DISTANCE;
    float circle_cy = cy + hy * WANDER_DISTANCE;

    float target_x = circle_cx + cosf(wander_angle) * WANDER_RADIUS;
    float target_y = circle_cy + sinf(wander_angle) * WANDER_RADIUS;

    cout << "Circle center: (" << (int)circle_cx << ", " << (int)circle_cy << ")" << endl;
    cout << "Wander angle: " << (int)(wander_angle * 180.0f / 3.14159f) << " degrees" << endl;
    cout << "Target: (" << (int)target_x << ", " << (int)target_y << ")" << endl;
    cout << "Wander: circle" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Circle center correct", expectedOutput: "Circle center: (150, 100)" },
      { id: "t2", description: "Wander angle is 45 degrees", expectedOutput: "Wander angle: 45 degrees" },
      { id: "t3", description: "Target point computed", expectedOutput: "Target: (171, 121)" },
      { id: "t4", description: "Wander is circle", expectedOutput: "Wander: circle" },
    ],
    hints: [
      "Circle center = position + heading * WANDER_DISTANCE. Since heading is (1, 0) for rightward movement: circle_cx = 100 + 1 * 50 = 150, circle_cy = 100 + 0 * 50 = 100.",
      "Target = circle_center + (cosf(angle) * RADIUS, sinf(angle) * RADIUS). cosf(0.785) is about 0.707, sinf(0.785) is about 0.707. So target_x = 150 + 0.707 * 30 = 171.",
      "circle_cx = cx + hx * WANDER_DISTANCE; circle_cy = cy + hy * WANDER_DISTANCE; target_x = circle_cx + cosf(wander_angle) * WANDER_RADIUS; target_y = circle_cy + sinf(wander_angle) * WANDER_RADIUS;",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Wander + Seek + Flock",
    type: "game_builder",
    instructions: `
# Build: Wander + Seek + Flock

## Mental Model
Your creatures now have a complete behavior stack. When food is nearby (within FLOCK_RADIUS), they seek food and flock with neighbors. When no food is close, they wander with a jittered heading circle and still flock with nearby creatures. The result: organic group movement with purposeful seeking and idle exploration.

## What Breaks Without This
Without wander, creatures that are far from food drift in straight lines forever — or worse, slow to a crawl as seek has nothing to aim at. Wander ensures every creature is always moving with intent, whether exploring or hunting.

## The Fix: Behavior Selection
The logic per creature each frame:
1. Find nearest food and compute distance
2. If food is within FLOCK_RADIUS: apply seek steering
3. If food is beyond FLOCK_RADIUS (or no food): apply wander steering
4. Always apply flock steering (separation + alignment + cohesion)
5. Integrate position, wrap at edges

\`\`\`cpp
// After finding nearest food:
if (best_food >= 0 && best_dist < FLOCK_RADIUS) {
    // Seek food (from L3)
    float dx = food_x[best_food] - cx[i];
    float dy = food_y[best_food] - cy[i];
    float desired_vx = (dx / best_dist) * MAX_SPEED;
    float desired_vy = (dy / best_dist) * MAX_SPEED;
    cvx[i] += (desired_vx - cvx[i]) * STEER_WEIGHT;
    cvy[i] += (desired_vy - cvy[i]) * STEER_WEIGHT;
} else {
    // Wander
    wander_angle[i] += (rngFloat() - 0.5f) * 2.0f * WANDER_JITTER;
    float speed = sqrtf(cvx[i]*cvx[i] + cvy[i]*cvy[i]);
    float hx = (speed > 0.01f) ? cvx[i]/speed : 1.0f;
    float hy = (speed > 0.01f) ? cvy[i]/speed : 0.0f;
    float wcx = cx[i] + hx * WANDER_DISTANCE;
    float wcy = cy[i] + hy * WANDER_DISTANCE;
    float tx = wcx + cosf(wander_angle[i]) * WANDER_RADIUS;
    float ty = wcy + sinf(wander_angle[i]) * WANDER_RADIUS;
    float dx = tx - cx[i];
    float dy = ty - cy[i];
    float d = sqrtf(dx*dx + dy*dy);
    if (d > 0.01f) {
        cvx[i] += ((dx/d)*MAX_SPEED - cvx[i]) * STEER_WEIGHT;
        cvy[i] += ((dy/d)*MAX_SPEED - cvy[i]) * STEER_WEIGHT;
    }
}
\`\`\`

## Your Task
Add the wander behavior to the simulation. Creatures should wander when no food is nearby, seek when food is close, and always flock.

Expected output:
\`\`\`
Population: 50
Wander: circle
Behaviors: seek+flock+wander
\`\`\`

Click **Run** — creatures near food curve toward it in groups. Creatures far from food wander in smooth curves, occasionally drifting near food and switching to seek.

## Beginner Trap
**Applying wander AND seek at the same time.** If both run every frame, they fight each other — the creature oscillates between seeking and wandering. Use if/else: seek when food is near, wander otherwise. The behaviors are mutually exclusive per frame.

## Elite Insight
This three-behavior stack (seek + flock + wander) is the foundation of every RTS unit AI. Warcraft units seek their attack target, flock with their squad, and wander when idle. The weights and radii change, but the architecture is identical to what you just built.

## Mastery Check
Question: Why use FLOCK_RADIUS as the threshold for switching between seek and wander?
Answer: FLOCK_RADIUS (60 pixels) is already the distance at which creatures are aware of neighbors. Using the same radius for food awareness creates consistency — a creature's "awareness bubble" is the same size for both social and food behaviors. This simplifies tuning: one radius controls all local awareness.
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

float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

float food_x[MAX_FOOD], food_y[MAX_FOOD];
bool food_active[MAX_FOOD];
int food_count = 0;

// TODO 1: Declare wander_angle array
// float wander_angle[MAX_CREATURES];

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

    // TODO 2: Initialize wander_angle[i] = rngFloat() * 6.28f for each creature

    cout << "Population: " << creature_count << endl;
    cout << "Wander: circle" << endl;
    cout << "Behaviors: seek+flock+wander" << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
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

            // TODO 3: Change seek to only apply when food is near (best_dist < FLOCK_RADIUS)
            // TODO 4: Add else branch with wander behavior when food is far
            //   - jitter wander_angle[i] += (rngFloat()-0.5f) * 2.0f * WANDER_JITTER
            //   - compute heading from velocity
            //   - project circle center ahead
            //   - compute target on circle with cosf/sinf
            //   - steer toward target
            if (best_food >= 0 && best_dist > 0.01f) {
                float dx = food_x[best_food] - cx[i];
                float dy = food_y[best_food] - cy[i];
                float desired_vx = (dx / best_dist) * MAX_SPEED;
                float desired_vy = (dy / best_dist) * MAX_SPEED;
                cvx[i] += (desired_vx - cvx[i]) * STEER_WEIGHT;
                cvy[i] += (desired_vy - cvy[i]) * STEER_WEIGHT;
            }

            // Flocking (from L4)
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
            DrawCircle((int)cx[i], (int)cy[i], 4, GREEN);
            DrawLine((int)cx[i], (int)cy[i],
                     (int)(cx[i] + cvx[i] * 0.1f),
                     (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);
        }

        DrawText("AI Sandbox L5", 10, 10, 20, WHITE);
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

float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

float food_x[MAX_FOOD], food_y[MAX_FOOD];
bool food_active[MAX_FOOD];
int food_count = 0;

float wander_angle[MAX_CREATURES];

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

    cout << "Population: " << creature_count << endl;
    cout << "Wander: circle" << endl;
    cout << "Behaviors: seek+flock+wander" << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
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
            DrawCircle((int)cx[i], (int)cy[i], 4, GREEN);
            DrawLine((int)cx[i], (int)cy[i],
                     (int)(cx[i] + cvx[i] * 0.1f),
                     (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);
        }

        DrawText("AI Sandbox L5", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Wander is circle", expectedOutput: "Wander: circle" },
      { id: "g3", description: "All three behaviors active", expectedOutput: "Behaviors: seek+flock+wander" },
    ],
    hints: [
      "Uncomment the wander_angle array declaration. Initialize each wander_angle[i] = rngFloat() * 6.28f after spawning creatures. Add the wander constants (WANDER_RADIUS, WANDER_DISTANCE, WANDER_JITTER) at the top.",
      "Change the seek condition from (best_dist > 0.01f) to (best_dist < FLOCK_RADIUS). Add an else branch for wander: jitter the angle, compute heading, project circle center, compute target with cosf/sinf, steer toward target.",
      "In the else (wander) branch: wander_angle[i] += (rngFloat()-0.5f)*2.0f*WANDER_JITTER; compute speed=sqrtf(cvx*cvx+cvy*cvy); heading hx,hy = velocity/speed; circle center = pos + heading*WANDER_DISTANCE; target = center + (cosf(angle)*RADIUS, sinf(angle)*RADIUS); steer toward target.",
    ],
    estimatedMinutes: 20,
  },
};
