import type { Lesson } from "@/types/lesson";

export const lessonCrawler10: Lesson = {
  id: "crawler-10-milestone-explorable-dungeon",
  title: "Milestone: Explorable Dungeon",
  description: "Capstone lesson integrating all Phase 1 features: 3D rendering, floor/ceiling, minimap, door mechanics, item pickup, score, win condition, and crosshair. The dungeon is fully explorable with a clear goal.",
  order: 10,
  xpReward: 100,
  tier: "free",
  concepts: ["game state", "win condition", "milestone integration", "crosshair HUD", "completion overlay"],
  part1: {
    title: "Concept: Game State and Win Condition",
    type: "concept",
    instructions: `# Milestone: Explorable Dungeon

## Mental Model

A game state variable controls what phase the game is in: playing (0), won (1). The transition is triggered by the win condition: score >= NUM_ITEMS. Once in the won state, the game loop keeps running (so the window stays open) but shows a victory overlay instead of updating gameplay. This is the simplest possible finite state machine.

## What Breaks Without This

Without a win state, collecting all items does nothing visible. The player finishes the goal with no feedback. A win overlay makes the completion moment satisfying and signals that the game has a clear objective.

## The Fix: Integer Game State

\`\`\`cpp
int game_state = 0;  // 0=playing, 1=won

// After score++:
if (score >= NUM_ITEMS) game_state = 1;

// In draw loop, before EndDrawing():
if (game_state == 1) {
    DrawRectangle(SCREEN_W/2-120, SCREEN_H/2-30, 240, 60, (Color){0,0,0,200});
    DrawText("YOU WIN!", SCREEN_W/2-80, SCREEN_H/2-15, 40, GOLD);
}
\`\`\`

## Key Concepts

- **Game state integer**: 0=playing, 1=won. Simple and direct.
- **Win condition**: score >= NUM_ITEMS triggers state change
- **Overlay rendering**: draw semi-transparent rectangle + text over 3D scene
- **Keep loop running**: even in won state, the window loop continues so the screen is visible

## Beginner Trap

**Stopping the game loop on win.** If you break out of the while loop on win, the window closes immediately and the player never sees the victory message. Keep the loop running; only gate the gameplay-update code on game_state == 0.

## Elite Insight

This int-based FSM scales directly to full game engines. Wolfenstein 3D had a game state byte: title=0, playing=1, dead=2, level_complete=3. Doom used a gamestate_t enum: GS_LEVEL, GS_INTERMISSION, GS_FINALE, GS_DEMOSCREEN. Your pattern is the correct one -- all professional engines do this.

## Systems Thinking Connection

This milestone combines six independent systems: movement, collision, rendering, minimap, doors, items. Each system was added one lesson at a time. Now they all run together in a single coherent game loop. This is the accumulation model -- complexity emerges from layering independent features, not from designing one huge system.

## Mastery Check

What happens if you check game_state == 0 BEFORE the pickup loop? The player cannot pick up the last item and win because the pickup loop is gated. Always run pickup and state transitions unconditionally, then gate only the movement/input on game_state == 0.

## Your Task

Print the game goal and win condition.

Expected output:
\`\`\`
State: playing
Goal: 3 items
Win: score == 3
\`\`\`
`,
    starterCode: `
#include <iostream>
using namespace std;

int main() {
    int game_state = 0;  // 0=playing, 1=won
    int score = 0;
    int NUM_ITEMS = 3;

    // TODO 1: Print "State: playing"
    // TODO 2: Print "Goal: 3 items"
    // TODO 3: Print "Win: score == 3"
    return 0;
}
`,
    solutionCode: `
#include <iostream>
using namespace std;

int main() {
    int game_state = 0;
    int score = 0;
    int NUM_ITEMS = 3;
    cout << "State: playing" << endl;
    cout << "Goal: 3 items" << endl;
    cout << "Win: score == 3" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints game state", expectedOutput: "State: playing" },
      { id: "t2", description: "Prints the goal", expectedOutput: "Goal: 3 items" },
      { id: "t3", description: "Prints the win condition", expectedOutput: "Win: score == 3" },
    ],
    hints: [
      "Print game_state=0 means playing: cout << \"State: playing\" << endl;",
      "Print the goal: cout << \"Goal: 3 items\" << endl;",
      "Print the win condition: cout << \"Win: score == 3\" << endl;",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Milestone: Full Explorable Dungeon",
    type: "game_builder",
    instructions: `# Milestone: Explorable Dungeon

## Goal

Add three final polish features to complete Phase 1: a crosshair, a win condition, and a victory overlay. Walk through all 3 rooms, open the door, collect all 3 items, and see the YOU WIN message.

## What You Already Have

From previous lessons, your dungeon already has:
- 3D walls, floor, ceiling
- WASD movement + mouse look
- Wall and door collision
- E-key door interaction
- 3 collectible items with proximity pickup
- Score counter in HUD
- Minimap with room detection

## Step 1: Add Game State at File Scope

After \`int score = 0;\`, add:

\`\`\`cpp
int game_state = 0;  // 0=playing, 1=won
\`\`\`

## Step 2: Add Goal Cout Before Game Loop

After the \`cout << \"Score:\"\` line, add:

\`\`\`cpp
cout << "Goal: 3 items" << endl;
\`\`\`

## Step 3: Win Condition After Pickup

After the pickup loop (where score is incremented), add:

\`\`\`cpp
if (score >= NUM_ITEMS) game_state = 1;
\`\`\`

## Step 4: Crosshair

After \`EndMode3D();\` and before the HUD text, add a crosshair:

\`\`\`cpp
DrawRectangle(SCREEN_W/2-1, SCREEN_H/2-8, 2, 16, (Color){255,255,255,180});
DrawRectangle(SCREEN_W/2-8, SCREEN_H/2-1, 16, 2, (Color){255,255,255,180});
\`\`\`

**Did It Work?** A white crosshair appears at the center of the screen.

## Step 5: Victory Overlay

At the very end of the draw block, before \`EndDrawing();\`, add:

\`\`\`cpp
if (game_state == 1) {
    DrawRectangle(SCREEN_W/2-120, SCREEN_H/2-30, 240, 60, (Color){0,0,0,200});
    DrawText("YOU WIN!", SCREEN_W/2-80, SCREEN_H/2-15, 40, GOLD);
}
\`\`\`

**Did It Work?** Collect all 3 gold cubes. A black semi-transparent box with YOU WIN! appears.

## Expected Output
\`\`\`
Player: (10, 1, 10)
Items: 3
Score: 0
Goal: 3 items
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
// TODO 1: Add game_state = 0 here

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
    // TODO 2: cout << "Goal: 3 items" << endl;

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
        // TODO 3: if (score >= NUM_ITEMS) game_state = 1;

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
        // TODO 4: Add crosshair (two DrawRectangle calls at SCREEN_W/2, SCREEN_H/2)
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
        // TODO 5: Draw win overlay if game_state == 1
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
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "Prints item count", expectedOutput: "Items: 3" },
      { id: "g3", description: "Prints the goal", expectedOutput: "Goal: 3 items" },
    ],
    hints: [
      "Add int game_state=0 at file scope after score. Add if (score >= NUM_ITEMS) game_state=1 after the pickup loop.",
      "Add cout << \"Goal: 3 items\" << endl; before the game loop. Add crosshair: two DrawRectangle calls centered at SCREEN_W/2, SCREEN_H/2.",
      "Victory overlay: if (game_state==1) DrawRectangle semi-transparent box then DrawText(\"YOU WIN!\", centered, 40px, GOLD).",
    ],
    estimatedMinutes: 20,
  },
};
