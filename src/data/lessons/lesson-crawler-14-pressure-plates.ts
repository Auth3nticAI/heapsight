import type { Lesson } from "@/types/lesson";

export const lessonCrawler14: Lesson = {
  id: "crawler-14-pressure-plates",
  title: "Pressure Plates",
  description: "Separate parallel arrays track plate grid positions. A plate is active when dungeon[plate_z][plate_x] == 3 (a push block is on that cell). Plates are drawn as flat floor markers: dark green when empty, bright green when activated.",
  order: 14,
  xpReward: 100,
  tier: "pro",
  concepts: ["pressure plates", "trigger detection", "separate state arrays", "block-on-plate check", "floor markers"],
  part1: {
    title: "Concept: Pressure Plate as Position Check",
    type: "concept",
    instructions: `# Pressure Plates

## Mental Model

A pressure plate is NOT a tile value -- it's a floor position that observes another tile. Two parallel arrays store plate positions: \`plate_x[]\` and \`plate_z[]\`. A plate is active when \`dungeon[plate_z[i]][plate_x[i]] == 3\` (a push block occupies that cell). The plate does not modify the dungeon -- it only reads it.

## What Breaks Without This

Without pressure plates, the only interaction in the dungeon is doors (E key). Push blocks have no purpose -- you push them around but nothing happens. Plates give blocks a target. Push block onto plate, plate triggers door. Now the puzzle system is complete.

## The Fix: Position Check Array

\`\`\`cpp
const int NUM_PLATES = 1;
int plate_x[NUM_PLATES] = {8};   // grid cell x
int plate_z[NUM_PLATES] = {11};  // grid cell z

// Check activation each frame:
bool plate_active = (dungeon[plate_z[0]][plate_x[0]] == 3);
\`\`\`

## Key Concepts

- **Plate is a position, not a tile**: plate_x/plate_z store WHERE to check
- **Read-only check**: plate does not write to dungeon
- **Activation condition**: dungeon[plate_z][plate_x] == 3 (block is there)
- **Visual**: thin flat cube on floor -- DARKGREEN empty, GREEN activated

## Beginner Trap

**Trying to encode the plate in the dungeon array.** If plate=4 in the dungeon, and block (3) gets pushed onto it, you'd need to set the cell to both 3 and 4 simultaneously. Instead, plates are separate arrays that OBSERVE the dungeon state. Two different representations cooperate.

## Elite Insight

This is the Observer pattern: the plate array watches the dungeon array. In game engines, pressure plates are often implemented as trigger volumes (AABB colliders) that fire events when overlapping entities enter/exit. Your array-based version is the data-oriented equivalent -- no OOP, just parallel data.

## Systems Thinking Connection

The item pickup system (L9) used item_active[] to track collected state. The plate system uses the DUNGEON ARRAY as the truth source -- no plate_active[] needed. The question 'is the plate active?' is answered by querying the dungeon: 'is there a block here?' State is distributed across multiple arrays that reference each other by index and position.

## Mastery Check

What if two plates overlap the same cell? Both would activate simultaneously when a block is there. What if a plate overlaps where an item spawns? The item is at world position (not grid); plates check grid cells. If both happen to be at the same grid cell, pushing a block there activates the plate AND the item can coexist (items are world-space, not dungeon tiles). No conflict.

## Your Task

Print plate information and whether it is active.

Expected output:
\`\`\`
Plates: 1
Active: 0
Trigger: block-on-plate
\`\`\`
`,
    starterCode: `
#include <iostream>
using namespace std;

int main() {
    int dungeon[5][5] = {
        {1,1,1,1,1},
        {1,0,0,0,1},
        {1,0,3,0,1},  // block at (2,2)
        {1,0,0,0,1},
        {1,1,1,1,1},
    };
    const int NUM_PLATES = 1;
    int plate_x[NUM_PLATES] = {3};  // plate at (3,2)
    int plate_z[NUM_PLATES] = {2};

    int active_count = 0;
    for (int i = 0; i < NUM_PLATES; i++)
        if (dungeon[plate_z[i]][plate_x[i]] == 3) active_count++;

    // TODO 1: Print "Plates: N"
    // TODO 2: Print "Active: N" (how many plates have a block on them)
    // TODO 3: Print "Trigger: block-on-plate"
    return 0;
}
`,
    solutionCode: `
#include <iostream>
using namespace std;

int main() {
    int dungeon[5][5] = {
        {1,1,1,1,1},
        {1,0,0,0,1},
        {1,0,3,0,1},
        {1,0,0,0,1},
        {1,1,1,1,1},
    };
    const int NUM_PLATES = 1;
    int plate_x[NUM_PLATES] = {3};
    int plate_z[NUM_PLATES] = {2};

    int active_count = 0;
    for (int i = 0; i < NUM_PLATES; i++)
        if (dungeon[plate_z[i]][plate_x[i]] == 3) active_count++;

    cout << "Plates: " << NUM_PLATES << endl;
    cout << "Active: " << active_count << endl;
    cout << "Trigger: block-on-plate" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints plate count", expectedOutput: "Plates: 1" },
      { id: "t2", description: "Prints active count", expectedOutput: "Active: 0" },
      { id: "t3", description: "Prints trigger type", expectedOutput: "Trigger: block-on-plate" },
    ],
    hints: [
      "Print: cout << \"Plates: \" << NUM_PLATES << endl;",
      "Count active plates by checking dungeon[plate_z[i]][plate_x[i]] == 3 for each i. Print \"Active: \" << active_count << endl;",
      "Print the fixed string: cout << \"Trigger: block-on-plate\" << endl;",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Pressure Plate Floor Triggers",
    type: "game_builder",
    instructions: `# Pressure Plates

## Goal

Add a pressure plate at grid cell (8, 11) in Room C. The plate appears as a thin colored square on the floor. It turns bright green when a push block is on it. Push the purple block from col 5 to col 8 to activate it.

## Step 1: Add Plate Arrays at File Scope

After the block_count-related code or after ray_hit vars, add:

\`\`\`cpp
const int NUM_PLATES = 1;
int plate_x[NUM_PLATES] = {8};   // grid cell x
int plate_z[NUM_PLATES] = {11};  // grid cell z
\`\`\`

## Step 2: Print Plate Count Before Game Loop

After the Blocks cout, add:

\`\`\`cpp
cout << "Plates: " << NUM_PLATES << endl;
\`\`\`

## Step 3: Draw Plates in 3D

After the item gold cubes and before \`EndMode3D();\`, add:

\`\`\`cpp
for (int i = 0; i < NUM_PLATES; i++) {
    bool on = (dungeon[plate_z[i]][plate_x[i]] == 3);
    Color pc = on ? GREEN : DARKGREEN;
    DrawCube(
        (Vector3){plate_x[i]*CELL+CELL/2, 0.05f, plate_z[i]*CELL+CELL/2},
        CELL*0.8f, 0.1f, CELL*0.8f, pc);
}
\`\`\`

**Did It Work?** Enter Room C -- you should see a dark green square on the floor. Push the purple block onto it -- it turns bright green!

## Step 4: Show Plate Status in HUD

After the looking-at text, add:

\`\`\`cpp
bool any_plate_on = false;
for (int i = 0; i < NUM_PLATES; i++)
    if (dungeon[plate_z[i]][plate_x[i]] == 3) any_plate_on = true;
DrawText(any_plate_on ? "Plate: active" : "Plate: empty",
         10, 135, 16, any_plate_on ? GREEN : GRAY);
\`\`\`

**Expected Output:**
\`\`\`
Player: (10, 1, 10)
Blocks: 1
Plates: 1
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
    {1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1},
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
const float PLAYER_RADIUS = 0.2f;
const int MM_SIZE = 6;
const int NUM_ITEMS = 3;
float item_x[NUM_ITEMS] = {10.0f, 46.0f, 30.0f};
float item_z[NUM_ITEMS] = {14.0f, 14.0f, 46.0f};
bool item_active[NUM_ITEMS] = {true, true, true};
int score = 0;
int game_state = 0;
int ray_hit_tile = 0;
int ray_hit_x = 0, ray_hit_z = 0;
// TODO 1: Add plate arrays: const int NUM_PLATES=1; int plate_x[1]={8}; int plate_z[1]={11};

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
    // TODO 2: cout << "Plates: " << NUM_PLATES << endl;

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
        if (IsKeyDown(KEY_W)) { move_x += forward_x * MOVE_SPEED; move_z += forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_S)) { move_x -= forward_x * MOVE_SPEED; move_z -= forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_A)) { move_x -= right_x * MOVE_SPEED;   move_z -= right_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_D)) { move_x += right_x * MOVE_SPEED;   move_z += right_z * MOVE_SPEED; }

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

        if (dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 2 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 3 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 2 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 3)
            new_x = player_x;
        if (dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2 ||
            dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 3 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 3)
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
            if (dist < CELL * 0.5f) {
                item_active[i] = false;
                score++;
            }
        }
        if (score >= NUM_ITEMS) game_state = 1;

        {
            float rx = player_x, rz = player_z;
            float rdx = cosf(player_yaw), rdz = sinf(player_yaw);
            ray_hit_tile = 0;
            for (int s = 0; s < 20; s++) {
                rx += rdx * 0.5f;
                rz += rdz * 0.5f;
                int gx2 = (int)(rx / CELL);
                int gz2 = (int)(rz / CELL);
                if (gx2 < 0 || gx2 >= MAP_W || gz2 < 0 || gz2 >= MAP_H) break;
                ray_hit_tile = dungeon[gz2][gx2];
                if (ray_hit_tile > 0) {
                    ray_hit_x = gx2;
                    ray_hit_z = gz2;
                    break;
                }
            }
        }

        int gx = (int)(player_x / CELL);
        int gz = (int)(player_z / CELL);
        const char* room_name = "Corridor";
        if (gx >= 1 && gx <= 6 && gz >= 1 && gz <= 6) room_name = "Room A";
        else if (gx >= 9 && gx <= 14 && gz >= 1 && gz <= 6) room_name = "Room B";
        else if (gx >= 4 && gx <= 11 && gz >= 9 && gz <= 14) room_name = "Room C";

        camera.target = (Vector3){
            player_x + cosf(player_yaw) * cosf(player_pitch),
            player_y + sinf(player_pitch),
            player_z + sinf(player_yaw) * cosf(player_pitch)
        };
        camera.position = (Vector3){player_x, player_y, player_z};

        BeginDrawing();
        ClearBackground(BLACK);
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2, 0, MAP_H*CELL/2},
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2, CELL, MAP_H*CELL/2},
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKGRAY);
        for (int z = 0; z < MAP_H; z++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[z][x] == 1)
                    DrawCube((Vector3){x*CELL+CELL/2, CELL/2, z*CELL+CELL/2}, CELL, CELL, CELL, GRAY);
                else if (dungeon[z][x] == 2)
                    DrawCube((Vector3){x*CELL+CELL/2, CELL/2, z*CELL+CELL/2}, CELL, CELL, CELL, BROWN);
                else if (dungeon[z][x] == 3)
                    DrawCube((Vector3){x*CELL+CELL/2, CELL/2, z*CELL+CELL/2}, CELL, CELL, CELL, PURPLE);
            }
        }
        for (int i = 0; i < NUM_ITEMS; i++) {
            if (item_active[i])
                DrawCube((Vector3){item_x[i], CELL/4, item_z[i]},
                         CELL/2, CELL/2, CELL/2, GOLD);
        }
        // TODO 3: Draw plates as thin flat cubes on floor
        EndMode3D();
        Color ch_color = (ray_hit_tile > 0) ?
            (Color){255,80,80,220} : (Color){255,255,255,180};
        DrawRectangle(SCREEN_W/2-1, SCREEN_H/2-8, 2, 16, ch_color);
        DrawRectangle(SCREEN_W/2-8, SCREEN_H/2-1, 16, 2, ch_color);
        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);
        DrawText(TextFormat("Score: %d / %d", score, NUM_ITEMS), 10, 70, 20, GOLD);
        const char* look_name = (ray_hit_tile==1) ? "wall" :
                               (ray_hit_tile==2) ? "door" :
                               (ray_hit_tile==3) ? "block" : "empty";
        DrawText(TextFormat("Looking at: %s", look_name), 10, 95, 16, LIGHTGRAY);
        if (ray_hit_tile == 2)
            DrawText("[E] Open", 10, 115, 16, WHITE);
        // TODO 4: Show plate status in HUD
        const int MM_X = SCREEN_W - MAP_W * MM_SIZE - 10;
        const int MM_Y = 10;
        for (int mz = 0; mz < MAP_H; mz++) {
            for (int mx = 0; mx < MAP_W; mx++) {
                Color mc = (dungeon[mz][mx] == 1) ? GRAY :
                           (dungeon[mz][mx] == 2) ? BROWN :
                           (dungeon[mz][mx] == 3) ? PURPLE : DARKGRAY;
                DrawRectangle(MM_X + mx*MM_SIZE, MM_Y + mz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, mc);
            }
        }
        int px = (int)(player_x / CELL);
        int pz = (int)(player_z / CELL);
        DrawRectangle(MM_X + px*MM_SIZE, MM_Y + pz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, GREEN);
        for (int i = 0; i < NUM_ITEMS; i++) {
            if (item_active[i]) {
                int ix = (int)(item_x[i] / CELL);
                int iz = (int)(item_z[i] / CELL);
                DrawRectangle(MM_X + ix*MM_SIZE + 2, MM_Y + iz*MM_SIZE + 2, 2, 2, GOLD);
            }
        }
        if (game_state == 1) {
            DrawRectangle(SCREEN_W/2-120, SCREEN_H/2-30, 240, 60, (Color){0,0,0,200});
            DrawText("YOU WIN!", SCREEN_W/2-80, SCREEN_H/2-15, 40, GOLD);
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
    {1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1},
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
const float PLAYER_RADIUS = 0.2f;
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
        if (IsKeyDown(KEY_W)) { move_x += forward_x * MOVE_SPEED; move_z += forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_S)) { move_x -= forward_x * MOVE_SPEED; move_z -= forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_A)) { move_x -= right_x * MOVE_SPEED;   move_z -= right_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_D)) { move_x += right_x * MOVE_SPEED;   move_z += right_z * MOVE_SPEED; }

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

        if (dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 2 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 3 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 2 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 3)
            new_x = player_x;
        if (dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2 ||
            dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 3 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 3)
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
            if (dist < CELL * 0.5f) {
                item_active[i] = false;
                score++;
            }
        }
        if (score >= NUM_ITEMS) game_state = 1;

        {
            float rx = player_x, rz = player_z;
            float rdx = cosf(player_yaw), rdz = sinf(player_yaw);
            ray_hit_tile = 0;
            for (int s = 0; s < 20; s++) {
                rx += rdx * 0.5f;
                rz += rdz * 0.5f;
                int gx2 = (int)(rx / CELL);
                int gz2 = (int)(rz / CELL);
                if (gx2 < 0 || gx2 >= MAP_W || gz2 < 0 || gz2 >= MAP_H) break;
                ray_hit_tile = dungeon[gz2][gx2];
                if (ray_hit_tile > 0) {
                    ray_hit_x = gx2;
                    ray_hit_z = gz2;
                    break;
                }
            }
        }

        int gx = (int)(player_x / CELL);
        int gz = (int)(player_z / CELL);
        const char* room_name = "Corridor";
        if (gx >= 1 && gx <= 6 && gz >= 1 && gz <= 6) room_name = "Room A";
        else if (gx >= 9 && gx <= 14 && gz >= 1 && gz <= 6) room_name = "Room B";
        else if (gx >= 4 && gx <= 11 && gz >= 9 && gz <= 14) room_name = "Room C";

        camera.target = (Vector3){
            player_x + cosf(player_yaw) * cosf(player_pitch),
            player_y + sinf(player_pitch),
            player_z + sinf(player_yaw) * cosf(player_pitch)
        };
        camera.position = (Vector3){player_x, player_y, player_z};

        BeginDrawing();
        ClearBackground(BLACK);
        BeginMode3D(camera);
        DrawPlane((Vector3){MAP_W*CELL/2, 0, MAP_H*CELL/2},
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2, CELL, MAP_H*CELL/2},
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKGRAY);
        for (int z = 0; z < MAP_H; z++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[z][x] == 1)
                    DrawCube((Vector3){x*CELL+CELL/2, CELL/2, z*CELL+CELL/2}, CELL, CELL, CELL, GRAY);
                else if (dungeon[z][x] == 2)
                    DrawCube((Vector3){x*CELL+CELL/2, CELL/2, z*CELL+CELL/2}, CELL, CELL, CELL, BROWN);
                else if (dungeon[z][x] == 3)
                    DrawCube((Vector3){x*CELL+CELL/2, CELL/2, z*CELL+CELL/2}, CELL, CELL, CELL, PURPLE);
            }
        }
        for (int i = 0; i < NUM_ITEMS; i++) {
            if (item_active[i])
                DrawCube((Vector3){item_x[i], CELL/4, item_z[i]},
                         CELL/2, CELL/2, CELL/2, GOLD);
        }
        for (int i = 0; i < NUM_PLATES; i++) {
            bool on = (dungeon[plate_z[i]][plate_x[i]] == 3);
            Color pc = on ? GREEN : DARKGREEN;
            DrawCube(
                (Vector3){plate_x[i]*CELL+CELL/2, 0.05f, plate_z[i]*CELL+CELL/2},
                CELL*0.8f, 0.1f, CELL*0.8f, pc);
        }
        EndMode3D();
        Color ch_color = (ray_hit_tile > 0) ?
            (Color){255,80,80,220} : (Color){255,255,255,180};
        DrawRectangle(SCREEN_W/2-1, SCREEN_H/2-8, 2, 16, ch_color);
        DrawRectangle(SCREEN_W/2-8, SCREEN_H/2-1, 16, 2, ch_color);
        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);
        DrawText(TextFormat("Score: %d / %d", score, NUM_ITEMS), 10, 70, 20, GOLD);
        const char* look_name = (ray_hit_tile==1) ? "wall" :
                               (ray_hit_tile==2) ? "door" :
                               (ray_hit_tile==3) ? "block" : "empty";
        DrawText(TextFormat("Looking at: %s", look_name), 10, 95, 16, LIGHTGRAY);
        if (ray_hit_tile == 2)
            DrawText("[E] Open", 10, 115, 16, WHITE);
        bool any_plate_on = false;
        for (int i = 0; i < NUM_PLATES; i++)
            if (dungeon[plate_z[i]][plate_x[i]] == 3) any_plate_on = true;
        DrawText(any_plate_on ? "Plate: active" : "Plate: empty",
                 10, 135, 16, any_plate_on ? GREEN : GRAY);
        const int MM_X = SCREEN_W - MAP_W * MM_SIZE - 10;
        const int MM_Y = 10;
        for (int mz = 0; mz < MAP_H; mz++) {
            for (int mx = 0; mx < MAP_W; mx++) {
                Color mc = (dungeon[mz][mx] == 1) ? GRAY :
                           (dungeon[mz][mx] == 2) ? BROWN :
                           (dungeon[mz][mx] == 3) ? PURPLE : DARKGRAY;
                DrawRectangle(MM_X + mx*MM_SIZE, MM_Y + mz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, mc);
            }
        }
        int px = (int)(player_x / CELL);
        int pz = (int)(player_z / CELL);
        DrawRectangle(MM_X + px*MM_SIZE, MM_Y + pz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, GREEN);
        for (int i = 0; i < NUM_ITEMS; i++) {
            if (item_active[i]) {
                int ix = (int)(item_x[i] / CELL);
                int iz = (int)(item_z[i] / CELL);
                DrawRectangle(MM_X + ix*MM_SIZE + 2, MM_Y + iz*MM_SIZE + 2, 2, 2, GOLD);
            }
        }
        if (game_state == 1) {
            DrawRectangle(SCREEN_W/2-120, SCREEN_H/2-30, 240, 60, (Color){0,0,0,200});
            DrawText("YOU WIN!", SCREEN_W/2-80, SCREEN_H/2-15, 40, GOLD);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "Prints block count", expectedOutput: "Blocks: 1" },
      { id: "g3", description: "Prints plate count", expectedOutput: "Plates: 1" },
    ],
    hints: [
      "Add plate arrays at file scope: const int NUM_PLATES=1; int plate_x[1]={8}; int plate_z[1]={11}; Add cout << \"Plates: \" << NUM_PLATES << endl;",
      "Draw plates: for each plate, check if dungeon[plate_z[i]][plate_x[i]]==3. Color GREEN if active, DARKGREEN if empty. DrawCube at plate position with y=0.05f, height=0.1f, size CELL*0.8.",
      "Plate HUD: bool any_plate_on=false; for plates: if dungeon[plate_z[i]][plate_x[i]]==3 set any_plate_on=true; DrawText 'Plate: active' or 'Plate: empty' with matching color.",
    ],
    estimatedMinutes: 20,
  },
};
