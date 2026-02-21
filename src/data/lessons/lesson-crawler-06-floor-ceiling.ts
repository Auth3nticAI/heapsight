import type { Lesson } from "@/types/lesson";

export const lessonCrawler6: Lesson = {
  id: "crawler-06-floor-ceiling",
  title: "Floor & Ceiling",
  description: "Close the dungeon with a ceiling plane at wall height. Two DrawPlane calls -- floor at y=0 and ceiling at y=CELL -- enclose the first-person view.",
  order: 6,
  xpReward: 50,
  tier: "free",
  concepts: ["floor plane", "ceiling plane", "DrawPlane", "dungeon enclosure", "vertical depth cues"],
  part1: {
    title: "Concept: Floor and Ceiling Planes",
    type: "concept",
    instructions: `# Floor & Ceiling

## Mental Model

Your dungeon has a floor but no ceiling. Look up and you see infinite black void -- not a dungeon, a pit. \`DrawPlane\` renders a horizontal surface at any y-coordinate. Floor at y=0 (ground level). Ceiling at y=CELL (same height as the walls). Two \`DrawPlane\` calls close the vertical box.

## What Breaks Without This

Without a ceiling, any camera pitch upward breaks the illusion of being inside a room. Walls have no visible top. The dungeon feels like an open courtyard. Players lose vertical orientation and the first-person space feels unfinished.

## The Fix: Two DrawPlane Calls

\`\`\`cpp
// Floor at y=0 (ground level)
DrawPlane((Vector3){MAP_W*CELL/2, 0, MAP_H*CELL/2},
          (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKBROWN);

// Ceiling at y=CELL (wall top)
DrawPlane((Vector3){MAP_W*CELL/2, CELL, MAP_H*CELL/2},
          (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKGRAY);
\`\`\`

The center position places the plane at the dungeon grid center. The size covers the full grid area. Floor at y=0, ceiling at y=CELL match the DrawCube walls exactly.

## Key Concepts

- **Floor**: \`DrawPlane\` at y=0, DARKBROWN
- **Ceiling**: \`DrawPlane\` at y=CELL (=4.0f), DARKGRAY
- **Color contrast**: DARKBROWN floor vs DARKGRAY ceiling anchors vertical orientation
- **CELL constant**: walls are CELL tall, ceiling must match to close the box

## Beginner Trap

**Same color for floor and ceiling.** If both are DARKGRAY, the player loses up/down orientation when looking at extreme angles. DARKBROWN floor and DARKGRAY ceiling give the eye a reference.

## Elite Insight

Wolfenstein 3D used solid color fills for floor and ceiling -- no geometry at all. Doom added proper visplane rendering as a major engine advance. Quake switched to full 3D triangle geometry. \`DrawPlane\` is the modern equivalent. The concept is identical across 30 years: close the vertical bounds of the first-person view.

## Systems Thinking Connection

The RPG path had no ceiling because everything was 2D top-down. This lesson shows the fundamental difference between 2D and first-person 3D: in 3D, you must close ALL visible faces of the player' s perceived space. Floor and ceiling are two of those six faces.

## Mastery Check

Why is ceiling y=CELL (4.0) not y=2.0? Because CELL is the DrawCube wall height. If ceiling y < CELL, wall tops poke through the ceiling. If ceiling y > CELL, you see wall tops floating below the ceiling. Match ceiling height to wall height for seamless enclosure.

## Your Task

Print the floor y, ceiling y, and dungeon height.

Expected output:
\`\`\`
Floor: y=0
Ceiling: y=4
Height: 4
\`\`\`
`,
    starterCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const float CELL = 4.0f;
    float floor_y = 0.0f;
    float ceiling_y = CELL;
    int height = (int)(ceiling_y - floor_y);

    // TODO: Print "Floor: y=0"
    // TODO: Print "Ceiling: y=4"
    // TODO: Print "Height: 4" using height

    return 0;
}
`,
    solutionCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const float CELL = 4.0f;
    float floor_y = 0.0f;
    float ceiling_y = CELL;
    int height = (int)(ceiling_y - floor_y);

    cout << "Floor: y=0" << endl;
    cout << "Ceiling: y=4" << endl;
    cout << "Height: " << height << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints floor y", expectedOutput: "Floor: y=0" },
      { id: "t2", description: "Prints ceiling y", expectedOutput: "Ceiling: y=4" },
      { id: "t3", description: "Prints dungeon height", expectedOutput: "Height: 4" },
    ],
    hints: [
      "floor_y = 0.0f. ceiling_y = CELL = 4.0f. height = (int)(ceiling_y - floor_y) = 4.",
      "cout << \"Floor: y=0\" << endl; -- the y is always 0, print it as a literal.",
      "cout << \"Height: \" << height << endl; -- height is int 4.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Floor & Ceiling",
    type: "game_builder",
    instructions: `# Build: Floor & Ceiling

## Mental Model

Your L5 dungeon has a floor (DARKGRAY plane at y=0) but no ceiling. Look up: void. This lesson adds a ceiling plane at y=CELL and changes the floor to DARKBROWN for visual contrast. Two DrawPlane calls, different y values, different colors -- the dungeon becomes an enclosed space.

## What You'll Add

1. Print \`Floor: y=0\` and \`Ceiling: y=4\` in cout
2. Change floor \`DrawPlane\` color from DARKGRAY to DARKBROWN
3. Add ceiling \`DrawPlane\` at y=CELL with DARKGRAY

## The Ceiling Call

\`\`\`cpp
// Ceiling (add after floor DrawPlane):
DrawPlane((Vector3){MAP_W*CELL/2, CELL, MAP_H*CELL/2},
          (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKGRAY);
\`\`\`

The center x/z match the floor. The y is CELL (4.0f) to align with wall tops.

## Expected cout output

\`\`\`
Player: (10, 1, 10)
Map: 16x16
Rooms: 3
Floor: y=0
Ceiling: y=4
\`\`\`

## Beginner Trap

**Ceiling y != CELL.** If y < CELL, wall tops poke through the ceiling. If y > CELL, you see a gap between wall tops and ceiling. CELL is the wall DrawCube height -- ceiling y must match exactly.

## Elite Insight

In a real engine, floor and ceiling are full mesh geometry projected by the rasterizer. \`DrawPlane\` is a convenience quad. Under the hood: two triangles at the given y, sized to cover the dungeon. The spatial math is identical to production engines.

## Mastery Check

Could each room have a different ceiling height? Yes -- track per-room ceiling y and call DrawPlane with the room' s height. A great hall: y=8. A crawlspace: y=2. Uniform CELL height is correct for this dungeon layout.
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
    // TODO: cout << "Floor: y=0" << endl;
    // TODO: cout << "Ceiling: y=4" << endl;

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
        // Floor (DARKGRAY -> TODO: change to DARKBROWN)
        DrawPlane((Vector3){MAP_W*CELL/2, 0, MAP_H*CELL/2},
                  (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKGRAY);
        // TODO: Add ceiling DrawPlane at y=CELL with DARKGRAY

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
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "Prints map size", expectedOutput: "Map: 16x16" },
      { id: "g3", description: "Prints floor y", expectedOutput: "Floor: y=0" },
      { id: "g4", description: "Prints ceiling y", expectedOutput: "Ceiling: y=4" },
    ],
    hints: [
      "After the Rooms: 3 cout line, add: cout << \"Floor: y=0\" << endl; and cout << \"Ceiling: y=4\" << endl;",
      "For the ceiling: DrawPlane((Vector3){MAP_W*CELL/2, CELL, MAP_H*CELL/2}, (Vector2){MAP_W*CELL, MAP_H*CELL}, DARKGRAY); -- y=CELL places it at wall top.",
      "Change the floor DrawPlane color argument from DARKGRAY to DARKBROWN for visual contrast with the DARKGRAY ceiling.",
    ],
    estimatedMinutes: 10,
  },
};
