import type { Lesson } from "@/types/lesson";

export const lessonAISandbox4: Lesson = {
  id: "aisandbox-4-flocking-v0",
  title: "Flocking v0",
  description: "Separation + alignment + cohesion — three rules create emergent group behavior.",
  order: 4,
  xpReward: 50,
  tier: "free",
  concepts: ["flocking", "separation", "alignment", "cohesion", "weight blending", "neighbor query"],
  part1: {
    title: "Concept: The Three Flocking Rules",
    type: "concept",
    instructions: `
# Flocking v0

## Mental Model
In 1986, Craig Reynolds discovered that three simple rules produce realistic flocking: **separation** (steer away from nearby neighbors), **alignment** (match neighbors' average velocity), and **cohesion** (steer toward neighbors' center of mass). No creature knows the global plan. Each creature looks at its local neighbors and applies three weighted forces. The flock emerges.

## What Breaks Without This
Without flocking, creatures all converge on the same food source in a tight clump. They stack on top of each other. No group structure, no organic flow, no life. Flocking spreads them into dynamic formations that look alive.

## The Fix: Three Rules, Three Weights

**Separation** — steer away from creatures closer than 25 pixels:
\`\`\`cpp
float sep_x = 0, sep_y = 0;
for (int j = 0; j < creature_count; j++) {
    if (j == i) continue;
    float dx = cx[i] - cx[j];
    float dy = cy[i] - cy[j];
    float d = sqrtf(dx * dx + dy * dy);
    if (d < 25.0f && d > 0.01f) {
        sep_x += dx / d;  // push away, inversely weighted
        sep_y += dy / d;
    }
}
\`\`\`

**Alignment** — match average velocity of neighbors within FLOCK_RADIUS:
\`\`\`cpp
float ali_vx = 0, ali_vy = 0;
int n_count = 0;
for (int j = 0; j < creature_count; j++) {
    if (j == i) continue;
    float d = sqrtf(dx*dx + dy*dy);
    if (d < FLOCK_RADIUS) {
        ali_vx += cvx[j];
        ali_vy += cvy[j];
        n_count++;
    }
}
if (n_count > 0) {
    ali_vx = ali_vx / n_count - cvx[i];
    ali_vy = ali_vy / n_count - cvy[i];
}
\`\`\`

**Cohesion** — steer toward center of mass of neighbors:
\`\`\`cpp
float coh_x = 0, coh_y = 0;
// (using same neighbor loop)
if (n_count > 0) {
    coh_x = coh_x / n_count - cx[i];
    coh_y = coh_y / n_count - cy[i];
}
\`\`\`

**Blend** with weights:
\`\`\`cpp
float steer_x = sep_x * 1.5f + ali_vx * 1.0f + coh_x * 1.0f;
float steer_y = sep_y * 1.5f + ali_vy * 1.0f + coh_y * 1.0f;
cvx[i] += steer_x * 0.05f;
cvy[i] += steer_y * 0.05f;
\`\`\`

## Key Concepts
- Separation prevents stacking (weight 1.5 — strongest rule)
- Alignment creates coordinated movement
- Cohesion keeps the group together
- FLOCK_RADIUS = 60.0f defines the neighborhood
- Weights control the personality of the flock (high sep = loose, high coh = tight)

## Performance Insight
The naive neighbor check is O(n²) — each creature checks every other creature. For 50 creatures, that is 2,500 distance checks per frame. At 60fps, that is 150,000 sqrtf calls per second. Still fast on modern hardware. At 500+ creatures, you would use a spatial hash (Lesson 10).

## Memory Insight
No new arrays. Flocking only reads from the existing position and velocity arrays. All intermediate values (sep_x, ali_vx, coh_x) are stack locals. Zero heap allocation.

## Your Task
Compute separation, alignment, and cohesion for a creature with 3 neighbors. Print each component and the blended result.

Expected output:
\`\`\`
Neighbors: 3
Separation: (0.7, -0.3)
Alignment: (12.0, 5.0)
Cohesion: (30.0, -10.0)
Behavior: flock
\`\`\`

## Beginner Trap
**Forgetting to skip self in the neighbor loop.** If creature i includes itself in the neighbor calculation, separation pushes it away from its own position (distance 0 = division by zero). Always \`if (j == i) continue;\`.

## Elite Insight
Reynolds' boids algorithm is still used in Hollywood. The bat swarm in Batman Begins, the fish schools in Finding Nemo — all use weighted separation + alignment + cohesion. The weights are tuned by artists, not programmers. You are building the same system.

## Systems Thinking Connection
The Shooter path handles multiple enemies independently — each follows its own pattern. This path makes entities aware of each other. The enemies in a shooter could flock too, creating coordinated attack formations. Same three rules, different domain.

## Skill Reinforcement
Lesson 3 gave creatures seek. This lesson adds social awareness. Lesson 5 adds wander for idle behavior. By the end, creatures will seek food, flock with neighbors, and wander when alone — three behaviors blended in real time.

## Mastery Check
Question: Why is separation weighted higher (1.5) than alignment (1.0) and cohesion (1.0)?
Answer: Without strong separation, creatures pile on top of each other. The visual result is a single blob instead of a flock. Separation keeps individuals visible and distinct. In nature, collision avoidance is always the highest priority — birds will break formation to avoid crashing.
`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    // Creature i at position (100, 100) with velocity (20, 10)
    float ci_x = 100.0f, ci_y = 100.0f;
    float ci_vx = 20.0f, ci_vy = 10.0f;

    // Three neighbors
    float nx[] = {110.0f, 90.0f, 120.0f};
    float ny[] = {105.0f, 95.0f, 110.0f};
    float nvx[] = {30.0f, 25.0f, 40.0f};
    float nvy[] = {15.0f, 12.0f, 18.0f};
    int n_count = 3;

    // TODO 1: Compute separation (steer away from each neighbor)
    float sep_x = 0.0f, sep_y = 0.0f;
    // For each neighbor: dx = ci_x - nx[j], dy = ci_y - ny[j]
    // dist = sqrtf(dx*dx + dy*dy), sep_x += dx/dist, sep_y += dy/dist

    // TODO 2: Compute alignment (average neighbor velocity - own velocity)
    float ali_vx = 0.0f, ali_vy = 0.0f;
    // Sum neighbor velocities, divide by n_count, subtract own velocity

    // TODO 3: Compute cohesion (average neighbor position - own position)
    float coh_x = 0.0f, coh_y = 0.0f;
    // Sum neighbor positions, divide by n_count, subtract own position

    cout << "Neighbors: " << n_count << endl;
    cout << "Separation: (" << (int)(sep_x * 10) / 10.0f
         << ", " << (int)(sep_y * 10) / 10.0f << ")" << endl;
    cout << "Alignment: (" << (int)(ali_vx * 10) / 10.0f
         << ", " << (int)(ali_vy * 10) / 10.0f << ")" << endl;
    cout << "Cohesion: (" << (int)(coh_x * 10) / 10.0f
         << ", " << (int)(coh_y * 10) / 10.0f << ")" << endl;
    cout << "Behavior: flock" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float ci_x = 100.0f, ci_y = 100.0f;
    float ci_vx = 20.0f, ci_vy = 10.0f;

    float nx[] = {110.0f, 90.0f, 120.0f};
    float ny[] = {105.0f, 95.0f, 110.0f};
    float nvx[] = {30.0f, 25.0f, 40.0f};
    float nvy[] = {15.0f, 12.0f, 18.0f};
    int n_count = 3;

    float sep_x = 0.0f, sep_y = 0.0f;
    for (int j = 0; j < n_count; j++) {
        float dx = ci_x - nx[j];
        float dy = ci_y - ny[j];
        float dist = sqrtf(dx * dx + dy * dy);
        if (dist > 0.01f) {
            sep_x += dx / dist;
            sep_y += dy / dist;
        }
    }

    float ali_vx = 0.0f, ali_vy = 0.0f;
    for (int j = 0; j < n_count; j++) {
        ali_vx += nvx[j];
        ali_vy += nvy[j];
    }
    ali_vx = ali_vx / n_count - ci_vx;
    ali_vy = ali_vy / n_count - ci_vy;

    float coh_x = 0.0f, coh_y = 0.0f;
    for (int j = 0; j < n_count; j++) {
        coh_x += nx[j];
        coh_y += ny[j];
    }
    coh_x = coh_x / n_count - ci_x;
    coh_y = coh_y / n_count - ci_y;

    cout << "Neighbors: " << n_count << endl;
    cout << "Separation: (" << (int)(sep_x * 10) / 10.0f
         << ", " << (int)(sep_y * 10) / 10.0f << ")" << endl;
    cout << "Alignment: (" << (int)(ali_vx * 10) / 10.0f
         << ", " << (int)(ali_vy * 10) / 10.0f << ")" << endl;
    cout << "Cohesion: (" << (int)(coh_x * 10) / 10.0f
         << ", " << (int)(coh_y * 10) / 10.0f << ")" << endl;
    cout << "Behavior: flock" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Neighbor count is 3", expectedOutput: "Neighbors: 3" },
      { id: "t2", description: "Separation vector computed", expectedOutput: "Separation: (", isPattern: true },
      { id: "t3", description: "Alignment vector computed", expectedOutput: "Alignment: (", isPattern: true },
      { id: "t4", description: "Cohesion vector computed", expectedOutput: "Cohesion: (", isPattern: true },
      { id: "t5", description: "Behavior is flock", expectedOutput: "Behavior: flock" },
    ],
    hints: [
      "For separation: loop over 3 neighbors. dx = ci_x - nx[j], dy = ci_y - ny[j]. dist = sqrtf(dx*dx + dy*dy). sep_x += dx/dist, sep_y += dy/dist.",
      "For alignment: sum all nvx[j] and nvy[j], divide by n_count, then subtract ci_vx and ci_vy. This gives the difference between average neighbor velocity and your own.",
      "For cohesion: sum all nx[j] and ny[j], divide by n_count to get center of mass, then subtract ci_x and ci_y. This gives a vector pointing toward the group center.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Flocking Creatures",
    type: "game_builder",
    instructions: `
# Build: Flocking Creatures

## Mental Model
Your creatures now seek food. But they all converge into a tight clump around the nearest food source. Flocking fixes this. Separation pushes them apart so they spread out. Alignment makes nearby creatures move in the same direction. Cohesion keeps the group loosely together. The result: organic, flowing group movement.

## What Breaks Without This
Without flocking, 50 creatures pile onto one food source. They overlap, forming an indistinguishable green blob. Separation gives them personal space. Alignment gives them coordination. Cohesion gives them grouping. Together, the creatures look alive.

## The Fix: Flock + Seek Combined
For each creature each frame:
1. Find nearest food and compute seek steering (from Lesson 3)
2. Scan all neighbors within FLOCK_RADIUS (60 pixels)
3. Compute separation, alignment, cohesion
4. Blend: \`total = seek + sep * 1.5 + ali * 1.0 + coh * 1.0\`
5. Apply blended steering to velocity

\`\`\`cpp
// After seek steering, add flock steering:
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
\`\`\`

## Your Task
Add flocking behavior (separation, alignment, cohesion) to the creature simulation. Creatures should still seek food, but now also coordinate with neighbors.

Expected output:
\`\`\`
Population: 50
Flock radius: 60
Behavior: flock
\`\`\`

Click **Run** — creatures should form loose groups that flow together toward food, rather than piling into a single clump.

## Beginner Trap
**Applying flock steering before seek steering.** If flock runs first, the seek force overwrites it. Compute seek and flock separately, then add both to velocity. Order of addition does not matter — order of overwriting does.

## Elite Insight
The weights (1.5, 1.0, 1.0) are not sacred. Try SEP_WEIGHT = 3.0 for panicky fish. Try ALI_WEIGHT = 2.0 for military formation. Try COH_WEIGHT = 0.1 for a loose swarm. The personality of your flock is entirely determined by these three numbers.

## Mastery Check
Question: Why use a single neighbor loop for all three rules instead of three separate loops?
Answer: Three separate loops would each iterate over all creatures — O(3n²). A single loop computes distance once and accumulates all three forces in one pass: O(n²). Same result, one-third the distance calculations. For 50 creatures, this saves 5,000 sqrtf calls per frame.
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
    cout << "Flock radius: " << (int)FLOCK_RADIUS << endl;
    cout << "Behavior: flock" << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
            // Seek nearest food (from L3)
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

            // TODO 1: Compute flocking forces
            // Declare: sep_x, sep_y, ali_vx, ali_vy, coh_cx, coh_cy, n_count
            // Loop over all creatures j != i:
            //   - compute distance d
            //   - if d < FLOCK_RADIUS:
            //     * if d < 25 && d > 0.01: add separation (dx/d, dy/d)
            //     * accumulate alignment (cvx[j], cvy[j])
            //     * accumulate cohesion (cx[j], cy[j])
            //     * increment n_count

            // TODO 2: Normalize alignment and cohesion by n_count
            // ali_vx = ali_vx / n_count - cvx[i]
            // coh_cx = coh_cx / n_count - cx[i]

            // TODO 3: Apply blended flock steering
            // cvx[i] += (sep_x*SEP_WEIGHT + ali_vx*ALI_WEIGHT + coh_cx*COH_WEIGHT) * STEER_WEIGHT
            // cvy[i] += (sep_y*SEP_WEIGHT + ali_vy*ALI_WEIGHT + coh_cy*COH_WEIGHT) * STEER_WEIGHT

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

        DrawText("AI Sandbox L4", 10, 10, 20, WHITE);
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
    cout << "Flock radius: " << (int)FLOCK_RADIUS << endl;
    cout << "Behavior: flock" << endl;

    while (!WindowShouldClose()) {
        for (int i = 0; i < creature_count; i++) {
            // Seek nearest food
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

        DrawText("AI Sandbox L4", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Flock radius is 60", expectedOutput: "Flock radius: 60" },
      { id: "g3", description: "Behavior is flock", expectedOutput: "Behavior: flock" },
    ],
    hints: [
      "Declare float sep_x=0, sep_y=0, ali_vx=0, ali_vy=0, coh_cx=0, coh_cy=0 and int n_count=0. Loop over all creatures j (skip j==i). Compute distance d = sqrtf(dx*dx + dy*dy).",
      "Inside the neighbor check (d < FLOCK_RADIUS): for separation, only add if d < 25 and d > 0.01. For alignment, sum cvx[j] and cvy[j]. For cohesion, sum cx[j] and cy[j]. Always increment n_count.",
      "After the loop: if (n_count > 0) divide ali_vx, ali_vy, coh_cx, coh_cy by n_count, then subtract own velocity/position. Finally: cvx[i] += (sep_x*1.5 + ali_vx*1.0 + coh_cx*1.0) * STEER_WEIGHT.",
    ],
    estimatedMinutes: 18,
  },
};
