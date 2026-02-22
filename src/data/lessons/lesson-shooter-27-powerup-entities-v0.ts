import type { Lesson } from "@/types/lesson";

export const lessonShooter27: Lesson = {
  id: "shooter-27-powerup-entities-v0",
  title: "Power-Up Entities v0",
  description: "Add collectible power-ups — a 3-slot entity pool that spawns on enemy kills and grants score on collection. Gold squares drift down the screen, fully pooled.",
  order: 27,
  xpReward: 100,
  tier: "pro",
  concepts: ["entity pool", "spawn-collect", "overlap detection", "zero heap effects"],
  part1: {
    title: "Concept: Powerup Entity Pool",
    type: "concept",
    instructions: `# Power-Up Entities v0

## Mental Model
A power-up is an entity: it lives in a pool slot, has a position, and has a lifetime. When spawned it drifts down the screen. When the ship overlaps it, it is collected and its slot is returned to free. No heap involved.

## What Breaks Without This
Without a pool, each power-up would be heap-allocated on spawn and deleted on collect. With fast gameplay (many kills per second), allocation spikes combine with particle allocation to create frame hitches at exactly the wrong moment.

## The Fix: Power-Up Pool
\`\`\`cpp
const int MAX_PU = 3;
bool pu_active[MAX_PU] = {};
float pu_x[MAX_PU] = {};
float pu_y[MAX_PU] = {};

int spawnPowerup(float x, float y) {
    for (int i = 0; i < MAX_PU; i++) {
        if (!pu_active[i]) {
            pu_active[i] = true;
            pu_x[i] = x; pu_y[i] = y;
            return i;
        }
    }
    return -1; // pool full
}

void collectPowerup(int id, int& score) {
    pu_active[id] = false;
    score += 200;
}
\`\`\`

## Key Concepts
- 3-slot pool: small because only 1-2 power-ups ever appear simultaneously
- Collect zeroes the slot immediately — slot reuse on next spawn
- Pool full: spawn silently skipped, never crashes

## Your Task
Simulate a power-up spawn and collect cycle. Verify the active count drops to zero after collection.

Expected output:
\`\`\`
Powerup pool: 3 slots
Spawned: 1 (score_bonus)
Collected: 1
Active: 0
Pattern: powerup-entity
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_PU = 3;
bool pu_active[MAX_PU] = {};
float pu_x[MAX_PU] = {};
float pu_y[MAX_PU] = {};

// TODO 1: fill in the spawn logic
// Find first slot with pu_active[i] == false
// Set pu_active[i]=true, pu_x[i]=x, pu_y[i]=y and return i
int spawnPowerup(float x, float y) {
    for (int i = 0; i < MAX_PU; i++) {
        if (!pu_active[i]) {
            // your code here
            return i;
        }
    }
    return -1;
}

void collectPowerup(int id, int& score) {
    pu_active[id] = false;
    score += 200;
}

int main() {
    int score = 0;
    cout << "Powerup pool: " << MAX_PU << " slots" << endl;
    int id = spawnPowerup(400.0f, 200.0f);
    cout << "Spawned: 1 (score_bonus)" << endl;
    collectPowerup(id, score);
    cout << "Collected: 1" << endl;
    int active = 0;
    for (int i = 0; i < MAX_PU; i++) if (pu_active[i]) active++;
    cout << "Active: " << active << endl;
    cout << "Pattern: powerup-entity" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_PU = 3;
bool pu_active[MAX_PU] = {};
float pu_x[MAX_PU] = {};
float pu_y[MAX_PU] = {};

int spawnPowerup(float x, float y) {
    for (int i = 0; i < MAX_PU; i++) {
        if (!pu_active[i]) {
            pu_active[i] = true;
            pu_x[i] = x; pu_y[i] = y;
            return i;
        }
    }
    return -1;
}

void collectPowerup(int id, int& score) {
    pu_active[id] = false;
    score += 200;
}

int main() {
    int score = 0;
    cout << "Powerup pool: " << MAX_PU << " slots" << endl;
    int id = spawnPowerup(400.0f, 200.0f);
    cout << "Spawned: 1 (score_bonus)" << endl;
    collectPowerup(id, score);
    cout << "Collected: 1" << endl;
    int active = 0;
    for (int i = 0; i < MAX_PU; i++) if (pu_active[i]) active++;
    cout << "Active: " << active << endl;
    cout << "Pattern: powerup-entity" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "prints powerup pool size", expectedOutput: "Powerup pool: 3 slots" },
      { id: "t2", description: "prints spawned line", expectedOutput: "Spawned: 1 (score_bonus)" },
      { id: "t3", description: "prints collected line", expectedOutput: "Collected: 1" },
      { id: "t4", description: "active count is zero after collect", expectedOutput: "Active: 0" },
      { id: "t5", description: "prints pattern tag", expectedOutput: "Pattern: powerup-entity" },
    ],
    hints: [
      "In spawnPowerup: pu_active[i] = true sets the slot as occupied.",
      "After setting active, also set pu_x[i] = x and pu_y[i] = y before returning i.",
      "The active count loop uses a simple for-loop over MAX_PU checking pu_active[i].",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Power-Up Entities v0",
    type: "game_builder",
    instructions: `# Build: Power-Up Entities v0

## Mental Model
Power-ups are entities just like enemies and bullets: slot-based, pooled, zero heap. When an enemy dies, a 30% RNG check decides if a power-up spawns at the kill point. The power-up drifts downward at 30px/s. Collect it by flying over it.

## What's Already Here
Full shooter from L26 with particles, save/load, state sig, seeded RNG.

## Your Task

**TODO 1** — Implement spawnPowerup. Use findFreeSlot to find a free slot in the powerup pool, then set x, y, active=true and return the id.

**TODO 2** — In the enemy kill handler (after despawnEnemy), add a 30% spawn chance:
\`\`\`cpp
if (rng_range(10) < 3)
    spawnPowerup(world, world.enemy_x[e]+12, world.enemy_y[e]+12);
\`\`\`

**TODO 3** — After the bullet-enemy collision loop, add the collection check:
\`\`\`cpp
for (int i = 0; i < MAX_POWERUPS; i++) {
    if (!world.powerup_active[i]) continue;
    bool overlap = world.powerup_x[i] < world.ship_x + world.ship_w &&
                   world.powerup_x[i]+16 > world.ship_x &&
                   world.powerup_y[i] < world.ship_y + world.ship_h &&
                   world.powerup_y[i]+16 > world.ship_y;
    if (overlap) collectPowerup(world, i);
}
\`\`\`

## Did It Work?
Kill enemies until one drops a gold square. Fly over it to collect it. Your score jumps by 200 and the HUD PU count drops to zero.`,
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
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0; w.bullet_y[id] = 0;
}

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

// TODO 1: implement spawnPowerup(World& w, float x, float y)
// Use findFreeSlot(w.powerup_active, MAX_POWERUPS) to find a free slot
// Set powerup_x, powerup_y, powerup_active[id]=true and return id
EntityId spawnPowerup(World& w, float x, float y) {
    // your code here
    return INVALID_ID;
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

// POLICY: NO rand() — use rng_next()/rng_range() only
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }

void spawnWave(World& w) {
    rng_state = 42 + (unsigned int)w.wave * 7u;
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++) {
        float x = 20.0f + rng_range(740);
        spawnEnemy(w, x, 30, 18.0f + i * 6.0f, palette[i]);
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
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
    cout << "Powerup pool: 0 slots" << endl;  // fix: replace 0 with MAX_POWERUPS
    cout << "Pattern: powerup-entity" << endl;

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
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
                        // TODO 2: if rng_range(10) < 3, call spawnPowerup at (enemy_x[e]+12, enemy_y[e]+12)
                    }
                }
            }
            // TODO 3: loop over MAX_POWERUPS and collect if active powerup overlaps ship
            // Ship rect: ship_x, ship_y, ship_w, ship_h. Powerup rect: 16x16.
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
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 130, 20, YELLOW);
        { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(world.particles[i].life>0) pa++;
          DrawText(TextFormat("Parts: %d/30", pa), 10, 160, 16, ORANGE); }
        { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(world.powerup_active[i]) pu++;
          DrawText(TextFormat("PU: %d/3", pu), 10, 185, 16, GOLD); }
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
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0; w.bullet_y[id] = 0;
}

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

