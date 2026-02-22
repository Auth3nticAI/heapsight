import { Lesson } from "../../types/lesson";

const lessonPlatformer16: Lesson = {
  id: "platformer-16-struct-extraction",
  title: "Struct Extraction",
  description: "Group the 7 player variables into a Player struct. Functions take Player by reference — the first step toward a World struct.",
  order: 16,
  xpReward: 100,
  tier: "pro",
  concepts: ["structs", "state bundling", "reference parameters", "refactoring"],
  part1: {
    title: "Concept: Struct as State Container",
    type: "concept",
    instructions: `# Struct Extraction

## Mental Model
After Lesson 15, your platformer has 7 separate file-scope variables tracking player state: player_x, player_y, player_vx, player_vy, player_state, coyote_timer, jump_buffer_timer. These are logically ONE thing: the player. A struct bundles them into a single named unit. When you pass one Player reference to a function, you pass everything. When you read one Player variable, you see the whole picture.

## What Breaks Without This
Every new function that touches the player needs 7 parameters: void resolveCollision(float x, float y, float vx, float vy, MoveState state, float coyote, float buffer). Miss one and physics breaks silently. Add a new player field and you update 15 function signatures. The struct eliminates this entirely.

## The Fix: struct Player
Define a struct that mirrors the player's logical state:

\`\`\`cpp
struct Player {
    float x, y;             // position
    float vx, vy;           // velocity
    MoveState state;        // GROUNDED or AIRBORNE
    float coyote_timer;     // grace window after leaving edge
    float jump_buffer_timer; // pre-land jump input window
};
\`\`\`

Functions take Player& p (a reference). The function can modify the player without copying 7 floats. p.x accesses the x field. p.state = GROUNDED updates the state. One parameter replaces seven.

## Key Concepts
- **struct**: a named group of related fields stored contiguously
- **Reference parameter** (Player& p): modifies the original, zero copy cost
- **Dot notation**: p.x reads the x field of player p
- **Brace initialization**: Player player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};

## Performance Insight
Passing Player& costs 8 bytes (one pointer). Passing 7 floats by value costs 28 bytes of stack work per call. The struct also improves cache locality: all 7 fields are contiguous, so accessing player.x loads player.y into cache line too.

## Memory Insight
The struct occupies the same total memory as the 7 separate variables (roughly 32 bytes). The difference is LAYOUT: contiguous block vs. potentially scattered globals. Contiguous layout is predictable and cache-friendly.

## Your Task
Define a Player struct with 7 fields and print its layout to prove it works.

Expected output:
\`\`\`
Struct: Player
Fields: x y vx vy state coyote jump_buffer
Before: 7 variables
After: 1 struct
Pattern: struct-extraction
\`\`\`

## Beginner Trap
Forgetting to initialize all fields. Writing Player player; leaves fields uninitialized (undefined behavior in C++). Always use brace initialization: Player player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};. Uninitialized floats cause invisible physics bugs that change every run.

## Elite Insight
Unity's Transform, Unreal's FVector, and the Cherno's ECS all use structs as the unit of entity state. Every major engine wraps character state in structs because the code reads like the design: the player HAS a position, not the game HAS 7 player_x variables scattered across file scope.

## Systems Thinking Connection
In the Space Shooter, you used SoA (parallel arrays: enemy_x[], enemy_y[], enemy_alive[]). SoA is optimal for batch processing 1000 enemies. For a SINGLE player entity, a struct (AoS) is cleaner. The trade-off: SoA for bulk entities, struct for individual complex actors.

## Mastery Check
**Q:** Why pass Player& (reference) instead of Player (by value) in collision functions?
**A:** By-value copies mean changes inside the function are lost when it returns. Collision functions MUST modify the player (clamp position, zero velocity) — they need a reference to the original. Copy semantics would silently discard every physics correction.`,
    starterCode: `#include <iostream>
using namespace std;

enum MoveState { GROUNDED, AIRBORNE };

struct Player {
    float x = 48.0f, y = 350.0f;
    float vx = 0.0f, vy = 0.0f;
    MoveState state = GROUNDED;
    float coyote_timer = 0.0f;
    float jump_buffer_timer = 0.0f;
};

int main() {
    Player p;
    // TODO 1: cout << "Struct: Player" << endl;
    // TODO 2: cout << "Fields: x y vx vy state coyote jump_buffer" << endl;
    // TODO 3: cout << "Before: 7 variables" << endl;
    // TODO 4: cout << "After: 1 struct" << endl;
    // TODO 5: cout << "Pattern: struct-extraction" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

enum MoveState { GROUNDED, AIRBORNE };

struct Player {
    float x = 48.0f, y = 350.0f;
    float vx = 0.0f, vy = 0.0f;
    MoveState state = GROUNDED;
    float coyote_timer = 0.0f;
    float jump_buffer_timer = 0.0f;
};

int main() {
    Player p;
    cout << "Struct: Player" << endl;
    cout << "Fields: x y vx vy state coyote jump_buffer" << endl;
    cout << "Before: 7 variables" << endl;
    cout << "After: 1 struct" << endl;
    cout << "Pattern: struct-extraction" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Struct name printed", expectedOutput: "Struct: Player" },
      { id: "t2", description: "Fields listed", expectedOutput: "Fields: x y vx vy state coyote jump_buffer" },
      { id: "t3", description: "Before count printed", expectedOutput: "Before: 7 variables" },
      { id: "t4", description: "After count printed", expectedOutput: "After: 1 struct" },
      { id: "t5", description: "Pattern printed", expectedOutput: "Pattern: struct-extraction" },
    ],
    hints: [
      "Five cout lines, one per TODO. Each prints exactly as shown in the expected output.",
      'cout << "Struct: Player" << endl; — the struct name matches the type name.',
      "The fields line lists all 7 field names separated by spaces: x y vx vy state coyote jump_buffer.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Player Struct",
    type: "game_builder",
    instructions: `# Build: Player Struct

## Mental Model
We refactored the 7 separate player globals into a Player struct. The game logic is identical. But now functions take Player& p and use p.x, p.vy, p.state. The struct is the player's identity. The game loop manipulates one named object instead of 7 unnamed floats.

## What's Already Here
The struct refactoring is complete: enum MoveState, struct Player, global Player player, and all three collision functions updated to take Player& p. Your task is to verify the refactoring with cout output and label it in the HUD.

## Your Task
Add the struct verification output and HUD label:

1. After InitWindow, add these cout lines:
\`\`\`cpp
cout << "Struct: Player" << endl;
cout << "Fields: x y vx vy state coyote jump_buffer" << endl;
cout << "Player: (" << player.x << ", " << player.y << ")" << endl;
cout << "Score: " << score << endl;
cout << "Pattern: struct-extraction" << endl;
\`\`\`

2. In the render block (after DrawText for score), add:
\`\`\`cpp
DrawText("Struct: Player", 10, 60, 16, LIME);
\`\`\`

## Did It Work?
Run the game. The console shows the struct layout. The canvas shows "Struct: Player" in green text below the score. The game plays identically to Lesson 15.

## Beginner Trap
Mixing old and new variable names. If you leave player_x alongside player.x, you have TWO positions and the struct refactoring is broken. The old separate variables must be completely removed.

## Elite Insight
This is the refactoring Carmack would call "data-first design." Before adding wall sliding (Lesson 42) or a dash mechanic (Lesson 41), you need one place to store the wall_slide_timer and dash_timer. The struct is that place.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
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

enum MoveState { GROUNDED, AIRBORNE };

struct Player {
    float x, y;
    float vx, vy;
    MoveState state;
    float coyote_timer;
    float jump_buffer_timer;
};

Player player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
int score = 0;

void checkTileCollisionV(Player& p) {
    int foot_col_l = (int)(p.x / TILE_SIZE);
    int foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && tilemap[foot_row][foot_col_r] == 1)) {
        if (p.vy >= 0) {
            p.y = foot_row * TILE_SIZE - PLAYER_H;
            p.vy = 0;
            p.state = GROUNDED;
            p.coyote_timer = COYOTE_TIME;
        }
    }
}

void checkTileCollisionH(Player& p) {
    if (p.vx > 0) {
        int right_col = (int)((p.x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(p.y / TILE_SIZE);
        int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (tilemap[top_row][right_col] == 1 || tilemap[bot_row][right_col] == 1)) {
            p.x  = right_col * TILE_SIZE - PLAYER_W;
            p.vx = 0;
        }
    }
    if (p.vx < 0) {
        int left_col = (int)(p.x / TILE_SIZE);
        int top_row  = (int)(p.y / TILE_SIZE);
        int bot_row  = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (tilemap[top_row][left_col] == 1 || tilemap[bot_row][left_col] == 1)) {
            p.x  = (left_col + 1) * TILE_SIZE;
            p.vx = 0;
        }
    }
}

void checkCoins(Player& p) {
    int top_row   = (int)(p.y / TILE_SIZE);
    int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col  = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
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
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // TODO 1: cout << "Struct: Player" << endl;
    // TODO 2: cout << "Fields: x y vx vy state coyote jump_buffer" << endl;
    cout << "Player: (" << player.x << ", " << player.y << ")" << endl;
    cout << "Score: " << score << endl;
    // TODO 3: cout << "Pattern: struct-extraction" << endl;

    while (!WindowShouldClose()) {
        if (player.state == AIRBORNE && player.coyote_timer > 0) player.coyote_timer -= FIXED_DT;
        if (player.jump_buffer_timer > 0) player.jump_buffer_timer -= FIXED_DT;
        if (IsKeyPressed(KEY_SPACE)) player.jump_buffer_timer = JUMP_BUFFER;
        float accel = (player.state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            player.vx += accel * FIXED_DT;
            if (player.vx > MAX_RUN) player.vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player.vx -= accel * FIXED_DT;
            if (player.vx < -MAX_RUN) player.vx = -MAX_RUN;
        } else {
            if (player.vx > 0) {
                player.vx -= FRICTION * FIXED_DT;
                if (player.vx < 0) player.vx = 0;
            } else if (player.vx < 0) {
                player.vx += FRICTION * FIXED_DT;
                if (player.vx > 0) player.vx = 0;
            }
        }
        if (player.jump_buffer_timer > 0 && player.coyote_timer > 0) {
            player.vy = -JUMP_SPEED;
            player.state = AIRBORNE;
            player.coyote_timer = 0;
            player.jump_buffer_timer = 0;
        }
        if (player.state == AIRBORNE && !IsKeyDown(KEY_SPACE) && player.vy < -MIN_JUMP_VY) {
            player.vy = -MIN_JUMP_VY;
        }
        player.x += player.vx * FIXED_DT;
        checkTileCollisionH(player);
        player.vy += GRAVITY * FIXED_DT;
        player.y += player.vy * FIXED_DT;
        checkTileCollisionV(player);
        checkCoins(player);
        if (player.y > SCREEN_H) {
            player.x = 48.0f; player.y = 350.0f;
            player.vy = 0; player.vx = 0;
            player.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
        DrawRectangle((int)player.x, (int)player.y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", score), 10, 35, 20, YELLOW);
        // TODO 4: DrawText("Struct: Player", 10, 60, 16, LIME);
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

enum MoveState { GROUNDED, AIRBORNE };

struct Player {
    float x, y;
    float vx, vy;
    MoveState state;
    float coyote_timer;
    float jump_buffer_timer;
};

Player player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
int score = 0;

void checkTileCollisionV(Player& p) {
    int foot_col_l = (int)(p.x / TILE_SIZE);
    int foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && tilemap[foot_row][foot_col_r] == 1)) {
        if (p.vy >= 0) {
            p.y = foot_row * TILE_SIZE - PLAYER_H;
            p.vy = 0;
            p.state = GROUNDED;
            p.coyote_timer = COYOTE_TIME;
        }
    }
}

void checkTileCollisionH(Player& p) {
    if (p.vx > 0) {
        int right_col = (int)((p.x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(p.y / TILE_SIZE);
        int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (tilemap[top_row][right_col] == 1 || tilemap[bot_row][right_col] == 1)) {
            p.x  = right_col * TILE_SIZE - PLAYER_W;
            p.vx = 0;
        }
    }
    if (p.vx < 0) {
        int left_col = (int)(p.x / TILE_SIZE);
        int top_row  = (int)(p.y / TILE_SIZE);
        int bot_row  = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (tilemap[top_row][left_col] == 1 || tilemap[bot_row][left_col] == 1)) {
            p.x  = (left_col + 1) * TILE_SIZE;
            p.vx = 0;
        }
    }
}

void checkCoins(Player& p) {
    int top_row   = (int)(p.y / TILE_SIZE);
    int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col  = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
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
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    cout << "Struct: Player" << endl;
    cout << "Fields: x y vx vy state coyote jump_buffer" << endl;
    cout << "Player: (" << player.x << ", " << player.y << ")" << endl;
    cout << "Score: " << score << endl;
    cout << "Pattern: struct-extraction" << endl;

    while (!WindowShouldClose()) {
        if (player.state == AIRBORNE && player.coyote_timer > 0) player.coyote_timer -= FIXED_DT;
        if (player.jump_buffer_timer > 0) player.jump_buffer_timer -= FIXED_DT;
        if (IsKeyPressed(KEY_SPACE)) player.jump_buffer_timer = JUMP_BUFFER;
        float accel = (player.state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            player.vx += accel * FIXED_DT;
            if (player.vx > MAX_RUN) player.vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player.vx -= accel * FIXED_DT;
            if (player.vx < -MAX_RUN) player.vx = -MAX_RUN;
        } else {
            if (player.vx > 0) {
                player.vx -= FRICTION * FIXED_DT;
                if (player.vx < 0) player.vx = 0;
            } else if (player.vx < 0) {
                player.vx += FRICTION * FIXED_DT;
                if (player.vx > 0) player.vx = 0;
            }
        }
        if (player.jump_buffer_timer > 0 && player.coyote_timer > 0) {
            player.vy = -JUMP_SPEED;
            player.state = AIRBORNE;
            player.coyote_timer = 0;
            player.jump_buffer_timer = 0;
        }
        if (player.state == AIRBORNE && !IsKeyDown(KEY_SPACE) && player.vy < -MIN_JUMP_VY) {
            player.vy = -MIN_JUMP_VY;
        }
        player.x += player.vx * FIXED_DT;
        checkTileCollisionH(player);
        player.vy += GRAVITY * FIXED_DT;
        player.y += player.vy * FIXED_DT;
        checkTileCollisionV(player);
        checkCoins(player);
        if (player.y > SCREEN_H) {
            player.x = 48.0f; player.y = 350.0f;
            player.vy = 0; player.vx = 0;
            player.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
        DrawRectangle((int)player.x, (int)player.y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", score), 10, 35, 20, YELLOW);
        DrawText("Struct: Player", 10, 60, 16, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Struct name in output", expectedOutput: "Struct: Player" },
      { id: "g2", description: "Fields listed in output", expectedOutput: "Fields: x y vx vy state coyote jump_buffer" },
      { id: "g3", description: "Player position printed", expectedOutput: "Player: (48, 350)" },
      { id: "g4", description: "Score printed", expectedOutput: "Score: 0" },
      { id: "g5", description: "Pattern printed", expectedOutput: "Pattern: struct-extraction" },
    ],
    hints: [
      "Add five cout lines right after SetTargetFPS(60). The player position uses player.x and player.y (dot notation).",
      'For the HUD label, add DrawText inside the render block after the score line: DrawText("Struct: Player", 10, 60, 16, LIME);',
      "player.x is 48.0f and player.y is 350.0f — the output shows them as whole numbers: Player: (48, 350).",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer16;