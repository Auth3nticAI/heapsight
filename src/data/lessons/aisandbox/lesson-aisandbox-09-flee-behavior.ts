import type { Lesson } from "@/types/lesson";

export const lessonAISandbox9: Lesson = {
  id: "aisandbox-9-flee-behavior",
  title: "Flee Behavior",
  description: "Creatures flee from the mouse cursor — a simulated predator creates fear.",
  order: 9,
  xpReward: 50,
  tier: "free",
  concepts: ["flee steering", "predator avoidance", "fear radius", "behavior priority"],
  part1: {
    title: "Concept: Flee Steering",
    type: "concept",
    instructions: `
# Flee Behavior

## Mental Model
Seek steers toward a target. Flee steers away. The math is identical except the direction reverses: \`desired = normalize(position - threat) * max_speed\`. When the mouse cursor (a simulated predator) enters a creature's fear radius, flee overrides all other behaviors. The creature bolts away. Move the mouse near a cluster and watch them scatter like startled fish.

## What Breaks Without This
Without flee, creatures have no sense of danger. They ignore the mouse entirely. There is no interaction between the player and the ecosystem. Flee creates an observable cause-and-effect: move cursor near creatures → creatures scatter. This makes the simulation feel responsive and alive.

## The Fix: Flee = Reverse Seek

\`\`\`cpp
const float FEAR_RADIUS = 100.0f;

// Get mouse position as threat
float mx = (float)GetMouseX();
float my = (float)GetMouseY();

float dx = cx[i] - mx; // AWAY from threat
float dy = cy[i] - my;
float dist = sqrtf(dx*dx + dy*dy);

if (dist < FEAR_RADIUS && dist > 0.01f) {
    // Flee overrides all other steering
    float desired_vx = (dx / dist) * MAX_SPEED;
    float desired_vy = (dy / dist) * MAX_SPEED;
    cvx[i] += (desired_vx - cvx[i]) * 0.15f; // Strong weight
    cvy[i] += (desired_vy - cvy[i]) * 0.15f;
}
\`\`\`

Key difference from seek: the displacement vector is \`position - threat\` (away from) instead of \`target - position\` (toward). The flee weight (0.15) is higher than seek weight (0.05) because survival instinct overrides food-seeking.

## Key Concepts
- Flee = normalize(position - threat) * max_speed
- FEAR_RADIUS = 100.0f — flee triggers when mouse is within range
- Flee weight (0.15) is stronger than seek weight (0.05) — behavior priority via weight
- \`GetMouseX()\` and \`GetMouseY()\` get cursor position from raylib
- Flee overrides seek/wander when active (checked first in behavior chain)

## Performance Insight
One distance calculation per creature per frame for the mouse threat. This is O(n) — 50 sqrtf calls. Since there is only one threat (the mouse), this is far cheaper than the O(n²) flock neighbor search.

## Memory Insight
Zero new arrays. The mouse position is read from raylib each frame. The flee calculation uses only local variables. No persistent fear state is needed because fear is based purely on distance.

## Your Task
Compute the flee vector for a creature at (200, 200) with a threat at (250, 200). Print the direction and resulting velocity.

Expected output:
\`\`\`
Creature: (200, 200)
Threat: (250, 200)
Distance: 50
Flee direction: (-1, 0)
Threat: mouse
\`\`\`

## Beginner Trap
**Using \`threat - position\` instead of \`position - threat\`.** This reversal is the entire difference between seek and flee. Get it backwards and your creatures charge toward the mouse instead of running away. Think: "I want to move FROM my position AWAY from the threat → position - threat."

## Elite Insight
In RTS games, units have a "threat map" — a spatial grid of danger levels. Flee behavior consults the threat map to find the safest direction. Your single-threat flee is the degenerate case of a full threat map. The math scales: multiple threats become a weighted sum of flee vectors.

## Systems Thinking Connection
The Platformer path has hazard tiles that deal damage on contact. The Shooter has enemy bullets to dodge. This path has the mouse cursor as a predator. Same concept (avoid danger), different implementations. Flee is the continuous-space version of "don't step on the spike."

## Skill Reinforcement
Lesson 3 introduced seek. This lesson mirrors it with flee. Seek + flee is the foundation of all approach/avoidance behavior in game AI. Lesson 10 combines all behaviors into a complete ecosystem.

## Mastery Check
Question: Why use a higher steer weight for flee (0.15) than for seek (0.05)?
Answer: In nature, avoiding predators is more urgent than finding food. A high flee weight means the creature responds sharply to danger, overriding its gentle food-seeking trajectory. This creates realistic behavior: lazy drifting toward food, panicked bolting from threats.
`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float cx = 200.0f, cy = 200.0f;
    float mx = 250.0f, my = 200.0f; // threat position

    cout << "Creature: (" << (int)cx << ", " << (int)cy << ")" << endl;
    cout << "Threat: (" << (int)mx << ", " << (int)my << ")" << endl;

    // TODO 1: Compute displacement AWAY from threat
    // float dx = cx - mx; (position - threat)
    // float dy = cy - my;
    float dx = 0.0f;
    float dy = 0.0f;

    // TODO 2: Compute distance
    float dist = sqrtf(dx * dx + dy * dy);

    cout << "Distance: " << (int)dist << endl;

    // TODO 3: Normalize to get flee direction
    float flee_x = 0.0f;
    float flee_y = 0.0f;
    if (dist > 0.01f) {
        // flee_x = dx / dist;
        // flee_y = dy / dist;
    }

    cout << "Flee direction: (" << (int)flee_x << ", " << (int)flee_y << ")" << endl;
    cout << "Threat: mouse" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float cx = 200.0f, cy = 200.0f;
    float mx = 250.0f, my = 200.0f;

    cout << "Creature: (" << (int)cx << ", " << (int)cy << ")" << endl;
    cout << "Threat: (" << (int)mx << ", " << (int)my << ")" << endl;

    float dx = cx - mx;
    float dy = cy - my;
    float dist = sqrtf(dx * dx + dy * dy);

    cout << "Distance: " << (int)dist << endl;

    float flee_x = 0.0f;
    float flee_y = 0.0f;
    if (dist > 0.01f) {
        flee_x = dx / dist;
        flee_y = dy / dist;
    }

    cout << "Flee direction: (" << (int)flee_x << ", " << (int)flee_y << ")" << endl;
    cout << "Threat: mouse" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Creature position correct", expectedOutput: "Creature: (200, 200)" },
      { id: "t2", description: "Threat position correct", expectedOutput: "Threat: (250, 200)" },
      { id: "t3", description: "Distance is 50", expectedOutput: "Distance: 50" },
      { id: "t4", description: "Flee direction is left", expectedOutput: "Flee direction: (-1, 0)" },
      { id: "t5", description: "Threat is mouse", expectedOutput: "Threat: mouse" },
    ],
    hints: [
      "The flee displacement is AWAY from threat: dx = cx - mx = 200 - 250 = -50, dy = cy - my = 200 - 200 = 0.",
      "Distance = sqrtf((-50)*(-50) + 0*0) = sqrtf(2500) = 50. Then normalize: flee_x = -50/50 = -1, flee_y = 0/50 = 0.",
      "Replace the TODO lines: float dx = cx - mx; float dy = cy - my; and inside the if: flee_x = dx / dist; flee_y = dy / dist;",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Predator-Prey Dynamics",
    type: "game_builder",
    instructions: `
# Build: Predator-Prey Dynamics

## Mental Model
Move your mouse into the creature swarm. Watch them scatter. Pull the mouse away and they regroup, drifting back toward food. You are the predator. They are the prey. Flee overrides seek and wander when the threat is close. The behavior priority chain: flee > seek > wander. Flocking always applies.

## What Breaks Without This
Without flee, there is no player interaction. The simulation runs autonomously — interesting to watch, but not to play. Flee creates the first interactive element: you can herd creatures, scatter groups, and create feeding opportunities by driving creatures toward food.

## The Fix: Behavior Priority Chain
Check flee first. If the mouse is within FEAR_RADIUS, flee and skip seek/wander. Otherwise, fall through to the existing seek/wander logic.

\`\`\`cpp
float mx = (float)GetMouseX();
float my = (float)GetMouseY();
float tdx = cx[i] - mx;
float tdy = cy[i] - my;
float threat_dist = sqrtf(tdx*tdx + tdy*tdy);

if (threat_dist < FEAR_RADIUS && threat_dist > 0.01f) {
    // FLEE (highest priority)
    float flee_vx = (tdx / threat_dist) * MAX_SPEED;
    float flee_vy = (tdy / threat_dist) * MAX_SPEED;
    cvx[i] += (flee_vx - cvx[i]) * 0.15f;
    cvy[i] += (flee_vy - cvy[i]) * 0.15f;
} else if (best_food >= 0 && best_dist < FLOCK_RADIUS) {
    // SEEK food
} else {
    // WANDER
}
// FLOCK always runs after behavior selection
\`\`\`

## Your Task
Add flee behavior to the simulation. Creatures flee the mouse cursor when it is within 100 pixels. Flee overrides seek and wander.

Expected output:
\`\`\`
Population: 50
Threat: mouse
Flee: active
\`\`\`

Click **Run** — move your mouse into the swarm and watch creatures scatter in all directions. Pull away and they regroup toward food.

## Beginner Trap
**Applying flee additively with seek.** If flee and seek both run on the same frame, they partially cancel out. Use if/else if/else to make them mutually exclusive. Flee gets the first check because survival trumps food-seeking.

## Elite Insight
The behavior priority chain (flee > seek > wander) is a subsumption architecture — Rodney Brooks' layered robot control from 1986. Lower layers (wander) are suppressed by higher layers (flee). This is the same architecture used in Roomba vacuums and Boston Dynamics robots.

## Mastery Check
Question: Why use 0.15 flee weight instead of 1.0 (instant turn)?
Answer: A weight of 1.0 would make creatures teleport to full flee velocity in one frame — unrealistic and jarring. 0.15 creates a smooth turn-and-accelerate response that looks like a startled animal. The creature curves away from the threat over several frames, which is both more visually natural and more physically plausible.
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
    cout << "Threat: mouse" << endl;
    cout << "Flee: active" << endl;

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

        // TODO 1: Get mouse position
        // float mx = (float)GetMouseX();
        // float my = (float)GetMouseY();

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

            // TODO 2: Add flee as the FIRST behavior check
            //   Compute distance from creature to mouse
            //   If within FEAR_RADIUS: apply flee steering (weight 0.15)
            //   else if food near: seek
            //   else: wander

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
        snprintf(hud, 64, "AI Sandbox L9 | Alive: %d", alive_count);
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
    cout << "Threat: mouse" << endl;
    cout << "Flee: active" << endl;

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
                // Flee from mouse
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

        // Draw threat radius around mouse
        DrawCircleLines((int)mx, (int)my, FEAR_RADIUS, RED);

        char hud[64];
        snprintf(hud, 64, "AI Sandbox L9 | Alive: %d", alive_count);
        DrawText(hud, 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Population is 50", expectedOutput: "Population: 50" },
      { id: "g2", description: "Threat is mouse", expectedOutput: "Threat: mouse" },
      { id: "g3", description: "Flee is active", expectedOutput: "Flee: active" },
    ],
    hints: [
      "Uncomment the mouse position lines: float mx = (float)GetMouseX(); float my = (float)GetMouseY(); Place them before the creature loop.",
      "Replace the existing if/else seek/wander block with a three-way check: first compute threat_dist from creature to mouse. If threat_dist < FEAR_RADIUS: flee. Else if food near: seek. Else: wander.",
      "Flee steering: float tdx = cx[i]-mx; float tdy = cy[i]-my; float threat_dist = sqrtf(tdx*tdx+tdy*tdy); if (threat_dist < FEAR_RADIUS && threat_dist > 0.01f) { cvx[i] += ((tdx/threat_dist)*MAX_SPEED - cvx[i]) * 0.15f; same for y; }",
    ],
    estimatedMinutes: 18,
  },
};