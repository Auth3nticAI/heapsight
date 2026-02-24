import type { Lesson } from "@/types/lesson";

export const lessonCrawler16: Lesson = {
  id: "crawler-16-sphere-collision",
  title: "Sphere Collision",
  description: "Replace AABB corner checks with sphere-AABB collision. The nearest-point test finds the closest position on each wall cell to the player circle, then pushes the player out by the overlap distance. Result: smooth corner sliding instead of getting stuck on wall edges.",
  order: 16,
  xpReward: 100,
  tier: "pro",
  concepts: ["sphere-AABB collision", "nearest-point test", "collision resolution", "corner sliding"],
  part1: {
    title: "Concept: Sphere vs AABB -- Nearest-Point Collision",
    type: "concept",
    instructions: `
# Sphere Collision

## What Breaks Without This

The AABB check from Lesson 4 tests four corners of the player's bounding box against the wall grid. This works -- but it has a flaw: **the player gets stuck on wall corners**. Walk diagonally toward a corner and you stop dead instead of sliding past.

## The Fix: Sphere-AABB Nearest-Point Test

Instead of testing four corners of a square, the sphere approach asks: **what is the nearest point on the wall cell's box to my circle center?** If that distance is less than my radius, I'm overlapping -- push me out.

\`\`\`
// For wall cell at grid (gx, gz) occupying world [gx*CELL, (gx+1)*CELL] x [gz*CELL, (gz+1)*CELL]:
float nx = cx < gx*CELL ? gx*CELL : (cx > (gx+1)*CELL ? (gx+1)*CELL : cx);
float nz = cz < gz*CELL ? gz*CELL : (cz > (gz+1)*CELL ? (gz+1)*CELL : cz);
float dx = cx - nx, dz = cz - nz;
float dist = sqrtf(dx*dx + dz*dz);
if (dist < r) { /* overlap: push out by (r - dist) in direction (dx, dz) */ }
\`\`\`

## Key Insight

- **AABB**: 4 point-in-cell tests. Fast, but corners create invisible 'ledges' that stop smooth movement.
- **Sphere**: 1 nearest-point query per cell. Handles corners exactly right -- the player slides.
- Quake, Doom, and every modern FPS use sphere or capsule collision for exactly this reason.

## Expected Output

\`\`\`
Method: sphere-AABB
Dist: 0.2
Push: 0.2
Collision: sphere-AABB
\`\`\`


## Beginner Trap
**Using the sphere center for distance checks instead of the nearest point on the AABB.** A sphere can overlap an AABB corner without the center being inside the box. Always find the closest point on the AABB to the sphere center, then check distance.

## Elite Insight
The nearest-point sphere-AABB test is the standard 3D collision primitive. Unreal, Unity, and Bullet Physics all implement this exact algorithm. The clamp-then-distance approach generalizes to sphere vs any convex shape.

## Systems Thinking Connection
The Platformer uses AABB-AABB collision (rectangle overlap). The RPG uses grid-cell checks. Your sphere-AABB test is the 3D equivalent — different geometry, same "find overlap, then resolve" pattern.`,
    starterCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    // Player circle just left of a wall (player at x=3.8, wall cell x=[4.0,8.0])
    float px = 3.8f, pz = 6.0f;  // player center
    float r  = 0.4f;              // sphere radius
    float wall_x = 4.0f;          // nearest wall edge
    // TODO: find nearest point on wall to player (nx = wall_x since player is left)
    // TODO: compute dx = px - nx, dist = fabsf(dx), push = r - dist
    cout << "Method: sphere-AABB" << endl;
    // TODO: print Dist, Push, and Collision lines
    cout << "Collision: sphere-AABB" << endl;
    return 0;
}
`,
    solutionCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    // Player circle just left of a wall (player at x=3.8, wall cell x=[4.0,8.0])
    float px = 3.8f, pz = 6.0f;  // player center
    float r  = 0.4f;              // sphere radius
    float wall_x = 4.0f;          // nearest wall edge
    // Nearest point on wall cell to player (1D: just the x axis here)
    float nx = wall_x;            // clamped -- player is left of wall
    float dx = px - nx;           // -0.2  (player 0.2 inside radius)
    float dist = fabsf(dx);       // 0.2
    float push = r - dist;        // 0.2  (push player 0.2 to the left)
    cout << "Method: sphere-AABB" << endl;
    cout << "Dist: 0.2" << endl;
    cout << "Push: 0.2" << endl;
    cout << "Collision: sphere-AABB" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints method name", expectedOutput: "Method: sphere-AABB" },
      { id: "t2", description: "Prints distance", expectedOutput: "Dist: 0.2" },
      { id: "t3", description: "Prints collision type", expectedOutput: "Collision: sphere-AABB" },
    ],
    hints: [
      "Declare px=3.8f, r=0.4f, wall_x=4.0f. Compute nx=wall_x (player is left of wall). Print cout << \"Method: sphere-AABB\" << endl;",
      "dx = px - nx gives -0.2. dist = fabsf(dx) = 0.2. Print cout << \"Dist: 0.2\" << endl;",
      "push = r - dist = 0.4 - 0.2 = 0.2. Print cout << \"Push: 0.2\" << endl; then cout << \"Collision: sphere-AABB\" << endl;",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Sphere-AABB Collision Resolution",
    type: "game_builder",
    instructions: `
# Sphere Collision

## Goal

Replace the chunky AABB collision from Lesson 4 with a smooth sphere-AABB resolver. Walk into a wall corner -- instead of stopping, you slide past it. The player radius grows to 0.4f for better feel.

## Step 1: Add SPATIAL MODULE Functions Before Camera

Before \`Camera3D camera = {0};\`, add three functions:

\`\`\`
// === SPATIAL MODULE (hs_spatial.h) ===
bool isSolid(int t) { return t == 1 || t == 2 || t == 3; }

bool sphereHitsCell(float cx, float cz, int gx, int gz, float r) {
    float nx = cx < gx*CELL ? gx*CELL : (cx > (gx+1)*CELL ? (gx+1)*CELL : cx);
    float nz = cz < gz*CELL ? gz*CELL : (cz > (gz+1)*CELL ? (gz+1)*CELL : cz);
    float dx = cx - nx, dz = cz - nz;
    return (dx*dx + dz*dz) < (r*r);
}

void resolveCollision(float& px, float& pz, float r) {
    int x0 = (int)((px-r)/CELL)-1; if (x0<0) x0=0;
    int x1 = (int)((px+r)/CELL)+1; if (x1>=MAP_W) x1=MAP_W-1;
    int z0 = (int)((pz-r)/CELL)-1; if (z0<0) z0=0;
    int z1 = (int)((pz+r)/CELL)+1; if (z1>=MAP_H) z1=MAP_H-1;
    for (int gz=z0; gz<=z1; gz++) {
        for (int gx=x0; gx<=x1; gx++) {
            if (!isSolid(dungeon[gz][gx])) continue;
            if (!sphereHitsCell(px,pz,gx,gz,r)) continue;
            float nx = px<gx*CELL?gx*CELL:(px>(gx+1)*CELL?(gx+1)*CELL:px);
            float nz = pz<gz*CELL?gz*CELL:(pz>(gz+1)*CELL?(gz+1)*CELL:pz);
            float dx=px-nx, dz=pz-nz;
            float dist=sqrtf(dx*dx+dz*dz);
            if (dist<0.0001f){px+=r;continue;}
            float push=r-dist;
            px+=dx/dist*push;
            pz+=dz/dist*push;
        }
    }
}
\`\`\`

## Step 2: Update PLAYER_RADIUS

Change \`const float PLAYER_RADIUS = 0.2f;\` to \`const float PLAYER_RADIUS = 0.4f;\` for a more noticeable sphere feel.

## Step 3: Replace Old Collision Block

Find the two big \`if (dungeon[...]...)\` blocks that set \`new_x = player_x\` and \`new_z = player_z\`. Delete both and replace with a single call:

\`\`\`
resolveCollision(new_x, new_z, PLAYER_RADIUS);
\`\`\`

**Did It Work?** Walk toward a wall corner diagonally. Instead of stopping dead, you now slide around the corner smoothly.

## Step 4: Add Startup Output

After \`cout << "Puzzle: push-plate-door" << endl;\`, add:

\`\`\`
cout << "Sphere: r=0.4" << endl;
cout << "Collision: sphere-AABB" << endl;
\`\`\`

## Expected Output

\`\`\`
Player: (10, 1, 10)
Plates: 1
Puzzle: push-plate-door
Sphere: r=0.4
Collision: sphere-AABB
\`\`\`
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

// === SPATIAL MODULE (hs_spatial.h) ===
// TODO 1: bool isSolid(int t) { return t==1||t==2||t==3; }
// TODO 2: bool sphereHitsCell(float cx,float cz,int gx,int gz,float r)
// TODO 3: void resolveCollision(float& px,float& pz,float r)

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
    // TODO 4: cout << "Sphere: r=0.4" << endl;
    // TODO 5: cout << "Collision: sphere-AABB" << endl;

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
        if (IsKeyDown(KEY_W)) { move_x += forward_x*MOVE_SPEED; move_z += forward_z*MOVE_SPEED; }
        if (IsKeyDown(KEY_S)) { move_x -= forward_x*MOVE_SPEED; move_z -= forward_z*MOVE_SPEED; }
        if (IsKeyDown(KEY_A)) { move_x -= right_x*MOVE_SPEED;   move_z -= right_z*MOVE_SPEED; }
        if (IsKeyDown(KEY_D)) { move_x += right_x*MOVE_SPEED;   move_z += right_z*MOVE_SPEED; }

        float new_x = player_x + move_x;
        float new_z = player_z + move_z;

        {
            int pgx = (int)(player_x / CELL);
            int pgz = (int)(player_z / CELL);
            if (move_x != 0.0f) {
                int sx = (move_x > 0) ? 1 : -1;
                int agx = pgx + sx;
                if (agx >= 0 && agx < MAP_W && dungeon[pgz][agx] == 3) {
                    int bgx = agx + sx;
                    if (bgx >= 0 && bgx < MAP_W && dungeon[pgz][bgx] == 0) {
                        dungeon[pgz][agx] = 0;
                        dungeon[pgz][bgx] = 3;
                    }
                }
            }
            if (move_z != 0.0f) {
                int sz = (move_z > 0) ? 1 : -1;
                int agz = pgz + sz;
                if (agz >= 0 && agz < MAP_H && dungeon[agz][pgx] == 3) {
                    int bgz = agz + sz;
                    if (bgz >= 0 && bgz < MAP_H && dungeon[bgz][pgx] == 0) {
                        dungeon[agz][pgx] = 0;
                        dungeon[bgz][pgx] = 3;
                    }
                }
            }
        }

        // TODO 6: resolveCollision(new_x, new_z, PLAYER_RADIUS);
        // (Remove the old AABB block below after adding resolveCollision)
        if (dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)]==1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)]==2 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)]==3 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)]==1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)]==2 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)]==3)
            new_x = player_x;
        if (dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)]==1 ||
            dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)]==2 ||
            dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)]==3 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)]==1 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)]==2 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)]==3)
            new_z = player_z;

        player_x = new_x;
        player_z = new_z;

        if (IsKeyPressed(KEY_E) && ray_hit_tile == 2)
            dungeon[ray_hit_z][ray_hit_x] = 0;

        for (int i = 0; i < NUM_ITEMS; i++) {
            if (!item_active[i]) continue;
            float dx = player_x - item_x[i];
            float dz = player_z - item_z[i];
            float dist = sqrtf(dx*dx + dz*dz);
            if (dist < CELL * 0.5f) { item_active[i] = false; score++; }
        }
        if (score >= NUM_ITEMS) game_state = 1;
        if (!puzzle_solved) {
            bool any_on = false;
            for (int i = 0; i < NUM_PLATES; i++)
                if (dungeon[plate_z[i]][plate_x[i]] == 3) any_on = true;
            if (any_on) {
                dungeon[pdoor_z][pdoor_x] = 0;
                puzzle_solved = true;
                game_state = 2;
            }
        }

        {
            float rx = player_x, rz = player_z;
            float rdx = cosf(player_yaw), rdz = sinf(player_yaw);
            ray_hit_tile = 0;
            for (int s = 0; s < 20; s++) {
                rx += rdx * 0.5f;
                rz += rdz * 0.5f;
                int gx2 = (int)(rx / CELL);
                int gz2 = (int)(rz / CELL);
                if (gx2<0||gx2>=MAP_W||gz2<0||gz2>=MAP_H) break;
                ray_hit_tile = dungeon[gz2][gx2];
                if (ray_hit_tile > 0) { ray_hit_x=gx2; ray_hit_z=gz2; break; }
            }
        }

        int gx = (int)(player_x / CELL);
        int gz = (int)(player_z / CELL);
        const char* room_name = "Corridor";
        if (gx>=1&&gx<=6&&gz>=1&&gz<=6) room_name="Room A";
        else if (gx>=9&&gx<=14&&gz>=1&&gz<=6) room_name="Room B";
        else if (gx>=4&&gx<=11&&gz>=9&&gz<=14) room_name="Room C";

        camera.target = (Vector3){
            player_x + cosf(player_yaw)*cosf(player_pitch),
            player_y + sinf(player_pitch),
            player_z + sinf(player_yaw)*cosf(player_pitch)
        };
        camera.position = (Vector3){player_x, player_y, player_z};

        BeginDrawing();
        ClearBackground(BLACK);
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2,0,MAP_H*CELL/2},(Vector2){MAP_W*CELL,MAP_H*CELL},DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2,CELL,MAP_H*CELL/2},(Vector2){MAP_W*CELL,MAP_H*CELL},DARKGRAY);
        for (int z=0;z<MAP_H;z++) {
            for (int x=0;x<MAP_W;x++) {
                if (dungeon[z][x]==1)
                    DrawCube((Vector3){x*CELL+CELL/2,CELL/2,z*CELL+CELL/2},CELL,CELL,CELL,GRAY);
                else if (dungeon[z][x]==2)
                    DrawCube((Vector3){x*CELL+CELL/2,CELL/2,z*CELL+CELL/2},CELL,CELL,CELL,BROWN);
                else if (dungeon[z][x]==3)
                    DrawCube((Vector3){x*CELL+CELL/2,CELL/2,z*CELL+CELL/2},CELL,CELL,CELL,PURPLE);
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

// === SPATIAL MODULE (hs_spatial.h) ===
// === SPATIAL MODULE (hs_spatial.h) ===
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
      { id: "g2", description: "Prints puzzle type", expectedOutput: "Puzzle: push-plate-door" },
      { id: "g3", description: "Prints sphere radius", expectedOutput: "Sphere: r=0.4" },
      { id: "g4", description: "Prints collision type", expectedOutput: "Collision: sphere-AABB" },
    ],
    hints: [
      "Add three functions before Camera3D: isSolid(int t), sphereHitsCell(float cx,float cz,int gx,int gz,float r), and void resolveCollision(float& px,float& pz,float r).",
      "In resolveCollision, loop over cells near the player. For each solid cell, call sphereHitsCell. If overlapping, compute nearest point (nx,nz), then push player out by push=r-dist along (dx,dz)/dist.",
      "Replace the two old AABB if-blocks with resolveCollision(new_x, new_z, PLAYER_RADIUS); then add cout << \"Sphere: r=0.4\" and cout << \"Collision: sphere-AABB\" in startup.",
    ],
    estimatedMinutes: 20,
  },
};
