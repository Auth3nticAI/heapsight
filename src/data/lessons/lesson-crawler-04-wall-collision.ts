import type { Lesson } from "@/types/lesson";

export const lessonCrawler4: Lesson = {
  id: "crawler-04-wall-collision",
  title: "Wall Collision",
  description: "Grid-based AABB collision detection with axis-separated sliding response.",
  order: 4,
  xpReward: 50,
  tier: "free",
  concepts: ["grid collision", "AABB", "sliding response", "axis separation"],
  part1: {
    title: "Concept: Grid-Based Collision",
    type: "concept",
    instructions: `# Wall Collision

## One Idea

Before moving, check whether the destination grid cell is a wall. If it is, cancel movement on that axis. Checking X and Z separately gives you sliding along walls instead of getting stuck.

## Grid Lookup

Convert world position to grid cell:

\`\`\`cpp
int grid_x = (int)(world_x / CELL);
int grid_z = (int)(world_z / CELL);
\`\`\`

Check if the cell is solid:

\`\`\`cpp
bool blocked = (dungeon[grid_z][grid_x] == 1);
\`\`\`

## Axis-Separated Collision

Instead of checking the full (new_x, new_z) at once, check each axis independently:

\`\`\`cpp
float new_x = player_x + move_x;
float new_z = player_z + move_z;

// Check X axis first
if (dungeon[(int)(player_z / CELL)][(int)(new_x / CELL)] == 1) {
    new_x = player_x;  // cancel X movement
}
// Check Z axis second
if (dungeon[(int)(new_z / CELL)][(int)(new_x / CELL)] == 1) {
    new_z = player_z;  // cancel Z movement
}
\`\`\`

This lets you slide along walls — if only X is blocked, you still move in Z.

## Your Task

Test collision logic: try moving into a wall cell and an open cell. Print whether each is blocked.`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const float CELL = 4.0f;
    const int MAP_W = 8;
    const int MAP_H = 8;

    int dungeon[MAP_H][MAP_W] = {
        {1,1,1,1,1,1,1,1},
        {1,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,1},
        {1,0,0,1,1,0,0,1},
        {1,0,0,1,0,0,0,1},
        {1,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,1},
        {1,1,1,1,1,1,1,1},
    };

    // Player at (6, 1, 6) = grid cell (1, 1) -- open
    float player_x = 6.0f;
    float player_z = 6.0f;

    int gx = (int)(player_x / CELL);
    int gz = (int)(player_z / CELL);

    // Test 1: Current cell
    bool current_blocked = (dungeon[gz][gx] == 1);

    // Test 2: Try moving to world (2, 6) = grid cell (0, 1) -- wall
    float test_x = 2.0f;
    float test_z = 6.0f;
    int tgx = (int)(test_x / CELL);
    int tgz = (int)(test_z / CELL);
    bool wall_blocked = (dungeon[tgz][tgx] == 1);

    // TODO: Print "Cell (1, 1): open" (use gx, gz, and "open" if not blocked, "wall" if blocked)
    // TODO: Print "Cell (0, 1): wall" (use tgx, tgz)
    // TODO: Print "Slide: enabled"
    // TODO: Print "Collision: grid"

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const float CELL = 4.0f;
    const int MAP_W = 8;
    const int MAP_H = 8;

    int dungeon[MAP_H][MAP_W] = {
        {1,1,1,1,1,1,1,1},
        {1,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,1},
        {1,0,0,1,1,0,0,1},
        {1,0,0,1,0,0,0,1},
        {1,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,1},
        {1,1,1,1,1,1,1,1},
    };

    float player_x = 6.0f;
    float player_z = 6.0f;

    int gx = (int)(player_x / CELL);
    int gz = (int)(player_z / CELL);
    bool current_blocked = (dungeon[gz][gx] == 1);

    float test_x = 2.0f;
    float test_z = 6.0f;
    int tgx = (int)(test_x / CELL);
    int tgz = (int)(test_z / CELL);
    bool wall_blocked = (dungeon[tgz][tgx] == 1);

    cout << "Cell (" << gx << ", " << gz << "): " << (current_blocked ? "wall" : "open") << endl;
    cout << "Cell (" << tgx << ", " << tgz << "): " << (wall_blocked ? "wall" : "open") << endl;
    cout << "Slide: enabled" << endl;
    cout << "Collision: grid" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Current cell is open", expectedOutput: "Cell (1, 1): open" },
      { id: "t2", description: "Wall cell detected", expectedOutput: "Cell (0, 1): wall" },
      { id: "t3", description: "Sliding enabled", expectedOutput: "Slide: enabled" },
      { id: "t4", description: "Collision mode", expectedOutput: "Collision: grid" },
    ],
    hints: [
      "Grid cell = (int)(world_pos / CELL). Player at 6.0 / 4.0 = 1.5, (int)1.5 = 1.",
      "dungeon[gz][gx] == 1 means wall. Use ternary: blocked ? 'wall' : 'open'.",
      "Test position 2.0 / 4.0 = 0.5, (int)0.5 = 0. dungeon[1][0] = 1, so it's a wall.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Wall Collision",
    type: "game_builder",
    instructions: `# Build: Wall Collision

## What You'll Build

Solid walls you can't walk through. When you move into a wall, movement on that axis is cancelled. You slide along walls instead of getting stuck.

## Already Done For You

- L3 WASD movement + mouse look
- Dungeon rendering with walls and floor

## What's New

- Grid-based collision: check \`dungeon[gz][gx]\` before moving
- Axis-separated sliding: check X and Z independently
- Player radius: use a small margin (0.2f) to prevent clipping

## Your TODOs

1. Add a \`PLAYER_RADIUS\` constant (0.2f) at file scope
2. Update cout: player position, collision mode
3. After computing WASD movement, apply axis-separated collision:
   - Compute \`new_x\` and \`new_z\` from movement
   - Check X axis: if grid cell at (new_x +/- radius, player_z) is wall, cancel X
   - Check Z axis: if grid cell at (new_x, new_z +/- radius) is wall, cancel Z
   - Apply final position`,
    starterCode: `#include <iostream>
#include <cmath>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 600;
const int MAP_W = 8;
const int MAP_H = 8;
const float CELL = 4.0f;

int dungeon[MAP_H][MAP_W] = {
    {1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1},
    {1,0,0,1,1,0,0,1},
    {1,0,0,1,0,0,0,1},
    {1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1},
};

float player_x = 6.0f;
float player_y = 1.0f;
float player_z = 6.0f;
float player_yaw = 0.0f;
float player_pitch = 0.0f;
const float MOUSE_SENSITIVITY = 0.003f;
const float MOVE_SPEED = 0.1f;

// TODO: Add PLAYER_RADIUS constant (float, 0.2f)

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

    cout << "Player: (6, 1, 6)" << endl;
    cout << "Move: wasd" << endl;
    // TODO: Print "Collision: grid"

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

        // TODO: Axis-separated collision
        //   float new_x = player_x + move_x;
        //   float new_z = player_z + move_z;
        //
        //   Check X: test grid cells at (new_x + PLAYER_RADIUS) and (new_x - PLAYER_RADIUS)
        //   if (dungeon[(int)(player_z / CELL)][(int)((new_x + PLAYER_RADIUS) / CELL)] == 1 ||
        //       dungeon[(int)(player_z / CELL)][(int)((new_x - PLAYER_RADIUS) / CELL)] == 1) {
        //       new_x = player_x;
        //   }
        //
        //   Check Z: test grid cells at (new_z + PLAYER_RADIUS) and (new_z - PLAYER_RADIUS)
        //   if (dungeon[(int)((new_z + PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1 ||
        //       dungeon[(int)((new_z - PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1) {
        //       new_z = player_z;
        //   }
        //
        //   player_x = new_x;
        //   player_z = new_z;

        // REMOVE THESE TWO LINES after adding collision above:
        player_x += move_x;
        player_z += move_z;

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
const int MAP_W = 8;
const int MAP_H = 8;
const float CELL = 4.0f;

int dungeon[MAP_H][MAP_W] = {
    {1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1},
    {1,0,0,1,1,0,0,1},
    {1,0,0,1,0,0,0,1},
    {1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1},
};

float player_x = 6.0f;
float player_y = 1.0f;
float player_z = 6.0f;
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

    cout << "Player: (6, 1, 6)" << endl;
    cout << "Move: wasd" << endl;
    cout << "Collision: grid" << endl;

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

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (6, 1, 6)" },
      { id: "g2", description: "Prints move mode", expectedOutput: "Move: wasd" },
      { id: "g3", description: "Prints collision mode", expectedOutput: "Collision: grid" },
    ],
    hints: [
      "Add one constant: const float PLAYER_RADIUS = 0.2f; This prevents clipping through wall edges.",
      "Check X first: test both +RADIUS and -RADIUS sides. If either hits a wall, new_x = player_x (cancel X movement).",
      "Check Z second using the already-resolved new_x. This order gives correct sliding behavior.",
    ],
    estimatedMinutes: 10,
  },
};
