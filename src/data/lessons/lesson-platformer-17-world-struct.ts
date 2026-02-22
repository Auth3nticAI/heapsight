import { Lesson } from "../../types/lesson";

const lessonPlatformer17: Lesson = {
  id: "platformer-17-world-struct",
  title: "World Struct",
  description: "Bundle player, tilemap, and score into a single World struct. All systems take World by reference — one parameter, complete game state.",
  order: 17,
  xpReward: 100,
  tier: "pro",
  concepts: ["world struct", "state aggregation", "initWorld pattern", "reference parameters"],
  part1: {
    title: "Concept: World as Single State Container",
    type: "concept",
    instructions: `# World Struct

## Mental Model
Lesson 16 grouped the 7 player fields into a Player struct. Now go one level higher: group EVERYTHING — the player, the tilemap, and the score — into a single World struct. One function parameter gives you the entire observable game state. void update(World& w) replaces dozens of individual globals. The world IS the game.

## What Breaks Without This
With Player as a struct but tilemap and score as separate globals, your functions still have implicit dependencies: they access tilemap[][] and score directly from global scope. A World struct makes those dependencies explicit. If a function needs the tilemap, it takes World&. If it only needs the player, it takes Player&. The dependency is visible in the signature.

## The Fix: struct World
Bundle all mutable game state into one struct:

\`\`\`cpp
struct World {
    Player player;           // character state
    int tilemap[ROWS][COLS]; // tile grid
    int score;               // collected coins
};
\`\`\`

Because the World contains a 2D array, you cannot use brace initialization directly. Instead, use an initWorld function that sets fields individually:

\`\`\`cpp
void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    memcpy(w.tilemap, DEFAULT_MAP, sizeof(w.tilemap));
}
\`\`\`

## Key Concepts
- **World struct**: single observable game state — player, tiles, score
- **initWorld function**: explicit initialization — no hidden state
- **memcpy**: copies the default tilemap into the world (sizeof is the byte count)
- **w.player.x**: nested dot notation — World contains Player which contains float x

## Performance Insight
The World struct is large (ROWS * COLS * 4 bytes for tilemap + Player + score ~ 1440 bytes). Always pass it by reference, never by value. A value copy of World would copy 1440 bytes every function call — expensive. Pass World& everywhere: one pointer, zero copy.

## Memory Insight
At file scope, World w lives in the BSS segment (zero-initialized static storage). After initWorld(w), the tilemap holds level data. This is explicit initialization: you know exactly when and how the world state is set. No constructor magic, no hidden defaults.

## Your Task
Define a World struct with 3 fields (player, tilemap, score) and print its layout.

Expected output:
\`\`\`
Struct: World
Fields: player tilemap score
Player: (48, 350)
Score: 0
Pattern: world-struct
\`\`\`

## Beginner Trap
Trying to print w.tilemap — it is a 2D array, not a single value. Print individual fields instead: w.player.x, w.score. The tilemap is accessible as w.tilemap[row][col]. Double dot notation: w.player.x reads the x field of the player inside the world.

## Elite Insight
Unreal Engine's UWorld class is exactly this: a container for all game state (actors, level, physics world). Unity's Scene is similar. The difference: those engines use dynamic allocation and polymorphism. Your World is a plain struct — simpler, faster, and fully stack-friendly. The Cherno calls this "the game state blob" — one struct, one truth.

## Systems Thinking Connection
In the Space Shooter, the World equivalent was a collection of SoA arrays at file scope. The Platformer's World struct wraps all of those into a single named container. Same data, explicit ownership. Lesson 25 (Milestone: Restart & Resume) proves the value: to reset the game, you call initWorld(w) — one function resets everything.

## Mastery Check
**Q:** Why use an initWorld function instead of brace initialization for the World struct?
**A:** The World contains a 2D array (tilemap). C++ cannot brace-initialize arrays inside structs when you need non-zero values — you need memcpy or a loop to copy the default map. The initWorld function makes the initialization explicit and gives you a place to add more initialization logic later (enemy spawns, item placement, etc.).`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ROWS = 14;
const int COLS = 25;

enum MoveState { GROUNDED, AIRBORNE };
struct Player {
    float x = 48.0f, y = 350.0f;
    float vx = 0.0f, vy = 0.0f;
    MoveState state = GROUNDED;
    float coyote_timer = 0.0f;
    float jump_buffer_timer = 0.0f;
};

// TODO 1: Define struct World with 3 fields:
//   Player player;
//   int tilemap[ROWS][COLS];
//   int score;

// TODO 2: Declare: World w;

int main() {
    // TODO 3: Print "Struct: World"
    // TODO 4: Print "Fields: player tilemap score"
    // TODO 5: Print "Player: (48, 350)"
    // TODO 6: Print "Score: 0"
    // TODO 7: Print "Pattern: world-struct"
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ROWS = 14;
const int COLS = 25;

enum MoveState { GROUNDED, AIRBORNE };
struct Player {
    float x = 48.0f, y = 350.0f;
    float vx = 0.0f, vy = 0.0f;
    MoveState state = GROUNDED;
    float coyote_timer = 0.0f;
    float jump_buffer_timer = 0.0f;
};

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
};

World w;

int main() {
    w.player.x = 48.0f; w.player.y = 350.0f;
    w.score = 0;
    cout << "Struct: World" << endl;
    cout << "Fields: player tilemap score" << endl;
    cout << "Player: (" << (int)w.player.x << ", " << (int)w.player.y << ")" << endl;
    cout << "Score: " << w.score << endl;
    cout << "Pattern: world-struct" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "World struct name printed", expectedOutput: "Struct: World" },
      { id: "t2", description: "Fields listed", expectedOutput: "Fields: player tilemap score" },
      { id: "t3", description: "Player position printed", expectedOutput: "Player: (48, 350)" },
      { id: "t4", description: "Score printed", expectedOutput: "Score: 0" },
      { id: "t5", description: "Pattern printed", expectedOutput: "Pattern: world-struct" },
    ],
    hints: [
      "Define struct World with three fields: Player player, int tilemap[ROWS][COLS], and int score.",
      "Declare World w at file scope. Set w.player.x = 48.0f and w.player.y = 350.0f before printing.",
      "Use double dot notation: w.player.x reads x from the player inside the world.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: World Struct",
    type: "game_builder",
    instructions: `# Build: World Struct

## Mental Model
The Player struct from Lesson 16 now lives inside a World struct alongside the tilemap and score. One global World w replaces three separate globals. All collision functions take World& w and access w.player, w.tilemap, and w.score through the struct. The game plays identically — but the architecture is cleaner.

## What's Already Here
The World struct is defined, initWorld sets up all state, and the collision functions are updated to take World& w. Your task is to add the cout verification output and the HUD world label.

## Your Task
Add the world struct output after InitWindow:

\`\`\`cpp
cout << "Struct: World" << endl;
cout << "Fields: player tilemap score" << endl;
cout << "Player: (" << (int)w.player.x << ", " << (int)w.player.y << ")" << endl;
cout << "Score: " << w.score << endl;
cout << "Pattern: world-struct" << endl;
\`\`\`

And add to the render block:
\`\`\`cpp
DrawText("World struct: active", 10, 60, 16, LIME);
\`\`\`

## Did It Work?
Run the game. Console shows the World layout. The canvas shows "World struct: active" in green. The game plays identically to Lesson 16 — same physics, same level — but everything flows through one World reference.

## Beginner Trap
Accessing tilemap as w.tilemap without row/col indices. The tilemap is a 2D array — print individual cells as w.tilemap[row][col]. For rendering, loop: for(r) for(c) if(w.tilemap[r][c] == 1) DrawRectangle(...). The double dot w.tilemap[r][c] is valid: access world, then array element.

## Elite Insight
This pattern — one central state struct passed by reference — is the foundation of Lesson 35's full system pipeline: inputSystem(w), physicsSystem(w), collisionSystem(w), renderSystem(w). Each system receives the world and transforms it. The World struct makes that pipeline possible.`,
    starterCode: `#include <iostream>
#include <cstring>
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

const int DEFAULT_MAP[ROWS][COLS] = {
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

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
};

World w;

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    memcpy(w.tilemap, DEFAULT_MAP, sizeof(w.tilemap));
}

void checkTileCollisionV(World& w) {
    Player& p = w.player;
    int foot_col_l = (int)(p.x / TILE_SIZE);
    int foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && w.tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && w.tilemap[foot_row][foot_col_r] == 1)) {
        if (p.vy >= 0) {
            p.y = foot_row * TILE_SIZE - PLAYER_H;
            p.vy = 0;
            p.state = GROUNDED;
            p.coyote_timer = COYOTE_TIME;
        }
    }
}

void checkTileCollisionH(World& w) {
    Player& p = w.player;
    if (p.vx > 0) {
        int right_col = (int)((p.x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(p.y / TILE_SIZE);
        int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (w.tilemap[top_row][right_col] == 1 || w.tilemap[bot_row][right_col] == 1)) {
            p.x  = right_col * TILE_SIZE - PLAYER_W;
            p.vx = 0;
        }
    }
    if (p.vx < 0) {
        int left_col = (int)(p.x / TILE_SIZE);
        int top_row  = (int)(p.y / TILE_SIZE);
        int bot_row  = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (w.tilemap[top_row][left_col] == 1 || w.tilemap[bot_row][left_col] == 1)) {
            p.x  = (left_col + 1) * TILE_SIZE;
            p.vx = 0;
        }
    }
}

void checkCoins(World& w) {
    Player& p = w.player;
    int top_row   = (int)(p.y / TILE_SIZE);
    int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col  = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++) {
        for (int c = left_col; c <= right_col; c++) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 2) {
                w.tilemap[r][c] = 0;
                w.score++;
            }
        }
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);
    initWorld(w);

    // TODO 1: cout << "Struct: World" << endl;
    // TODO 2: cout << "Fields: player tilemap score" << endl;
    cout << "Player: (" << (int)w.player.x << ", " << (int)w.player.y << ")" << endl;
    cout << "Score: " << w.score << endl;
    // TODO 3: cout << "Pattern: world-struct" << endl;

    while (!WindowShouldClose()) {
        Player& p = w.player;
        if (p.state == AIRBORNE && p.coyote_timer > 0) p.coyote_timer -= FIXED_DT;
        if (p.jump_buffer_timer > 0) p.jump_buffer_timer -= FIXED_DT;
        if (IsKeyPressed(KEY_SPACE)) p.jump_buffer_timer = JUMP_BUFFER;
        float accel = (p.state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            p.vx += accel * FIXED_DT;
            if (p.vx > MAX_RUN) p.vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            p.vx -= accel * FIXED_DT;
            if (p.vx < -MAX_RUN) p.vx = -MAX_RUN;
        } else {
            if (p.vx > 0) { p.vx -= FRICTION * FIXED_DT; if (p.vx < 0) p.vx = 0; }
            else if (p.vx < 0) { p.vx += FRICTION * FIXED_DT; if (p.vx > 0) p.vx = 0; }
        }
        if (p.jump_buffer_timer > 0 && p.coyote_timer > 0) {
            p.vy = -JUMP_SPEED; p.state = AIRBORNE;
            p.coyote_timer = 0; p.jump_buffer_timer = 0;
        }
        if (p.state == AIRBORNE && !IsKeyDown(KEY_SPACE) && p.vy < -MIN_JUMP_VY)
            p.vy = -MIN_JUMP_VY;
        p.x += p.vx * FIXED_DT;
        checkTileCollisionH(w);
        p.vy += GRAVITY * FIXED_DT;
        p.y += p.vy * FIXED_DT;
        checkTileCollisionV(w);
        checkCoins(w);
        if (p.y > SCREEN_H) {
            p.x = 48.0f; p.y = 350.0f;
            p.vy = 0; p.vx = 0; p.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (w.tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (w.tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
        DrawRectangle((int)w.player.x, (int)w.player.y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        // TODO 4: DrawText("World struct: active", 10, 60, 16, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
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

const int DEFAULT_MAP[ROWS][COLS] = {
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

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
};

World w;

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    memcpy(w.tilemap, DEFAULT_MAP, sizeof(w.tilemap));
}

void checkTileCollisionV(World& w) {
    Player& p = w.player;
    int foot_col_l = (int)(p.x / TILE_SIZE);
    int foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && w.tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && w.tilemap[foot_row][foot_col_r] == 1)) {
        if (p.vy >= 0) {
            p.y = foot_row * TILE_SIZE - PLAYER_H;
            p.vy = 0;
            p.state = GROUNDED;
            p.coyote_timer = COYOTE_TIME;
        }
    }
}

void checkTileCollisionH(World& w) {
    Player& p = w.player;
    if (p.vx > 0) {
        int right_col = (int)((p.x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(p.y / TILE_SIZE);
        int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (w.tilemap[top_row][right_col] == 1 || w.tilemap[bot_row][right_col] == 1)) {
            p.x  = right_col * TILE_SIZE - PLAYER_W;
            p.vx = 0;
        }
    }
    if (p.vx < 0) {
        int left_col = (int)(p.x / TILE_SIZE);
        int top_row  = (int)(p.y / TILE_SIZE);
        int bot_row  = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (w.tilemap[top_row][left_col] == 1 || w.tilemap[bot_row][left_col] == 1)) {
            p.x  = (left_col + 1) * TILE_SIZE;
            p.vx = 0;
        }
    }
}

void checkCoins(World& w) {
    Player& p = w.player;
    int top_row   = (int)(p.y / TILE_SIZE);
    int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col  = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++) {
        for (int c = left_col; c <= right_col; c++) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 2) {
                w.tilemap[r][c] = 0;
                w.score++;
            }
        }
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);
    initWorld(w);

    cout << "Struct: World" << endl;
    cout << "Fields: player tilemap score" << endl;
    cout << "Player: (" << (int)w.player.x << ", " << (int)w.player.y << ")" << endl;
    cout << "Score: " << w.score << endl;
    cout << "Pattern: world-struct" << endl;

    while (!WindowShouldClose()) {
        Player& p = w.player;
        if (p.state == AIRBORNE && p.coyote_timer > 0) p.coyote_timer -= FIXED_DT;
        if (p.jump_buffer_timer > 0) p.jump_buffer_timer -= FIXED_DT;
        if (IsKeyPressed(KEY_SPACE)) p.jump_buffer_timer = JUMP_BUFFER;
        float accel = (p.state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            p.vx += accel * FIXED_DT;
            if (p.vx > MAX_RUN) p.vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            p.vx -= accel * FIXED_DT;
            if (p.vx < -MAX_RUN) p.vx = -MAX_RUN;
        } else {
            if (p.vx > 0) { p.vx -= FRICTION * FIXED_DT; if (p.vx < 0) p.vx = 0; }
            else if (p.vx < 0) { p.vx += FRICTION * FIXED_DT; if (p.vx > 0) p.vx = 0; }
        }
        if (p.jump_buffer_timer > 0 && p.coyote_timer > 0) {
            p.vy = -JUMP_SPEED; p.state = AIRBORNE;
            p.coyote_timer = 0; p.jump_buffer_timer = 0;
        }
        if (p.state == AIRBORNE && !IsKeyDown(KEY_SPACE) && p.vy < -MIN_JUMP_VY)
            p.vy = -MIN_JUMP_VY;
        p.x += p.vx * FIXED_DT;
        checkTileCollisionH(w);
        p.vy += GRAVITY * FIXED_DT;
        p.y += p.vy * FIXED_DT;
        checkTileCollisionV(w);
        checkCoins(w);
        if (p.y > SCREEN_H) {
            p.x = 48.0f; p.y = 350.0f;
            p.vy = 0; p.vx = 0; p.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (w.tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (w.tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
        DrawRectangle((int)w.player.x, (int)w.player.y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText("World struct: active", 10, 60, 16, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "World struct label in output", expectedOutput: "Struct: World" },
      { id: "g2", description: "Fields listed", expectedOutput: "Fields: player tilemap score" },
      { id: "g3", description: "Player position through world", expectedOutput: "Player: (48, 350)" },
      { id: "g4", description: "Score through world", expectedOutput: "Score: 0" },
      { id: "g5", description: "Pattern printed", expectedOutput: "Pattern: world-struct" },
    ],
    hints: [
      "Add five cout lines after initWorld(w): Struct, Fields, Player, Score, Pattern.",
      "Access player position as w.player.x and w.player.y. Cast to int for clean output: (int)w.player.x.",
      'Add DrawText("World struct: active", 10, 60, 16, LIME); in the render block after the score DrawText.',
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer17;