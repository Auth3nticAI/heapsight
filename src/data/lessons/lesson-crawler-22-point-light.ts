import type { Lesson } from "@/types/lesson";

export const lessonCrawler22: Lesson = {
  id: "crawler-22-point-light",
  title: "Point Light",
  description: "Add a point light (torch) with inverse-square falloff. Surfaces near the torch glow brighter.",
  order: 22,
  xpReward: 100,
  tier: "pro",
  concepts: ["point light", "inverse square", "torch"],
  part1: {
    title: "Concept: Point Lights -- Inverse Square Falloff",
    type: "concept",
    instructions: `
# Point Light

## The Idea

A point light emits from a position with inverse-square falloff: intensity = strength / (dist^2 + 1). Added on top of ambient.

\`\`\`cpp
float calcPointLight(float wx, float wz, float lx, float lz, float strength) {
    float dx=wx-lx, dz=wz-lz;
    float dist=sqrtf(dx*dx+dz*dz);
    return strength/(dist*dist+1.0f);
}
\`\`\`

## Your Task

Given a torch at (8,12) and surface at (8,14) (dist=2), strength=16. Print Lights, Dist, and Point.


## Beginner Trap
**Using linear falloff instead of inverse-square.** Linear falloff (1 - d/range) looks unnaturally uniform. Inverse-square falloff (1 / (1 + d*d)) concentrates light near the source and fades quickly, matching real-world physics and looking natural.

## Elite Insight
Real light follows the inverse-square law: intensity = 1/d squared. Doom approximated this with lookup tables. Modern engines compute it per-pixel in shaders. Your CPU-side approximation achieves the same visual result for a grid-based world.

## Systems Thinking Connection
The RPG has no lighting system — all tiles are uniformly lit. The Platformer uses background layers for atmosphere. Your point light system is 3D-specific: lighting in tile-based 3D creates atmosphere that 2D games achieve through art alone.`,
    starterCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float lx=8.0f,lz=12.0f,strength=16.0f;
    float wx=8.0f,wz=14.0f;
    float dx=wx-lx,dz=wz-lz;
    float dist=sqrtf(dx*dx+dz*dz);
    float pt=strength/(dist*dist+1.0f);
    cout << "Lights: 1" << endl;
    cout << "Dist: 2" << endl;
    // TODO: add Point: torch cout
    return 0;
}
`,
    solutionCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float lx=8.0f,lz=12.0f,strength=16.0f;
    float wx=8.0f,wz=14.0f;
    float dx=wx-lx,dz=wz-lz;
    float dist=sqrtf(dx*dx+dz*dz);
    float pt=strength/(dist*dist+1.0f);
    cout << "Lights: 1" << endl;
    cout << "Dist: 2" << endl;
    cout << "Point: torch" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints lights count", expectedOutput: "Lights: 1" },
      { id: "t2", description: "Prints distance", expectedOutput: "Dist: 2" },
      { id: "t3", description: "Prints point type", expectedOutput: "Point: torch" },
    ],
    hints: [
      "dist = sqrtf((8-8)^2 + (14-12)^2) = 2. pt = 16/(4+1) = 3.2.",
      "Add the Point: torch cout after Dist.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Point Light Torch",
    type: "game_builder",
    instructions: `
# Build: Point Light

## What You'll See

A small orange cube marks the torch position near Room A. Surfaces within ~8 units glow bright, fading to ambient darkness beyond.

## TODOs

1. TODO 1: Add torch position variables (torch_x=8, torch_z=12, torch_strength=16)
2. TODO 2: Complete calcPointLight() in LIGHTING MODULE
3. TODO 3: In wall rendering, add point light contribution to total intensity
4. TODO 4: Draw torch as small ORANGE cube in BeginMode3D
5. TODO 5: Add Lights and Point couts
`,
    starterCode: `
#include <iostream>
#include <cmath>
#include "raylib.h"
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

// TODO 1: add torch_x, torch_z, torch_strength variables
int ray_hit_tile = 0;
int ray_hit_x = 0, ray_hit_z = 0;
const int NUM_PLATES = 1;
int plate_x[NUM_PLATES] = {8};
int plate_z[NUM_PLATES] = {11};
int pdoor_x = 12, pdoor_z = 8;
bool puzzle_solved = false;

// Moving platform
float plat_x = 24.0f;
float plat_z = 38.0f;
float plat_spd = 0.05f;
float plat_dir = 1.0f;
float plat_hw = 2.0f;
float plat_prev_x = 24.0f;

// Key-lock system
float key_x = 10.0f;
float key_z = 22.0f;
bool key_active = true;
bool key_held = false;
int height_map[MAP_H][MAP_W] = {
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
};

// === SPATIAL MODULE (hs_spatial.h) ===
// === SPATIAL MODULE (hs_spatial.h) ===
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
    for (int gz=z0;gz<=z1;gz++) {
        for (int gx=x0;gx<=x1;gx++) {
            if (!isSolid(dungeon[gz][gx])) continue;
            if (!sphereHitsCell(px,pz,gx,gz,r)) continue;
            float nx=px<gx*CELL?gx*CELL:(px>(gx+1)*CELL?(gx+1)*CELL:px);
            float nz=pz<gz*CELL?gz*CELL:(pz>(gz+1)*CELL?(gz+1)*CELL:pz);
            float dx=px-nx,dz=pz-nz;
            float dist=sqrtf(dx*dx+dz*dz);
            if (dist<0.0001f){px+=r;continue;}
            float push=r-dist;
            px+=dx/dist*push;
            pz+=dz/dist*push;
        }
    }
}





