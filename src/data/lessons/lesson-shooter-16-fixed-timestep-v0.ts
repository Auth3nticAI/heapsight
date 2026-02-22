import type { Lesson } from "@/types/lesson";

export const lessonShooter16: Lesson = {
  id: "shooter-16-fixed-timestep-v0",
  title: "Fixed Timestep v0",
  description: "Wrap the game loop in a fixed-dt accumulator so simulation rate decouples from render rate — the foundation of deterministic replay.",
  order: 16,
  xpReward: 100,
  tier: "pro",
  concepts: ["fixed timestep", "accumulator pattern", "deterministic simulation", "dt integration"],
  part1: {
    title: "Concept: The Accumulator Pattern",
    type: "concept",
    instructions: `# Fixed Timestep v0

## Mental Model
Without a fixed timestep your simulation runs at whatever speed the hardware delivers. Fast machine = fast enemies. Slow machine = sluggish bullets. Two players on different GPUs play different games. That's not physics — that's a race condition disguised as gameplay.

## What Breaks Without This
Run your shooter on a 120fps machine. Enemies fall twice as fast as on a 60fps machine because the game loop fires twice as many times per second. The ship speed is framerate-dependent. Any recorded replay will diverge on different hardware.

## The Fix: Accumulator Pattern
\`\`\`cpp
const float FIXED_DT = 1.0f / 60.0f;  // step size: ~16.67ms
float accumulator = 0.0f;

while (!WindowShouldClose()) {
    float dt = GetFrameTime();    // real elapsed time this frame
    accumulator += dt;
    while (accumulator >= FIXED_DT) {
        updateSystems(FIXED_DT);  // always exactly FIXED_DT
        accumulator -= FIXED_DT;
    }
    BeginDrawing(); renderSystems(); EndDrawing(); // native rate
}
\`\`\`

On a 120fps machine: dt \≈ 0.0083s. Two render frames pass before accumulator reaches 0.0167. One physics tick every two renders. Simulation stays at 60Hz regardless of frame rate.

## Key Concepts
- \`accumulator\` absorbs jitter from variable frame times
- Physics advances by exactly \`FIXED_DT\` every tick
- Render runs every frame at native rate — smooth on fast hardware
- Foundation of deterministic replay (Lesson 25, Gate A at Lesson 30)

## Performance Insight
One float comparison and subtraction per frame. Near-zero overhead. What it buys: deterministic simulation, replay safety, and hardware independence. Every physics engine from Quake to Unity uses this exact pattern.

## Memory Insight
One float at file scope. No allocation. The accumulator is a timing buffer — it absorbs the difference between the variable render clock and the fixed simulation clock.

## Your Task
Simulate the accumulator in integer milliseconds. Five frames of 16ms each should produce exactly 5 simulation steps.

Expected output:
\`\`\`
FIXED_DT: 16ms
Steps: 5
Pattern: accumulator
\`\`\`

## Beginner Trap
Don't multiply enemy speed by \`GetFrameTime()\` directly. That changes dt every frame. Fixed DT means EVERY update uses the SAME step — predictable, replayable, deterministic.

## Elite Insight
Glenn Fiedler's "Fix Your Timestep" (2006) is the canonical reference. Quake uses a fixed 50ms tick (20Hz) with render interpolation on top. Source Engine uses 66Hz ticks. Unity's \`FixedUpdate\` is this exact pattern. The accumulator is non-negotiable for determinism.

## Systems Thinking Connection
Platformer Lesson 32 builds the same accumulator for gravity integration. RPG Lesson 25 uses a fixed action tick for turn validation. Same pattern, different domains.

## Skill Reinforcement
Built on: L15 SoA data layout — the data is now ticked at a fixed rate.
Feeds into: L25 Milestone — deterministic restart requires fixed-dt ticks.

## Mastery Check
*Question:* FIXED_DT = 0.016, a slow frame takes 0.050s. How many simulation steps?
*Answer:* 3 steps (0.050 / 0.016 = 3.125 — integer part is 3, 0.018 remains in accumulator).`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Fixed timestep accumulator demo (integer ms for clarity)
    const int FIXED_DT_MS = 16;   // ~60fps tick
    int accumulator = 0;
    int sim_steps = 0;

    // Simulate 5 real frames of 16ms each
    for (int f = 0; f < 5; f++) {
        accumulator += FIXED_DT_MS;
        // TODO 1: while (accumulator >= FIXED_DT_MS) {
        //            sim_steps++;
        //            accumulator -= FIXED_DT_MS;
        //         }
    }

    // TODO 2: cout << "FIXED_DT: 16ms" << endl;
    // TODO 3: cout << "Steps: " << sim_steps << endl;
    // TODO 4: cout << "Pattern: accumulator" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    const int FIXED_DT_MS = 16;
    int accumulator = 0;
    int sim_steps = 0;

    for (int f = 0; f < 5; f++) {
        accumulator += FIXED_DT_MS;
        while (accumulator >= FIXED_DT_MS) {
            sim_steps++;
            accumulator -= FIXED_DT_MS;
        }
    }

    cout << "FIXED_DT: 16ms" << endl;
    cout << "Steps: " << sim_steps << endl;
    cout << "Pattern: accumulator" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Reports fixed DT value", expectedOutput: "FIXED_DT: 16ms" },
      { id: "t2", description: "Correct step count for 5 frames", expectedOutput: "Steps: 5" },
      { id: "t3", description: "Confirms accumulator pattern", expectedOutput: "Pattern: accumulator" },
    ],
    hints: [
      "The while loop runs as long as accumulator >= FIXED_DT_MS. Increment sim_steps inside, then subtract FIXED_DT_MS.",
      "sim_steps increments once per simulation step — not once per real frame.",
      "5 frames x 16ms / 16ms per step = 5 steps.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Build: Fixed Timestep v0",
    type: "game_builder",
    instructions: `# Build: Fixed Timestep v0

## Mental Model
Wrap the entire update section of your game loop inside \`while (accumulator >= FIXED_DT)\`. The render section stays OUTSIDE — it runs every frame at native rate. Update rate is now physics-time, not wall-clock-time.

## What's Already Here
Full SoA shooter from Lesson 15 plus:
- \`const float FIXED_DT = 1.0f / 60.0f;\` at file scope
- \`float accumulator = 0.0f;\` at file scope
- Enemy speeds now pixels/second (18.0 + i*6.0 vs old 0.3 + i*0.1)

## Your Task

**TODO 1** — Open the fixed-step loop after \`accumulator += dt;\`:
\`\`\`cpp
while (accumulator >= FIXED_DT) {
\`\`\`

**TODO 2** — Drain the accumulator at the end of the update block:
\`\`\`cpp
    accumulator -= FIXED_DT;
}  // close the while loop before BeginDrawing()
\`\`\`

**TODO 3** — Enemy movement already uses FIXED_DT. Confirm this line is inside the while loop:
\`\`\`cpp
world.enemy_y[i] += world.enemy_speed[i] * FIXED_DT;
\`\`\`

## Did It Work?
The HUD shows "Fixed DT" in sky blue. Enemies fall at the same speed regardless of how fast your machine renders. The console prints the accumulator pre-sim confirming 5 steps.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    float enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;
float accumulator = 0.0f;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x; w.enemy_y[id] = y;
    w.enemy_speed[id] = speed; w.enemy_color[id] = c;
    w.enemy_active[id] = true;
    return id;
}

void spawnWave(World& w) {
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++)
        spawnEnemy(w, 80 + i * 130, 30, 18.0f + i * 6.0f, palette[i]);
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    { int a=0,s=0; for(int f=0;f<5;f++){a+=16; while(a>=16){s++;a-=16;}} cout<<"FIXED_DT: 16ms"<<endl; cout<<"Steps: "<<s<<endl; cout<<"Pattern: accumulator"<<endl; }

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        // TODO 1: while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                for (int i = 0; i < MAX_BULLETS; i++) {
                    if (!world.bullet_active[i]) {
                        world.bullet_x[i] = (int)world.ship_x + world.ship_w/2 - 2;
                        world.bullet_y[i] = (int)world.ship_y;
                        world.bullet_active[i] = true; break;
                    }
                }
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) { world.bullet_y[i] -= 8; if (world.bullet_y[i] < -10) world.bullet_active[i] = false; }
            }
            for (int i = 0; i < MAX_ENEMIES; i++) {
                if (world.enemy_active[i]) {
                    world.enemy_y[i] += world.enemy_speed[i] * FIXED_DT;
                    if (world.enemy_y[i] > SCREEN_H) world.enemy_y[i] = 0;
                }
            }
            for (int b = 0; b < MAX_BULLETS; b++) {
                if (!world.bullet_active[b]) continue;
                for (int e = 0; e < MAX_ENEMIES; e++) {
                    if (!world.enemy_active[e]) continue;
                    bool hit = world.bullet_x[b] < (int)world.enemy_x[e]+24 &&
                               world.bullet_x[b]+4 > (int)world.enemy_x[e] &&
                               world.bullet_y[b] < (int)world.enemy_y[e]+24 &&
                               world.bullet_y[b]+10 > (int)world.enemy_y[e];
                    if (hit) { world.bullet_active[b]=false; world.enemy_active[e]=false; world.score+=100; }
                }
            }
            int alive = 0;
            for (int i = 0; i < MAX_ENEMIES; i++) if (world.enemy_active[i]) alive++;
            if (alive == 0) { world.wave++; spawnWave(world); }
        // TODO 2: accumulator -= FIXED_DT;
        // }  // close the while loop

        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(100,50,2,2,WHITE); DrawRectangle(200,120,2,2,WHITE);
        DrawRectangle(350,30,2,2,WHITE); DrawRectangle(500,80,2,2,WHITE);
        DrawRectangle(650,150,2,2,WHITE); DrawRectangle(750,60,2,2,WHITE);
        DrawRectangle(50,200,2,2,WHITE); DrawRectangle(300,250,2,2,WHITE);
        DrawRectangle(450,180,2,2,WHITE); DrawRectangle(600,300,2,2,WHITE);
        DrawRectangle(150,350,2,2,WHITE); DrawRectangle(700,380,2,2,WHITE);
        for (int i = 0; i < MAX_ENEMIES; i++)
            if (world.enemy_active[i])
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, world.enemy_color[i]);
        DrawRectangle((int)world.ship_x, (int)world.ship_y, world.ship_w, world.ship_h, GREEN);
        for (int i = 0; i < MAX_BULLETS; i++)
            if (world.bullet_active[i])
                DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText("Fixed DT", 10, 130, 20, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    float enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;
float accumulator = 0.0f;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x; w.enemy_y[id] = y;
    w.enemy_speed[id] = speed; w.enemy_color[id] = c;
    w.enemy_active[id] = true;
    return id;
}

void spawnWave(World& w) {
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++)
        spawnEnemy(w, 80 + i * 130, 30, 18.0f + i * 6.0f, palette[i]);
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    { int a=0,s=0; for(int f=0;f<5;f++){a+=16; while(a>=16){s++;a-=16;}} cout<<"FIXED_DT: 16ms"<<endl; cout<<"Steps: "<<s<<endl; cout<<"Pattern: accumulator"<<endl; }

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                for (int i = 0; i < MAX_BULLETS; i++) {
                    if (!world.bullet_active[i]) {
                        world.bullet_x[i] = (int)world.ship_x + world.ship_w/2 - 2;
                        world.bullet_y[i] = (int)world.ship_y;
                        world.bullet_active[i] = true; break;
                    }
                }
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) { world.bullet_y[i] -= 8; if (world.bullet_y[i] < -10) world.bullet_active[i] = false; }
            }
            for (int i = 0; i < MAX_ENEMIES; i++) {
                if (world.enemy_active[i]) {
                    world.enemy_y[i] += world.enemy_speed[i] * FIXED_DT;
                    if (world.enemy_y[i] > SCREEN_H) world.enemy_y[i] = 0;
                }
            }
            for (int b = 0; b < MAX_BULLETS; b++) {
                if (!world.bullet_active[b]) continue;
                for (int e = 0; e < MAX_ENEMIES; e++) {
                    if (!world.enemy_active[e]) continue;
                    bool hit = world.bullet_x[b] < (int)world.enemy_x[e]+24 &&
                               world.bullet_x[b]+4 > (int)world.enemy_x[e] &&
                               world.bullet_y[b] < (int)world.enemy_y[e]+24 &&
                               world.bullet_y[b]+10 > (int)world.enemy_y[e];
                    if (hit) { world.bullet_active[b]=false; world.enemy_active[e]=false; world.score+=100; }
                }
            }
            int alive = 0;
            for (int i = 0; i < MAX_ENEMIES; i++) if (world.enemy_active[i]) alive++;
            if (alive == 0) { world.wave++; spawnWave(world); }
            accumulator -= FIXED_DT;
        }

        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(100,50,2,2,WHITE); DrawRectangle(200,120,2,2,WHITE);
        DrawRectangle(350,30,2,2,WHITE); DrawRectangle(500,80,2,2,WHITE);
        DrawRectangle(650,150,2,2,WHITE); DrawRectangle(750,60,2,2,WHITE);
        DrawRectangle(50,200,2,2,WHITE); DrawRectangle(300,250,2,2,WHITE);
        DrawRectangle(450,180,2,2,WHITE); DrawRectangle(600,300,2,2,WHITE);
        DrawRectangle(150,350,2,2,WHITE); DrawRectangle(700,380,2,2,WHITE);
        for (int i = 0; i < MAX_ENEMIES; i++)
            if (world.enemy_active[i])
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, world.enemy_color[i]);
        DrawRectangle((int)world.ship_x, (int)world.ship_y, world.ship_w, world.ship_h, GREEN);
        for (int i = 0; i < MAX_BULLETS; i++)
            if (world.bullet_active[i])
                DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText("Fixed DT", 10, 130, 20, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Fixed DT value printed", expectedOutput: "FIXED_DT: 16ms" },
      { id: "g2", description: "Step count matches", expectedOutput: "Steps: 5" },
      { id: "g3", description: "Accumulator pattern confirmed", expectedOutput: "Pattern: accumulator" },
    ],
    hints: [
      "while (accumulator >= FIXED_DT) goes BEFORE the input/update code, AFTER accumulator += dt;",
      "accumulator -= FIXED_DT; is the last line INSIDE the while loop — before the closing }.",
      "The * FIXED_DT in enemy movement converts pixels/second to pixels/tick — no other changes needed.",
    ],
    estimatedMinutes: 15,
  },
};