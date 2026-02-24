import type { Lesson } from "@/types/lesson";

export const lessonCrawler16: Lesson = {
  id: "crawler-16-professional-split",
  title: "The Professional Split",
  description: "Split your growing codebase into header and source files \u2014 the same pattern every professional C++ project uses to manage complexity.",
  order: 16,
  xpReward: 100,
  tier: "pro",
  concepts: ["header files", "#pragma once", "forward declarations", "translation units", "multi-file projects"],
  part1: {
    title: "Concept: Headers vs Source Files",
    type: "concept",
    instructions: `# The Professional Split

## Mental Model
Your dungeon crawler is 200+ lines in one file. Professional C++ projects have hundreds of files. How do they avoid chaos? They split every concern into two files: a **header** (.h) that declares WHAT exists, and a **source** (.cpp) that defines HOW it works. Think of a header as a menu and the source as the kitchen.

## What Breaks Without This
As your program grows, compilation slows to a crawl. Change one function and the compiler rebuilds everything. Circular dependencies crash the build. Two files that both define the same struct cause \"multiple definition\" errors. Headers solve all of this.

## The Fix: Header/Source Split
**Header file (hs_spatial.h):**
\`\`\`cpp
#pragma once          // prevents double-include
#include \"raylib.h\"   // types we need (Vector3, etc.)

struct Dungeon {
    int map[16][16];
    float cell_size;
};

bool isSolid(int t);            // declaration only \u2014 no body
void resolveCollision(float& px, float& pz, float r);
\`\`\`

**Source file (hs_spatial.cpp):**
\`\`\`cpp
#include \"hs_spatial.h\"

bool isSolid(int t) {           // definition \u2014 the actual code
    return t == 1 || t == 2 || t == 3;
}
\`\`\`

**Main file (main.cpp):**
\`\`\`cpp
#include \"hs_spatial.h\"       // now main.cpp knows about isSolid
                             // but doesn\'t see the implementation
\`\`\`

## Key Concepts
- \`#pragma once\` \u2014 tells the compiler \"only include this file once per translation unit\"
- **Declaration** \u2014 tells the compiler a function EXISTS (signature only, no body)
- **Definition** \u2014 provides the actual implementation (the body with { })
- Each .cpp file is a separate **translation unit** \u2014 compiled independently, then linked

## Performance Insight
Headers don\'t add runtime cost. Zero. They\'re a compile-time organizing tool. The linker combines all .cpp files into one binary. Same performance as a single-file program, but 10x easier to maintain.

## Memory Insight
No extra memory. The split is purely organizational. One binary, same layout, same performance. The header tells the compiler what shapes to expect; the source fills them in.

## Your Task
Model the split conceptually. Declare a World struct with ship_x and score, then implement an initWorld function and print the split info.

Expected output:
\`\`\`
Files: 2
Guard: pragma once
Pattern: declaration/definition split
\`\`\`

## Beginner Trap
Don\'t put function DEFINITIONS in headers. If two .cpp files include a header with a function body, the linker sees two copies and throws a \"multiple definition\" error. Headers declare. Sources define.

## Elite Insight
Google\'s C++ style guide mandates: every .cc file has a matching .h file. The Linux kernel uses the same pattern (though with .c files). Unreal Engine has 40,000+ header files. This isn\'t optional at scale \u2014 it\'s survival.

## Systems Thinking Connection
Platformer Lesson 16 splits player logic the same way. RPG Lesson 16 splits the command queue. Same pattern, different domain. Learn it once, use it everywhere.

## Skill Reinforcement
Built on: L15 Milestone Puzzle Room \u2014 the code you\'ll now split into files.
Feeds into: L31+ module split \u2014 each system gets its own header/source pair.

## Mastery Check
*Question:* You put \`void resolveCollision(float& px, float& pz, float r) { ... }\` in a header. Two .cpp files include it. What error?
*Answer:* \"multiple definition of resolveCollision\" \u2014 the linker sees two identical function bodies. Move the body to a .cpp file, keep only the declaration in the header.`,
    starterCode: `#include <iostream>
using namespace std;

// Simulating a header/source split in a single file
// \"HEADER\" section \u2014 declarations
struct World {
    float ship_x;
    int score;
};

void initWorld(World& w);  // declaration only

// \"SOURCE\" section \u2014 definitions
// TODO 1: Define initWorld: void initWorld(World& w) { w.ship_x = 200; w.score = 0; }

int main() {
    World w;
    // TODO 2: Call initWorld(w);
    // TODO 3: cout << \"Files: 2\" << endl;
    // TODO 4: cout << \"Guard: pragma once\" << endl;
    // TODO 5: cout << \"Pattern: declaration/definition split\" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct World {
    float ship_x;
    int score;
};

void initWorld(World& w);

void initWorld(World& w) {
    w.ship_x = 200;
    w.score = 0;
}

int main() {
    World w;
    initWorld(w);
    cout << \"Files: 2\" << endl;
    cout << \"Guard: pragma once\" << endl;
    cout << \"Pattern: declaration/definition split\" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Reports file count", expectedOutput: "Files: 2" },
      { id: "t2", description: "Reports header guard type", expectedOutput: "Guard: pragma once" },
      { id: "t3", description: "Confirms split pattern", expectedOutput: "Pattern: declaration/definition split" },
    ],
    hints: [
      "initWorld needs a body: void initWorld(World& w) { w.ship_x = 200; w.score = 0; } \u2014 put it below the declaration.",
      "Call initWorld(w) in main before the cout lines. The function initializes the World struct.",
      "Three cout lines \u2014 Files: 2, Guard: pragma once, Pattern: declaration/definition split. Copy them exactly.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: The Professional Split",
    type: "game_builder",
    instructions: `# Build: The Professional Split

## Mental Model
Your dungeon crawler lives in one big file. Time to go professional. You\'ll split the spatial functions (collision, solid checks) into a proper header/source pair, just like every C++ project with more than 500 lines.

## What\'s Already Here
Three files are open in your editor tabs:

**hs_spatial.h** \u2014 The header. Contains \`#pragma once\`, all constants, the dungeon map declaration, and function declarations. This file is COMPLETE \u2014 don\'t change it.

**hs_spatial.cpp** \u2014 The source. Has \`#include \"hs_spatial.h\"\` at the top. Function STUBS are here with TODOs. Your job: fill in the bodies.

**main.cpp** \u2014 The game loop. Includes \`hs_spatial.h\` and uses the functions you\'ll implement. This file is COMPLETE \u2014 don\'t change it.

## Your Task
Work in **hs_spatial.cpp** only. Implement three functions:

**TODO 1** \u2014 \`isSolid\`: Return true if the tile value is 1, 2, or 3 (wall, door, or block).

**TODO 2** \u2014 \`sphereHitsCell\`: Find the nearest point (nx, nz) on the cell\'s AABB to the sphere center (cx, cz). Clamp cx to [gx*CELL, (gx+1)*CELL] and cz to [gz*CELL, (gz+1)*CELL]. Return true if (dx*dx + dz*dz) < (r*r).

**TODO 3** \u2014 \`resolveCollision\`: Loop over cells near the player (within radius). For each solid cell that the sphere hits, compute the nearest point, calculate push distance, and push the player out along the overlap direction.

## Did It Work?
Click Run. You should see the same 3D dungeon crawler as before \u2014 WASD movement, mouse look, sphere collision for smooth corner sliding. The HUD shows \"Split: hs_spatial\" in sky blue. The console prints all the startup confirmations.

The game is IDENTICAL. What changed is the architecture \u2014 the spatial module now lives in its own translation unit, ready for the module splits coming in Lessons 31+.`,
    starterCode: {
      "hs_spatial.h": `#pragma once
#include \"raylib.h\"
#include <cmath>

const int SCREEN_W = 800;
const int SCREEN_H = 600;
const int MAP_W = 16;
const int MAP_H = 16;
const float CELL = 4.0f;

extern int dungeon[MAP_H][MAP_W];

bool isSolid(int t);
bool sphereHitsCell(float cx, float cz, int gx, int gz, float r);
void resolveCollision(float& px, float& pz, float r);`,
      "hs_spatial.cpp": `#include \"hs_spatial.h\"

// TODO 1: Implement isSolid
// Return true if t is 1, 2, or 3 (wall, door, or block).
bool isSolid(int t) {
    // Your code here
    return false;
}

// TODO 2: Implement sphereHitsCell
// Find nearest point on cell AABB to sphere center.
// nx = clamp(cx, gx*CELL, (gx+1)*CELL)
// nz = clamp(cz, gz*CELL, (gz+1)*CELL)
// dx = cx-nx, dz = cz-nz
// Return (dx*dx + dz*dz) < (r*r)
bool sphereHitsCell(float cx, float cz, int gx, int gz, float r) {
    // Your code here
    return false;
}

// TODO 3: Implement resolveCollision
// Scan cells near the player (within radius).
// For each solid cell that the sphere hits:
//   compute nearest point (nx, nz), distance, push amount
//   push player out: px += dx/dist*push, pz += dz/dist*push
void resolveCollision(float& px, float& pz, float r) {
    // Your code here
}`,
      "main.cpp": `#include <iostream>
#include \"hs_spatial.h\"
using namespace std;

int dungeon[MAP_H][MAP_W] = {
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,1,1,1,2,1,1,1,1,1,1,1,0,1,1,1},
    {1,1,1,1,0,1,1,1,1,1,1,1,2,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,3,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
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
int ray_hit_tile = 0;
int ray_hit_x = 0, ray_hit_z = 0;
const int NUM_PLATES = 1;
int plate_x[NUM_PLATES] = {8};
int plate_z[NUM_PLATES] = {11};
int pdoor_x = 12, pdoor_z = 8;
bool puzzle_solved = false;

Camera3D camera = {0};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Dungeon\");
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

    cout << \"Player: (10, 1, 10)\" << endl;
    cout << \"Map: 16x16\" << endl;
    cout << \"Rooms: 3\" << endl;
    cout << \"Floor: y=0\" << endl;
    cout << \"Ceiling: y=4\" << endl;
    cout << \"Minimap: 16x16\" << endl;
    cout << \"Doors: \" << door_count << endl;
    cout << \"Items: \" << NUM_ITEMS << endl;
    cout << \"Score: \" << score << endl;
    cout << \"Goal: 3 items\" << endl;
    cout << \"Ray: DDA\" << endl;
    cout << \"Interact: raycast\" << endl;
    cout << \"Blocks: \" << block_count << endl;
    cout << \"Plates: \" << NUM_PLATES << endl;
    cout << \"Puzzle: push-plate-door\" << endl;
    cout << \"Sphere: r=0.4\" << endl;
    cout << \"Collision: sphere-AABB\" << endl;

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
        const char* room_name=\"Corridor\";
        if (gx>=1&&gx<=6&&gz>=1&&gz<=6) room_name=\"Room A\";
        else if (gx>=9&&gx<=14&&gz>=1&&gz<=6) room_name=\"Room B\";
        else if (gx>=4&&gx<=11&&gz>=9&&gz<=14) room_name=\"Room C\";

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
        DrawText(\"HeapSight Dungeon\",10,10,20,WHITE);
        DrawText(room_name,10,40,20,YELLOW);
        DrawText(TextFormat(\"Score: %d / %d\",score,NUM_ITEMS),10,70,20,GOLD);
        const char* look_name=(ray_hit_tile==1)?\"wall\":(ray_hit_tile==2)?\"door\":(ray_hit_tile==3)?\"block\":\"empty\";
        DrawText(TextFormat(\"Looking at: %s\",look_name),10,95,16,LIGHTGRAY);
        if (ray_hit_tile==2) DrawText(\"[E] Open\",10,115,16,WHITE);
        bool any_plate_on=false;
        for (int i=0;i<NUM_PLATES;i++)
            if (dungeon[plate_z[i]][plate_x[i]]==3) any_plate_on=true;
        DrawText(any_plate_on?\"Plate: active\":\"Plate: empty\",10,135,16,any_plate_on?GREEN:GRAY);
        DrawText(puzzle_solved?\"Puzzle: solved\":\"Puzzle: unsolved\",10,155,16,puzzle_solved?GREEN:GRAY);
        DrawText(\"Split: hs_spatial\",10,175,16,SKYBLUE);
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
            DrawText(\"YOU WIN!\",SCREEN_W/2-80,SCREEN_H/2-15,40,GOLD);
        }
        if (game_state==2) {
            DrawRectangle(SCREEN_W/2-160,SCREEN_H/2-40,320,80,(Color){0,0,0,200});
            DrawText(\"PUZZLE SOLVED!\",SCREEN_W/2-130,SCREEN_H/2-20,40,GREEN);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    },
    solutionCode: {
      "hs_spatial.h": `#pragma once
#include \"raylib.h\"
#include <cmath>

const int SCREEN_W = 800;
const int SCREEN_H = 600;
const int MAP_W = 16;
const int MAP_H = 16;
const float CELL = 4.0f;

extern int dungeon[MAP_H][MAP_W];

bool isSolid(int t);
bool sphereHitsCell(float cx, float cz, int gx, int gz, float r);
void resolveCollision(float& px, float& pz, float r);`,
      "hs_spatial.cpp": `#include \"hs_spatial.h\"

bool isSolid(int t) { return t==1||t==2||t==3; }

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
}`,
      "main.cpp": `#include <iostream>
#include \"hs_spatial.h\"
using namespace std;

int dungeon[MAP_H][MAP_W] = {
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1},
    {1,1,1,1,2,1,1,1,1,1,1,1,0,1,1,1},
    {1,1,1,1,0,1,1,1,1,1,1,1,2,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,3,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
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
int ray_hit_tile = 0;
int ray_hit_x = 0, ray_hit_z = 0;
const int NUM_PLATES = 1;
int plate_x[NUM_PLATES] = {8};
int plate_z[NUM_PLATES] = {11};
int pdoor_x = 12, pdoor_z = 8;
bool puzzle_solved = false;

Camera3D camera = {0};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Dungeon\");
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

    cout << \"Player: (10, 1, 10)\" << endl;
    cout << \"Map: 16x16\" << endl;
    cout << \"Rooms: 3\" << endl;
    cout << \"Floor: y=0\" << endl;
    cout << \"Ceiling: y=4\" << endl;
    cout << \"Minimap: 16x16\" << endl;
    cout << \"Doors: \" << door_count << endl;
    cout << \"Items: \" << NUM_ITEMS << endl;
    cout << \"Score: \" << score << endl;
    cout << \"Goal: 3 items\" << endl;
    cout << \"Ray: DDA\" << endl;
    cout << \"Interact: raycast\" << endl;
    cout << \"Blocks: \" << block_count << endl;
    cout << \"Plates: \" << NUM_PLATES << endl;
    cout << \"Puzzle: push-plate-door\" << endl;
    cout << \"Sphere: r=0.4\" << endl;
    cout << \"Collision: sphere-AABB\" << endl;

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
        const char* room_name=\"Corridor\";
        if (gx>=1&&gx<=6&&gz>=1&&gz<=6) room_name=\"Room A\";
        else if (gx>=9&&gx<=14&&gz>=1&&gz<=6) room_name=\"Room B\";
        else if (gx>=4&&gx<=11&&gz>=9&&gz<=14) room_name=\"Room C\";

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
        DrawText(\"HeapSight Dungeon\",10,10,20,WHITE);
        DrawText(room_name,10,40,20,YELLOW);
        DrawText(TextFormat(\"Score: %d / %d\",score,NUM_ITEMS),10,70,20,GOLD);
        const char* look_name=(ray_hit_tile==1)?\"wall\":(ray_hit_tile==2)?\"door\":(ray_hit_tile==3)?\"block\":\"empty\";
        DrawText(TextFormat(\"Looking at: %s\",look_name),10,95,16,LIGHTGRAY);
        if (ray_hit_tile==2) DrawText(\"[E] Open\",10,115,16,WHITE);
        bool any_plate_on=false;
        for (int i=0;i<NUM_PLATES;i++)
            if (dungeon[plate_z[i]][plate_x[i]]==3) any_plate_on=true;
        DrawText(any_plate_on?\"Plate: active\":\"Plate: empty\",10,135,16,any_plate_on?GREEN:GRAY);
        DrawText(puzzle_solved?\"Puzzle: solved\":\"Puzzle: unsolved\",10,155,16,puzzle_solved?GREEN:GRAY);
        DrawText(\"Split: hs_spatial\",10,175,16,SKYBLUE);
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
            DrawText(\"YOU WIN!\",SCREEN_W/2-80,SCREEN_H/2-15,40,GOLD);
        }
        if (game_state==2) {
            DrawRectangle(SCREEN_W/2-160,SCREEN_H/2-40,320,80,(Color){0,0,0,200});
            DrawText(\"PUZZLE SOLVED!\",SCREEN_W/2-130,SCREEN_H/2-20,40,GREEN);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    },
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "Prints puzzle type", expectedOutput: "Puzzle: push-plate-door" },
      { id: "g3", description: "Prints sphere radius", expectedOutput: "Sphere: r=0.4" },
      { id: "g4", description: "Prints collision type", expectedOutput: "Collision: sphere-AABB" },
    ],
    hints: [
      "isSolid: return t==1||t==2||t==3; -- walls, doors, and blocks are all solid.",
      "sphereHitsCell: clamp cx to [gx*CELL, (gx+1)*CELL] for nx, same for nz. Then dx=cx-nx, dz=cz-nz. Return (dx*dx+dz*dz)<(r*r).",
      "resolveCollision: scan cells from (px-r)/CELL-1 to (px+r)/CELL+1. For each solid+hitting cell, compute nearest point, distance, then push out by (r-dist) along (dx,dz)/dist.",
    ],
    estimatedMinutes: 20,
  },
};