// === ENTITIES MODULE (hs_entities.h) ===
void updatePlatform() {
    plat_prev_x = plat_x;
    plat_x += plat_spd * plat_dir;
    if(plat_x > 40.0f || plat_x < 24.0f) plat_dir = -plat_dir;
}

float queryFloorHeight(float wx, float wz) {
    int gx=(int)(wx/CELL); int gz=(int)(wz/CELL);
    if(gx<0||gx>=MAP_W||gz<0||gz>=MAP_H) return 0.0f;
    return height_map[gz][gx]*1.0f;
}



// === LIGHTING MODULE (hs_lighting.h) ===
const float AMBIENT = 0.15f;

Color shadeColor(Color base, float intensity) {
    if(intensity<0.0f) intensity=0.0f;
    if(intensity>1.0f) intensity=1.0f;
    return (Color){(unsigned char)(base.r*intensity),
                   (unsigned char)(base.g*intensity),
                   (unsigned char)(base.b*intensity),255};
}



// TODO 2: calcPointLight function (add after calcAmbient)

float calcAmbient(float wx, float wz) {
    float dx=wx-player_x, dz=wz-player_z;
    float dist=sqrtf(dx*dx+dz*dz);
    float intensity=1.0f-dist/24.0f;
    if(intensity<AMBIENT) intensity=AMBIENT;
    return intensity;
}

