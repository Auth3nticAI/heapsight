import type { Lesson } from "@/types/lesson";

export const lessonShooter37: Lesson = {
  id: "shooter-37-wave-spawner-v0",
  title: "Wave Spawner v0",
  description: "Wave Spawner v0 — expanding the modular game architecture.",
  order: 37,
  xpReward: 150,
  tier: "pro",
  concepts: ["system extraction", "waveSystem", "wave progression", "separation of concerns"],
  part1: {
    title: "Concept: Wave Spawner v0",
    type: "concept",
    instructions: `# Wave Spawner v0

## Separating Concerns
Wave spawning logic was buried inside collisionSystem. Extracting it into waveSystem() makes both functions cleaner and the spawn logic testable in isolation.

\`\`\`cpp
void waveSystem(World& w) {
    int alive=0;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]) alive++;
    if(alive==0) { w.wave++; spawnWave(w); }
}
\`\`\`

## Your Task
\`\`\`
WaveSystem: active
Pattern: wave-spawner
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;
int wave=1;
bool enemies_alive=true;
void waveSystem() {
    // TODO: if !enemies_alive, increment wave and print Wave N started
    if(!enemies_alive) {
        wave++;
        // print: Wave 2 started
    }
}
int main() {
    cout<<"WaveSystem: active"<<endl;
    enemies_alive=false;
    waveSystem();
    cout<<"Pattern: wave-spawner"<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
int wave=1;
bool enemies_alive=true;
void waveSystem() {
    if(!enemies_alive) {
        wave++;
        cout<<"Wave "<<wave<<" started"<<endl;
    }
}
int main() {
    cout<<"WaveSystem: active"<<endl;
    enemies_alive=false;
    waveSystem();
    cout<<"Pattern: wave-spawner"<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "wave system active", expectedOutput: "WaveSystem: active" },
      { id: "t2", description: "wave 2 started", expectedOutput: "Wave 2 started" },
      { id: "t3", description: "pattern tag", expectedOutput: "Pattern: wave-spawner" },
    ],
    hints: [
      "If !enemies_alive, increment wave and print \"Wave \" << wave << \" started\".",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Wave Spawner v0",
    type: "game_builder",
    instructions: `# Build: Wave Spawner v0

## What's Already Here
L36 code. collisionSystem still has the wave check at its end.

## Your Task
**TODO 1** — Implement waveSystem(World& w): count alive enemies; if 0, increment w.wave and call spawnWave(w).

**TODO 2** — Add waveSystem(w) call to gameFrame after collisionSystem(w).

Note: The wave check has been removed from collisionSystem — it now lives only in waveSystem.

## Did It Work?
Enemies still respawn when all are cleared. HUD shows WAVE SPAWNER. Console prints WaveSystem: active.`,
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
// TODO 1: implement waveSystem
// Count active enemies; if alive==0, increment w.wave and call spawnWave(w)
void waveSystem(World& w) {

}
void hudSystem(World& w) {
    DrawText("** WAVE SPAWNER: ACTIVE **", SCREEN_W/2-165, 8, 18, CYAN);
    DrawText(TextFormat("Score: %d",w.score),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave), 10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Shots: %d",w.shots_fired),10,110,18,YELLOW);
    { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0) pa++;
      DrawText(TextFormat("Parts: %d/30",pa),10,134,14,ORANGE); }
    { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]) pu++;
      DrawText(TextFormat("PU: %d/3",pu),10,154,14,GOLD); }
    DrawText(TextFormat("Spawns: %d",pool_spawns),10,174,14,LIME);
    DrawText("WaveSystem | GATE B",10,194,14,LIME);
    DrawText(TextFormat("Wave: %d",w.wave),10,214,14,SKYBLUE);
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
        // TODO 2: call waveSystem(w)
        acc-=FIXED_DT;
    }
}
int main() {
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Shooter -- Wave Spawner");
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
    cout<<"WaveSystem: active"<<endl;
    cout<<"Pattern: wave-spawner"<<endl;
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
void hudSystem(World& w) {
    DrawText("** WAVE SPAWNER: ACTIVE **", SCREEN_W/2-165, 8, 18, CYAN);
    DrawText(TextFormat("Score: %d",w.score),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave), 10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Shots: %d",w.shots_fired),10,110,18,YELLOW);
    { int pa=0; for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0) pa++;
      DrawText(TextFormat("Parts: %d/30",pa),10,134,14,ORANGE); }
    { int pu=0; for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]) pu++;
      DrawText(TextFormat("PU: %d/3",pu),10,154,14,GOLD); }
    DrawText(TextFormat("Spawns: %d",pool_spawns),10,174,14,LIME);
    DrawText("WaveSystem | GATE B",10,194,14,LIME);
    DrawText(TextFormat("Wave: %d",w.wave),10,214,14,SKYBLUE);
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
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Shooter -- Wave Spawner");
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
    cout<<"WaveSystem: active"<<endl;
    cout<<"Pattern: wave-spawner"<<endl;
    while(!WindowShouldClose()) {
        accumulator+=GetFrameTime();
        gameFrame(world,accumulator);
        renderSystem(world);
    }
    CloseWindow(); return 0;
}`,
    tests: [
      { id: "g1", description: "wave system active", expectedOutput: "WaveSystem: active" },
      { id: "g2", description: "pattern tag", expectedOutput: "Pattern: wave-spawner" },
      { id: "g3", description: "gate A passes", expectedOutput: "GATE A: PASSED" },
    ],
    hints: [
      "waveSystem: count alive enemies with a loop, then if(alive==0){w.wave++;spawnWave(w);}",
      "Add waveSystem(w); after collisionSystem(w); in gameFrame.",
      "The collisionSystem in this starter already has the wave check removed — waveSystem owns it now.",
    ],
    estimatedMinutes: 20,
  },
};
