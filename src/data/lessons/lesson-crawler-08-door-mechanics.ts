import type { Lesson } from "@/types/lesson";

export const lessonCrawler8: Lesson = {
  id: "crawler-08-door-mechanics",
  title: "Door Mechanics",
  description: "Brown door tiles block the player until opened with E. State toggle: dungeon value 2 = closed door, 0 = open. Raycasting-free proximity interaction.",
  order: 8,
  xpReward: 50,
  tier: "free",
  concepts: ["door state", "tile values", "E key interaction", "state toggle", "proximity check"],
  part1: {
    title: "Concept: Door State as Tile Value",
    type: "concept",
    instructions: `# Door Mechanics

## Mental Model

A door is a tile that changes state. \`dungeon[z][x] = 1\` is a permanent wall. \`dungeon[z][x] = 2\` is a closed door -- it blocks movement just like a wall. \`dungeon[z][x] = 0\` is open space. Opening a door is just: \`dungeon[dz][dx] = 0\`. The tile value IS the door state. No separate state array needed.

## What Breaks Without This

Without doors, every doorway between rooms is always open. There is no obstacle, no interaction, no player agency. Doors are the first interactive element in the dungeon -- the first thing the player can CHANGE. They make the space feel responsive.

## The Fix: Tile Value as State

\`\`\`cpp
// In dungeon array: 0=floor, 1=wall, 2=door(closed)
// Collision blocks on both walls and closed doors:
if (dungeon[dz][dx] == 1 || dungeon[dz][dx] == 2) // blocked

// E key opens door in front of player:
float cx = player_x + cosf(player_yaw) * CELL * 0.7f;
float cz = player_z + sinf(player_yaw) * CELL * 0.7f;
int dx = (int)(cx / CELL);
int dz = (int)(cz / CELL);
if (dungeon[dz][dx] == 2) dungeon[dz][dx] = 0;  // open door
\`\`\`

## Key Concepts

- **Tile value as state**: 0=open, 1=wall, 2=door. No separate state array.
- **Blocking on value 2**: collision check includes \`|| val == 2\` for closed doors
- **Facing check**: project player position 0.7*CELL forward to find door cell
- **Rendering**: \`dungeon[z][x] == 2\` draws BROWN cube

## Beginner Trap

**Forgetting to block door tiles in collision.** If collision only checks for value 1, the player walks through closed doors. Add \`|| dungeon[z][x] == 2\` to BOTH collision checks (X and Z axes).

## Elite Insight

Wolfenstein 3D stored door states as a separate door array with animation timers. Doom used tagged linedefs with sector state. Quake used func_door entities with trigger volumes. You are using the simplest possible model: tile value IS state. This is the right architecture for a dungeon crawler -- doors are rare, the grid is the database.

## Systems Thinking Connection

The RPG path handled doors as locked transitions -- you could not move to a tile blocked by a door without a key. Here doors are physical obstacles with spatial interaction (face the door, press E). Same concept (blocked passage), different interaction model (spatial vs. inventory-based).

## Mastery Check

Why check 0.7*CELL ahead instead of 1.0*CELL? At exactly 1 cell ahead, the check could land in the NEXT cell beyond the door. At 0.7, you reliably hit the door cell when facing it from a normal walking distance. The factor matters -- too small and you have to stand inside the door, too large and you interact from too far away.

## Your Task

Count doors and print their initial state.

Expected output:
\`\`\`
Doors: 1
State: closed
Key: E
\`\`\`
`,
    starterCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    // 0=floor, 1=wall, 2=door
    int row[5] = {1, 0, 2, 0, 1};  // wall, floor, door, floor, wall
    int door_count = 0;
    for (int i = 0; i < 5; i++)
        if (row[i] == 2) door_count++;

    // TODO: Print "Doors: 1" using door_count
    // TODO: Print "State: closed"
    // TODO: Print "Key: E"

    return 0;
}
`,
    solutionCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    int row[5] = {1, 0, 2, 0, 1};
    int door_count = 0;
    for (int i = 0; i < 5; i++)
        if (row[i] == 2) door_count++;

    cout << "Doors: " << door_count << endl;
    cout << "State: closed" << endl;
    cout << "Key: E" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints door count", expectedOutput: "Doors: 1" },
      { id: "t2", description: "Prints door state", expectedOutput: "State: closed" },
      { id: "t3", description: "Prints interaction key", expectedOutput: "Key: E" },
    ],
    hints: [
      "door_count counts tiles with value 2. The loop finds 1 such tile (row[2] = 2).",
      "cout << \"Doors: \" << door_count << endl; outputs Doors: 1.",
      "State and Key are string literals -- just print them directly as shown in the expected output.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Door Mechanics",
    type: "game_builder",
    instructions: `# Build: Door Mechanics

## Mental Model

Add value 2 (closed door) to the dungeon array. A door blocks movement like a wall. Press E while facing a door to open it (set the tile to 0). Render doors as BROWN cubes so they are visually distinct from GRAY walls.

## What You'll Add

1. Change \`dungeon[7][4]\` from 0 to 2 (door blocks the passage to Room C)
2. Update collision to block on value 2 as well as value 1
3. Add E key: check cell 0.7*CELL ahead, if value 2 set to 0
4. Render doors as BROWN DrawCube
5. Print \`Doors: 1\` in cout

## The Dungeon Change

\`\`\`cpp
// Row 7 column 4: change 0 to 2 (door)
{1,1,1,1,2,1,1,1,1,1,1,1,0,1,1,1},  // row 7
\`\`\`

## Updated Collision

\`\`\`cpp
// Block on walls (1) AND closed doors (2):
if (dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 1 ||
    dungeon[(int)(player_z/CELL)][(int)((new_x+PLAYER_RADIUS)/CELL)] == 2 ||
    dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 1 ||
    dungeon[(int)(player_z/CELL)][(int)((new_x-PLAYER_RADIUS)/CELL)] == 2)
    new_x = player_x;
\`\`\`

## E Key Interaction

\`\`\`cpp
if (IsKeyPressed(KEY_E)) {
    float cx = player_x + cosf(player_yaw) * CELL * 0.7f;
    float cz = player_z + sinf(player_yaw) * CELL * 0.7f;
    int dx = (int)(cx / CELL);
    int dz = (int)(cz / CELL);
    if (dx >= 0 && dx < MAP_W && dz >= 0 && dz < MAP_H)
        if (dungeon[dz][dx] == 2) dungeon[dz][dx] = 0;
}
\`\`\`

## Expected cout output

\`\`\`
Player: (10, 1, 10)
Map: 16x16
Rooms: 3
Floor: y=0
Ceiling: y=4
Minimap: 16x16
Doors: 1
\`\`\`

## Beginner Trap

**Collision only checks value 1.** If you forget to add the \`|| val == 2\` check, the player walks through closed doors. Remember: a closed door is a solid tile. Both X-axis and Z-axis collision checks need the update.

## Elite Insight

Quake' s door entities used trigger brushes (volumes) with activation conditions. Your approach -- checking the tile the player is facing -- is equivalent to a directional trigger: press E in direction of door. The difference is that Quake could trigger from multiple directions. L12 upgrades this to raycasting for directional accuracy.

## Mastery Check

What happens if you walk into an open door space? Nothing -- the tile is 0 (floor) and passes all collision checks. The door is gone from the grid. In a full game, you would track which tiles WERE doors to allow re-closing. For now, one-way open is the simplest correct behavior.
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
    // TODO: Count doors and print "Doors: 1"

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

        // TODO: Update collision to also block on value 2 (closed door)
        if (dungeon[(int)(player_z / CELL)][(int)((new_x + PLAYER_RADIUS) / CELL)] == 1 ||
            dungeon[(int)(player_z / CELL)][(int)((new_x - PLAYER_RADIUS) / CELL)] == 1)
            new_x = player_x;
        if (dungeon[(int)((new_z + PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1 ||
            dungeon[(int)((new_z - PLAYER_RADIUS) / CELL)][(int)(new_x / CELL)] == 1)
            new_z = player_z;

        player_x = new_x;
        player_z = new_z;

        // TODO: E key: check cell 0.7*CELL ahead, if value 2 set to 0 (open door)

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
                // TODO: else if (dungeon[z][x] == 2) DrawCube(..., BROWN)
            }
        }
        EndMode3D();
        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);
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
        EndMode3D();
        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);
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
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "Prints minimap", expectedOutput: "Minimap: 16x16" },
      { id: "g3", description: "Prints door count", expectedOutput: "Doors: 1" },
    ],
    hints: [
      "Dungeon row 7 now has value 2 at column 4. Count doors: loop all cells, count where dungeon[z][x]==2, then print Doors: that count.",
      "Update both collision checks to add || dungeon[...][...] == 2 for closed-door blocking on X and Z axes.",
      "In the draw loop: else if (dungeon[z][x] == 2) DrawCube same position and size as walls, color BROWN.",
    ],
    estimatedMinutes: 15,
  },
};
