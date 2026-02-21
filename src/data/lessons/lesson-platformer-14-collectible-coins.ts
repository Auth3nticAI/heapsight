import { Lesson } from "../../types/lesson";

const lessonPlatformer14: Lesson = {
  id: "platformer-14-collectible-coins",
  title: "Collectible Coins",
  description: "Add coin tiles (type 2) to the tilemap. Collect them by walking through, track a score counter.",
  order: 14,
  xpReward: 100,
  tier: "pro",
  concepts: ["tile types", "collection mechanic", "score counter", "tile clearing"],
  part1: {
    title: "Concept: Tile Types and Collection",
    type: "concept",
    instructions: `# Collectible Coins

## Mental Model
The tilemap already distinguishes between empty (\`0\`) and solid (\`1\`). Add a third type: \`2\` = coin. When the player overlaps a coin tile, set it to \`0\` (collected) and increment a score counter. This is the same AABB check as collision — but instead of stopping the player, you clear the tile and update a variable.

## The Pattern
\`\`\`cpp
int score = 0;

void checkCoins() {
    int top_row  = (int)(player_y / TILE_SIZE);
    int bot_row  = (int)((player_y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(player_x / TILE_SIZE);
    int right_col= (int)((player_x + PLAYER_W - 1) / TILE_SIZE);
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
\`\`\`

## Key Concepts
- Tile type 2: coin — same grid, new semantics
- Collection: check overlap, clear tile (set to 0), increment score
- Rendering: draw coins in YELLOW, walls in DARKGREEN
- Score HUD: display with DrawText

## Your Task
Simulate coin collection: set up a score, collect two coins, print the score.

## Mastery Check
**Q:** Why set \`tilemap[r][c] = 0\` when collecting a coin?
**A:** Setting to 0 removes the coin from the grid so it cannot be collected again. Without this, the score would increment every frame the player stands on that tile.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int score = 0;
    // TODO: Print "Score: 0"
    // TODO: Print "Coins: active"
    // TODO: Increment score twice (simulating 2 coins collected)
    // TODO: Print "Score: 2"
    // TODO: Print "Collected: 2"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int score = 0;
    cout << "Score: " << score << endl;
    cout << "Coins: active" << endl;
    score++;
    score++;
    cout << "Score: " << score << endl;
    cout << "Collected: 2" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Initial score printed", expectedOutput: "Score: 0" },
      { id: "t2", description: "Coins active printed", expectedOutput: "Coins: active" },
      { id: "t3", description: "Score after collection", expectedOutput: "Score: 2" },
      { id: "t4", description: "Collected count printed", expectedOutput: "Collected: 2" },
    ],
    hints: [
      "cout << \"Score: \" << score << endl; prints the current score.",
      "Increment score twice: score++; score++; then print Score: again.",
      "cout << \"Collected: 2\" << endl;",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Collectible Coins",
    type: "game_builder",
    instructions: `# Build: Collectible Coins

## Mental Model
Add tile type \`2\` to the tilemap as coins. Add a \`score\` counter. Add \`checkCoins()\` to collect overlapping coin tiles. Render coins in YELLOW.

## What's Already Here
Full tile collision platformer from Lesson 13: tilemap, checkTileCollisionV, checkTileCollisionH, full movement.

## Your Task
1. **Place coins in the tilemap:** Replace some \`0\` tiles with \`2\` in the empty spaces above platforms. For example, put coins at row 4 above each platform group.

2. **Add score variable:** \`int score = 0;\` at file scope.

3. **Add checkCoins function** at file scope:
\`\`\`cpp
int score = 0;

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
\`\`\`

4. **Call checkCoins()** in the game loop (after collision checks).

5. **Render coins in YELLOW** in the drawing loop: add an \`else if (tilemap[r][c] == 2)\` branch to draw \`YELLOW\` tiles.

6. **Add score HUD:** \`DrawText(TextFormat("Score: %d", score), 10, 35, 20, YELLOW);\`

7. **Update cout:** Add \`cout << "Score: " << score << endl;\` and \`cout << "Coins: active" << endl;\` after the H-collision line.

## Did It Work?
Walk through the yellow coin tiles. Each one should disappear and the score counter in the top-left should increment.`,
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
// TODO: Add int score = 0;

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

// TODO: Add checkCoins() function here

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
    // TODO: Add cout << "Score: " << score << endl;
    // TODO: Add cout << "Coins: active" << endl;

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
        // TODO: Add checkCoins();

        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                // TODO: Add else if (tilemap[r][c] == 2) to draw YELLOW coin tiles
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(player_state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        // TODO: Add DrawText(TextFormat("Score: %d", score), 10, 35, 20, YELLOW);
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
      { id: "p2-t1", description: "Player position printed", expectedOutput: "Player: (388, 100)" },
      { id: "p2-t2", description: "FSM active printed", expectedOutput: "FSM: active" },
      { id: "p2-t3", description: "Grid collision active", expectedOutput: "Collision: grid" },
      { id: "p2-t4", description: "Initial score printed", expectedOutput: "Score: 0" },
      { id: "p2-t5", description: "Coins active printed", expectedOutput: "Coins: active" },
    ],
    hints: [
      "Add int score = 0; at file scope. Add cout << \"Score: \" << score << endl; and cout << \"Coins: active\" << endl; after H-collision.",
      "Add checkCoins() function: loop over tiles the player overlaps, check if tilemap[r][c] == 2, then set to 0 and score++.",
      "In rendering: add else if (tilemap[r][c] == 2) DrawRectangle(..., YELLOW); to draw coins. Add DrawText(TextFormat(\"Score: %d\", score), ...) for the HUD.",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer14;
