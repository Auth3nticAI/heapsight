import type { Lesson } from "@/types/lesson";

export const lessonRPG16: Lesson = {
  id: "rpg-16-professional-split",
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
Your RPG is 200+ lines in one file. Professional C++ projects have hundreds of files. How do they avoid chaos? They split every concern into two files: a **header** (.h) that declares WHAT exists, and a **source** (.cpp) that defines HOW it works. Think of a header as a menu and the source as the kitchen.

## What Breaks Without This
As your program grows, compilation slows to a crawl. Change one function and the compiler rebuilds everything. Circular dependencies crash the build. Two files that both define the same struct cause \"multiple definition\" errors. Headers solve all of this.

## The Fix: Header/Source Split
**Header file (hs_world.h):**
\`\`\`cpp
#pragma once          // prevents double-include
#include \"raylib.h\"   // types we need (Color, etc.)

struct World {
    int player_hp;
    int turn_count;
};

void initWorld(World& w);   // declaration only \u2014 no body
\`\`\`

**Source file (hs_world.cpp):**
\`\`\`cpp
#include \"hs_world.h\"

void initWorld(World& w) {  // definition \u2014 the actual code
    // implementation here
}
\`\`\`

**Main file (main.cpp):**
\`\`\`cpp
#include \"hs_world.h\"       // now main.cpp knows about World
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
Model the split conceptually. Declare a World struct with ship_x and score, then implement an initWorld function and print the split info.

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
Platformer Lesson 16 splits player logic the same way. Shooter Lesson 16 splits the world state. Same pattern, different domain. Learn it once, use it everywhere.

## Skill Reinforcement
Built on: L15 stable update order \u2014 the architecture you'll split into headers.
Feeds into: L31+ module split \u2014 each system gets its own header/source pair.

## Mastery Check
*Question:* You put \`void resolveMovement(Command& c) { ... }\` in a header. Two .cpp files include it. What error?
*Answer:* \"multiple definition of resolveMovement\" \u2014 the linker sees two identical function bodies. Move the body to a .cpp file, keep only the declaration in the header.`,
    starterCode: `#include <iostream>
using namespace std;

// Simulating a header/source split in a single file
// "HEADER" section \u2014 declarations
struct World {
    float ship_x;
    int score;
};

void initWorld(World& w);  // declaration only

// "SOURCE" section \u2014 definitions
// TODO 1: Define initWorld: void initWorld(World& w) { w.ship_x = 200; w.score = 0; }

int main() {
    World w;
    // TODO 2: Call initWorld(w);
    // TODO 3: cout << "Files: 2" << endl;
    // TODO 4: cout << "Guard: pragma once" << endl;
    // TODO 5: cout << "Pattern: declaration/definition split" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct World {
    float ship_x;
    int score;
};

void initWorld(World& w);

void initWorld(World& w) {
    w.ship_x = 200;
    w.score = 0;
}

int main() {
    World w;
    initWorld(w);
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
      "initWorld needs a body: void initWorld(World& w) { w.ship_x = 200; w.score = 0; } \u2014 put it below the declaration.",
      "Call initWorld(w) in main before the cout lines. The function initializes the World struct.",
      "Three cout lines \u2014 Files: 2, Guard: pragma once, Pattern: declaration/definition split. Copy them exactly.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: The Professional Split",
    type: "game_builder",
    instructions: `# Build: The Professional Split

## Mental Model
Your RPG lives in one big file. Time to go professional. You'll split the World struct, command queue, and helper functions into a proper header/source pair, just like every C++ project with more than 500 lines.

## What's Already Here
Three files are open in your editor tabs:

**hs_world.h** \u2014 The header. Contains \`#pragma once\`, all constants, the tile/entity/command structs, the World struct, and function declarations. This file is COMPLETE \u2014 don't change it.

**hs_world.cpp** \u2014 The source. Has \`#include "hs_world.h"\` at the top. Function STUBS are here with TODOs. Your job: fill in the bodies.

**main.cpp** \u2014 The game loop. Includes \`hs_world.h\` and uses the functions you'll implement. This file is COMPLETE \u2014 don't change it.

## Your Task
Work in **hs_world.cpp** only. Implement four functions:

**TODO 1** \u2014 \`enqueueCmd\`: If \`w.cmd_count < MAX_CMD\`, set \`w.cmd_queue[w.cmd_count++] = {t, p1, p2}\`.

**TODO 2** \u2014 \`clearQueue\`: Set \`w.cmd_count = 0\`.

**TODO 3** \u2014 \`resolveMovement\`: Read the player position from \`w.pos[w.player_id]\`. Apply the command direction. Check bounds and walls. If bumping an enemy, change \`c.type = CMD_ATTACK\`. Otherwise move the player.

**TODO 4** \u2014 \`resolveCombat\`: If \`c.type == CMD_ATTACK\`, deal 3 damage to the enemy and print the damage/HP.

## Did It Work?
Click Run. You should see the same RPG dungeon as before \u2014 green player, red enemy, walls, the command queue HUD. The HUD now shows "Split: hs_world" in sky blue. The console prints the same milestone confirmations.

The game is IDENTICAL. What changed is the architecture \u2014 World and its command functions now live in their own translation unit, ready for the module splits coming in Lessons 31+.

Expected startup output:
\`\`\`
Player: (5, 5)
Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER
Turn: 0
Enemy: (9, 7)
Enemies: 1
Combat: bump
Player HP: 20/20
Enemy HP: 10/10
Kill: hp-to-zero
Milestone: micro-dungeon
Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER
Struct: world
Vec2i: OK
IDs: OK
SoA: OK
Milestone: stable-update-order
Queue: active
CMD: POD struct
Pattern: command-queue
\`\`\``,
    starterCode: {
      "hs_world.h": `#pragma once
#include "raylib.h"

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;

const int CMD_NONE       = 0;
const int CMD_MOVE_UP    = 1;
const int CMD_MOVE_DOWN  = 2;
const int CMD_MOVE_LEFT  = 3;
const int CMD_MOVE_RIGHT = 4;
const int CMD_ATTACK     = 5;

struct Command { int type; int p1; int p2; };
const int MAX_CMD = 4;

enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };
const int NO_ENTITY    = -1;
const int MAX_ENTITIES = 2;
struct Vec2i { int x = 0; int y = 0; };

struct World {
    int player_id = 0;
    int enemy_id  = 1;
    Vec2i pos[MAX_ENTITIES];
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
    int frame_count = 0;
    Command cmd_queue[MAX_CMD];
    int cmd_count = 0;
};

void enqueueCmd(World& w, int t, int p1=0, int p2=0);
void clearQueue(World& w);
void resolveMovement(World& w, int tiles[][GRID_W], Command& c);
void resolveCombat(World& w, Command& c);`,
      "hs_world.cpp": `#include "hs_world.h"
#include <iostream>
using namespace std;

// TODO 1: Implement enqueueCmd
// If w.cmd_count < MAX_CMD, set w.cmd_queue[w.cmd_count++] = {t, p1, p2};
void enqueueCmd(World& w, int t, int p1, int p2) {
    // Your code here
}

// TODO 2: Implement clearQueue
// Set w.cmd_count = 0;
void clearQueue(World& w) {
    // Your code here
}

// TODO 3: Implement resolveMovement
// If c.type is CMD_NONE or CMD_ATTACK, return early.
// Compute nx, ny from w.pos[w.player_id].x/y based on c.type.
// Bounds check: if nx<0||nx>=GRID_W||ny<0||ny>=GRID_H, return.
// Wall check: if tiles[ny][nx] == TILE_WALL, return.
// Enemy check: if enemy alive and at (nx,ny), set c.type = CMD_ATTACK and return.
// Otherwise move: w.pos[w.player_id].x = nx; w.pos[w.player_id].y = ny;
void resolveMovement(World& w, int tiles[][GRID_W], Command& c) {
    // Your code here
}

// TODO 4: Implement resolveCombat
// If c.type != CMD_ATTACK, return.
// int dmg = 3; w.enemy_hp -= dmg;
// cout << "Damage: " << dmg << endl;
// cout << "Enemy HP: " << w.enemy_hp << "/" << w.enemy_max_hp << endl;
void resolveCombat(World& w, Command& c) {
    // Your code here
}`,
      "main.cpp": `#include <iostream>
#include "hs_world.h"
using namespace std;

int tiles[GRID_H][GRID_W];
World world;

void phaseInput() {
    clearQueue(world);
    if (IsKeyPressed(KEY_W))      enqueueCmd(world, CMD_MOVE_UP);
    else if (IsKeyPressed(KEY_S)) enqueueCmd(world, CMD_MOVE_DOWN);
    else if (IsKeyPressed(KEY_A)) enqueueCmd(world, CMD_MOVE_LEFT);
    else if (IsKeyPressed(KEY_D)) enqueueCmd(world, CMD_MOVE_RIGHT);
}

void phaseResolve() {
    for (int i = 0; i < world.cmd_count; i++) {
        resolveMovement(world, tiles, world.cmd_queue[i]);
        resolveCombat(world, world.cmd_queue[i]);
    }
}

void phaseWorld() {
    if (!world.enemy_alive) return;
    int dx = world.pos[world.player_id].x - world.pos[world.enemy_id].x;
    int dy = world.pos[world.player_id].y - world.pos[world.enemy_id].y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.pos[world.enemy_id].x + move_x;
    int ny = world.pos[world.enemy_id].y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != TILE_WALL && !(nx == world.pos[world.player_id].x && ny == world.pos[world.player_id].y)) {
        world.pos[world.enemy_id].x = nx; world.pos[world.enemy_id].y = ny;
    }
}

void phaseCleanup() {
    if (world.enemy_alive && world.enemy_hp <= 0) {
        world.enemy_alive = false;
        world.kills++;
        cout << "Kill confirmed" << endl;
    }
    world.turn_count++;
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = (y==0||y==GRID_H-1||x==0||x==GRID_W-1) ? TILE_WALL : TILE_FLOOR;
    tiles[3][4] = TILE_WALL; tiles[3][5] = TILE_WALL;
    tiles[6][7] = TILE_WALL; tiles[6][8] = TILE_WALL;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    initTiles();
    world.pos[world.player_id] = {5, 5};
    world.pos[world.enemy_id]  = {9, 7};
    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == TILE_WALL) wall_count++;

    cout << "Player: (" << world.pos[world.player_id].x << ", " << world.pos[world.player_id].y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.pos[world.enemy_id].x << ", " << world.pos[world.enemy_id].y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
    cout << "Player HP: " << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    cout << "Struct: world" << endl;
    cout << "Vec2i: OK" << endl;
    cout << "IDs: OK" << endl;
    cout << "SoA: OK" << endl;
    cout << "Milestone: stable-update-order" << endl;
    cout << "Queue: active" << endl;
    cout << "CMD: POD struct" << endl;
    cout << "Pattern: command-queue" << endl;

    while (!WindowShouldClose()) {
        world.frame_count++;
        phaseInput();
        if (world.cmd_count > 0) {
            phaseResolve();
            phaseWorld();
            phaseCleanup();
        }
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < GRID_H; y++)
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == TILE_WALL) ? GRAY : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, c);
            }
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Queue: %d cmd", world.cmd_count), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
        DrawText("Split: hs_world", 400, 260, 16, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    },
    solutionCode: {
      "hs_world.h": `#pragma once
#include "raylib.h"

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;

const int CMD_NONE       = 0;
const int CMD_MOVE_UP    = 1;
const int CMD_MOVE_DOWN  = 2;
const int CMD_MOVE_LEFT  = 3;
const int CMD_MOVE_RIGHT = 4;
const int CMD_ATTACK     = 5;

struct Command { int type; int p1; int p2; };
const int MAX_CMD = 4;

enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };
const int NO_ENTITY    = -1;
const int MAX_ENTITIES = 2;
struct Vec2i { int x = 0; int y = 0; };

struct World {
    int player_id = 0;
    int enemy_id  = 1;
    Vec2i pos[MAX_ENTITIES];
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
    int frame_count = 0;
    Command cmd_queue[MAX_CMD];
    int cmd_count = 0;
};

void enqueueCmd(World& w, int t, int p1=0, int p2=0);
void clearQueue(World& w);
void resolveMovement(World& w, int tiles[][GRID_W], Command& c);
void resolveCombat(World& w, Command& c);`,
      "hs_world.cpp": `#include "hs_world.h"
#include <iostream>
using namespace std;

void enqueueCmd(World& w, int t, int p1, int p2) {
    if (w.cmd_count < MAX_CMD) w.cmd_queue[w.cmd_count++] = {t, p1, p2};
}

void clearQueue(World& w) {
    w.cmd_count = 0;
}

void resolveMovement(World& w, int tiles[][GRID_W], Command& c) {
    if (c.type == CMD_NONE || c.type == CMD_ATTACK) return;
    int nx = w.pos[w.player_id].x;
    int ny = w.pos[w.player_id].y;
    if (c.type == CMD_MOVE_UP)         ny--;
    else if (c.type == CMD_MOVE_DOWN)  ny++;
    else if (c.type == CMD_MOVE_LEFT)  nx--;
    else if (c.type == CMD_MOVE_RIGHT) nx++;
    if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) return;
    if (tiles[ny][nx] == TILE_WALL) return;
    if (w.enemy_alive && nx == w.pos[w.enemy_id].x && ny == w.pos[w.enemy_id].y) {
        c.type = CMD_ATTACK; return;
    }
    w.pos[w.player_id].x = nx;
    w.pos[w.player_id].y = ny;
}