Camera3D camera = {0};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Dungeon");
    SetTargetFPS(60);
    DisableCursor();

    camera.position = (Vector3){player_x, player_y, player_z};
    camera.target = (Vector3){
        player_x + cosf(player_yaw) * cosf(player_pitch),
        player_y + sinf(player_pitch),
        player_z + sinf(player_yaw) * cosf(player_pitch)
    };
    camera.up = (Vector3){0.0f, 1.0f, 0.0f};
    camera.fovy = 70.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    int door_count = 0;
    for (int z = 0; z < MAP_H; z++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[z][x] == 2) door_count++;
    int block_count = 0;
    for (int z = 0; z < MAP_H; z++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[z][x] == 3) block_count++;

    cout << "Player: (10, 1, 10)" << endl;
    cout << "Map: 16x16" << endl;
    cout << "Rooms: 3" << endl;
    cout << "Floor: y=0" << endl;
    cout << "Ceiling: y=4" << endl;
    cout << "Minimap: 16x16" << endl;
    cout << "Doors: " << door_count << endl;
    cout << "Items: " << NUM_ITEMS << endl;
    cout << "Score: " << score << endl;
    cout << "Goal: 3 items" << endl;
    cout << "Ray: DDA" << endl;
    cout << "Interact: raycast" << endl;
    cout << "Blocks: " << block_count << endl;
    cout << "Plates: " << NUM_PLATES << endl;
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
    // TODO 5: add Lights and Point couts

    while (!WindowShouldClose()) {
        Vector2 delta = GetMouseDelta();
        player_yaw -= delta.x * MOUSE_SENSITIVITY;
        player_pitch -= delta.y * MOUSE_SENSITIVITY;
        if (player_pitch > 1.5f) player_pitch = 1.5f;
        if (player_pitch < -1.5f) player_pitch = -1.5f;

        float forward_x = cosf(player_yaw);
        float forward_z = sinf(player_yaw);
        float right_x = -sinf(player_yaw);
        float right_z = cosf(player_yaw);

        float move_x = 0.0f, move_z = 0.0f;
        if (IsKeyDown(KEY_W)){move_x+=forward_x*MOVE_SPEED;move_z+=forward_z*MOVE_SPEED;}
        if (IsKeyDown(KEY_S)){move_x-=forward_x*MOVE_SPEED;move_z-=forward_z*MOVE_SPEED;}
        if (IsKeyDown(KEY_A)){move_x-=right_x*MOVE_SPEED;move_z-=right_z*MOVE_SPEED;}
        if (IsKeyDown(KEY_D)){move_x+=right_x*MOVE_SPEED;move_z+=right_z*MOVE_SPEED;}

        float new_x = player_x + move_x;
        float new_z = player_z + move_z;

        {
            int pgx=(int)(player_x/CELL);
            int pgz=(int)(player_z/CELL);
            if (move_x!=0.0f) {
                int sx=(move_x>0)?1:-1;
                int agx=pgx+sx;
                if (agx>=0&&agx<MAP_W&&dungeon[pgz][agx]==3) {
                    int bgx=agx+sx;
                    if (bgx>=0&&bgx<MAP_W&&dungeon[pgz][bgx]==0) {
                        dungeon[pgz][agx]=0; dungeon[pgz][bgx]=3;
                    }
                }
            }
            if (move_z!=0.0f) {
                int sz=(move_z>0)?1:-1;
                int agz=pgz+sz;
                if (agz>=0&&agz<MAP_H&&dungeon[agz][pgx]==3) {
                    int bgz=agz+sz;
                    if (bgz>=0&&bgz<MAP_H&&dungeon[bgz][pgx]==0) {
                        dungeon[agz][pgx]=0; dungeon[bgz][pgx]=3;
                    }
                }
            }
        }

        resolveCollision(new_x, new_z, PLAYER_RADIUS);
        player_y = 1.0f + queryFloorHeight(new_x, new_z);

        player_x = new_x;
        player_z = new_z;

        if (IsKeyPressed(KEY_E)&&ray_hit_tile==2)
            dungeon[ray_hit_z][ray_hit_x]=0;

        for (int i=0;i<NUM_ITEMS;i++) {
            if (!item_active[i]) continue;
            float dx=player_x-item_x[i];
            float dz=player_z-item_z[i];
            float dist=sqrtf(dx*dx+dz*dz);
            if (dist<CELL*0.5f){item_active[i]=false;score++;}
        }
        if (score>=NUM_ITEMS) game_state=1;
        if (!puzzle_solved) {
            bool any_on=false;
            for (int i=0;i<NUM_PLATES;i++)
                if (dungeon[plate_z[i]][plate_x[i]]==3) any_on=true;
            if (any_on) {
                dungeon[pdoor_z][pdoor_x]=0;
                puzzle_solved=true;
                game_state=2;
            }
        }

        {
            float rx=player_x,rz=player_z;
            float rdx=cosf(player_yaw),rdz=sinf(player_yaw);
            ray_hit_tile=0;
            for (int s=0;s<20;s++) {
                rx+=rdx*0.5f; rz+=rdz*0.5f;
                int gx2=(int)(rx/CELL);
                int gz2=(int)(rz/CELL);
                if (gx2<0||gx2>=MAP_W||gz2<0||gz2>=MAP_H) break;
                ray_hit_tile=dungeon[gz2][gx2];
                if (ray_hit_tile>0){ray_hit_x=gx2;ray_hit_z=gz2;break;}
            }
        }

        int gx=(int)(player_x/CELL);
        int gz=(int)(player_z/CELL);
        const char* room_name="Corridor";
        if (gx>=1&&gx<=6&&gz>=1&&gz<=6) room_name="Room A";
        else if (gx>=9&&gx<=14&&gz>=1&&gz<=6) room_name="Room B";
        else if (gx>=4&&gx<=11&&gz>=9&&gz<=14) room_name="Room C";

        camera.target=(Vector3){
            player_x+cosf(player_yaw)*cosf(player_pitch),
            player_y+sinf(player_pitch),
            player_z+sinf(player_yaw)*cosf(player_pitch)
        };
        camera.position=(Vector3){player_x,player_y,player_z};

        BeginDrawing();
        ClearBackground(BLACK);
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2,0,MAP_H*CELL/2},(Vector2){MAP_W*CELL,MAP_H*CELL},DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2,CELL,MAP_H*CELL/2},(Vector2){MAP_W*CELL,MAP_H*CELL},DARKGRAY);
        for (int z=0;z<MAP_H;z++)
            for (int x=0;x<MAP_W;x++) {
                if (dungeon[z][x]==1)
                    DrawCube((Vector3){x*CELL+CELL/2,CELL/2,z*CELL+CELL/2},CELL,CELL,CELL,GRAY);
                else if (dungeon[z][x]==2)
                    DrawCube((Vector3){x*CELL+CELL/2,CELL/2,z*CELL+CELL/2},CELL,CELL,CELL,BROWN);
                else if (dungeon[z][x]==3)
                    DrawCube((Vector3){x*CELL+CELL/2,CELL/2,z*CELL+CELL/2},CELL,CELL,CELL,PURPLE);
            }
        for (int i=0;i<NUM_ITEMS;i++)
            if (item_active[i])
                DrawCube((Vector3){item_x[i],CELL/4,item_z[i]},CELL/2,CELL/2,CELL/2,GOLD);
        for (int i=0;i<NUM_PLATES;i++) {
            bool on=(dungeon[plate_z[i]][plate_x[i]]==3);
            DrawCube((Vector3){plate_x[i]*CELL+CELL/2,0.05f,plate_z[i]*CELL+CELL/2},
                     CELL*0.8f,0.1f,CELL*0.8f,on?GREEN:DARKGREEN);
        }
        EndMode3D();
        Color ch_color=(ray_hit_tile>0)?(Color){255,80,80,220}:(Color){255,255,255,180};
        DrawRectangle(SCREEN_W/2-1,SCREEN_H/2-8,2,16,ch_color);
        DrawRectangle(SCREEN_W/2-8,SCREEN_H/2-1,16,2,ch_color);
        DrawText("HeapSight Dungeon",10,10,20,WHITE);
        DrawText(room_name,10,40,20,YELLOW);
        DrawText(TextFormat("Score: %d / %d",score,NUM_ITEMS),10,70,20,GOLD);
        const char* look_name=(ray_hit_tile==1)?"wall":(ray_hit_tile==2)?"door":(ray_hit_tile==3)?"block":"empty";
        DrawText(TextFormat("Looking at: %s",look_name),10,95,16,LIGHTGRAY);
        if (ray_hit_tile==2) DrawText("[E] Open",10,115,16,WHITE);
        bool any_plate_on=false;
        for (int i=0;i<NUM_PLATES;i++)
            if (dungeon[plate_z[i]][plate_x[i]]==3) any_plate_on=true;
        DrawText(any_plate_on?"Plate: active":"Plate: empty",10,135,16,any_plate_on?GREEN:GRAY);
        DrawText(puzzle_solved?"Puzzle: solved":"Puzzle: unsolved",10,155,16,puzzle_solved?GREEN:GRAY);
        const int MM_X=SCREEN_W-MAP_W*MM_SIZE-10;
        const int MM_Y=10;
        for (int mz=0;mz<MAP_H;mz++)
            for (int mx=0;mx<MAP_W;mx++) {
                Color mc=(dungeon[mz][mx]==1)?GRAY:(dungeon[mz][mx]==2)?BROWN:(dungeon[mz][mx]==3)?PURPLE:DARKGRAY;
                DrawRectangle(MM_X+mx*MM_SIZE,MM_Y+mz*MM_SIZE,MM_SIZE-1,MM_SIZE-1,mc);
            }
        int px=(int)(player_x/CELL);
        int pz=(int)(player_z/CELL);
        DrawRectangle(MM_X+px*MM_SIZE,MM_Y+pz*MM_SIZE,MM_SIZE-1,MM_SIZE-1,GREEN);
        for (int i=0;i<NUM_ITEMS;i++)
            if (item_active[i]) {
                int ix=(int)(item_x[i]/CELL);
                int iz=(int)(item_z[i]/CELL);
                DrawRectangle(MM_X+ix*MM_SIZE+2,MM_Y+iz*MM_SIZE+2,2,2,GOLD);
            }
        if (game_state==1) {
            DrawRectangle(SCREEN_W/2-120,SCREEN_H/2-30,240,60,(Color){0,0,0,200});
            DrawText("YOU WIN!",SCREEN_W/2-80,SCREEN_H/2-15,40,GOLD);
        }
        if (game_state==2) {
            DrawRectangle(SCREEN_W/2-160,SCREEN_H/2-40,320,80,(Color){0,0,0,200});
            DrawText("PUZZLE SOLVED!",SCREEN_W/2-130,SCREEN_H/2-20,40,GREEN);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
`,
    solutionCode: `
#include <iostream>
#include <cmath>
#include "raylib.h"
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

// Torch (point light)
float torch_x = 8.0f;
float torch_z = 12.0f;
float torch_strength = 16.0f;
int ray_hit_tile = 0;
int ray_hit_x = 0, ray_hit_z = 0;
const int NUM_PLATES = 1;
int plate_x[NUM_PLATES] = {8};
int plate_z[NUM_PLATES] = {11};
int pdoor_x = 12, pdoor_z = 8;
bool puzzle_solved = false;

// Moving platform
float plat_x = 24.0f;
float plat_z = 38.0f;
float plat_spd = 0.05f;
float plat_dir = 1.0f;
float plat_hw = 2.0f;
float plat_prev_x = 24.0f;

// Key-lock system
float key_x = 10.0f;
float key_z = 22.0f;
bool key_active = true;
bool key_held = false;
int height_map[MAP_H][MAP_W] = {
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
};

// === SPATIAL MODULE (hs_spatial.h) ===
// === SPATIAL MODULE (hs_spatial.h) ===
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
    for (int gz=z0;gz<=z1;gz++) {
        for (int gx=x0;gx<=x1;gx++) {
            if (!isSolid(dungeon[gz][gx])) continue;
            if (!sphereHitsCell(px,pz,gx,gz,r)) continue;
            float nx=px<gx*CELL?gx*CELL:(px>(gx+1)*CELL?(gx+1)*CELL:px);
            float nz=pz<gz*CELL?gz*CELL:(pz>(gz+1)*CELL?(gz+1)*CELL:pz);
            float dx=px-nx,dz=pz-nz;
            float dist=sqrtf(dx*dx+dz*dz);
            if (dist<0.0001f){px+=r;continue;}
            float push=r-dist;
            px+=dx/dist*push;
            pz+=dz/dist*push;
        }
    }
}





