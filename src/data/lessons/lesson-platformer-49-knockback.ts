import type { Lesson } from "@/types/lesson";

const lessonPlatformer49: Lesson = {
  id: "platformer-49-knockback",
  title: "Knockback",
  description: "Enemy side contact pushes the player back with knockback velocity and invulnerability.",
  order: 49,
  xpReward: 100,
  tier: "pro",
  concepts: ["knockback", "force-application", "hit-response"],
  part1: {
    title: "Concept: Knockback",
    type: "concept",
    instructions: `
# Knockback

## The Concept
When touching an enemy from the side (not from above), the player takes knockback:
\`\`\`
direction = (player_center < enemy_center) ? LEFT : RIGHT
vx = direction * -300
vy = -180  (pop up)
kb_timer = 0.5s  (invulnerability window)
hp--
\`\`\`

## Elite Insight
Knockback + invulnerability frames (iframes) are a design pair. Without iframes, the player gets knocked repeatedly. The 0.5s window prevents this. Every action-platformer uses this pattern: Hollow Knight, Celeste, Metroid.

## Your Task
Print the knockback parameters:


## Beginner Trap
**Applying knockback as a position offset instead of a velocity impulse.** Position teleporting ignores walls and other collision. Apply knockback as a velocity impulse and let the physics system resolve it naturally — the player slides along walls instead of teleporting through them.

## Systems Thinking Connection
The Shooter applies explosion pushback as velocity impulses. The RPG has no real-time knockback (turn-based). The Crawler applies 3D knockback vectors. Velocity-based impulses that respect collision are the correct knockback implementation across all real-time paths.`,
    starterCode: `
#include <iostream>
using namespace std;
int main(){
    // TODO 1: Print "Knockback: active"
    // TODO 2: Print "Push-vx: 300"
    // TODO 3: Print "Pattern: knockback"
    return 0;
}
`,
    solutionCode: `
#include <iostream>
using namespace std;
int main(){
    cout<<"Knockback: active"<<endl;
    cout<<"Push-vx: 300"<<endl;
    cout<<"Pattern: knockback"<<endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "active", expectedOutput: "Knockback: active" },
      { id: "t2", description: "pushvx", expectedOutput: "Push-vx: 300" },
      { id: "t3", description: "pattern", expectedOutput: "Pattern: knockback" },
    ],
    hints: [
      "Knockback applies -300 vx in the direction away from the enemy.",
      "kb_timer=0.5f gives 0.5 seconds of invulnerability (no repeated hits).",
      "Pattern: knockback is the mechanic classification.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Knockback",
    type: "game_builder",
    instructions: `
# Build: Knockback

## What's New
Player has \`hp\` (starts at 3) and \`kb_timer\` (invulnerability). \`checkEnemyContact()\` handles the knockback.

## Your Task
The knockback logic is in \`checkEnemyContact\`. Find the TODO for direction calculation and verify the consequences:
\`\`\`cpp
float dir = (p.x + PLAYER_W/2 < ex + 10) ? -1.0f : 1.0f;
p.vx = dir * -300.0f;
p.vy = -180.0f;
p.kb_timer = 0.5f;
p.hp--;
\`\`\`
If hp drops to 0: respawn (from checkpoint or start position).

## Did It Work?
Touch an enemy from the side — the player bounces away. HUD shows HP count. Touch repeatedly — each hit costs 1 HP. At 0 HP, respawn. HUD shows KNOCKBACK.
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
const float DASH_SPEED = 500.0f; const float DASH_TIME = 0.15f; const float DASH_COOL = 0.6f;
const float SLIDE_CAP = 60.0f;

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
    {1,0,0,0,5,0,0,0,0,5,0,0,0,0,5,0,0,0,0,5,0,0,0,0,1},
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
    {1,0,0,5,0,0,0,0,5,0,0,0,0,5,0,0,0,5,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    },
};

enum MoveState { GROUNDED, AIRBORNE };
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };
struct Player { float x,y,vx,vy; MoveState state; float coyote_timer,jump_buffer_timer; float face_dir; bool is_dashing; float dash_timer; float dash_cool; int wall_dir; int jumps_left; int hp; float kb_timer; };
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
bool level_error=false;

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
void updateEnemies(World& w,float dt){
    for(int i=0;i<enemy_count;i++){
        if(!enemies[i].active) continue;
        enemies[i].x+=enemies[i].vx*dt;
        // Edge detection: turn before falling off platform
        int er=(int)((enemies[i].y+24)/TILE_SIZE);
        int next_c;
        if(enemies[i].vx>0) next_c=(int)((enemies[i].x+22)/TILE_SIZE);
        else next_c=(int)((enemies[i].x-2)/TILE_SIZE);
        if(next_c>=0&&next_c<COLS&&er>=0&&er<ROWS&&w.tilemap[er][next_c]==0)
            enemies[i].vx=-enemies[i].vx;
        if(enemies[i].x<32||enemies[i].x>SCREEN_W-64) enemies[i].vx=-enemies[i].vx;
    }
}
float ckpt_x=48.0f,ckpt_y=350.0f; int ckpt_score=0,ckpt_level=0; bool ckpt_valid=false;
void loadLevel(World& w){
    if(w.level_index<0||w.level_index>=NUM_LEVELS){ level_error=true; w.level_index=0; }
    memcpy(w.tilemap,LEVEL_DATA[w.level_index],sizeof(w.tilemap));
}
void saveCheckpoint(World& w){ ckpt_x=w.player.x; ckpt_y=w.player.y; ckpt_score=w.score; ckpt_level=w.level_index; ckpt_valid=true; }
void loadCheckpoint(World& w){
    if(!ckpt_valid) return;
    w.level_index=ckpt_level; loadLevel(w); scrambleCoins(w,42+ckpt_level*94);
    w.player.x=ckpt_x; w.player.y=ckpt_y; w.player.vx=0; w.player.vy=0; w.player.state=GROUNDED; w.score=ckpt_score;
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

void initWorld(World& w){
    w.player={48.0f,350.0f,0.0f,0.0f,GROUNDED,0.0f,0.0f,1.0f,false,0.0f,0.0f,0,2,3,0.0f};
    w.score=0; w.cmd=CMD_NONE; w.level_index=0;
    loadLevel(w); scrambleCoins(w,42);
    spawnEnemy(150,380,60.0f); spawnEnemy(350,380,-80.0f); spawnEnemy(550,350,70.0f);
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
    if(w.cmd==CMD_RIGHT) p.face_dir=1.0f;
    else if(w.cmd==CMD_LEFT) p.face_dir=-1.0f;
    if(p.dash_cool>0) p.dash_cool-=FIXED_DT;
    if(p.is_dashing){
        p.dash_timer-=FIXED_DT;
        p.vx=p.face_dir*DASH_SPEED; p.vy=0.0f;
        if(p.dash_timer<=0){ p.is_dashing=false; p.dash_timer=0.0f; }
        p.x+=p.vx*FIXED_DT; p.y+=p.vy*FIXED_DT; return;
    }
    if(IsKeyPressed(KEY_LEFT_SHIFT)&&p.dash_cool<=0&&!p.is_dashing){
        p.is_dashing=true; p.dash_timer=DASH_TIME; p.dash_cool=DASH_COOL;
        p.vx=p.face_dir*DASH_SPEED;
        p.x+=p.vx*FIXED_DT; p.y+=p.vy*FIXED_DT; return;
    }
    if(p.state==AIRBORNE&&p.coyote_timer>0) p.coyote_timer-=FIXED_DT;
    if(p.jump_buffer_timer>0) p.jump_buffer_timer-=FIXED_DT;
    if(p.wall_dir!=0&&p.state==AIRBORNE&&IsKeyPressed(KEY_SPACE)){
        p.vy=-JUMP_SPEED; p.vx=(float)(-p.wall_dir)*280.0f;
        p.coyote_timer=0; p.jump_buffer_timer=0; p.wall_dir=0;
    } else if(IsKeyPressed(KEY_SPACE)&&p.state==AIRBORNE&&p.coyote_timer<=0&&p.jumps_left>0){
        p.vy=-JUMP_SPEED*0.85f; p.jumps_left--;
    }
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
    if(p.wall_dir!=0&&p.state==AIRBORNE){
        bool pressing=(p.wall_dir==1&&IsKeyDown(KEY_RIGHT))||(p.wall_dir==-1&&IsKeyDown(KEY_LEFT));
        if(pressing&&p.vy>SLIDE_CAP) p.vy=SLIDE_CAP;
    }
    p.x+=p.vx*FIXED_DT;
    p.vy+=GRAVITY*FIXED_DT;
    p.y+=p.vy*FIXED_DT;
}

void checkTileCollisionH(World& w){
    Player& p=w.player;
    p.wall_dir=0;
    if(p.vx>0){
        int rc=(int)((p.x+PLAYER_W)/TILE_SIZE);
        int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
        if(rc<COLS&&tr>=0&&br>=0&&tr<ROWS&&br<ROWS)
            if(w.tilemap[tr][rc]==1||w.tilemap[br][rc]==1)
                { p.x=rc*TILE_SIZE-PLAYER_W; p.vx=0; p.wall_dir=1; }
    }
    if(p.vx<0){
        int lc=(int)(p.x/TILE_SIZE);
        int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
        if(lc>=0&&tr>=0&&br>=0&&tr<ROWS&&br<ROWS)
            if(w.tilemap[tr][lc]==1||w.tilemap[br][lc]==1)
                { p.x=(lc+1)*TILE_SIZE; p.vx=0; p.wall_dir=-1; }
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

void checkHazardTiles(World& w){
    Player& p=w.player;
    int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
    int lc=(int)(p.x/TILE_SIZE); int rc=(int)((p.x+PLAYER_W-1)/TILE_SIZE);
    for(int r=tr;r<=br;r++) for(int c=lc;c<=rc;c++)
        if(r>=0&&r<ROWS&&c>=0&&c<COLS&&w.tilemap[r][c]==5){
            if(ckpt_valid) loadCheckpoint(w);
            else { p.x=48.0f; p.y=350.0f; p.vx=0; p.vy=0; p.state=GROUNDED; }
            return;
        }
}

void checkStompKill(World& w){
    Player& p=w.player;
    if(p.vy<=0) return;
    for(int i=0;i<enemy_count;i++){
        if(!enemies[i].active) continue;
        float ex=enemies[i].x,ey=enemies[i].y;
        if(p.x+PLAYER_W>ex+2&&p.x<ex+18&&p.y+PLAYER_H>=ey&&p.y+PLAYER_H<=ey+12){
            enemies[i].active=false;
            p.vy=-220.0f;
            w.score+=5;
            spawnParticles(ex+10,ey);
        }
    }
}

void checkEnemyContact(World& w){
    Player& p=w.player;
    if(p.kb_timer>0){ p.kb_timer-=FIXED_DT; return; }
    for(int i=0;i<enemy_count;i++){
        if(!enemies[i].active) continue;
        float ex=enemies[i].x,ey=enemies[i].y;
        if(p.x+PLAYER_W>ex+4&&p.x<ex+16&&p.y+PLAYER_H>ey+8&&p.y<ey+16){
            // TODO: Calculate knockback direction (-1 left, +1 right)
            float dir=(p.x+PLAYER_W/2<ex+10)?-1.0f:1.0f;
            p.vx=dir*-300.0f; p.vy=-180.0f;
            p.kb_timer=0.5f; p.hp--;
            if(p.hp<=0){
                if(ckpt_valid) loadCheckpoint(w);
                else { p.x=48.0f; p.y=350.0f; p.vx=0; p.vy=0; p.state=GROUNDED; p.hp=3; }
            }
        }
    }
}

void collisionSystem(World& w){
    checkTileCollisionH(w);
    checkTileCollisionV(w);
    carryPlayer(w);
    checkHazardTiles(w);
    checkStompKill(w);
    checkEnemyContact(w);
    if(prev_state==AIRBORNE&&w.player.state==GROUNDED){
        spawnParticles(w.player.x+12,w.player.y+24);
        w.player.jumps_left=2;
    }
    prev_state=w.player.state;
    markCoins(w); cleanupPass(w); checkExitDoor(w);
    if(w.player.y>SCREEN_H){
        w.player.x=48.0f; w.player.y=350.0f;
        w.player.vy=0; w.player.vx=0; w.player.state=GROUNDED;
        w.player.jumps_left=2; w.player.hp=3; w.player.kb_timer=0;
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
        else if(w.tilemap[r][c]==5) DrawRectangle(c*TILE_SIZE+6,r*TILE_SIZE+14,TILE_SIZE-12,TILE_SIZE-14,RED);
    }
    for(int i=0;i<mov_plat_count;i++) DrawRectangle((int)mov_plats[i].x,(int)mov_plats[i].y,96,16,PURPLE);
    Color pcol=w.player.is_dashing?GOLD:BLUE;
    DrawRectangle((int)w.player.x,(int)w.player.y,PLAYER_W,PLAYER_H,pcol);
    for(int i=0;i<enemy_count;i++) if(enemies[i].active) DrawRectangle((int)enemies[i].x,(int)enemies[i].y,20,20,RED);
    for(int i=0;i<MAX_PARTICLES;i++) if(particles[i].active) DrawRectangle((int)particles[i].x,(int)particles[i].y,4,4,LIGHTGRAY);
    DrawText("** STOMP KILL **",SCREEN_W/2-140,8,16,CYAN);
    DrawText(w.player.state==GROUNDED?"GROUNDED":"AIRBORNE",10,30,14,WHITE);
    DrawText(TextFormat("Score: %d",w.score),10,48,14,YELLOW);
    DrawText(TextFormat("Level: %d",w.level_index+1),10,66,12,ORANGE);
    DrawText(TextFormat("HP: %d | Jumps: %d",w.player.hp,w.player.jumps_left),10,84,14,LIME);
    if(w.player.kb_timer>0) DrawText("KB!",200,100,24,ORANGE);
    EndDrawing();
}

void logicFrame(World& w){
    alloc_counter=0;
    if(IsKeyPressed(KEY_C)) saveCheckpoint(w);
    if(IsKeyPressed(KEY_R)&&ckpt_valid) loadCheckpoint(w);
    inputSystem(w);
    updateMovingPlatforms(FIXED_DT);
    updateEnemies(w,FIXED_DT); updateParticles(FIXED_DT);
    physicsSystem(w);
    collisionSystem(w);
}

void printToolkit(){
    cout<<"Dash: ON"<<endl;
    cout<<"Wall-slide: ON"<<endl;
    cout<<"Wall-jump: ON"<<endl;
    cout<<"Double-jump: ON"<<endl;
    cout<<"Pattern: movement-toolkit"<<endl;
}
void printHazards(){
    cout<<"Tile5: hazard"<<endl;
    cout<<"Death: respawn"<<endl;
    cout<<"Pattern: death-cycle"<<endl;
}
void printPatrol(){
    cout<<"Enemy-patrol: active"<<endl;
    cout<<"Edge-detect: ON"<<endl;
    cout<<"Pattern: bounce-patrol"<<endl;
}
void printStomp(){
    cout<<"Stomp: active"<<endl;
    cout<<"Bounce-vy: -220"<<endl;
    cout<<"Pattern: stomp-kill"<<endl;
}
void printKnockback(){
    cout<<"Knockback: active"<<endl;
    cout<<"Push-vx: 300"<<endl;
    cout<<"Pattern: knockback"<<endl;
}

int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Platformer -- L49 Knockback");
    SetTargetFPS(60);
    initWorld(w);
    for(int i=0;i<MAX_PARTICLES;i++) particles[i].active=false;
    printKnockback();
    while(!WindowShouldClose()){
        acc+=GetFrameTime();
        if(acc>0.250f) acc=0.250f;
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
const float DASH_SPEED = 500.0f; const float DASH_TIME = 0.15f; const float DASH_COOL = 0.6f;
const float SLIDE_CAP = 60.0f;

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
    {1,0,0,0,5,0,0,0,0,5,0,0,0,0,5,0,0,0,0,5,0,0,0,0,1},
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
    {1,0,0,5,0,0,0,0,5,0,0,0,0,5,0,0,0,5,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    },
};

enum MoveState { GROUNDED, AIRBORNE };
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };
struct Player { float x,y,vx,vy; MoveState state; float coyote_timer,jump_buffer_timer; float face_dir; bool is_dashing; float dash_timer; float dash_cool; int wall_dir; int jumps_left; int hp; float kb_timer; };
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
bool level_error=false;

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
void updateEnemies(World& w,float dt){
    for(int i=0;i<enemy_count;i++){
        if(!enemies[i].active) continue;
        enemies[i].x+=enemies[i].vx*dt;
        // Edge detection: turn before falling off platform
        int er=(int)((enemies[i].y+24)/TILE_SIZE);
        int next_c;
        if(enemies[i].vx>0) next_c=(int)((enemies[i].x+22)/TILE_SIZE);
        else next_c=(int)((enemies[i].x-2)/TILE_SIZE);
        if(next_c>=0&&next_c<COLS&&er>=0&&er<ROWS&&w.tilemap[er][next_c]==0)
            enemies[i].vx=-enemies[i].vx;
        if(enemies[i].x<32||enemies[i].x>SCREEN_W-64) enemies[i].vx=-enemies[i].vx;
    }
}
float ckpt_x=48.0f,ckpt_y=350.0f; int ckpt_score=0,ckpt_level=0; bool ckpt_valid=false;
void loadLevel(World& w){
    if(w.level_index<0||w.level_index>=NUM_LEVELS){ level_error=true; w.level_index=0; }
    memcpy(w.tilemap,LEVEL_DATA[w.level_index],sizeof(w.tilemap));
}
void saveCheckpoint(World& w){ ckpt_x=w.player.x; ckpt_y=w.player.y; ckpt_score=w.score; ckpt_level=w.level_index; ckpt_valid=true; }
void loadCheckpoint(World& w){
    if(!ckpt_valid) return;
    w.level_index=ckpt_level; loadLevel(w); scrambleCoins(w,42+ckpt_level*94);
    w.player.x=ckpt_x; w.player.y=ckpt_y; w.player.vx=0; w.player.vy=0; w.player.state=GROUNDED; w.score=ckpt_score;
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

void initWorld(World& w){
    w.player={48.0f,350.0f,0.0f,0.0f,GROUNDED,0.0f,0.0f,1.0f,false,0.0f,0.0f,0,2,3,0.0f};
    w.score=0; w.cmd=CMD_NONE; w.level_index=0;
    loadLevel(w); scrambleCoins(w,42);
    spawnEnemy(150,380,60.0f); spawnEnemy(350,380,-80.0f); spawnEnemy(550,350,70.0f);
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
    if(w.cmd==CMD_RIGHT) p.face_dir=1.0f;
    else if(w.cmd==CMD_LEFT) p.face_dir=-1.0f;
    if(p.dash_cool>0) p.dash_cool-=FIXED_DT;
    if(p.is_dashing){
        p.dash_timer-=FIXED_DT;
        p.vx=p.face_dir*DASH_SPEED; p.vy=0.0f;
        if(p.dash_timer<=0){ p.is_dashing=false; p.dash_timer=0.0f; }
        p.x+=p.vx*FIXED_DT; p.y+=p.vy*FIXED_DT; return;
    }
    if(IsKeyPressed(KEY_LEFT_SHIFT)&&p.dash_cool<=0&&!p.is_dashing){
        p.is_dashing=true; p.dash_timer=DASH_TIME; p.dash_cool=DASH_COOL;
        p.vx=p.face_dir*DASH_SPEED;
        p.x+=p.vx*FIXED_DT; p.y+=p.vy*FIXED_DT; return;
    }
    if(p.state==AIRBORNE&&p.coyote_timer>0) p.coyote_timer-=FIXED_DT;
    if(p.jump_buffer_timer>0) p.jump_buffer_timer-=FIXED_DT;
    if(p.wall_dir!=0&&p.state==AIRBORNE&&IsKeyPressed(KEY_SPACE)){
        p.vy=-JUMP_SPEED; p.vx=(float)(-p.wall_dir)*280.0f;
        p.coyote_timer=0; p.jump_buffer_timer=0; p.wall_dir=0;
    } else if(IsKeyPressed(KEY_SPACE)&&p.state==AIRBORNE&&p.coyote_timer<=0&&p.jumps_left>0){
        p.vy=-JUMP_SPEED*0.85f; p.jumps_left--;
    }
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
    if(p.wall_dir!=0&&p.state==AIRBORNE){
        bool pressing=(p.wall_dir==1&&IsKeyDown(KEY_RIGHT))||(p.wall_dir==-1&&IsKeyDown(KEY_LEFT));
        if(pressing&&p.vy>SLIDE_CAP) p.vy=SLIDE_CAP;
    }
    p.x+=p.vx*FIXED_DT;
    p.vy+=GRAVITY*FIXED_DT;
    p.y+=p.vy*FIXED_DT;
}

void checkTileCollisionH(World& w){
    Player& p=w.player;
    p.wall_dir=0;
    if(p.vx>0){
        int rc=(int)((p.x+PLAYER_W)/TILE_SIZE);
        int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
        if(rc<COLS&&tr>=0&&br>=0&&tr<ROWS&&br<ROWS)
            if(w.tilemap[tr][rc]==1||w.tilemap[br][rc]==1)
                { p.x=rc*TILE_SIZE-PLAYER_W; p.vx=0; p.wall_dir=1; }
    }
    if(p.vx<0){
        int lc=(int)(p.x/TILE_SIZE);
        int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
        if(lc>=0&&tr>=0&&br>=0&&tr<ROWS&&br<ROWS)
            if(w.tilemap[tr][lc]==1||w.tilemap[br][lc]==1)
                { p.x=(lc+1)*TILE_SIZE; p.vx=0; p.wall_dir=-1; }
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

void checkHazardTiles(World& w){
    Player& p=w.player;
    int tr=(int)(p.y/TILE_SIZE); int br=(int)((p.y+PLAYER_H-1)/TILE_SIZE);
    int lc=(int)(p.x/TILE_SIZE); int rc=(int)((p.x+PLAYER_W-1)/TILE_SIZE);
    for(int r=tr;r<=br;r++) for(int c=lc;c<=rc;c++)
        if(r>=0&&r<ROWS&&c>=0&&c<COLS&&w.tilemap[r][c]==5){
            if(ckpt_valid) loadCheckpoint(w);
            else { p.x=48.0f; p.y=350.0f; p.vx=0; p.vy=0; p.state=GROUNDED; }
            return;
        }
}

void checkStompKill(World& w){
    Player& p=w.player;
    if(p.vy<=0) return;
    for(int i=0;i<enemy_count;i++){
        if(!enemies[i].active) continue;
        float ex=enemies[i].x,ey=enemies[i].y;
        if(p.x+PLAYER_W>ex+2&&p.x<ex+18&&p.y+PLAYER_H>=ey&&p.y+PLAYER_H<=ey+12){
            enemies[i].active=false;
            p.vy=-220.0f;
            w.score+=5;
            spawnParticles(ex+10,ey);
        }
    }
}

void checkEnemyContact(World& w){
    Player& p=w.player;
    if(p.kb_timer>0){ p.kb_timer-=FIXED_DT; return; }
    for(int i=0;i<enemy_count;i++){
        if(!enemies[i].active) continue;
        float ex=enemies[i].x,ey=enemies[i].y;
        if(p.x+PLAYER_W>ex+4&&p.x<ex+16&&p.y+PLAYER_H>ey+8&&p.y<ey+16){
            float dir=(p.x+PLAYER_W/2<ex+10)?-1.0f:1.0f;
            p.vx=dir*-300.0f; p.vy=-180.0f;
            p.kb_timer=0.5f; p.hp--;
            if(p.hp<=0){
                if(ckpt_valid) loadCheckpoint(w);
                else { p.x=48.0f; p.y=350.0f; p.vx=0; p.vy=0; p.state=GROUNDED; p.hp=3; }
            }
        }
    }
}

void collisionSystem(World& w){
    checkTileCollisionH(w);
    checkTileCollisionV(w);
    carryPlayer(w);
    checkHazardTiles(w);
    checkStompKill(w);
    checkEnemyContact(w);
    if(prev_state==AIRBORNE&&w.player.state==GROUNDED){
        spawnParticles(w.player.x+12,w.player.y+24);
        w.player.jumps_left=2;
    }
    prev_state=w.player.state;
    markCoins(w); cleanupPass(w); checkExitDoor(w);
    if(w.player.y>SCREEN_H){
        w.player.x=48.0f; w.player.y=350.0f;
        w.player.vy=0; w.player.vx=0; w.player.state=GROUNDED;
        w.player.jumps_left=2; w.player.hp=3; w.player.kb_timer=0;
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
        else if(w.tilemap[r][c]==5) DrawRectangle(c*TILE_SIZE+6,r*TILE_SIZE+14,TILE_SIZE-12,TILE_SIZE-14,RED);
    }
    for(int i=0;i<mov_plat_count;i++) DrawRectangle((int)mov_plats[i].x,(int)mov_plats[i].y,96,16,PURPLE);
    Color pcol=w.player.is_dashing?GOLD:BLUE;
    DrawRectangle((int)w.player.x,(int)w.player.y,PLAYER_W,PLAYER_H,pcol);
    for(int i=0;i<enemy_count;i++) if(enemies[i].active) DrawRectangle((int)enemies[i].x,(int)enemies[i].y,20,20,RED);
    for(int i=0;i<MAX_PARTICLES;i++) if(particles[i].active) DrawRectangle((int)particles[i].x,(int)particles[i].y,4,4,LIGHTGRAY);
    DrawText("** KNOCKBACK **",SCREEN_W/2-140,8,16,CYAN);
    DrawText(w.player.state==GROUNDED?"GROUNDED":"AIRBORNE",10,30,14,WHITE);
    DrawText(TextFormat("Score: %d",w.score),10,48,14,YELLOW);
    DrawText(TextFormat("Level: %d",w.level_index+1),10,66,12,ORANGE);
    DrawText(TextFormat("HP: %d | Jumps: %d",w.player.hp,w.player.jumps_left),10,84,14,LIME);
    if(w.player.kb_timer>0) DrawText("KB!",200,100,24,ORANGE);
    EndDrawing();
}

void logicFrame(World& w){
    alloc_counter=0;
    if(IsKeyPressed(KEY_C)) saveCheckpoint(w);
    if(IsKeyPressed(KEY_R)&&ckpt_valid) loadCheckpoint(w);
    inputSystem(w);
    updateMovingPlatforms(FIXED_DT);
    updateEnemies(w,FIXED_DT); updateParticles(FIXED_DT);
    physicsSystem(w);
    collisionSystem(w);
}

void printToolkit(){
    cout<<"Dash: ON"<<endl;
    cout<<"Wall-slide: ON"<<endl;
    cout<<"Wall-jump: ON"<<endl;
    cout<<"Double-jump: ON"<<endl;
    cout<<"Pattern: movement-toolkit"<<endl;
}
void printHazards(){
    cout<<"Tile5: hazard"<<endl;
    cout<<"Death: respawn"<<endl;
    cout<<"Pattern: death-cycle"<<endl;
}
void printPatrol(){
    cout<<"Enemy-patrol: active"<<endl;
    cout<<"Edge-detect: ON"<<endl;
    cout<<"Pattern: bounce-patrol"<<endl;
}
void printStomp(){
    cout<<"Stomp: active"<<endl;
    cout<<"Bounce-vy: -220"<<endl;
    cout<<"Pattern: stomp-kill"<<endl;
}
void printKnockback(){
    cout<<"Knockback: active"<<endl;
    cout<<"Push-vx: 300"<<endl;
    cout<<"Pattern: knockback"<<endl;
}

int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Platformer -- L49 Knockback");
    SetTargetFPS(60);
    initWorld(w);
    for(int i=0;i<MAX_PARTICLES;i++) particles[i].active=false;
    printKnockback();
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
      { id: "g1", description: "active", expectedOutput: "Knockback: active" },
      { id: "g2", description: "pushvx", expectedOutput: "Push-vx: 300" },
      { id: "g3", description: "pattern", expectedOutput: "Pattern: knockback" },
    ],
    hints: [
      "Direction: if player center < enemy center, dir=-1 (player goes left). Otherwise dir=+1.",
      "p.vx = dir*-300.0f pushes the player AWAY from the enemy.",
      "kb_timer=0.5f prevents repeated damage for half a second.",
    ],
    estimatedMinutes: 20,
  },
};

export default lessonPlatformer49;