import type { Lesson } from "@/types/lesson";

export const lessonCrawler11: Lesson = {
  id: "crawler-11-god-object-refactor",
  title: "God Object Refactor",
  description: "Scattered global variables (player position, yaw, pitch, item arrays, score, game state) form a god object. Refactor mutable state into a single Dungeon struct while keeping constants and the map array global. This is the first architectural refactor of the dungeon crawler.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["god object", "struct refactor", "data grouping", "mutable vs immutable state", "single source of truth"],
  part1: {
    title: "Concept: The God Object Problem",
    type: "concept",
    instructions: `# The God Object Problem

## Mental Model

Right now your dungeon has 10+ mutable globals scattered at file scope: player_x, player_y, player_z, player_yaw, player_pitch, item_x[], item_z[], item_active[], score, game_state. This is a god object -- a single implicit blob of state with no boundary. Every function can touch everything. When you add enemies, lights, and save/load, this becomes unmanageable.

## What Breaks Without This

Without grouping mutable state, adding save/load means serializing 10+ independent globals. Adding a second player means duplicating every variable. Resetting the game means manually zeroing each one. A struct makes all mutable state explicit, copyable, and resetable in one assignment.

## The Fix: Dungeon Struct

\`\`\`cpp
struct Dungeon {
    float player_x, player_y, player_z;
    float player_yaw, player_pitch;
    float item_x[3], item_z[3];
    bool item_active[3];
    int score;
    int game_state;
};

Dungeon dg = {
    10.0f, 1.0f, 10.0f,  // player position
    0.0f, 0.0f,           // yaw, pitch
    {10.0f, 46.0f, 30.0f}, {14.0f, 14.0f, 46.0f},  // items
    {true, true, true},
    0, 0                   // score, game_state
};
\`\`\`

## What Stays Global

- **Constants:** SCREEN_W, SCREEN_H, MAP_W, MAP_H, CELL, MOUSE_SENSITIVITY, MOVE_SPEED, PLAYER_RADIUS, MM_SIZE, NUM_ITEMS
- **The map array:** dungeon[][] -- it describes the level layout, not runtime state
- **Camera3D camera** -- raylib owns this struct, we just set its fields each frame

Constants never change. The map changes rarely (doors). The camera is derived from player state. Only the Dungeon struct holds state that changes every frame.

## Key Concepts

- **God object:** scattered globals that act as one implicit blob of state
- **Struct grouping:** move related mutable state into a single struct
- **Mutable vs immutable:** constants and layout stay global; runtime state moves into the struct
- **Single source of truth:** one Dungeon instance holds all game state
- **Copy semantics:** \`Dungeon saved = dg;\` snapshots the entire game state for save/load

## Beginner Trap

**Moving constants into the struct.** SCREEN_W, MAP_W, CELL, NUM_ITEMS never change at runtime. Putting them in the struct wastes memory and makes it unclear what is mutable. Only runtime-changing values belong in the struct.

## Elite Insight

Wolfenstein 3D had a \`gametype\` struct holding all mutable state: player position, angle, health, ammo, keys, score, level number. Constants like screen dimensions and texture tables were separate globals. Doom did the same with \`player_t\`. Quake used \`client_state_t\`. Every id Tech engine groups mutable state into a single struct. You are following the exact same pattern.

## Systems Thinking Connection

The RPG path introduced this same refactor: scattered globals into a World struct. The platformer did it with GameState. The pattern is universal -- group mutable state, keep constants separate, and every system reads from one struct.

## Mastery Check

Why does dungeon[][] stay global instead of going into the struct? Because it describes the level layout -- it rarely changes (only when a door opens). It is 256 ints (16x16). Copying the entire map every time you snapshot game state for save/load is wasteful. Keep level data separate from runtime state.

## Your Task

Create a Dungeon struct, initialize it, and print the state from the struct.

Expected output:
\`\`\`
Player: (10, 1, 10)
Score: 0
State: playing
Struct: Dungeon
\`\`\``,
    starterCode: `
#include <iostream>
using namespace std;

int main() {
    // These are scattered globals -- the god object problem
    float player_x = 10.0f;
    float player_y = 1.0f;
    float player_z = 10.0f;
    float player_yaw = 0.0f;
    float player_pitch = 0.0f;
    int score = 0;
    int game_state = 0;

    cout << "Player: (10, 1, 10)" << endl;
    cout << "Score: " << score << endl;
    cout << "State: playing" << endl;

    // TODO: Create a struct Dungeon with player_x/y/z, player_yaw,
    //       player_pitch, score, game_state. Initialize a Dungeon dg.
    //       Print "Struct: Dungeon" to prove the struct exists.

    return 0;
}
`,
    solutionCode: `
#include <iostream>
using namespace std;

struct Dungeon {
    float player_x, player_y, player_z;
    float player_yaw, player_pitch;
    int score;
    int game_state;
};

int main() {
    Dungeon dg = {10.0f, 1.0f, 10.0f, 0.0f, 0.0f, 0, 0};

    cout << "Player: (10, 1, 10)" << endl;
    cout << "Score: " << dg.score << endl;
    cout << "State: playing" << endl;
    cout << "Struct: Dungeon" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "t2", description: "Prints score", expectedOutput: "Score: 0" },
      { id: "t3", description: "Prints game state", expectedOutput: "State: playing" },
      { id: "t4", description: "Confirms struct exists", expectedOutput: "Struct: Dungeon" },
    ],
    hints: [
      "Define a struct Dungeon { float player_x, player_y, player_z; float player_yaw, player_pitch; int score; int game_state; }; before main().",
      "Initialize with: Dungeon dg = {10.0f, 1.0f, 10.0f, 0.0f, 0.0f, 0, 0}; Then use dg.score instead of score.",
      "Add cout << \"Struct: Dungeon\" << endl; at the end to confirm the struct is working.",
    ],
    estimatedMinutes: 15,
  },
  part2: {
    title: "Build: Dungeon Struct Refactor",
    type: "game_builder",
    instructions: `# God Object Refactor

## Goal

Refactor your dungeon crawler to move all mutable game state into a single \`struct Dungeon\`. Constants, the map array, and the Camera3D stay global. Every reference to player_x becomes dg.player_x, every reference to score becomes dg.score, etc.

## What You Already Have

From Lesson 10, your dungeon has:
- 3D walls, floor, ceiling
- WASD movement + mouse look
- Wall collision with door blocking
- E-key door interaction
- 3 collectible items with proximity pickup
- Score counter, minimap, crosshair
- Win condition + YOU WIN overlay

## Step 1: Define the Dungeon Struct

After the constants and before the dungeon[][] array, add:

\`\`\`cpp
struct Dungeon {
    float player_x, player_y, player_z;
    float player_yaw, player_pitch;
    float item_x[3], item_z[3];
    bool item_active[3];
    int score;
    int game_state;
};
\`\`\`

## Step 2: Replace Globals with Struct Instance

Remove the old scattered globals (player_x, player_y, player_z, player_yaw, player_pitch, item_x[], item_z[], item_active[], score, game_state) and replace them with:

\`\`\`cpp
Dungeon dg = {
    10.0f, 1.0f, 10.0f,
    0.0f, 0.0f,
    {10.0f, 46.0f, 30.0f}, {14.0f, 14.0f, 46.0f},
    {true, true, true},
    0, 0
};
\`\`\`

## Step 3: Prefix All Mutable State with dg.

Every occurrence of \`player_x\` becomes \`dg.player_x\`. Every \`score\` becomes \`dg.score\`. Every \`item_active[i]\` becomes \`dg.item_active[i]\`. This is a mechanical find-and-replace.

**Constants that do NOT change:** SCREEN_W, SCREEN_H, MAP_W, MAP_H, CELL, MOUSE_SENSITIVITY, MOVE_SPEED, PLAYER_RADIUS, MM_SIZE, NUM_ITEMS, dungeon[][], camera.

## Step 4: Add Struct Confirmation Cout

After the existing cout lines, add:

\`\`\`cpp
cout << "Struct: Dungeon" << endl;
\`\`\`

**Click Run.** The dungeon should look and play exactly the same. The refactor changes architecture, not behavior.

## Expected Output
\`\`\`
Player: (10, 1, 10)
Items: 3
Score: 0
Goal: 3 items
Struct: Dungeon
\`\`\``,
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

// TODO 1: Replace these scattered globals with a struct Dungeon { ... }; Dungeon dg = { ... };
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
    cout << "Items: " << NUM_ITEMS << endl;
    cout << "Score: " << score << endl;
    cout << "Goal: 3 items" << endl;
    // TODO 2: Add cout << "Struct: Dungeon" << endl;

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
        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);
        DrawText(TextFormat("Score: %d / %d", score, NUM_ITEMS), 10, 70, 20, GOLD);
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
const float MOUSE_SENSITIVITY = 0.003f;
const float MOVE_SPEED = 0.1f;
const float PLAYER_RADIUS = 0.2f;
const int MM_SIZE = 6;
const int NUM_ITEMS = 3;

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

struct Dungeon {
    float player_x, player_y, player_z;
    float player_yaw, player_pitch;
    float item_x[3], item_z[3];
    bool item_active[3];
    int score;
    int game_state;
};

Dungeon dg = {
    10.0f, 1.0f, 10.0f,
    0.0f, 0.0f,
    {10.0f, 46.0f, 30.0f}, {14.0f, 14.0f, 46.0f},
    {true, true, true},
    0, 0
};

Camera3D camera = {0};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Dungeon");
    SetTargetFPS(60);
    DisableCursor();

    camera.position = (Vector3){dg.player_x, dg.player_y, dg.player_z};
    camera.target = (Vector3){
        dg.player_x + cosf(dg.player_yaw) * cosf(dg.player_pitch),
        dg.player_y + sinf(dg.player_pitch),
        dg.player_z + sinf(dg.player_yaw) * cosf(dg.player_pitch)
    };
    camera.up = (Vector3){0.0f, 1.0f, 0.0f};
    camera.fovy = 70.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    int door_count = 0;
    for (int z = 0; z < MAP_H; z++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[z][x] == 2) door_count++;

    cout << "Player: (10, 1, 10)" << endl;
    cout << "Items: " << NUM_ITEMS << endl;
    cout << "Score: " << dg.score << endl;
    cout << "Goal: 3 items" << endl;
    cout << "Struct: Dungeon" << endl;

    while (!WindowShouldClose()) {
        Vector2 delta = GetMouseDelta();
        dg.player_yaw -= delta.x * MOUSE_SENSITIVITY;
        dg.player_pitch -= delta.y * MOUSE_SENSITIVITY;
        if (dg.player_pitch > 1.5f) dg.player_pitch = 1.5f;
        if (dg.player_pitch < -1.5f) dg.player_pitch = -1.5f;

        float forward_x = cosf(dg.player_yaw);
        float forward_z = sinf(dg.player_yaw);
        float right_x = -sinf(dg.player_yaw);
        float right_z = cosf(dg.player_yaw);

        float move_x = 0.0f, move_z = 0.0f;
        if (IsKeyDown(KEY_W)) { move_x += forward_x * MOVE_SPEED; move_z += forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_S)) { move_x -= forward_x * MOVE_SPEED; move_z -= forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_A)) { move_x -= right_x * MOVE_SPEED;   move_z -= right_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_D)) { move_x += right_x * MOVE_SPEED;   move_z += right_z * MOVE_SPEED; }

        float new_x = dg.player_x + move_x;
        float new_z = dg.player_z + move_z;

        if (dungeon[(int)(dg.player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(dg.player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 2 ||
            dungeon[(int)(dg.player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 1 ||
            dungeon[(int)(dg.player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 2)
            new_x = dg.player_x;
        if (dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z+PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 1 ||
            dungeon[(int)((new_z-PLAYER_RADIUS)/CELL)][(int)(new_x/CELL)] == 2)
            new_z = dg.player_z;

        dg.player_x = new_x;
        dg.player_z = new_z;

        if (IsKeyPressed(KEY_E)) {
            float cx = dg.player_x + cosf(dg.player_yaw) * CELL * 0.7f;
            float cz = dg.player_z + sinf(dg.player_yaw) * CELL * 0.7f;
            int dx = (int)(cx / CELL);
            int dz = (int)(cz / CELL);
            if (dx >= 0 && dx < MAP_W && dz >= 0 && dz < MAP_H)
                if (dungeon[dz][dx] == 2) dungeon[dz][dx] = 0;
        }

        for (int i = 0; i < NUM_ITEMS; i++) {
            if (!dg.item_active[i]) continue;
            float dx = dg.player_x - dg.item_x[i];
            float dz = dg.player_z - dg.item_z[i];
            float dist = sqrtf(dx*dx + dz*dz);
            if (dist < CELL * 0.5f) {
                dg.item_active[i] = false;
                dg.score++;
            }
        }
        if (dg.score >= NUM_ITEMS) dg.game_state = 1;

        int gx = (int)(dg.player_x / CELL);
        int gz = (int)(dg.player_z / CELL);
        const char* room_name = "Corridor";
        if (gx >= 1 && gx <= 6 && gz >= 1 && gz <= 6) room_name = "Room A";
        else if (gx >= 9 && gx <= 14 && gz >= 1 && gz <= 6) room_name = "Room B";
        else if (gx >= 4 && gx <= 11 && gz >= 9 && gz <= 14) room_name = "Room C";

        camera.target = (Vector3){
            dg.player_x + cosf(dg.player_yaw) * cosf(dg.player_pitch),
            dg.player_y + sinf(dg.player_pitch),
            dg.player_z + sinf(dg.player_yaw) * cosf(dg.player_pitch)
        };
        camera.position = (Vector3){dg.player_x, dg.player_y, dg.player_z};

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
            if (dg.item_active[i])
                DrawCube((Vector3){dg.item_x[i], CELL/4, dg.item_z[i]},
                         CELL/2, CELL/2, CELL/2, GOLD);
        }
        EndMode3D();
        DrawRectangle(SCREEN_W/2-1, SCREEN_H/2-8, 2, 16, (Color){255,255,255,180});
        DrawRectangle(SCREEN_W/2-8, SCREEN_H/2-1, 16, 2, (Color){255,255,255,180});
        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);
        DrawText(TextFormat("Score: %d / %d", dg.score, NUM_ITEMS), 10, 70, 20, GOLD);
        const int MM_X = SCREEN_W - MAP_W * MM_SIZE - 10;
        const int MM_Y = 10;
        for (int mz = 0; mz < MAP_H; mz++) {
            for (int mx = 0; mx < MAP_W; mx++) {
                Color mc = (dungeon[mz][mx] >= 1) ? GRAY : DARKGRAY;
                DrawRectangle(MM_X + mx*MM_SIZE, MM_Y + mz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, mc);
            }
        }
        int px = (int)(dg.player_x / CELL);
        int pz = (int)(dg.player_z / CELL);
        DrawRectangle(MM_X + px*MM_SIZE, MM_Y + pz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, GREEN);
        for (int i = 0; i < NUM_ITEMS; i++) {
            if (dg.item_active[i]) {
                int ix = (int)(dg.item_x[i] / CELL);
                int iz = (int)(dg.item_z[i] / CELL);
                DrawRectangle(MM_X + ix*MM_SIZE + 2, MM_Y + iz*MM_SIZE + 2, 2, 2, GOLD);
            }
        }
        if (dg.game_state == 1) {
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
      { id: "g2", description: "Prints item goal", expectedOutput: "Goal: 3 items" },
      { id: "g3", description: "Confirms struct refactor", expectedOutput: "Struct: Dungeon" },
    ],
    hints: [
      "Define struct Dungeon with player_x/y/z, player_yaw/pitch, item_x[3], item_z[3], item_active[3], score, game_state. Initialize Dungeon dg = { 10.0f, 1.0f, 10.0f, 0.0f, 0.0f, {10.0f,46.0f,30.0f}, {14.0f,14.0f,46.0f}, {true,true,true}, 0, 0 };",
      "Replace every player_x with dg.player_x, every score with dg.score, every item_active[i] with dg.item_active[i]. Constants like CELL, MOVE_SPEED, NUM_ITEMS stay unchanged.",
      "Add cout << \"Struct: Dungeon\" << endl; after the Goal cout line. The game should play identically -- only the code architecture changes.",
    ],
    estimatedMinutes: 25,
  },
};
