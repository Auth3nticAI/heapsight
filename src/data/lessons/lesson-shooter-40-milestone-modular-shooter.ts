import type { Lesson } from "@/types/lesson";

export const lessonShooter40: Lesson = {
  id: "shooter-40-milestone-modular-shooter",
  title: "Milestone: Modular Shooter",
  description: "Milestone: Modular Shooter — expanding the modular game architecture.",
  order: 40,
  xpReward: 300,
  tier: "pro",
  concepts: ["GATE B", "milestone", "modular audit", "system inventory"],
  part1: {
    title: "Concept: Milestone: Modular Shooter",
    type: "concept",
    instructions: `# Milestone: Modular Shooter

## GATE B Complete
You have built a fully modular shooter with 5 named systems, a spatial grid, wave spawner, HUD system, and error handler. GATE B certifies this architecture is production-grade.

## Your Task
Implement modularAudit() that prints the full system inventory.

\`\`\`
GATE B: Modular Shooter
Systems: 5
System[0]: input
...
GATE B: PASSED
Pattern: modular-gate
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;
void modularAudit() {
    cout<<"GATE B: Modular Shooter"<<endl;
    // TODO: print all 5 systems, Grid: 8x5, WaveSystem, HudSystem, ErrHandler
    // TODO: print GATE B: PASSED
    cout<<"Pattern: modular-gate"<<endl;
}
int main() { modularAudit(); return 0; }`,
    solutionCode: `#include <iostream>
using namespace std;
void modularAudit() {
    cout<<"GATE B: Modular Shooter"<<endl;
    cout<<"Systems: 5"<<endl;
    cout<<"System[0]: input"<<endl;
    cout<<"System[1]: movement"<<endl;
    cout<<"System[2]: collision"<<endl;
    cout<<"System[3]: wave"<<endl;
    cout<<"System[4]: render"<<endl;
    cout<<"Grid: 8x5"<<endl;
    cout<<"WaveSystem: active"<<endl;
    cout<<"HudSystem: active"<<endl;
    cout<<"ErrHandler: active"<<endl;
    cout<<"GATE B: PASSED"<<endl;
    cout<<"Pattern: modular-gate"<<endl;
}
int main() { modularAudit(); return 0; }`,
    tests: [
      { id: "t1", description: "GATE B header", expectedOutput: "GATE B: Modular Shooter" },
      { id: "t2", description: "5 systems", expectedOutput: "Systems: 5" },
      { id: "t3", description: "GATE B passed", expectedOutput: "GATE B: PASSED" },
      { id: "t4", description: "pattern", expectedOutput: "Pattern: modular-gate" },
    ],
    hints: [
      "Print all 5 system lines between 'Systems: 5' and 'Grid: 8x5'. Then WaveSystem, HudSystem, ErrHandler, GATE B: PASSED.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Milestone: Modular Shooter",
    type: "game_builder",
    instructions: `# Build: Milestone: Modular Shooter

## GATE B Complete
This is the Phase 4 milestone. Implement modularAudit() and call it at startup to earn GATE B.

## Your Task
**TODO** — Implement modularAudit() to print the full system inventory (see Part 1). Then call it after errorAudit() in main.

## Did It Work?
Console prints the full GATE B audit. HUD banner reads GATE B: MODULAR SHOOTER in gold. You've completed Phase 4.`,
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
void errorAudit() {
    cout<<"ErrHandler: active"<<endl;
    if(spawn_fails==0) cout<<"Spawn: OK"<<endl;
    else cout<<"Spawn: ERRORS "<<spawn_fails<<endl;
    cout<<"Pattern: error-handling"<<endl;
}
void modularAudit() {
    cout<<"GATE B: Modular Shooter"<<endl;
    // TODO: print Systems: 5, each System[i] name, Grid, WaveSystem, HudSystem, ErrHandler
    // Then GATE B: PASSED and Pattern: modular-gate
}
void hudSystem(World& w) {
    DrawText("** GATE B: MODULAR SHOOTER **", SCREEN_W/2-180, 8, 18, GOLD);
    DrawText(TextFormat("Score: %d",w.score),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave), 10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Shots: %d",w.shots_fired),10,110,18,YELLOW);
    { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0) pa++;
      DrawText(TextFormat("Parts: %d/30",pa),10,134,14,ORANGE); }
    { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]) pu++;
      DrawText(TextFormat("PU: %d/3",pu),10,154,14,GOLD); }
    DrawText(TextFormat("Fails: %d",spawn_fails),10,174,14,(spawn_fails>0?RED:LIME));
    DrawText("GATE B: PASSED",10,194,14,GOLD);
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
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Shooter -- GATE B");
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
    auditHeap(world); errorAudit();
    // TODO: call modularAudit()
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
void modularAudit() {
    cout<<"GATE B: Modular Shooter"<<endl;
    cout<<"Systems: 5"<<endl;
    cout<<"System[0]: input"<<endl;
    cout<<"System[1]: movement"<<endl;
    cout<<"System[2]: collision"<<endl;
    cout<<"System[3]: wave"<<endl;
    cout<<"System[4]: render"<<endl;
    cout<<"Grid: 8x5"<<endl;
    cout<<"WaveSystem: active"<<endl;
    cout<<"HudSystem: active"<<endl;
    cout<<"ErrHandler: active"<<endl;
    cout<<"GATE B: PASSED"<<endl;
    cout<<"Pattern: modular-gate"<<endl;
}
void hudSystem(World& w) {
    DrawText("** GATE B: MODULAR SHOOTER **", SCREEN_W/2-180, 8, 18, GOLD);
    DrawText(TextFormat("Score: %d",w.score),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave), 10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Shots: %d",w.shots_fired),10,110,18,YELLOW);
    { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0) pa++;
      DrawText(TextFormat("Parts: %d/30",pa),10,134,14,ORANGE); }
    { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]) pu++;
      DrawText(TextFormat("PU: %d/3",pu),10,154,14,GOLD); }
    DrawText(TextFormat("Fails: %d",spawn_fails),10,174,14,(spawn_fails>0?RED:LIME));
    DrawText("GATE B: PASSED",10,194,14,GOLD);
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
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Shooter -- GATE B");
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
    auditHeap(world); errorAudit(); modularAudit();
    while(!WindowShouldClose()) {
        accumulator+=GetFrameTime();
        gameFrame(world,accumulator);
        renderSystem(world);
    }
    CloseWindow(); return 0;
}`,
    tests: [
      { id: "g1", description: "GATE B header", expectedOutput: "GATE B: Modular Shooter" },
      { id: "g2", description: "5 systems", expectedOutput: "Systems: 5" },
      { id: "g3", description: "GATE B passed", expectedOutput: "GATE B: PASSED" },
      { id: "g4", description: "pattern", expectedOutput: "Pattern: modular-gate" },
    ],
    hints: [
      "Copy the Part 1 solution body directly into modularAudit() — it's the same output.",
      "Call modularAudit() after errorAudit(); in main.",
      "GATE B: PASSED must appear before Pattern: modular-gate.",
    ],
    estimatedMinutes: 20,
  },
};
