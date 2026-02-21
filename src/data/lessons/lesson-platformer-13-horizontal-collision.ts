import { Lesson } from "../../types/lesson";

const lessonPlatformer13: Lesson = {
  id: "platformer-13-horizontal-collision",
  title: "Horizontal Collision",
  description: "Stop the player from walking through solid tiles. Check the side corners of the player against the tile grid.",
  order: 13,
  xpReward: 100,
  tier: "pro",
  concepts: ["horizontal tile collision", "side corners", "push out", "separated axes"],
  part1: {
    title: "Concept: Horizontal Tile Collision",
    type: "concept",
    instructions: `# Horizontal Collision

## Mental Model
Vertical collision checks the tiles at the player's feet. Horizontal collision checks the tiles at the player's sides. Apply them on separate axes — first move horizontally and resolve horizontal, then move vertically and resolve vertical. This prevents getting stuck in corners.

## The Pattern
\`\`\`cpp
void checkTileCollisionH() {
    // Check tile to the right of the player
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
    // Check tile to the left of the player
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
\`\`\`

## Key Concepts
- Separated axes: apply horizontal collision BEFORE vertical each frame
- Check two corners per side: top-right + bottom-right for right wall
- Push out: snap \`player_x\` to the tile boundary
- Zero velocity: stop \`player_vx\` on wall contact

## Your Task
Print collision direction labels for a wall hit simulation.

## Mastery Check
**Q:** Why check two corners per side instead of one?
**A:** A player can be between two tile rows. Checking only the top corner misses a wall that occupies the lower corner. Both corners must be clear for the player to pass through.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print "H-collision: active"
    // TODO: Print "Right wall: check"
    // TODO: Print "Left wall: check"
    // TODO: Print "Push out: ok"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "H-collision: active" << endl;
    cout << "Right wall: check" << endl;
    cout << "Left wall: check" << endl;
    cout << "Push out: ok" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "H-collision active", expectedOutput: "H-collision: active" },
      { id: "t2", description: "Right wall check", expectedOutput: "Right wall: check" },
      { id: "t3", description: "Left wall check", expectedOutput: "Left wall: check" },
      { id: "t4", description: "Push out ok", expectedOutput: "Push out: ok" },
    ],
    hints: [
      "Four cout statements: H-collision, Right wall, Left wall, Push out.",
      "cout << \"H-collision: active\" << endl;",
      "cout << \"Push out: ok\" << endl;",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Horizontal Collision",
    type: "game_builder",
    instructions: `# Build: Horizontal Collision

## Mental Model
Add \`checkTileCollisionH()\`. Apply it AFTER moving horizontally, BEFORE moving vertically. This separated-axis approach prevents corner sticking.

## What's Already Here
Grid collision platformer from Lesson 12: tilemap, \`checkTileCollisionV()\`, full movement system.

## Your Task
1. **Add a horizontal tile collision function** at file scope (after checkTileCollisionV):
\`\`\`cpp
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
\`\`\`

2. **Update the game loop:** After applying horizontal movement (\`player_x += player_vx * FIXED_DT\`), call \`checkTileCollisionH();\`. Then after applying vertical movement (\`player_y += player_vy * FIXED_DT\`), call \`checkTileCollisionV();\`. Remove the screen-edge clamp for X — the tilemap walls handle that.

3. **Update cout:** Add \`cout << "H-collision: active" << endl;\` after the Collision line.

## Did It Work?
Walk into a solid tile wall. The player should stop cleanly. Jump against a wall — no passing through. Edit some \`0\` tiles in the tilemap to \`1\` to create walls and test them.`,
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

// TODO: Add checkTileCollisionH() function here

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
    // TODO: Add cout << "H-collision: active" << endl;

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

        // TODO: Add checkTileCollisionH(); (after player_x update, before player_y update)
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
      { id: "p2-t3", description: "Grid collision active", expectedOutput: "Collision: grid" },
      { id: "p2-t4", description: "H-collision active", expectedOutput: "H-collision: active" },
      { id: "p2-t5", description: "Accel printed", expectedOutput: "Accel: 600" },
    ],
    hints: [
      "Add checkTileCollisionH() after checkTileCollisionV(). Check right_col when vx > 0, check left_col when vx < 0. Push player_x out on hit.",
      "In the game loop, apply movement on EACH axis separately: player_x += ...; checkTileCollisionH(); then player_y += ...; checkTileCollisionV();",
      "Add cout << \"H-collision: active\" << endl; in startup prints.",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer13;