void resolveCombat(World& w, Command& c) {
    if (c.type != CMD_ATTACK) return;
    int dmg = 3;
    w.enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << w.enemy_hp << "/" << w.enemy_max_hp << endl;
}`,
      "main.cpp": `#include <iostream>
#include "hs_world.h"
using namespace std;

int tiles[GRID_H][GRID_W];
World world;

void phaseInput() {
    clearQueue(world);
    if (IsKeyPressed(KEY_W))      enqueueCmd(world, CMD_MOVE_UP);
    else if (IsKeyPressed(KEY_S)) enqueueCmd(world, CMD_MOVE_DOWN);
    else if (IsKeyPressed(KEY_A)) enqueueCmd(world, CMD_MOVE_LEFT);
    else if (IsKeyPressed(KEY_D)) enqueueCmd(world, CMD_MOVE_RIGHT);
}

void phaseResolve() {
    for (int i = 0; i < world.cmd_count; i++) {
        resolveMovement(world, tiles, world.cmd_queue[i]);
        resolveCombat(world, world.cmd_queue[i]);
    }
}

void phaseWorld() {
    if (!world.enemy_alive) return;
    int dx = world.pos[world.player_id].x - world.pos[world.enemy_id].x;
    int dy = world.pos[world.player_id].y - world.pos[world.enemy_id].y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.pos[world.enemy_id].x + move_x;
    int ny = world.pos[world.enemy_id].y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != TILE_WALL && !(nx == world.pos[world.player_id].x && ny == world.pos[world.player_id].y)) {
        world.pos[world.enemy_id].x = nx; world.pos[world.enemy_id].y = ny;
    }
}

