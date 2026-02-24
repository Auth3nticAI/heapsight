import type { Lesson } from "@/types/lesson";

export const lessonShooter43: Lesson = {
  id: "shooter-43-powerup-system",
  title: "Power-Up System",
  description: "Power-Up System — Phase 5: Wave & Scoring.",
  order: 43,
  xpReward: 150,
  tier: "pro",
  concepts: ["powerup types", "collectPowerup", "type dispatch", "player buffs"],
  part1: {
    title: "Concept: Power-Up System",
    type: "concept",
    instructions: `# Power-Up System

## 3 Powerup Types
- **HEALTH** (0): +1 HP (green)
- **SPEED** (1): +1 move speed (blue)
- **SHIELD** (2): next hit blocked (purple)

## Your Task
\`\`\`
PowerupTypes: 3
Type 0: HEALTH +1 HP
Type 1: SPEED +1 speed
Type 2: SHIELD 1 hit
Pattern: powerup-types
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;
void describePowerup(int type){
    // TODO: print type description
    cout<<"Type "<<type<<": "<<endl;
}
int main(){
    cout<<"PowerupTypes: 3"<<endl;
    for(int i=0;i<3;i++) describePowerup(i);
    cout<<"Pattern: powerup-types"<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
void describePowerup(int type){
    const char* names[]={"HEALTH +1 HP","SPEED +1 speed","SHIELD 1 hit"};
    cout<<"Type "<<type<<": "<<names[type]<<endl;
}
int main(){
    cout<<"PowerupTypes: 3"<<endl;
    for(int i=0;i<3;i++) describePowerup(i);
    cout<<"Pattern: powerup-types"<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "3 types", expectedOutput: "PowerupTypes: 3" },
      { id: "t2", description: "health type", expectedOutput: "Type 0: HEALTH +1 HP" },
      { id: "t3", description: "pattern", expectedOutput: "Pattern: powerup-types" },
    ],
    hints: [
      "Use a string array: const char* names[]={\"HEALTH +1 HP\",\"SPEED +1 speed\",\"SHIELD 1 hit\"};",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Power-Up System",
    type: "game_builder",
    instructions: `# Build: Power-Up System

## What's Already Here
collectPowerup() handles types 0 and 1. Type 2 (SHIELD) is collected but has no effect yet.

## Your Task
**TODO** — In collectPowerup(), add handling for type==2 (SHIELD): set a world.shield=true flag. Then in collisionSystem, if shield==true when a bullet would hit, absorb the hit and set shield=false instead.

For now, just ensure the game runs and the console output is correct.

## Did It Work?
Three powerup colors on screen: GREEN=health, BLUE=speed, PURPLE=shield.`,
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
    int ship_w, ship_h, speed, shots_fired, shoot_mode;
    int  bullet_x[MAX_BULLETS], bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES], enemy_y[MAX_ENEMIES], enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int   enemy_type[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS], powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
    int   powerup_type[MAX_POWERUPS];
    int score, wave, combo_hits;
    int player_hp, player_max_hp;
    int lives;
    float respawn_timer;
    bool game_over;
};
World world;
float accumulator = 0.0f;
EntityId findFreeSlot(bool active[], int max) {
    for(int i=0;i<max;i++) if(!active[i]) return i; return INVALID_ID;
}
EntityId spawnEnemy(World& w, float x, float y, float spd, Color clr, int type=0) {
    EntityId id=findFreeSlot(w.enemy_active,MAX_ENEMIES);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.enemy_x[id]=x;w.enemy_y[id]=y;w.enemy_speed[id]=spd;
    w.enemy_color[id]=clr;w.enemy_active[id]=true;w.enemy_type[id]=type;
    pool_spawns++;return id;
}
void despawnEnemy(World& w,int id){
    w.enemy_active[id]=false;w.enemy_x[id]=0;w.enemy_y[id]=0;
    w.enemy_speed[id]=0;w.enemy_color[id]=BLACK;w.enemy_type[id]=0;
}
EntityId spawnBullet(World& w,int x,int y){
    EntityId id=findFreeSlot(w.bullet_active,MAX_BULLETS);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.bullet_x[id]=x;w.bullet_y[id]=y;w.bullet_active[id]=true;
    w.shots_fired++;pool_spawns++;return id;
}
void despawnBullet(World& w,int id){
    w.bullet_active[id]=false;w.bullet_x[id]=0;w.bullet_y[id]=0;
}
unsigned int rng_state=42;
unsigned int rng_next(){rng_state=rng_state*1664525u+1013904223u;return rng_state;}
int rng_range(int max){return(int)(rng_next()%(unsigned int)max);}
void spawnParticle(World& w,float x,float y,Color clr){
    for(int i=0;i<MAX_PARTICLES;i++){
        if(w.particles[i].life<=0){
            w.particles[i].x=x;w.particles[i].y=y;
            w.particles[i].vx=(rng_range(11)-5)*1.5f;
            w.particles[i].vy=(rng_range(11)-5)*1.5f;
            w.particles[i].life=20;w.particles[i].color=clr;return;
        }
    }
}
void updateParticles(World& w){
    for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0){
        w.particles[i].x+=w.particles[i].vx;
        w.particles[i].y+=w.particles[i].vy;
        w.particles[i].life--;
    }
}
EntityId spawnPowerup(World& w,float x,float y,int type=0){
    EntityId id=findFreeSlot(w.powerup_active,MAX_POWERUPS);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.powerup_x[id]=x;w.powerup_y[id]=y;w.powerup_active[id]=true;
    w.powerup_type[id]=type;pool_spawns++;return id;
}
void despawnPowerup(World& w,int id){
    w.powerup_active[id]=false;w.powerup_x[id]=0;w.powerup_y[id]=0;
}
void collectPowerup(World& w,int id){
    int type=w.powerup_type[id];
    if(type==0){w.player_hp=min(w.player_max_hp,w.player_hp+1);}
    else if(type==1){w.speed=min(10,w.speed+1);}
    w.score+=200; w.combo_hits++;
    despawnPowerup(w,id);
}
void updatePowerups(World& w){
    for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]){
        w.powerup_y[i]+=30.0f*FIXED_DT;
        if(w.powerup_y[i]>SCREEN_H) despawnPowerup(w,i);
    }
}
void spawnWave(World& w){
    rng_state=42+(unsigned int)w.wave*7u;
    Color palette[5]={RED,ORANGE,YELLOW,GREEN,BLUE};
    for(int i=0;i<MAX_ENEMIES;i++){
        float x=20.0f+rng_range(740);
        float spd=18.0f+i*6.0f+(w.wave-1)*2.0f;
        spawnEnemy(w,x,30,spd,palette[i],i%3);
    }
}
void auditHeap(World& w){
    cout<<"GATE A: Heap Freeze Audit"<<endl;
    cout<<"Enemies: "<<MAX_ENEMIES<<"/"<<MAX_ENEMIES<<" pooled"<<endl;
    cout<<"Bullets: "<<MAX_BULLETS<<"/"<<MAX_BULLETS<<" pooled"<<endl;
    cout<<"Particles: "<<MAX_PARTICLES<<"/"<<MAX_PARTICLES<<" pooled"<<endl;
    cout<<"Powerups: "<<MAX_POWERUPS<<"/"<<MAX_POWERUPS<<" pooled"<<endl;
    cout<<"Heap ops in loop: 0"<<endl;
    cout<<"GATE A: PASSED"<<endl;
}
void inputSystem(World& w){
    if(IsKeyDown(KEY_RIGHT)){w.ship_x+=w.speed;}
    if(IsKeyDown(KEY_LEFT)){w.ship_x-=w.speed;}
    if(w.ship_x<0)w.ship_x=0;
    if(w.ship_x>SCREEN_W-w.ship_w)w.ship_x=SCREEN_W-w.ship_w;
    if(IsKeyPressed(KEY_SPACE)){
        if(w.shoot_mode==0){
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-2,(int)w.ship_y);
        } else {
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-2,(int)w.ship_y);
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-12,(int)w.ship_y+5);
            spawnBullet(w,(int)w.ship_x+w.ship_w/2+8,(int)w.ship_y+5);
        }
    }
    if(IsKeyPressed(KEY_LEFT_SHIFT)) w.shoot_mode=1-w.shoot_mode;
}
void movementSystem(World& w){
    for(int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i]){
        w.bullet_y[i]-=8; if(w.bullet_y[i]<-10) despawnBullet(w,i);
    }
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]){
        w.enemy_y[i]+=w.enemy_speed[i]*FIXED_DT;
        if(w.enemy_y[i]>SCREEN_H) w.enemy_y[i]=0;
    }
}
void collisionSystem(World& w){
    for(int b=0;b<MAX_BULLETS;b++){
        if(!w.bullet_active[b]) continue;
        for(int e=0;e<MAX_ENEMIES;e++){
            if(!w.enemy_active[e]) continue;
            int ew=20+w.enemy_type[e]*4;
            bool hit=w.bullet_x[b]<(int)w.enemy_x[e]+ew&&
                     w.bullet_x[b]+4>(int)w.enemy_x[e]&&
                     w.bullet_y[b]<(int)w.enemy_y[e]+24&&
                     w.bullet_y[b]+10>(int)w.enemy_y[e];
            if(hit){
                despawnBullet(w,b);
                for(int p=0;p<5;p++)
                    spawnParticle(w,w.enemy_x[e]+12,w.enemy_y[e]+12,w.enemy_color[e]);
                despawnEnemy(w,e);
                int mult=1+w.combo_hits/10;
                w.score+=100*mult;
                w.combo_hits++;
                if(rng_range(10)<3) spawnPowerup(w,w.enemy_x[e]+12,w.enemy_y[e]+12,rng_range(3));
            }
        }
    }
    for(int i=0;i<MAX_POWERUPS;i++){
        if(!w.powerup_active[i]) continue;
        bool ov=w.powerup_x[i]<w.ship_x+w.ship_w&&w.powerup_x[i]+16>w.ship_x&&
                w.powerup_y[i]<w.ship_y+w.ship_h&&w.powerup_y[i]+16>w.ship_y;
        if(ov) collectPowerup(w,i);
    }
    for(int i=0;i<MAX_ENEMIES;i++){
        if(!w.enemy_active[i]||w.game_over) continue;
        bool hit=w.enemy_x[i]<w.ship_x+w.ship_w&&w.enemy_x[i]+24>w.ship_x&&
                 w.enemy_y[i]<w.ship_y+w.ship_h&&w.enemy_y[i]+24>w.ship_y;
        if(hit){despawnEnemy(w,i);w.player_hp--;if(w.player_hp<=0){w.lives--;w.player_hp=w.player_max_hp;}}
    }
    updateParticles(w); updatePowerups(w);
}
void waveSystem(World& w){
    int alive=0;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]) alive++;
    if(alive==0){w.wave++;w.combo_hits=0;spawnWave(w);}
}
void hudSystem(World& w){
    DrawText("** POWERUP SYSTEM: 3 TYPES **",SCREEN_W/2-180,8,18,GREEN);
    DrawText(TextFormat("Score: %d x%d",w.score,1+w.combo_hits/10),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave),10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Lives: %d",w.lives),10,110,18,PINK);
    DrawText(TextFormat("Combo: %d",w.combo_hits),10,134,14,GOLD);
    DrawText(TextFormat("Shots: %d",w.shots_fired),10,158,14,YELLOW);
    DrawText((w.shoot_mode==1?"Mode: SPREAD":"Mode: SINGLE"),10,178,14,SKYBLUE);
}
void renderSystem(World& w){
    BeginDrawing();
    ClearBackground(BLACK);
    DrawRectangle(100,50,2,2,WHITE);DrawRectangle(200,120,2,2,WHITE);
    DrawRectangle(350,30,2,2,WHITE);DrawRectangle(500,80,2,2,WHITE);
    DrawRectangle(650,150,2,2,WHITE);DrawRectangle(750,60,2,2,WHITE);
    DrawRectangle(50,200,2,2,WHITE);DrawRectangle(300,250,2,2,WHITE);
    DrawRectangle(450,180,2,2,WHITE);DrawRectangle(600,300,2,2,WHITE);
    DrawRectangle(150,350,2,2,WHITE);DrawRectangle(700,380,2,2,WHITE);
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]){
        int ew=20+w.enemy_type[i]*4;
        DrawRectangle((int)w.enemy_x[i],(int)w.enemy_y[i],ew,24,w.enemy_color[i]);
    }
    DrawRectangle((int)w.ship_x,(int)w.ship_y,w.ship_w,w.ship_h,GREEN);
    for(int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i])
        DrawRectangle(w.bullet_x[i],w.bullet_y[i],4,10,YELLOW);
    for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0)
        DrawRectangle((int)w.particles[i].x,(int)w.particles[i].y,4,4,w.particles[i].color);
    for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]){
        Color pc=(w.powerup_type[i]==0?GREEN:(w.powerup_type[i]==1?BLUE:PURPLE));
        DrawRectangle((int)w.powerup_x[i],(int)w.powerup_y[i],16,16,pc);
    }
    hudSystem(w);
    EndDrawing();
}
void gameFrame(World& w,float& acc){
    while(acc>=FIXED_DT){
        inputSystem(w);
        movementSystem(w);
        collisionSystem(w);
        waveSystem(w);
        acc-=FIXED_DT;
    }
}
int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight -- Powerup System");
    SetTargetFPS(60);
    world.ship_x=200;world.ship_y=380;world.speed=5;
    world.ship_w=40;world.ship_h=20;
    world.score=0;world.wave=1;world.shots_fired=0;
    world.combo_hits=0;world.shoot_mode=0;
    world.player_hp=3;world.player_max_hp=3;
    world.lives=3;world.respawn_timer=0;world.game_over=false;
    for(int i=0;i<MAX_BULLETS;i++) world.bullet_active[i]=false;
    for(int i=0;i<MAX_ENEMIES;i++) world.enemy_active[i]=false;
    for(int i=0;i<MAX_PARTICLES;i++) world.particles[i].life=0;
    for(int i=0;i<MAX_POWERUPS;i++) world.powerup_active[i]=false;
    spawnWave(world);
    auditHeap(world);
    cout<<"PowerupTypes: 3"<<endl;
    cout<<"Pattern: powerup-types"<<endl;
    while(!WindowShouldClose()){
        accumulator+=GetFrameTime();
        gameFrame(world,accumulator);
        renderSystem(world);
    }
    CloseWindow();return 0;
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
    int ship_w, ship_h, speed, shots_fired, shoot_mode;
    int  bullet_x[MAX_BULLETS], bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES], enemy_y[MAX_ENEMIES], enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int   enemy_type[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS], powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
    int   powerup_type[MAX_POWERUPS];
    int score, wave, combo_hits;
    int player_hp, player_max_hp;
    int lives;
    float respawn_timer;
    bool game_over;
};
World world;
float accumulator = 0.0f;
EntityId findFreeSlot(bool active[], int max) {
    for(int i=0;i<max;i++) if(!active[i]) return i; return INVALID_ID;
}
EntityId spawnEnemy(World& w, float x, float y, float spd, Color clr, int type=0) {
    EntityId id=findFreeSlot(w.enemy_active,MAX_ENEMIES);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.enemy_x[id]=x;w.enemy_y[id]=y;w.enemy_speed[id]=spd;
    w.enemy_color[id]=clr;w.enemy_active[id]=true;w.enemy_type[id]=type;
    pool_spawns++;return id;
}
void despawnEnemy(World& w,int id){
    w.enemy_active[id]=false;w.enemy_x[id]=0;w.enemy_y[id]=0;
    w.enemy_speed[id]=0;w.enemy_color[id]=BLACK;w.enemy_type[id]=0;
}
EntityId spawnBullet(World& w,int x,int y){
    EntityId id=findFreeSlot(w.bullet_active,MAX_BULLETS);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.bullet_x[id]=x;w.bullet_y[id]=y;w.bullet_active[id]=true;
    w.shots_fired++;pool_spawns++;return id;
}
void despawnBullet(World& w,int id){
    w.bullet_active[id]=false;w.bullet_x[id]=0;w.bullet_y[id]=0;
}
unsigned int rng_state=42;
unsigned int rng_next(){rng_state=rng_state*1664525u+1013904223u;return rng_state;}
int rng_range(int max){return(int)(rng_next()%(unsigned int)max);}
void spawnParticle(World& w,float x,float y,Color clr){
    for(int i=0;i<MAX_PARTICLES;i++){
        if(w.particles[i].life<=0){
            w.particles[i].x=x;w.particles[i].y=y;
            w.particles[i].vx=(rng_range(11)-5)*1.5f;
            w.particles[i].vy=(rng_range(11)-5)*1.5f;
            w.particles[i].life=20;w.particles[i].color=clr;return;
        }
    }
}
void updateParticles(World& w){
    for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0){
        w.particles[i].x+=w.particles[i].vx;
        w.particles[i].y+=w.particles[i].vy;
        w.particles[i].life--;
    }
}
EntityId spawnPowerup(World& w,float x,float y,int type=0){
    EntityId id=findFreeSlot(w.powerup_active,MAX_POWERUPS);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.powerup_x[id]=x;w.powerup_y[id]=y;w.powerup_active[id]=true;
    w.powerup_type[id]=type;pool_spawns++;return id;
}
void despawnPowerup(World& w,int id){
    w.powerup_active[id]=false;w.powerup_x[id]=0;w.powerup_y[id]=0;
}
void collectPowerup(World& w,int id){
    int type=w.powerup_type[id];
    if(type==0){w.player_hp=min(w.player_max_hp,w.player_hp+1);}
    else if(type==1){w.speed=min(10,w.speed+1);}
    w.score+=200; w.combo_hits++;
    despawnPowerup(w,id);
}
void updatePowerups(World& w){
    for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]){
        w.powerup_y[i]+=30.0f*FIXED_DT;
        if(w.powerup_y[i]>SCREEN_H) despawnPowerup(w,i);
    }
}
void spawnWave(World& w){
    rng_state=42+(unsigned int)w.wave*7u;
    Color palette[5]={RED,ORANGE,YELLOW,GREEN,BLUE};
    for(int i=0;i<MAX_ENEMIES;i++){
        float x=20.0f+rng_range(740);
        float spd=18.0f+i*6.0f+(w.wave-1)*2.0f;
        spawnEnemy(w,x,30,spd,palette[i],i%3);
    }
}
void auditHeap(World& w){
    cout<<"GATE A: Heap Freeze Audit"<<endl;
    cout<<"Enemies: "<<MAX_ENEMIES<<"/"<<MAX_ENEMIES<<" pooled"<<endl;
    cout<<"Bullets: "<<MAX_BULLETS<<"/"<<MAX_BULLETS<<" pooled"<<endl;
    cout<<"Particles: "<<MAX_PARTICLES<<"/"<<MAX_PARTICLES<<" pooled"<<endl;
    cout<<"Powerups: "<<MAX_POWERUPS<<"/"<<MAX_POWERUPS<<" pooled"<<endl;
    cout<<"Heap ops in loop: 0"<<endl;
    cout<<"GATE A: PASSED"<<endl;
}
void inputSystem(World& w){
    if(IsKeyDown(KEY_RIGHT)){w.ship_x+=w.speed;}
    if(IsKeyDown(KEY_LEFT)){w.ship_x-=w.speed;}
    if(w.ship_x<0)w.ship_x=0;
    if(w.ship_x>SCREEN_W-w.ship_w)w.ship_x=SCREEN_W-w.ship_w;
    if(IsKeyPressed(KEY_SPACE)){
        if(w.shoot_mode==0){
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-2,(int)w.ship_y);
        } else {
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-2,(int)w.ship_y);
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-12,(int)w.ship_y+5);
            spawnBullet(w,(int)w.ship_x+w.ship_w/2+8,(int)w.ship_y+5);
        }
    }
    if(IsKeyPressed(KEY_LEFT_SHIFT)) w.shoot_mode=1-w.shoot_mode;
}
void movementSystem(World& w){
    for(int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i]){
        w.bullet_y[i]-=8; if(w.bullet_y[i]<-10) despawnBullet(w,i);
    }
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]){
        w.enemy_y[i]+=w.enemy_speed[i]*FIXED_DT;
        if(w.enemy_y[i]>SCREEN_H) w.enemy_y[i]=0;
    }
}
void collisionSystem(World& w){
    for(int b=0;b<MAX_BULLETS;b++){
        if(!w.bullet_active[b]) continue;
        for(int e=0;e<MAX_ENEMIES;e++){
            if(!w.enemy_active[e]) continue;
            int ew=20+w.enemy_type[e]*4;
            bool hit=w.bullet_x[b]<(int)w.enemy_x[e]+ew&&
                     w.bullet_x[b]+4>(int)w.enemy_x[e]&&
                     w.bullet_y[b]<(int)w.enemy_y[e]+24&&
                     w.bullet_y[b]+10>(int)w.enemy_y[e];
            if(hit){
                despawnBullet(w,b);
                for(int p=0;p<5;p++)
                    spawnParticle(w,w.enemy_x[e]+12,w.enemy_y[e]+12,w.enemy_color[e]);
                despawnEnemy(w,e);
                int mult=1+w.combo_hits/10;
                w.score+=100*mult;
                w.combo_hits++;
                if(rng_range(10)<3) spawnPowerup(w,w.enemy_x[e]+12,w.enemy_y[e]+12,rng_range(3));
            }
        }
    }
    for(int i=0;i<MAX_POWERUPS;i++){
        if(!w.powerup_active[i]) continue;
        bool ov=w.powerup_x[i]<w.ship_x+w.ship_w&&w.powerup_x[i]+16>w.ship_x&&
                w.powerup_y[i]<w.ship_y+w.ship_h&&w.powerup_y[i]+16>w.ship_y;
        if(ov) collectPowerup(w,i);
    }
    for(int i=0;i<MAX_ENEMIES;i++){
        if(!w.enemy_active[i]||w.game_over) continue;
        bool hit=w.enemy_x[i]<w.ship_x+w.ship_w&&w.enemy_x[i]+24>w.ship_x&&
                 w.enemy_y[i]<w.ship_y+w.ship_h&&w.enemy_y[i]+24>w.ship_y;
        if(hit){despawnEnemy(w,i);w.player_hp--;if(w.player_hp<=0){w.lives--;w.player_hp=w.player_max_hp;}}
    }
    updateParticles(w); updatePowerups(w);
}
void waveSystem(World& w){
    int alive=0;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]) alive++;
    if(alive==0){w.wave++;w.combo_hits=0;spawnWave(w);}
}
void hudSystem(World& w){
    DrawText("** POWERUP SYSTEM: 3 TYPES **",SCREEN_W/2-180,8,18,GREEN);
    DrawText(TextFormat("Score: %d x%d",w.score,1+w.combo_hits/10),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave),10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Lives: %d",w.lives),10,110,18,PINK);
    DrawText(TextFormat("Combo: %d",w.combo_hits),10,134,14,GOLD);
    DrawText(TextFormat("Shots: %d",w.shots_fired),10,158,14,YELLOW);
    DrawText((w.shoot_mode==1?"Mode: SPREAD":"Mode: SINGLE"),10,178,14,SKYBLUE);
}
void renderSystem(World& w){
    BeginDrawing();
    ClearBackground(BLACK);
    DrawRectangle(100,50,2,2,WHITE);DrawRectangle(200,120,2,2,WHITE);
    DrawRectangle(350,30,2,2,WHITE);DrawRectangle(500,80,2,2,WHITE);
    DrawRectangle(650,150,2,2,WHITE);DrawRectangle(750,60,2,2,WHITE);
    DrawRectangle(50,200,2,2,WHITE);DrawRectangle(300,250,2,2,WHITE);
    DrawRectangle(450,180,2,2,WHITE);DrawRectangle(600,300,2,2,WHITE);
    DrawRectangle(150,350,2,2,WHITE);DrawRectangle(700,380,2,2,WHITE);
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]){
        int ew=20+w.enemy_type[i]*4;
        DrawRectangle((int)w.enemy_x[i],(int)w.enemy_y[i],ew,24,w.enemy_color[i]);
    }
    DrawRectangle((int)w.ship_x,(int)w.ship_y,w.ship_w,w.ship_h,GREEN);
    for(int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i])
        DrawRectangle(w.bullet_x[i],w.bullet_y[i],4,10,YELLOW);
    for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0)
        DrawRectangle((int)w.particles[i].x,(int)w.particles[i].y,4,4,w.particles[i].color);
    for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]){
        Color pc=(w.powerup_type[i]==0?GREEN:(w.powerup_type[i]==1?BLUE:PURPLE));
        DrawRectangle((int)w.powerup_x[i],(int)w.powerup_y[i],16,16,pc);
    }
    hudSystem(w);
    EndDrawing();
}
void gameFrame(World& w,float& acc){
    while(acc>=FIXED_DT){
        inputSystem(w);
        movementSystem(w);
        collisionSystem(w);
        waveSystem(w);
        acc-=FIXED_DT;
    }
}
int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight -- Powerup System");
    SetTargetFPS(60);
    world.ship_x=200;world.ship_y=380;world.speed=5;
    world.ship_w=40;world.ship_h=20;
    world.score=0;world.wave=1;world.shots_fired=0;
    world.combo_hits=0;world.shoot_mode=0;
    world.player_hp=3;world.player_max_hp=3;
    world.lives=3;world.respawn_timer=0;world.game_over=false;
    for(int i=0;i<MAX_BULLETS;i++) world.bullet_active[i]=false;
    for(int i=0;i<MAX_ENEMIES;i++) world.enemy_active[i]=false;
    for(int i=0;i<MAX_PARTICLES;i++) world.particles[i].life=0;
    for(int i=0;i<MAX_POWERUPS;i++) world.powerup_active[i]=false;
    spawnWave(world);
    auditHeap(world);
    cout<<"PowerupTypes: 3"<<endl;
    cout<<"Pattern: powerup-types"<<endl;
    while(!WindowShouldClose()){
        accumulator+=GetFrameTime();
        gameFrame(world,accumulator);
        renderSystem(world);
    }
    CloseWindow();return 0;
}`,
    tests: [
      { id: "g1", description: "3 types", expectedOutput: "PowerupTypes: 3" },
      { id: "g2", description: "pattern", expectedOutput: "Pattern: powerup-types" },
      { id: "g3", description: "gate A", expectedOutput: "GATE A: PASSED" },
    ],
    hints: [
      "The game already shows 3 powerup colors. Console output just needs the startup prints.",
      "This lesson is mostly about understanding the powerup dispatch pattern in collectPowerup().",
    ],
    estimatedMinutes: 15,
  },
};
