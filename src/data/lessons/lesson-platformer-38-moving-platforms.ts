import type { Lesson } from "@/types/lesson";

const lessonPlatformer38: Lesson = {
  id: "platformer-38-moving-platforms",
  title: "Moving Platforms v0",
  description: "Add moving platforms that carry the player using relative velocity.",
  order: 38,
  xpReward: 100,
  tier: "pro",
  concepts: ["moving-platforms", "relative-velocity", "platform-carry"],
  part1: {
    title: "Concept: Moving Platforms",
    type: "concept",
    instructions: `
# Moving Platforms v0

## The Problem
Static tiles don't move. But great platformers have moving platforms. The player must be "carried" by the platform using relative velocity.

## The Concept
\`\`\`
platform.x += platform.vx * dt
if player is standing on platform:
    player.x += platform.vx * dt
\`\`\`

This is the "relative velocity" pattern — the player's velocity relative to the platform is zero when riding.

## Elite Insight
Super Mario World, Celeste, Hollow Knight all use this exact pattern. The challenge is detecting when the player is "on" the platform (not just near it).

## Your Task
Print the moving platform status:


## Beginner Trap
**Moving the platform without carrying the player.** If the player stands on a moving platform and only the platform moves, the player slides off. Apply the platform velocity to the player when they are standing on it: player.x += platform.velocity.x.

## Systems Thinking Connection
The Shooter has no platforms. The RPG has no moving terrain. Moving platforms with rider attachment are unique to platformers, but the concept of relative motion (child inherits parent velocity) appears in any game with hierarchical movement.`,
    starterCode: `
#include <iostream>
using namespace std;
int main(){
    // TODO 1: Print "Platform-count: 2"
    // TODO 2: Print "Carry: active"
    // TODO 3: Print "Pattern: relative-velocity"
    return 0;
}
`,
    solutionCode: `
#include <iostream>
using namespace std;
int main(){
    cout<<"Platform-count: 2"<<endl;
    cout<<"Carry: active"<<endl;
    cout<<"Pattern: relative-velocity"<<endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "count", expectedOutput: "Platform-count: 2" },
      { id: "t2", description: "carry", expectedOutput: "Carry: active" },
      { id: "t3", description: "pattern", expectedOutput: "Pattern: relative-velocity" },
    ],
    hints: [
      "Print each line with cout<<...<<endl;",
      "Platform-count is 2 (two moving platforms are defined).",
      "Pattern: relative-velocity means the player velocity matches the platform when riding.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Moving Platforms v0",
    type: "game_builder",
    instructions: `
# Build: Moving Platforms v0

## What's New
Two moving platforms are defined as \`MovingPlatform mov_plats[2]\`. They move left/right between \`min_x\` and \`max_x\`. The \`carryPlayer()\` function detects if the player is on a platform and applies the platform velocity.

## Your Task
\`updateMovingPlatforms()\` and \`carryPlayer()\` are already implemented. The moving platforms are purple PURPLE rectangles (96x16 px). The \`renderSystem\` needs to draw them.

Find the \`renderSystem\` and inside the for loop over \`mov_plat_count\`, add:
\`\`\`cpp
DrawRectangle((int)mov_plats[i].x, (int)mov_plats[i].y, 96, 16, PURPLE);
\`\`\`

## Did It Work?
Two purple platforms should be moving across the screen. Stand on one — your character rides with it. HUD shows MOVING PLATFORMS.
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
    {1,0,4,4,4,0,0,0,0,0,4,4,4,0,0,0,4,4,4,0,0,0,0,0,1},
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
    {1,0,4,4,0,0,0,0,0,0,4,4,0,0,0,0,0,0,4,4,0,0,0,0,1},
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
struct MovingPlatform { float x,y,vx,min_x,max_x; };
MovingPlatform mov_plats[2]={{200.0f,300.0f,60.0f,100.0f,450.0f},{480.0f,200.0f,-80.0f,300.0f,650.0f}};
int mov_plat_count=2;

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
    bool solid_hit=false, oneway_hit=false;
    if(fcl>=0&&fcl<COLS){ int t=w.tilemap[fr][fcl]; if(t==1) solid_hit=true; else if(t==4) oneway_hit=true; }
    if(fcr>=0&&fcr<COLS){ int t=w.tilemap[fr][fcr]; if(t==1) solid_hit=true; else if(t==4) oneway_hit=true; }
    if((solid_hit||oneway_hit)&&p.vy>=0){
        p.y=fr*TILE_SIZE-PLAYER_H; p.vy=0; p.state=GROUNDED; p.coyote_timer=COYOTE_TIME;
    }
    if(p.state==GROUNDED){
        int gr=(int)((p.y+PLAYER_H+1)/TILE_SIZE);
        if(gr<ROWS){
            bool below=false;
            if(fcl>=0&&fcl<COLS){ int t=w.tilemap[gr][fcl]; if(t==1||t==4) below=true; }
            if(fcr>=0&&fcr<COLS){ int t=w.tilemap[gr][fcr]; if(t==1||t==4) below=true; }
            if(!below) p.state=AIRBORNE;
        }
    }
}

void updateMovingPlatforms(float dt){
    for(int i=0;i<mov_plat_count;i++){
        mov_plats[i].x+=mov_plats[i].vx*dt;
        if(mov_plats[i].x<mov_plats[i].min_x||mov_plats[i].x>mov_plats[i].max_x)
            mov_plats[i].vx=-mov_plats[i].vx;
    }
}
void carryPlayer(World& w){
    Player& p=w.player;
    for(int i=0;i<mov_plat_count;i++){
        float plat_top=mov_plats[i].y;
        float player_bot=p.y+PLAYER_H;
        if(player_bot>=plat_top-4&&player_bot<=plat_top+6&&
           p.x+PLAYER_W>mov_plats[i].x&&p.x<mov_plats[i].x+96){
            p.x+=mov_plats[i].vx*FIXED_DT;
        }
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
    carryPlayer(w);
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
        else if(w.tilemap[r][c]==4) DrawRectangle(c*TILE_SIZE,r*TILE_SIZE+24,TILE_SIZE,8,BROWN);
    }
    for(int i=0;i<mov_plat_count;i++) DrawRectangle((int)mov_plats[i].x,(int)mov_plats[i].y,96,16,PURPLE);
    DrawRectangle((int)w.player.x,(int)w.player.y,PLAYER_W,PLAYER_H,BLUE);
    for(int i=0;i<enemy_count;i++) if(enemies[i].active) DrawRectangle((int)enemies[i].x,(int)enemies[i].y,20,20,RED);
    for(int i=0;i<MAX_PARTICLES;i++) if(particles[i].active) DrawRectangle((int)particles[i].x,(int)particles[i].y,4,4,LIGHTGRAY);
    DrawText("** ONE-WAY PLATFORMS **",SCREEN_W/2-140,8,18,CYAN);
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
    updateMovingPlatforms(FIXED_DT);
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
void printOneWay(){
    cout<<"Tile4: one-way"<<endl;
    cout<<"Block-above: true"<<endl;
    cout<<"Block-below: false"<<endl;
    cout<<"Pattern: directional-collision"<<endl;
}
void printMovingPlatforms(){
    cout<<"Platform-count: 2"<<endl;
    cout<<"Carry: active"<<endl;
    cout<<"Pattern: relative-velocity"<<endl;
}

int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Platformer -- L38 Moving Platforms");
    SetTargetFPS(60);
    initWorld(w);
    for(int i=0;i<MAX_PARTICLES;i++) particles[i].active=false;
    printMovingPlatforms();
    // The MovingPlatform struct, mov_plats[2] and updateMovingPlatforms() are set up.
    // carryPlayer() moves the player with the platform.
    // TODO: In renderSystem, add a line to draw each moving platform as a PURPLE rectangle:
    // DrawRectangle((int)mov_plats[i].x, (int)mov_plats[i].y, 96, 16, PURPLE);
    while(!WindowShouldClose()){
        acc+=GetFrameTime(); if(acc>0.250f) acc=0.250f;
        while(acc>=FIXED_DT){ logicFrame(w); acc-=FIXED_DT; }
        renderSystem(w);
    }
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
    {1,0,4,4,4,0,0,0,0,0,4,4,4,0,0,0,4,4,4,0,0,0,0,0,1},
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
    {1,0,4,4,0,0,0,0,0,0,4,4,0,0,0,0,0,0,4,4,0,0,0,0,1},
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
struct MovingPlatform { float x,y,vx,min_x,max_x; };
MovingPlatform mov_plats[2]={{200.0f,300.0f,60.0f,100.0f,450.0f},{480.0f,200.0f,-80.0f,300.0f,650.0f}};
int mov_plat_count=2;

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
    bool solid_hit=false, oneway_hit=false;
    if(fcl>=0&&fcl<COLS){ int t=w.tilemap[fr][fcl]; if(t==1) solid_hit=true; else if(t==4) oneway_hit=true; }
    if(fcr>=0&&fcr<COLS){ int t=w.tilemap[fr][fcr]; if(t==1) solid_hit=true; else if(t==4) oneway_hit=true; }
    if((solid_hit||oneway_hit)&&p.vy>=0){
        p.y=fr*TILE_SIZE-PLAYER_H; p.vy=0; p.state=GROUNDED; p.coyote_timer=COYOTE_TIME;
    }
    if(p.state==GROUNDED){
        int gr=(int)((p.y+PLAYER_H+1)/TILE_SIZE);
        if(gr<ROWS){
            bool below=false;
            if(fcl>=0&&fcl<COLS){ int t=w.tilemap[gr][fcl]; if(t==1||t==4) below=true; }
            if(fcr>=0&&fcr<COLS){ int t=w.tilemap[gr][fcr]; if(t==1||t==4) below=true; }
            if(!below) p.state=AIRBORNE;
        }
    }
}

void updateMovingPlatforms(float dt){
    for(int i=0;i<mov_plat_count;i++){
        mov_plats[i].x+=mov_plats[i].vx*dt;
        if(mov_plats[i].x<mov_plats[i].min_x||mov_plats[i].x>mov_plats[i].max_x)
            mov_plats[i].vx=-mov_plats[i].vx;
    }
}
void carryPlayer(World& w){
    Player& p=w.player;
    for(int i=0;i<mov_plat_count;i++){
        float plat_top=mov_plats[i].y;
        float player_bot=p.y+PLAYER_H;
        if(player_bot>=plat_top-4&&player_bot<=plat_top+6&&
           p.x+PLAYER_W>mov_plats[i].x&&p.x<mov_plats[i].x+96){
            p.x+=mov_plats[i].vx*FIXED_DT;
        }
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
    carryPlayer(w);
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
        else if(w.tilemap[r][c]==4) DrawRectangle(c*TILE_SIZE,r*TILE_SIZE+24,TILE_SIZE,8,BROWN);
    }
    for(int i=0;i<mov_plat_count;i++) DrawRectangle((int)mov_plats[i].x,(int)mov_plats[i].y,96,16,PURPLE);
    DrawRectangle((int)w.player.x,(int)w.player.y,PLAYER_W,PLAYER_H,BLUE);
    for(int i=0;i<enemy_count;i++) if(enemies[i].active) DrawRectangle((int)enemies[i].x,(int)enemies[i].y,20,20,RED);
    for(int i=0;i<MAX_PARTICLES;i++) if(particles[i].active) DrawRectangle((int)particles[i].x,(int)particles[i].y,4,4,LIGHTGRAY);
    DrawText("** MOVING PLATFORMS **",SCREEN_W/2-140,8,18,CYAN);
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
    updateMovingPlatforms(FIXED_DT);
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
void printOneWay(){
    cout<<"Tile4: one-way"<<endl;
    cout<<"Block-above: true"<<endl;
    cout<<"Block-below: false"<<endl;
    cout<<"Pattern: directional-collision"<<endl;
}
void printMovingPlatforms(){
    cout<<"Platform-count: 2"<<endl;
    cout<<"Carry: active"<<endl;
    cout<<"Pattern: relative-velocity"<<endl;
}

int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Platformer -- L38 Moving Platforms");
    SetTargetFPS(60);
    initWorld(w);
    for(int i=0;i<MAX_PARTICLES;i++) particles[i].active=false;
    printMovingPlatforms();
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
      { id: "g1", description: "count", expectedOutput: "Platform-count: 2" },
      { id: "g2", description: "carry", expectedOutput: "Carry: active" },
      { id: "g3", description: "pattern", expectedOutput: "Pattern: relative-velocity" },
    ],
    hints: [
      "Add DrawRectangle for each moving platform inside a for loop: for(int i=0;i<mov_plat_count;i++){}.",
      "Use (int)mov_plats[i].x and (int)mov_plats[i].y for the position.",
      "The moving platforms are 96px wide and 16px tall, colored PURPLE.",
    ],
    estimatedMinutes: 20,
  },
};

export default lessonPlatformer38;