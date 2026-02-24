import type { Lesson } from "@/types/lesson";

export const lessonCrawler28: Lesson = {
  id: "crawler-28-dynamic-light",
  title: "Dynamic Light Sources",
  description: "The player now carries a torch. Light follows your position, illuminating nearby walls dynamically.",
  order: 28,
  xpReward: 100,
  tier: "pro",
  concepts: ["dynamic light", "player light"],
  part1: {
    title: "Concept: Player Light",
    type: "concept",
    instructions: `
# Dynamic Light Sources

## The Idea

Add the player position as an extra light source each frame. The wall brightness now depends on proximity to the player.

## Player Light

\`\`\`cpp
float player_light_str = 12.0f;
// in wall render loop:
tot += calcPointLight(wx,wz,player_x,player_z,player_light_str);
\`\`\`

## Your Task

Print Light: player and Strength: 12.


## Beginner Trap
**Updating dynamic light position after rendering.** If the player moves and you update the light after drawing, the light lags one frame behind. Update dynamic light positions during the update pass, before the render pass.

## Elite Insight
Doom 3 revolutionized dynamic lighting by computing per-pixel shadows in real time. Your player light is simpler — a moving point light with no shadows — but follows the same principle: light position tracks entity position every frame.

## Systems Thinking Connection
The RPG has no dynamic lighting. The Shooter has no 3D lighting at all. Dynamic light is uniquely impactful in 3D — it reveals geometry, creates tension, and guides the player through space in ways that 2D games achieve through sprite art.`,
    starterCode: `
#include <iostream>
using namespace std;

int main() {
    float player_light_str = 12.0f;
    cout << "Light: player" << endl;
    // TODO: print Strength: 12
    return 0;
}
`,
    solutionCode: `
#include <iostream>
using namespace std;

int main() {
    float player_light_str = 12.0f;
    cout << "Light: player" << endl;
    cout << "Strength: 12" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints light source", expectedOutput: "Light: player" },
      { id: "t2", description: "Prints light strength", expectedOutput: "Strength: 12" },
    ],
    hints: [
      "Think about what changes when the light source moves with the player instead of staying fixed.",
      "The player position becomes an additional light source -- use the same calcPointLight function with player coordinates.",
      "Just add cout Strength: 12 (hardcoded from player_light_str=12.0f).",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Dynamic Light",
    type: "game_builder",
    instructions: `
# Build: Dynamic Light Sources

## What You'll See

The area around the player glows. Moving around dynamically changes which walls are lit.

## TODOs

1. TODO 1: Add float player_light_str=12.0f variable after other global vars
2. TODO 2: In wall rendering loop, add calcPointLight(wx,wz,player_x,player_z,player_light_str) to tot
3. TODO 3: Draw a tiny YELLOW cube at player_x,1.5f,player_z (size 0.2) for the torch
4. TODO 4: Update couts to Light: player and Strength: 12
`,
    starterCode: `
#include <iostream>
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

// Multiple lights
const int NUM_LIGHTS = 3;
float light_x[NUM_LIGHTS] = {8.0f, 44.0f, 24.0f};
float light_z[NUM_LIGHTS] = {12.0f, 12.0f, 44.0f};
float light_str[NUM_LIGHTS] = {16.0f, 16.0f, 16.0f};
// TODO 1: add float player_light_str = 12.0f;
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
const float FOG_START = 8.0f;
const float FOG_END   = 24.0f;

Color applyFog(Color c, float dist) {
    float f=(dist-FOG_START)/(FOG_END-FOG_START);
    if(f<0.0f)f=0.0f; if(f>1.0f)f=1.0f;
    return (Color){(unsigned char)(c.r*(1.0f-f)),
                   (unsigned char)(c.g*(1.0f-f)),
                   (unsigned char)(c.b*(1.0f-f)),255};
}
Color getZoneTint(float wx, float wz) {
    if(wz < 20*CELL) return (Color){255,200,200,255};
    if(wx > 30*CELL) return (Color){200,200,255,255};
    return (Color){200,255,200,255};
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
    // TODO 4: update couts to Light: player and Strength: 12

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
        // Flicker
        srand((unsigned)GetTime());
        float flicker[NUM_LIGHTS];
        for(int li=0;li<<NUM_LIGHTS;li++) flicker[li]=rand()%5/10.0f;
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2,0,MAP_H*CELL/2},(Vector2){MAP_W*CELL,MAP_H*CELL},DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2,CELL,MAP_H*CELL/2},(Vector2){MAP_W*CELL,MAP_H*CELL},DARKGRAY);
        for (int z=0;z<MAP_H;z++)
            for (int x=0;x<MAP_W;x++) {
                if (dungeon[z][x]>=1 && dungeon[z][x]<=3) {
                    float wx=x*CELL+CELL/2, wz=z*CELL+CELL/2;
                    float tot=calcAmbient(wx,wz);
                    for(int li=0;li<<NUM_LIGHTS;li++) tot+=calcPointLight(wx,wz,light_x[li],light_z[li],light_str[li]+flicker[li]);
                    Color rawBase=dungeon[z][x]==1?GRAY:dungeon[z][x]==2?BROWN:PURPLE;
                    Color zt=getZoneTint(wx,wz);
                    Color base={(unsigned char)(rawBase.r*zt.r/255),(unsigned char)(rawBase.g*zt.g/255),(unsigned char)(rawBase.b*zt.b/255),255};
                    float pdx=wx-player_x, pdz=wz-player_z;
                    float pdist=(float)sqrt(pdx*pdx+pdz*pdz);
                    DrawCube((Vector3){wx,CELL/2,wz},CELL,CELL,CELL,applyFog(shadeColor(base,tot),pdist));
                }
            }
        for (int i=0;i<NUM_ITEMS;i++)
            if (item_active[i])
                DrawCube((Vector3){item_x[i],CELL/4,item_z[i]},CELL/2,CELL/2,CELL/2,GOLD);
        for (int i=0;i<NUM_PLATES;i++) {
            bool on=(dungeon[plate_z[i]][plate_x[i]]==3);
            DrawCube((Vector3){plate_x[i]*CELL+CELL/2,0.05f,plate_z[i]*CELL+CELL/2},
                     CELL*0.8f,0.1f,CELL*0.8f,on?GREEN:DARKGREEN);
        }
        // TODO 3: DrawCube tiny YELLOW torch at player_x,1.5f,player_z size 0.2
        EndMode3D();
        Color ch_color=(ray_hit_tile>0)?(Color){255,80,80,220}:(Color){255,255,255,180};
        DrawRectangle(SCREEN_W/2-1,SCREEN_H/2-8,2,16,ch_color);
        DrawRectangle(SCREEN_W/2-8,SCREEN_H/2-1,16,2,ch_color);
        DrawText("HeapSight Dungeon",10,10,20,WHITE);
        DrawText(room_name,10,40,20,YELLOW);
        DrawText("ATMOSPHERE",650,10,20,GREEN);
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

