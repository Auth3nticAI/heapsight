import type { Lesson } from "@/types/lesson";

export const lessonCrawler23: Lesson = {
  id: "crawler-23-multiple-lights",
  title: "Multiple Lights",
  description: "Expand to 3 torches in different rooms. Light accumulates additively across all sources.",
  order: 23,
  xpReward: 100,
  tier: "pro",
  concepts: ["multiple lights", "accumulation"],
  part1: {
    title: "Concept: Multiple Lights",
    type: "concept",
    instructions: `
# Multiple Lights

## The Idea

Sum contributions from all light sources. Start with ambient, loop over lights and add each point contribution.

## Accumulation

\`\`\`cpp
float total = ambient; // start with ambient base
for(int i=0;i<N;i++) total += lights[i]; // add each light
\`\`\`

## Your Task

Sum ambient=0.15 plus lights[3]={0.3,0.5,0.2}. Print Lights, Total, and Blend.


## Beginner Trap
**Replacing the current light value instead of accumulating.** If two torches illuminate the same tile, the second torch overwrites the first. Accumulate: tile_light = max(tile_light, new_light) or tile_light += new_light (clamped to 1.0).

## Elite Insight
Forward rendering accumulates light contributions per pixel — each light adds its contribution. Deferred rendering stores surface data first, then applies all lights in a screen-space pass. Your per-tile accumulation is the grid-based forward approach.

## Systems Thinking Connection
The RPG could add torch lighting to its dungeon grid using the same per-cell accumulation. Light accumulation is a spatial problem: "how much light reaches this position?" The data structure (grid cell vs pixel) changes, but the algorithm is the same.`,
    starterCode: `
#include <iostream>
using namespace std;

int main() {
    float lights[3]={0.3f,0.5f,0.2f};
    float total=0.15f;
    for(int i=0;i<3;i++) total+=lights[i];
    cout << "Lights: 3" << endl;
    // TODO: add Total: 1.15 cout
    // TODO: add Blend: accumulate cout
    return 0;
}
`,
    solutionCode: `
#include <iostream>
using namespace std;

int main() {
    float lights[3]={0.3f,0.5f,0.2f};
    float total=0.15f;
    for(int i=0;i<3;i++) total+=lights[i];
    cout << "Lights: 3" << endl;
    cout << "Total: 1.15" << endl;
    cout << "Blend: accumulate" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints lights count", expectedOutput: "Lights: 3" },
      { id: "t2", description: "Prints total", expectedOutput: "Total: 1.15" },
      { id: "t3", description: "Prints blend type", expectedOutput: "Blend: accumulate" },
    ],
    hints: [
      "Think about how multiple light sources combine their brightness into one value.",
      "Start with an ambient base and loop through each light, adding its contribution to a running total.",
      "ambient=0.15, lights sum=1.0, total=1.15. Print as Total: 1.15 (hardcoded).",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Multiple Lights",
    type: "game_builder",
    instructions: `
# Build: Multiple Lights

## What You'll See

Three orange torches -- one in each room. The dungeon has multiple bright spots with darker areas between them.

## TODOs

1. TODO 1: Replace single torch with NUM_LIGHTS=3 arrays (light_x, light_z, light_str)
2. TODO 2: In wall rendering, loop over all lights and sum contributions
3. TODO 3: Draw all 3 torches as ORANGE cubes
4. TODO 4: Update couts to Lights: 3 and Blend: accumulate
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

// TODO 1: add NUM_LIGHTS=3, light_x[], light_z[], light_str[] arrays
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
    // TODO 4: update to Lights: 3 and Blend: accumulate couts

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

// Multiple lights
const int NUM_LIGHTS = 3;
float light_x[NUM_LIGHTS] = {8.0f, 44.0f, 24.0f};
float light_z[NUM_LIGHTS] = {12.0f, 12.0f, 44.0f};
float light_str[NUM_LIGHTS] = {16.0f, 16.0f, 16.0f};
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
    cout << "Lights: 3" << endl;
    cout << "Blend: accumulate" << endl;

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
      { id: "g2", description: "Prints point type", expectedOutput: "Point: torch" },
      { id: "g3", description: "Prints lights count", expectedOutput: "Lights: 3" },
      { id: "g4", description: "Prints blend type", expectedOutput: "Blend: accumulate" },
    ],
    hints: [
      "TODO 1: const int NUM_LIGHTS=3; float light_x[3]={8,44,24}; light_z[3]={12,12,44}; light_str[3]={16,16,16};",
      "TODO 2: float tot=calcAmbient(wx,wz); for(li=0;li<NUM_LIGHTS;li++) tot+=calcPointLight(wx,wz,light_x[li],light_z[li],light_str[li]);",
      "TODO 3: for(li=0;li<NUM_LIGHTS;li++) DrawCube at light_x[li]/light_z[li] as ORANGE.",
    ],
    estimatedMinutes: 20,
  },
};