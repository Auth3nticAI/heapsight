import type { Lesson } from "@/types/lesson";

export const lessonCrawler15: Lesson = {
  id: "crawler-15-milestone-puzzle-room",
  title: "Milestone: Puzzle Room",
  description: "Capstone combining push blocks, pressure plates, and event-triggered door unlock. Push the purple block onto the green plate to automatically open the puzzle door. One-shot activation pattern: a boolean flag prevents the trigger from firing more than once.",
  order: 15,
  xpReward: 150,
  tier: "pro",
  concepts: ["event triggers", "one-shot activation", "state machines", "puzzle door", "spatial puzzle capstone"],
  part1: {
    title: "Concept: One-Shot Event Triggers",
    type: "concept",
    instructions: `# Milestone: Puzzle Room

## Mental Model

A pressure plate fires an event when activated. That event should happen ONCE -- not every frame. The pattern: a boolean flag (\`puzzle_solved\`) prevents the trigger from firing again. This is the one-shot activation pattern used in every game engine for doors, cutscenes, and checkpoints.

## What Breaks Without This

Without the flag, every frame the plate is active calls \`dungeon[pdoor_z][pdoor_x] = 0\`. This is harmless once the door is gone (setting 0 to 0 is a no-op), but semantically wrong -- the event should fire exactly once. When you later add sound effects or cutscenes, repeating the trigger every frame causes chaos.

## The Fix: One-Shot Guard

\`\`\`cpp
bool puzzle_solved = false;

// Each frame:
if (!puzzle_solved && plate_is_active) {
    // Fire the event exactly once
    open_the_door();
    puzzle_solved = true;  // Guard: never fire again
}
\`\`\`

## Key Concepts

- **Trigger is a position check**: plate_x/plate_z observe the dungeon grid -- no tile modification
- **Event fires once**: \`puzzle_solved\` boolean prevents repeated activation
- **Door unlock = tile write**: \`dungeon[pdoor_z][pdoor_x] = 0\` removes the door tile
- **State machine**: game_state 0=playing, 1=items win, 2=puzzle solved
- **Spatial puzzle**: player must navigate 3D space to push block onto plate
`,
    starterCode: "",
    solutionCode: `
#include <iostream>
using namespace std;

int main() {
    bool puzzle_solved = false;
    bool plate_active = true;  // simulate: block is on the plate

    if (!puzzle_solved && plate_active) {
        puzzle_solved = true;
    }

    cout << "Blocks: 1" << endl;
    cout << "Plates: 1" << endl;
    cout << "Puzzle: push-plate-door" << endl;
    cout << "Solved: " << (puzzle_solved ? "yes" : "no") << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints block count", expectedOutput: "Blocks: 1" },
      { id: "t2", description: "Prints plate count", expectedOutput: "Plates: 1" },
      { id: "t3", description: "Prints puzzle type", expectedOutput: "Puzzle: push-plate-door" },
    ],
    hints: [
      "Print Blocks: 1 and Plates: 1 with cout. Then print cout << \"Puzzle: push-plate-door\" << endl;",
      "Add bool puzzle_solved=false; Set it to true when plate_active is true and !puzzle_solved.",
      "Print cout << \"Solved: \" << (puzzle_solved ? \"yes\" : \"no\") << endl;",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Puzzle Room Capstone",
    type: "game_builder",
    instructions: `# Milestone: Puzzle Room

## Goal

Complete the spatial puzzle: push the purple block east from col 5 to col 8 in Room C. The plate at (8, 11) activates, automatically unlocking the puzzle door at (12, 8). A "PUZZLE SOLVED!" overlay appears. This is the capstone of Phase 2.

## The Map Change

The dungeon already has a puzzle door at row 8, col 12 (the east corridor passage). It is tile value 2 (same as the E-key door). This second door can only be unlocked by the plate mechanic -- pushing the block onto it.

## Step 1: Add Puzzle Door Variables at File Scope

After the plate arrays, add:

\`\`\`cpp
int pdoor_x = 12, pdoor_z = 8;
bool puzzle_solved = false;
\`\`\`

## Step 2: Print Puzzle Type Before Game Loop

After the Plates cout, add:

\`\`\`cpp
cout << "Puzzle: push-plate-door" << endl;
\`\`\`

## Step 3: Add Plate-to-Door Unlock Logic

In the game loop, after \`if (score >= NUM_ITEMS) game_state = 1;\`, add:

\`\`\`cpp
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
\`\`\`

**Did It Work?** Push the purple block east to col 8 row 11. The plate turns GREEN. The east corridor passage (previously brown door) disappears. You can now walk through!

## Step 4: Show Puzzle State in HUD

After the "Plate: active/empty" DrawText, add:

\`\`\`cpp
DrawText(puzzle_solved ? "Puzzle: solved" : "Puzzle: unsolved",
         10, 155, 16, puzzle_solved ? GREEN : GRAY);
\`\`\`

## Step 5: Add PUZZLE SOLVED Overlay

After the game_state==1 overlay, add:

\`\`\`cpp
if (game_state == 2) {
    DrawRectangle(SCREEN_W/2-160, SCREEN_H/2-40, 320, 80, (Color){0,0,0,200});
    DrawText("PUZZLE SOLVED!", SCREEN_W/2-130, SCREEN_H/2-20, 40, GREEN);
}
\`\`\`

**Expected Output:**
\`\`\`
Player: (10, 1, 10)
Plates: 1
Puzzle: push-plate-door
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
// TODO 1: Add int pdoor_x=12, pdoor_z=8; bool puzzle_solved=false;

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
    // TODO 2: cout << "Puzzle: push-plate-door" << endl;

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
        // TODO 3: if (!puzzle_solved) { check plates; if any_on { dungeon[pdoor_z][pdoor_x]=0; puzzle_solved=true; game_state=2; } }

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
        // TODO 4: DrawText(puzzle_solved ? "Puzzle: solved" : "Puzzle: unsolved", 10, 155, 16, puzzle_solved ? GREEN : GRAY);
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
        // TODO 5: if (game_state == 2) { draw PUZZLE SOLVED overlay }
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
int pdoor_x = 12, pdoor_z = 8;
bool puzzle_solved = false;

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
        DrawText(puzzle_solved ? "Puzzle: solved" : "Puzzle: unsolved",
                 10, 155, 16, puzzle_solved ? GREEN : GRAY);
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
        if (game_state == 2) {
            DrawRectangle(SCREEN_W/2-160, SCREEN_H/2-40, 320, 80, (Color){0,0,0,200});
            DrawText("PUZZLE SOLVED!", SCREEN_W/2-130, SCREEN_H/2-20, 40, GREEN);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "Prints plate count", expectedOutput: "Plates: 1" },
      { id: "g3", description: "Prints puzzle type", expectedOutput: "Puzzle: push-plate-door" },
    ],
    hints: [
      "Add at file scope: int pdoor_x=12, pdoor_z=8; bool puzzle_solved=false; Then add cout << \"Puzzle: push-plate-door\" << endl;",
      "In game loop after score check: if (!puzzle_solved) { bool any_on=false; for plates: if(dungeon[plate_z[i]][plate_x[i]]==3) any_on=true; if(any_on){dungeon[pdoor_z][pdoor_x]=0; puzzle_solved=true; game_state=2;} }",
      "Add puzzle HUD: DrawText(puzzle_solved?\"Puzzle: solved\":\"Puzzle: unsolved\", 10, 155, 16, puzzle_solved?GREEN:GRAY); Add overlay: if(game_state==2){DrawRectangle(...); DrawText(\"PUZZLE SOLVED!\",...GREEN);}",
    ],
    estimatedMinutes: 25,
  },
};
