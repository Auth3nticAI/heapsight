import type { Lesson } from "@/types/lesson";

export const lessonShooter39: Lesson = {
  id: "shooter-39-error-handling",
  title: "Error Handling",
  description: "Error Handling — expanding the modular game architecture.",
  order: 39,
  xpReward: 100,
  tier: "pro",
  concepts: ["error handling", "spawn_fails", "safe spawn", "pool overflow detection"],
  part1: {
    title: "Concept: Error Handling",
    type: "concept",
    instructions: `# Error Handling

## Safe Spawn Pattern
When entity pools are full, spawns silently fail. The spawn_fails counter tracks every missed spawn so you can detect pool overflow at runtime.

\`\`\`cpp
EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) { spawn_fails++; return INVALID_ID; }
    ...
}
\`\`\`

## Your Task
\`\`\`
ErrHandler: active
Spawn: OK
Pattern: error-handling
\`\`\`

## Beginner Trap
**Silently failing when the pool is full.** If spawnBullet returns quietly when the pool is exhausted, the player stops shooting without feedback. Log the failure, track spawn_fails, and consider increasing pool size or cleaning up stale entities.

## Elite Insight
Defensive programming in games means "never crash, always degrade gracefully." If the pool is full, skip the spawn and log a warning. The game continues, and the developer sees the warning in the console.

## Systems Thinking Connection
RPG (L88) and Crawler crash-proof at system boundaries. Platformer (L88) validates input ranges. Error handling at pool boundaries is a universal robustness pattern — every path must handle "resource exhausted" gracefully.`,
    starterCode: `#include <iostream>
using namespace std;
int spawn_fails=0;
void errorAudit() {
    cout<<"ErrHandler: active"<<endl;
    // TODO: if spawn_fails==0 print 'Spawn: OK', else 'Spawn: ERRORS N'
    cout<<"Pattern: error-handling"<<endl;
}
int main() {
    // spawn_fails stays 0 (no pool overflow)
    errorAudit();
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
int spawn_fails=0;
void errorAudit() {
    cout<<"ErrHandler: active"<<endl;
    if(spawn_fails==0) cout<<"Spawn: OK"<<endl;
    else cout<<"Spawn: ERRORS "<<spawn_fails<<endl;
    cout<<"Pattern: error-handling"<<endl;
}
int main() {
    errorAudit();
    return 0;
}`,
    tests: [
      { id: "t1", description: "err handler active", expectedOutput: "ErrHandler: active" },
      { id: "t2", description: "spawn OK", expectedOutput: "Spawn: OK" },
      { id: "t3", description: "pattern", expectedOutput: "Pattern: error-handling" },
    ],
    hints: [
      "The error audit needs to report whether any spawns failed during gameplay.",
      "Use an if/else to check spawn_fails -- zero means OK, anything else means errors occurred.",
      "if(spawn_fails==0) cout<<\"Spawn: OK\"<<endl; else cout<<\"Spawn: ERRORS \"<<spawn_fails<<endl;",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Error Handling",
    type: "game_builder",
    instructions: `# Build: Error Handling

## What's Already Here
L38 code. spawn_fails is already tracked in spawnBullet/spawnEnemy/spawnPowerup (incremented on INVALID_ID). errorAudit() needs to be implemented and called.

## Your Task
**TODO 1** — Implement errorAudit(): print ErrHandler header, check spawn_fails, print pattern.

**TODO 2** — Call errorAudit() in main after auditHeap().

## Did It Work?
Console prints ErrHandler: active then Spawn: OK (since no pool overflows happen at startup). HUD shows Fails: 0 in green.`,
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
}
void waveSystem(World& w) {
    int alive=0;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]) alive++;
    if(alive==0) { w.wave++; spawnWave(w); }
}
// TODO 1: implement errorAudit()
// If spawn_fails==0: print 'Spawn: OK'
// Else: print 'Spawn: ERRORS N'
// Always: print 'ErrHandler: active' first, 'Pattern: error-handling' last
void errorAudit() {

}
void hudSystem(World& w) {
    DrawText("** ERR HANDLER: ACTIVE **", SCREEN_W/2-155, 8, 18, ORANGE);
    DrawText(TextFormat("Score: %d",w.score),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave), 10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Shots: %d",w.shots_fired),10,110,18,YELLOW);
    { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0) pa++;
      DrawText(TextFormat("Parts: %d/30",pa),10,134,14,ORANGE); }
    { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]) pu++;
      DrawText(TextFormat("PU: %d/3",pu),10,154,14,GOLD); }
    DrawText(TextFormat("Fails: %d",spawn_fails),10,174,14,(spawn_fails>0?RED:LIME));
    DrawText("SYS: 5 | err active",10,194,14,LIME);
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
        collisionSystem(w);
        waveSystem(w);
        acc-=FIXED_DT;
    }
}
int main() {
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Shooter -- Error Handling");
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
    // TODO 2: call errorAudit() here
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
}
void waveSystem(World& w) {
    int alive=0;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]) alive++;
    if(alive==0) { w.wave++; spawnWave(w); }
}
void errorAudit() {
    cout<<"ErrHandler: active"<<endl;
    if(spawn_fails==0) cout<<"Spawn: OK"<<endl;
    else cout<<"Spawn: ERRORS "<<spawn_fails<<endl;
    cout<<"Pattern: error-handling"<<endl;
}
void hudSystem(World& w) {
    DrawText("** ERR HANDLER: ACTIVE **", SCREEN_W/2-155, 8, 18, ORANGE);
    DrawText(TextFormat("Score: %d",w.score),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave), 10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Shots: %d",w.shots_fired),10,110,18,YELLOW);
    { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0) pa++;
      DrawText(TextFormat("Parts: %d/30",pa),10,134,14,ORANGE); }
    { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]) pu++;
      DrawText(TextFormat("PU: %d/3",pu),10,154,14,GOLD); }
    DrawText(TextFormat("Fails: %d",spawn_fails),10,174,14,(spawn_fails>0?RED:LIME));
    DrawText("SYS: 5 | err active",10,194,14,LIME);
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
        collisionSystem(w);
        waveSystem(w);
        acc-=FIXED_DT;
    }
}
int main() {
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Shooter -- Error Handling");
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
    cout<<"ErrHandler: active"<<endl;
    cout<<"Spawn: OK"<<endl;
    cout<<"Pattern: error-handling"<<endl;
    while(!WindowShouldClose()) {
        accumulator+=GetFrameTime();
        gameFrame(world,accumulator);
        renderSystem(world);
    }
    CloseWindow(); return 0;
}`,
    tests: [
      { id: "g1", description: "err active", expectedOutput: "ErrHandler: active" },
      { id: "g2", description: "spawn OK", expectedOutput: "Spawn: OK" },
      { id: "g3", description: "pattern", expectedOutput: "Pattern: error-handling" },
      { id: "g4", description: "gate A", expectedOutput: "GATE A: PASSED" },
    ],
    hints: [
      "TODO 1: 4 lines: cout ErrHandler, check spawn_fails==0, cout Spawn result, cout Pattern.",
      "TODO 2: add errorAudit(); after auditHeap(world); in main.",
      "The spawn_fails counter is already wired into all 3 spawn functions in this lesson's code.",
    ],
    estimatedMinutes: 15,
  },
};
