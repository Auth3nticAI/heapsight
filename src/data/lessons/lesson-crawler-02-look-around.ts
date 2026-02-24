import type { Lesson } from "@/types/lesson";

export const lessonCrawler2: Lesson = {
  id: "crawler-02-look-around",
  title: "Look Around",
  description: "FPS-style mouse look with yaw/pitch and trigonometry for camera direction.",
  order: 2,
  xpReward: 50,
  tier: "free",
  concepts: ["yaw/pitch", "sin/cos", "GetMouseDelta", "DisableCursor"],
  part1: {
    title: "Concept: Yaw, Pitch, and Trig",
    type: "concept",
    instructions: `# Look Around

## One Idea

Mouse delta changes yaw/pitch. Sine and cosine convert angles into direction vectors. That direction vector becomes the camera target.

## Yaw and Pitch

**Yaw** is rotation around the Y-axis (horizontal turning). When yaw = 0, you face +X. When yaw = pi/2, you face +Z.

**Pitch** is tilt up/down. Positive pitch looks up, negative looks down.

The **forward direction** from yaw:

\`\`\`cpp
float forward_x = cosf(player_yaw);
float forward_z = sinf(player_yaw);
\`\`\`

The camera target = position + forward:

\`\`\`cpp
float target_x = player_x + cosf(player_yaw);
float target_z = player_z + sinf(player_yaw);
\`\`\`

At yaw = 0: \`cosf(0) = 1\`, \`sinf(0) = 0\`. Forward is (+1, 0) -- the +X direction.

## Your Task

Compute the forward direction and target position from yaw = 0. Print the results.

## Beginner Trap
**Not clamping pitch.** Without a clamp, the camera can flip upside down when pitch exceeds 89 degrees. The view matrix degenerates at exactly 90 degrees (gimbal lock). Clamp pitch to [-89, 89] to prevent the flip.

## Elite Insight
Quake was the first major game to implement true 6DOF mouse look. Carmack used Euler angles with a pitch clamp — the same approach you are implementing. Modern engines use quaternions for full rotation, but Euler angles with clamping work perfectly for FPS cameras.

## Systems Thinking Connection
The Platformer does not need mouse look, but the RPG could add it for a real-time mode. Camera control is a fundamental 3D skill that transfers directly to any game with a movable viewpoint, including third-person cameras.`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    float player_x = 6.0f;
    float player_y = 1.0f;
    float player_z = 6.0f;

    float player_yaw = 0.0f;  // radians, 0 = looking +X

    // Forward direction from yaw
    float forward_x = cosf(player_yaw);
    float forward_z = sinf(player_yaw);

    // Camera target = player position + forward
    float target_x = player_x + forward_x;
    float target_y = player_y;
    float target_z = player_z + forward_z;

    // TODO: Print "Player: (6, 1, 6)" using (int) casts on player position
    // TODO: Print "Forward: (1, 0)" using (int) casts on forward_x, forward_z
    // TODO: Print "Target: (7, 1, 6)" using (int) casts on target values
    // TODO: Print "Look: mouse"

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

    float forward_x = cosf(player_yaw);
    float forward_z = sinf(player_yaw);

    float target_x = player_x + forward_x;
    float target_y = player_y;
    float target_z = player_z + forward_z;

    cout << "Player: (" << (int)player_x << ", " << (int)player_y << ", " << (int)player_z << ")" << endl;
    cout << "Forward: (" << (int)forward_x << ", " << (int)forward_z << ")" << endl;
    cout << "Target: (" << (int)target_x << ", " << (int)target_y << ", " << (int)target_z << ")" << endl;
    cout << "Look: mouse" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints player position", expectedOutput: "Player: (6, 1, 6)" },
      { id: "t2", description: "Prints forward vector", expectedOutput: "Forward: (1, 0)" },
      { id: "t3", description: "Prints camera target", expectedOutput: "Target: (7, 1, 6)" },
      { id: "t4", description: "Prints look mode", expectedOutput: "Look: mouse" },
    ],
    hints: [
      "cosf(0) = 1.0, sinf(0) = 0.0. Cast to int: (int)1.0 = 1, (int)0.0 = 0.",
      "Target = position + forward. target_x = 6.0 + 1.0 = 7.0. (int)7.0 = 7.",
      "Print forward as two values: cout << (int)forward_x << ... << (int)forward_z. Last line is literal.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Mouse Look",
    type: "game_builder",
    instructions: `# Build: Mouse Look

## What You'll Build

FPS-style mouse look. Move the mouse to look around the dungeon. The camera follows your yaw (left/right) and pitch (up/down).

## Already Done For You

- L1 dungeon with walls and floor
- Camera setup and rendering loop

## What's New

- \`player_yaw\` and \`player_pitch\` track your heading and tilt
- \`DisableCursor()\` captures the mouse for FPS control
- \`GetMouseDelta()\` returns how far the mouse moved each frame

## Your TODOs

1. Add \`player_yaw\`, \`player_pitch\`, and \`MOUSE_SENSITIVITY\` at file scope
2. Call \`DisableCursor()\` after window setup
3. Update cout lines: player position, yaw value, look mode
4. In the game loop: read mouse delta, update yaw/pitch, clamp pitch to [-1.5, 1.5], compute \`camera.target\` from trig`,
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

// TODO: Add player_yaw (float, initially 0.0f)
// TODO: Add player_pitch (float, initially 0.0f)
// TODO: Add MOUSE_SENSITIVITY constant (float, 0.003f)

Camera3D camera = {0};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Dungeon");
    SetTargetFPS(60);
    // TODO: Call DisableCursor()

    camera.position = (Vector3){player_x, player_y, player_z};
    camera.target = (Vector3){player_x + 1.0f, player_y, player_z};
    camera.up = (Vector3){0.0f, 1.0f, 0.0f};
    camera.fovy = 70.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    cout << "Player: (6, 1, 6)" << endl;
    // TODO: Print "Yaw: 0.00"
    // TODO: Print "Look: mouse"

    while (!WindowShouldClose()) {
        // TODO: Get mouse delta: Vector2 delta = GetMouseDelta()
        // TODO: Update yaw: player_yaw -= delta.x * MOUSE_SENSITIVITY
        // TODO: Update pitch: player_pitch -= delta.y * MOUSE_SENSITIVITY
        // TODO: Clamp pitch: if > 1.5f set to 1.5f, if < -1.5f set to -1.5f
        // TODO: Update camera.target using trig:
        //       x = player_x + cosf(player_yaw) * cosf(player_pitch)
        //       y = player_y + sinf(player_pitch)
        //       z = player_z + sinf(player_yaw) * cosf(player_pitch)
        // TODO: Update camera.position to (player_x, player_y, player_z)

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
    cout << "Yaw: 0.00" << endl;
    cout << "Look: mouse" << endl;

    while (!WindowShouldClose()) {
        Vector2 delta = GetMouseDelta();
        player_yaw -= delta.x * MOUSE_SENSITIVITY;
        player_pitch -= delta.y * MOUSE_SENSITIVITY;
        if (player_pitch > 1.5f) player_pitch = 1.5f;
        if (player_pitch < -1.5f) player_pitch = -1.5f;

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
      { id: "g2", description: "Prints initial yaw", expectedOutput: "Yaw: 0.00" },
      { id: "g3", description: "Prints look mode", expectedOutput: "Look: mouse" },
    ],
    hints: [
      "Add three variables at file scope before Camera3D: float player_yaw = 0.0f; float player_pitch = 0.0f; const float MOUSE_SENSITIVITY = 0.003f;",
      "GetMouseDelta() returns Vector2. Subtract delta.x * MOUSE_SENSITIVITY from yaw (negative = natural mouse direction).",
      "camera.target uses 3D trig: x = pos + cos(yaw)*cos(pitch), y = pos + sin(pitch), z = pos + sin(yaw)*cos(pitch).",
    ],
    estimatedMinutes: 10,
  },
};