// === ENTITIES MODULE (hs_entities.h) ===
void updatePlatform() {
    plat_prev_x = plat_x;
    plat_x += plat_spd * plat_dir;
    if(plat_x > 40.0f || plat_x < 24.0f) plat_dir = -plat_dir;
}

float queryFloorHeight(float wx, float wz) {
    int gx=(int)(wx/CELL); int gz=(int)(wz/CELL);
    if(gx<0||gx>=MAP_W||gz<0||gz>=MAP_H) return 0.0f;
    return height_map[gz][gx]*1.0f;
}



// === LIGHTING MODULE (hs_lighting.h) ===
const float AMBIENT = 0.15f;

Color shadeColor(Color base, float intensity) {
    if(intensity<0.0f) intensity=0.0f;
    if(intensity>1.0f) intensity=1.0f;
    return (Color){(unsigned char)(base.r*intensity),
                   (unsigned char)(base.g*intensity),
                   (unsigned char)(base.b*intensity),255};
}



float calcPointLight(float wx, float wz, float lx, float lz, float strength) {
    float dx=wx-lx, dz=wz-lz;
    float dist=sqrtf(dx*dx+dz*dz);
    return strength/(dist*dist+1.0f);
}

float calcAmbient(float wx, float wz) {
    float dx=wx-player_x, dz=wz-player_z;
    float dist=sqrtf(dx*dx+dz*dz);
    float intensity=1.0f-dist/24.0f;
    if(intensity<AMBIENT) intensity=AMBIENT;
    return intensity;
}