// Multiple lights
const int NUM_LIGHTS = 3;
float light_x[NUM_LIGHTS] = {8.0f, 44.0f, 24.0f};
float light_z[NUM_LIGHTS] = {12.0f, 12.0f, 44.0f};
float light_str[NUM_LIGHTS] = {16.0f, 16.0f, 16.0f};
float player_light_str = 12.0f;
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
const float FOG_START = 8.0f;
const float FOG_END   = 24.0f;

Color applyFog(Color c, float dist) {
    float f=(dist-FOG_START)/(FOG_END-FOG_START);
    if(f<0.0f)f=0.0f; if(f>1.0f)f=1.0f;
    return (Color){(unsigned char)(c.r*(1.0f-f)),
                   (unsigned char)(c.g*(1.0f-f)),
                   (unsigned char)(c.b*(1.0f-f)),255};
}
Color getZoneTint(float wx, float wz) {
    if(wz < 20*CELL) return (Color){255,200,200,255};
    if(wx > 30*CELL) return (Color){200,200,255,255};
    return (Color){200,255,200,255};
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
    cout << "Light: player" << endl;
    cout << "Strength: 12" << endl;

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
        // Flicker
        srand((unsigned)GetTime());
        float flicker[NUM_LIGHTS];
        for(int li=0;li<<NUM_LIGHTS;li++) flicker[li]=rand()%5/10.0f;
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2,0,MAP_H*CELL/2},(Vector2){MAP_W*CELL,MAP_H*CELL},DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2,CELL,MAP_H*CELL/2},(Vector2){MAP_W*CELL,MAP_H*CELL},DARKGRAY);
        for (int z=0;z<MAP_H;z++)
            for (int x=0;x<MAP_W;x++) {
                if (dungeon[z][x]>=1 && dungeon[z][x]<=3) {
                    float wx=x*CELL+CELL/2, wz=z*CELL+CELL/2;
                    float tot=calcAmbient(wx,wz);
                    for(int li=0;li<<NUM_LIGHTS;li++) tot+=calcPointLight(wx,wz,light_x[li],light_z[li],light_str[li]+flicker[li]);
                    tot+=calcPointLight(wx,wz,player_x,player_z,player_light_str);
                    Color rawBase=dungeon[z][x]==1?GRAY:dungeon[z][x]==2?BROWN:PURPLE;
                    Color zt=getZoneTint(wx,wz);
                    Color base={(unsigned char)(rawBase.r*zt.r/255),(unsigned char)(rawBase.g*zt.g/255),(unsigned char)(rawBase.b*zt.b/255),255};
                    float pdx=wx-player_x, pdz=wz-player_z;
                    float pdist=(float)sqrt(pdx*pdx+pdz*pdz);
                    DrawCube((Vector3){wx,CELL/2,wz},CELL,CELL,CELL,applyFog(shadeColor(base,tot),pdist));
                }
            }
        for (int i=0;i<NUM_ITEMS;i++)
            if (item_active[i])
                DrawCube((Vector3){item_x[i],CELL/4,item_z[i]},CELL/2,CELL/2,CELL/2,GOLD);
        for (int i=0;i<NUM_PLATES;i++) {
            bool on=(dungeon[plate_z[i]][plate_x[i]]==3);
            DrawCube((Vector3){plate_x[i]*CELL+CELL/2,0.05f,plate_z[i]*CELL+CELL/2},
                     CELL*0.8f,0.1f,CELL*0.8f,on?GREEN:DARKGREEN);
        }
        DrawCube((Vector3){player_x,1.5f,player_z},0.2f,0.2f,0.2f,YELLOW);
        EndMode3D();
        Color ch_color=(ray_hit_tile>0)?(Color){255,80,80,220}:(Color){255,255,255,180};
        DrawRectangle(SCREEN_W/2-1,SCREEN_H/2-8,2,16,ch_color);
        DrawRectangle(SCREEN_W/2-8,SCREEN_H/2-1,16,2,ch_color);
        DrawText("HeapSight Dungeon",10,10,20,WHITE);
        DrawText(room_name,10,40,20,YELLOW);
        DrawText("ATMOSPHERE",650,10,20,GREEN);
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
      { id: "g1", description: "Prints light source", expectedOutput: "Light: player" },
      { id: "g2", description: "Prints light strength", expectedOutput: "Strength: 12" },
    ],
    hints: [
      "TODO 2: after the NUM_LIGHTS loop, add: tot+=calcPointLight(wx,wz,player_x,player_z,player_light_str);",
      "TODO 3: DrawCube((Vector3){player_x,1.5f,player_z},0.2f,0.2f,0.2f,YELLOW); before EndMode3D",
    ],
    estimatedMinutes: 20,
  },
};