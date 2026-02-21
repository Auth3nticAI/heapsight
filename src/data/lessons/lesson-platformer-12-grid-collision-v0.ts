import { Lesson } from "../../types/lesson";

const lessonPlatformer12: Lesson = {
  id: "platformer-12-grid-collision-v0",
  title: "Grid Collision v0",
  description: "Make the player land on solid tiles. Convert pixel position to tile coordinates using integer division.",
  order: 12,
  xpReward: 100,
  tier: "pro",
  concepts: ["pixel to tile conversion", "AABB vs tilemap", "tile collision", "floor snapping"],
  part1: {
    title: "Concept: Pixel to Tile Conversion",
    type: "concept",
    instructions: `# Grid Collision v0

## Mental Model
To check which tile a pixel position occupies, divide by TILE_SIZE using integer division. To check tile (r, c), multiply by TILE_SIZE to get back to pixels. This bidirectional conversion is the core of all tile-based collision.

## The Pattern
\`\`\`cpp
// Convert pixel to tile coordinates
int tile_col = (int)(px / TILE_SIZE);
int tile_row = (int)(py / TILE_SIZE);

// Vertical collision: check tile below player's feet
int foot_col_left  = (int)(player_x / TILE_SIZE);
int foot_col_right = (int)((player_x + PLAYER_W - 1) / TILE_SIZE);
int foot_row       = (int)((player_y + PLAYER_H) / TILE_SIZE);

if (foot_row < ROWS && tilemap[foot_row][foot_col_left]  == 1 ||
                        tilemap[foot_row][foot_col_right] == 1) {
    player_y  = foot_row * TILE_SIZE - PLAYER_H;
    player_vy = 0;
    player_state = GROUNDED;
    coyote_timer = COYOTE_TIME;
}
\`\`\`

## Key Concepts
- Integer division converts pixel to tile: \`px / TILE_SIZE\`
- Check BOTH corners of the player's foot line
- Floor snap: set \`player_y = foot_row * TILE_SIZE - PLAYER_H\`
- GROUND_Y can be removed once all collision is tile-based

## Your Task
Print tile conversions for two sample positions.

## Mastery Check
**Q:** Player is at x=96, y=160. What tile is their center in?
**A:** col = 96/32 = 3, row = 160/32 = 5. Tile (5, 3).`,
    starterCode: `#include <iostream>
using namespace std;

const int TILE_SIZE = 32;

int main() {
    // Pixel position (96, 160)
    int px = 96, py = 160;
    // TODO: Print "Tile col: 3"  (px / TILE_SIZE)
    // TODO: Print "Tile row: 5"  (py / TILE_SIZE)
    // TODO: Print "Grid collision: active"
    // TODO: Print "Snap: ok"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int TILE_SIZE = 32;

int main() {
    int px = 96, py = 160;
    cout << "Tile col: " << (px / TILE_SIZE) << endl;
    cout << "Tile row: " << (py / TILE_SIZE) << endl;
    cout << "Grid collision: active" << endl;
    cout << "Snap: ok" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Tile column printed", expectedOutput: "Tile col: 3" },
      { id: "t2", description: "Tile row printed", expectedOutput: "Tile row: 5" },
      { id: "t3", description: "Grid collision active", expectedOutput: "Grid collision: active" },
      { id: "t4", description: "Snap printed", expectedOutput: "Snap: ok" },
    ],
    hints: [
      "cout << \"Tile col: \" << (px / TILE_SIZE) << endl; uses integer division.",
      "cout << \"Tile row: \" << (py / TILE_SIZE) << endl;",
      "Then cout << \"Grid collision: active\" << endl; and cout << \"Snap: ok\" << endl;",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Grid Collision v0",
    type: "game_builder",
    instructions: `# Build: Grid Collision v0

## Mental Model
Replace the \`GROUND_Y\` collision check with tile-based vertical collision. Check the tile at the player's feet each frame. If it is solid, snap the player to the tile top.

## What's Already Here
Tile grid platformer from Lesson 11: tilemap[ROWS][COLS], visual rendering, FSM, full movement.

## Your Task
1. **Add a vertical tile collision function** at file scope (before main):
\`\`\`cpp
void checkTileCollisionV() {
    int foot_col_l = (int)(player_x / TILE_SIZE);
    int foot_col_r = (int)((player_x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((player_y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && tilemap[foot_row][foot_col_r] == 1)) {
        if (player_vy >= 0) {
            player_y = foot_row * TILE_SIZE - PLAYER_H;
            player_vy = 0;
            player_state = GROUNDED;
            coyote_timer = COYOTE_TIME;
        }
    }
}
\`\`\`

2. **Replace the GROUND_Y collision block** with a call to the new function:
\`\`\`cpp
checkTileCollisionV();
\`\`\`

3. **Update cout:** Replace \`cout << "Tiles: active" << endl;\` with:
\`\`\`cpp
cout << "Tiles: active" << endl;
cout << "Collision: grid" << endl;
\`\`\`

## Did It Work?
Jump onto the tile platforms. The player should land cleanly on each tile row. The bottom row of solid tiles acts as the ground. Try modifying a \`1\` in the tilemap to \`0\` to create a gap.`,
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

// TODO: Add checkTileCollisionV() function here

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
    // TODO: Add cout << "Collision: grid" << endl;

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

        // TODO: Replace the GROUND_Y block below with: checkTileCollisionV();
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

void checkTileCollisionV() {
    int foot_col_l = (int)(player_x / TILE_SIZE);
    int foot_col_r = (int)((player_x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((player_y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && tilemap[foot_row][foot_col_r] == 1)) {
        if (player_vy >= 0) {
            player_y = foot_row * TILE_SIZE - PLAYER_H;
            player_vy = 0;
            player_state = GROUNDED;
            coyote_timer = COYOTE_TIME;
        }
    }
}

int main() {
    InitWindow(800, 450, "HeapSight Platformer");
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
    cout << "Collision: grid" << endl;

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
        if (player_x + PLAYER_W > 800) player_x = 800 - PLAYER_W;

        checkTileCollisionV();

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
      { id: "p2-t1", description: "Player position printed", expectedOutput: "Player: (388, 100)" },
      { id: "p2-t2", description: "FSM active printed", expectedOutput: "FSM: active" },
      { id: "p2-t3", description: "Tile size printed", expectedOutput: "TileSize: 32" },
      { id: "p2-t4", description: "Tiles active printed", expectedOutput: "Tiles: active" },
      { id: "p2-t5", description: "Grid collision active", expectedOutput: "Collision: grid" },
    ],
    hints: [
      "Add checkTileCollisionV() before main(). It converts player pixel position to tile row/col and checks if that tile is solid.",
      "Inside the function: foot_col_l = player_x / TILE_SIZE, foot_col_r = (player_x + PLAYER_W - 1) / TILE_SIZE, foot_row = (player_y + PLAYER_H) / TILE_SIZE.",
      "Replace the GROUND_Y block with checkTileCollisionV(); and add cout << \"Collision: grid\" << endl;",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer12;