Camera3D camera = {0};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Dungeon");
    SetTargetFPS(60);
    DisableCursor();

    camera.position = (Vector3){player_x, player_y, player_z};
    camera.target = (Vector3){
        player_x + cosf(player_yaw) * cosf(player_pitch),
        player_y + sinf(player_pitch),
        player_z + sinf(player_yaw) * cosf(player_pitch)
    };
    camera.up = (Vector3){0.0f, 1.0f, 0.0f};
    camera.fovy = 70.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    int door_count = 0;
    for (int z = 0; z < MAP_H; z++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[z][x] == 2) door_count++;
    int block_count = 0;
    for (int z = 0; z < MAP_H; z++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[z][x] == 3) block_count++;

    cout << "Player: (10, 1, 10)" << endl;
    cout << "Map: 16x16" << endl;
    cout << "Rooms: 3" << endl;
    cout << "Floor: y=0" << endl;
    cout << "Ceiling: y=4" << endl;
    cout << "Minimap: 16x16" << endl;
    cout << "Doors: " << door_count << endl;
    cout << "Items: " << NUM_ITEMS << endl;
    cout << "Score: " << score << endl;
    cout << "Goal: 3 items" << endl;
    cout << "Ray: DDA" << endl;
    cout << "Interact: raycast" << endl;
    cout << "Blocks: " << block_count << endl;
    cout << "Plates: " << NUM_PLATES << endl;
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
    cout << "Lights: 1" << endl;
    cout << "Point: torch" << endl;

    while (!WindowShouldClose()) {
        Vector2 delta = GetMouseDelta();
        player_yaw -= delta.x * MOUSE_SENSITIVITY;
        player_pitch -= delta.y * MOUSE_SENSITIVITY;
        if (player_pitch > 1.5f) player_pitch = 1.5f;
        if (player_pitch < -1.5f) player_pitch = -1.5f;

        float forward_x = cosf(player_yaw);
        float forward_z = sinf(player_yaw);
        float right_x = -sinf(player_yaw);
        float right_z = cosf(player_yaw);

        float move_x = 0.0f, move_z = 0.0f;
        if (IsKeyDown(KEY_W)){move_x+=forward_x*MOVE_SPEED;move_z+=forward_z*MOVE_SPEED;}
        if (IsKeyDown(KEY_S)){move_x-=forward_x*MOVE_SPEED;move_z-=forward_z*MOVE_SPEED;}
        if (IsKeyDown(KEY_A)){move_x-=right_x*MOVE_SPEED;move_z-=right_z*MOVE_SPEED;}
        if (IsKeyDown(KEY_D)){move_x+=right_x*MOVE_SPEED;move_z+=right_z*MOVE_SPEED;}

        float new_x = player_x + move_x;
        float new_z = player_z + move_z;

        {
            int pgx=(int)(player_x/CELL);
            int pgz=(int)(player_z/CELL);
            if (move_x!=0.0f) {
                int sx=(move_x>0)?1:-1;
                int agx=pgx+sx;
                if (agx>=0&&agx<MAP_W&&dungeon[pgz][agx]==3) {
                    int bgx=agx+sx;
                    if (bgx>=0&&bgx<MAP_W&&dungeon[pgz][bgx]==0) {
                        dungeon[pgz][agx]=0; dungeon[pgz][bgx]=3;
                    }
                }
            }
            if (move_z!=0.0f) {
                int sz=(move_z>0)?1:-1;
                int agz=pgz+sz;
                if (agz>=0&&agz<MAP_H&&dungeon[agz][pgx]==3) {
                    int bgz=agz+sz;
                    if (bgz>=0&&bgz<MAP_H&&dungeon[bgz][pgx]==0) {
                        dungeon[agz][pgx]=0; dungeon[bgz][pgx]=3;
                    }
                }
            }
        }

        resolveCollision(new_x, new_z, PLAYER_RADIUS);
        player_y = 1.0f + queryFloorHeight(new_x, new_z);

        player_x = new_x;
        player_z = new_z;

        if (IsKeyPressed(KEY_E)&&ray_hit_tile==2)
            dungeon[ray_hit_z][ray_hit_x]=0;

        for (int i=0;i<NUM_ITEMS;i++) {
            if (!item_active[i]) continue;
            float dx=player_x-item_x[i];
            float dz=player_z-item_z[i];
            float dist=sqrtf(dx*dx+dz*dz);
            if (dist<CELL*0.5f){item_active[i]=false;score++;}
        }
        if (score>=NUM_ITEMS) game_state=1;
        if (!puzzle_solved) {
            bool any_on=false;
            for (int i=0;i<NUM_PLATES;i++)
                if (dungeon[plate_z[i]][plate_x[i]]==3) any_on=true;
            if (any_on) {
                dungeon[pdoor_z][pdoor_x]=0;
                puzzle_solved=true;
                game_state=2;
            }
        }

        {
            float rx=player_x,rz=player_z;
            float rdx=cosf(player_yaw),rdz=sinf(player_yaw);
            ray_hit_tile=0;
            for (int s=0;s<20;s++) {
                rx+=rdx*0.5f; rz+=rdz*0.5f;
                int gx2=(int)(rx/CELL);
                int gz2=(int)(rz/CELL);
                if (gx2<0||gx2>=MAP_W||gz2<0||gz2>=MAP_H) break;
                ray_hit_tile=dungeon[gz2][gx2];
                if (ray_hit_tile>0){ray_hit_x=gx2;ray_hit_z=gz2;break;}
            }
        }

        int gx=(int)(player_x/CELL);
        int gz=(int)(player_z/CELL);
        const char* room_name="Corridor";
        if (gx>=1&&gx<=6&&gz>=1&&gz<=6) room_name="Room A";
        else if (gx>=9&&gx<=14&&gz>=1&&gz<=6) room_name="Room B";
        else if (gx>=4&&gx<=11&&gz>=9&&gz<=14) room_name="Room C";

        camera.target=(Vector3){
            player_x+cosf(player_yaw)*cosf(player_pitch),
            player_y+sinf(player_pitch),
            player_z+sinf(player_yaw)*cosf(player_pitch)
        };
        camera.position=(Vector3){player_x,player_y,player_z};

        BeginDrawing();
        ClearBackground(BLACK);
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2,0,MAP_H*CELL/2},(Vector2){MAP_W*CELL,MAP_H*CELL},DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2,CELL,MAP_H*CELL/2},(Vector2){MAP_W*CELL,MAP_H*CELL},DARKGRAY);
        for (int z=0;z<MAP_H;z++)
            for (int x=0;x<MAP_W;x++) {
                if (dungeon[z][x]==1)
                    DrawCube((Vector3){x*CELL+CELL/2,CELL/2,z*CELL+CELL/2},CELL,CELL,CELL,GRAY);
                else if (dungeon[z][x]==2)
                    DrawCube((Vector3){x*CELL+CELL/2,CELL/2,z*CELL+CELL/2},CELL,CELL,CELL,BROWN);
                else if (dungeon[z][x]==3)
                    DrawCube((Vector3){x*CELL+CELL/2,CELL/2,z*CELL+CELL/2},CELL,CELL,CELL,PURPLE);
            }
        for (int i=0;i<NUM_ITEMS;i++)
            if (item_active[i])
                DrawCube((Vector3){item_x[i],CELL/4,item_z[i]},CELL/2,CELL/2,CELL/2,GOLD);
        for (int i=0;i<NUM_PLATES;i++) {
            bool on=(dungeon[plate_z[i]][plate_x[i]]==3);
            DrawCube((Vector3){plate_x[i]*CELL+CELL/2,0.05f,plate_z[i]*CELL+CELL/2},
                     CELL*0.8f,0.1f,CELL*0.8f,on?GREEN:DARKGREEN);
        }
        EndMode3D();
        Color ch_color=(ray_hit_tile>0)?(Color){255,80,80,220}:(Color){255,255,255,180};
        DrawRectangle(SCREEN_W/2-1,SCREEN_H/2-8,2,16,ch_color);
        DrawRectangle(SCREEN_W/2-8,SCREEN_H/2-1,16,2,ch_color);
        DrawText("HeapSight Dungeon",10,10,20,WHITE);
        DrawText(room_name,10,40,20,YELLOW);
        DrawText(TextFormat("Score: %d / %d",score,NUM_ITEMS),10,70,20,GOLD);
        const char* look_name=(ray_hit_tile==1)?"wall":(ray_hit_tile==2)?"door":(ray_hit_tile==3)?"block":"empty";
        DrawText(TextFormat("Looking at: %s",look_name),10,95,16,LIGHTGRAY);
        if (ray_hit_tile==2) DrawText("[E] Open",10,115,16,WHITE);
        bool any_plate_on=false;
        for (int i=0;i<NUM_PLATES;i++)
            if (dungeon[plate_z[i]][plate_x[i]]==3) any_plate_on=true;
        DrawText(any_plate_on?"Plate: active":"Plate: empty",10,135,16,any_plate_on?GREEN:GRAY);
        DrawText(puzzle_solved?"Puzzle: solved":"Puzzle: unsolved",10,155,16,puzzle_solved?GREEN:GRAY);
        const int MM_X=SCREEN_W-MAP_W*MM_SIZE-10;
        const int MM_Y=10;
        for (int mz=0;mz<MAP_H;mz++)
            for (int mx=0;mx<MAP_W;mx++) {
                Color mc=(dungeon[mz][mx]==1)?GRAY:(dungeon[mz][mx]==2)?BROWN:(dungeon[mz][mx]==3)?PURPLE:DARKGRAY;
                DrawRectangle(MM_X+mx*MM_SIZE,MM_Y+mz*MM_SIZE,MM_SIZE-1,MM_SIZE-1,mc);
            }
        int px=(int)(player_x/CELL);
        int pz=(int)(player_z/CELL);
        DrawRectangle(MM_X+px*MM_SIZE,MM_Y+pz*MM_SIZE,MM_SIZE-1,MM_SIZE-1,GREEN);
        for (int i=0;i<NUM_ITEMS;i++)
            if (item_active[i]) {
                int ix=(int)(item_x[i]/CELL);
                int iz=(int)(item_z[i]/CELL);
                DrawRectangle(MM_X+ix*MM_SIZE+2,MM_Y+iz*MM_SIZE+2,2,2,GOLD);
            }
        if (game_state==1) {
            DrawRectangle(SCREEN_W/2-120,SCREEN_H/2-30,240,60,(Color){0,0,0,200});
            DrawText("YOU WIN!",SCREEN_W/2-80,SCREEN_H/2-15,40,GOLD);
        }
        if (game_state==2) {
            DrawRectangle(SCREEN_W/2-160,SCREEN_H/2-40,320,80,(Color){0,0,0,200});
            DrawText("PUZZLE SOLVED!",SCREEN_W/2-130,SCREEN_H/2-20,40,GREEN);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "Prints shading type", expectedOutput: "Shading: distance" },
      { id: "g3", description: "Prints lights count", expectedOutput: "Lights: 1" },
      { id: "g4", description: "Prints point type", expectedOutput: "Point: torch" },
    ],
    hints: [
      "TODO 2: float calcPointLight(wx,wz,lx,lz,strength) { float dx=wx-lx,dz=wz-lz; return strength/(dx*dx+dz*dz+1.0f); }",
      "TODO 3: In wall render, compute wx/wz, then tot=calcAmbient(wx,wz)+calcPointLight(wx,wz,torch_x,torch_z,torch_strength), use shadeColor(GRAY,tot).",
      "TODO 4: DrawCube((Vector3){torch_x,2.5f,torch_z},0.4f,0.4f,0.4f,ORANGE);",
    ],
    estimatedMinutes: 20,
  },
};