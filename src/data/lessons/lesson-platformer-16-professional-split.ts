import type { Lesson } from "@/types/lesson";

const lessonPlatformer16: Lesson = {
  id: "platformer-16-professional-split",
  title: "The Professional Split",
  description: "Split your growing codebase into header and source files \u2014 the same pattern every professional C++ project uses to manage complexity.",
  order: 16,
  xpReward: 100,
  tier: "pro",
  concepts: ["header files", "#pragma once", "forward declarations", "translation units", "multi-file projects"],
  part1: {
    title: "Concept: Headers vs Source Files",
    type: "concept",
    instructions: `# The Professional Split

## Mental Model
Your platformer is 80+ lines in one file. Professional C++ projects have hundreds of files. How do they avoid chaos? They split every concern into two files: a **header** (.h) that declares WHAT exists, and a **source** (.cpp) that defines HOW it works. Think of a header as a menu and the source as the kitchen.

## What Breaks Without This
As your program grows, compilation slows to a crawl. Change one function and the compiler rebuilds everything. Circular dependencies crash the build. Two files that both define the same struct cause \"multiple definition\" errors. Headers solve all of this.

## The Fix: Header/Source Split
**Header file (hs_player.h):**
\`\`\`cpp
#pragma once          // prevents double-include
#include \"raylib.h\"   // types we need (Color, etc.)

struct Player {
    float x, y;
    float vx, vy;
};

void checkTileCollisionV(Player& p);   // declaration only \u2014 no body
\`\`\`

**Source file (hs_player.cpp):**
\`\`\`cpp
#include \"hs_player.h\"

void checkTileCollisionV(Player& p) {  // definition \u2014 the actual code
    // implementation here
}
\`\`\`

**Main file (main.cpp):**
\`\`\`cpp
#include \"hs_player.h\"       // now main.cpp knows about Player
                             // but doesn't see the implementation
\`\`\`

## Key Concepts
- \`#pragma once\` \u2014 tells the compiler \"only include this file once per translation unit\"
- **Declaration** \u2014 tells the compiler a function EXISTS (signature only, no body)
- **Definition** \u2014 provides the actual implementation (the body with { })
- Each .cpp file is a separate **translation unit** \u2014 compiled independently, then linked

## Performance Insight
Headers don't add runtime cost. Zero. They're a compile-time organizing tool. The linker combines all .cpp files into one binary. Same performance as a single-file program, but 10x easier to maintain.

## Memory Insight
No extra memory. The split is purely organizational. One binary, same layout, same performance. The header tells the compiler what shapes to expect; the source fills them in.

## Your Task
Model the split conceptually. Declare a Player struct with x, y, vx, vy, then implement an initPlayer function and print the split info.

Expected output:
\`\`\`
Files: 2
Guard: pragma once
Pattern: declaration/definition split
\`\`\`

## Beginner Trap
Don't put function DEFINITIONS in headers. If two .cpp files include a header with a function body, the linker sees two copies and throws a \"multiple definition\" error. Headers declare. Sources define.

## Elite Insight
Google's C++ style guide mandates: every .cc file has a matching .h file. The Linux kernel uses the same pattern (though with .c files). Unreal Engine has 40,000+ header files. This isn't optional at scale \u2014 it's survival.

## Systems Thinking Connection
Shooter Lesson 16 splits world logic the same way. RPG Lesson 16 splits the command queue. Same pattern, different domain. Learn it once, use it everywhere.

## Skill Reinforcement
Built on: L15 mini-level milestone \u2014 the codebase you'll split into headers.
Feeds into: L31+ module split \u2014 each system gets its own header/source pair.

## Mastery Check
*Question:* You put \`void checkTileCollisionV(Player& p) { ... }\` in a header. Two .cpp files include it. What error?
*Answer:* \"multiple definition of checkTileCollisionV\" \u2014 the linker sees two identical function bodies. Move the body to a .cpp file, keep only the declaration in the header.`,
    starterCode: `#include <iostream>
using namespace std;

// Simulating a header/source split in a single file
// "HEADER" section \u2014 declarations
struct Player {
    float x, y;
    float vx, vy;
};

void initPlayer(Player& p);  // declaration only

// "SOURCE" section \u2014 definitions
// TODO 1: Define initPlayer: void initPlayer(Player& p) { p.x = 48; p.y = 350; p.vx = 0; p.vy = 0; }

int main() {
    Player p;
    // TODO 2: Call initPlayer(p);
    // TODO 3: cout << "Files: 2" << endl;
    // TODO 4: cout << "Guard: pragma once" << endl;
    // TODO 5: cout << "Pattern: declaration/definition split" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Player {
    float x, y;
    float vx, vy;
};

void initPlayer(Player& p);

void initPlayer(Player& p) {
    p.x = 48; p.y = 350; p.vx = 0; p.vy = 0;
}

int main() {
    Player p;
    initPlayer(p);
    cout << "Files: 2" << endl;
    cout << "Guard: pragma once" << endl;
    cout << "Pattern: declaration/definition split" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Reports file count", expectedOutput: "Files: 2" },
      { id: "t2", description: "Reports header guard type", expectedOutput: "Guard: pragma once" },
      { id: "t3", description: "Confirms split pattern", expectedOutput: "Pattern: declaration/definition split" },
    ],
    hints: [
      "initPlayer needs a body: void initPlayer(Player& p) { p.x = 48; p.y = 350; p.vx = 0; p.vy = 0; } \u2014 put it below the declaration.",
      "Call initPlayer(p) in main before the cout lines. The function initializes the Player struct.",
      "Three cout lines \u2014 Files: 2, Guard: pragma once, Pattern: declaration/definition split. Copy them exactly.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: The Professional Split",
    type: "game_builder",
    instructions: `# Build: The Professional Split

## Mental Model
Your platformer lives in one big file. Time to go professional. You'll split the Player struct and its collision functions into a proper header/source pair, just like every C++ project with more than 500 lines.

## What's Already Here
Three files are open in your editor tabs:

**hs_player.h** \u2014 The header. Contains \`#pragma once\`, all constants, the tilemap, the Player struct, and function declarations. This file is COMPLETE \u2014 don't change it.

**hs_player.cpp** \u2014 The source. Has \`#include "hs_player.h"\` at the top. Function STUBS are here with TODOs. Your job: fill in the bodies.

**main.cpp** \u2014 The game loop. Includes \`hs_player.h\` and uses the functions you'll implement. This file is COMPLETE \u2014 don't change it.

## Your Task
Work in **hs_player.cpp** only. Implement three functions:

**TODO 1** \u2014 \`checkTileCollisionV\`: Check the two foot tiles (left and right columns at foot row). If either is solid (tilemap == 1) and player is falling (vy >= 0), snap y to the tile top, zero vy, set state to GROUNDED, reset coyote timer.

**TODO 2** \u2014 \`checkTileCollisionH\`: Two blocks: one for vx > 0 (check right edge), one for vx < 0 (check left edge). If wall tile found, snap x and zero vx.

**TODO 3** \u2014 \`checkCoins\`: Loop through all tiles overlapping the player bounds. If tilemap[r][c] == 2, set it to 0 and increment score.

## Did It Work?
Click Run. You should see the same platformer as before \u2014 player moves, jumps, collects coins, and respawns on fall. The HUD shows "Split: hs_player" in sky blue. The console prints struct verification.

The game is IDENTICAL. What changed is the architecture \u2014 Player and its collision helpers now live in their own translation unit, ready for the module splits coming in Lessons 31+.

## Beginner Trap
Mixing up rows and columns in collision checks. Remember: tilemap[ROW][COL] where ROW = y / TILE_SIZE and COL = x / TILE_SIZE. Swapping them causes invisible collision bugs.

## Elite Insight
This is the exact pattern used in every professional game engine. Unreal Engine splits every component into a .h/.cpp pair. The header declares the interface; the source implements it. Your 3-file split is the foundation for the full module architecture in Lessons 31+.`,
    starterCode: {
      "hs_player.h": `#pragma once
#include \"raylib.h\"

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

int score = 0;

enum MoveState { GROUNDED, AIRBORNE };

struct Player {
    float x, y;
    float vx, vy;
    MoveState state;
    float coyote_timer;
    float jump_buffer_timer;
};

void checkTileCollisionV(Player& p);
void checkTileCollisionH(Player& p);
void checkCoins(Player& p);`,
      "hs_player.cpp": `#include \"hs_player.h\"

// TODO 1: Implement checkTileCollisionV
// Calculate foot_col_l = (int)(p.x / TILE_SIZE)
// Calculate foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE)
// Calculate foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE)
// If foot_row >= ROWS, return.
// If tilemap[foot_row][foot_col_l]==1 or tilemap[foot_row][foot_col_r]==1:
//   If p.vy >= 0: snap p.y, zero p.vy, set GROUNDED, reset coyote.
void checkTileCollisionV(Player& p) {
    // Your code here
}

// TODO 2: Implement checkTileCollisionH
// If p.vx > 0: check right_col tiles at top_row and bot_row.
//   If wall found, snap p.x = right_col * TILE_SIZE - PLAYER_W, zero p.vx.
// If p.vx < 0: check left_col tiles at top_row and bot_row.
//   If wall found, snap p.x = (left_col + 1) * TILE_SIZE, zero p.vx.
void checkTileCollisionH(Player& p) {
    // Your code here
}

// TODO 3: Implement checkCoins
// Loop r from top_row to bot_row, c from left_col to right_col.
// If tilemap[r][c] == 2: set to 0 and score++.
void checkCoins(Player& p) {
    // Your code here
}`,
      "main.cpp": `#include <iostream>
#include \"hs_player.h\"
using namespace std;

Player player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Platformer\");
    SetTargetFPS(60);

    cout << \"Struct: Player\" << endl;
    cout << \"Fields: x y vx vy state coyote jump_buffer\" << endl;
    cout << \"Player: (\" << player.x << \", \" << player.y << \")\" << endl;
    cout << \"Score: \" << score << endl;
    cout << \"Pattern: struct-extraction\" << endl;

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
        DrawText(player.state == GROUNDED ? \"GROUNDED\" : \"AIRBORNE\", 10, 10, 20, WHITE);
        DrawText(TextFormat(\"Score: %d\", score), 10, 35, 20, YELLOW);
        DrawText(\"Split: hs_player\", 10, 60, 16, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    },
    solutionCode: {
      "hs_player.h": `#pragma once
#include \"raylib.h\"

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

int score = 0;

enum MoveState { GROUNDED, AIRBORNE };

struct Player {
    float x, y;
    float vx, vy;
    MoveState state;
    float coyote_timer;
    float jump_buffer_timer;
};

void checkTileCollisionV(Player& p);
void checkTileCollisionH(Player& p);
void checkCoins(Player& p);`,
      "hs_player.cpp": `#include \"hs_player.h\"

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
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && tilemap[r][c] == 2) {
                tilemap[r][c] = 0;
                score++;
            }
        }
    }
}`,
      "main.cpp": `#include <iostream>