void phaseCleanup() {
    if (world.enemy_alive && world.enemy_hp <= 0) {
        world.enemy_alive = false;
        world.kills++;
        cout << "Kill confirmed" << endl;
    }
    world.turn_count++;
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = (y==0||y==GRID_H-1||x==0||x==GRID_W-1) ? TILE_WALL : TILE_FLOOR;
    tiles[3][4] = TILE_WALL; tiles[3][5] = TILE_WALL;
    tiles[6][7] = TILE_WALL; tiles[6][8] = TILE_WALL;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    initTiles();
    world.pos[world.player_id] = {5, 5};
    world.pos[world.enemy_id]  = {9, 7};
    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == TILE_WALL) wall_count++;

    cout << "Player: (" << world.pos[world.player_id].x << ", " << world.pos[world.player_id].y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.pos[world.enemy_id].x << ", " << world.pos[world.enemy_id].y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
    cout << "Player HP: " << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    cout << "Struct: world" << endl;
    cout << "Vec2i: OK" << endl;
    cout << "IDs: OK" << endl;
    cout << "SoA: OK" << endl;
    cout << "Milestone: stable-update-order" << endl;
    cout << "Queue: active" << endl;
    cout << "CMD: POD struct" << endl;
    cout << "Pattern: command-queue" << endl;

    while (!WindowShouldClose()) {
        world.frame_count++;
        phaseInput();
        if (world.cmd_count > 0) {
            phaseResolve();
            phaseWorld();
            phaseCleanup();
        }
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < GRID_H; y++)
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == TILE_WALL) ? GRAY : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, c);
            }
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Queue: %d cmd", world.cmd_count), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
        DrawText("Split: hs_world", 400, 260, 16, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    },
    tests: [
      { id: "g1", description: "Player at start", expectedOutput: "Player: (5, 5)" },
      { id: "g2", description: "Milestone stable-update-order", expectedOutput: "Milestone: stable-update-order" },
      { id: "g3", description: "Pattern: command-queue", expectedOutput: "Pattern: command-queue" },
    ],
    hints: [
      "enqueueCmd: if (w.cmd_count < MAX_CMD) w.cmd_queue[w.cmd_count++] = {t, p1, p2};",
      "resolveMovement: compute nx/ny from w.pos[w.player_id], check bounds, walls, enemy bump. If bump, set c.type = CMD_ATTACK.",
      "resolveCombat: if (c.type != CMD_ATTACK) return; then int dmg = 3; w.enemy_hp -= dmg; and print damage and HP.",
    ],
    estimatedMinutes: 20,
  },
};