import type { Lesson } from "@/types/lesson";

export const lessonCrawler9: Lesson = {
  id: "crawler-09-items-on-ground",
  title: "Items on Ground",
  description: "Parallel arrays track item positions and active state. Proximity pickup: when the player walks within CELL*0.5 of an item, it deactivates and score increments. Gold cubes rendered at half-height.",
  order: 9,
  xpReward: 50,
  tier: "free",
  concepts: ["parallel arrays", "proximity detection", "pickup logic", "score counter", "spatial distance"],
  part1: {
    title: "Concept: Parallel Arrays for Item State",
    type: "concept",
    instructions: `# Items on Ground

## Mental Model

Three parallel arrays define the item system: \`item_x[]\`, \`item_z[]\`, \`item_active[]\`. Index i refers to the same item across all arrays. When the player picks up item i, \`item_active[i] = false\`. The item data (position) stays in the array forever -- only the flag changes. No memory management, no removal from array. This is the simplest possible pick-up system.

## What Breaks Without This

Without items, the dungeon has no reward loop. The player can explore but has no goal. Items create a scavenger hunt -- a minimal gameplay loop. Even three collectibles turn exploration into a game.

## The Fix: Parallel Arrays + Proximity Check

\`\`\`cpp
const int NUM_ITEMS = 3;
float item_x[NUM_ITEMS] = {10.0f, 46.0f, 30.0f};
float item_z[NUM_ITEMS] = {14.0f, 14.0f, 46.0f};
bool item_active[NUM_ITEMS] = {true, true, true};
int score = 0;

// In game loop:
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
\`\`\`

## Key Concepts

- **Parallel arrays**: item_x[i], item_z[i], item_active[i] are all the same item
- **Proximity**: sqrtf(dx*dx + dz*dz) < CELL*0.5 -- Euclidean distance in XZ plane
- **Deactivate, not delete**: set active=false, leave position in array
- **Score**: single int incremented on pickup

## Beginner Trap

**Checking distance in 3D (including Y) instead of 2D XZ.** Items sit on the floor at y=0. The player walks at y=1. A 3D distance would always include a 1-unit Y gap, making pickup require getting very close. Always use 2D XZ distance for floor items.

## Elite Insight

This parallel array pattern is a degenerate Entity-Component System (ECS). Each array is a component column. The entity ID is the array index. When item_active[i]=false, the entity is dead. Doom and Quake used similar flat arrays for mobjs/entities. Modern ECS frameworks generalize this idea to hundreds of component types.

## Systems Thinking Connection

The RPG path used a \`monsters[]\` array with \`hp\` field (dead when hp<=0). Here items use \`item_active[]\` (dead when false). Same pattern: array index = entity ID, field = alive/dead state. The difference is death condition: combat vs. proximity.

## Mastery Check

Why CELL*0.5f for pickup radius? CELL=4.0f, so radius=2.0f. A cell is 4 units wide. The player center must be within 2 units of the item center -- within the same cell or adjacent. Too small (0.1f) and pickup feels broken. Too large (CELL*2) and the player grabs items through walls.

## Your Task

Print initial item count and score.

Expected output:
\`\`\`
Items: 3
Score: 0
Active: 3
\`\`\`
`,
    starterCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const int NUM_ITEMS = 3;
    float item_x[NUM_ITEMS] = {10.0f, 46.0f, 30.0f};
    float item_z[NUM_ITEMS] = {14.0f, 14.0f, 46.0f};
    bool item_active[NUM_ITEMS] = {true, true, true};
    int score = 0;

    // TODO 1: Print "Items: 3"
    // TODO 2: Print "Score: 0"
    // TODO 3: Count active items and print "Active: N"
    return 0;
}
`,
    solutionCode: `
#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const int NUM_ITEMS = 3;
    float item_x[NUM_ITEMS] = {10.0f, 46.0f, 30.0f};
    float item_z[NUM_ITEMS] = {14.0f, 14.0f, 46.0f};
    bool item_active[NUM_ITEMS] = {true, true, true};
    int score = 0;

    cout << "Items: " << NUM_ITEMS << endl;
    cout << "Score: " << score << endl;
    int active = 0;
    for (int i = 0; i < NUM_ITEMS; i++) if (item_active[i]) active++;
    cout << "Active: " << active << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Prints item count", expectedOutput: "Items: 3" },
      { id: "t2", description: "Prints initial score", expectedOutput: "Score: 0" },
      { id: "t3", description: "Prints active count", expectedOutput: "Active: 3" },
    ],
    hints: [
      "Add after MM_SIZE: const int NUM_ITEMS = 3; float item_x[NUM_ITEMS] = {10.0f, 46.0f, 30.0f}; float item_z[NUM_ITEMS] = {14.0f, 14.0f, 46.0f}; bool item_active[NUM_ITEMS] = {true, true, true}; int score = 0;",
      "Print: cout << \"Items: \" << NUM_ITEMS << endl; and cout << \"Score: \" << score << endl;",
      "Count: int active=0; for i<NUM_ITEMS: if item_active[i] active++; then print \"Active: \" << active.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Pickup: Walk Through Items to Collect",
    type: "game_builder",
    instructions: `# Items on Ground

## Goal

Add 3 collectible items to the dungeon as gold cubes. Walk over them to pick them up. Score shown in HUD and items disappear on pickup.

## Step 1: Add Item Arrays at File Scope

After the \`const int MM_SIZE = 6;\` line, add:

\`\`\`cpp
const int NUM_ITEMS = 3;
float item_x[NUM_ITEMS] = {10.0f, 46.0f, 30.0f};
float item_z[NUM_ITEMS] = {14.0f, 14.0f, 46.0f};
bool item_active[NUM_ITEMS] = {true, true, true};
int score = 0;
\`\`\`

**Click Run** -- should compile and show the dungeon as before.

## Step 2: Print Item Stats Before Game Loop

After the \`cout << \"Doors:\"\` line, add:

\`\`\`cpp
cout << "Items: " << NUM_ITEMS << endl;
cout << "Score: " << score << endl;
\`\`\`

## Step 3: Proximity Pickup in Game Loop

After the E-key door section, add the pickup loop:

\`\`\`cpp
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
\`\`\`

## Step 4: Draw Items as Gold Cubes

Inside the 3D draw block, after the wall/door loop and before \`EndMode3D()\`:

\`\`\`cpp
for (int i = 0; i < NUM_ITEMS; i++) {
    if (item_active[i])
        DrawCube((Vector3){item_x[i], CELL/4, item_z[i]},
                 CELL/2, CELL/2, CELL/2, GOLD);
}
\`\`\`

The cube sits at y=CELL/4 -- centered just above the floor.

**Did It Work?** You should see 3 gold cubes in the dungeon. Walk into one -- it disappears.

## Step 5: Show Score in HUD

After the \`DrawText(room_name...)\` line, add:

\`\`\`cpp
DrawText(TextFormat("Score: %d", score), 10, 70, 20, GOLD);
\`\`\`

## Step 6: Show Items on Minimap

After the player dot on the minimap, add:

\`\`\`cpp
for (int i = 0; i < NUM_ITEMS; i++) {
    if (item_active[i]) {
        int ix = (int)(item_x[i] / CELL);
        int iz = (int)(item_z[i] / CELL);
        DrawRectangle(MM_X + ix*MM_SIZE + 2, MM_Y + iz*MM_SIZE + 2, 2, 2, GOLD);
    }
}
\`\`\`

**Expected output:**
\`\`\`
Player: (10, 1, 10)
Items: 3
Score: 0
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

// TODO 1: Add NUM_ITEMS, item_x[], item_z[], item_active[], score here

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
    // TODO 2: Print "Items: " << NUM_ITEMS << endl;
    // TODO 3: Print "Score: " << score << endl;

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

        // TODO 4: Add pickup loop -- check distance to each active item

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
        // TODO 5: Draw active items as GOLD cubes (size CELL/2, y=CELL/4)
        EndMode3D();
        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);
        // TODO 6: DrawText score using TextFormat
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
        // TODO 7: Draw active items as GOLD dots on minimap
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
        DrawText("HeapSight Dungeon", 10, 10, 20, WHITE);
        DrawText(room_name, 10, 40, 20, YELLOW);
        DrawText(TextFormat("Score: %d", score), 10, 70, 20, GOLD);
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
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (10, 1, 10)" },
      { id: "g2", description: "Prints item count", expectedOutput: "Items: 3" },
      { id: "g3", description: "Prints initial score", expectedOutput: "Score: 0" },
    ],
    hints: [
      "Add item arrays after MM_SIZE: const int NUM_ITEMS=3; float item_x[NUM_ITEMS]={10.0f,46.0f,30.0f}; float item_z[NUM_ITEMS]={14.0f,14.0f,46.0f}; bool item_active[NUM_ITEMS]={true,true,true}; int score=0;",
      "After Doors cout: add cout << \"Items: \" << NUM_ITEMS << endl; and cout << \"Score: \" << score << endl;",
      "Pickup loop: for each i, compute sqrtf(dx*dx+dz*dz). If dist < CELL*0.5f and item_active[i]: set false and score++. Draw active items as GOLD DrawCube at y=CELL/4, size CELL/2.",
    ],
    estimatedMinutes: 20,
  },
};
