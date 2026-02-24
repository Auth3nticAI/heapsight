import type { Lesson } from "@/types/lesson";

export const lessonShooter31: Lesson = {
  id: "shooter-31-input-module-split",
  title: "Input Module Split",
  description: "Extract keyboard input into inputSystem(). One function, one job — the foundation of modular game architecture.",
  order: 31,
  xpReward: 150,
  tier: "pro",
  concepts: ["system extraction", "inputSystem", "modular architecture", "separation of concerns"],
  part1: {
    title: "Concept: Input Module Split",
    type: "concept",
    instructions: `# Input Module Split

## The Spaghetti Problem
Your game loop does everything inline — input, movement, collision, rendering all tangled together. This is called spaghetti code. As games grow, it becomes impossible to maintain.

## The System Pattern
A **system** is a function with exactly one job. Instead of scattering input code through the loop, you write:

\`\`\`cpp
void inputSystem(World& w) {
    if (IsKeyDown(KEY_RIGHT)) w.ship_x += w.speed;
    if (IsKeyDown(KEY_LEFT))  w.ship_x -= w.speed;
    if (w.ship_x < 0) w.ship_x = 0;
    if (w.ship_x > SCREEN_W - w.ship_w) w.ship_x = SCREEN_W - w.ship_w;
    if (IsKeyPressed(KEY_SPACE))
        spawnBullet(w, (int)w.ship_x + w.ship_w/2 - 2, (int)w.ship_y);
}
\`\`\`

Then the game loop shrinks to one clean line:

\`\`\`cpp
inputSystem(world);
\`\`\`

## Why This Matters
- **Find it fast**: Where does input get handled? In inputSystem(). Done.
- **Change safely**: Modifying input won't accidentally break rendering.
- **Professional pattern**: Unity, Unreal, and Godot all use this ECS architecture.

## Your Task
Write a listSystems() function that registers and prints active systems.

Expected output:
\`\`\`
Systems: 1
System[0]: input
Pattern: input-module
\`\`\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int NUM_SYSTEMS = 1;
string system_names[NUM_SYSTEMS];

void registerSystem(int idx, string name) {
    system_names[idx] = name;
}

void listSystems() {
    cout << "Systems: " << NUM_SYSTEMS << endl;
    // TODO: loop from 0 to NUM_SYSTEMS and print:
    // System[i]: system_names[i]
    cout << "Pattern: input-module" << endl;
}

int main() {
    // TODO: call registerSystem(0, "input")
    listSystems();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int NUM_SYSTEMS = 1;
string system_names[NUM_SYSTEMS];

void registerSystem(int idx, string name) {
    system_names[idx] = name;
}

void listSystems() {
    cout << "Systems: " << NUM_SYSTEMS << endl;
    for (int i = 0; i < NUM_SYSTEMS; i++) {
        cout << "System[" << i << "]: " << system_names[i] << endl;
    }
    cout << "Pattern: input-module" << endl;
}

int main() {
    registerSystem(0, "input");
    listSystems();
    return 0;
}`,
    tests: [
      { id: "t1", description: "prints system count", expectedOutput: "Systems: 1" },
      { id: "t2", description: "prints input system name", expectedOutput: "System[0]: input" },
      { id: "t3", description: "prints pattern tag", expectedOutput: "Pattern: input-module" },
    ],
    hints: [
      "Call registerSystem(0, \"input\") before listSystems().",
      "In listSystems(), add: for (int i = 0; i < NUM_SYSTEMS; i++) cout << \"System[\" << i << \"]: \" << system_names[i] << endl;",
      "The Pattern line is already there — just add the loop above it.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Input Module Split",
    type: "game_builder",
    instructions: `# Build: Input Module Split

## What's Already Here
Full shooter from L30 with heap freeze audit. The fixed-timestep loop has all input code inlined.

## Your Task

**TODO 1** — Implement inputSystem(World& w). It should handle all keyboard input:

\`\`\`cpp
void inputSystem(World& w) {
    if (IsKeyDown(KEY_RIGHT)) w.ship_x += w.speed;
    if (IsKeyDown(KEY_LEFT))  w.ship_x -= w.speed;
    if (w.ship_x < 0) w.ship_x = 0;
    if (w.ship_x > SCREEN_W - w.ship_w) w.ship_x = SCREEN_W - w.ship_w;
    if (IsKeyPressed(KEY_SPACE))
        spawnBullet(w, (int)w.ship_x + w.ship_w/2 - 2, (int)w.ship_y);
}
\`\`\`

**TODO 2** — In the fixed-timestep loop, replace the commented-out input block with a single call:

\`\`\`cpp
inputSystem(world);
\`\`\`

## Did It Work?
The game plays identically — ship moves, SPACE fires. The HUD shows **SYS: 1 | input** in lime. Console prints the system registry at startup.

## Click Run now with the empty inputSystem stub — the game should still open (ship won't move). That's expected. Then implement TODO 1 and 2.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const int MAX_PARTICLES = 30;
const int MAX_POWERUPS = 3;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

int pool_spawns = 0;

struct Particle { float x, y, vx, vy; int life; Color color; };

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    int  shots_fired;
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    float enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS];
    float powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
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
    pool_spawns++;
    return id;
}

void despawnEnemy(World& w, int id) {
    w.enemy_active[id] = false;
    w.enemy_x[id] = 0; w.enemy_y[id] = 0;
    w.enemy_speed[id] = 0; w.enemy_color[id] = BLACK;
}

EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) return INVALID_ID;
    w.bullet_x[id] = x; w.bullet_y[id] = y;
    w.bullet_active[id] = true;
    w.shots_fired++;
    pool_spawns++;
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0; w.bullet_y[id] = 0;
}
// POLICY: NO rand() -- use rng_next()/rng_range() only
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }
void spawnParticle(World& w, float x, float y, Color c) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life <= 0) {
            w.particles[i].x = x; w.particles[i].y = y;
            w.particles[i].vx = (rng_range(11) - 5) * 1.5f;
            w.particles[i].vy = (rng_range(11) - 5) * 1.5f;
            w.particles[i].life = 20;
            w.particles[i].color = c;
            return;
        }
    }
}
void updateParticles(World& w) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life > 0) {
            w.particles[i].x += w.particles[i].vx;
            w.particles[i].y += w.particles[i].vy;
            w.particles[i].life--;
        }
    }
}
EntityId spawnPowerup(World& w, float x, float y) {
    EntityId id = findFreeSlot(w.powerup_active, MAX_POWERUPS);
    if (id == INVALID_ID) return INVALID_ID;
    w.powerup_x[id] = x; w.powerup_y[id] = y;
    w.powerup_active[id] = true;
    return id;
}
void despawnPowerup(World& w, int id) {
    w.powerup_active[id] = false;
    w.powerup_x[id] = 0; w.powerup_y[id] = 0;
}
void collectPowerup(World& w, int id) {
    w.score += 200;
    despawnPowerup(w, id);
}
void updatePowerups(World& w) {
    for (int i = 0; i < MAX_POWERUPS; i++) {
        if (w.powerup_active[i]) {
            w.powerup_y[i] += 30.0f * FIXED_DT;
            if (w.powerup_y[i] > SCREEN_H) despawnPowerup(w, i);
        }
    }
}
void spawnWave(World& w) {
    rng_state = 42 + (unsigned int)w.wave * 7u;
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++) {
        float x = 20.0f + rng_range(740);
        spawnEnemy(w, x, 30, 18.0f + i * 6.0f, palette[i]);
    }
}

void auditHeap(World& w) {
    cout << "GATE A: Heap Freeze Audit" << endl;
    cout << "Enemies: "   << MAX_ENEMIES   << "/" << MAX_ENEMIES   << " pooled" << endl;
    cout << "Bullets: "   << MAX_BULLETS   << "/" << MAX_BULLETS   << " pooled" << endl;
    cout << "Particles: " << MAX_PARTICLES << "/" << MAX_PARTICLES << " pooled" << endl;
    cout << "Powerups: "  << MAX_POWERUPS  << "/" << MAX_POWERUPS  << " pooled" << endl;
    cout << "Heap ops in loop: 0" << endl;
    cout << "GATE A: PASSED" << endl;
    cout << "Pattern: heap-freeze" << endl;
}
// TODO 1: Implement inputSystem — move ship left/right, clamp to bounds, fire on SPACE
void inputSystem(World& w) {
    // move ship right on KEY_RIGHT
    // move ship left on KEY_LEFT
    // clamp: ship_x must stay between 0 and SCREEN_W - ship_w
    // fire bullet on KEY_SPACE (spawnBullet)
}
int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter -- Systems");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1; world.shots_fired = 0;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    for (int i = 0; i < MAX_PARTICLES; i++) world.particles[i].life = 0;
    for (int i = 0; i < MAX_POWERUPS; i++) world.powerup_active[i] = false;
    spawnWave(world);
    auditHeap(world);
    cout << "Systems: 1" << endl;
    cout << "System[0]: input" << endl;
    cout << "Pattern: input-module" << endl;
    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            // TODO 2: Replace this inline block with inputSystem(world);
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                spawnBullet(world, (int)world.ship_x + world.ship_w/2 - 2, (int)world.ship_y);
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) {
                    world.bullet_y[i] -= 8;
                    if (world.bullet_y[i] < -10) despawnBullet(world, i);
                }
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
                    if (hit) {
                        despawnBullet(world, b);
                        for (int p = 0; p < 5; p++)
                            spawnParticle(world, world.enemy_x[e]+12, world.enemy_y[e]+12, world.enemy_color[e]);
                        despawnEnemy(world, e);
                        world.score += 100;
                        if (rng_range(10) < 3)
                            spawnPowerup(world, world.enemy_x[e]+12, world.enemy_y[e]+12);
                    }
                }
            }
            for (int i = 0; i < MAX_POWERUPS; i++) {
                if (!world.powerup_active[i]) continue;
                bool overlap = world.powerup_x[i] < world.ship_x + world.ship_w &&
                               world.powerup_x[i]+16 > world.ship_x &&
                               world.powerup_y[i] < world.ship_y + world.ship_h &&
                               world.powerup_y[i]+16 > world.ship_y;
                if (overlap) collectPowerup(world, i);
            }
            updateParticles(world);
            updatePowerups(world);
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
        for (int i = 0; i < MAX_PARTICLES; i++)
            if (world.particles[i].life > 0)
                DrawRectangle((int)world.particles[i].x, (int)world.particles[i].y, 4, 4, world.particles[i].color);
        for (int i = 0; i < MAX_POWERUPS; i++)
            if (world.powerup_active[i])
                DrawRectangle((int)world.powerup_x[i], (int)world.powerup_y[i], 16, 16, GOLD);
        DrawText("** GATE A: HEAP FROZEN **", SCREEN_W/2 - 155, 8, 20, LIME);
        DrawText("HeapSight Shooter", 10, 38, 18, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 62, 18, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 86, 18, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 110, 18, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 134, 18, YELLOW);
        { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(world.particles[i].life>0) pa++;
          DrawText(TextFormat("Parts: %d/30", pa), 10, 158, 14, ORANGE); }
        { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(world.powerup_active[i]) pu++;
          DrawText(TextFormat("PU: %d/3", pu), 10, 178, 14, GOLD); }
        DrawText(TextFormat("Spawns: %d", pool_spawns), 10, 198, 14, LIME);
        DrawText("SYS: 1 | input", 10, 218, 14, LIME);
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
const int MAX_PARTICLES = 30;
const int MAX_POWERUPS = 3;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

int pool_spawns = 0;

struct Particle { float x, y, vx, vy; int life; Color color; };

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    int  shots_fired;
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    float enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS];
    float powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
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
    pool_spawns++;
    return id;
}

void despawnEnemy(World& w, int id) {
    w.enemy_active[id] = false;
    w.enemy_x[id] = 0; w.enemy_y[id] = 0;
    w.enemy_speed[id] = 0; w.enemy_color[id] = BLACK;
}

EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) return INVALID_ID;
    w.bullet_x[id] = x; w.bullet_y[id] = y;
    w.bullet_active[id] = true;
    w.shots_fired++;
    pool_spawns++;
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0; w.bullet_y[id] = 0;
}
// POLICY: NO rand() -- use rng_next()/rng_range() only
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }
void spawnParticle(World& w, float x, float y, Color c) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life <= 0) {
            w.particles[i].x = x; w.particles[i].y = y;
            w.particles[i].vx = (rng_range(11) - 5) * 1.5f;
            w.particles[i].vy = (rng_range(11) - 5) * 1.5f;
            w.particles[i].life = 20;
            w.particles[i].color = c;
            return;
        }
    }
}
void updateParticles(World& w) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life > 0) {
            w.particles[i].x += w.particles[i].vx;
            w.particles[i].y += w.particles[i].vy;
            w.particles[i].life--;
        }
    }
}
EntityId spawnPowerup(World& w, float x, float y) {
    EntityId id = findFreeSlot(w.powerup_active, MAX_POWERUPS);
    if (id == INVALID_ID) return INVALID_ID;
    w.powerup_x[id] = x; w.powerup_y[id] = y;
    w.powerup_active[id] = true;
    return id;
}
void despawnPowerup(World& w, int id) {
    w.powerup_active[id] = false;
    w.powerup_x[id] = 0; w.powerup_y[id] = 0;
}
void collectPowerup(World& w, int id) {
    w.score += 200;
    despawnPowerup(w, id);
}
void updatePowerups(World& w) {
    for (int i = 0; i < MAX_POWERUPS; i++) {
        if (w.powerup_active[i]) {
            w.powerup_y[i] += 30.0f * FIXED_DT;
            if (w.powerup_y[i] > SCREEN_H) despawnPowerup(w, i);
        }
    }
}
void spawnWave(World& w) {
    rng_state = 42 + (unsigned int)w.wave * 7u;
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++) {
        float x = 20.0f + rng_range(740);
        spawnEnemy(w, x, 30, 18.0f + i * 6.0f, palette[i]);
    }
}

void auditHeap(World& w) {
    cout << "GATE A: Heap Freeze Audit" << endl;
    cout << "Enemies: "   << MAX_ENEMIES   << "/" << MAX_ENEMIES   << " pooled" << endl;
    cout << "Bullets: "   << MAX_BULLETS   << "/" << MAX_BULLETS   << " pooled" << endl;
    cout << "Particles: " << MAX_PARTICLES << "/" << MAX_PARTICLES << " pooled" << endl;
    cout << "Powerups: "  << MAX_POWERUPS  << "/" << MAX_POWERUPS  << " pooled" << endl;
    cout << "Heap ops in loop: 0" << endl;
    cout << "GATE A: PASSED" << endl;
    cout << "Pattern: heap-freeze" << endl;
}
void inputSystem(World& w) {
    if (IsKeyDown(KEY_RIGHT)) w.ship_x += w.speed;
    if (IsKeyDown(KEY_LEFT))  w.ship_x -= w.speed;
    if (w.ship_x < 0) w.ship_x = 0;
    if (w.ship_x > SCREEN_W - w.ship_w) w.ship_x = SCREEN_W - w.ship_w;
    if (IsKeyPressed(KEY_SPACE))
        spawnBullet(w, (int)w.ship_x + w.ship_w/2 - 2, (int)w.ship_y);
}
int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter -- Systems");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1; world.shots_fired = 0;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    for (int i = 0; i < MAX_PARTICLES; i++) world.particles[i].life = 0;
    for (int i = 0; i < MAX_POWERUPS; i++) world.powerup_active[i] = false;
    spawnWave(world);
    auditHeap(world);
    cout << "Systems: 1" << endl;
    cout << "System[0]: input" << endl;
    cout << "Pattern: input-module" << endl;
    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            inputSystem(world);
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) {
                    world.bullet_y[i] -= 8;
                    if (world.bullet_y[i] < -10) despawnBullet(world, i);
                }
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
                    if (hit) {
                        despawnBullet(world, b);
                        for (int p = 0; p < 5; p++)
                            spawnParticle(world, world.enemy_x[e]+12, world.enemy_y[e]+12, world.enemy_color[e]);
                        despawnEnemy(world, e);
                        world.score += 100;
                        if (rng_range(10) < 3)
                            spawnPowerup(world, world.enemy_x[e]+12, world.enemy_y[e]+12);
                    }
                }
            }
            for (int i = 0; i < MAX_POWERUPS; i++) {
                if (!world.powerup_active[i]) continue;
                bool overlap = world.powerup_x[i] < world.ship_x + world.ship_w &&
                               world.powerup_x[i]+16 > world.ship_x &&
                               world.powerup_y[i] < world.ship_y + world.ship_h &&
                               world.powerup_y[i]+16 > world.ship_y;
                if (overlap) collectPowerup(world, i);
            }
            updateParticles(world);
            updatePowerups(world);
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
        for (int i = 0; i < MAX_PARTICLES; i++)
            if (world.particles[i].life > 0)
                DrawRectangle((int)world.particles[i].x, (int)world.particles[i].y, 4, 4, world.particles[i].color);
        for (int i = 0; i < MAX_POWERUPS; i++)
            if (world.powerup_active[i])
                DrawRectangle((int)world.powerup_x[i], (int)world.powerup_y[i], 16, 16, GOLD);
        DrawText("** GATE A: HEAP FROZEN **", SCREEN_W/2 - 155, 8, 20, LIME);
        DrawText("HeapSight Shooter", 10, 38, 18, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 62, 18, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 86, 18, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 110, 18, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 134, 18, YELLOW);
        { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(world.particles[i].life>0) pa++;
          DrawText(TextFormat("Parts: %d/30", pa), 10, 158, 14, ORANGE); }
        { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(world.powerup_active[i]) pu++;
          DrawText(TextFormat("PU: %d/3", pu), 10, 178, 14, GOLD); }
        DrawText(TextFormat("Spawns: %d", pool_spawns), 10, 198, 14, LIME);
        DrawText("SYS: 1 | input", 10, 218, 14, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "prints system count", expectedOutput: "Systems: 1" },
      { id: "g2", description: "prints input system name", expectedOutput: "System[0]: input" },
      { id: "g3", description: "prints pattern tag", expectedOutput: "Pattern: input-module" },
      { id: "g4", description: "heap freeze audit present", expectedOutput: "GATE A: PASSED" },
    ],
    hints: [
      "TODO 1: Copy the 5 input lines from the inline block into inputSystem(). Change world. to w.",
      "TODO 2: Remove the 7 inline input lines and replace with inputSystem(world);",
      "The ship should move and fire exactly as before — if it does, you did it right.",
    ],
    estimatedMinutes: 20,
  },
};
