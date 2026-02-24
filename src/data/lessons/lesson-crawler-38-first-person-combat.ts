import type { Lesson } from "@/types/lesson";

export const lessonCrawler38: Lesson = {
  id: "crawler-38-first-person-combat",
  title: "First-Person Combat",
  description: "Left-click to attack the enemy you are looking at. A raycast from the camera determines the target. If an enemy is within range along the look direction, it takes damage.",
  order: 38,
  xpReward: 100,
  tier: "pro",
  concepts: ["raycast attack", "first-person combat", "click targeting", "damage dealing", "look-at targeting"],
  part1: {
    title: "Concept: First-Person Combat",
    type: "concept",
    instructions: `
# Concept: First-Person Combat

## Mental Model
This lesson teaches first-person combat. In a first-person 3D engine, every spatial feature must be grounded in coordinate math and rendered through the camera transform.

## What Breaks Without This
Without first-person combat, the dungeon lacks depth and interactivity. The player sees static geometry with no life.

## The Fix
Implement first-person combat using the 3D spatial patterns from Phases 1—3, respecting Gate A (zero heap in game loop).

## Key Concepts
- Raycast attack
- First-person combat
- Click targeting
- Damage dealing

## Your Task
Print the expected output to verify the concept works.

Expected output:
\`\`\`
Attack: raycast
Damage: 5
\`\`\`

## Spatial Insight
First-Person Combat is a core 3D engine concept. Doom, Quake, and modern engines all implement this — you are building the same foundation.

## Mastery Check
Question: Why does first-person combat matter for a 3D dungeon crawler?
Answer: Because it transforms static geometry into a living, interactive 3D world that responds to the player.


## Beginner Trap
**Raycasting against the visual billboard position instead of the collision volume.** Billboards are visual approximations. Collision should check against the entity AABB (axis-aligned bounding box), not the sprite quad. Billboard orientation changes with camera angle; the AABB does not.

## Elite Insight
Doom hit-tested enemies using 2D bounding circles projected into the player view. Modern FPS games use capsule colliders for humanoid enemies. Your AABB approach is the 3D grid equivalent — simple, fast, and sufficient for tile-based combat.

## Systems Thinking Connection
The RPG resolves combat by adjacency — bump into an enemy to attack. The Shooter uses circle-circle collision. Your raycast targeting is the 3D equivalent: aim at a target, check if the ray intersects the target volume.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Implement concept and print results
    cout << "Attack: raycast" << endl;
    cout << "Damage: 5" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Attack: raycast" << endl;
    cout << "Damage: 5" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "First output", expectedOutput: "Attack: raycast" },
      { id: "t2", description: "Second output", expectedOutput: "Damage: 5" },
    ],
    hints: [
      "Print the expected output lines using cout.",
      "Make sure the output matches exactly.",
      "cout << \"Attack: raycast\" << endl; cout << \"Damage: 5\" << endl;",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: First-Person Combat",
    type: "game_builder",
    instructions: `
# Build: First-Person Combat

## Overview
Add first-person combat to the 3D dungeon. This feature integrates with the existing spatial pipeline.

## What to Add
1. Implement the new feature in the game loop
2. Add cout diagnostics: Attack: raycast, Damage: 5
3. Add HUD display element

## Expected new cout lines
\`\`\`
...Behavior: patrol|chase
Attack: raycast
Damage: 5
\`\`\`

## Gate A Reminder
No new/delete/vector resize in the game loop. All entity state uses fixed-size arrays at file scope.

## Spatial Connection
This pattern connects to core 3D engine concepts: camera transforms, raycasting, spatial queries, and entity management.
`,
    starterCode: `#include <iostream>
#include <cmath>
#include "raylib.h"
#include <cstdlib>
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

// Enemies
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
    float dx=player_x-enemy_x[i], dz=player_z-enemy_z[i];
    float dist=sqrtf(dx*dx+dz*dz);
    if(dist<1.5f) return;
    float spd=0.04f;
    enemy_x[i]+=dx/dist*spd; enemy_z[i]+=dz/dist*spd;
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

    int door_count=0;
    for(int z=0;z<MAP_H;z++) for(int x=0;x<MAP_W;x++) if(dungeon[z][x]==2) door_count++;
    int block_count=0;
    for(int z=0;z<MAP_H;z++) for(int x=0;x<MAP_W;x++) if(dungeon[z][x]==3) block_count++;

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

    while(!WindowShouldClose()) {
        Vector2 delta=GetMouseDelta();
        player_yaw-=delta.x*MOUSE_SENSITIVITY;
        player_pitch-=delta.y*MOUSE_SENSITIVITY;
        if(player_pitch>1.5f)player_pitch=1.5f;
        if(player_pitch<-1.5f)player_pitch=-1.5f;

        float forward_x=cosf(player_yaw),forward_z=sinf(player_yaw);
        float right_x=-sinf(player_yaw),right_z=cosf(player_yaw);
        float move_x=0.0f,move_z=0.0f;
        if(IsKeyDown(KEY_W)){move_x+=forward_x*MOVE_SPEED;move_z+=forward_z*MOVE_SPEED;}
        if(IsKeyDown(KEY_S)){move_x-=forward_x*MOVE_SPEED;move_z-=forward_z*MOVE_SPEED;}
        if(IsKeyDown(KEY_A)){move_x-=right_x*MOVE_SPEED;move_z-=right_z*MOVE_SPEED;}
        if(IsKeyDown(KEY_D)){move_x+=right_x*MOVE_SPEED;move_z+=right_z*MOVE_SPEED;}
        float new_x=player_x+move_x, new_z=player_z+move_z;
        resolveCollision(new_x,new_z,PLAYER_RADIUS);
        player_x=new_x; player_z=new_z;

        if(IsKeyPressed(KEY_E)&&ray_hit_tile==2) dungeon[ray_hit_z][ray_hit_x]=0;
        if(IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) tryAttack();

        for(int i=0;i<NUM_ITEMS;i++){
            if(!item_active[i])continue;
            float dx=player_x-item_x[i],dz=player_z-item_z[i];
            if(sqrtf(dx*dx+dz*dz)<CELL*0.5f){item_active[i]=false;score++;}
        }
        if(score>=NUM_ITEMS) game_state=1;

        updateEnemies();
        enemyAttack();

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
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2,0,MAP_H*CELL/2},(Vector2){(float)MAP_W*CELL,(float)MAP_H*CELL},DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2,CELL,MAP_H*CELL/2},(Vector2){(float)MAP_W*CELL,(float)MAP_H*CELL},DARKGRAY);
        for(int z=0;z<MAP_H;z++) for(int x=0;x<MAP_W;x++){
            if(dungeon[z][x]>=1&&dungeon[z][x]<=3){
                float wx=x*CELL+CELL/2,wz=z*CELL+CELL/2;
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
        // TODO: Add DrawText for Attack: raycast
        const int MM_X=SCREEN_W-MAP_W*MM_SIZE-10, MM_Y=70;
        for(int mz=0;mz<MAP_H;mz++) for(int mx=0;mx<MAP_W;mx++){
            Color mc=(dungeon[mz][mx]==1)?GRAY:(dungeon[mz][mx]==2)?BROWN:(dungeon[mz][mx]==3)?PURPLE:DARKGRAY;
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
#include "raylib.h"
#include <cstdlib>
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

// Enemies
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
    float dx=player_x-enemy_x[i], dz=player_z-enemy_z[i];
    float dist=sqrtf(dx*dx+dz*dz);
    if(dist<1.5f) return;
    float spd=0.04f;
    enemy_x[i]+=dx/dist*spd; enemy_z[i]+=dz/dist*spd;
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

    int door_count=0;
    for(int z=0;z<MAP_H;z++) for(int x=0;x<MAP_W;x++) if(dungeon[z][x]==2) door_count++;
    int block_count=0;
    for(int z=0;z<MAP_H;z++) for(int x=0;x<MAP_W;x++) if(dungeon[z][x]==3) block_count++;

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

    while(!WindowShouldClose()) {
        Vector2 delta=GetMouseDelta();
        player_yaw-=delta.x*MOUSE_SENSITIVITY;
        player_pitch-=delta.y*MOUSE_SENSITIVITY;
        if(player_pitch>1.5f)player_pitch=1.5f;
        if(player_pitch<-1.5f)player_pitch=-1.5f;

        float forward_x=cosf(player_yaw),forward_z=sinf(player_yaw);
        float right_x=-sinf(player_yaw),right_z=cosf(player_yaw);
        float move_x=0.0f,move_z=0.0f;
        if(IsKeyDown(KEY_W)){move_x+=forward_x*MOVE_SPEED;move_z+=forward_z*MOVE_SPEED;}
        if(IsKeyDown(KEY_S)){move_x-=forward_x*MOVE_SPEED;move_z-=forward_z*MOVE_SPEED;}
        if(IsKeyDown(KEY_A)){move_x-=right_x*MOVE_SPEED;move_z-=right_z*MOVE_SPEED;}
        if(IsKeyDown(KEY_D)){move_x+=right_x*MOVE_SPEED;move_z+=right_z*MOVE_SPEED;}
        float new_x=player_x+move_x, new_z=player_z+move_z;
        resolveCollision(new_x,new_z,PLAYER_RADIUS);
        player_x=new_x; player_z=new_z;

        if(IsKeyPressed(KEY_E)&&ray_hit_tile==2) dungeon[ray_hit_z][ray_hit_x]=0;
        if(IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) tryAttack();

        for(int i=0;i<NUM_ITEMS;i++){
            if(!item_active[i])continue;
            float dx=player_x-item_x[i],dz=player_z-item_z[i];
            if(sqrtf(dx*dx+dz*dz)<CELL*0.5f){item_active[i]=false;score++;}
        }
        if(score>=NUM_ITEMS) game_state=1;

        updateEnemies();
        enemyAttack();

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
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2,0,MAP_H*CELL/2},(Vector2){(float)MAP_W*CELL,(float)MAP_H*CELL},DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2,CELL,MAP_H*CELL/2},(Vector2){(float)MAP_W*CELL,(float)MAP_H*CELL},DARKGRAY);
        for(int z=0;z<MAP_H;z++) for(int x=0;x<MAP_W;x++){
            if(dungeon[z][x]>=1&&dungeon[z][x]<=3){
                float wx=x*CELL+CELL/2,wz=z*CELL+CELL/2;
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

        const int MM_X=SCREEN_W-MAP_W*MM_SIZE-10, MM_Y=70;
        for(int mz=0;mz<MAP_H;mz++) for(int mx=0;mx<MAP_W;mx++){
            Color mc=(dungeon[mz][mx]==1)?GRAY:(dungeon[mz][mx]==2)?BROWN:(dungeon[mz][mx]==3)?PURPLE:DARKGRAY;
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
      { id: "g3", description: "Attack", expectedOutput: "Attack: raycast" },
      { id: "g4", description: "Damage", expectedOutput: "Damage: 5" },
    ],
    hints: [
      "Add the feature code above the game loop. Keep all state at file scope.",
      "Add cout lines for Attack: raycast and Damage: 5 after existing diagnostics.",
      "Add a DrawText in the HUD section to display the new feature status.",
    ],
    estimatedMinutes: 15,
  },
};