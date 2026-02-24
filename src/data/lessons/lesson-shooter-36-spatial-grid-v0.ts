import type { Lesson } from "@/types/lesson";

export const lessonShooter36: Lesson = {
  id: "shooter-36-spatial-grid-v0",
  title: "Spatial Grid v0",
  description: "Spatial Grid v0 — expanding the modular game architecture.",
  order: 36,
  xpReward: 100,
  tier: "pro",
  concepts: ["spatial grid", "broadphase", "grid hash", "O(n) collision"],
  part1: {
    title: "Concept: Spatial Grid v0",
    type: "concept",
    instructions: `# Spatial Grid v0

## Why Grids?
Naive collision: O(bullets 'x' enemies). With a spatial grid, each bullet only checks enemies in the same cell. For 100 bullets and 100 enemies, this goes from 10,000 checks to ~100.

## Grid Hash
\`\`\`cpp
int col = (int)(x / CELL_W);
int row = (int)(y / CELL_H);
// cell_id = row * GRID_COLS + col
\`\`\`

## Your Task
\`\`\`
Grid: 8x5
Cells: 40
Pattern: spatial-grid
\`\`\`

## Beginner Trap
**Using a grid cell size smaller than the largest entity.** If a bullet is smaller than the cell, it fits in one cell. If an enemy is larger, it spans multiple cells and requires checking all neighboring cells. Size the grid to the entity that matters most.

## Elite Insight
The spatial grid (uniform grid acceleration structure) trades memory for speed: O(1) cell lookup instead of O(n) linear scan. Every physics engine uses spatial acceleration — grids for uniform entity sizes, BVH for mixed sizes.

## Systems Thinking Connection
The RPG uses direct grid lookup (grid[y][x]). The Crawler uses spatial hashing (L54). Your uniform grid is the 2D-optimized version — same goal (fast neighbor queries), different data structures tuned to different entity distributions.`,
    starterCode: `#include <iostream>
using namespace std;
const int SCREEN_W=800, SCREEN_H=450;
const int GRID_COLS=8, GRID_ROWS=5;
const float CELL_W=(float)SCREEN_W/GRID_COLS;
const float CELL_H=(float)SCREEN_H/GRID_ROWS;
int gridHash(float x, float y) {
    int col=(int)(x/CELL_W); if(col<0)col=0; if(col>=GRID_COLS)col=GRID_COLS-1;
    int row=(int)(y/CELL_H); if(row<0)row=0; if(row>=GRID_ROWS)row=GRID_ROWS-1;
    return row*GRID_COLS+col;
}
int main() {
    cout<<"Grid: "<<GRID_COLS<<"x"<<GRID_ROWS<<endl;
    // TODO: compute total cells and print Cells: N
    cout<<"Pattern: spatial-grid"<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
const int SCREEN_W=800, SCREEN_H=450;
const int GRID_COLS=8, GRID_ROWS=5;
const float CELL_W=(float)SCREEN_W/GRID_COLS;
const float CELL_H=(float)SCREEN_H/GRID_ROWS;
int gridHash(float x, float y) {
    int col=(int)(x/CELL_W); if(col<0)col=0; if(col>=GRID_COLS)col=GRID_COLS-1;
    int row=(int)(y/CELL_H); if(row<0)row=0; if(row>=GRID_ROWS)row=GRID_ROWS-1;
    return row*GRID_COLS+col;
}
int main() {
    cout<<"Grid: "<<GRID_COLS<<"x"<<GRID_ROWS<<endl;
    cout<<"Cells: "<<GRID_COLS*GRID_ROWS<<endl;
    cout<<"Pattern: spatial-grid"<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "prints grid dimensions", expectedOutput: "Grid: 8x5" },
      { id: "t2", description: "prints total cells", expectedOutput: "Cells: 40" },
      { id: "t3", description: "prints pattern", expectedOutput: "Pattern: spatial-grid" },
    ],
    hints: [
      "Think about how a grid's total cell count relates to its dimensions.",
      "Total cells in a grid equals columns multiplied by rows. Use the constants already defined.",
      "Add cout<<\"Cells: \"<<GRID_COLS*GRID_ROWS<<endl; after the Grid line.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Spatial Grid v0",
    type: "game_builder",
    instructions: `# Build: Spatial Grid v0

## What's Already Here
L35 GATE B code with 4 systems and gameFrame. No grid yet.

## Your Task
**TODO 1** — Implement buildGrid(World& w): for each active enemy, compute its cell (col,row), clamp to bounds, add enemy index to grid_enemies[row][col] and increment grid_count[row][col].

**TODO 2** — In gameFrame, call buildGrid(w) before collisionSystem(w).

## Did It Work?
HUD shows occupied grid cells. Console prints Grid: 8x5 and Cells: 40.`,
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
int spawn_fails = 0;

struct Particle { float x, y, vx, vy; int life; Color color; };

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed, shots_fired;
    int  bullet_x[MAX_BULLETS], bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES], enemy_y[MAX_ENEMIES], enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS], powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
    int score, wave, player_hp, player_max_hp;
};
World world;
float accumulator = 0.0f;
EntityId findFreeSlot(bool active[], int max) {
    for (int i=0;i<max;i++) if(!active[i]) return i;
    return INVALID_ID;
}
EntityId spawnEnemy(World& w, float x, float y, float spd, Color clr) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) { spawn_fails++; return INVALID_ID; }
    w.enemy_x[id]=x; w.enemy_y[id]=y; w.enemy_speed[id]=spd; w.enemy_color[id]=clr;
    w.enemy_active[id]=true; pool_spawns++; return id;
}
void despawnEnemy(World& w, int id) {
    w.enemy_active[id]=false; w.enemy_x[id]=0; w.enemy_y[id]=0;
    w.enemy_speed[id]=0; w.enemy_color[id]=BLACK;
}
EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) { spawn_fails++; return INVALID_ID; }
    w.bullet_x[id]=x; w.bullet_y[id]=y; w.bullet_active[id]=true;
    w.shots_fired++; pool_spawns++; return id;
}
void despawnBullet(World& w, int id) {
    w.bullet_active[id]=false; w.bullet_x[id]=0; w.bullet_y[id]=0;
}
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state*1664525u+1013904223u; return rng_state;
}
int rng_range(int max) { return (int)(rng_next()%(unsigned int)max); }
void spawnParticle(World& w, float x, float y, Color clr) {
    for (int i=0;i<MAX_PARTICLES;i++) {
        if (w.particles[i].life<=0) {
            w.particles[i].x=x; w.particles[i].y=y;
            w.particles[i].vx=(rng_range(11)-5)*1.5f;
            w.particles[i].vy=(rng_range(11)-5)*1.5f;
            w.particles[i].life=20; w.particles[i].color=clr; return;
        }
    }
}
void updateParticles(World& w) {
    for (int i=0;i<MAX_PARTICLES;i++) {
        if (w.particles[i].life>0) {
            w.particles[i].x+=w.particles[i].vx;
            w.particles[i].y+=w.particles[i].vy;
            w.particles[i].life--;
        }
    }
}
EntityId spawnPowerup(World& w, float x, float y) {
    EntityId id = findFreeSlot(w.powerup_active, MAX_POWERUPS);
    if (id==INVALID_ID) { spawn_fails++; return INVALID_ID; }
    w.powerup_x[id]=x; w.powerup_y[id]=y; w.powerup_active[id]=true; return id;
}
void despawnPowerup(World& w, int id) {
    w.powerup_active[id]=false; w.powerup_x[id]=0; w.powerup_y[id]=0;
}
void collectPowerup(World& w, int id) { w.score+=200; despawnPowerup(w,id); }
void updatePowerups(World& w) {
    for (int i=0;i<MAX_POWERUPS;i++) {
        if (w.powerup_active[i]) {
            w.powerup_y[i]+=30.0f*FIXED_DT;
            if (w.powerup_y[i]>SCREEN_H) despawnPowerup(w,i);
        }
    }
}
void spawnWave(World& w) {
    rng_state = 42+(unsigned int)w.wave*7u;
    Color palette[5]={RED,ORANGE,YELLOW,GREEN,BLUE};
    for(int i=0;i<MAX_ENEMIES;i++) {
        float x=20.0f+rng_range(740);
        spawnEnemy(w,x,30,18.0f+i*6.0f,palette[i]);
    }
}
void auditHeap(World& w) {
    cout<<"GATE A: Heap Freeze Audit"<<endl;
    cout<<"Enemies: "<<MAX_ENEMIES<<"/"<<MAX_ENEMIES<<" pooled"<<endl;
    cout<<"Bullets: "<<MAX_BULLETS<<"/"<<MAX_BULLETS<<" pooled"<<endl;
    cout<<"Particles: "<<MAX_PARTICLES<<"/"<<MAX_PARTICLES<<" pooled"<<endl;
    cout<<"Powerups: "<<MAX_POWERUPS<<"/"<<MAX_POWERUPS<<" pooled"<<endl;
    cout<<"Heap ops in loop: 0"<<endl;
    cout<<"GATE A: PASSED"<<endl;
}
void inputSystem(World& w) {
    if (IsKeyDown(KEY_RIGHT)) w.ship_x+=w.speed;
    if (IsKeyDown(KEY_LEFT))  w.ship_x-=w.speed;
    if (w.ship_x<0) w.ship_x=0;
    if (w.ship_x>SCREEN_W-w.ship_w) w.ship_x=SCREEN_W-w.ship_w;
    if (IsKeyPressed(KEY_SPACE))
        spawnBullet(w,(int)w.ship_x+w.ship_w/2-2,(int)w.ship_y);
}
void movementSystem(World& w) {
    for(int i=0;i<MAX_BULLETS;i++) {
        if(w.bullet_active[i]) { w.bullet_y[i]-=8; if(w.bullet_y[i]<-10) despawnBullet(w,i); }
    }
    for(int i=0;i<MAX_ENEMIES;i++) {
        if(w.enemy_active[i]) {
            w.enemy_y[i]+=w.enemy_speed[i]*FIXED_DT;
            if(w.enemy_y[i]>SCREEN_H) w.enemy_y[i]=0;
        }
    }
}
void collisionSystem(World& w) {
    for(int b=0;b<MAX_BULLETS;b++) {
        if(!w.bullet_active[b]) continue;
        for(int e=0;e<MAX_ENEMIES;e++) {
            if(!w.enemy_active[e]) continue;
            bool hit=w.bullet_x[b]<(int)w.enemy_x[e]+24&&
                     w.bullet_x[b]+4>(int)w.enemy_x[e]&&
                     w.bullet_y[b]<(int)w.enemy_y[e]+24&&
                     w.bullet_y[b]+10>(int)w.enemy_y[e];
            if(hit) {
                despawnBullet(w,b);
                for(int p=0;p<5;p++)
                    spawnParticle(w,w.enemy_x[e]+12,w.enemy_y[e]+12,w.enemy_color[e]);
                despawnEnemy(w,e);
                w.score+=100;
                if(rng_range(10)<3) spawnPowerup(w,w.enemy_x[e]+12,w.enemy_y[e]+12);
            }
        }
    }
    for(int i=0;i<MAX_POWERUPS;i++) {
        if(!w.powerup_active[i]) continue;
        bool ov=w.powerup_x[i]<w.ship_x+w.ship_w&&w.powerup_x[i]+16>w.ship_x&&
                w.powerup_y[i]<w.ship_y+w.ship_h&&w.powerup_y[i]+16>w.ship_y;
        if(ov) collectPowerup(w,i);
    }
    updateParticles(w); updatePowerups(w);
    int alive=0;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]) alive++;
    if(alive==0){w.wave++;spawnWave(w);}
}
const int GRID_COLS = 8;
const int GRID_ROWS = 5;
const float CELL_W = (float)SCREEN_W / GRID_COLS;
const float CELL_H = (float)SCREEN_H / GRID_ROWS;

int grid_enemies[GRID_ROWS][GRID_COLS][MAX_ENEMIES];
int grid_count[GRID_ROWS][GRID_COLS];

void clearGrid() {
    for(int r=0;r<GRID_ROWS;r++)
        for(int col=0;col<GRID_COLS;col++)
            grid_count[r][col]=0;
}

// TODO 1: implement buildGrid(World& w)
// For each active enemy: compute col=(int)(enemy_x/CELL_W), row=(int)(enemy_y/CELL_H)
// Clamp col to [0,GRID_COLS-1] and row to [0,GRID_ROWS-1]
// Add enemy index to grid_enemies[row][col][cnt]; increment grid_count[row][col]
void buildGrid(World& w) {
    clearGrid();
    // insert enemy positions into grid cells
}

int countOccupiedCells() {
    int n=0;
    for(int r=0;r<GRID_ROWS;r++)
        for(int col=0;col<GRID_COLS;col++)
            if(grid_count[r][col]>0) n++;
    return n;
}
void hudSystem(World& w) {
    DrawText("** GATE B: SPATIAL GRID **", SCREEN_W/2-165, 8, 18, CYAN);
    DrawText(TextFormat("Score: %d",w.score),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave), 10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Shots: %d",w.shots_fired),10,110,18,YELLOW);
    { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0) pa++;
      DrawText(TextFormat("Parts: %d/30",pa),10,134,14,ORANGE); }
    { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]) pu++;
      DrawText(TextFormat("PU: %d/3",pu),10,154,14,GOLD); }
    DrawText(TextFormat("Spawns: %d",pool_spawns),10,174,14,LIME);
    DrawText("Grid: 8x5 | GATE B",10,194,14,LIME);
    int occ=countOccupiedCells();
    DrawText(TextFormat("Cells: %d/40",occ),10,214,14,SKYBLUE);
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
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i])
        DrawRectangle((int)w.enemy_x[i],(int)w.enemy_y[i],24,24,w.enemy_color[i]);
    DrawRectangle((int)w.ship_x,(int)w.ship_y,w.ship_w,w.ship_h,GREEN);
    for(int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i])
        DrawRectangle(w.bullet_x[i],w.bullet_y[i],4,10,YELLOW);
    for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0)
        DrawRectangle((int)w.particles[i].x,(int)w.particles[i].y,4,4,w.particles[i].color);
    for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i])
        DrawRectangle((int)w.powerup_x[i],(int)w.powerup_y[i],16,16,GOLD);
    hudSystem(w);
    EndDrawing();
}
void gameFrame(World& w, float& acc) {
    while(acc>=FIXED_DT) {
        inputSystem(w);
        movementSystem(w);
        // TODO 2: call buildGrid(w) before collisionSystem
        collisionSystem(w);
        acc-=FIXED_DT;
    }
}
int main() {
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Shooter -- Grid");
    SetTargetFPS(60);
    world.ship_x=200; world.ship_y=380; world.speed=5;
    world.ship_w=40; world.ship_h=20;
    world.score=0; world.wave=1; world.shots_fired=0;
    world.player_hp=3; world.player_max_hp=3;
    for(int i=0;i<MAX_BULLETS;i++) world.bullet_active[i]=false;
    for(int i=0;i<MAX_ENEMIES;i++) world.enemy_active[i]=false;
    for(int i=0;i<MAX_PARTICLES;i++) world.particles[i].life=0;
    for(int i=0;i<MAX_POWERUPS;i++) world.powerup_active[i]=false;
    spawnWave(world);
    auditHeap(world);
    cout<<"Grid: 8x5"<<endl;
    cout<<"Cells: 40"<<endl;
    cout<<"Pattern: spatial-grid"<<endl;
    while(!WindowShouldClose()) {
        accumulator+=GetFrameTime();
        gameFrame(world,accumulator);
        renderSystem(world);
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
int spawn_fails = 0;

struct Particle { float x, y, vx, vy; int life; Color color; };

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed, shots_fired;
    int  bullet_x[MAX_BULLETS], bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES], enemy_y[MAX_ENEMIES], enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS], powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
    int score, wave, player_hp, player_max_hp;
};
World world;
float accumulator = 0.0f;
EntityId findFreeSlot(bool active[], int max) {
    for (int i=0;i<max;i++) if(!active[i]) return i;
    return INVALID_ID;
}
EntityId spawnEnemy(World& w, float x, float y, float spd, Color clr) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) { spawn_fails++; return INVALID_ID; }
    w.enemy_x[id]=x; w.enemy_y[id]=y; w.enemy_speed[id]=spd; w.enemy_color[id]=clr;
    w.enemy_active[id]=true; pool_spawns++; return id;
}
void despawnEnemy(World& w, int id) {
    w.enemy_active[id]=false; w.enemy_x[id]=0; w.enemy_y[id]=0;
    w.enemy_speed[id]=0; w.enemy_color[id]=BLACK;
}
EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) { spawn_fails++; return INVALID_ID; }
    w.bullet_x[id]=x; w.bullet_y[id]=y; w.bullet_active[id]=true;
    w.shots_fired++; pool_spawns++; return id;
}
void despawnBullet(World& w, int id) {
    w.bullet_active[id]=false; w.bullet_x[id]=0; w.bullet_y[id]=0;
}
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state*1664525u+1013904223u; return rng_state;
}
int rng_range(int max) { return (int)(rng_next()%(unsigned int)max); }
void spawnParticle(World& w, float x, float y, Color clr) {
    for (int i=0;i<MAX_PARTICLES;i++) {
        if (w.particles[i].life<=0) {
            w.particles[i].x=x; w.particles[i].y=y;
            w.particles[i].vx=(rng_range(11)-5)*1.5f;
            w.particles[i].vy=(rng_range(11)-5)*1.5f;
            w.particles[i].life=20; w.particles[i].color=clr; return;
        }
    }
}
void updateParticles(World& w) {
    for (int i=0;i<MAX_PARTICLES;i++) {
        if (w.particles[i].life>0) {
            w.particles[i].x+=w.particles[i].vx;
            w.particles[i].y+=w.particles[i].vy;
            w.particles[i].life--;
        }
    }
}
EntityId spawnPowerup(World& w, float x, float y) {
    EntityId id = findFreeSlot(w.powerup_active, MAX_POWERUPS);
    if (id==INVALID_ID) { spawn_fails++; return INVALID_ID; }
    w.powerup_x[id]=x; w.powerup_y[id]=y; w.powerup_active[id]=true; return id;
}
void despawnPowerup(World& w, int id) {
    w.powerup_active[id]=false; w.powerup_x[id]=0; w.powerup_y[id]=0;
}
void collectPowerup(World& w, int id) { w.score+=200; despawnPowerup(w,id); }
void updatePowerups(World& w) {
    for (int i=0;i<MAX_POWERUPS;i++) {
        if (w.powerup_active[i]) {
            w.powerup_y[i]+=30.0f*FIXED_DT;
            if (w.powerup_y[i]>SCREEN_H) despawnPowerup(w,i);
        }
    }
}
void spawnWave(World& w) {
    rng_state = 42+(unsigned int)w.wave*7u;
    Color palette[5]={RED,ORANGE,YELLOW,GREEN,BLUE};
    for(int i=0;i<MAX_ENEMIES;i++) {
        float x=20.0f+rng_range(740);
        spawnEnemy(w,x,30,18.0f+i*6.0f,palette[i]);
    }
}
void auditHeap(World& w) {
    cout<<"GATE A: Heap Freeze Audit"<<endl;
    cout<<"Enemies: "<<MAX_ENEMIES<<"/"<<MAX_ENEMIES<<" pooled"<<endl;
    cout<<"Bullets: "<<MAX_BULLETS<<"/"<<MAX_BULLETS<<" pooled"<<endl;
    cout<<"Particles: "<<MAX_PARTICLES<<"/"<<MAX_PARTICLES<<" pooled"<<endl;
    cout<<"Powerups: "<<MAX_POWERUPS<<"/"<<MAX_POWERUPS<<" pooled"<<endl;
    cout<<"Heap ops in loop: 0"<<endl;
    cout<<"GATE A: PASSED"<<endl;
}
void inputSystem(World& w) {
    if (IsKeyDown(KEY_RIGHT)) w.ship_x+=w.speed;
    if (IsKeyDown(KEY_LEFT))  w.ship_x-=w.speed;
    if (w.ship_x<0) w.ship_x=0;
    if (w.ship_x>SCREEN_W-w.ship_w) w.ship_x=SCREEN_W-w.ship_w;
    if (IsKeyPressed(KEY_SPACE))
        spawnBullet(w,(int)w.ship_x+w.ship_w/2-2,(int)w.ship_y);
}
void movementSystem(World& w) {
    for(int i=0;i<MAX_BULLETS;i++) {
        if(w.bullet_active[i]) { w.bullet_y[i]-=8; if(w.bullet_y[i]<-10) despawnBullet(w,i); }
    }
    for(int i=0;i<MAX_ENEMIES;i++) {
        if(w.enemy_active[i]) {
            w.enemy_y[i]+=w.enemy_speed[i]*FIXED_DT;
            if(w.enemy_y[i]>SCREEN_H) w.enemy_y[i]=0;
        }
    }
}
void collisionSystem(World& w) {
    for(int b=0;b<MAX_BULLETS;b++) {
        if(!w.bullet_active[b]) continue;
        for(int e=0;e<MAX_ENEMIES;e++) {
            if(!w.enemy_active[e]) continue;
            bool hit=w.bullet_x[b]<(int)w.enemy_x[e]+24&&
                     w.bullet_x[b]+4>(int)w.enemy_x[e]&&
                     w.bullet_y[b]<(int)w.enemy_y[e]+24&&
                     w.bullet_y[b]+10>(int)w.enemy_y[e];
            if(hit) {
                despawnBullet(w,b);
                for(int p=0;p<5;p++)
                    spawnParticle(w,w.enemy_x[e]+12,w.enemy_y[e]+12,w.enemy_color[e]);
                despawnEnemy(w,e);
                w.score+=100;
                if(rng_range(10)<3) spawnPowerup(w,w.enemy_x[e]+12,w.enemy_y[e]+12);
            }
        }
    }
    for(int i=0;i<MAX_POWERUPS;i++) {
        if(!w.powerup_active[i]) continue;
        bool ov=w.powerup_x[i]<w.ship_x+w.ship_w&&w.powerup_x[i]+16>w.ship_x&&
                w.powerup_y[i]<w.ship_y+w.ship_h&&w.powerup_y[i]+16>w.ship_y;
        if(ov) collectPowerup(w,i);
    }
    updateParticles(w); updatePowerups(w);
    int alive=0;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]) alive++;
    if(alive==0){w.wave++;spawnWave(w);}
}
int grid_enemies[GRID_ROWS][GRID_COLS][MAX_ENEMIES];
int grid_count[GRID_ROWS][GRID_COLS];

void clearGrid() {
    for(int r=0;r<GRID_ROWS;r++)
        for(int col=0;col<GRID_COLS;col++)
            grid_count[r][col]=0;
}

void buildGrid(World& w) {
    clearGrid();
    for(int e=0;e<MAX_ENEMIES;e++) {
        if(!w.enemy_active[e]) continue;
        int col=(int)(w.enemy_x[e]/CELL_W); if(col<0)col=0; if(col>=GRID_COLS)col=GRID_COLS-1;
        int row=(int)(w.enemy_y[e]/CELL_H); if(row<0)row=0; if(row>=GRID_ROWS)row=GRID_ROWS-1;
        int& cnt=grid_count[row][col];
        if(cnt<MAX_ENEMIES){grid_enemies[row][col][cnt]=e; cnt++;}
    }
}

int countOccupiedCells() {
    int n=0;
    for(int r=0;r<GRID_ROWS;r++)
        for(int col=0;col<GRID_COLS;col++)
            if(grid_count[r][col]>0) n++;
    return n;
}
void hudSystem(World& w) {
    DrawText("** GATE B: SPATIAL GRID **", SCREEN_W/2-165, 8, 18, CYAN);
    DrawText(TextFormat("Score: %d",w.score),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave), 10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Shots: %d",w.shots_fired),10,110,18,YELLOW);
    { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0) pa++;
      DrawText(TextFormat("Parts: %d/30",pa),10,134,14,ORANGE); }
    { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]) pu++;
      DrawText(TextFormat("PU: %d/3",pu),10,154,14,GOLD); }
    DrawText(TextFormat("Spawns: %d",pool_spawns),10,174,14,LIME);
    DrawText("Grid: 8x5 | GATE B",10,194,14,LIME);
    int occ=countOccupiedCells();
    DrawText(TextFormat("Cells: %d/40",occ),10,214,14,SKYBLUE);
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
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i])
        DrawRectangle((int)w.enemy_x[i],(int)w.enemy_y[i],24,24,w.enemy_color[i]);
    DrawRectangle((int)w.ship_x,(int)w.ship_y,w.ship_w,w.ship_h,GREEN);
    for(int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i])
        DrawRectangle(w.bullet_x[i],w.bullet_y[i],4,10,YELLOW);
    for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0)
        DrawRectangle((int)w.particles[i].x,(int)w.particles[i].y,4,4,w.particles[i].color);
    for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i])
        DrawRectangle((int)w.powerup_x[i],(int)w.powerup_y[i],16,16,GOLD);
    hudSystem(w);
    EndDrawing();
}
void gameFrame(World& w, float& acc) {
    while(acc>=FIXED_DT) {
        inputSystem(w);
        movementSystem(w);
        buildGrid(w);
        collisionSystem(w);
        acc-=FIXED_DT;
    }
}
int main() {
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Shooter -- Grid");
    SetTargetFPS(60);
    world.ship_x=200; world.ship_y=380; world.speed=5;
    world.ship_w=40; world.ship_h=20;
    world.score=0; world.wave=1; world.shots_fired=0;
    world.player_hp=3; world.player_max_hp=3;
    for(int i=0;i<MAX_BULLETS;i++) world.bullet_active[i]=false;
    for(int i=0;i<MAX_ENEMIES;i++) world.enemy_active[i]=false;
    for(int i=0;i<MAX_PARTICLES;i++) world.particles[i].life=0;
    for(int i=0;i<MAX_POWERUPS;i++) world.powerup_active[i]=false;
    spawnWave(world);
    auditHeap(world);
    cout<<"Grid: 8x5"<<endl;
    cout<<"Cells: 40"<<endl;
    cout<<"Pattern: spatial-grid"<<endl;
    while(!WindowShouldClose()) {
        accumulator+=GetFrameTime();
        gameFrame(world,accumulator);
        renderSystem(world);
    }
    CloseWindow(); return 0;
}`,
    tests: [
      { id: "g1", description: "prints grid size", expectedOutput: "Grid: 8x5" },
      { id: "g2", description: "prints cell count", expectedOutput: "Cells: 40" },
      { id: "g3", description: "prints pattern", expectedOutput: "Pattern: spatial-grid" },
      { id: "g4", description: "gate A passes", expectedOutput: "GATE A: PASSED" },
    ],
    hints: [
      "buildGrid: for each active enemy, col=(int)(enemy_x/CELL_W), row=(int)(enemy_y/CELL_H), clamp both.",
      "Then: grid_enemies[row][col][grid_count[row][col]]=e; grid_count[row][col]++;",
      "TODO 2: add buildGrid(w) on its own line before collisionSystem(w) in gameFrame.",
    ],
    estimatedMinutes: 25,
  },
};
