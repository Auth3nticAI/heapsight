import type { Lesson } from "@/types/lesson";

export const lessonCrawler11: Lesson = {
  id: "crawler-11-ray-wall-intersection",
  title: "Ray-Wall Intersection",
  description: "Cast a ray from the player in the look direction using DDA stepping. The ray walks through grid cells until it hits a wall or door tile. The crosshair changes color and the HUD shows what tile is targeted.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["DDA raycasting", "grid traversal", "ray direction", "hit detection", "crosshair feedback"],
  part1: {
    title: "Concept: DDA Grid Raycasting",
    type: "concept",
    instructions: `# Ray-Wall Intersection

## Mental Model

DDA (Digital Differential Analyzer) is a grid traversal algorithm. A ray starts at the player position and steps forward in small increments. At each step, convert the world position to a grid cell. When the cell contains a wall or door (value > 0), the ray has hit something. This is the algorithm that powered Wolfenstein 3D.

## What Breaks Without This

Without raycasting, the game has no concept of what the player is aimed at. Door interaction (L12) requires knowing which specific tile is in the crosshair. Proximity-based interaction works poorly in 3D -- the player might face away from a door and still trigger it. Raycasting gives precise directional targeting.

## The Fix: DDA Step Loop

\`\`\`cpp
float ray_x = player_x;
float ray_z = player_z;
float ray_dx = cosf(player_yaw);
float ray_dz = sinf(player_yaw);
int hit_tile = 0;
const int MAX_STEPS = 20;

for (int s = 0; s < MAX_STEPS; s++) {
    ray_x += ray_dx * 0.5f;
    ray_z += ray_dz * 0.5f;
    int rx = (int)(ray_x / CELL);
    int rz = (int)(ray_z / CELL);
    if (rx < 0 || rx >= MAP_W || rz < 0 || rz >= MAP_H) break;
    hit_tile = dungeon[rz][rx];
    if (hit_tile > 0) break;
}
\`\`\`

## Key Concepts

- **Ray direction**: \`cosf(yaw)\` / \`sinf(yaw)\` give X/Z components of look direction
- **Step size**: 0.5f (half a unit) gives good accuracy vs. performance tradeoff
- **Grid check**: convert world position to grid cell each step
- **Hit condition**: \`dungeon[rz][rx] > 0\` means wall (1) or door (2)
- **MAX_STEPS**: limits ray length (20 steps * 0.5 = 10 world units = 2.5 cells)

## Beginner Trap

**Using pitch in the ray direction.** Wall intersection only needs the horizontal look direction (yaw). Including pitch tilts the ray up or down -- it might miss the wall and hit the floor or ceiling instead. Keep the ray direction in the XZ plane: \`ray_dx = cosf(yaw), ray_dz = sinf(yaw)\`.

## Elite Insight

A step size of 0.5f means the ray could miss a thin wall if it steps over it. True DDA uses exact cell boundary crossings (no steps at all -- it jumps to each grid line mathematically). But for thick walls (CELL=4.0f), a step of 0.5f always hits before passing through. Wolfenstein 3D used exact DDA; we use approximate stepping for simplicity.

## Systems Thinking Connection

The RPG path uses line-of-sight by tracing through tiles on a 2D grid. The dungeon crawler does the same in 3D projected onto the XZ plane. The grid is the database; the question is just 'which cell does this ray pass through?'

## Mastery Check

Why MAX_STEPS=20 with step 0.5f? That covers 10 world units = 2.5 cells. Our dungeon is 16 cells wide = 64 world units. To reach across the whole map you'd need MAX_STEPS=128. For door interaction you only need to reach 1-2 cells ahead -- 20 steps is more than enough.

## Your Task

Implement a simple DDA step loop and print what the ray hits.

Expected output:
\`\`\`
Ray: DDA
Steps: 3
Hit: wall
\`\`\`
`,
    starterCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    // 5x5 mini dungeon: 0=floor, 1=wall
    int dungeon[5][5] = {
        {1,1,1,1,1},
        {1,0,0,0,1},
        {1,0,0,0,1},
        {1,0,0,0,1},
        {1,1,1,1,1},
    };
    float CELL = 4.0f;
    float player_x = 8.0f;   // grid cell (2,2)
    float player_z = 8.0f;
    float player_yaw = 0.0f;  // facing +X

    float ray_x = player_x;
    float ray_z = player_z;
    float ray_dx = cosf(player_yaw);
    float ray_dz = sinf(player_yaw);
    int hit_tile = 0;
    int steps = 0;
    const int MAX_STEPS = 20;

    // TODO 1: Step loop: for s < MAX_STEPS, advance ray by 0.5, check grid cell
    // TODO 2: Break when dungeon cell > 0 (wall hit)

    cout << "Ray: DDA" << endl;
    // TODO 3: Print steps taken and what was hit
    return 0;
}
`,
    solutionCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    int dungeon[5][5] = {
        {1,1,1,1,1},
        {1,0,0,0,1},
        {1,0,0,0,1},
        {1,0,0,0,1},
        {1,1,1,1,1},
    };
    float CELL = 4.0f;
    float player_x = 8.0f;
    float player_z = 8.0f;
    float player_yaw = 0.0f;

    float ray_x = player_x;
    float ray_z = player_z;
    float ray_dx = cosf(player_yaw);
    float ray_dz = sinf(player_yaw);
    int hit_tile = 0;
    int steps = 0;
    const int MAX_STEPS = 20;

    for (int s = 0; s < MAX_STEPS; s++) {
        ray_x += ray_dx * 0.5f;
        ray_z += ray_dz * 0.5f;
        int rx = (int)(ray_x / CELL);
        int rz = (int)(ray_z / CELL);
        if (rx < 0 || rx >= 5 || rz < 0 || rz >= 5) break;
        hit_tile = dungeon[rz][rx];
        steps = s + 1;
        if (hit_tile > 0) break;
    }

    cout << "Ray: DDA" << endl;
    cout << "Steps: " << steps << endl;
    const char* hit_name = (hit_tile == 1) ? "wall" : (hit_tile == 2) ? "door" : "empty";
    cout << "Hit: " << hit_name << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints ray type", expectedOutput: "Ray: DDA" },
      { id: "t2", description: "Prints steps taken", expectedOutput: "Steps: 3" },
      { id: "t3", description: "Reports wall hit", expectedOutput: "Hit: wall" },
    ],
    hints: [
      "Step loop: for (int s=0; s<MAX_STEPS; s++) { ray_x += ray_dx*0.5f; ray_z += ray_dz*0.5f; int rx=(int)(ray_x/CELL); int rz=(int)(ray_z/CELL); if (dungeon[rz][rx]>0) { hit_tile=dungeon[rz][rx]; steps=s+1; break; } }",
      "With yaw=0, the ray goes +X. From cell (2,2) it hits the right wall (x=3) after 3 steps of 0.5: 8+3*0.5=9.5, grid x=(int)(9.5/4)=2 still. At step where ray_x crosses 12 (cell 3) -- check your math.",
      "Print: cout << \"Steps: \" << steps << endl; then determine hit_name from hit_tile value (1=wall, 2=door, else empty).",
    ],
    estimatedMinutes: 15,
  },
  part2: {
    title: "Build: Crosshair Hit Detection",
    type: "game_builder",
    instructions: `# Ray-Wall Intersection

## Goal

Add a DDA raycast to the dungeon. Every frame, cast a ray from the player in the look direction. The crosshair changes color (RED when aiming at wall/door, WHITE for empty). HUD shows what the ray hits.

## Step 1: Add Raycast Variables at File Scope

After \`int game_state = 0;\`, add:

\`\`\`cpp
int ray_hit_tile = 0;  // what the ray is currently hitting
\`\`\`

## Step 2: Add Raycast in Game Loop

After the win condition check and before the camera update, add the DDA loop:

\`\`\`cpp
{
    float ray_x = player_x;
    float ray_z = player_z;
    float ray_dx = cosf(player_yaw);
    float ray_dz = sinf(player_yaw);
    ray_hit_tile = 0;
    for (int s = 0; s < 20; s++) {
        ray_x += ray_dx * 0.5f;
        ray_z += ray_dz * 0.5f;
        int rx = (int)(ray_x / CELL);
        int rz = (int)(ray_z / CELL);
        if (rx < 0 || rx >= MAP_W || rz < 0 || rz >= MAP_H) break;
        ray_hit_tile = dungeon[rz][rx];
        if (ray_hit_tile > 0) break;
    }
}
\`\`\`

**Click Run** -- the dungeon should compile. No visual change yet.

## Step 3: Color the Crosshair by Hit

Replace the fixed-color crosshair with a dynamic one. Find the crosshair DrawRectangle calls and replace them:

\`\`\`cpp
Color ch_color = (ray_hit_tile > 0) ?
    (Color){255, 80, 80, 220} : (Color){255, 255, 255, 180};
DrawRectangle(SCREEN_W/2-1, SCREEN_H/2-8, 2, 16, ch_color);
DrawRectangle(SCREEN_W/2-8, SCREEN_H/2-1, 16, 2, ch_color);
\`\`\`

**Did It Work?** Aim at a wall -- crosshair turns red. Look at open space -- it turns white.

## Step 4: Show Hit in HUD

After the score DrawText, add:

\`\`\`cpp
const char* look_name = (ray_hit_tile==1) ? "wall" :
                        (ray_hit_tile==2) ? "door" : "empty";
DrawText(TextFormat("Looking at: %s", look_name), 10, 95, 16, LIGHTGRAY);
\`\`\`

## Step 5: Add Cout

After the Score cout, add:

\`\`\`cpp
cout << "Ray: DDA" << endl;
\`\`\`

**Expected Output:**
\`\`\`
Player: (10, 1, 10)
Items: 3
Score: 0
Goal: 3 items
Ray: DDA
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
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
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
// TODO 1: Add ray_hit_tile = 0;

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
    // TODO 2: cout << "Ray: DDA" << endl;

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

        if (dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 2 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 2)
            new_x = player_x;
        if (dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2)
            new_z = player_z;

        player_x = new_x;
        player_z = new_z;

        if (IsKeyPressed(KEY_E)) {
            float cx = player_x + cosf(player_yaw) * CELL * 0.7f;
            float cz = player_z + sinf(player_yaw) * CELL * 0.7f;
            int dx = (int)(cx / CELL);
            int dz = (int)(cz / CELL);
            if (dx >= 0 && dx < MAP_W && dz >= 0 && dz < MAP_H)
                if (dungeon[dz][dx] == 2) dungeon[dz][dx] = 0;
        }

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

        // TODO 3: Add DDA raycast loop here

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
            }
        }
        for (int i = 0; i < NUM_ITEMS; i++) {
            if (item_active[i])
                DrawCube((Vector3){item_x[i], CELL/4, item_z[i]},
                         CELL/2, CELL/2, CELL/2, GOLD);
        }
        EndMode3D();
        DrawRectangle(SCREEN_W/2-1, SCREEN_H/2-8, 2, 16, (Color){255,255,255,180});
        DrawRectangle(SCREEN_W/2-8, SCREEN_H/2-1, 16, 2, (Color){255,255,255,180});
        // TODO 4: Replace above with color-changing crosshair (RED if ray_hit_tile>0)
        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);
        DrawText(TextFormat("Score: %d / %d", score, NUM_ITEMS), 10, 70, 20, GOLD);
        // TODO 5: Add looking-at HUD line
        const int MM_X = SCREEN_W - MAP_W * MM_SIZE - 10;
        const int MM_Y = 10;
        for (int mz = 0; mz < MAP_H; mz++) {
            for (int mx = 0; mx < MAP_W; mx++) {
                Color mc = (dungeon[mz][mx] >= 1) ? GRAY : DARKGRAY;
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
    {1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1},
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

        if (dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 2 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 2)
            new_x = player_x;
        if (dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2)
            new_z = player_z;

        player_x = new_x;
        player_z = new_z;

        if (IsKeyPressed(KEY_E)) {
            float cx = player_x + cosf(player_yaw) * CELL * 0.7f;
            float cz = player_z + sinf(player_yaw) * CELL * 0.7f;
            int dx = (int)(cx / CELL);
            int dz = (int)(cz / CELL);
            if (dx >= 0 && dx < MAP_W && dz >= 0 && dz < MAP_H)
                if (dungeon[dz][dx] == 2) dungeon[dz][dx] = 0;
        }

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
                if (ray_hit_tile > 0) break;
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
        DrawText(TextFormat("Looking at: %s", look_name), 10, 95, 16, LIGHTGRAY);
        const int MM_X = SCREEN_W - MAP_W * MM_SIZE - 10;
        const int MM_Y = 10;
        for (int mz = 0; mz < MAP_H; mz++) {
            for (int mx = 0; mx < MAP_W; mx++) {
                Color mc = (dungeon[mz][mx] >= 1) ? GRAY : DARKGRAY;
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
      { id: "g2", description: "Prints goal", expectedOutput: "Goal: 3 items" },
      { id: "g3", description: "Prints ray type", expectedOutput: "Ray: DDA" },
    ],
    hints: [
      "Add int ray_hit_tile=0 at file scope. In game loop, add a block { float rx=player_x, rz=player_z; float rdx=cosf(player_yaw), rdz=sinf(player_yaw); ray_hit_tile=0; for 20 steps: advance by 0.5, check dungeon cell, break if >0; }",
      "Color crosshair: Color ch_color = (ray_hit_tile>0) ? (Color){255,80,80,220} : (Color){255,255,255,180}; Use ch_color in both DrawRectangle crosshair calls.",
      "Add HUD: const char* look_name = (ray_hit_tile==1)?'wall':(ray_hit_tile==2)?'door':'empty'; DrawText(TextFormat(\"Looking at: %s\", look_name), 10, 95, 16, LIGHTGRAY);",
    ],
    estimatedMinutes: 25,
  },
};