#include \"hs_player.h\"
using namespace std;

Player player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Platformer\");
    SetTargetFPS(60);

    cout << \"Struct: Player\" << endl;
    cout << \"Fields: x y vx vy state coyote jump_buffer\" << endl;
    cout << \"Player: (\" << player.x << \", \" << player.y << \")\" << endl;
    cout << \"Score: \" << score << endl;
    cout << \"Pattern: struct-extraction\" << endl;

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
        DrawText(player.state == GROUNDED ? \"GROUNDED\" : \"AIRBORNE\", 10, 10, 20, WHITE);
        DrawText(TextFormat(\"Score: %d\", score), 10, 35, 20, YELLOW);
        DrawText(\"Split: hs_player\", 10, 60, 16, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    },
    tests: [
      { id: "g1", description: "Struct name in output", expectedOutput: "Struct: Player" },
      { id: "g2", description: "Fields listed in output", expectedOutput: "Fields: x y vx vy state coyote jump_buffer" },
      { id: "g3", description: "Player position printed", expectedOutput: "Player: (48, 350)" },
      { id: "g4", description: "Score printed", expectedOutput: "Score: 0" },
      { id: "g5", description: "Pattern printed", expectedOutput: "Pattern: struct-extraction" },
    ],
    hints: [
      "checkTileCollisionV: check foot_row tiles at foot_col_l and foot_col_r. If solid and vy >= 0, snap y, zero vy, set GROUNDED.",
      "checkTileCollisionH: separate blocks for vx > 0 (right) and vx < 0 (left). Check wall tiles, snap x, zero vx.",
      "checkCoins: loop rows/cols overlapping player bounds. If tilemap[r][c] == 2, set to 0 and score++.",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer16;