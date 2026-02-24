import type { Lesson } from "@/types/lesson";

export const lessonAISandbox3: Lesson = {
  id: "aisandbox-3-seek-behavior",
  title: "Seek Behavior",
  description: "Creatures steer toward nearest food — Reynolds steering brings direction to random motion.",
  order: 3,
  xpReward: 50,
  tier: "free",
  concepts: ["steering vectors", "seek behavior", "sqrtf normalization", "atan2f", "Reynolds formula"],
  part1: {
    title: "Concept: Steering Vectors",
    type: "concept",
    instructions: `
# Seek Behavior

## Mental Model
Your creatures drift randomly. They have velocity but no purpose. A creature with seek behavior computes a steering vector toward its target, blends it with its current velocity, and curves toward the goal. The creature does not teleport — it steers. This is the difference between AI and a goto statement.

## What Breaks Without This
Without steering, creatures wander aimlessly forever. Food sits untouched. The simulation has no direction, no interaction, no interesting dynamics. Steering is what connects creatures to their environment.

## The Fix: Reynolds Seek Formula
Craig Reynolds defined seek in 1999:

\`\`\`cpp
// desired velocity = normalize(target - position) * max_speed
float dx = target_x - cx[i];
float dy = target_y - cy[i];
float dist = sqrtf(dx * dx + dy * dy);
if (dist > 0.01f) {
    float desired_vx = (dx / dist) * MAX_SPEED;
    float desired_vy = (dy / dist) * MAX_SPEED;
    // steering = desired - current
    float steer_x = (desired_vx - cvx[i]) * STEER_WEIGHT;
    float steer_y = (desired_vy - cvy[i]) * STEER_WEIGHT;
    cvx[i] += steer_x;
    cvy[i] += steer_y;
}
\`\`\`

The key insight: steering is the difference between where you WANT to go and where you ARE going. A small weight (0.05) makes the turn gradual — the creature curves, not snaps.

## Key Concepts
- \`sqrtf(dx*dx + dy*dy)\` computes Euclidean distance
- Normalization: divide by distance to get a unit vector
- Desired velocity points at target with magnitude MAX_SPEED
- Steering = desired - current (Reynolds formula)
- Weight controls turn sharpness (0.01 = lazy, 0.1 = snappy)
- \`atan2f(dy, dx)\` gives heading angle in radians — useful for debug output

## Performance Insight
\`sqrtf()\` costs about 10-20 CPU cycles. For 50 creatures each checking 20 food sources, that is 1000 sqrtf calls per frame — about 0.02ms on modern hardware. Not a bottleneck. In Lesson 10, when you have 200+ creatures, you will use spatial partitioning to reduce these checks.

## Memory Insight
Food adds 64 floats for x, 64 for y, 64 bools for active = 576 bytes. Still well within L1 cache. The steering computation uses only stack temporaries — no heap allocation.

## Your Task
Compute the seek steering vector from a creature at (100, 100) toward food at (300, 200). Print the distance, the normalized direction, and the steering angle.

Expected output:
\`\`\`
Distance: 223
Direction: (0.89, 0.44)
Angle: 26 degrees
Steering: seek
\`\`\`

## Beginner Trap
**Forgetting the distance check.** If the creature is exactly on top of the food (distance = 0), dividing by zero produces NaN. The \`if (dist > 0.01f)\` guard prevents this. Always check before normalizing.

## Elite Insight
Reynolds' original 1999 paper defined three steering behaviors: seek, flee, and arrive. Seek always applies maximum force toward the target. Arrive reduces force as you approach (to prevent overshooting). Flee is seek with reversed sign. All three use the same normalize-and-subtract formula.

## Systems Thinking Connection
The Platformer path uses simple velocity assignment for movement: press right, vx = speed. This path uses steering vectors: the creature has inertia and turns gradually. Same problem (move toward target), fundamentally different feel. Steering creates organic, lifelike motion.

## Skill Reinforcement
Lesson 2 gave creatures wrapping. This lesson gives creatures purpose. Lesson 4 adds flocking — creatures that steer toward food AND coordinate with neighbors. Each behavior layer builds on the seek formula you learn here.

## Mastery Check
Question: Why multiply the steering force by a small weight instead of applying it directly?
Answer: Without a weight, the creature snaps instantly to the desired velocity — it teleports in direction. The weight (0.05) means only 5% of the desired change is applied per frame. Over many frames, the creature curves smoothly toward the target. This is what makes steering look organic.
`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float creature_x = 100.0f, creature_y = 100.0f;
    float food_x = 300.0f, food_y = 200.0f;

    float dx = food_x - creature_x;
    float dy = food_y - creature_y;

    // TODO 1: Compute distance using sqrtf(dx * dx + dy * dy)
    float dist = 0.0f;

    // TODO 2: Normalize direction (divide dx,dy by dist)
    float dir_x = 0.0f;
    float dir_y = 0.0f;

    // TODO 3: Compute angle using atan2f(dy, dx), convert to degrees
    // Degrees = angle * 180.0f / 3.14159f
    float angle_deg = 0.0f;

    cout << "Distance: " << (int)dist << endl;
    cout << "Direction: (" << (int)(dir_x * 100) / 100.0f
         << ", " << (int)(dir_y * 100) / 100.0f << ")" << endl;
    cout << "Angle: " << (int)angle_deg << " degrees" << endl;
    cout << "Steering: seek" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float creature_x = 100.0f, creature_y = 100.0f;
    float food_x = 300.0f, food_y = 200.0f;

    float dx = food_x - creature_x;
    float dy = food_y - creature_y;

    float dist = sqrtf(dx * dx + dy * dy);

    float dir_x = dx / dist;
    float dir_y = dy / dist;

    float angle_rad = atan2f(dy, dx);
    float angle_deg = angle_rad * 180.0f / 3.14159f;

    cout << "Distance: " << (int)dist << endl;
    cout << "Direction: (" << (int)(dir_x * 100) / 100.0f
         << ", " << (int)(dir_y * 100) / 100.0f << ")" << endl;
    cout << "Angle: " << (int)angle_deg << " degrees" << endl;
    cout << "Steering: seek" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Distance is 223", expectedOutput: "Distance: 223" },
      { id: "t2", description: "Direction vector printed", expectedOutput: "Direction: (0.89, 0.44)" },
      { id: "t3", description: "Angle is 26 degrees", expectedOutput: "Angle: 26 degrees" },
      { id: "t4", description: "Steering is seek", expectedOutput: "Steering: seek" },
    ],
    hints: [
      "The distance formula is sqrtf(dx * dx + dy * dy). dx = 200, dy = 100, so dist = sqrtf(50000).",
      "To normalize: dir_x = dx / dist, dir_y = dy / dist. This gives a unit vector pointing from creature to food.",
      "angle_deg = atan2f(dy, dx) * 180.0f / 3.14159f. atan2f(100, 200) is about 0.4636 radians = 26 degrees.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Creatures Seek Food",
    type: "game_builder",
    instructions: `
# Build: Creatures Seek Food

## Mental Model
Food appears as yellow dots scattered across the world. Each creature finds the nearest active food source and steers toward it using the Reynolds seek formula. The creatures curve, not snap. Velocity indicators show steering direction in real time. The world has purpose now.

## What Breaks Without This
Without food and seek, creatures drift randomly forever. No interaction, no convergence, no emergent patterns. Food creates goals. Seek creates directed movement. Together they give the simulation its first real behavior.

## The Fix: Nearest Food + Seek Steering
Each frame, for each creature:
1. Find the nearest active food source
2. Compute desired velocity toward it (normalize * MAX_SPEED)
3. Compute steering force (desired - current) * STEER_WEIGHT
4. Apply steering to velocity

\`\`\`cpp
float best_dist = 999999.0f;
int best_food = -1;
for (int f = 0; f < food_count; f++) {
    if (!food_active[f]) continue;
    float dx = food_x[f] - cx[i];
    float dy = food_y[f] - cy[i];
    float d = sqrtf(dx * dx + dy * dy);
    if (d < best_dist) { best_dist = d; best_food = f; }
}
if (best_food >= 0 && best_dist > 0.01f) {
    float dx = food_x[best_food] - cx[i];
    float dy = food_y[best_food] - cy[i];
    float desired_vx = (dx / best_dist) * MAX_SPEED;
    float desired_vy = (dy / best_dist) * MAX_SPEED;
    cvx[i] += (desired_vx - cvx[i]) * STEER_WEIGHT;
    cvy[i] += (desired_vy - cvy[i]) * STEER_WEIGHT;
}
\`\`\`

## Your Task
Add food arrays and seek steering to the simulation. Spawn 20 food sources. Each creature finds and steers toward its nearest food.

Expected output:
\`\`\`
Population: 50
Food: 20
Steering: seek
\`\`\`

Click **Run** — creatures should curve toward yellow dots instead of drifting randomly.

## Beginner Trap
**Normalizing with the wrong distance.** After finding the best food, you must recompute dx/dy OR reuse the stored best_dist. Do not normalize with a distance from a different food source.

## Elite Insight
This is the exact algorithm used in RTS games for unit movement. StarCraft's zerglings seek toward their attack target using a steering vector. The weight controls how quickly they turn — a high weight makes them responsive, a low weight makes them drift wide on curves.

## Mastery Check
Question: Why search for the nearest food instead of a random one?
Answer: Nearest-food seek creates natural convergence — creatures cluster around food sources, creating visible patterns. Random-food seek would create chaotic, unrealistic movement with creatures constantly changing direction.
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

float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

// TODO 1: Declare food arrays
// float food_x[MAX_FOOD], food_y[MAX_FOOD];
// bool food_active[MAX_FOOD];
// int food_count = 0;

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

    // TODO 2: Spawn 20 food sources at random positions
    // Set food_active[i] = true for each

    cout << "Population: " << creature_count << endl;
    // TODO 3: Print food count and steering type
    // cout << "Food: " << food_count << endl;
    // cout << "Steering: seek" << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
            // TODO 4: Find nearest active food source
            // Loop over all food, compute distance with sqrtf, track best

            // TODO 5: Apply seek steering toward nearest food
            // desired_vx = (dx / best_dist) * MAX_SPEED
            // steer = (desired - current) * STEER_WEIGHT

            cx[i] += cvx[i] * FIXED_DT;
            cy[i] += cvy[i] * FIXED_DT;
            if (cx[i] < 0) cx[i] += SCREEN_W;
            if (cx[i] >= SCREEN_W) cx[i] -= SCREEN_W;
            if (cy[i] < 0) cy[i] += SCREEN_H;
            if (cy[i] >= SCREEN_H) cy[i] -= SCREEN_H;
        }

        BeginDrawing();
        ClearBackground({20, 25, 20, 255});

        // TODO 6: Draw food as YELLOW circles (radius 3)
        // for (int f = 0; f < food_count; f++)
        //     if (food_active[f])
        //         DrawCircle((int)food_x[f], (int)food_y[f], 3, YELLOW);

        for (int i = 0; i < creature_count; i++) {
            DrawCircle((int)cx[i], (int)cy[i], 4, GREEN);
            DrawLine((int)cx[i], (int)cy[i],
                     (int)(cx[i] + cvx[i] * 0.1f),
                     (int)(cy[i] + cvy[i] * 0.1f), DARKGREEN);
        }

        DrawText("AI Sandbox L3", 10, 10, 20, WHITE);
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

float cx[MAX_CREATURES], cy[MAX_CREATURES];
float cvx[MAX_CREATURES], cvy[MAX_CREATURES];
int creature_count = 0;

float food_x[MAX_FOOD], food_y[MAX_FOOD];
bool food_active[MAX_FOOD];
int food_count = 0;

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

    cout << "Population: " << creature_count << endl;
    cout << "Food: " << food_count << endl;
    cout << "Steering: seek" << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
            float best_dist = 999999.0f;
            int best_food = -1;
            for (int f = 0; f < food_count; f++) {
                if (!food_active[f]) continue;
                float dx = food_x[f] - cx[i];
                float dy = food_y[f] - cy[i];
                float d = sqrtf(dx * dx + dy * dy);
                if (d < best_dist) { best_dist = d; best_food = f; }
            }
            if (best_food >= 0 && best_dist > 0.01f) {
                float dx = food_x[best_food] - cx[i];
                float dy = food_y[best_food] - cy[i];
                float desired_vx = (dx / best_dist) * MAX_SPEED;
                float desired_vy = (dy / best_dist) * MAX_SPEED;
                cvx[i] += (desired_vx - cvx[i]) * STEER_WEIGHT;
                cvy[i] += (desired_vy - cvy[i]) * STEER_WEIGHT;
            }

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

        DrawText("AI Sandbox L3", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Food count is 20", expectedOutput: "Food: 20" },
      { id: "g3", description: "Steering is seek", expectedOutput: "Steering: seek" },
    ],
    hints: [
      "Uncomment the food array declarations (food_x, food_y, food_active, food_count) and the food spawning loop. Spawn 20 food sources with rngFloat() * SCREEN_W and rngFloat() * SCREEN_H.",
      "For nearest food: loop over all food, compute sqrtf(dx*dx + dy*dy), track the index and distance of the closest active food. Remember to skip inactive food with if (!food_active[f]) continue.",
      "For seek steering: desired_vx = (dx / best_dist) * MAX_SPEED. Then cvx[i] += (desired_vx - cvx[i]) * STEER_WEIGHT. Same for y. This gradually turns the creature toward the food.",
    ],
    estimatedMinutes: 15,
  },
};
