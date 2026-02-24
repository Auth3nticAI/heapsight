import { Lesson } from "../../types/lesson";

const lessonPlatformer11: Lesson = {
  id: "platformer-11-tile-grid-data",
  title: "Tile Grid Data",
  description: "Replace hardcoded platform arrays with a 2D tile grid. This is how real platformers store level data.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["2D array", "tilemap", "TILE_SIZE", "data-driven levels"],
  part1: {
    title: "Concept: 2D Array as Level Data",
    type: "concept",
    instructions: `# Tile Grid Data

## Mental Model
The three static platform arrays (plat_x, plat_y, plat_w) were hardcoded geometry. Real platformers use a **tilemap**: a 2D array of integers where each cell is a tile type. \`0\` = empty, \`1\` = solid wall. To render tile (row r, col c), multiply by \`TILE_SIZE\` to get pixel coordinates. To check which tile a world position falls in, divide by \`TILE_SIZE\`.

## The Pattern
\`\`\`cpp
const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;

int tilemap[ROWS][COLS] = {
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    // ... more rows ...
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
};

// Render
for (int r = 0; r < ROWS; r++)
    for (int c = 0; c < COLS; c++)
        if (tilemap[r][c] == 1)
            DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
\`\`\`

## Key Concepts
- Tilemap: 2D array of ints representing level geometry
- TILE_SIZE: pixels per tile (32 is common)
- tile_to_pixel: multiply by TILE_SIZE
- pixel_to_tile: divide by TILE_SIZE (integer division)
- Data-driven: change numbers in the array to change the level

## Your Task
Print tile grid dimensions: size, column count, row count.

## Mastery Check
**Q:** What pixel position is tile (row=5, col=3)?
**A:** x = 3 * 32 = 96, y = 5 * 32 = 160.

## Beginner Trap
**Storing tile data as a 2D array of strings instead of integers.** String comparison is slow and error-prone ("wall" vs "Wall" vs "WALL"). Use integer constants or an enum: 0 = empty, 1 = solid, 2 = coin. Integer lookup is O(1) with no string overhead.

## Elite Insight
Tiled, the most popular 2D level editor, stores maps as integer grids with a separate tileset definition. Every tile ID is a number that indexes into the tileset. Your grid[y][x] integer approach matches the industry-standard format.

## Systems Thinking Connection
The RPG stores dungeon rooms as integer grids the same way — 0 for floor, 1 for wall, 2 for door. The Crawler stores 3D voxel data as integers. Grid-based level data with integer tile IDs is the universal level representation across all paths.`,
    starterCode: `#include <iostream>
using namespace std;

const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;

int main() {
    // TODO: Print "TileSize: 32"
    // TODO: Print "Cols: 25"
    // TODO: Print "Rows: 14"
    // TODO: Print "Tiles: active"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;

int main() {
    cout << "TileSize: " << TILE_SIZE << endl;
    cout << "Cols: " << COLS << endl;
    cout << "Rows: " << ROWS << endl;
    cout << "Tiles: active" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Tile size printed", expectedOutput: "TileSize: 32" },
      { id: "t2", description: "Column count printed", expectedOutput: "Cols: 25" },
      { id: "t3", description: "Row count printed", expectedOutput: "Rows: 14" },
      { id: "t4", description: "Tiles active printed", expectedOutput: "Tiles: active" },
    ],
    hints: [
      "cout << \"TileSize: \" << TILE_SIZE << endl;",
      "cout << \"Cols: \" << COLS << endl; then cout << \"Rows: \" << ROWS << endl;",
      "Final line: cout << \"Tiles: active\" << endl;",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Tile Grid Data",
    type: "game_builder",
    instructions: `# Build: Tile Grid Data

## Mental Model
Replace the three static platform arrays with a \`tilemap[ROWS][COLS]\` 2D array. Render solid tiles (value 1) as green rectangles. The player still uses GROUND_Y for collision — tile-based collision comes in Lesson 12.

## What's Already Here
Micro Platformer from Lesson 10: FSM, air control, coyote time, jump buffer, 3 static platforms.

## Your Task
1. **Remove the static platform arrays:** Delete \`PLAT_COUNT\`, \`plat_x[]\`, \`plat_y[]\`, \`plat_w[]\`, \`PLAT_H\` and the platform collision loop.

2. **Add tile constants at file scope:**
\`\`\`cpp
const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;
\`\`\`

3. **Add the tilemap data:**
\`\`\`cpp
int tilemap[ROWS][COLS] = {
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1,1,1},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
};
\`\`\`

4. **Replace platform rendering** with tile rendering inside BeginDrawing/EndDrawing:
\`\`\`cpp
for (int r = 0; r < ROWS; r++)
    for (int c = 0; c < COLS; c++)
        if (tilemap[r][c] == 1)
            DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
\`\`\`

5. **Also remove** \`DrawRectangle(0, GROUND_Y, ...)\` — the tilemap bottom row replaces it visually.

6. **Update cout:** Replace \`cout << "Platforms: ..." << endl;\` with:
\`\`\`cpp
cout << "TileSize: " << TILE_SIZE << endl;
cout << "Tiles: active" << endl;
\`\`\`

## Did It Work?
You should see a grid of green tiles forming platforms at various heights, plus a solid ground row at the bottom. The player still falls to GROUND_Y (tile-based collision comes in Lesson 12).`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
float player_x = 388.0f;
float player_y = 100.0f;
float player_vy = 0.0f;
float player_vx = 0.0f;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const int GROUND_Y = 340;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;

const int PLAT_COUNT = 3;
int plat_x[3] = {100, 350, 580};
int plat_y[3] = {280, 240, 200};
int plat_w[3] = {150, 150, 150};
const int PLAT_H = 16;
// TODO: Add TILE_SIZE=32, COLS=25, ROWS=14 constants
// TODO: Add tilemap[ROWS][COLS] 2D array

enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;
float coyote_timer = 0.0f;
float jump_buffer_timer = 0.0f;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "State: " << (player_state == GROUNDED ? "GROUNDED" : "AIRBORNE") << endl;
    cout << "FSM: active" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    cout << "Accel: " << ACCEL << endl;
    cout << "Friction: " << FRICTION << endl;
    cout << "MaxRun: " << MAX_RUN << endl;
    cout << "AirAccel: " << AIR_ACCEL << endl;
    cout << "Coyote: " << COYOTE_TIME << endl;
    cout << "Buffer: " << JUMP_BUFFER << endl;
    cout << "Platforms: " << PLAT_COUNT << endl;
    // TODO: Add cout << "TileSize: " << TILE_SIZE << endl;
    // TODO: Add cout << "Tiles: active" << endl;

    while (!WindowShouldClose()) {
        if (player_state == AIRBORNE && coyote_timer > 0) coyote_timer -= FIXED_DT;
        if (jump_buffer_timer > 0) jump_buffer_timer -= FIXED_DT;
        if (IsKeyPressed(KEY_SPACE)) jump_buffer_timer = JUMP_BUFFER;
        float accel = (player_state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            player_vx += accel * FIXED_DT;
            if (player_vx > MAX_RUN) player_vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player_vx -= accel * FIXED_DT;
            if (player_vx < -MAX_RUN) player_vx = -MAX_RUN;
        } else {
            if (player_vx > 0) {
                player_vx -= FRICTION * FIXED_DT;
                if (player_vx < 0) player_vx = 0;
            } else if (player_vx < 0) {
                player_vx += FRICTION * FIXED_DT;
                if (player_vx > 0) player_vx = 0;
            }
        }

        if (jump_buffer_timer > 0 && coyote_timer > 0) {
            player_vy = -JUMP_SPEED;
            player_state = AIRBORNE;
            coyote_timer = 0;
            jump_buffer_timer = 0;
        }

        if (player_state == AIRBORNE && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
            player_vy = -MIN_JUMP_VY;
        }

        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;
        player_x += player_vx * FIXED_DT;

        if (player_x < 0) player_x = 0;
        if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W;

        for (int i = 0; i < PLAT_COUNT; i++) {
            if (player_x + PLAYER_W > plat_x[i] &&
                player_x < plat_x[i] + plat_w[i] &&
                player_y + PLAYER_H >= plat_y[i] &&
                player_y + PLAYER_H <= plat_y[i] + 10 &&
                player_vy >= 0) {
                player_y = plat_y[i] - PLAYER_H;
                player_vy = 0;
                player_state = GROUNDED;
                coyote_timer = COYOTE_TIME;
            }
        }

        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            player_state = GROUNDED;
            coyote_timer = COYOTE_TIME;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);
        for (int i = 0; i < PLAT_COUNT; i++)
            DrawRectangle(plat_x[i], plat_y[i], plat_w[i], PLAT_H, DARKGREEN);
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(player_state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
float player_x = 388.0f;
float player_y = 100.0f;
float player_vy = 0.0f;
float player_vx = 0.0f;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const int GROUND_Y = 340;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;

const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;

int tilemap[ROWS][COLS] = {
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1,1,1},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
};

enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;
float coyote_timer = 0.0f;
float jump_buffer_timer = 0.0f;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "State: " << (player_state == GROUNDED ? "GROUNDED" : "AIRBORNE") << endl;
    cout << "FSM: active" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    cout << "Accel: " << ACCEL << endl;
    cout << "Friction: " << FRICTION << endl;
    cout << "MaxRun: " << MAX_RUN << endl;
    cout << "AirAccel: " << AIR_ACCEL << endl;
    cout << "Coyote: " << COYOTE_TIME << endl;
    cout << "Buffer: " << JUMP_BUFFER << endl;
    cout << "TileSize: " << TILE_SIZE << endl;
    cout << "Tiles: active" << endl;

    while (!WindowShouldClose()) {
        if (player_state == AIRBORNE && coyote_timer > 0) coyote_timer -= FIXED_DT;
        if (jump_buffer_timer > 0) jump_buffer_timer -= FIXED_DT;
        if (IsKeyPressed(KEY_SPACE)) jump_buffer_timer = JUMP_BUFFER;
        float accel = (player_state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            player_vx += accel * FIXED_DT;
            if (player_vx > MAX_RUN) player_vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player_vx -= accel * FIXED_DT;
            if (player_vx < -MAX_RUN) player_vx = -MAX_RUN;
        } else {
            if (player_vx > 0) {
                player_vx -= FRICTION * FIXED_DT;
                if (player_vx < 0) player_vx = 0;
            } else if (player_vx < 0) {
                player_vx += FRICTION * FIXED_DT;
                if (player_vx > 0) player_vx = 0;
            }
        }

        if (jump_buffer_timer > 0 && coyote_timer > 0) {
            player_vy = -JUMP_SPEED;
            player_state = AIRBORNE;
            coyote_timer = 0;
            jump_buffer_timer = 0;
        }

        if (player_state == AIRBORNE && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
            player_vy = -MIN_JUMP_VY;
        }

        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;
        player_x += player_vx * FIXED_DT;

        if (player_x < 0) player_x = 0;
        if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W;

        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            player_state = GROUNDED;
            coyote_timer = COYOTE_TIME;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(player_state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player position printed", expectedOutput: "Player: (388, 100)" },
      { id: "g2", description: "FSM active printed", expectedOutput: "FSM: active" },
      { id: "g3", description: "Coyote time printed", expectedOutput: "Coyote: 0.1" },
      { id: "g4", description: "Tile size printed", expectedOutput: "TileSize: 32" },
      { id: "g5", description: "Tiles active printed", expectedOutput: "Tiles: active" },
    ],
    hints: [
      "Add const int TILE_SIZE = 32; const int COLS = 25; const int ROWS = 14; at file scope. Then declare int tilemap[ROWS][COLS] = { ... };",
      "Replace the platform rendering loop with: for (int r = 0; r < ROWS; r++) for (int c = 0; c < COLS; c++) if (tilemap[r][c] == 1) DrawRectangle(...).",
      "Add cout << \"TileSize: \" << TILE_SIZE << endl; and cout << \"Tiles: active\" << endl; replacing the Platforms line.",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer11;
