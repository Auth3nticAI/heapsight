import type { Lesson } from "@/types/lesson";

export const lessonCrawler1: Lesson = {
  id: "crawler-01-boot-dungeon-3d",
  title: "Boot Dungeon 3D",
  description: "First-person view of a dungeon room with Camera3D, DrawCube walls, and DrawPlane floor.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: ["Camera3D", "BeginMode3D", "DrawCube", "DrawPlane", "grid-to-3D"],
  part1: {
    title: "Concept: Camera3D Coordinate System",
    type: "concept",
    instructions: `# Boot Dungeon 3D

## One Idea

Camera3D transforms the world into what you see. Position is where you stand. Target is where you look. Everything between \`BeginMode3D\` and \`EndMode3D\` is projected through that camera onto your screen.

## World vs Grid

Your dungeon is an 8x8 grid. Each cell is \`CELL\` (4.0) world units wide. A world position maps to a grid cell by dividing by cell size:

\`\`\`cpp
int grid_x = (int)(player_x / cell_size);
int grid_z = (int)(player_z / cell_size);
\`\`\`

Player at world (6, 1, 6) with \`cell_size = 4.0\` maps to grid cell (1, 1) -- inside the dungeon walls.

## Camera Setup

The camera needs four things:

- \`position\` -- where you stand: (6, 1, 6)
- \`target\` -- where you look: (7, 1, 6) faces +X, down the corridor
- \`up\` -- which way is up: (0, 1, 0)
- \`fovy\` -- field of view: 70 degrees

## Your Task

Using the provided variables, print the player position, grid cell, camera target, and confirm the camera is ready.`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    // Dungeon parameters
    int map_w = 8;
    int map_h = 8;
    float cell_size = 4.0f;

    // Player position in world space
    float player_x = 6.0f;
    float player_y = 1.0f;
    float player_z = 6.0f;

    // Grid cell the player occupies
    int grid_x = (int)(player_x / cell_size);
    int grid_z = (int)(player_z / cell_size);

    // Camera target: look in +X direction
    float target_x = player_x + 1.0f;
    float target_y = player_y;
    float target_z = player_z;

    // TODO: Print the player's world position as "Player: (x, y, z)" with integer values
    // TODO: Print the grid cell as "Grid cell: (gx, gz)"
    // TODO: Print the camera target as "Target: (x, y, z)" with integer values
    // TODO: Print "Camera: ready"

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    // Dungeon parameters
    int map_w = 8;
    int map_h = 8;
    float cell_size = 4.0f;

    // Player position in world space
    float player_x = 6.0f;
    float player_y = 1.0f;
    float player_z = 6.0f;

    // Grid cell the player occupies
    int grid_x = (int)(player_x / cell_size);
    int grid_z = (int)(player_z / cell_size);

    // Camera target: look in +X direction
    float target_x = player_x + 1.0f;
    float target_y = player_y;
    float target_z = player_z;

    cout << "Player: (" << (int)player_x << ", " << (int)player_y << ", " << (int)player_z << ")" << endl;
    cout << "Grid cell: (" << grid_x << ", " << grid_z << ")" << endl;
    cout << "Target: (" << (int)target_x << ", " << (int)target_y << ", " << (int)target_z << ")" << endl;
    cout << "Camera: ready" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints player position", expectedOutput: "Player: (6, 1, 6)" },
      { id: "t2", description: "Prints grid cell", expectedOutput: "Grid cell: (1, 1)" },
      { id: "t3", description: "Prints camera target", expectedOutput: "Target: (7, 1, 6)" },
      { id: "t4", description: "Prints camera ready", expectedOutput: "Camera: ready" },
    ],
    hints: [
      "Use (int) cast to print float as integer: cout << (int)player_x outputs 6, not 6.0.",
      "Grid cell = (int)(position / cell_size). For player_x=6.0, cell_size=4.0: (int)(1.5) = 1.",
      "Target is player + direction. target_x = 7.0, so (int)target_x = 7. Final line is a literal string.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: First-Person Dungeon",
    type: "game_builder",
    instructions: `# Build: First-Person Dungeon

## What You'll Build

A first-person view of an 8x8 dungeon room. Gray walls rendered as cubes, dark floor as a plane. The camera sits at the player's position, looking down a corridor.

This is the foundation of every first-person engine: a camera inside a grid of walls.

## Already Done For You

- Window creation (800x600) and game loop
- Dungeon grid array (1 = wall, 0 = open)
- Player position variables at file scope
- \`Camera3D\` declared at file scope

## Your TODOs

1. Set up the camera: position, target (+X direction), up vector, fovy = 70, perspective projection
2. Print three lines before the game loop: player position, map size, camera status
3. Draw the floor with \`DrawPlane\` centered on the dungeon grid
4. Loop through the grid and \`DrawCube\` for each wall cell`,
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

Camera3D camera = {0};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Dungeon");
    SetTargetFPS(60);

    // TODO: Set camera.position to the player's world position
    // TODO: Set camera.target to look in the +X direction from the player
    // TODO: Set camera.up to (0, 1, 0)
    // TODO: Set camera.fovy to 70
    // TODO: Set camera.projection to CAMERA_PERSPECTIVE

    // TODO: Print "Player: (6, 1, 6)"
    // TODO: Print "Map: 8x8"
    // TODO: Print "Camera: ready"

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        BeginMode3D(camera);

        // TODO: Draw the floor with DrawPlane
        //       Center: (MAP_W*CELL/2, 0, MAP_H*CELL/2)
        //       Size: (MAP_W*CELL, MAP_H*CELL)
        //       Color: DARKGRAY

        // TODO: Draw walls from the dungeon grid
        //       Loop z = 0..MAP_H, x = 0..MAP_W
        //       If dungeon[z][x] == 1, DrawCube at:
        //       Position: (x*CELL + CELL/2, CELL/2, z*CELL + CELL/2)
        //       Size: CELL, CELL, CELL  Color: GRAY

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

Camera3D camera = {0};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Dungeon");
    SetTargetFPS(60);

    camera.position = (Vector3){player_x, player_y, player_z};
    camera.target = (Vector3){player_x + 1.0f, player_y, player_z};
    camera.up = (Vector3){0.0f, 1.0f, 0.0f};
    camera.fovy = 70.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    cout << "Player: (6, 1, 6)" << endl;
    cout << "Map: 8x8" << endl;
    cout << "Camera: ready" << endl;

    while (!WindowShouldClose()) {
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
      { id: "g2", description: "Prints map size", expectedOutput: "Map: 8x8" },
      { id: "g3", description: "Prints camera ready", expectedOutput: "Camera: ready" },
    ],
    hints: [
      "Camera3D fields use (Vector3){x, y, z} syntax. Target = position + direction. +X means target.x = player_x + 1.0f.",
      "DrawPlane takes center (Vector3), size (Vector2), color. Center at grid midpoint: (MAP_W*CELL/2, 0, MAP_H*CELL/2).",
      "Wall loop: for z 0..MAP_H, for x 0..MAP_W. Wall center Y = CELL/2. X = x*CELL + CELL/2, Z = z*CELL + CELL/2.",
    ],
    estimatedMinutes: 10,
  },
};
