import type { Lesson } from "@/types/lesson";

export const lessonCrawler13: Lesson = {
  id: "crawler-13-push-blocks",
  title: "Push Blocks",
  description: "Tile value 3 is a pushable block. When the player walks into a block cell, check if the cell behind it (in the push direction) is empty. If so, slide the block and allow movement. If not, the block acts as a wall.",
  order: 13,
  xpReward: 100,
  tier: "pro",
  concepts: ["push mechanics", "tile swap", "movement blocking", "grid-aligned physics", "puzzle elements"],
  part1: {
    title: "Concept: Push as Tile Swap",
    type: "concept",
    instructions: `# Push Blocks

## Mental Model

A push block is a tile that can move. When the player walks toward a push block cell, first check the cell BEHIND the block (one step further in the same direction). If that cell is empty (value 0), perform a tile swap: set the block's current cell to 0, set the behind cell to 3. Then let movement proceed. If the behind cell is not empty, the block acts as a wall.

## What Breaks Without This

Without push blocks, every obstacle in the dungeon is static. Push blocks are the first MOVEABLE element -- they transform the dungeon from a fixed maze into a mutable puzzle space. Pushing a block onto a pressure plate (L14) unlocks a door without keys.

## The Fix: Ahead-Cell Check + Tile Swap

\`\`\`cpp
// Before AABB collision, check if player is entering a block cell
int player_gx = (int)(player_x / CELL);
int player_gz = (int)(player_z / CELL);

if (move_x != 0.0f) {
    int step_x = (move_x > 0) ? 1 : -1;
    int ahead_gx = player_gx + step_x;
    if (ahead_gx >= 0 && ahead_gx < MAP_W && dungeon[player_gz][ahead_gx] == 3) {
        int behind_gx = ahead_gx + step_x;
        if (behind_gx >= 0 && behind_gx < MAP_W && dungeon[player_gz][behind_gx] == 0) {
            dungeon[player_gz][ahead_gx] = 0;
            dungeon[player_gz][behind_gx] = 3;
        }
    }
}
\`\`\`

## Key Concepts

- **Ahead cell**: one grid step further than the player's facing cell
- **Tile swap**: dungeon[gz][gx]=0 then dungeon[gz][new_gx]=3
- **Block acts as wall**: add \`|| val == 3\` to AABB collision when push fails
- **Step direction**: \`(move_x > 0) ? 1 : -1\` gives push direction

## Beginner Trap

**Forgetting to add value 3 to the AABB collision check.** If the block CAN'T be pushed (behind cell is blocked), the block stays in its cell. Without \`|| val == 3\` in the AABB, the player walks through the immovable block. Always add value 3 to both X and Z collision checks.

## Elite Insight

Sokoban (1982) used this exact tile-swap mechanic: 3=box, 4=box-on-goal. Pushing boxes onto goals is the entire game. Your dungeon crawler can support the same mechanic. The elegance is that the puzzle state IS the dungeon array -- no separate list of box positions needed.

## Systems Thinking Connection

Doors (value 2) transition from blocked to open permanently. Push blocks (value 3) move their position permanently. Pressure plates (L14) detect a block's position. Together they form a simple puzzle system: push block to plate, plate opens door. All encoded in a 16x16 integer array.

## Mastery Check

Why check the behind cell BEFORE performing the tile swap? If you swapped first, you might corrupt the dungeon if the behind cell was blocked. The check-then-swap order ensures the operation is atomic: only modify the dungeon if the push is valid.

## Your Task

Print block information using the dungeon array.

Expected output:
\`\`\`
Blocks: 1
Tile: 3
Push: grid-aligned
\`\`\`
`,
    starterCode: `
#include <iostream>
using namespace std;

int main() {
    // 5x5 dungeon with a push block at (2,2)
    int dungeon[5][5] = {
        {1,1,1,1,1},
        {1,0,0,0,1},
        {1,0,3,0,1},  // block at col 2, row 2
        {1,0,0,0,1},
        {1,1,1,1,1},
    };

    int block_count = 0;
    for (int z=0; z<5; z++)
        for (int x=0; x<5; x++)
            if (dungeon[z][x] == 3) block_count++;

    // TODO 1: Print "Blocks: N" where N is the block count
    // TODO 2: Print "Tile: 3"
    // TODO 3: Print "Push: grid-aligned"
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

    int block_count = 0;
    for (int z=0; z<5; z++)
        for (int x=0; x<5; x++)
            if (dungeon[z][x] == 3) block_count++;

    cout << "Blocks: " << block_count << endl;
    cout << "Tile: 3" << endl;
    cout << "Push: grid-aligned" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints block count", expectedOutput: "Blocks: 1" },
      { id: "t2", description: "Prints tile value", expectedOutput: "Tile: 3" },
      { id: "t3", description: "Prints push type", expectedOutput: "Push: grid-aligned" },
    ],
    hints: [
      "Count blocks: loop all cells, count where dungeon[z][x]==3, then print \"Blocks: \" << block_count << endl;",
      "Print the fixed strings: cout << \"Tile: 3\" << endl; and cout << \"Push: grid-aligned\" << endl;",
      "The dungeon[2][2] has value 3 (the push block). Your loop should find it and count 1.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Sliding Push Block",
    type: "game_builder",
    instructions: `# Push Blocks

## Goal

Add a push block to Room C. When the player walks into it, the block slides one cell in the push direction if the behind cell is empty. If the block is against a wall, it stays put and blocks the player.

## Step 1: Add Block to Dungeon

Change dungeon row 11 to place a push block at column 5:

\`\`\`cpp
{1,1,1,1,0,3,0,0,0,0,0,0,0,1,1,1},  // row 11: block at col 5
\`\`\`

**Click Run** -- the dungeon should show a purple cube in Room C.

## Step 2: Count and Print Blocks

Before the game loop, count push blocks like doors:

\`\`\`cpp
int block_count = 0;
for (int z = 0; z < MAP_H; z++)
    for (int x = 0; x < MAP_W; x++)
        if (dungeon[z][x] == 3) block_count++;
cout << "Blocks: " << block_count << endl;
\`\`\`

## Step 3: Add Push Logic Before Collision

After computing new_x, new_z and BEFORE the AABB collision checks, add:

\`\`\`cpp
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
\`\`\`

## Step 4: Add Value 3 to AABB Collision

In each AABB check, add \`|| dungeon[...][...] == 3\` so unpushable blocks block movement:

\`\`\`cpp
if (dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 1 ||
    dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 2 ||
    dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 3 ||
    dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 1 ||
    dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 2 ||
    dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 3)
    new_x = player_x;
// Same pattern for Z collision
\`\`\`

## Step 5: Draw Push Block

In the 3D draw loop, add a case for value 3:

\`\`\`cpp
else if (dungeon[z][x] == 3)
    DrawCube((Vector3){x*CELL+CELL/2, CELL/2, z*CELL+CELL/2}, CELL, CELL, CELL, PURPLE);
\`\`\`

**Did It Work?** Walk into the purple cube in Room C -- it slides away!

## Step 6: Update Minimap and Look Name

In the minimap loop, add PURPLE for value 3:

\`\`\`cpp
Color mc = (dungeon[mz][mx] == 1) ? GRAY :
           (dungeon[mz][mx] == 2) ? BROWN :
           (dungeon[mz][mx] == 3) ? PURPLE : DARKGRAY;
\`\`\`

Also update look_name to include block:

\`\`\`cpp
const char* look_name = (ray_hit_tile==1) ? "wall" :
                        (ray_hit_tile==2) ? "door" :
                        (ray_hit_tile==3) ? "block" : "empty";
\`\`\`

**Expected output:**
\`\`\`
Player: (10, 1, 10)
Blocks: 1
Interact: raycast
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
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},  // TODO: Change to {1,1,1,1,0,3,0,0,...}
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
    // TODO 1: Count blocks and print "Blocks: N"

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

        // TODO 2: Add push block logic here (before AABB collision)

        if (dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 2 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 2)
            new_x = player_x;
        // TODO 3: Also check == 3 in both AABB tests above
        if (dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2)
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
                // TODO 4: else if value == 3, DrawCube in PURPLE
            }
        }
        for (int i = 0; i < NUM_ITEMS; i++) {
            if (item_active[i])
                DrawCube((Vector3){item_x[i], CELL/4, item_z[i]},
                         CELL/2, CELL/2, CELL/2, GOLD);
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
                               (ray_hit_tile==2) ? "door" : "empty";
        // TODO 5: Add 'block' case to look_name
        DrawText(TextFormat("Looking at: %s", look_name), 10, 95, 16, LIGHTGRAY);
        if (ray_hit_tile == 2)
            DrawText("[E] Open", 10, 115, 16, WHITE);
        const int MM_X = SCREEN_W - MAP_W * MM_SIZE - 10;
        const int MM_Y = 10;
        for (int mz = 0; mz < MAP_H; mz++) {
            for (int mx = 0; mx < MAP_W; mx++) {
                Color mc = (dungeon[mz][mx] >= 1) ? GRAY : DARKGRAY;
                // TODO 6: Update minimap to show PURPLE for value 3, BROWN for value 2
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
      { id: "g2", description: "Prints interact type", expectedOutput: "Interact: raycast" },
      { id: "g3", description: "Prints block count", expectedOutput: "Blocks: 1" },
    ],
    hints: [
      "Change dungeon row 11 col 5 to value 3. Count blocks before the game loop (same pattern as door_count). Add cout << \"Blocks: \" << block_count << endl;",
      "Push logic (before AABB): compute player_gx/gz. For X movement, check ahead_gx = pgx + sign. If dungeon[pgz][agx]==3 and behind cell is 0, swap them. Same for Z.",
      "Add == 3 to all 4 AABB collision checks. Add else if(dungeon[z][x]==3) DrawCube PURPLE. Update minimap color and look_name to include block case.",
    ],
    estimatedMinutes: 25,
  },
};
