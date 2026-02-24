import type { Lesson } from "@/types/lesson";

const lessonPlatformer33: Lesson = {
  id: "platformer-33-physics-module-split",
  title: "Physics Module Split",
  description: "Merge gravity integration into physicsSystem. Physics owns all velocity and position changes.",
  order: 33,
  xpReward: 100,
  tier: "pro",
  concepts: ["system extraction", "physics system", "gravity integration", "pipeline"],
  part1: {
    title: "Concept: Physics Module Split",
    type: "concept",
    instructions: `# Physics Module Split

## Mental Model
Physics is the heart of a platformer. Gravity integration, friction, jump buffering, coyote time, velocity limits — all of it belongs in one function: \`physicsSystem(World& w)\`. This function reads input state (cmd) and modifies player velocity and position. It does not touch tiles.

## What Breaks Without This
Physics split across multiple callsites means you can't set a breakpoint on "all physics." You can't profile just the physics pass. You can't swap physics implementations.

## The Fix: physicsSystem(World& w)
Merge the old \`physicsPass\` (horizontal accel/friction/jump) with the inline gravity+y integration. One function owns all velocity and position changes.

## Your Task
1. Add gravity (\`p.vy += GRAVITY * FIXED_DT\`) and y integration (\`p.y += p.vy * FIXED_DT\`) to \`physicsSystem\`.
2. Update \`listSystems()\` to show Systems: 3.

## Expected Output
\`\`\`
Systems: 3
Pass[0]: input
Pass[1]: render
Pass[2]: physics
Pattern: physics-module
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;
void inputSystem(){ cout<<"inputSystem: active"<<endl; }
void renderSystem(){ cout<<"renderSystem: active"<<endl; }
// TODO: implement physicsSystem() that prints "physicsSystem: active"
void physicsSystem(){}
void listSystems(){
    cout<<"Systems: 3"<<endl;
    cout<<"Pass[0]: input"<<endl;
    cout<<"Pass[1]: render"<<endl;
    // TODO: print Pass[2]: physics
    cout<<"Pattern: physics-module"<<endl;
}
int main(){ listSystems(); return 0; }`,
    solutionCode: `#include <iostream>
using namespace std;
void inputSystem(){ cout<<"inputSystem: active"<<endl; }
void renderSystem(){ cout<<"renderSystem: active"<<endl; }
void physicsSystem(){ cout<<"physicsSystem: active"<<endl; }
void listSystems(){
    cout<<"Systems: 3"<<endl;
    cout<<"Pass[0]: input"<<endl;
    cout<<"Pass[1]: render"<<endl;
    cout<<"Pass[2]: physics"<<endl;
    cout<<"Pattern: physics-module"<<endl;
}
int main(){ listSystems(); return 0; }`,
    tests: [
      { id: "t1", description: "systems 3", expectedOutput: "Systems: 3" },
      { id: "t2", description: "physics pass", expectedOutput: "Pass[2]: physics" },
      { id: "t3", description: "pattern", expectedOutput: "Pattern: physics-module" },
    ],
    hints: [
      "Add physicsSystem() printing physicsSystem: active.",
      "Update listSystems() to Systems: 3 with Pass[2]: physics.",
      "physicsSystem owns: accel, friction, jump, p.x+=vx*dt, p.vy+=GRAVITY*dt, p.y+=vy*dt.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Physics Module Split",
    type: "game_builder",
    instructions: `# Build: Physics Module Split

## The Task
\`physicsSystem\` already has horizontal movement. Add the two lines for gravity and y integration inside it. Remove them from the main loop.

## Did It Work?
Game physics are identical. Console shows Systems: 3. This is the most important extraction: gravity now lives inside a named function.`,
    starterCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;
const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;
const int NUM_LEVELS = 2;
const int MAX_ENEMIES = 8;
const int MAX_PARTICLES = 32;

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
        if(rc<COLS&&(w.tilemap[tr][rc]==1||w.tilemap[br][rc]==1))
            { p.x=rc*TILE_SIZE-PLAYER_W; p.vx=0; }
    }
    if(p.vx<0){
        int lc=(int)(p.x/TILE_SIZE);
        int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
        if(lc>=0&&(w.tilemap[tr][lc]==1||w.tilemap[br][lc]==1))
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

void listSystems(){
    cout<<"Systems: 3"<<endl;
    cout<<"Pass[0]: input"<<endl;
    cout<<"Pass[1]: render"<<endl;
    cout<<"Pass[2]: physics"<<endl;
    cout<<"Pattern: physics-module"<<endl;
}

void inputSystem(World& w){
    w.cmd=CMD_NONE;
    if(IsKeyDown(KEY_RIGHT)) w.cmd=CMD_RIGHT;
    else if(IsKeyDown(KEY_LEFT)) w.cmd=CMD_LEFT;
    if(IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer=JUMP_BUFFER;
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
    DrawText(w.player.state==GROUNDED?"GROUNDED":"AIRBORNE",10,10,18,WHITE);
    DrawText(TextFormat("Score: %d",w.score),10,32,18,YELLOW);
    DrawText(TextFormat("Level: %d  Systems: 3",w.level_index+1),10,54,14,ORANGE);
    DrawText(TextFormat("Allocs/frame: %d",alloc_counter),10,72,12,alloc_counter==0?GREEN:RED);
    EndDrawing();
}

// TODO: Move physicsPass content + gravity+y integration here into physicsSystem()
// physicsSystem should do: timers, accel/friction, jump, p.x+=vx*dt, p.vy+=GRAVITY*dt, p.y+=vy*dt
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
    // TODO: add gravity integration and y integration here
    // p.vy += GRAVITY * FIXED_DT; p.y += p.vy * FIXED_DT;
}

int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Platformer -- L33 Physics Module");
    SetTargetFPS(60);
    initWorld(w);
    for(int i=0;i<MAX_PARTICLES;i++) particles[i].active=false;
    listSystems();
    while(!WindowShouldClose()){
        alloc_counter=0;
        inputSystem(w);
        if(IsKeyPressed(KEY_C)) saveCheckpoint(w);
        if(IsKeyPressed(KEY_R)&&ckpt_valid) loadCheckpoint(w);
        updateEnemies(FIXED_DT); updateParticles(FIXED_DT);
        physicsSystem(w);
        checkTileCollisionH(w);
        // gravity+y were here -- now inside physicsSystem
        checkTileCollisionV(w);
        if(prev_state==AIRBORNE&&w.player.state==GROUNDED)
            spawnParticles(w.player.x+12,w.player.y+24);
        prev_state=w.player.state;
        markCoins(w); cleanupPass(w); checkExitDoor(w);
        if(w.player.y>SCREEN_H){
            w.player.x=48.0f; w.player.y=350.0f;
            w.player.vy=0; w.player.vx=0; w.player.state=GROUNDED;
        }
        renderSystem(w);
    }
    CloseWindow(); return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;
const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;
const int NUM_LEVELS = 2;
const int MAX_ENEMIES = 8;
const int MAX_PARTICLES = 32;

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
        if(rc<COLS&&(w.tilemap[tr][rc]==1||w.tilemap[br][rc]==1))
            { p.x=rc*TILE_SIZE-PLAYER_W; p.vx=0; }
    }
    if(p.vx<0){
        int lc=(int)(p.x/TILE_SIZE);
        int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
        if(lc>=0&&(w.tilemap[tr][lc]==1||w.tilemap[br][lc]==1))
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

void listSystems(){
    cout<<"Systems: 3"<<endl;
    cout<<"Pass[0]: input"<<endl;
    cout<<"Pass[1]: render"<<endl;
    cout<<"Pass[2]: physics"<<endl;
    cout<<"Pattern: physics-module"<<endl;
}

void inputSystem(World& w){
    w.cmd=CMD_NONE;
    if(IsKeyDown(KEY_RIGHT)) w.cmd=CMD_RIGHT;
    else if(IsKeyDown(KEY_LEFT)) w.cmd=CMD_LEFT;
    if(IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer=JUMP_BUFFER;
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
    DrawText(w.player.state==GROUNDED?"GROUNDED":"AIRBORNE",10,10,18,WHITE);
    DrawText(TextFormat("Score: %d",w.score),10,32,18,YELLOW);
    DrawText(TextFormat("Level: %d  Systems: 3",w.level_index+1),10,54,14,ORANGE);
    DrawText(TextFormat("Allocs/frame: %d",alloc_counter),10,72,12,alloc_counter==0?GREEN:RED);
    EndDrawing();
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

int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Platformer -- L33 Physics Module");
    SetTargetFPS(60);
    initWorld(w);
    for(int i=0;i<MAX_PARTICLES;i++) particles[i].active=false;
    listSystems();
    while(!WindowShouldClose()){
        alloc_counter=0;
        inputSystem(w);
        if(IsKeyPressed(KEY_C)) saveCheckpoint(w);
        if(IsKeyPressed(KEY_R)&&ckpt_valid) loadCheckpoint(w);
        updateEnemies(FIXED_DT); updateParticles(FIXED_DT);
        physicsSystem(w);
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
        renderSystem(w);
    }
    CloseWindow(); return 0;
}`,
    tests: [
      { id: "g1", description: "systems 3", expectedOutput: "Systems: 3" },
      { id: "g2", description: "physics pass", expectedOutput: "Pass[2]: physics" },
      { id: "g3", description: "pattern", expectedOutput: "Pattern: physics-module" },
    ],
    hints: [
      "Add p.vy+=GRAVITY*FIXED_DT and p.y+=p.vy*FIXED_DT inside physicsSystem, after p.x integration.",
      "Remove any inline gravity+y lines from the main loop -- physicsSystem owns them now.",
      "The main loop calls physicsSystem(w) then checkTileCollisionH/V separately for now.",
    ],
    estimatedMinutes: 12,
  },
};

export default lessonPlatformer33;