import type { Lesson } from "@/types/lesson";

export const lessonCrawler7: Lesson = {
  id: "crawler-07-minimap-overlay",
  title: "Minimap Overlay",
  description: "Draw a 2D top-down minimap in the HUD corner showing walls and player position. Dual rendering: 3D world and 2D map from the same dungeon data.",
  order: 7,
  xpReward: 50,
  tier: "free",
  concepts: ["minimap", "dual rendering", "HUD overlay", "world-to-screen mapping", "DrawRectangle"],
  part1: {
    title: "Concept: Minimap Cell Coordinates",
    type: "concept",
    instructions: `# Minimap Overlay

## Mental Model

The same dungeon array that generates 3D walls can generate a 2D minimap. Each grid cell maps to a small pixel rectangle. \`dungeon[z][x] == 1\` draws GRAY. Open space draws DARKGRAY. The player is a GREEN dot at their grid coordinates. Two representations, one data source -- this is the power of separating data from rendering.

## What Breaks Without This

Without a minimap, first-person navigation in a multi-room dungeon requires memorizing every turn. Players get lost. The minimap is not just UI polish -- it is a navigational tool that makes the multi-room dungeon from Lesson 5 actually explorable.

## The Fix: Grid-to-Screen Mapping

\`\`\`cpp
const int MM_SIZE = 6;  // pixels per grid cell
const int MM_X = SCREEN_W - MAP_W * MM_SIZE - 10;  // top-right corner
const int MM_Y = 10;

// Draw minimap grid
for (int mz = 0; mz < MAP_H; mz++) {
    for (int mx = 0; mx < MAP_W; mx++) {
        Color c = (dungeon[mz][mx] == 1) ? GRAY : DARKGRAY;
        DrawRectangle(MM_X + mx*MM_SIZE, MM_Y + mz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, c);
    }
}
// Player dot
int px = (int)(player_x / CELL);
int pz = (int)(player_z / CELL);
DrawRectangle(MM_X + px*MM_SIZE, MM_Y + pz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, GREEN);
\`\`\`

## Key Concepts

- **Grid cell to screen pixel**: \`screen_x = MM_X + grid_x * MM_SIZE\`
- **MM_SIZE**: pixels per grid cell (6 means each cell is a 5x5 square with 1px gap)
- **MM_X offset**: \`SCREEN_W - MAP_W*MM_SIZE - 10\` places minimap in top-right corner
- **Player dot**: convert player world pos to grid cell, draw GREEN rectangle

## Beginner Trap

**Putting minimap code inside BeginMode3D/EndMode3D.** Minimap is 2D HUD. All \`DrawRectangle\` minimap calls go AFTER \`EndMode3D()\` but BEFORE \`EndDrawing()\`. Drawing 2D inside BeginMode3D will transform it incorrectly.

## Elite Insight

Doom's automap uses the same principle -- the level geometry projected from 3D space to 2D screen coordinates. Quake's minimap renders the BSP tree as 2D lines. You are building the same dual-view architecture: 3D world rendered through camera, 2D map rendered as screen-space overlay from the same data.

## Systems Thinking Connection

The RPG path' s 2D grid IS the equivalent of this minimap -- same data layout, just viewed top-down. In the Dungeon Crawler, you have both views simultaneously. This dual-render pattern -- first-person 3D + top-down 2D -- is how every FPS game since Doom has provided spatial orientation.

## Mastery Check

Why does the player dot use \`(int)(player_x / CELL)\` instead of \`player_x\`? World coordinates (10.0f) need to be converted to grid coordinates (2). Dividing by CELL converts world units to grid cells. Integer cast truncates to the grid cell index.

## Your Task

Calculate minimap pixel coordinates for a player at world position (10.0, 10.0).

Expected output:
\`\`\`
Minimap: 16x16
Cell: 6px
Player dot: (2, 2)
\`\`\`
`,
    starterCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const int MAP_W = 16, MAP_H = 16;
    const float CELL = 4.0f;
    const int MM_SIZE = 6;
    float player_x = 10.0f, player_z = 10.0f;

    int px = (int)(player_x / CELL);
    int pz = (int)(player_z / CELL);

    // TODO: Print "Minimap: 16x16"
    // TODO: Print "Cell: 6px" using MM_SIZE
    // TODO: Print "Player dot: (2, 2)" using px, pz

    return 0;
}
`,
    solutionCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const int MAP_W = 16, MAP_H = 16;
    const float CELL = 4.0f;
    const int MM_SIZE = 6;
    float player_x = 10.0f, player_z = 10.0f;

    int px = (int)(player_x / CELL);
    int pz = (int)(player_z / CELL);

    cout << "Minimap: 16x16" << endl;
    cout << "Cell: " << MM_SIZE << "px" << endl;
    cout << "Player dot: (" << px << ", " << pz << ")" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints minimap size", expectedOutput: "Minimap: 16x16" },
      { id: "t2", description: "Prints cell size", expectedOutput: "Cell: 6px" },
      { id: "t3", description: "Prints player dot coords", expectedOutput: "Player dot: (2, 2)" },
    ],
    hints: [
      "px = (int)(10.0f / 4.0f) = (int)(2.5f) = 2. Same for pz. These are grid cell coordinates, not world units.",
      "cout << \"Cell: \" << MM_SIZE << \"px\" << endl; outputs Cell: 6px.",
      "cout << \"Player dot: (\" << px << \", \" << pz << \")\" << endl; outputs Player dot: (2, 2).",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Minimap Overlay",
    type: "game_builder",
    instructions: `# Build: Minimap Overlay

## Mental Model

After \`EndMode3D()\`, the 3D view is complete. Now draw a 2D minimap overlay in the top-right corner using \`DrawRectangle\`. The minimap loops through the dungeon array and draws small squares: GRAY for walls, DARKGRAY for open space. Then draws a GREEN dot for the player position. Same data, different view.

## What You'll Add

1. Print \`Minimap: 16x16\` in cout
2. After \`EndMode3D()\`, draw the minimap grid with wall/floor colors
3. Draw a GREEN player dot at the player' s grid position

## Minimap Layout

\`\`\`cpp
const int MM_SIZE = 6;
const int MM_X = SCREEN_W - MAP_W * MM_SIZE - 10;
const int MM_Y = 10;

for (int mz = 0; mz < MAP_H; mz++) {
    for (int mx = 0; mx < MAP_W; mx++) {
        Color c = (dungeon[mz][mx] == 1) ? GRAY : DARKGRAY;
        DrawRectangle(MM_X + mx*MM_SIZE, MM_Y + mz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, c);
    }
}
int px = (int)(player_x / CELL);
int pz = (int)(player_z / CELL);
DrawRectangle(MM_X + px*MM_SIZE, MM_Y + pz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, GREEN);
\`\`\`

## Expected cout output

\`\`\`
Player: (10, 1, 10)
Map: 16x16
Rooms: 3
Floor: y=0
Ceiling: y=4
Minimap: 16x16
\`\`\`

## Beginner Trap

**Minimap inside BeginMode3D.** All 2D draw calls (\`DrawRectangle\`, \`DrawText\`) must come AFTER \`EndMode3D()\`. Inside BeginMode3D, raylib applies the 3D camera transform to everything -- your minimap will appear as a distorted 3D object.

## Elite Insight

Doom' s automap and every FPS minimap since use the same pattern: project world positions to screen-space pixels using a scale factor (your MM_SIZE). The scale factor is the ratio of screen pixels to world units. Zoom in = larger MM_SIZE. Zoom out = smaller. Dynamic zoom is one multiplication away.

## Mastery Check

The minimap is \`MAP_W * MM_SIZE\` pixels wide. With MAP_W=16 and MM_SIZE=6, that is 96 pixels. Placed at \`SCREEN_W - 96 - 10 = 694\` pixels from left. The 10-pixel margin keeps it off the edge. Why not anchor to the right? Because DrawRectangle takes top-left coordinates -- you must compute the left edge from the right margin.
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
const int MM_SIZE = 6;

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
    cout << "Floor: y=0" << endl;
    cout << "Ceiling: y=4" << endl;
    // TODO: cout << "Minimap: 16x16" << endl;

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

        if (dungeon[(int)(player_z / CELL)][(int)((new_x + PLAYER_RADIUS) / CELL)] == 1 ||
            dungeon[(int)(player_z / CELL)][(int)((new_x - PLAYER_RADIUS) / CELL)] == 1)
            new_x = player_x;
        if (dungeon[(int)((new_z + PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1 ||
            dungeon[(int)((new_z - PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1)
            new_z = player_z;

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
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2, CELL, MAP_H*CELL/2},
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKGRAY);
        for (int z = 0; z < MAP_H; z++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[z][x] == 1)
                    DrawCube((Vector3){x*CELL + CELL/2, CELL/2, z*CELL + CELL/2},
                             CELL, CELL, CELL, GRAY);
            }
        }
        EndMode3D();

        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);

        // TODO: Draw minimap (after EndMode3D, before EndDrawing)
        // const int MM_X = SCREEN_W - MAP_W * MM_SIZE - 10;
        // const int MM_Y = 10;
        // Loop dungeon[mz][mx]: GRAY for walls, DARKGRAY for floor
        // Green dot at player grid position

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
const int MM_SIZE = 6;

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
    cout << "Floor: y=0" << endl;
    cout << "Ceiling: y=4" << endl;
    cout << "Minimap: 16x16" << endl;

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

        if (dungeon[(int)(player_z / CELL)][(int)((new_x + PLAYER_RADIUS) / CELL)] == 1 ||
            dungeon[(int)(player_z / CELL)][(int)((new_x - PLAYER_RADIUS) / CELL)] == 1)
            new_x = player_x;
        if (dungeon[(int)((new_z + PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1 ||
            dungeon[(int)((new_z - PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1)
            new_z = player_z;

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
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKBROWN);
        DrawPlane((Vector3){MAP_W*CELL/2, CELL, MAP_H*CELL/2},
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKGRAY);
        for (int z = 0; z < MAP_H; z++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[z][x] == 1)
                    DrawCube((Vector3){x*CELL + CELL/2, CELL/2, z*CELL + CELL/2},
                             CELL, CELL, CELL, GRAY);
            }
        }
        EndMode3D();

        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);

        // Minimap
        const int MM_X = SCREEN_W - MAP_W * MM_SIZE - 10;
        const int MM_Y = 10;
        for (int mz = 0; mz < MAP_H; mz++) {
            for (int mx = 0; mx < MAP_W; mx++) {
                Color mc = (dungeon[mz][mx] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(MM_X + mx*MM_SIZE, MM_Y + mz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, mc);
            }
        }
        int px = (int)(player_x / CELL);
        int pz = (int)(player_z / CELL);
        DrawRectangle(MM_X + px*MM_SIZE, MM_Y + pz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, GREEN);

        EndDrawing();
    }
    CloseWindow();
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "Prints floor and ceiling", expectedOutput: "Floor: y=0" },
      { id: "g3", description: "Prints minimap size", expectedOutput: "Minimap: 16x16" },
    ],
    hints: [
      "Add cout << \"Minimap: 16x16\" << endl; after the Ceiling: y=4 output line.",
      "Place minimap code AFTER EndMode3D() but BEFORE EndDrawing(). Declare MM_X = SCREEN_W - MAP_W*MM_SIZE - 10 and MM_Y = 10.",
      "Loop mz 0..MAP_H, mx 0..MAP_W. dungeon[mz][mx]==1 ? GRAY : DARKGRAY. Player dot: px=(int)(player_x/CELL), DrawRectangle(MM_X+px*MM_SIZE, MM_Y+pz*MM_SIZE, MM_SIZE-1, MM_SIZE-1, GREEN).",
    ],
    estimatedMinutes: 12,
  },
};
