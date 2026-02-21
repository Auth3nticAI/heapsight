import type { Lesson } from "@/types/lesson";

export const lessonCrawler12: Lesson = {
  id: "crawler-12-interaction-system",
  title: "Interaction System",
  description: "Replace the proximity E-key door interaction with raycast-based interaction. When the ray hits a door tile (value 2) and the player presses E, the door opens. The interaction requires precise aim, not just proximity.",
  order: 12,
  xpReward: 100,
  tier: "pro",
  concepts: ["raycast interaction", "E key upgrade", "aim-based targeting", "interaction prompt", "precision input"],
  part1: {
    title: "Concept: Raycast Interaction vs Proximity",
    type: "concept",
    instructions: `# Interaction System

## Mental Model

L8 used proximity: project forward 0.7*CELL and check. This works but allows activating a door from the side, behind, or through a wall. Raycast interaction is more precise: only interact with what the crosshair is targeting. If \`ray_hit_tile == 2\` and the player presses E, the door tile at the ray's hit position is cleared. No guessing about which door is intended.

## What Breaks Without This

With proximity interaction, the player can activate a door without facing it. This breaks player agency -- it feels like the door opened by accident. Raycast interaction means the player must deliberately aim at a door and press E. This is the correct interaction model for a first-person game.

## The Fix: Use Ray Hit Position

\`\`\`cpp
// Store ray hit grid position alongside hit tile
int ray_hit_tile = 0;
int ray_hit_x = 0, ray_hit_z = 0;  // grid cell of last hit

// In raycast loop: record hit position
if (ray_hit_tile > 0) {
    ray_hit_x = gx2;
    ray_hit_z = gz2;
    break;
}

// E key: use raycast hit instead of proximity
if (IsKeyPressed(KEY_E) && ray_hit_tile == 2)
    dungeon[ray_hit_z][ray_hit_x] = 0;
\`\`\`

## Key Concepts

- **Record hit position**: save the grid cell where the ray hit, not just the tile value
- **Interaction condition**: E key + ray_hit_tile == 2 (facing a door)
- **Direct tile edit**: dungeon[ray_hit_z][ray_hit_x] = 0 (open the door)
- **Prompt display**: show \`[E] Open\` only when looking at a door

## Beginner Trap

**Not saving the hit grid position separately.** You need both the hit tile value (to check if it's a door) AND the hit position (to know which cell to clear). If you only store the tile value, you don't know WHERE to edit the dungeon array.

## Elite Insight

Quake uses a 'use trace' from the player position forward. When it hits a func_door entity, the door's 'use' function fires. The crosshair never appears in Quake -- interaction is from the center of the screen implicitly. Half-Life extended this with explicit \`+use\` binding and 3D collision callbacks. Your raycast system is the direct ancestor of both.

## Systems Thinking Connection

The RPG path had 'press direction to enter door' -- interaction tied to movement input. The dungeon crawler separates look (mouse) from move (WASD) from interact (E). This separation is the correct architecture for first-person games. Each input maps to exactly one action.

## Mastery Check

What happens if two doors are aligned in the ray direction? The DDA stops at the FIRST hit. Only the nearest door is targeted. If the player walks through the first door (now open), they face the second door and can open it too. This is correct behavior -- you always interact with the nearest thing.

## Your Task

Print what the E-key would do given the current ray hit.

Expected output:
\`\`\`
Interact: raycast
E action: open door
Prompt: [E] Open
\`\`\`
`,
    starterCode: `
#include <iostream>
using namespace std;

int main() {
    // Simulate: ray hit a door tile (value 2)
    int ray_hit_tile = 2;
    int ray_hit_x = 4, ray_hit_z = 7;

    cout << "Interact: raycast" << endl;
    // TODO 1: If ray_hit_tile == 2, print E action
    // TODO 2: Print the interaction prompt
    return 0;
}
`,
    solutionCode: `
#include <iostream>
using namespace std;

int main() {
    int ray_hit_tile = 2;
    int ray_hit_x = 4, ray_hit_z = 7;

    cout << "Interact: raycast" << endl;
    if (ray_hit_tile == 2)
        cout << "E action: open door" << endl;
    else
        cout << "E action: none" << endl;
    if (ray_hit_tile == 2)
        cout << "Prompt: [E] Open" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints interact type", expectedOutput: "Interact: raycast" },
      { id: "t2", description: "Prints E action", expectedOutput: "E action: open door" },
      { id: "t3", description: "Prints interaction prompt", expectedOutput: "Prompt: [E] Open" },
    ],
    hints: [
      "Print \"Interact: raycast\" directly, then check if ray_hit_tile==2 to determine the action.",
      "If ray_hit_tile==2: cout << \"E action: open door\" << endl; else: cout << \"E action: none\" << endl;",
      "Prompt: if ray_hit_tile==2: cout << \"Prompt: [E] Open\" << endl;",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Raycast Door Interaction",
    type: "game_builder",
    instructions: `# Interaction System

## Goal

Upgrade the E-key door interaction from proximity-based (L8) to raycast-based. Store the hit grid position in the raycast. Replace the proximity check with: if looking at door and E pressed, open it. Show an interaction prompt when facing a door.

## Step 1: Add Hit Position Variables

At file scope, change \`int ray_hit_tile = 0;\` to:

\`\`\`cpp
int ray_hit_tile = 0;
int ray_hit_x = 0, ray_hit_z = 0;
\`\`\`

## Step 2: Record Hit Position in Raycast

In the DDA loop, when a hit is found, also record the hit cell coordinates. Update the raycast block:

\`\`\`cpp
ray_hit_tile = dungeon[gz2][gx2];
if (ray_hit_tile > 0) {
    ray_hit_x = gx2;
    ray_hit_z = gz2;
    break;
}
\`\`\`

## Step 3: Replace E-Key Interaction

Find the old proximity-based E-key block (the one with cosf/sinf forward projection) and REPLACE it with:

\`\`\`cpp
if (IsKeyPressed(KEY_E) && ray_hit_tile == 2)
    dungeon[ray_hit_z][ray_hit_x] = 0;
\`\`\`

**Did It Work?** Face the brown door squarely and press E -- it opens. Look away from the door and press E -- nothing happens.

## Step 4: Show Interaction Prompt

In the HUD, after the \`Looking at:\` line, add:

\`\`\`cpp
if (ray_hit_tile == 2)
    DrawText("[E] Open", 10, 115, 16, WHITE);
\`\`\`

## Step 5: Add Cout

Add to the cout block before the game loop:

\`\`\`cpp
cout << "Interact: raycast" << endl;
\`\`\`

**Expected Output:**
\`\`\`
Player: (10, 1, 10)
Goal: 3 items
Ray: DDA
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
// TODO 1: Add ray_hit_x = 0, ray_hit_z = 0;

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
    // TODO 2: cout << "Interact: raycast" << endl;

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

        // TODO 3: Replace this proximity E-key with raycast-based interaction
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
                // TODO 4: Also record ray_hit_x = gx2, ray_hit_z = gz2 on hit
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
        // TODO 5: Show [E] Open prompt when ray_hit_tile == 2
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
        if (ray_hit_tile == 2)
            DrawText("[E] Open", 10, 115, 16, WHITE);
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
      { id: "g2", description: "Prints ray type", expectedOutput: "Ray: DDA" },
      { id: "g3", description: "Prints interaction type", expectedOutput: "Interact: raycast" },
    ],
    hints: [
      "Add int ray_hit_x=0, ray_hit_z=0 at file scope alongside ray_hit_tile. In the raycast block, when hit_tile>0, also set ray_hit_x=gx2 and ray_hit_z=gz2 before breaking.",
      "Replace the proximity E-key block with: if (IsKeyPressed(KEY_E) && ray_hit_tile==2) dungeon[ray_hit_z][ray_hit_x]=0;",
      "Add prompt: if (ray_hit_tile==2) DrawText(\"[E] Open\", 10, 115, 16, WHITE); And add cout << \"Interact: raycast\" << endl;",
    ],
    estimatedMinutes: 20,
  },
};
