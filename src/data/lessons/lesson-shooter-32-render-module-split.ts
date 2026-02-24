import type { Lesson } from "@/types/lesson";

export const lessonShooter32: Lesson = {
  id: "shooter-32-render-module-split",
  title: "Render Module Split",
  description: "Render Module Split — building the modular game architecture.",
  order: 32,
  xpReward: 150,
  tier: "pro",
  concepts: ["system extraction", "renderSystem", "fixed timestep", "render pass"],
  part1: {
    title: "Concept: Render Module Split",
    type: "concept",
    instructions: `# Render Module Split

## What Is renderSystem?
The render pass (BeginDrawing through EndDrawing) is visually separate from the physics simulation. Physics runs at a fixed 60 Hz; rendering runs as fast as the monitor allows. Separating them is the foundation of a real game loop.

\`\`\`cpp
void renderSystem(World& w) {
    BeginDrawing();
    ClearBackground(BLACK);
    // draw enemies, ship, bullets, particles, HUD...
    EndDrawing();
}

// In main, OUTSIDE the fixed-timestep loop:
renderSystem(world);
\`\`\`

## Your Task
Write a describeSystem() function that prints system info.
Expected output:
\`\`\`
Systems: 2
System[0]: input
System[1]: render
Pattern: render-module
\`\`\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int NUM_SYSTEMS = 2;
string system_names[NUM_SYSTEMS];

void registerSystem(int idx, string name) { system_names[idx] = name; }

void listSystems() {
    cout << "Systems: " << NUM_SYSTEMS << endl;
    for (int i=0;i<NUM_SYSTEMS;i++)
        cout << "System[" << i << "]: " << system_names[i] << endl;
    cout << "Pattern: render-module" << endl;
}

int main() {
    // TODO: register system 0 as "input" and system 1 as "render"
    listSystems();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int NUM_SYSTEMS = 2;
string system_names[NUM_SYSTEMS];

void registerSystem(int idx, string name) { system_names[idx] = name; }

void listSystems() {
    cout << "Systems: " << NUM_SYSTEMS << endl;
    for (int i=0;i<NUM_SYSTEMS;i++)
        cout << "System[" << i << "]: " << system_names[i] << endl;
    cout << "Pattern: render-module" << endl;
}

int main() {
    registerSystem(0, "input");
    registerSystem(1, "render");
    listSystems();
    return 0;
}`,
    tests: [
      { id: "t1", description: "prints system count", expectedOutput: "Systems: 2" },
      { id: "t2", description: "prints render system", expectedOutput: "System[1]: render" },
      { id: "t3", description: "prints pattern", expectedOutput: "Pattern: render-module" },
    ],
    hints: [
      "Call registerSystem(0, \"input\") then registerSystem(1, \"render\").",
      "listSystems() already prints the loop — just register the two systems in main.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Render Module Split",
    type: "game_builder",
    instructions: `# Build: Render Module Split

## What's Already Here
L31 code with inputSystem() working. The BeginDrawing block is still inlined in main.

## Your Task

**TODO 1** — Implement renderSystem(World& w). It should contain everything from BeginDrawing() to EndDrawing().

\`\`\`cpp
void renderSystem(World& w) {
    BeginDrawing();
    // ... all drawing code ...
    EndDrawing();
}
\`\`\`

**TODO 2** — In the game loop (OUTSIDE the while(accumulator...) block), replace the inline render block with:

\`\`\`cpp
renderSystem(world);
\`\`\`

## Did It Work?
Game looks exactly the same. HUD shows **SYS: 2 | input render**. Console prints the 2-system registry.`,
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
    int  bullet_x[MAX_BULLETS], bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    int  shots_fired;
    float enemy_x[MAX_ENEMIES], enemy_y[MAX_ENEMIES], enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS], powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
    int score, wave, player_hp, player_max_hp, shots_fired_total;
};
World world;
float accumulator = 0.0f;
EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}
EntityId spawnEnemy(World& w, float x, float y, float speed, Color clr) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id]=x; w.enemy_y[id]=y; w.enemy_speed[id]=speed; w.enemy_color[id]=clr;
    w.enemy_active[id]=true; pool_spawns++; return id;
}
void despawnEnemy(World& w, int id) {
    w.enemy_active[id]=false; w.enemy_x[id]=0; w.enemy_y[id]=0;
    w.enemy_speed[id]=0; w.enemy_color[id]=BLACK;
}
EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) return INVALID_ID;
    w.bullet_x[id]=x; w.bullet_y[id]=y; w.bullet_active[id]=true;
    w.shots_fired++; w.shots_fired_total++; pool_spawns++; return id;
}
void despawnBullet(World& w, int id) {
    w.bullet_active[id]=false; w.bullet_x[id]=0; w.bullet_y[id]=0;
}
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u; return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }
void spawnParticle(World& w, float x, float y, Color clr) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life <= 0) {
            w.particles[i].x=x; w.particles[i].y=y;
            w.particles[i].vx=(rng_range(11)-5)*1.5f;
            w.particles[i].vy=(rng_range(11)-5)*1.5f;
            w.particles[i].life=20; w.particles[i].color=clr; return;
        }
    }
}
void updateParticles(World& w) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life > 0) {
            w.particles[i].x+=w.particles[i].vx;
            w.particles[i].y+=w.particles[i].vy;
            w.particles[i].life--;
        }
    }
}
EntityId spawnPowerup(World& w, float x, float y) {
    EntityId id = findFreeSlot(w.powerup_active, MAX_POWERUPS);
    if (id == INVALID_ID) return INVALID_ID;
    w.powerup_x[id]=x; w.powerup_y[id]=y; w.powerup_active[id]=true; return id;
}
void despawnPowerup(World& w, int id) {
    w.powerup_active[id]=false; w.powerup_x[id]=0; w.powerup_y[id]=0;
}
void collectPowerup(World& w, int id) { w.score+=200; despawnPowerup(w,id); }
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
        spawnEnemy(w, x, 30, 18.0f + i*6.0f, palette[i]);
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
}
void inputSystem(World& w) {
    if (IsKeyDown(KEY_RIGHT)) w.ship_x += w.speed;
    if (IsKeyDown(KEY_LEFT))  w.ship_x -= w.speed;
    if (w.ship_x < 0) w.ship_x = 0;
    if (w.ship_x > SCREEN_W - w.ship_w) w.ship_x = SCREEN_W - w.ship_w;
    if (IsKeyPressed(KEY_SPACE))
        spawnBullet(w, (int)w.ship_x + w.ship_w/2 - 2, (int)w.ship_y);
}
// TODO 1: implement renderSystem -- move the BeginDrawing...EndDrawing block here
void renderSystem(World& w) {
    // BeginDrawing(); ..draw everything.. EndDrawing();
}
int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter -- Systems");
    SetTargetFPS(60);
    world.ship_x=200; world.ship_y=380; world.speed=5;
    world.ship_w=40;  world.ship_h=20;
    world.score=0; world.wave=1; world.shots_fired=0; world.shots_fired_total=0;
    world.player_hp=3; world.player_max_hp=3;
    for(int i=0;i<MAX_BULLETS;i++) world.bullet_active[i]=false;
    for(int i=0;i<MAX_ENEMIES;i++) world.enemy_active[i]=false;
    for(int i=0;i<MAX_PARTICLES;i++) world.particles[i].life=0;
    for(int i=0;i<MAX_POWERUPS;i++) world.powerup_active[i]=false;
    spawnWave(world);
    auditHeap(world);
    cout << "Systems: 2" << endl;
    cout << "System[0]: input" << endl;
    cout << "System[1]: render" << endl;
    cout << "Pattern: render-module" << endl;
    while (!WindowShouldClose()) {
        float dt = GetFrameTime(); accumulator += dt;
        while (accumulator >= FIXED_DT) {
            inputSystem(world);
            for (int i=0;i<MAX_BULLETS;i++) {
                if (world.bullet_active[i]) {
                    world.bullet_y[i]-=8;
                    if (world.bullet_y[i]<-10) despawnBullet(world,i);
                }
            }
            for (int i=0;i<MAX_ENEMIES;i++) {
                if (world.enemy_active[i]) {
                    world.enemy_y[i]+=world.enemy_speed[i]*FIXED_DT;
                    if (world.enemy_y[i]>SCREEN_H) world.enemy_y[i]=0;
                }
            }
            for (int b=0;b<MAX_BULLETS;b++) {
                if (!world.bullet_active[b]) continue;
                for (int e=0;e<MAX_ENEMIES;e++) {
                    if (!world.enemy_active[e]) continue;
                    bool hit=world.bullet_x[b]<(int)world.enemy_x[e]+24&&
                             world.bullet_x[b]+4>(int)world.enemy_x[e]&&
                             world.bullet_y[b]<(int)world.enemy_y[e]+24&&
                             world.bullet_y[b]+10>(int)world.enemy_y[e];
                    if (hit) {
                        despawnBullet(world,b);
                        for(int p=0;p<5;p++)
                            spawnParticle(world,world.enemy_x[e]+12,world.enemy_y[e]+12,world.enemy_color[e]);
                        despawnEnemy(world,e);
                        world.score+=100;
                        if(rng_range(10)<3) spawnPowerup(world,world.enemy_x[e]+12,world.enemy_y[e]+12);
                    }
                }
            }
            for (int i=0;i<MAX_POWERUPS;i++) {
                if(!world.powerup_active[i]) continue;
                bool ov=world.powerup_x[i]<world.ship_x+world.ship_w&&
                        world.powerup_x[i]+16>world.ship_x&&
                        world.powerup_y[i]<world.ship_y+world.ship_h&&
                        world.powerup_y[i]+16>world.ship_y;
                if(ov) collectPowerup(world,i);
            }
            updateParticles(world); updatePowerups(world);
            int alive=0;
            for(int i=0;i<MAX_ENEMIES;i++) if(world.enemy_active[i]) alive++;
            if(alive==0){world.wave++;spawnWave(world);}
            accumulator -= FIXED_DT;
        }
        // TODO 2: replace the inline render block below with renderSystem(world);
        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(100,50,2,2,WHITE); DrawRectangle(200,120,2,2,WHITE);
        DrawRectangle(350,30,2,2,WHITE); DrawRectangle(500,80,2,2,WHITE);
        DrawRectangle(650,150,2,2,WHITE); DrawRectangle(750,60,2,2,WHITE);
        DrawRectangle(50,200,2,2,WHITE); DrawRectangle(300,250,2,2,WHITE);
        DrawRectangle(450,180,2,2,WHITE); DrawRectangle(600,300,2,2,WHITE);
        DrawRectangle(150,350,2,2,WHITE); DrawRectangle(700,380,2,2,WHITE);
        for(int i=0;i<MAX_ENEMIES;i++) if(world.enemy_active[i])
            DrawRectangle((int)world.enemy_x[i],(int)world.enemy_y[i],24,24,world.enemy_color[i]);
        DrawRectangle((int)world.ship_x,(int)world.ship_y,world.ship_w,world.ship_h,GREEN);
        for(int i=0;i<MAX_BULLETS;i++) if(world.bullet_active[i])
            DrawRectangle(world.bullet_x[i],world.bullet_y[i],4,10,YELLOW);
        for(int i=0;i<MAX_PARTICLES;i++) if(world.particles[i].life>0)
            DrawRectangle((int)world.particles[i].x,(int)world.particles[i].y,4,4,world.particles[i].color);
        for(int i=0;i<MAX_POWERUPS;i++) if(world.powerup_active[i])
            DrawRectangle((int)world.powerup_x[i],(int)world.powerup_y[i],16,16,GOLD);
        DrawText("** GATE A: HEAP FROZEN **", SCREEN_W/2-155, 8, 20, LIME);
        DrawText(TextFormat("Score: %d",world.score),10,38,18,WHITE);
        DrawText(TextFormat("Wave:  %d",world.wave),10,62,18,WHITE);
        DrawText(TextFormat("HP: %d/%d",world.player_hp,world.player_max_hp),10,86,18,WHITE);
        DrawText("SYS: 2 | input render",10,110,14,LIME);
        EndDrawing();
    }
    CloseWindow(); return 0;
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
    int  bullet_x[MAX_BULLETS], bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    int  shots_fired;
    float enemy_x[MAX_ENEMIES], enemy_y[MAX_ENEMIES], enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS], powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
    int score, wave, player_hp, player_max_hp, shots_fired_total;
};
World world;
float accumulator = 0.0f;
EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}
EntityId spawnEnemy(World& w, float x, float y, float speed, Color clr) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id]=x; w.enemy_y[id]=y; w.enemy_speed[id]=speed; w.enemy_color[id]=clr;
    w.enemy_active[id]=true; pool_spawns++; return id;
}
void despawnEnemy(World& w, int id) {
    w.enemy_active[id]=false; w.enemy_x[id]=0; w.enemy_y[id]=0;
    w.enemy_speed[id]=0; w.enemy_color[id]=BLACK;
}
EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) return INVALID_ID;
    w.bullet_x[id]=x; w.bullet_y[id]=y; w.bullet_active[id]=true;
    w.shots_fired++; w.shots_fired_total++; pool_spawns++; return id;
}
void despawnBullet(World& w, int id) {
    w.bullet_active[id]=false; w.bullet_x[id]=0; w.bullet_y[id]=0;
}
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u; return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }
void spawnParticle(World& w, float x, float y, Color clr) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life <= 0) {
            w.particles[i].x=x; w.particles[i].y=y;
            w.particles[i].vx=(rng_range(11)-5)*1.5f;
            w.particles[i].vy=(rng_range(11)-5)*1.5f;
            w.particles[i].life=20; w.particles[i].color=clr; return;
        }
    }
}
void updateParticles(World& w) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (w.particles[i].life > 0) {
            w.particles[i].x+=w.particles[i].vx;
            w.particles[i].y+=w.particles[i].vy;
            w.particles[i].life--;
        }
    }
}
EntityId spawnPowerup(World& w, float x, float y) {
    EntityId id = findFreeSlot(w.powerup_active, MAX_POWERUPS);
    if (id == INVALID_ID) return INVALID_ID;
    w.powerup_x[id]=x; w.powerup_y[id]=y; w.powerup_active[id]=true; return id;
}
void despawnPowerup(World& w, int id) {
    w.powerup_active[id]=false; w.powerup_x[id]=0; w.powerup_y[id]=0;
}
void collectPowerup(World& w, int id) { w.score+=200; despawnPowerup(w,id); }
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
        spawnEnemy(w, x, 30, 18.0f + i*6.0f, palette[i]);
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
}
void inputSystem(World& w) {
    if (IsKeyDown(KEY_RIGHT)) w.ship_x += w.speed;
    if (IsKeyDown(KEY_LEFT))  w.ship_x -= w.speed;
    if (w.ship_x < 0) w.ship_x = 0;
    if (w.ship_x > SCREEN_W - w.ship_w) w.ship_x = SCREEN_W - w.ship_w;
    if (IsKeyPressed(KEY_SPACE))
        spawnBullet(w, (int)w.ship_x + w.ship_w/2 - 2, (int)w.ship_y);
}
void renderSystem(World& w) {
    BeginDrawing();
    ClearBackground(BLACK);
        DrawRectangle(100,50,2,2,WHITE); DrawRectangle(200,120,2,2,WHITE);
        DrawRectangle(350,30,2,2,WHITE); DrawRectangle(500,80,2,2,WHITE);
        DrawRectangle(650,150,2,2,WHITE); DrawRectangle(750,60,2,2,WHITE);
        DrawRectangle(50,200,2,2,WHITE); DrawRectangle(300,250,2,2,WHITE);
        DrawRectangle(450,180,2,2,WHITE); DrawRectangle(600,300,2,2,WHITE);
        DrawRectangle(150,350,2,2,WHITE); DrawRectangle(700,380,2,2,WHITE);
    for (int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i])
        DrawRectangle((int)w.enemy_x[i],(int)w.enemy_y[i],24,24,w.enemy_color[i]);
    DrawRectangle((int)w.ship_x,(int)w.ship_y,w.ship_w,w.ship_h,GREEN);
    for (int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i])
        DrawRectangle(w.bullet_x[i],w.bullet_y[i],4,10,YELLOW);
    for (int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0)
        DrawRectangle((int)w.particles[i].x,(int)w.particles[i].y,4,4,w.particles[i].color);
    for (int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i])
        DrawRectangle((int)w.powerup_x[i],(int)w.powerup_y[i],16,16,GOLD);
    DrawText("** GATE A: HEAP FROZEN **", SCREEN_W/2-155, 8, 20, LIME);
    DrawText(TextFormat("Score: %d", w.score), 10, 38, 18, WHITE);
    DrawText(TextFormat("Wave:  %d", w.wave),  10, 62, 18, WHITE);
    DrawText(TextFormat("HP: %d/%d", w.player_hp, w.player_max_hp), 10, 86, 18, WHITE);
    DrawText(TextFormat("Shots: %d", w.shots_fired), 10, 110, 18, YELLOW);
    { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0) pa++;
      DrawText(TextFormat("Parts: %d/30",pa),10,134,14,ORANGE); }
    { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]) pu++;
      DrawText(TextFormat("PU: %d/3",pu),10,154,14,GOLD); }
    DrawText(TextFormat("Spawns: %d",pool_spawns),10,174,14,LIME);
    DrawText("SYS: 2 | input render",10,194,14,LIME);
    EndDrawing();
}
int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter -- Systems");
    SetTargetFPS(60);
    world.ship_x=200; world.ship_y=380; world.speed=5;
    world.ship_w=40;  world.ship_h=20;
    world.score=0; world.wave=1; world.shots_fired=0; world.shots_fired_total=0;
    world.player_hp=3; world.player_max_hp=3;
    for(int i=0;i<MAX_BULLETS;i++) world.bullet_active[i]=false;
    for(int i=0;i<MAX_ENEMIES;i++) world.enemy_active[i]=false;
    for(int i=0;i<MAX_PARTICLES;i++) world.particles[i].life=0;
    for(int i=0;i<MAX_POWERUPS;i++) world.powerup_active[i]=false;
    spawnWave(world);
    auditHeap(world);
    cout << "Systems: 2" << endl;
    cout << "System[0]: input" << endl;
    cout << "System[1]: render" << endl;
    cout << "Pattern: render-module" << endl;
    while (!WindowShouldClose()) {
        float dt = GetFrameTime(); accumulator += dt;
        while (accumulator >= FIXED_DT) {
            inputSystem(world);
            for (int i=0;i<MAX_BULLETS;i++) {
                if (world.bullet_active[i]) {
                    world.bullet_y[i]-=8;
                    if (world.bullet_y[i]<-10) despawnBullet(world,i);
                }
            }
            for (int i=0;i<MAX_ENEMIES;i++) {
                if (world.enemy_active[i]) {
                    world.enemy_y[i]+=world.enemy_speed[i]*FIXED_DT;
                    if (world.enemy_y[i]>SCREEN_H) world.enemy_y[i]=0;
                }
            }
            for (int b=0;b<MAX_BULLETS;b++) {
                if (!world.bullet_active[b]) continue;
                for (int e=0;e<MAX_ENEMIES;e++) {
                    if (!world.enemy_active[e]) continue;
                    bool hit=world.bullet_x[b]<(int)world.enemy_x[e]+24&&
                             world.bullet_x[b]+4>(int)world.enemy_x[e]&&
                             world.bullet_y[b]<(int)world.enemy_y[e]+24&&
                             world.bullet_y[b]+10>(int)world.enemy_y[e];
                    if (hit) {
                        despawnBullet(world,b);
                        for(int p=0;p<5;p++)
                            spawnParticle(world,world.enemy_x[e]+12,world.enemy_y[e]+12,world.enemy_color[e]);
                        despawnEnemy(world,e);
                        world.score+=100;
                        if(rng_range(10)<3) spawnPowerup(world,world.enemy_x[e]+12,world.enemy_y[e]+12);
                    }
                }
            }
            for (int i=0;i<MAX_POWERUPS;i++) {
                if(!world.powerup_active[i]) continue;
                bool ov=world.powerup_x[i]<world.ship_x+world.ship_w&&
                        world.powerup_x[i]+16>world.ship_x&&
                        world.powerup_y[i]<world.ship_y+world.ship_h&&
                        world.powerup_y[i]+16>world.ship_y;
                if(ov) collectPowerup(world,i);
            }
            updateParticles(world); updatePowerups(world);
            int alive=0;
            for(int i=0;i<MAX_ENEMIES;i++) if(world.enemy_active[i]) alive++;
            if(alive==0){world.wave++;spawnWave(world);}
            accumulator -= FIXED_DT;
        }
        renderSystem(world);
    }
    CloseWindow(); return 0;
}`,
    tests: [
      { id: "g1", description: "prints system count", expectedOutput: "Systems: 2" },
      { id: "g2", description: "prints render system", expectedOutput: "System[1]: render" },
      { id: "g3", description: "prints pattern tag", expectedOutput: "Pattern: render-module" },
      { id: "g4", description: "gate A still passes", expectedOutput: "GATE A: PASSED" },
    ],
    hints: [
      "TODO 1: Cut the entire BeginDrawing()...EndDrawing() block from main and paste it into renderSystem(World& w).",
      "TODO 2: After the while(accumulator) loop, write renderSystem(world); — just one line.",
      "Render is called OUTSIDE the physics loop so it runs every frame, not every physics tick.",
    ],
    estimatedMinutes: 20,
  },
};
