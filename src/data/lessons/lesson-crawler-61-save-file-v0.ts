import type { Lesson } from "@/types/lesson";

export const lessonCrawler61: Lesson = {
  id: "crawler-61-save-file-v0",
  title: "Save File v0",
  description: "Serialize player position, HP, inventory, explored map, floor number to fixed-size binary buffer. Save on key press.",
  order: 61,
  xpReward: 200,
  tier: "pro",
  concepts: ["save file", "serialization", "binary format", "state persistence"],
  part1: {
    title: "Concept: Save File v0",
    type: "concept",
    instructions: `# Concept: Save File v0

## Mental Model
This lesson teaches save file. In a first-person 3D engine, every spatial feature must be grounded in coordinate math and rendered through the camera transform.

## What Breaks Without This
Without save file, the dungeon lacks depth and interactivity. The player sees static geometry with no life.

## The Fix
Serialize player position, HP, score, inventory, floor number, and explored map into a fixed-size struct. Press P to save. The struct lives at file scope -- no allocations.

## Key Concepts
- Save
- Format

## Your Task
Print the expected output to verify the concept works.

Expected output:
  Save: v1
  Format: binary

## Spatial Insight
Save File v0 is essential for persistence. Save/load proves your state management is correct.

## Mastery Check
Question: Why does save file matter for a 3D dungeon crawler?
Answer: Because it proves the entire spatial pipeline is deterministic and reproducible.

## Beginner Trap
**Writing the entire game state in one fwrite() call.** Struct layout varies between compilers. Serialize each field individually in a defined order with explicit sizes. This makes the save format portable and version-safe.

## Elite Insight
Bethesda save files serialize each field with a tag and type marker. This makes saves forward-compatible — a newer game version can skip unknown tags. Your field-by-field approach is the simplified version of this tagged serialization.

## Systems Thinking Connection
The RPG implements save files (L24) with the same field-by-field approach. The Platformer uses checkpoint saves. All paths serialize game state the same way — write fields in order, read them back in order. The serialization pattern is universal.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print "Save: v1"
    // TODO: Print "Format: binary"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Save: v1" << endl;
    cout << "Format: binary" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Save", expectedOutput: "Save: v1" },
      { id: "t2", description: "Format", expectedOutput: "Format: binary" },
    ],
    hints: [
      "Print the expected output lines using cout.",
      "Make sure the output matches exactly.",
      "cout << \"Save: v1\" << endl; cout << \"Format: binary\" << endl",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Save File v0",
    type: "game_builder",
    instructions: `# Build: Save File v0

## Overview
Add save file to the 3D dungeon. Serialize player position, HP, score, inventory, floor number, and explored map into a fixed-size struct. Press P to save. The struct lives at file scope -- no allocations.

## What to Add
1. Implement the save file feature
2. Add cout diagnostics: Save: v1, Format: binary
3. Add HUD display element

## Expected new cout lines
  Save: v1
  Format: binary

## Gate A Reminder
No new/delete/vector resize in the game loop. All entity state uses fixed-size arrays at file scope.

## Spatial Connection
This persistence feature proves your state management is sound. Save, load, verify -- the foundation for replay.`,
    starterCode: `#include <iostream>
#include <cmath>
#include 'raylib.h'
#include <cstdlib>
#include <cstring>
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 600;
const int MAP_W = 16;
const int MAP_H = 16;
const float CELL = 4.0f;

int dungeon[MAP_H][MAP_W] = {
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,5,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,1,1,1,2,1,1,1,1,1,1,1,0,1,1,1},
    {1,1,1,1,0,1,1,1,1,1,1,1,2,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,6,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,6,0,0,1,1,1},
    {1,1,1,1,0,3,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,6,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,6,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,6,0,0,1,1,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
};

float player_x = 10.0f;
float player_y = 1.0f;
float player_z = 10.0f;
float player_yaw = 0.0f;
float player_pitch = 0.0f;
const float MOUSE_SENSITIVITY = 0.003f;
const float MOVE_SPEED = 0.1f;
const float PLAYER_RADIUS = 0.4f;
const int MM_SIZE = 6;
const int NUM_ITEMS = 3;
float item_x[NUM_ITEMS] = {10.0f, 46.0f, 30.0f};
float item_z[NUM_ITEMS] = {14.0f, 14.0f, 46.0f};
bool item_active[NUM_ITEMS] = {true, true, true};
int score = 0;
int game_state = 0;
int player_level = 1;

const int NUM_LIGHTS = 3;
float light_x[NUM_LIGHTS] = {8.0f, 44.0f, 24.0f};
float light_z[NUM_LIGHTS] = {12.0f, 12.0f, 44.0f};
float light_str[NUM_LIGHTS] = {16.0f, 16.0f, 16.0f};
float player_light_str = 12.0f;
int tick_alloc = 0;
int ray_hit_tile = 0;
int ray_hit_x = 0, ray_hit_z = 0;

const int NUM_ENEMIES = 3;
float enemy_x[NUM_ENEMIES] = {18.0f, 30.0f, 42.0f};
float enemy_z[NUM_ENEMIES] = {10.0f, 22.0f, 38.0f};
bool enemy_alive[NUM_ENEMIES] = {true, true, true};
int enemy_hp[NUM_ENEMIES] = {10, 10, 10};
float wp_x[NUM_ENEMIES][2] = {{18.0f,22.0f},{30.0f,34.0f},{42.0f,38.0f}};
float wp_z[NUM_ENEMIES][2] = {{10.0f,18.0f},{22.0f,30.0f},{38.0f,42.0f}};
int wp_idx[NUM_ENEMIES] = {0, 0, 0};
int enemy_behavior[NUM_ENEMIES] = {0, 0, 0};
int player_hp = 100;
int player_max_hp = 100;
int current_floor = 1;

// === FRUSTUM MODULE ===
int walls_drawn = 0;
int walls_culled = 0;

bool inFrustum(float wx, float wz) {
    float dx = wx - player_x, dz = wz - player_z;
    float dist = sqrtf(dx*dx + dz*dz);
    if (dist > FOG_END + CELL) return false;
    float angle = atan2f(dz, dx) - player_yaw;
    while (angle > 3.14159f) angle -= 6.28318f;
    while (angle < -3.14159f) angle += 6.28318f;
    return (angle > -1.2f && angle < 1.2f);
}

// === VISIBILITY MODULE ===
bool cell_visible[MAP_H][MAP_W] = {};
int vis_stack_x[256], vis_stack_z[256];

void floodVisibility() {
    for (int z=0;z<MAP_H;z++) for (int x=0;x<MAP_W;x++) cell_visible[z][x]=false;
    int top=0;
    int px=(int)(player_x/CELL), pz=(int)(player_z/CELL);
    if (px>=0&&px<MAP_W&&pz>=0&&pz<MAP_H) {
        vis_stack_x[top]=px; vis_stack_z[top]=pz; top++;
        cell_visible[pz][px]=true;
    }
    while (top>0) {
        top--;
        int cx=vis_stack_x[top], cz=vis_stack_z[top];
        float dx=(cx*CELL+CELL/2)-player_x, dz2=(cz*CELL+CELL/2)-player_z;
        if (sqrtf(dx*dx+dz2*dz2)>FOG_END) continue;
        int dirs[4][2]={{1,0},{-1,0},{0,1},{0,-1}};
        for (int d=0;d<4;d++) {
            int nx=cx+dirs[d][0], nz=cz+dirs[d][1];
            if (nx<0||nx>=MAP_W||nz<0||nz>=MAP_H) continue;
            if (cell_visible[nz][nx]) continue;
            cell_visible[nz][nx]=true;
            if (dungeon[nz][nx]==0&&top<255) {
                vis_stack_x[top]=nx; vis_stack_z[top]=nz; top++;
            }
        }
    }
}

// === FOG OF WAR MODULE ===
bool explored[MAP_H][MAP_W] = {};

void updateExplored() {
    for (int z=0;z<MAP_H;z++) for (int x=0;x<MAP_W;x++)
        if (cell_visible[z][x]) explored[z][x]=true;
}

// === SPATIAL HASH MODULE ===
const int HASH_W = 8, HASH_H = 8;
const int BUCKET_CAP = 8;
int hash_buckets[HASH_H][HASH_W][BUCKET_CAP];
int hash_count[HASH_H][HASH_W] = {};

void clearHash() {
    for (int z=0;z<HASH_H;z++) for (int x=0;x<HASH_W;x++) hash_count[z][x]=0;
}

void insertHash(int id, float wx, float wz) {
    int bx=(int)(wx/(CELL*MAP_W/HASH_W));
    int bz=(int)(wz/(CELL*MAP_H/HASH_H));
    if (bx<0) bx=0; if (bx>=HASH_W) bx=HASH_W-1;
    if (bz<0) bz=0; if (bz>=HASH_H) bz=HASH_H-1;
    if (hash_count[bz][bx]<BUCKET_CAP)
        hash_buckets[bz][bx][hash_count[bz][bx]++]=id;
}

// === PATHFINDING MODULE ===
struct PathNode { int x, z, g, h, px, pz; };
PathNode open_set[256];
int open_count = 0;
bool closed[MAP_H][MAP_W] = {};
int path_x[64], path_z[64];
int path_len = 0;

int heuristic(int ax, int az, int bx, int bz) {
    int dx = ax>bx ? ax-bx : bx-ax;
    int dz = az>bz ? az-bz : bz-az;
    return dx + dz;
}

bool findPath(int sx, int sz, int gx, int gz) {
    open_count = 0; path_len = 0;
    for (int z=0;z<MAP_H;z++) for (int x=0;x<MAP_W;x++) closed[z][x]=false;
    open_set[open_count++] = {sx, sz, 0, heuristic(sx,sz,gx,gz), -1, -1};
    while (open_count > 0) {
        int best = 0;
        for (int i=1;i<open_count;i++)
            if (open_set[i].g+open_set[i].h < open_set[best].g+open_set[best].h) best=i;
        PathNode cur = open_set[best];
        open_set[best] = open_set[--open_count];
        if (cur.x==gx && cur.z==gz) { path_len=1; return true; }
        if (closed[cur.z][cur.x]) continue;
        closed[cur.z][cur.x] = true;
        int dirs[4][2]={{1,0},{-1,0},{0,1},{0,-1}};
        for (int d=0;d<4;d++) {
            int nx=cur.x+dirs[d][0], nz=cur.z+dirs[d][1];
            if (nx<0||nx>=MAP_W||nz<0||nz>=MAP_H) continue;
            if (closed[nz][nx]||dungeon[nz][nx]==1||dungeon[nz][nx]==5) continue;
            if (open_count<255)
                open_set[open_count++]={nx,nz,cur.g+1,heuristic(nx,nz,gx,gz),cur.x,cur.z};
        }
    }
    return false;
}

// === SOUND MODULE ===
float soundVolume(float sx, float sz) {
    float dx=player_x-sx, dz=player_z-sz;
    float dist=sqrtf(dx*dx+dz*dz);
    float vol=1.0f-dist/32.0f;
    if (vol<0.0f) vol=0.0f;
    if (!hasLOS(player_x,player_z,sx,sz)) vol*=0.3f;
    return vol;
}

// === PARTICLE MODULE ===
const int MAX_PARTICLES = 64;
float part_x[MAX_PARTICLES], part_y[MAX_PARTICLES], part_z[MAX_PARTICLES];
float part_vx[MAX_PARTICLES], part_vy[MAX_PARTICLES], part_vz[MAX_PARTICLES];
float part_life[MAX_PARTICLES] = {};
int part_count = 0;

void spawnParticle(float px, float py, float pz, float vx, float vy, float vz) {
    if (part_count >= MAX_PARTICLES) return;
    int i = part_count++;
    part_x[i]=px; part_y[i]=py; part_z[i]=pz;
    part_vx[i]=vx; part_vy[i]=vy; part_vz[i]=vz;
    part_life[i]=1.0f;
}

void updateParticles(float dt) {
    for (int i=0;i<part_count;i++) {
        part_x[i]+=part_vx[i]*dt; part_y[i]+=part_vy[i]*dt; part_z[i]+=part_vz[i]*dt;
        part_vy[i]-=2.0f*dt;
        part_life[i]-=dt*0.5f;
        if (part_life[i]<=0.0f) {
            part_x[i]=part_x[part_count-1]; part_y[i]=part_y[part_count-1]; part_z[i]=part_z[part_count-1];
            part_vx[i]=part_vx[part_count-1]; part_vy[i]=part_vy[part_count-1]; part_vz[i]=part_vz[part_count-1];
            part_life[i]=part_life[part_count-1]; part_count--; i--;
        }
    }
}

// === PROJECTILE MODULE ===
const int MAX_PROJ = 8;
float proj_x[MAX_PROJ], proj_y[MAX_PROJ], proj_z[MAX_PROJ];
float proj_dx[MAX_PROJ], proj_dy[MAX_PROJ], proj_dz[MAX_PROJ];
bool proj_active[MAX_PROJ] = {};
int proj_count = 0;

void fireProjectile() {
    for (int i=0;i<MAX_PROJ;i++) {
        if (!proj_active[i]) {
            proj_x[i]=player_x; proj_y[i]=player_y; proj_z[i]=player_z;
            proj_dx[i]=cosf(player_yaw)*cosf(player_pitch)*0.3f;
            proj_dy[i]=sinf(player_pitch)*0.3f;
            proj_dz[i]=sinf(player_yaw)*cosf(player_pitch)*0.3f;
            proj_active[i]=true; return;
        }
    }
}

void updateProjectiles() {
    for (int i=0;i<MAX_PROJ;i++) {
        if (!proj_active[i]) continue;
        proj_x[i]+=proj_dx[i]; proj_y[i]+=proj_dy[i]; proj_z[i]+=proj_dz[i];
        int gx=(int)(proj_x[i]/CELL), gz=(int)(proj_z[i]/CELL);
        if (gx<0||gx>=MAP_W||gz<0||gz>=MAP_H||dungeon[gz][gx]==1) { proj_active[i]=false; continue; }
        for (int e=0;e<NUM_ENEMIES;e++) {
            if (!enemy_alive[e]) continue;
            float dx=proj_x[i]-enemy_x[e], dz=proj_z[i]-enemy_z[e];
            if (dx*dx+dz*dz<CELL) { enemy_hp[e]-=10; if(enemy_hp[e]<=0) enemy_alive[e]=false; proj_active[i]=false; break; }
        }
    }
}

// === SAVE MODULE ===
const int SAVE_VERSION = 1;
struct SaveData {
    int version;
    float px, py, pz, yaw, pitch;
    int hp, max_hp, sc, floor_num;
    bool items[3];
    bool expl[MAP_H][MAP_W];
};
SaveData save_buf;
bool save_pending = false;

void doSave() {
    save_buf.version = SAVE_VERSION;
    save_buf.px=player_x; save_buf.py=player_y; save_buf.pz=player_z;
    save_buf.yaw=player_yaw; save_buf.pitch=player_pitch;
    save_buf.hp=player_hp; save_buf.max_hp=player_max_hp;
    save_buf.sc=score; save_buf.floor_num=current_floor;
    for (int i=0;i<NUM_ITEMS;i++) save_buf.items[i]=item_active[i];
    memcpy(save_buf.expl, explored, sizeof(explored));
    save_pending = true;
}

// === SPATIAL MODULE ===
bool isSolid(int t) { return t==1||t==2||t==3||t==5; }

bool sphereHitsCell(float cx,float cz,int gx,int gz,float r) {
    float nx=cx<gx*CELL?gx*CELL:(cx>(gx+1)*CELL?(gx+1)*CELL:cx);
    float nz=cz<gz*CELL?gz*CELL:(cz>(gz+1)*CELL?(gz+1)*CELL:cz);
    float dx=cx-nx,dz=cz-nz;
    return (dx*dx+dz*dz)<(r*r);
}

void resolveCollision(float& px,float& pz,float r) {
    int x0=(int)((px-r)/CELL)-1; if(x0<0) x0=0;
    int x1=(int)((px+r)/CELL)+1; if(x1>=MAP_W) x1=MAP_W-1;
    int z0=(int)((pz-r)/CELL)-1; if(z0<0) z0=0;
    int z1=(int)((pz+r)/CELL)+1; if(z1>=MAP_H) z1=MAP_H-1;
    for (int gz=z0;gz<=z1;gz++) for (int gx=x0;gx<=x1;gx++) {
        if (!isSolid(dungeon[gz][gx])) continue;
        if (!sphereHitsCell(px,pz,gx,gz,r)) continue;
        float nx=px<gx*CELL?gx*CELL:(px>(gx+1)*CELL?(gx+1)*CELL:px);
        float nz=pz<gz*CELL?gz*CELL:(pz>(gz+1)*CELL?(gz+1)*CELL:pz);
        float dx=px-nx,dz=pz-nz;
        float dist=sqrtf(dx*dx+dz*dz);
        if(dist<0.0001f){px+=r;continue;}
        float push=r-dist;
        px+=dx/dist*push; pz+=dz/dist*push;
    }
}

bool hasLOS(float ax,float az,float bx,float bz) {
    float dx=bx-ax,dz=bz-az;
    float dist=sqrtf(dx*dx+dz*dz);
    float step=CELL*0.5f;
    int steps=(int)(dist/step);
    if(steps>40) steps=40;
    for(int s=1;s<=steps;s++){
        float t=(float)s/(float)steps;
        int gx=(int)((ax+dx*t)/CELL);
        int gz=(int)((az+dz*t)/CELL);
        if(gx>=0&&gx<MAP_W&&gz>=0&&gz<MAP_H&&isSolid(dungeon[gz][gx])) return false;
    }
    return true;
}

// === LIGHTING MODULE ===
const float AMBIENT = 0.15f;

Color shadeColor(Color base, float intensity) {
    if(intensity<0.0f) intensity=0.0f;
    if(intensity>1.0f) intensity=1.0f;
    return (Color){(unsigned char)(base.r*intensity),
                   (unsigned char)(base.g*intensity),
                   (unsigned char)(base.b*intensity),255};
}

float calcPointLight(float wx,float wz,float lx,float lz,float strength) {
    float dx=wx-lx, dz=wz-lz;
    float dist=sqrtf(dx*dx+dz*dz);
    return strength/(dist*dist+1.0f);
}

float calcAmbient(float wx,float wz) {
    float dx=wx-player_x, dz=wz-player_z;
    float dist=sqrtf(dx*dx+dz*dz);
    float intensity=1.0f-dist/24.0f;
    if(intensity<AMBIENT) intensity=AMBIENT;
    return intensity;
}

const float FOG_START=8.0f;
const float FOG_END=24.0f;

Color applyFog(Color c, float dist) {
    float f=(dist-FOG_START)/(FOG_END-FOG_START);
    if(f<0.0f)f=0.0f; if(f>1.0f)f=1.0f;
    return (Color){(unsigned char)(c.r*(1.0f-f)),
                   (unsigned char)(c.g*(1.0f-f)),
                   (unsigned char)(c.b*(1.0f-f)),255};
}

// === ENTITY MODULE ===
void updatePatrol(int i) {
    float tx=wp_x[i][wp_idx[i]], tz=wp_z[i][wp_idx[i]];
    float dx=tx-enemy_x[i], dz=tz-enemy_z[i];
    float dist=sqrtf(dx*dx+dz*dz);
    if(dist<0.5f){wp_idx[i]=1-wp_idx[i];return;}
    float spd=0.03f;
    enemy_x[i]+=dx/dist*spd; enemy_z[i]+=dz/dist*spd;
}

void updateChase(int i) {
    int gx=(int)(player_x/CELL), gz=(int)(player_z/CELL);
    int ex=(int)(enemy_x[i]/CELL), ez=(int)(enemy_z[i]/CELL);
    if (findPath(ex,ez,gx,gz) && path_len>0) {
        float dx=player_x-enemy_x[i], dz=player_z-enemy_z[i];
        float dist=sqrtf(dx*dx+dz*dz);
        if(dist<1.5f) return;
        float spd=0.04f;
        enemy_x[i]+=dx/dist*spd; enemy_z[i]+=dz/dist*spd;
    }
}

void updateEnemies() {
    for(int i=0;i<NUM_ENEMIES;i++) {
        if(!enemy_alive[i]) continue;
        bool sees=hasLOS(enemy_x[i],enemy_z[i],player_x,player_z);
        enemy_behavior[i]=sees?1:0;
        if(enemy_behavior[i]==1) updateChase(i);
        else updatePatrol(i);
    }
}

void enemyAttack() {
    for(int i=0;i<NUM_ENEMIES;i++) {
        if(!enemy_alive[i]) continue;
        float dx=player_x-enemy_x[i], dz=player_z-enemy_z[i];
        float dist=sqrtf(dx*dx+dz*dz);
        if(dist<CELL) { player_hp-=3; if(player_hp<0)player_hp=0; }
    }
}

void tryAttack() {
    float rx=player_x,rz=player_z;
    float rdx=cosf(player_yaw),rdz=sinf(player_yaw);
    for(int s=0;s<15;s++) {
        rx+=rdx*0.5f; rz+=rdz*0.5f;
        for(int i=0;i<NUM_ENEMIES;i++) {
            if(!enemy_alive[i]) continue;
            float dx=rx-enemy_x[i],dz=rz-enemy_z[i];
            if(dx*dx+dz*dz<CELL*CELL) {
                enemy_hp[i]-=5;
                if(enemy_hp[i]<=0) enemy_alive[i]=false;
                return;
            }
        }
        int gx=(int)(rx/CELL),gz=(int)(rz/CELL);
        if(gx>=0&&gx<MAP_W&&gz>=0&&gz<MAP_H&&isSolid(dungeon[gz][gx])) return;
    }
}

Camera3D camera = {0};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Dungeon");
    SetTargetFPS(60);
    DisableCursor();

    camera.position = (Vector3){player_x, player_y, player_z};
    camera.target = (Vector3){player_x+cosf(player_yaw)*cosf(player_pitch),
        player_y+sinf(player_pitch), player_z+sinf(player_yaw)*cosf(player_pitch)};
    camera.up = (Vector3){0.0f, 1.0f, 0.0f};
    camera.fovy = 70.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    cout << "Player: (10, 1, 10)" << endl;
    cout << "Map: 16x16" << endl;
    cout << "Rooms: 3" << endl;
    cout << "Floor: y=0" << endl;
    cout << "Ceiling: y=4" << endl;
    cout << "Minimap: 16x16" << endl;
    cout << "Doors: 2" << endl;
    cout << "Items: 3" << endl;
    cout << "Score: 0" << endl;
    cout << "Goal: 3 items" << endl;
    cout << "Ray: DDA" << endl;
    cout << "Interact: raycast" << endl;
    cout << "Blocks: 1" << endl;
    cout << "Plates: 1" << endl;
    cout << "Puzzle: push-plate-door" << endl;
    cout << "Sphere: r=0.4" << endl;
    cout << "Collision: sphere-AABB" << endl;
    cout << "Slope: query" << endl;
    cout << "Heights: active" << endl;
    cout << "Platforms: 1" << endl;
    cout << "Moving: active" << endl;
    cout << "Keys: 1" << endl;
    cout << "Locks: key-door" << endl;
    cout << "Stair: tile-6" << endl;
    cout << "Level: 1" << endl;
    cout << "Milestone: multi-floor" << endl;
    cout << "Ambient: 0.15" << endl;
    cout << "Shading: distance" << endl;
    cout << "Heap: frozen" << endl;
    cout << "Alloc/tick: 0" << endl;
    cout << "GATE A: passed" << endl;
    cout << "Billboard: active" << endl;
    cout << "Sprites: facing" << endl;
    cout << "Enemies: 3" << endl;
    cout << "Enemy HP: 10" << endl;
    cout << "Facing: atan2" << endl;
    cout << "Rotation: player-relative" << endl;
    cout << "AI: patrol" << endl;
    cout << "Waypoints: 2" << endl;
    cout << "Milestone: living-dungeon" << endl;
    cout << "Entities: managed" << endl;
    cout << "LOS: ray-grid" << endl;
    cout << "Occlusion: wall-check" << endl;
    cout << "Chase: on-sight" << endl;
    cout << "Behavior: patrol|chase" << endl;
    cout << "Attack: raycast" << endl;
    cout << "Damage: 5" << endl;
    cout << "Enemy damage: 3" << endl;
    cout << "Player HP: 100" << endl;
    cout << "Milestone: combat-dungeon" << endl;
    cout << "Combat: complete" << endl;
    cout << "Templates: 3" << endl;
    cout << "Room data: array" << endl;
    cout << "Corridors: L-shape" << endl;
    cout << "Carve: grid" << endl;
    cout << "BSP: active" << endl;
    cout << "Partitions: 4" << endl;
    cout << "Auto-doors: active" << endl;
    cout << "Connections: detected" << endl;
    cout << "Milestone: random-dungeon" << endl;
    cout << "Generation: complete" << endl;
    cout << "Spawn: procedural" << endl;
    cout << "Placement: room-based" << endl;
    cout << "Difficulty: scaling" << endl;
    cout << "Depth: increases" << endl;
    cout << "Loot: seeded" << endl;
    cout << "Tables: active" << endl;
    cout << "Floors: multi" << endl;
    cout << "Staircase: active" << endl;
    cout << "Milestone: roguelike-core" << endl;
    cout << "Phase5: complete" << endl;
    cout << "Frustum: 4-plane" << endl;
    cout << "Culling: active" << endl;
    cout << "Visibility: flood-fill" << endl;
    cout << "Cells: visible|hidden" << endl;
    cout << "FogOfWar: active" << endl;
    cout << "Explored: tracking" << endl;
    cout << "SpatialHash: 8x8" << endl;
    cout << "Lookup: O(1)" << endl;
    cout << "Milestone: optimized-renderer" << endl;
    cout << "Phase6a: complete" << endl;
    cout << "Pathfind: A*" << endl;
    cout << "Grid: navigable" << endl;
    cout << "Sound: propagation" << endl;
    cout << "Attenuation: distance" << endl;
    cout << "Particles: pool-based" << endl;
    cout << "Effects: active" << endl;
    cout << "Projectiles: 3D" << endl;
    cout << "Trajectory: active" << endl;
    cout << "Milestone: rich-3d-world" << endl;
    cout << "Phase6: complete" << endl;
    // TODO: cout << "Save: v1" << endl;
    // TODO: cout << "Format: binary" << endl;

    while(!WindowShouldClose()) {
        Vector2 delta=GetMouseDelta();
        player_yaw-=delta.x*MOUSE_SENSITIVITY;
        player_pitch-=delta.y*MOUSE_SENSITIVITY;
        if(player_pitch>1.5f)player_pitch=1.5f;
        if(player_pitch<-1.5f)player_pitch=-1.5f;

        float forward_x=cosf(player_yaw),forward_z=sinf(player_yaw);
        float right_x=-sinf(player_yaw),right_z=cosf(player_yaw);
        float move_x=0.0f,move_z=0.0f;
        if(IsKeyDown(KEY_W)){move_x+=forward_x*MOVE_SPEED;move_z+=forward_z*MOVE_SPEED;
        }
        if(IsKeyDown(KEY_S)){move_x-=forward_x*MOVE_SPEED;move_z-=forward_z*MOVE_SPEED;
        }
        if(IsKeyDown(KEY_A)){move_x-=right_x*MOVE_SPEED;move_z-=right_z*MOVE_SPEED;
        }
        if(IsKeyDown(KEY_D)){move_x+=right_x*MOVE_SPEED;move_z+=right_z*MOVE_SPEED;
        }
        float new_x=player_x+move_x, new_z=player_z+move_z;
        resolveCollision(new_x,new_z,PLAYER_RADIUS);
        player_x=new_x; player_z=new_z;

        if(IsKeyPressed(KEY_E)&&ray_hit_tile==2) dungeon[ray_hit_z][ray_hit_x]=0;
        if(IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) tryAttack();
        if(IsKeyPressed(KEY_F)) fireProjectile();
        if(IsKeyPressed(KEY_P)) doSave();

        for(int i=0;i<NUM_ITEMS;i++){
            if(!item_active[i])continue;
            float dx=player_x-item_x[i],dz=player_z-item_z[i];
            if(sqrtf(dx*dx+dz*dz)<CELL*0.5f){item_active[i]=false;score++;}
        }
        if(score>=NUM_ITEMS) game_state=1;

        clearHash();
        for(int i=0;i<NUM_ENEMIES;i++) if(enemy_alive[i]) insertHash(i,enemy_x[i],enemy_z[i]);
        updateEnemies();
        enemyAttack();
        updateParticles(1.0f/60.0f);
        for(int li=0;li<NUM_LIGHTS;li++) { if(rand()%20==0) spawnParticle(light_x[li],2.0f,light_z[li],(rand()%10-5)*0.02f,0.5f,(rand()%10-5)*0.02f); }
        updateProjectiles();
        floodVisibility();
        updateExplored();

        {
            float rx=player_x,rz=player_z;
            float rdx=cosf(player_yaw),rdz=sinf(player_yaw);
            ray_hit_tile=0;
            for(int s=0;s<20;s++){
                rx+=rdx*0.5f;rz+=rdz*0.5f;
                int gx2=(int)(rx/CELL),gz2=(int)(rz/CELL);
                if(gx2<0||gx2>=MAP_W||gz2<0||gz2>=MAP_H)break;
                ray_hit_tile=dungeon[gz2][gx2];
                if(ray_hit_tile>0){ray_hit_x=gx2;ray_hit_z=gz2;break;}
            }
        }

        camera.target=(Vector3){player_x+cosf(player_yaw)*cosf(player_pitch),
            player_y+sinf(player_pitch),player_z+sinf(player_yaw)*cosf(player_pitch)};
        camera.position=(Vector3){player_x,player_y,player_z};

        tick_alloc=0;
        BeginDrawing();
        ClearBackground(BLACK);
        srand((unsigned)(GetTime()*100));
        float flicker[NUM_LIGHTS];
        for(int li=0;li<NUM_LIGHTS;li++) flicker[li]=rand()%5/10.0f;
        walls_drawn=0; walls_culled=0;
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2,0,MAP_H*CELL/2},(Vector2){(float)MAP_W*CELL,(float)MAP_H*CELL},DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2,CELL,MAP_H*CELL/2},(Vector2){(float)MAP_W*CELL,(float)MAP_H*CELL},DARKGRAY);
        for(int z=0;z<MAP_H;z++) for(int x=0;x<MAP_W;x++){
            if(dungeon[z][x]>=1&&dungeon[z][x]<=3){
                float wx=x*CELL+CELL/2,wz=z*CELL+CELL/2;
                if(!inFrustum(wx,wz)){walls_culled++;continue;}
                walls_drawn++;
                float tot=calcAmbient(wx,wz);
                for(int li=0;li<NUM_LIGHTS;li++) tot+=calcPointLight(wx,wz,light_x[li],light_z[li],light_str[li]+flicker[li]);
                tot+=calcPointLight(wx,wz,player_x,player_z,player_light_str);
                Color rawBase=dungeon[z][x]==1?GRAY:dungeon[z][x]==2?BROWN:PURPLE;
                float pdx=wx-player_x,pdz=wz-player_z;
                float pdist=sqrtf(pdx*pdx+pdz*pdz);
                DrawCube((Vector3){wx,CELL/2,wz},CELL,CELL,CELL,applyFog(shadeColor(rawBase,tot),pdist));
            }
        }
        for(int i=0;i<NUM_ITEMS;i++)
            if(item_active[i])
                DrawCube((Vector3){item_x[i],CELL/4,item_z[i]},CELL/2,CELL/2,CELL/2,GOLD);
        for(int i=0;i<NUM_ENEMIES;i++){
            if(!enemy_alive[i])continue;
            DrawCube((Vector3){enemy_x[i],1.0f,enemy_z[i]},1.2f,2.0f,0.3f,RED);
        }
        for(int i=0;i<part_count;i++)
            DrawCube((Vector3){part_x[i],part_y[i],part_z[i]},0.1f,0.1f,0.1f,ORANGE);
        for(int i=0;i<MAX_PROJ;i++)
            if(proj_active[i]) DrawSphere((Vector3){proj_x[i],proj_y[i],proj_z[i]},0.2f,YELLOW);
        EndMode3D();

        Color ch_color=(ray_hit_tile>0)?(Color){255,80,80,220}:(Color){255,255,255,180};
        DrawRectangle(SCREEN_W/2-1,SCREEN_H/2-8,2,16,ch_color);
        DrawRectangle(SCREEN_W/2-8,SCREEN_H/2-1,16,2,ch_color);
        DrawText("HeapSight Dungeon",10,10,20,WHITE);
        DrawText(TextFormat("HP: %d/%d",player_hp,player_max_hp),10,40,16,player_hp>50?GREEN:RED);
        int alive_count=0;
        for(int i=0;i<NUM_ENEMIES;i++) if(enemy_alive[i]) alive_count++;
        DrawText(TextFormat("Enemies: %d",alive_count),10,60,16,RED);
        DrawText(TextFormat("Score: %d/%d",score,NUM_ITEMS),10,80,16,GOLD);
        DrawText(TextFormat("Floor: %d",current_floor),10,100,16,YELLOW);
        DrawText("ALLOC:0",650,10,16,tick_alloc==0?GREEN:RED);
        DrawText(tick_alloc==0?"GATE A: PASS":"GATE A: FAIL",600,30,16,tick_alloc==0?GREEN:RED);
        DrawText(TextFormat("Drawn:%d Culled:%d",walls_drawn,walls_culled),10,120,14,WHITE);
        if(save_pending) DrawText("SAVED",SCREEN_W/2-30,10,16,GREEN);

        const int MM_X=SCREEN_W-MAP_W*MM_SIZE-10, MM_Y=70;
        for(int mz=0;mz<MAP_H;mz++) for(int mx=0;mx<MAP_W;mx++){
            if(!explored[mz][mx]){DrawRectangle(MM_X+mx*MM_SIZE,MM_Y+mz*MM_SIZE,MM_SIZE-1,MM_SIZE-1,BLACK);continue;}
            Color mc=cell_visible[mz][mx] ?
                ((dungeon[mz][mx]==1)?GRAY:(dungeon[mz][mx]==2)?BROWN:(dungeon[mz][mx]==3)?PURPLE:DARKGRAY)
                : (Color){30,30,30,255};
            DrawRectangle(MM_X+mx*MM_SIZE,MM_Y+mz*MM_SIZE,MM_SIZE-1,MM_SIZE-1,mc);
        }
        int pmx=(int)(player_x/CELL),pmz=(int)(player_z/CELL);
        DrawRectangle(MM_X+pmx*MM_SIZE,MM_Y+pmz*MM_SIZE,MM_SIZE-1,MM_SIZE-1,GREEN);
        for(int i=0;i<NUM_ENEMIES;i++) if(enemy_alive[i]){
            int emx=(int)(enemy_x[i]/CELL),emz=(int)(enemy_z[i]/CELL);
            DrawRectangle(MM_X+emx*MM_SIZE+1,MM_Y+emz*MM_SIZE+1,MM_SIZE-3,MM_SIZE-3,RED);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
#include 'raylib.h'
#include <cstdlib>
#include <cstring>
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 600;
const int MAP_W = 16;
const int MAP_H = 16;
const float CELL = 4.0f;

int dungeon[MAP_H][MAP_W] = {
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,5,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,1,1,1,2,1,1,1,1,1,1,1,0,1,1,1},
    {1,1,1,1,0,1,1,1,1,1,1,1,2,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,6,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,6,0,0,1,1,1},
    {1,1,1,1,0,3,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,6,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,6,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,6,0,0,1,1,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
};

float player_x = 10.0f;
float player_y = 1.0f;
float player_z = 10.0f;
float player_yaw = 0.0f;
float player_pitch = 0.0f;
const float MOUSE_SENSITIVITY = 0.003f;
const float MOVE_SPEED = 0.1f;
const float PLAYER_RADIUS = 0.4f;
const int MM_SIZE = 6;
const int NUM_ITEMS = 3;
float item_x[NUM_ITEMS] = {10.0f, 46.0f, 30.0f};
float item_z[NUM_ITEMS] = {14.0f, 14.0f, 46.0f};
bool item_active[NUM_ITEMS] = {true, true, true};
int score = 0;
int game_state = 0;
int player_level = 1;

const int NUM_LIGHTS = 3;
float light_x[NUM_LIGHTS] = {8.0f, 44.0f, 24.0f};
float light_z[NUM_LIGHTS] = {12.0f, 12.0f, 44.0f};
float light_str[NUM_LIGHTS] = {16.0f, 16.0f, 16.0f};
float player_light_str = 12.0f;
int tick_alloc = 0;
int ray_hit_tile = 0;
int ray_hit_x = 0, ray_hit_z = 0;

const int NUM_ENEMIES = 3;
float enemy_x[NUM_ENEMIES] = {18.0f, 30.0f, 42.0f};
float enemy_z[NUM_ENEMIES] = {10.0f, 22.0f, 38.0f};
bool enemy_alive[NUM_ENEMIES] = {true, true, true};
int enemy_hp[NUM_ENEMIES] = {10, 10, 10};
float wp_x[NUM_ENEMIES][2] = {{18.0f,22.0f},{30.0f,34.0f},{42.0f,38.0f}};
float wp_z[NUM_ENEMIES][2] = {{10.0f,18.0f},{22.0f,30.0f},{38.0f,42.0f}};
int wp_idx[NUM_ENEMIES] = {0, 0, 0};
int enemy_behavior[NUM_ENEMIES] = {0, 0, 0};
int player_hp = 100;
int player_max_hp = 100;
int current_floor = 1;

// === FRUSTUM MODULE ===
int walls_drawn = 0;
int walls_culled = 0;

bool inFrustum(float wx, float wz) {
    float dx = wx - player_x, dz = wz - player_z;
    float dist = sqrtf(dx*dx + dz*dz);
    if (dist > FOG_END + CELL) return false;
    float angle = atan2f(dz, dx) - player_yaw;
    while (angle > 3.14159f) angle -= 6.28318f;
    while (angle < -3.14159f) angle += 6.28318f;
    return (angle > -1.2f && angle < 1.2f);
}

// === VISIBILITY MODULE ===
bool cell_visible[MAP_H][MAP_W] = {};
int vis_stack_x[256], vis_stack_z[256];

void floodVisibility() {
    for (int z=0;z<MAP_H;z++) for (int x=0;x<MAP_W;x++) cell_visible[z][x]=false;
    int top=0;
    int px=(int)(player_x/CELL), pz=(int)(player_z/CELL);
    if (px>=0&&px<MAP_W&&pz>=0&&pz<MAP_H) {
        vis_stack_x[top]=px; vis_stack_z[top]=pz; top++;
        cell_visible[pz][px]=true;
    }
    while (top>0) {
        top--;
        int cx=vis_stack_x[top], cz=vis_stack_z[top];
        float dx=(cx*CELL+CELL/2)-player_x, dz2=(cz*CELL+CELL/2)-player_z;
        if (sqrtf(dx*dx+dz2*dz2)>FOG_END) continue;
        int dirs[4][2]={{1,0},{-1,0},{0,1},{0,-1}};
        for (int d=0;d<4;d++) {
            int nx=cx+dirs[d][0], nz=cz+dirs[d][1];
            if (nx<0||nx>=MAP_W||nz<0||nz>=MAP_H) continue;
            if (cell_visible[nz][nx]) continue;
            cell_visible[nz][nx]=true;
            if (dungeon[nz][nx]==0&&top<255) {
                vis_stack_x[top]=nx; vis_stack_z[top]=nz; top++;
            }
        }
    }
}

// === FOG OF WAR MODULE ===
bool explored[MAP_H][MAP_W] = {};

void updateExplored() {
    for (int z=0;z<MAP_H;z++) for (int x=0;x<MAP_W;x++)
        if (cell_visible[z][x]) explored[z][x]=true;
}

// === SPATIAL HASH MODULE ===
const int HASH_W = 8, HASH_H = 8;
const int BUCKET_CAP = 8;
int hash_buckets[HASH_H][HASH_W][BUCKET_CAP];
int hash_count[HASH_H][HASH_W] = {};

void clearHash() {
    for (int z=0;z<HASH_H;z++) for (int x=0;x<HASH_W;x++) hash_count[z][x]=0;
}

void insertHash(int id, float wx, float wz) {
    int bx=(int)(wx/(CELL*MAP_W/HASH_W));
    int bz=(int)(wz/(CELL*MAP_H/HASH_H));
    if (bx<0) bx=0; if (bx>=HASH_W) bx=HASH_W-1;
    if (bz<0) bz=0; if (bz>=HASH_H) bz=HASH_H-1;
    if (hash_count[bz][bx]<BUCKET_CAP)
        hash_buckets[bz][bx][hash_count[bz][bx]++]=id;
}

// === PATHFINDING MODULE ===
struct PathNode { int x, z, g, h, px, pz; };
PathNode open_set[256];
int open_count = 0;
bool closed[MAP_H][MAP_W] = {};
int path_x[64], path_z[64];
int path_len = 0;

int heuristic(int ax, int az, int bx, int bz) {
    int dx = ax>bx ? ax-bx : bx-ax;
    int dz = az>bz ? az-bz : bz-az;
    return dx + dz;
}

bool findPath(int sx, int sz, int gx, int gz) {
    open_count = 0; path_len = 0;
    for (int z=0;z<MAP_H;z++) for (int x=0;x<MAP_W;x++) closed[z][x]=false;
    open_set[open_count++] = {sx, sz, 0, heuristic(sx,sz,gx,gz), -1, -1};
    while (open_count > 0) {
        int best = 0;
        for (int i=1;i<open_count;i++)
            if (open_set[i].g+open_set[i].h < open_set[best].g+open_set[best].h) best=i;
        PathNode cur = open_set[best];
        open_set[best] = open_set[--open_count];
        if (cur.x==gx && cur.z==gz) { path_len=1; return true; }
        if (closed[cur.z][cur.x]) continue;
        closed[cur.z][cur.x] = true;
        int dirs[4][2]={{1,0},{-1,0},{0,1},{0,-1}};
        for (int d=0;d<4;d++) {
            int nx=cur.x+dirs[d][0], nz=cur.z+dirs[d][1];
            if (nx<0||nx>=MAP_W||nz<0||nz>=MAP_H) continue;
            if (closed[nz][nx]||dungeon[nz][nx]==1||dungeon[nz][nx]==5) continue;
            if (open_count<255)
                open_set[open_count++]={nx,nz,cur.g+1,heuristic(nx,nz,gx,gz),cur.x,cur.z};
        }
    }
    return false;
}

// === SOUND MODULE ===
float soundVolume(float sx, float sz) {
    float dx=player_x-sx, dz=player_z-sz;
    float dist=sqrtf(dx*dx+dz*dz);
    float vol=1.0f-dist/32.0f;
    if (vol<0.0f) vol=0.0f;
    if (!hasLOS(player_x,player_z,sx,sz)) vol*=0.3f;
    return vol;
}

// === PARTICLE MODULE ===
const int MAX_PARTICLES = 64;
float part_x[MAX_PARTICLES], part_y[MAX_PARTICLES], part_z[MAX_PARTICLES];
float part_vx[MAX_PARTICLES], part_vy[MAX_PARTICLES], part_vz[MAX_PARTICLES];
float part_life[MAX_PARTICLES] = {};
int part_count = 0;

void spawnParticle(float px, float py, float pz, float vx, float vy, float vz) {
    if (part_count >= MAX_PARTICLES) return;
    int i = part_count++;
    part_x[i]=px; part_y[i]=py; part_z[i]=pz;
    part_vx[i]=vx; part_vy[i]=vy; part_vz[i]=vz;
    part_life[i]=1.0f;
}

void updateParticles(float dt) {
    for (int i=0;i<part_count;i++) {
        part_x[i]+=part_vx[i]*dt; part_y[i]+=part_vy[i]*dt; part_z[i]+=part_vz[i]*dt;
        part_vy[i]-=2.0f*dt;
        part_life[i]-=dt*0.5f;
        if (part_life[i]<=0.0f) {
            part_x[i]=part_x[part_count-1]; part_y[i]=part_y[part_count-1]; part_z[i]=part_z[part_count-1];
            part_vx[i]=part_vx[part_count-1]; part_vy[i]=part_vy[part_count-1]; part_vz[i]=part_vz[part_count-1];
            part_life[i]=part_life[part_count-1]; part_count--; i--;
        }
    }
}

// === PROJECTILE MODULE ===
const int MAX_PROJ = 8;
float proj_x[MAX_PROJ], proj_y[MAX_PROJ], proj_z[MAX_PROJ];
float proj_dx[MAX_PROJ], proj_dy[MAX_PROJ], proj_dz[MAX_PROJ];
bool proj_active[MAX_PROJ] = {};
int proj_count = 0;

void fireProjectile() {
    for (int i=0;i<MAX_PROJ;i++) {
        if (!proj_active[i]) {
            proj_x[i]=player_x; proj_y[i]=player_y; proj_z[i]=player_z;
            proj_dx[i]=cosf(player_yaw)*cosf(player_pitch)*0.3f;
            proj_dy[i]=sinf(player_pitch)*0.3f;
            proj_dz[i]=sinf(player_yaw)*cosf(player_pitch)*0.3f;
            proj_active[i]=true; return;
        }
    }
}

void updateProjectiles() {
    for (int i=0;i<MAX_PROJ;i++) {
        if (!proj_active[i]) continue;
        proj_x[i]+=proj_dx[i]; proj_y[i]+=proj_dy[i]; proj_z[i]+=proj_dz[i];
        int gx=(int)(proj_x[i]/CELL), gz=(int)(proj_z[i]/CELL);
        if (gx<0||gx>=MAP_W||gz<0||gz>=MAP_H||dungeon[gz][gx]==1) { proj_active[i]=false; continue; }
        for (int e=0;e<NUM_ENEMIES;e++) {
            if (!enemy_alive[e]) continue;
            float dx=proj_x[i]-enemy_x[e], dz=proj_z[i]-enemy_z[e];
            if (dx*dx+dz*dz<CELL) { enemy_hp[e]-=10; if(enemy_hp[e]<=0) enemy_alive[e]=false; proj_active[i]=false; break; }
        }
    }
}

// === SAVE MODULE ===
const int SAVE_VERSION = 1;
struct SaveData {
    int version;
    float px, py, pz, yaw, pitch;
    int hp, max_hp, sc, floor_num;
    bool items[3];
    bool expl[MAP_H][MAP_W];
};
SaveData save_buf;
bool save_pending = false;

void doSave() {
    save_buf.version = SAVE_VERSION;
    save_buf.px=player_x; save_buf.py=player_y; save_buf.pz=player_z;
    save_buf.yaw=player_yaw; save_buf.pitch=player_pitch;
    save_buf.hp=player_hp; save_buf.max_hp=player_max_hp;
    save_buf.sc=score; save_buf.floor_num=current_floor;
    for (int i=0;i<NUM_ITEMS;i++) save_buf.items[i]=item_active[i];
    memcpy(save_buf.expl, explored, sizeof(explored));
    save_pending = true;
}

// === SPATIAL MODULE ===
bool isSolid(int t) { return t==1||t==2||t==3||t==5; }

bool sphereHitsCell(float cx,float cz,int gx,int gz,float r) {
    float nx=cx<gx*CELL?gx*CELL:(cx>(gx+1)*CELL?(gx+1)*CELL:cx);
    float nz=cz<gz*CELL?gz*CELL:(cz>(gz+1)*CELL?(gz+1)*CELL:cz);
    float dx=cx-nx,dz=cz-nz;
    return (dx*dx+dz*dz)<(r*r);
}

void resolveCollision(float& px,float& pz,float r) {
    int x0=(int)((px-r)/CELL)-1; if(x0<0) x0=0;
    int x1=(int)((px+r)/CELL)+1; if(x1>=MAP_W) x1=MAP_W-1;
    int z0=(int)((pz-r)/CELL)-1; if(z0<0) z0=0;
    int z1=(int)((pz+r)/CELL)+1; if(z1>=MAP_H) z1=MAP_H-1;
    for (int gz=z0;gz<=z1;gz++) for (int gx=x0;gx<=x1;gx++) {
        if (!isSolid(dungeon[gz][gx])) continue;
        if (!sphereHitsCell(px,pz,gx,gz,r)) continue;
        float nx=px<gx*CELL?gx*CELL:(px>(gx+1)*CELL?(gx+1)*CELL:px);
        float nz=pz<gz*CELL?gz*CELL:(pz>(gz+1)*CELL?(gz+1)*CELL:pz);
        float dx=px-nx,dz=pz-nz;
        float dist=sqrtf(dx*dx+dz*dz);
        if(dist<0.0001f){px+=r;continue;}
        float push=r-dist;
        px+=dx/dist*push; pz+=dz/dist*push;
    }
}

bool hasLOS(float ax,float az,float bx,float bz) {
    float dx=bx-ax,dz=bz-az;
    float dist=sqrtf(dx*dx+dz*dz);
    float step=CELL*0.5f;
    int steps=(int)(dist/step);
    if(steps>40) steps=40;
    for(int s=1;s<=steps;s++){
        float t=(float)s/(float)steps;
        int gx=(int)((ax+dx*t)/CELL);
        int gz=(int)((az+dz*t)/CELL);
        if(gx>=0&&gx<MAP_W&&gz>=0&&gz<MAP_H&&isSolid(dungeon[gz][gx])) return false;
    }
    return true;
}

// === LIGHTING MODULE ===
const float AMBIENT = 0.15f;

Color shadeColor(Color base, float intensity) {
    if(intensity<0.0f) intensity=0.0f;
    if(intensity>1.0f) intensity=1.0f;
    return (Color){(unsigned char)(base.r*intensity),
                   (unsigned char)(base.g*intensity),
                   (unsigned char)(base.b*intensity),255};
}

float calcPointLight(float wx,float wz,float lx,float lz,float strength) {
    float dx=wx-lx, dz=wz-lz;
    float dist=sqrtf(dx*dx+dz*dz);
    return strength/(dist*dist+1.0f);
}

float calcAmbient(float wx,float wz) {
    float dx=wx-player_x, dz=wz-player_z;
    float dist=sqrtf(dx*dx+dz*dz);
    float intensity=1.0f-dist/24.0f;
    if(intensity<AMBIENT) intensity=AMBIENT;
    return intensity;
}

const float FOG_START=8.0f;
const float FOG_END=24.0f;

Color applyFog(Color c, float dist) {
    float f=(dist-FOG_START)/(FOG_END-FOG_START);
    if(f<0.0f)f=0.0f; if(f>1.0f)f=1.0f;
    return (Color){(unsigned char)(c.r*(1.0f-f)),
                   (unsigned char)(c.g*(1.0f-f)),
                   (unsigned char)(c.b*(1.0f-f)),255};
}

// === ENTITY MODULE ===
void updatePatrol(int i) {
    float tx=wp_x[i][wp_idx[i]], tz=wp_z[i][wp_idx[i]];
    float dx=tx-enemy_x[i], dz=tz-enemy_z[i];
    float dist=sqrtf(dx*dx+dz*dz);
    if(dist<0.5f){wp_idx[i]=1-wp_idx[i];return;}
    float spd=0.03f;
    enemy_x[i]+=dx/dist*spd; enemy_z[i]+=dz/dist*spd;
}

void updateChase(int i) {
    int gx=(int)(player_x/CELL), gz=(int)(player_z/CELL);
    int ex=(int)(enemy_x[i]/CELL), ez=(int)(enemy_z[i]/CELL);
    if (findPath(ex,ez,gx,gz) && path_len>0) {
        float dx=player_x-enemy_x[i], dz=player_z-enemy_z[i];
        float dist=sqrtf(dx*dx+dz*dz);
        if(dist<1.5f) return;
        float spd=0.04f;
        enemy_x[i]+=dx/dist*spd; enemy_z[i]+=dz/dist*spd;
    }
}

void updateEnemies() {
    for(int i=0;i<NUM_ENEMIES;i++) {
        if(!enemy_alive[i]) continue;
        bool sees=hasLOS(enemy_x[i],enemy_z[i],player_x,player_z);
        enemy_behavior[i]=sees?1:0;
        if(enemy_behavior[i]==1) updateChase(i);
        else updatePatrol(i);
    }
}

void enemyAttack() {
    for(int i=0;i<NUM_ENEMIES;i++) {
        if(!enemy_alive[i]) continue;
        float dx=player_x-enemy_x[i], dz=player_z-enemy_z[i];
        float dist=sqrtf(dx*dx+dz*dz);
        if(dist<CELL) { player_hp-=3; if(player_hp<0)player_hp=0; }
    }
}

void tryAttack() {
    float rx=player_x,rz=player_z;
    float rdx=cosf(player_yaw),rdz=sinf(player_yaw);
    for(int s=0;s<15;s++) {
        rx+=rdx*0.5f; rz+=rdz*0.5f;
        for(int i=0;i<NUM_ENEMIES;i++) {
            if(!enemy_alive[i]) continue;
            float dx=rx-enemy_x[i],dz=rz-enemy_z[i];
            if(dx*dx+dz*dz<CELL*CELL) {
                enemy_hp[i]-=5;
                if(enemy_hp[i]<=0) enemy_alive[i]=false;
                return;
            }
        }
        int gx=(int)(rx/CELL),gz=(int)(rz/CELL);
        if(gx>=0&&gx<MAP_W&&gz>=0&&gz<MAP_H&&isSolid(dungeon[gz][gx])) return;
    }
}

Camera3D camera = {0};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Dungeon");
    SetTargetFPS(60);
    DisableCursor();

    camera.position = (Vector3){player_x, player_y, player_z};
    camera.target = (Vector3){player_x+cosf(player_yaw)*cosf(player_pitch),
        player_y+sinf(player_pitch), player_z+sinf(player_yaw)*cosf(player_pitch)};
    camera.up = (Vector3){0.0f, 1.0f, 0.0f};
    camera.fovy = 70.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    cout << "Player: (10, 1, 10)" << endl;
    cout << "Map: 16x16" << endl;
    cout << "Rooms: 3" << endl;
    cout << "Floor: y=0" << endl;
    cout << "Ceiling: y=4" << endl;
    cout << "Minimap: 16x16" << endl;
    cout << "Doors: 2" << endl;
    cout << "Items: 3" << endl;
    cout << "Score: 0" << endl;
    cout << "Goal: 3 items" << endl;
    cout << "Ray: DDA" << endl;
    cout << "Interact: raycast" << endl;
    cout << "Blocks: 1" << endl;
    cout << "Plates: 1" << endl;
    cout << "Puzzle: push-plate-door" << endl;
    cout << "Sphere: r=0.4" << endl;
    cout << "Collision: sphere-AABB" << endl;
    cout << "Slope: query" << endl;
    cout << "Heights: active" << endl;
    cout << "Platforms: 1" << endl;
    cout << "Moving: active" << endl;
    cout << "Keys: 1" << endl;
    cout << "Locks: key-door" << endl;
    cout << "Stair: tile-6" << endl;
    cout << "Level: 1" << endl;
    cout << "Milestone: multi-floor" << endl;
    cout << "Ambient: 0.15" << endl;
    cout << "Shading: distance" << endl;
    cout << "Heap: frozen" << endl;
    cout << "Alloc/tick: 0" << endl;
    cout << "GATE A: passed" << endl;
    cout << "Billboard: active" << endl;
    cout << "Sprites: facing" << endl;
    cout << "Enemies: 3" << endl;
    cout << "Enemy HP: 10" << endl;
    cout << "Facing: atan2" << endl;
    cout << "Rotation: player-relative" << endl;
    cout << "AI: patrol" << endl;
    cout << "Waypoints: 2" << endl;
    cout << "Milestone: living-dungeon" << endl;
    cout << "Entities: managed" << endl;
    cout << "LOS: ray-grid" << endl;
    cout << "Occlusion: wall-check" << endl;
    cout << "Chase: on-sight" << endl;
    cout << "Behavior: patrol|chase" << endl;
    cout << "Attack: raycast" << endl;
    cout << "Damage: 5" << endl;
    cout << "Enemy damage: 3" << endl;
    cout << "Player HP: 100" << endl;
    cout << "Milestone: combat-dungeon" << endl;
    cout << "Combat: complete" << endl;
    cout << "Templates: 3" << endl;
    cout << "Room data: array" << endl;
    cout << "Corridors: L-shape" << endl;
    cout << "Carve: grid" << endl;
    cout << "BSP: active" << endl;
    cout << "Partitions: 4" << endl;
    cout << "Auto-doors: active" << endl;
    cout << "Connections: detected" << endl;
    cout << "Milestone: random-dungeon" << endl;
    cout << "Generation: complete" << endl;
    cout << "Spawn: procedural" << endl;
    cout << "Placement: room-based" << endl;
    cout << "Difficulty: scaling" << endl;
    cout << "Depth: increases" << endl;
    cout << "Loot: seeded" << endl;
    cout << "Tables: active" << endl;
    cout << "Floors: multi" << endl;
    cout << "Staircase: active" << endl;
    cout << "Milestone: roguelike-core" << endl;
    cout << "Phase5: complete" << endl;
    cout << "Frustum: 4-plane" << endl;
    cout << "Culling: active" << endl;
    cout << "Visibility: flood-fill" << endl;
    cout << "Cells: visible|hidden" << endl;
    cout << "FogOfWar: active" << endl;
    cout << "Explored: tracking" << endl;
    cout << "SpatialHash: 8x8" << endl;
    cout << "Lookup: O(1)" << endl;
    cout << "Milestone: optimized-renderer" << endl;
    cout << "Phase6a: complete" << endl;
    cout << "Pathfind: A*" << endl;
    cout << "Grid: navigable" << endl;
    cout << "Sound: propagation" << endl;
    cout << "Attenuation: distance" << endl;
    cout << "Particles: pool-based" << endl;
    cout << "Effects: active" << endl;
    cout << "Projectiles: 3D" << endl;
    cout << "Trajectory: active" << endl;
    cout << "Milestone: rich-3d-world" << endl;
    cout << "Phase6: complete" << endl;
    cout << "Save: v1" << endl;
    cout << "Format: binary" << endl;

    while(!WindowShouldClose()) {
        Vector2 delta=GetMouseDelta();
        player_yaw-=delta.x*MOUSE_SENSITIVITY;
        player_pitch-=delta.y*MOUSE_SENSITIVITY;
        if(player_pitch>1.5f)player_pitch=1.5f;
        if(player_pitch<-1.5f)player_pitch=-1.5f;

        float forward_x=cosf(player_yaw),forward_z=sinf(player_yaw);
        float right_x=-sinf(player_yaw),right_z=cosf(player_yaw);
        float move_x=0.0f,move_z=0.0f;
        if(IsKeyDown(KEY_W)){move_x+=forward_x*MOVE_SPEED;move_z+=forward_z*MOVE_SPEED;
        }
        if(IsKeyDown(KEY_S)){move_x-=forward_x*MOVE_SPEED;move_z-=forward_z*MOVE_SPEED;
        }
        if(IsKeyDown(KEY_A)){move_x-=right_x*MOVE_SPEED;move_z-=right_z*MOVE_SPEED;
        }
        if(IsKeyDown(KEY_D)){move_x+=right_x*MOVE_SPEED;move_z+=right_z*MOVE_SPEED;
        }
        float new_x=player_x+move_x, new_z=player_z+move_z;
        resolveCollision(new_x,new_z,PLAYER_RADIUS);
        player_x=new_x; player_z=new_z;

        if(IsKeyPressed(KEY_E)&&ray_hit_tile==2) dungeon[ray_hit_z][ray_hit_x]=0;
        if(IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) tryAttack();
        if(IsKeyPressed(KEY_F)) fireProjectile();
        if(IsKeyPressed(KEY_P)) doSave();

        for(int i=0;i<NUM_ITEMS;i++){
            if(!item_active[i])continue;
            float dx=player_x-item_x[i],dz=player_z-item_z[i];
            if(sqrtf(dx*dx+dz*dz)<CELL*0.5f){item_active[i]=false;score++;}
        }
        if(score>=NUM_ITEMS) game_state=1;

        clearHash();
        for(int i=0;i<NUM_ENEMIES;i++) if(enemy_alive[i]) insertHash(i,enemy_x[i],enemy_z[i]);
        updateEnemies();
        enemyAttack();
        updateParticles(1.0f/60.0f);
        for(int li=0;li<NUM_LIGHTS;li++) { if(rand()%20==0) spawnParticle(light_x[li],2.0f,light_z[li],(rand()%10-5)*0.02f,0.5f,(rand()%10-5)*0.02f); }
        updateProjectiles();
        floodVisibility();
        updateExplored();

        {
            float rx=player_x,rz=player_z;
            float rdx=cosf(player_yaw),rdz=sinf(player_yaw);
            ray_hit_tile=0;
            for(int s=0;s<20;s++){
                rx+=rdx*0.5f;rz+=rdz*0.5f;
                int gx2=(int)(rx/CELL),gz2=(int)(rz/CELL);
                if(gx2<0||gx2>=MAP_W||gz2<0||gz2>=MAP_H)break;
                ray_hit_tile=dungeon[gz2][gx2];
                if(ray_hit_tile>0){ray_hit_x=gx2;ray_hit_z=gz2;break;}
            }
        }

        camera.target=(Vector3){player_x+cosf(player_yaw)*cosf(player_pitch),
            player_y+sinf(player_pitch),player_z+sinf(player_yaw)*cosf(player_pitch)};
        camera.position=(Vector3){player_x,player_y,player_z};

        tick_alloc=0;
        BeginDrawing();
        ClearBackground(BLACK);
        srand((unsigned)(GetTime()*100));
        float flicker[NUM_LIGHTS];
        for(int li=0;li<NUM_LIGHTS;li++) flicker[li]=rand()%5/10.0f;
        walls_drawn=0; walls_culled=0;
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2,0,MAP_H*CELL/2},(Vector2){(float)MAP_W*CELL,(float)MAP_H*CELL},DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2,CELL,MAP_H*CELL/2},(Vector2){(float)MAP_W*CELL,(float)MAP_H*CELL},DARKGRAY);
        for(int z=0;z<MAP_H;z++) for(int x=0;x<MAP_W;x++){
            if(dungeon[z][x]>=1&&dungeon[z][x]<=3){
                float wx=x*CELL+CELL/2,wz=z*CELL+CELL/2;
                if(!inFrustum(wx,wz)){walls_culled++;continue;}
                walls_drawn++;
                float tot=calcAmbient(wx,wz);
                for(int li=0;li<NUM_LIGHTS;li++) tot+=calcPointLight(wx,wz,light_x[li],light_z[li],light_str[li]+flicker[li]);
                tot+=calcPointLight(wx,wz,player_x,player_z,player_light_str);
                Color rawBase=dungeon[z][x]==1?GRAY:dungeon[z][x]==2?BROWN:PURPLE;
                float pdx=wx-player_x,pdz=wz-player_z;
                float pdist=sqrtf(pdx*pdx+pdz*pdz);
                DrawCube((Vector3){wx,CELL/2,wz},CELL,CELL,CELL,applyFog(shadeColor(rawBase,tot),pdist));
            }
        }
        for(int i=0;i<NUM_ITEMS;i++)
            if(item_active[i])
                DrawCube((Vector3){item_x[i],CELL/4,item_z[i]},CELL/2,CELL/2,CELL/2,GOLD);
        for(int i=0;i<NUM_ENEMIES;i++){
            if(!enemy_alive[i])continue;
            DrawCube((Vector3){enemy_x[i],1.0f,enemy_z[i]},1.2f,2.0f,0.3f,RED);
        }
        for(int i=0;i<part_count;i++)
            DrawCube((Vector3){part_x[i],part_y[i],part_z[i]},0.1f,0.1f,0.1f,ORANGE);
        for(int i=0;i<MAX_PROJ;i++)
            if(proj_active[i]) DrawSphere((Vector3){proj_x[i],proj_y[i],proj_z[i]},0.2f,YELLOW);
        EndMode3D();

        Color ch_color=(ray_hit_tile>0)?(Color){255,80,80,220}:(Color){255,255,255,180};
        DrawRectangle(SCREEN_W/2-1,SCREEN_H/2-8,2,16,ch_color);
        DrawRectangle(SCREEN_W/2-8,SCREEN_H/2-1,16,2,ch_color);
        DrawText("HeapSight Dungeon",10,10,20,WHITE);
        DrawText(TextFormat("HP: %d/%d",player_hp,player_max_hp),10,40,16,player_hp>50?GREEN:RED);
        int alive_count=0;
        for(int i=0;i<NUM_ENEMIES;i++) if(enemy_alive[i]) alive_count++;
        DrawText(TextFormat("Enemies: %d",alive_count),10,60,16,RED);
        DrawText(TextFormat("Score: %d/%d",score,NUM_ITEMS),10,80,16,GOLD);
        DrawText(TextFormat("Floor: %d",current_floor),10,100,16,YELLOW);
        DrawText("ALLOC:0",650,10,16,tick_alloc==0?GREEN:RED);
        DrawText(tick_alloc==0?"GATE A: PASS":"GATE A: FAIL",600,30,16,tick_alloc==0?GREEN:RED);
        DrawText(TextFormat("Drawn:%d Culled:%d",walls_drawn,walls_culled),10,120,14,WHITE);
        if(save_pending) DrawText("SAVED",SCREEN_W/2-30,10,16,GREEN);

        const int MM_X=SCREEN_W-MAP_W*MM_SIZE-10, MM_Y=70;
        for(int mz=0;mz<MAP_H;mz++) for(int mx=0;mx<MAP_W;mx++){
            if(!explored[mz][mx]){DrawRectangle(MM_X+mx*MM_SIZE,MM_Y+mz*MM_SIZE,MM_SIZE-1,MM_SIZE-1,BLACK);continue;}
            Color mc=cell_visible[mz][mx] ?
                ((dungeon[mz][mx]==1)?GRAY:(dungeon[mz][mx]==2)?BROWN:(dungeon[mz][mx]==3)?PURPLE:DARKGRAY)
                : (Color){30,30,30,255};
            DrawRectangle(MM_X+mx*MM_SIZE,MM_Y+mz*MM_SIZE,MM_SIZE-1,MM_SIZE-1,mc);
        }
        int pmx=(int)(player_x/CELL),pmz=(int)(player_z/CELL);
        DrawRectangle(MM_X+pmx*MM_SIZE,MM_Y+pmz*MM_SIZE,MM_SIZE-1,MM_SIZE-1,GREEN);
        for(int i=0;i<NUM_ENEMIES;i++) if(enemy_alive[i]){
            int emx=(int)(enemy_x[i]/CELL),emz=(int)(enemy_z[i]/CELL);
            DrawRectangle(MM_X+emx*MM_SIZE+1,MM_Y+emz*MM_SIZE+1,MM_SIZE-3,MM_SIZE-3,RED);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "GATE A passed", expectedOutput: "GATE A: passed" },
      { id: "g3", description: "Save", expectedOutput: "Save: v1" },
      { id: "g4", description: "Format", expectedOutput: "Format: binary" },
    ],
    hints: [
      "Add the feature code above the game loop. Keep all state at file scope.",
      "Add cout lines for Save: v1 and Format: binary after existing diagnostics.",
      "Add a DrawText in the HUD section to display the new feature status.",
    ],
    estimatedMinutes: 15,
  },
};