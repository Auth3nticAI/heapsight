import type { Lesson } from "@/types/lesson";

const lessonPlatformer36: Lesson = {
  id: "platformer-36-fixed-timestep-accumulator",
  title: "Fixed Timestep Accumulator",
  description: "Decouple physics from render rate with a wall-clock accumulator.",
  order: 36,
  xpReward: 100,
  tier: "pro",
  concepts: ["fixed-timestep", "accumulator", "framerate-independence"],
  part1: {
    title: "Concept: Fixed Timestep",
    type: "concept",
    instructions: `
# Fixed Timestep Accumulator

## The Problem
Your game loop runs at whatever speed the CPU allows. On a fast machine: 200 FPS. On a slow machine: 30 FPS. The physics behaves differently at different speeds — jump height changes, collision breaks.

## The Fix
An **accumulator** decouples render rate from physics rate:
\`\`\`
acc += GetFrameTime()
while(acc >= FIXED_DT): physicsStep(); acc -= FIXED_DT
render()
\`\`\`

## Elite Insight
Every shipping engine uses this. Valve, Epic, Nintendo — all tick physics at a fixed rate. John Carmack popularized it for Quake. Celeste uses it for pixel-perfect precision.

## Your Task
Print the accumulator behavior for a single 60Hz frame (dt=0.016s):


## Beginner Trap
**Using GetFrameTime() directly for physics calculations.** Variable frame delta means physics runs differently on 30fps and 144fps monitors. A fixed timestep accumulator runs physics at a constant rate (e.g., 1/60s) regardless of frame rate, consuming accumulated time in fixed-size bites.

## Systems Thinking Connection
The Shooter does not implement fixed timestep (entity movement is simpler). The RPG is turn-based (no physics timing). Fixed timestep is most critical in platformers where gravity, jump arcs, and collision resolution must be frame-rate independent.`,
    starterCode: `
#include <iostream>
using namespace std;
int main(){
    float FIXED_DT=1.0f/60.0f;
    // TODO 1: Print "DT: 0.016"
    // TODO 2: Print "Cap: 0.250"
    // TODO 3: Print "Ticks: 1"
    // TODO 4: Print "Timestep: fixed-accumulator"
    return 0;
}
`,
    solutionCode: `
#include <iostream>
using namespace std;
int main(){
    cout<<"DT: 0.016"<<endl;
    cout<<"Cap: 0.250"<<endl;
    cout<<"Ticks: 1"<<endl;
    cout<<"Timestep: fixed-accumulator"<<endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "DT line", expectedOutput: "DT: 0.016" },
      { id: "t2", description: "cap", expectedOutput: "Cap: 0.250" },
      { id: "t3", description: "ticks", expectedOutput: "Ticks: 1" },
      { id: "t4", description: "pattern", expectedOutput: "Timestep: fixed-accumulator" },
    ],
    hints: [
      "Print each value on its own line with cout<<...<<endl;",
      "DT: 0.016 is 1.0/60 rounded to 3 decimal places.",
      "The accumulator caps at 0.250 to prevent the spiral of death.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Fixed Timestep Accumulator",
    type: "game_builder",
    instructions: `
# Build: Fixed Timestep Accumulator

## What Changed
\`logicFrame(w)\` separates physics from rendering. Now you drive it with a wall-clock accumulator.

## Your Task
Replace the simple \`while\` loop with a real accumulator:

\`\`\`cpp
while(!WindowShouldClose()){
    acc += GetFrameTime();
    if(acc > 0.250f) acc = 0.250f;  // cap
    while(acc >= FIXED_DT){ logicFrame(w); acc -= FIXED_DT; }
    renderSystem(w);
}
\`\`\`

## Did It Work?
Physics still feels the same — but now it's framerate-independent. HUD shows FIXED TIMESTEP banner.
`,
    starterCode: `
#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800; const int SCREEN_H = 450;
const float GRAVITY = 800.0f; const float FIXED_DT = 1.0f/60.0f;
const int PLAYER_W = 24; const int PLAYER_H = 24;
const float JUMP_SPEED = 400.0f; const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f; const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f; const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f; const float JUMP_BUFFER = 0.1f;
const int TILE_SIZE = 32; const int COLS = 25; const int ROWS = 14;
const int NUM_LEVELS = 2; const int MAX_ENEMIES = 8; const int MAX_PARTICLES = 32;

const int LEVEL_DATA[NUM_LEVELS][ROWS][COLS] = {
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
    },
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,1},
    {1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    },
};

enum MoveState { GROUNDED, AIRBORNE };
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };
struct Player { float x,y,vx,vy; MoveState state; float coyote_timer,jump_buffer_timer; };
struct Enemy { float x,y,vx; bool active; };
Enemy enemies[MAX_ENEMIES]; int enemy_count=0;
struct World { Player player; int tilemap[ROWS][COLS]; int score; Command cmd; int level_index; };
World w;
MoveState prev_state=GROUNDED;
struct Particle { float x,y,vx,vy,life; bool active; };
Particle particles[MAX_PARTICLES];
int alloc_counter=0;
float acc=0.0f;
void countAlloc(){ alloc_counter++; }
unsigned lcg_state=0;
unsigned lcgNext(){ lcg_state=lcg_state*1664525u+1013904223u; return lcg_state; }

void scrambleCoins(World& w,unsigned seed){
    lcg_state=seed;
    for(int r=0;r<ROWS;r++) for(int c=0;c<COLS;c++) if(w.tilemap[r][c]==2) w.tilemap[r][c]=0;
    int placed=0,tries=0;
    while(placed<8&&tries<1000){ tries++;
        int r=lcgNext()%ROWS; int c=lcgNext()%COLS;
        if(w.tilemap[r][c]==0){ w.tilemap[r][c]=2; placed++; }
    }
}
void spawnEnemy(float x,float y,float vx){
    if(enemy_count>=MAX_ENEMIES) return;
    enemies[enemy_count++]={x,y,vx,true};
}
void updateEnemies(float dt){
    for(int i=0;i<enemy_count;i++){
        if(!enemies[i].active) continue;
        enemies[i].x+=enemies[i].vx*dt;
        if(enemies[i].x<32||enemies[i].x>SCREEN_W-64) enemies[i].vx=-enemies[i].vx;
    }
}
float ckpt_x=48.0f,ckpt_y=350.0f; int ckpt_score=0,ckpt_level=0; bool ckpt_valid=false;
void loadLevel(World& w){ memcpy(w.tilemap,LEVEL_DATA[w.level_index],sizeof(w.tilemap)); }
void saveCheckpoint(World& w){ ckpt_x=w.player.x; ckpt_y=w.player.y; ckpt_score=w.score; ckpt_level=w.level_index; ckpt_valid=true; }
void loadCheckpoint(World& w){
    if(!ckpt_valid) return;
    w.level_index=ckpt_level; loadLevel(w); scrambleCoins(w,42+ckpt_level*94);
    w.player.x=ckpt_x; w.player.y=ckpt_y; w.player.vx=0; w.player.vy=0; w.player.state=GROUNDED; w.score=ckpt_score;
}
void initWorld(World& w){
    w.player={48.0f,350.0f,0.0f,0.0f,GROUNDED,0.0f,0.0f};
    w.score=0; w.cmd=CMD_NONE; w.level_index=0;
    loadLevel(w); scrambleCoins(w,42);
    spawnEnemy(150,380,60.0f); spawnEnemy(350,380,-80.0f); spawnEnemy(550,350,70.0f);
}
void checkExitDoor(World& w){
    Player& p=w.player;
    int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
    int lc=(int)(p.x/TILE_SIZE); int rc=(int)((p.x+PLAYER_W-1)/TILE_SIZE);
    for(int r=tr;r<=br;r++) for(int c=lc;c<=rc;c++)
        if(r>=0&&r<ROWS&&c>=0&&c<COLS&&w.tilemap[r][c]==3){
            if(w.level_index<NUM_LEVELS-1){
                w.level_index++; loadLevel(w); scrambleCoins(w,42+w.level_index*94);
                w.player.x=48.0f; w.player.y=350.0f; w.player.vx=0; w.player.vy=0; w.player.state=GROUNDED;
            }
        }
}
void spawnParticles(float px,float py){
    for(int k=0;k<4;k++) for(int i=0;i<MAX_PARTICLES;i++)
        if(!particles[i].active){
            float pvx=(float)((int)(lcgNext()%120)-60);
            float pvy=-(float)(lcgNext()%80+20);
            particles[i]={px,py,pvx,pvy,0.4f,true}; break;
        }
}
void updateParticles(float dt){
    for(int i=0;i<MAX_PARTICLES;i++){
        if(!particles[i].active) continue;
        particles[i].x+=particles[i].vx*dt; particles[i].y+=particles[i].vy*dt;
        particles[i].life-=dt;
        if(particles[i].life<=0) particles[i].active=false;
    }
}
void markCoins(World& w){
    Player& p=w.player;
    int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
    int lc=(int)(p.x/TILE_SIZE); int rc=(int)((p.x+PLAYER_W-1)/TILE_SIZE);
    for(int r=tr;r<=br;r++) for(int c=lc;c<=rc;c++)
        if(r>=0&&r<ROWS&&c>=0&&c<COLS&&w.tilemap[r][c]==2) w.tilemap[r][c]=-1;
}
void cleanupPass(World& w){
    for(int r=0;r<ROWS;r++) for(int c=0;c<COLS;c++)
        if(w.tilemap[r][c]==-1){ w.tilemap[r][c]=0; w.score++; }
}
void checkTileCollisionH(World& w){
    Player& p=w.player;
    if(p.vx>0){
        int rc=(int)((p.x+PLAYER_W)/TILE_SIZE);
        int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
        if(rc<COLS&&tr>=0&&br>=0&&tr<ROWS&&br<ROWS)
            if(w.tilemap[tr][rc]==1||w.tilemap[br][rc]==1)
                { p.x=rc*TILE_SIZE-PLAYER_W; p.vx=0; }
    }
    if(p.vx<0){
        int lc=(int)(p.x/TILE_SIZE);
        int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
        if(lc>=0&&tr>=0&&br>=0&&tr<ROWS&&br<ROWS)
            if(w.tilemap[tr][lc]==1||w.tilemap[br][lc]==1)
                { p.x=(lc+1)*TILE_SIZE; p.vx=0; }
    }
}
void checkTileCollisionV(World& w){
    Player& p=w.player;
    int fcl=(int)(p.x/TILE_SIZE); int fcr=(int)((p.x+PLAYER_W-1)/TILE_SIZE);
    int fr=(int)((p.y+PLAYER_H)/TILE_SIZE);
    if(fr>=ROWS) return;
    if((fcl>=0&&fcl<COLS&&w.tilemap[fr][fcl]==1)||(fcr>=0&&fcr<COLS&&w.tilemap[fr][fcr]==1)){
        if(p.vy>=0){ p.y=fr*TILE_SIZE-PLAYER_H; p.vy=0; p.state=GROUNDED; p.coyote_timer=COYOTE_TIME; }
    }
    if(p.state==GROUNDED){
        int gr=(int)((p.y+PLAYER_H+1)/TILE_SIZE);
        if(gr<ROWS&&(w.tilemap[gr][fcl]!=1&&w.tilemap[gr][fcr]!=1)) p.state=AIRBORNE;
    }
}

void inputSystem(World& w){
    w.cmd=CMD_NONE;
    if(IsKeyDown(KEY_RIGHT)) w.cmd=CMD_RIGHT;
    else if(IsKeyDown(KEY_LEFT)) w.cmd=CMD_LEFT;
    if(IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer=JUMP_BUFFER;
}

void physicsSystem(World& w){
    Player& p=w.player;
    if(p.state==AIRBORNE&&p.coyote_timer>0) p.coyote_timer-=FIXED_DT;
    if(p.jump_buffer_timer>0) p.jump_buffer_timer-=FIXED_DT;
    float accel=(p.state==GROUNDED)?ACCEL:AIR_ACCEL;
    if(w.cmd==CMD_RIGHT){ p.vx+=accel*FIXED_DT; if(p.vx>MAX_RUN) p.vx=MAX_RUN; }
    else if(w.cmd==CMD_LEFT){ p.vx-=accel*FIXED_DT; if(p.vx<-MAX_RUN) p.vx=-MAX_RUN; }
    else{
        if(p.vx>0){ p.vx-=FRICTION*FIXED_DT; if(p.vx<0) p.vx=0; }
        else if(p.vx<0){ p.vx+=FRICTION*FIXED_DT; if(p.vx>0) p.vx=0; }
    }
    if(p.jump_buffer_timer>0&&p.coyote_timer>0){
        p.vy=-JUMP_SPEED; p.state=AIRBORNE; p.coyote_timer=0; p.jump_buffer_timer=0;
    }
    if(p.state==AIRBORNE&&!IsKeyDown(KEY_SPACE)&&p.vy<-MIN_JUMP_VY) p.vy=-MIN_JUMP_VY;
    p.x+=p.vx*FIXED_DT;
    p.vy+=GRAVITY*FIXED_DT;
    p.y+=p.vy*FIXED_DT;
}

void collisionSystem(World& w){
    checkTileCollisionH(w);
    checkTileCollisionV(w);
    if(prev_state==AIRBORNE&&w.player.state==GROUNDED)
        spawnParticles(w.player.x+12,w.player.y+24);
    prev_state=w.player.state;
    markCoins(w); cleanupPass(w); checkExitDoor(w);
    if(w.player.y>SCREEN_H){
        w.player.x=48.0f; w.player.y=350.0f;
        w.player.vy=0; w.player.vx=0; w.player.state=GROUNDED;
    }
}

void renderSystem(World& w){
    BeginDrawing();
    ClearBackground(SKYBLUE);
    for(int r=0;r<ROWS;r++) for(int c=0;c<COLS;c++){
        if(w.tilemap[r][c]==1) DrawRectangle(c*TILE_SIZE,r*TILE_SIZE,TILE_SIZE,TILE_SIZE,DARKGREEN);
        else if(w.tilemap[r][c]==2) DrawRectangle(c*TILE_SIZE+8,r*TILE_SIZE+8,TILE_SIZE-16,TILE_SIZE-16,YELLOW);
        else if(w.tilemap[r][c]==3) DrawRectangle(c*TILE_SIZE+4,r*TILE_SIZE+4,TILE_SIZE-8,TILE_SIZE-8,ORANGE);
    }
    DrawRectangle((int)w.player.x,(int)w.player.y,PLAYER_W,PLAYER_H,BLUE);
    for(int i=0;i<enemy_count;i++) if(enemies[i].active) DrawRectangle((int)enemies[i].x,(int)enemies[i].y,20,20,RED);
    for(int i=0;i<MAX_PARTICLES;i++) if(particles[i].active) DrawRectangle((int)particles[i].x,(int)particles[i].y,4,4,LIGHTGRAY);
    DrawText("** SYSTEM PIPELINE **",SCREEN_W/2-140,8,18,CYAN);
    DrawText(w.player.state==GROUNDED?"GROUNDED":"AIRBORNE",10,30,16,WHITE);
    DrawText(TextFormat("Score: %d",w.score),10,50,16,YELLOW);
    DrawText(TextFormat("Level: %d",w.level_index+1),10,70,14,ORANGE);
    DrawText(TextFormat("Allocs/frame: %d",alloc_counter),10,88,12,alloc_counter==0?GREEN:RED);
    EndDrawing();
}

void logicFrame(World& w){
    alloc_counter=0;
    if(IsKeyPressed(KEY_C)) saveCheckpoint(w);
    if(IsKeyPressed(KEY_R)&&ckpt_valid) loadCheckpoint(w);
    inputSystem(w);
    updateEnemies(FIXED_DT); updateParticles(FIXED_DT);
    physicsSystem(w);
    collisionSystem(w);
}

void printTimestep(){
    cout<<"DT: 0.016"<<endl;
    cout<<"Cap: 0.250"<<endl;
    cout<<"Ticks: 1"<<endl;
    cout<<"Timestep: fixed-accumulator"<<endl;
}

int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Platformer -- L36 Fixed Timestep");
    SetTargetFPS(60);
    initWorld(w);
    for(int i=0;i<MAX_PARTICLES;i++) particles[i].active=false;
    printTimestep();
    // TODO: Replace this loop with an accumulator loop:
    // acc += GetFrameTime();
    // if(acc > 0.250f) acc = 0.250f;
    // while(acc >= FIXED_DT){ logicFrame(w); acc -= FIXED_DT; }
    // renderSystem(w);
    while(!WindowShouldClose()){ logicFrame(w); renderSystem(w); }
    CloseWindow(); return 0;
}
`,
    solutionCode: `
#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800; const int SCREEN_H = 450;
const float GRAVITY = 800.0f; const float FIXED_DT = 1.0f/60.0f;
const int PLAYER_W = 24; const int PLAYER_H = 24;
const float JUMP_SPEED = 400.0f; const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f; const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f; const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f; const float JUMP_BUFFER = 0.1f;
const int TILE_SIZE = 32; const int COLS = 25; const int ROWS = 14;
const int NUM_LEVELS = 2; const int MAX_ENEMIES = 8; const int MAX_PARTICLES = 32;

const int LEVEL_DATA[NUM_LEVELS][ROWS][COLS] = {
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
    },
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,1},
    {1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    },
};

enum MoveState { GROUNDED, AIRBORNE };
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };
struct Player { float x,y,vx,vy; MoveState state; float coyote_timer,jump_buffer_timer; };
struct Enemy { float x,y,vx; bool active; };
Enemy enemies[MAX_ENEMIES]; int enemy_count=0;
struct World { Player player; int tilemap[ROWS][COLS]; int score; Command cmd; int level_index; };
World w;
MoveState prev_state=GROUNDED;
struct Particle { float x,y,vx,vy,life; bool active; };
Particle particles[MAX_PARTICLES];
int alloc_counter=0;
float acc=0.0f;
void countAlloc(){ alloc_counter++; }
unsigned lcg_state=0;
unsigned lcgNext(){ lcg_state=lcg_state*1664525u+1013904223u; return lcg_state; }

void scrambleCoins(World& w,unsigned seed){
    lcg_state=seed;
    for(int r=0;r<ROWS;r++) for(int c=0;c<COLS;c++) if(w.tilemap[r][c]==2) w.tilemap[r][c]=0;
    int placed=0,tries=0;
    while(placed<8&&tries<1000){ tries++;
        int r=lcgNext()%ROWS; int c=lcgNext()%COLS;
        if(w.tilemap[r][c]==0){ w.tilemap[r][c]=2; placed++; }
    }
}
void spawnEnemy(float x,float y,float vx){
    if(enemy_count>=MAX_ENEMIES) return;
    enemies[enemy_count++]={x,y,vx,true};
}
void updateEnemies(float dt){
    for(int i=0;i<enemy_count;i++){
        if(!enemies[i].active) continue;
        enemies[i].x+=enemies[i].vx*dt;
        if(enemies[i].x<32||enemies[i].x>SCREEN_W-64) enemies[i].vx=-enemies[i].vx;
    }
}
float ckpt_x=48.0f,ckpt_y=350.0f; int ckpt_score=0,ckpt_level=0; bool ckpt_valid=false;
void loadLevel(World& w){ memcpy(w.tilemap,LEVEL_DATA[w.level_index],sizeof(w.tilemap)); }
void saveCheckpoint(World& w){ ckpt_x=w.player.x; ckpt_y=w.player.y; ckpt_score=w.score; ckpt_level=w.level_index; ckpt_valid=true; }
void loadCheckpoint(World& w){
    if(!ckpt_valid) return;
    w.level_index=ckpt_level; loadLevel(w); scrambleCoins(w,42+ckpt_level*94);
    w.player.x=ckpt_x; w.player.y=ckpt_y; w.player.vx=0; w.player.vy=0; w.player.state=GROUNDED; w.score=ckpt_score;
}
void initWorld(World& w){
    w.player={48.0f,350.0f,0.0f,0.0f,GROUNDED,0.0f,0.0f};
    w.score=0; w.cmd=CMD_NONE; w.level_index=0;
    loadLevel(w); scrambleCoins(w,42);
    spawnEnemy(150,380,60.0f); spawnEnemy(350,380,-80.0f); spawnEnemy(550,350,70.0f);
}
void checkExitDoor(World& w){
    Player& p=w.player;
    int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
    int lc=(int)(p.x/TILE_SIZE); int rc=(int)((p.x+PLAYER_W-1)/TILE_SIZE);
    for(int r=tr;r<=br;r++) for(int c=lc;c<=rc;c++)
        if(r>=0&&r<ROWS&&c>=0&&c<COLS&&w.tilemap[r][c]==3){
            if(w.level_index<NUM_LEVELS-1){
                w.level_index++; loadLevel(w); scrambleCoins(w,42+w.level_index*94);
                w.player.x=48.0f; w.player.y=350.0f; w.player.vx=0; w.player.vy=0; w.player.state=GROUNDED;
            }
        }
}
void spawnParticles(float px,float py){
    for(int k=0;k<4;k++) for(int i=0;i<MAX_PARTICLES;i++)
        if(!particles[i].active){
            float pvx=(float)((int)(lcgNext()%120)-60);
            float pvy=-(float)(lcgNext()%80+20);
            particles[i]={px,py,pvx,pvy,0.4f,true}; break;
        }
}
void updateParticles(float dt){
    for(int i=0;i<MAX_PARTICLES;i++){
        if(!particles[i].active) continue;
        particles[i].x+=particles[i].vx*dt; particles[i].y+=particles[i].vy*dt;
        particles[i].life-=dt;
        if(particles[i].life<=0) particles[i].active=false;
    }
}
void markCoins(World& w){
    Player& p=w.player;
    int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
    int lc=(int)(p.x/TILE_SIZE); int rc=(int)((p.x+PLAYER_W-1)/TILE_SIZE);
    for(int r=tr;r<=br;r++) for(int c=lc;c<=rc;c++)
        if(r>=0&&r<ROWS&&c>=0&&c<COLS&&w.tilemap[r][c]==2) w.tilemap[r][c]=-1;
}
void cleanupPass(World& w){
    for(int r=0;r<ROWS;r++) for(int c=0;c<COLS;c++)
        if(w.tilemap[r][c]==-1){ w.tilemap[r][c]=0; w.score++; }
}
void checkTileCollisionH(World& w){
    Player& p=w.player;
    if(p.vx>0){
        int rc=(int)((p.x+PLAYER_W)/TILE_SIZE);
        int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
        if(rc<COLS&&tr>=0&&br>=0&&tr<ROWS&&br<ROWS)
            if(w.tilemap[tr][rc]==1||w.tilemap[br][rc]==1)
                { p.x=rc*TILE_SIZE-PLAYER_W; p.vx=0; }
    }
    if(p.vx<0){
        int lc=(int)(p.x/TILE_SIZE);
        int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
        if(lc>=0&&tr>=0&&br>=0&&tr<ROWS&&br<ROWS)
            if(w.tilemap[tr][lc]==1||w.tilemap[br][lc]==1)
                { p.x=(lc+1)*TILE_SIZE; p.vx=0; }
    }
}
void checkTileCollisionV(World& w){
    Player& p=w.player;
    int fcl=(int)(p.x/TILE_SIZE); int fcr=(int)((p.x+PLAYER_W-1)/TILE_SIZE);
    int fr=(int)((p.y+PLAYER_H)/TILE_SIZE);
    if(fr>=ROWS) return;
    if((fcl>=0&&fcl<COLS&&w.tilemap[fr][fcl]==1)||(fcr>=0&&fcr<COLS&&w.tilemap[fr][fcr]==1)){
        if(p.vy>=0){ p.y=fr*TILE_SIZE-PLAYER_H; p.vy=0; p.state=GROUNDED; p.coyote_timer=COYOTE_TIME; }
    }
    if(p.state==GROUNDED){
        int gr=(int)((p.y+PLAYER_H+1)/TILE_SIZE);
        if(gr<ROWS&&(w.tilemap[gr][fcl]!=1&&w.tilemap[gr][fcr]!=1)) p.state=AIRBORNE;
    }
}

void inputSystem(World& w){
    w.cmd=CMD_NONE;
    if(IsKeyDown(KEY_RIGHT)) w.cmd=CMD_RIGHT;
    else if(IsKeyDown(KEY_LEFT)) w.cmd=CMD_LEFT;
    if(IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer=JUMP_BUFFER;
}

void physicsSystem(World& w){
    Player& p=w.player;
    if(p.state==AIRBORNE&&p.coyote_timer>0) p.coyote_timer-=FIXED_DT;
    if(p.jump_buffer_timer>0) p.jump_buffer_timer-=FIXED_DT;
    float accel=(p.state==GROUNDED)?ACCEL:AIR_ACCEL;
    if(w.cmd==CMD_RIGHT){ p.vx+=accel*FIXED_DT; if(p.vx>MAX_RUN) p.vx=MAX_RUN; }
    else if(w.cmd==CMD_LEFT){ p.vx-=accel*FIXED_DT; if(p.vx<-MAX_RUN) p.vx=-MAX_RUN; }
    else{
        if(p.vx>0){ p.vx-=FRICTION*FIXED_DT; if(p.vx<0) p.vx=0; }
        else if(p.vx<0){ p.vx+=FRICTION*FIXED_DT; if(p.vx>0) p.vx=0; }
    }
    if(p.jump_buffer_timer>0&&p.coyote_timer>0){
        p.vy=-JUMP_SPEED; p.state=AIRBORNE; p.coyote_timer=0; p.jump_buffer_timer=0;
    }
    if(p.state==AIRBORNE&&!IsKeyDown(KEY_SPACE)&&p.vy<-MIN_JUMP_VY) p.vy=-MIN_JUMP_VY;
    p.x+=p.vx*FIXED_DT;
    p.vy+=GRAVITY*FIXED_DT;
    p.y+=p.vy*FIXED_DT;
}

void collisionSystem(World& w){
    checkTileCollisionH(w);
    checkTileCollisionV(w);
    if(prev_state==AIRBORNE&&w.player.state==GROUNDED)
        spawnParticles(w.player.x+12,w.player.y+24);
    prev_state=w.player.state;
    markCoins(w); cleanupPass(w); checkExitDoor(w);
    if(w.player.y>SCREEN_H){
        w.player.x=48.0f; w.player.y=350.0f;
        w.player.vy=0; w.player.vx=0; w.player.state=GROUNDED;
    }
}

void renderSystem(World& w){
    BeginDrawing();
    ClearBackground(SKYBLUE);
    for(int r=0;r<ROWS;r++) for(int c=0;c<COLS;c++){
        if(w.tilemap[r][c]==1) DrawRectangle(c*TILE_SIZE,r*TILE_SIZE,TILE_SIZE,TILE_SIZE,DARKGREEN);
        else if(w.tilemap[r][c]==2) DrawRectangle(c*TILE_SIZE+8,r*TILE_SIZE+8,TILE_SIZE-16,TILE_SIZE-16,YELLOW);
        else if(w.tilemap[r][c]==3) DrawRectangle(c*TILE_SIZE+4,r*TILE_SIZE+4,TILE_SIZE-8,TILE_SIZE-8,ORANGE);
    }
    DrawRectangle((int)w.player.x,(int)w.player.y,PLAYER_W,PLAYER_H,BLUE);
    for(int i=0;i<enemy_count;i++) if(enemies[i].active) DrawRectangle((int)enemies[i].x,(int)enemies[i].y,20,20,RED);
    for(int i=0;i<MAX_PARTICLES;i++) if(particles[i].active) DrawRectangle((int)particles[i].x,(int)particles[i].y,4,4,LIGHTGRAY);
    DrawText("** FIXED TIMESTEP **",SCREEN_W/2-140,8,18,CYAN);
    DrawText(w.player.state==GROUNDED?"GROUNDED":"AIRBORNE",10,30,16,WHITE);
    DrawText(TextFormat("Score: %d",w.score),10,50,16,YELLOW);
    DrawText(TextFormat("Level: %d",w.level_index+1),10,70,14,ORANGE);
    DrawText(TextFormat("Allocs/frame: %d",alloc_counter),10,88,12,alloc_counter==0?GREEN:RED);
    EndDrawing();
}

void logicFrame(World& w){
    alloc_counter=0;
    if(IsKeyPressed(KEY_C)) saveCheckpoint(w);
    if(IsKeyPressed(KEY_R)&&ckpt_valid) loadCheckpoint(w);
    inputSystem(w);
    updateEnemies(FIXED_DT); updateParticles(FIXED_DT);
    physicsSystem(w);
    collisionSystem(w);
}

void printTimestep(){
    cout<<"DT: 0.016"<<endl;
    cout<<"Cap: 0.250"<<endl;
    cout<<"Ticks: 1"<<endl;
    cout<<"Timestep: fixed-accumulator"<<endl;
}

int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Platformer -- L36 Fixed Timestep");
    SetTargetFPS(60);
    initWorld(w);
    for(int i=0;i<MAX_PARTICLES;i++) particles[i].active=false;
    printTimestep();
    while(!WindowShouldClose()){
        acc+=GetFrameTime();
        if(acc>0.250f) acc=0.250f;
        while(acc>=FIXED_DT){ logicFrame(w); acc-=FIXED_DT; }
        renderSystem(w);
    }
    CloseWindow(); return 0;
}
`,
    tests: [
      { id: "g1", description: "DT", expectedOutput: "DT: 0.016" },
      { id: "g2", description: "cap", expectedOutput: "Cap: 0.250" },
      { id: "g3", description: "pattern", expectedOutput: "Timestep: fixed-accumulator" },
    ],
    hints: [
      "Add acc+=GetFrameTime(); then cap at 0.250f, then inner while loop calling logicFrame.",
      "renderSystem(w) goes OUTSIDE the inner while loop -- render once per visual frame.",
      "printTimestep() is already implemented -- just call it before the game loop.",
    ],
    estimatedMinutes: 20,
  },
};

export default lessonPlatformer36;