// POLICY: NO rand() — use rng_next()/rng_range() only
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }

void spawnWave(World& w) {
    rng_state = 42 + (unsigned int)w.wave * 7u;
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++) {
        float x = 20.0f + rng_range(740);
        spawnEnemy(w, x, 30, 18.0f + i * 6.0f, palette[i]);
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
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
    cout << "Powerup pool: " << MAX_POWERUPS << " slots" << endl;
    cout << "Pattern: powerup-entity" << endl;

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
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
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 130, 20, YELLOW);
        { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(world.particles[i].life>0) pa++;
          DrawText(TextFormat("Parts: %d/30", pa), 10, 160, 16, ORANGE); }
        { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(world.powerup_active[i]) pu++;
          DrawText(TextFormat("PU: %d/3", pu), 10, 185, 16, GOLD); }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "startup prints pool size", expectedOutput: "Powerup pool: 3 slots" },
      { id: "g2", description: "startup prints pattern tag", expectedOutput: "Pattern: powerup-entity" },
    ],
    hints: [
      "TODO 1: EntityId id = findFreeSlot(w.powerup_active, MAX_POWERUPS); then check if id is INVALID_ID.",
      "After the findFreeSlot check, set w.powerup_x[id] = x, w.powerup_y[id] = y, w.powerup_active[id] = true, then return id.",
      "TODO 2: after world.score += 100, add: if (rng_range(10) < 3) spawnPowerup(world, world.enemy_x[e]+12, world.enemy_y[e]+12);",
      "TODO 3: loop i from 0 to MAX_POWERUPS. Check powerup_active[i]. Then build the overlap bool with four comparisons.",
      "Powerup size is 16x16. The overlap check uses powerup_x[i] and powerup_y[i] against ship_x, ship_y, ship_w, ship_h.",
    ],
    estimatedMinutes: 20,
  },
};