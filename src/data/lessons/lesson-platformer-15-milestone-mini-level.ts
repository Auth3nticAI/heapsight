import { Lesson } from "../../types/lesson";

const lessonPlatformer15: Lesson = {
  id: "platformer-15-milestone-mini-level",
  title: "Milestone: Mini Level",
  description: "Phase 2 complete. A fully playable mini level with tilemap collision, coins, and score. Design your own layout.",
  order: 15,
  xpReward: 300,
  tier: "pro",
  concepts: ["milestone", "level design", "phase 2 integration", "complete game loop"],
  part1: {
    title: "Concept: Phase 2 Complete",
    type: "concept",
    instructions: `# Milestone: Mini Level

## What You Built in Phase 2
- **L11:** Tile grid data — 2D array replaces hardcoded platform arrays
- **L12:** Grid collision v0 — player lands on solid tiles
- **L13:** Horizontal collision — player cannot walk through walls
- **L14:** Collectible coins — tile type 2, score counter

Together these form a **data-driven platformer**: change the numbers in the tilemap array and the entire level changes. No code changes required.

## What Is Level Design?
Level design is placing tiles to create interesting challenges. A good mini level has:
- A clear ground to start on
- Platforms at different heights requiring jumps
- Coins that reward exploration
- Some gaps that require precise jumps

## Your Task for Part 2
The code is complete from Lesson 14. Your job is to **design a new level** by editing the tilemap array. Create a layout that:
1. Has solid ground at the bottom
2. Has at least 3 platforms at different heights
3. Has at least 6 coins placed above platforms or in the air
4. Has at least one gap in the ground

## Mastery Check
**Q:** What is the minimum number of lines of code needed to add a new platform to this game?
**A:** One line — change a \`0\` to a \`1\` in the tilemap. That is the power of data-driven design.

## Beginner Trap
**Declaring the milestone complete without testing edge cases.** Walk into every wall corner, jump at every ledge edge, collect every coin. If even one collision fails or one coin is missed, the tile system has a bug.

## Elite Insight
Nintendo playtests every Mario level by having testers try to break every surface. The QA phrase is "walk every wall." Your milestone requires the same discipline: systematic verification of every collidable tile.

## Systems Thinking Connection
RPG L15 and Shooter L15 hit the same data layout milestone. The foundation is identical: stable state, correct collision, functional pickups. Genre-specific features build on this shared architecture.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print "Phase: 2 complete"
    // TODO: Print "Tilemap: active"
    // TODO: Print "Coins: active"
    // TODO: Print "Score: 0"
    // TODO: Print "Mini level: ready"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Phase: 2 complete" << endl;
    cout << "Tilemap: active" << endl;
    cout << "Coins: active" << endl;
    cout << "Score: 0" << endl;
    cout << "Mini level: ready" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Phase 2 complete", expectedOutput: "Phase: 2 complete" },
      { id: "t2", description: "Tilemap active", expectedOutput: "Tilemap: active" },
      { id: "t3", description: "Coins active", expectedOutput: "Coins: active" },
      { id: "t4", description: "Score zero", expectedOutput: "Score: 0" },
      { id: "t5", description: "Mini level ready", expectedOutput: "Mini level: ready" },
    ],
    hints: [
      "Five cout statements: Phase, Tilemap, Coins, Score, Mini level.",
      "cout << \"Phase: 2 complete\" << endl;",
      "cout << \"Mini level: ready\" << endl;",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Mini Level",
    type: "game_builder",
    instructions: `# Build: Mini Level

## Mental Model
This is the complete Phase 2 platformer. The only change from Lesson 14 is a new, more interesting tilemap layout. Redesign the level to be playable and fun. The code is unchanged — just the data.

## What's Already Here
Complete tile platformer from Lesson 14: tilemap, full collision, coins, score HUD.

## Your Task
1. **Redesign the tilemap** to create a more interesting mini level. The example below has a gap in the ground, staircase platforms, and coins scattered throughout.

Replace the tilemap with:
\`\`\`cpp
int tilemap[ROWS][COLS] = {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
};
\`\`\`

2. **Add the total coin count to cout:** Add \`cout << "Mini level: ready" << endl;\` after the Coins line.

3. **Update cout:** Replace \`cout << "Score: ..." << endl;\` with fresh \`score\` value (still 0 at start) and add the milestone label.

## Did It Work?
Explore the level. The walls (column 0 and 24) keep the player inside. The gaps in the ground create pits. Collect all the coins to see the score climb. Try modifying the tilemap to create your own level design.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
float player_x = 48.0f;
float player_y = 350.0f;
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

// TODO: Replace tilemap with the new mini level design (from instructions)
int tilemap[ROWS][COLS] = {
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0},
    {0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0},
    {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},
    {0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,0,0},
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
int score = 0;

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

void checkTileCollisionH() {
    if (player_vx > 0) {
        int right_col = (int)((player_x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(player_y / TILE_SIZE);
        int bot_row   = (int)((player_y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (tilemap[top_row][right_col] == 1 || tilemap[bot_row][right_col] == 1)) {
            player_x  = right_col * TILE_SIZE - PLAYER_W;
            player_vx = 0;
        }
    }
    if (player_vx < 0) {
        int left_col = (int)(player_x / TILE_SIZE);
        int top_row  = (int)(player_y / TILE_SIZE);
        int bot_row  = (int)((player_y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (tilemap[top_row][left_col] == 1 || tilemap[bot_row][left_col] == 1)) {
            player_x  = (left_col + 1) * TILE_SIZE;
            player_vx = 0;
        }
    }
}

void checkCoins() {
    int top_row   = (int)(player_y / TILE_SIZE);
    int bot_row   = (int)((player_y + PLAYER_H - 1) / TILE_SIZE);
    int left_col  = (int)(player_x / TILE_SIZE);
    int right_col = (int)((player_x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++) {
        for (int c = left_col; c <= right_col; c++) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS &&
                tilemap[r][c] == 2) {
                tilemap[r][c] = 0;
                score++;
            }
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
    cout << "H-collision: active" << endl;
    cout << "Score: " << score << endl;
    cout << "Coins: active" << endl;
    // TODO: Add cout << "Mini level: ready" << endl;

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

        player_x += player_vx * FIXED_DT;
        checkTileCollisionH();
        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;
        checkTileCollisionV();
        checkCoins();

        // Reset if fallen out of bounds
        if (player_y > SCREEN_H) {
            player_x = 48.0f;
            player_y = 350.0f;
            player_vy = 0;
            player_vx = 0;
            player_state = GROUNDED;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(player_state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", score), 10, 35, 20, YELLOW);
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
float player_x = 48.0f;
float player_y = 350.0f;
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
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
};

enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;
float coyote_timer = 0.0f;
float jump_buffer_timer = 0.0f;
int score = 0;

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

void checkTileCollisionH() {
    if (player_vx > 0) {
        int right_col = (int)((player_x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(player_y / TILE_SIZE);
        int bot_row   = (int)((player_y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (tilemap[top_row][right_col] == 1 || tilemap[bot_row][right_col] == 1)) {
            player_x  = right_col * TILE_SIZE - PLAYER_W;
            player_vx = 0;
        }
    }
    if (player_vx < 0) {
        int left_col = (int)(player_x / TILE_SIZE);
        int top_row  = (int)(player_y / TILE_SIZE);
        int bot_row  = (int)((player_y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (tilemap[top_row][left_col] == 1 || tilemap[bot_row][left_col] == 1)) {
            player_x  = (left_col + 1) * TILE_SIZE;
            player_vx = 0;
        }
    }
}

void checkCoins() {
    int top_row   = (int)(player_y / TILE_SIZE);
    int bot_row   = (int)((player_y + PLAYER_H - 1) / TILE_SIZE);
    int left_col  = (int)(player_x / TILE_SIZE);
    int right_col = (int)((player_x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++) {
        for (int c = left_col; c <= right_col; c++) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS &&
                tilemap[r][c] == 2) {
                tilemap[r][c] = 0;
                score++;
            }
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
    cout << "H-collision: active" << endl;
    cout << "Score: " << score << endl;
    cout << "Coins: active" << endl;
    cout << "Mini level: ready" << endl;

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

        player_x += player_vx * FIXED_DT;
        checkTileCollisionH();
        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;
        checkTileCollisionV();
        checkCoins();

        if (player_y > SCREEN_H) {
            player_x = 48.0f;
            player_y = 350.0f;
            player_vy = 0;
            player_vx = 0;
            player_state = GROUNDED;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(player_state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", score), 10, 35, 20, YELLOW);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player position printed", expectedOutput: "Player: (48, 350)" },
      { id: "g2", description: "FSM active printed", expectedOutput: "FSM: active" },
      { id: "g3", description: "Coins active printed", expectedOutput: "Coins: active" },
      { id: "g4", description: "Score printed", expectedOutput: "Score: 0" },
      { id: "g5", description: "Mini level ready", expectedOutput: "Mini level: ready" },
    ],
    hints: [
      "Replace the tilemap with the new mini level layout from the instructions. The player starts at (48, 350).",
      "Add cout << \"Mini level: ready\" << endl; after the Coins line.",
      "The player spawn position changed to x=48, y=350 — make sure player_x and player_y are set correctly.",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer15;
