import type { Lesson } from "@/types/lesson";

export const lessonCrawler3: Lesson = {
  id: "crawler-03-wasd-walk",
  title: "WASD Walk",
  description: "First-person movement using forward/right vectors derived from yaw angle.",
  order: 3,
  xpReward: 50,
  tier: "free",
  concepts: ["IsKeyDown", "forward vector", "right vector", "frame-rate movement"],
  part1: {
    title: "Concept: Forward and Right Vectors",
    type: "concept",
    instructions: `# WASD Walk

## One Idea

The forward direction comes from yaw. The right direction is forward rotated 90 degrees. WASD maps to combinations of forward and right. Multiply by speed and delta time for smooth movement.

## Forward Vector

From your yaw angle:

\`\`\`cpp
float forward_x = cosf(player_yaw);
float forward_z = sinf(player_yaw);
\`\`\`

At yaw = 0: forward = (1, 0) — the +X direction.

## Right Vector

Right is forward rotated 90° clockwise (when viewed from above):

\`\`\`cpp
float right_x = -sinf(player_yaw);  // or cosf(yaw + PI/2)
float right_z = cosf(player_yaw);   // or sinf(yaw + PI/2)
\`\`\`

At yaw = 0: right = (0, 1) — the +Z direction.

## Movement

W/S move along forward, A/D move along right:

\`\`\`cpp
if (IsKeyDown(KEY_W)) { player_x += forward_x * speed; player_z += forward_z * speed; }
if (IsKeyDown(KEY_S)) { player_x -= forward_x * speed; player_z -= forward_z * speed; }
if (IsKeyDown(KEY_A)) { player_x -= right_x * speed;   player_z -= right_z * speed; }
if (IsKeyDown(KEY_D)) { player_x += right_x * speed;   player_z += right_z * speed; }
\`\`\`

## Your Task

Compute forward and right vectors from yaw = 0, then simulate one W key press. Print the results.`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float player_x = 6.0f;
    float player_y = 1.0f;
    float player_z = 6.0f;

    float player_yaw = 0.0f;  // radians, 0 = facing +X
    float speed = 0.1f;       // movement per frame

    // Forward vector from yaw
    float forward_x = cosf(player_yaw);
    float forward_z = sinf(player_yaw);

    // Right vector (forward rotated 90 degrees)
    float right_x = -sinf(player_yaw);
    float right_z = cosf(player_yaw);

    // Simulate pressing W once: move forward
    player_x += forward_x * speed;
    player_z += forward_z * speed;

    // TODO: Print "Forward: (1, 0)" using (int) casts on forward vector
    // TODO: Print "Right: (0, 1)" using (int) casts on right vector
    // TODO: Print "After W: (6, 1, 6)" using (int) casts on player position
    // TODO: Print "Move: wasd"

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float player_x = 6.0f;
    float player_y = 1.0f;
    float player_z = 6.0f;

    float player_yaw = 0.0f;
    float speed = 0.1f;

    float forward_x = cosf(player_yaw);
    float forward_z = sinf(player_yaw);

    float right_x = -sinf(player_yaw);
    float right_z = cosf(player_yaw);

    player_x += forward_x * speed;
    player_z += forward_z * speed;

    cout << "Forward: (" << (int)forward_x << ", " << (int)forward_z << ")" << endl;
    cout << "Right: (" << (int)right_x << ", " << (int)right_z << ")" << endl;
    cout << "After W: (" << (int)player_x << ", " << (int)player_y << ", " << (int)player_z << ")" << endl;
    cout << "Move: wasd" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints forward vector", expectedOutput: "Forward: (1, 0)" },
      { id: "t2", description: "Prints right vector", expectedOutput: "Right: (0, 1)" },
      { id: "t3", description: "Prints position after W", expectedOutput: "After W: (6, 1, 6)" },
      { id: "t4", description: "Prints move mode", expectedOutput: "Move: wasd" },
    ],
    hints: [
      "cosf(0) = 1.0, sinf(0) = 0.0. Forward = (1, 0). Right = (-sin(0), cos(0)) = (0, 1).",
      "After W: player_x = 6.0 + 1.0*0.1 = 6.1. (int)6.1 = 6. player_z = 6.0 + 0.0*0.1 = 6.0. (int)6.0 = 6.",
      "Print four lines: Forward vector (2 values), Right vector (2 values), position (3 values), literal string.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: WASD Movement",
    type: "game_builder",
    instructions: `# Build: WASD Movement

## What You'll Build

Walk through the dungeon with WASD keys. W moves forward (the direction you're looking), S moves backward, A strafes left, D strafes right.

## Already Done For You

- L2 mouse look (yaw/pitch, DisableCursor, GetMouseDelta)
- Dungeon rendering (walls + floor)
- Camera updates each frame

## What's New

- \`MOVE_SPEED\` constant controls walk speed
- Forward and right vectors computed from \`player_yaw\` each frame
- \`IsKeyDown()\` checks WASD keys every frame

## Your TODOs

1. Add \`MOVE_SPEED\` constant (0.1f) at file scope
2. Update cout: player position, move mode
3. In the game loop (after mouse look): compute forward and right vectors from yaw
4. Check WASD keys with \`IsKeyDown()\` and update \`player_x\`/\`player_z\``,
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

// TODO: Add MOVE_SPEED constant (float, 0.1f)

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
    // TODO: Print "Move: wasd"
    cout << "Look: mouse" << endl;

    while (!WindowShouldClose()) {
        Vector2 delta = GetMouseDelta();
        player_yaw -= delta.x * MOUSE_SENSITIVITY;
        player_pitch -= delta.y * MOUSE_SENSITIVITY;
        if (player_pitch > 1.5f) player_pitch = 1.5f;
        if (player_pitch < -1.5f) player_pitch = -1.5f;

        // TODO: Compute forward vector from yaw:
        //       float forward_x = cosf(player_yaw);
        //       float forward_z = sinf(player_yaw);
        // TODO: Compute right vector from yaw:
        //       float right_x = -sinf(player_yaw);
        //       float right_z = cosf(player_yaw);
        // TODO: WASD movement:
        //       W: player_x += forward_x * MOVE_SPEED; player_z += forward_z * MOVE_SPEED;
        //       S: player_x -= forward_x * MOVE_SPEED; player_z -= forward_z * MOVE_SPEED;
        //       A: player_x -= right_x * MOVE_SPEED;   player_z -= right_z * MOVE_SPEED;
        //       D: player_x += right_x * MOVE_SPEED;   player_z += right_z * MOVE_SPEED;

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
    cout << "Look: mouse" << endl;

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

        if (IsKeyDown(KEY_W)) { player_x += forward_x * MOVE_SPEED; player_z += forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_S)) { player_x -= forward_x * MOVE_SPEED; player_z -= forward_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_A)) { player_x -= right_x * MOVE_SPEED;   player_z -= right_z * MOVE_SPEED; }
        if (IsKeyDown(KEY_D)) { player_x += right_x * MOVE_SPEED;   player_z += right_z * MOVE_SPEED; }

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
      { id: "g3", description: "Prints look mode", expectedOutput: "Look: mouse" },
    ],
    hints: [
      "Add one constant before Camera3D: const float MOVE_SPEED = 0.1f;",
      "Forward from yaw: cosf(yaw), sinf(yaw). Right is perpendicular: -sinf(yaw), cosf(yaw).",
      "IsKeyDown(KEY_W) returns true while held. W adds forward*speed. S subtracts. A subtracts right. D adds right.",
    ],
    estimatedMinutes: 10,
  },
};
