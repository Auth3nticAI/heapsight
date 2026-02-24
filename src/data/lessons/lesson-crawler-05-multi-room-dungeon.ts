import type { Lesson } from "@/types/lesson";

export const lessonCrawler5: Lesson = {
  id: "crawler-05-multi-room-dungeon",
  title: "Multi-Room Dungeon",
  description: "Expanded 16x16 dungeon with three connected rooms and doorway detection.",
  order: 5,
  xpReward: 50,
  tier: "free",
  concepts: ["16x16 grid", "room layout", "doorways", "room detection"],
  part1: {
    title: "Concept: Room Detection",
    type: "concept",
    instructions: `# Multi-Room Dungeon

## One Idea

A larger dungeon has multiple rooms separated by walls with doorway openings. You can detect which room the player is in by checking coordinate ranges.

## 16x16 Layout

The dungeon expands from 8x8 to 16x16. Three rooms connected by doorways:

- **Room A** (top-left): x = 1..6, z = 1..6
- **Room B** (top-right): x = 9..14, z = 1..6
- **Room C** (bottom): x = 4..11, z = 9..14

Doorways connect the rooms through walls at specific positions.

## Room Detection

Check which room the player is in by grid coordinates:

\`\`\`cpp
int gx = (int)(player_x / CELL);
int gz = (int)(player_z / CELL);

if (gx >= 1 && gx <= 6 && gz >= 1 && gz <= 6) room = 'A';
else if (gx >= 9 && gx <= 14 && gz >= 1 && gz <= 6) room = 'B';
else if (gx >= 4 && gx <= 11 && gz >= 9 && gz <= 14) room = 'C';
else room = '?';  // corridor or doorway
\`\`\`

## Your Task

Given the player position, determine the grid cell and which room they're in. Print the results.

## Beginner Trap
**Hardcoding room positions instead of reading them from the grid.** If you later change the grid layout, hardcoded room coordinates break. Detect rooms programmatically by scanning for connected open tiles.

## Elite Insight
Wolfenstein 3D stored its entire level as a 64x64 grid with rooms defined by wall placement. The engine did not know about "rooms" — it just rendered whatever tiles the player could see. Your grid approach follows the same data-driven philosophy.

## Systems Thinking Connection
The RPG uses room arrays with exit tiles for transitions. The Platformer uses level arrays loaded from data. All three approaches treat the world as grid data, not hardcoded geometry — the dimension count changes, but the pattern stays the same.`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const float CELL = 4.0f;
    const int MAP_W = 16;
    const int MAP_H = 16;

    // Player starts in Room A
    float player_x = 10.0f;
    float player_y = 1.0f;
    float player_z = 10.0f;

    int gx = (int)(player_x / CELL);
    int gz = (int)(player_z / CELL);

    // Room detection
    char room = '?';
    if (gx >= 1 && gx <= 6 && gz >= 1 && gz <= 6) room = 'A';
    else if (gx >= 9 && gx <= 14 && gz >= 1 && gz <= 6) room = 'B';
    else if (gx >= 4 && gx <= 11 && gz >= 9 && gz <= 14) room = 'C';

    // TODO: Print "Map: 16x16"
    // TODO: Print "Grid: (2, 2)" using gx, gz
    // TODO: Print "Room: A" using room
    // TODO: Print "Rooms: 3"

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const float CELL = 4.0f;
    const int MAP_W = 16;
    const int MAP_H = 16;

    float player_x = 10.0f;
    float player_y = 1.0f;
    float player_z = 10.0f;

    int gx = (int)(player_x / CELL);
    int gz = (int)(player_z / CELL);

    char room = '?';
    if (gx >= 1 && gx <= 6 && gz >= 1 && gz <= 6) room = 'A';
    else if (gx >= 9 && gx <= 14 && gz >= 1 && gz <= 6) room = 'B';
    else if (gx >= 4 && gx <= 11 && gz >= 9 && gz <= 14) room = 'C';

    cout << "Map: 16x16" << endl;
    cout << "Grid: (" << gx << ", " << gz << ")" << endl;
    cout << "Room: " << room << endl;
    cout << "Rooms: 3" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints map size", expectedOutput: "Map: 16x16" },
      { id: "t2", description: "Prints grid cell", expectedOutput: "Grid: (2, 2)" },
      { id: "t3", description: "Detects Room A", expectedOutput: "Room: A" },
      { id: "t4", description: "Prints room count", expectedOutput: "Rooms: 3" },
    ],
    hints: [
      "player_x = 10.0, CELL = 4.0. gx = (int)(10.0 / 4.0) = (int)(2.5) = 2. Same for gz.",
      "gx=2, gz=2. Check: 1 <= 2 <= 6 and 1 <= 2 <= 6. Yes, that's Room A.",
      "Print room as a char: cout << room outputs 'A'. Last line is literal.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Multi-Room Dungeon",
    type: "game_builder",
    instructions: `# Build: Multi-Room Dungeon

## What You'll Build

A larger 16x16 dungeon with three connected rooms. Walk between rooms through doorways. The HUD shows which room you're in.

## Already Done For You

- L4 movement with wall collision
- Mouse look and camera system

## What's New

- 16x16 grid (expanded from 8x8)
- Three rooms with doorways between them
- Room detection displayed in HUD
- \`DrawText\` shows current room name

## Your TODOs

1. Replace the 8x8 dungeon with the new 16x16 layout (provided in starter code)
2. Update \`MAP_W\` and \`MAP_H\` to 16
3. Update cout: map size, room count
4. In the game loop: detect which room the player is in based on grid coordinates
5. Display the current room name with \`DrawText\``,
    starterCode: `#include <iostream>
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
    {1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1},
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

    cout << "Player: (10, 1, 10)" << endl;
    // TODO: Print "Map: 16x16"
    // TODO: Print "Rooms: 3"

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

        float move_x = 0.0f;
        float move_z = 0.0f;
        if (IsKeyDown(KEY_W)) { move_x += forward_x * MOVE_SPEED; move_z += forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_S)) { move_x -= forward_x * MOVE_SPEED; move_z -= forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_A)) { move_x -= right_x * MOVE_SPEED;   move_z -= right_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_D)) { move_x += right_x * MOVE_SPEED;   move_z += right_z * MOVE_SPEED; }

        float new_x = player_x + move_x;
        float new_z = player_z + move_z;

        if (dungeon[(int)(player_z / CELL)][(int)((new_x + PLAYER_RADIUS) / CELL)] == 1 ||
            dungeon[(int)(player_z / CELL)][(int)((new_x - PLAYER_RADIUS) / CELL)] == 1) {
            new_x = player_x;
        }
        if (dungeon[(int)((new_z + PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1 ||
            dungeon[(int)((new_z - PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1) {
            new_z = player_z;
        }

        player_x = new_x;
        player_z = new_z;

        // TODO: Detect current room from grid coordinates:
        //   int gx = (int)(player_x / CELL);
        //   int gz = (int)(player_z / CELL);
        //   const char* room_name = "Corridor";
        //   if (gx >= 1 && gx <= 6 && gz >= 1 && gz <= 6) room_name = "Room A";
        //   else if (gx >= 9 && gx <= 14 && gz >= 1 && gz <= 6) room_name = "Room B";
        //   else if (gx >= 4 && gx <= 11 && gz >= 9 && gz <= 14) room_name = "Room C";

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
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKGRAY);

        for (int z = 0; z < MAP_H; z++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[z][x] == 1) {
                    DrawCube((Vector3){x*CELL + CELL/2, CELL/2, z*CELL + CELL/2},
                             CELL, CELL, CELL, GRAY);
                }
            }
        }

        EndMode3D();

        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        // TODO: DrawText(room_name, 10, 40, 20, YELLOW);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
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
    {1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1},
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

    cout << "Player: (10, 1, 10)" << endl;
    cout << "Map: 16x16" << endl;
    cout << "Rooms: 3" << endl;

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

        float move_x = 0.0f;
        float move_z = 0.0f;
        if (IsKeyDown(KEY_W)) { move_x += forward_x * MOVE_SPEED; move_z += forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_S)) { move_x -= forward_x * MOVE_SPEED; move_z -= forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_A)) { move_x -= right_x * MOVE_SPEED;   move_z -= right_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_D)) { move_x += right_x * MOVE_SPEED;   move_z += right_z * MOVE_SPEED; }

        float new_x = player_x + move_x;
        float new_z = player_z + move_z;

        if (dungeon[(int)(player_z / CELL)][(int)((new_x + PLAYER_RADIUS) / CELL)] == 1 ||
            dungeon[(int)(player_z / CELL)][(int)((new_x - PLAYER_RADIUS) / CELL)] == 1) {
            new_x = player_x;
        }
        if (dungeon[(int)((new_z + PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1 ||
            dungeon[(int)((new_z - PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1) {
            new_z = player_z;
        }

        player_x = new_x;
        player_z = new_z;

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
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKGRAY);

        for (int z = 0; z < MAP_H; z++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[z][x] == 1) {
                    DrawCube((Vector3){x*CELL + CELL/2, CELL/2, z*CELL + CELL/2},
                             CELL, CELL, CELL, GRAY);
                }
            }
        }

        EndMode3D();

        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "Prints map size", expectedOutput: "Map: 16x16" },
      { id: "g3", description: "Prints room count", expectedOutput: "Rooms: 3" },
    ],
    hints: [
      "The 16x16 dungeon array is provided. Room A is top-left, Room B is top-right, Room C is bottom-center. Doorways are the 0 cells in wall rows.",
      "Room detection: convert player_x/z to grid coords, then check ranges. gx 1-6 + gz 1-6 = Room A. gx 9-14 + gz 1-6 = Room B. gx 4-11 + gz 9-14 = Room C.",
      "DrawText(room_name, 10, 40, 20, YELLOW) shows below the title. room_name is a const char* that updates each frame.",
    ],
    estimatedMinutes: 10,
  },
};
