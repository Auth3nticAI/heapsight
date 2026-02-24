import { Lesson } from "@/types/lesson";

export const lessonRoguelike11: Lesson = {
  id: "roguelike-11-world-state-struct",
  title: "God Object Refactor",
  description: "Extract messy globals into a clean World struct. First step toward professional architecture.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["struct extraction", "global state", "data ownership", "refactoring"],
  part1: {
    title: "Concept: The God Object Problem",
    type: "concept",
    instructions: `# God Object Refactor

## Mental Model
Look at your L10 micro-roguelike. 200+ lines. Globals scattered everywhere: dungeon[][], nodes[], rooms[], enemies[], px, py, playerHp, stairsX, stairsY, floor_num, score, gameOver. Every function reads and writes to globals. This is the "God Object" anti-pattern — all state owned by nobody, accessed by everybody.

## What Breaks Without This
As the game grows, global state becomes unmaintainable:
- Can't tell which functions modify which state
- Can't reset state cleanly (forgot a global? Bug.)
- Can't have two dungeons (for prefab testing, replays)
- Can't serialize state (save/load) without listing every global

## The Fix: World Struct
Extract ALL game state into a single World struct. Every function takes `World&` as a parameter. No more globals.

\```cpp
struct World {
    int dungeon[MAP_H][MAP_W];
    BSPNode nodes[MAX_NODES];
    int node_count;
    Room rooms[8];
    int room_count;
    Enemy enemies[32];
    int enemy_count;
    int px, py, playerHp;
    int stairsX, stairsY;
    int floor_num;
    int score;
    bool gameOver;
    uint32_t rng_state;
};
\```

## Key Rules
1. **Structs are DUMB DATA** — no methods, no constructors. Just fields.
2. **Functions take World&** — they read and write through the reference.
3. **One World per game** — created in main(), passed everywhere.
4. **Reset = zero the struct** — memset(&world, 0, sizeof(World)) resets everything.

## `#pragma once`
When you extract World into a header file (hs_world.h), use `#pragma once` at the top. This prevents double-inclusion — if two .cpp files include hs_world.h, the compiler only processes it once.

\```cpp
#pragma once
// hs_world.h - all game state in one struct
struct BSPNode { int x, y, w, h; };
struct Room { int x, y, w, h, cx, cy; };
struct Enemy { int x, y, hp; bool alive; };

struct World {
    int dungeon[30][40];
    // ... all fields ...
};
\```

## Your Task
Define a World struct that holds all game state. Print the struct size.

Expected output:
\```
World struct defined
Fields: 13
Refactor: globals to struct
\```

## Beginner Trap
**Putting function bodies in the header.** Headers declare types and function prototypes. Function implementations go in .cpp files (we'll do this in L16). For now, keep everything in main.cpp but move data into the struct.

## Elite Insight
Doom's original source had global state everywhere. When id Software ported it to modern platforms, the first step was extracting globals into structs. The same refactoring pattern you're doing. Unity's DOTS rewrite had the same motivation — scattered state into organized data.

## Systems Thinking Connection
The World struct is the roguelike equivalent of the RPG's scene graph root node. Both organize all game state under one owner. The RPG uses a tree (parent-child nodes). The Roguelike uses a flat struct. Flat is simpler when all state is needed every frame.

## Skill Reinforcement
L10 proved the game loop works. L11 cleans up the architecture. L12 will add type safety (enums for TileType, EntityType).

## Mastery Check
Question: Why not use a class with methods instead of a struct with functions?
Answer: In C++, struct and class are nearly identical (default access differs). The CHOICE to use struct + free functions is philosophical: structs are data, functions are behavior. Separating them makes it obvious who owns what. Classes mix data and behavior, making ownership ambiguous. For game state, flat structs are cleaner.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAP_W = 40;
const int MAP_H = 30;
const int MAX_NODES = 15;

struct BSPNode { int x, y, w, h; };
struct Room { int x, y, w, h, cx, cy; };
struct Enemy { int x, y, hp; bool alive; };

// TODO: Define struct World that contains ALL game state:
// dungeon[MAP_H][MAP_W], nodes[MAX_NODES], node_count,
// rooms[8], room_count, enemies[32], enemy_count,
// px, py, playerHp, stairsX, stairsY,
// floor_num, score, gameOver, rng_state

int main() {
    cout << "World struct defined" << endl;
    cout << "Fields: 13" << endl;
    cout << "Refactor: globals to struct" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAP_W = 40;
const int MAP_H = 30;
const int MAX_NODES = 15;

struct BSPNode { int x, y, w, h; };
struct Room { int x, y, w, h, cx, cy; };
struct Enemy { int x, y, hp; bool alive; };

struct World {
    int dungeon[MAP_H][MAP_W];
    BSPNode nodes[MAX_NODES];
    int node_count;
    Room rooms[8];
    int room_count;
    Enemy enemies[32];
    int enemy_count;
    int px, py, playerHp;
    int stairsX, stairsY;
    int floor_num;
    int score;
    bool gameOver;
    uint32_t rng_state;
};

int main() {
    cout << "World struct defined" << endl;
    cout << "Fields: 13" << endl;
    cout << "Refactor: globals to struct" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Struct defined", expectedOutput: "World struct defined" },
      { id: "t2", description: "Field count", expectedOutput: "Fields: 13" },
      { id: "t3", description: "Refactor type", expectedOutput: "Refactor: globals to struct" },
    ],
    hints: [
      "struct World { ... }; with all the listed fields. Remember to include rng_state as uint32_t.",
      "Count the fields: dungeon, nodes, node_count, rooms, room_count, enemies, enemy_count, px, py, playerHp, stairsX, stairsY, floor_num, score, gameOver, rng_state = 16 storage fields in 13 logical groups.",
      "struct World { int dungeon[MAP_H][MAP_W]; BSPNode nodes[MAX_NODES]; int node_count; Room rooms[8]; int room_count; Enemy enemies[32]; int enemy_count; int px,py,playerHp; int stairsX,stairsY; int floor_num; int score; bool gameOver; uint32_t rng_state; };",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Refactored Roguelike",
    type: "game_builder",
    instructions: `# Build: Refactored Roguelike

## Mental Model
Take the L10 milestone code and refactor it. Move ALL globals into a World struct. Pass `World& w` to every function. The game behavior is IDENTICAL — same dungeon, same enemies, same combat. Only the architecture changes.

## What Breaks Without This
Phase 2 builds systems (types, IDs, SoA entities) that need clean state ownership. If state is still scattered as globals, adding new systems means more globals, more confusion, more bugs.

## Your Task
Refactor the micro-roguelike to use World struct. All functions take `World& w`. Create one World instance in main(). Game output must be identical to L10.

Expected cout output:
\```
Seed: 42
Floor: 1
Rooms: 4
Enemies: 5
Score: 0
\```

**Click Run** — the game should look and play exactly like L10.

## Did It Work?
If the output matches L10 exactly, the refactor is correct. The game looks identical. The architecture is completely different.

## Beginner Trap
**Forgetting to update all function signatures.** EVERY function that accesses dungeon, rooms, enemies, px, py, etc. must now take World& w. If you miss one, it will try to read a non-existent global and fail to compile.

## Elite Insight
This exact refactoring pattern is called "Introduce Parameter Object" in Martin Fowler's refactoring catalog. It's one of the most common refactorings in real codebases. You're doing production-grade software engineering.

## Mastery Check
Question: What happens if you need two simultaneous dungeons (e.g., for a minimap preview)?
Answer: Create two World instances: World mainWorld, previewWorld. Each has its own complete state. With globals, this was impossible — there's only one set of globals. With the struct, it's trivial. This is the real power of the refactor.`,
    starterCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;
const int MAX_NODES = 15;

struct BSPNode { int x, y, w, h; };
struct Room { int x, y, w, h, cx, cy; };
struct Enemy { int x, y, hp; bool alive; };

struct World {
    int dungeon[MAP_H][MAP_W];
    BSPNode nodes[MAX_NODES];
    int node_count;
    Room rooms[8];
    int room_count;
    Enemy enemies[32];
    int enemy_count;
    int px, py, playerHp;
    int stairsX, stairsY;
    int floor_num;
    int score;
    bool gameOver;
    uint32_t rng_state;
};

uint32_t rngNext(World& w) {
    w.rng_state = w.rng_state * 48271u % 0x7fffffffu;
    return w.rng_state;
}
int rngRange(World& w, int lo, int hi) {
    return lo + (int)(rngNext(w) % (uint32_t)(hi - lo + 1));
}

// TODO: Refactor bspSplit to take World& w
// Change all nodes[], node_count references to w.nodes[], w.node_count
void bspSplit(World& w, int idx, int depth) {
    if (depth >= 2 || w.nodes[idx].w < 10 || w.nodes[idx].h < 10) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= MAX_NODES) return;
    if (depth % 2 == 0) {
        int sx = rngRange(w, w.nodes[idx].w / 3, w.nodes[idx].w * 2 / 3);
        w.nodes[left] = {w.nodes[idx].x, w.nodes[idx].y, sx, w.nodes[idx].h};
        w.nodes[right] = {w.nodes[idx].x + sx, w.nodes[idx].y, w.nodes[idx].w - sx, w.nodes[idx].h};
    } else {
        int sy = rngRange(w, w.nodes[idx].h / 3, w.nodes[idx].h * 2 / 3);
        w.nodes[left] = {w.nodes[idx].x, w.nodes[idx].y, w.nodes[idx].w, sy};
        w.nodes[right] = {w.nodes[idx].x, w.nodes[idx].y + sy, w.nodes[idx].w, w.nodes[idx].h - sy};
    }
    if (right + 1 > w.node_count) w.node_count = right + 1;
    bspSplit(w, left, depth + 1);
    bspSplit(w, right, depth + 1);
}

bool isLeaf(World& w, int idx) {
    int left = 2 * idx + 1;
    return left >= w.node_count || (w.nodes[left].w == 0 && w.nodes[left].h == 0);
}

void carveRoom(World& w, BSPNode node) {
    int rw = rngRange(w, 3, node.w - 2);
    int rh = rngRange(w, 3, node.h - 2);
    int rx = rngRange(w, node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(w, node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++)
        for (int x = rx; x < rx + rw; x++)
            w.dungeon[y][x] = 1;
    w.rooms[w.room_count] = {rx, ry, rw, rh, rx + rw/2, ry + rh/2};
    w.room_count++;
}

void carveCorridor(World& w, int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx)
        if (w.dungeon[y1][x] == 0) w.dungeon[y1][x] = 2;
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy)
        if (w.dungeon[y][x2] == 0) w.dungeon[y][x2] = 2;
}

void findRoomCenter(World& w, int idx, int& cx, int& cy) {
    if (isLeaf(w, idx)) {
        for (int i = 0; i < w.room_count; i++) {
            if (w.rooms[i].x >= w.nodes[idx].x && w.rooms[i].x < w.nodes[idx].x + w.nodes[idx].w &&
                w.rooms[i].y >= w.nodes[idx].y && w.rooms[i].y < w.nodes[idx].y + w.nodes[idx].h) {
                cx = w.rooms[i].cx; cy = w.rooms[i].cy; return;
            }
        }
    }
    int left = 2 * idx + 1;
    if (left < w.node_count && w.nodes[left].w > 0) findRoomCenter(w, left, cx, cy);
}

void connectBSP(World& w, int idx, int& corridor_count) {
    if (isLeaf(w, idx)) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= w.node_count) return;
    int lcx = 0, lcy = 0, rcx = 0, rcy = 0;
    findRoomCenter(w, left, lcx, lcy);
    findRoomCenter(w, right, rcx, rcy);
    carveCorridor(w, lcx, lcy, rcx, rcy);
    corridor_count++;
    connectBSP(w, left, corridor_count);
    connectBSP(w, right, corridor_count);
}

void populateEnemies(World& w) {
    for (int i = 1; i < w.room_count; i++) {
        int count = rngRange(w, 1, 3);
        for (int j = 0; j < count; j++) {
            int ex = rngRange(w, w.rooms[i].x, w.rooms[i].x + w.rooms[i].w - 1);
            int ey = rngRange(w, w.rooms[i].y, w.rooms[i].y + w.rooms[i].h - 1);
            w.enemies[w.enemy_count++] = {ex, ey, 3, true};
        }
    }
}

int findEnemyAt(World& w, int x, int y) {
    for (int i = 0; i < w.enemy_count; i++)
        if (w.enemies[i].alive && w.enemies[i].x == x && w.enemies[i].y == y) return i;
    return -1;
}

void generateFloor(World& w) {
    memset(w.dungeon, 0, sizeof(w.dungeon));
    w.node_count = 1; w.room_count = 0; w.enemy_count = 0;
    memset(w.nodes, 0, sizeof(w.nodes));
    w.nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(w, 0, 0);
    for (int i = 0; i < w.node_count; i++)
        if (isLeaf(w, i)) carveRoom(w, w.nodes[i]);
    int cc = 0; connectBSP(w, 0, cc);
    w.px = w.rooms[0].cx; w.py = w.rooms[0].cy;
    w.stairsX = w.rooms[w.room_count-1].cx;
    w.stairsY = w.rooms[w.room_count-1].cy;
    populateEnemies(w);
}

// TODO: Refactor handleInput to take World& w
// Change all px, py, playerHp, etc. to w.px, w.py, w.playerHp

int main() {
    World w = {};
    w.rng_state = 42;
    w.floor_num = 1;
    w.playerHp = 10;
    generateFloor(w);

    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Enemies: " << w.enemy_count << endl;
    cout << "Score: " << w.score << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        // TODO: call handleInput(w);

        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (w.dungeon[y][x] == 1)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, DARKGRAY);
                else if (w.dungeon[y][x] == 2)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, (Color){60,60,60,255});
            }
        }
        DrawRectangle(w.stairsX*TILE_SIZE, w.stairsY*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, YELLOW);
        for (int i = 0; i < w.enemy_count; i++)
            if (w.enemies[i].alive)
                DrawRectangle(w.enemies[i].x*TILE_SIZE, w.enemies[i].y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, RED);
        DrawRectangle(w.px*TILE_SIZE, w.py*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, GREEN);
        DrawText(TextFormat("HP: %d  Floor: %d  Score: %d", w.playerHp, w.floor_num, w.score), 10, SCREEN_H - 25, 20, GREEN);
        if (w.gameOver) DrawText("GAME OVER", SCREEN_W/2 - 80, SCREEN_H/2, 30, RED);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;
const int MAX_NODES = 15;

struct BSPNode { int x, y, w, h; };
struct Room { int x, y, w, h, cx, cy; };
struct Enemy { int x, y, hp; bool alive; };

struct World {
    int dungeon[MAP_H][MAP_W];
    BSPNode nodes[MAX_NODES];
    int node_count;
    Room rooms[8];
    int room_count;
    Enemy enemies[32];
    int enemy_count;
    int px, py, playerHp;
    int stairsX, stairsY;
    int floor_num;
    int score;
    bool gameOver;
    uint32_t rng_state;
};

uint32_t rngNext(World& w) {
    w.rng_state = w.rng_state * 48271u % 0x7fffffffu;
    return w.rng_state;
}
int rngRange(World& w, int lo, int hi) {
    return lo + (int)(rngNext(w) % (uint32_t)(hi - lo + 1));
}

void bspSplit(World& w, int idx, int depth) {
    if (depth >= 2 || w.nodes[idx].w < 10 || w.nodes[idx].h < 10) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= MAX_NODES) return;
    if (depth % 2 == 0) {
        int sx = rngRange(w, w.nodes[idx].w / 3, w.nodes[idx].w * 2 / 3);
        w.nodes[left] = {w.nodes[idx].x, w.nodes[idx].y, sx, w.nodes[idx].h};
        w.nodes[right] = {w.nodes[idx].x + sx, w.nodes[idx].y, w.nodes[idx].w - sx, w.nodes[idx].h};
    } else {
        int sy = rngRange(w, w.nodes[idx].h / 3, w.nodes[idx].h * 2 / 3);
        w.nodes[left] = {w.nodes[idx].x, w.nodes[idx].y, w.nodes[idx].w, sy};
        w.nodes[right] = {w.nodes[idx].x, w.nodes[idx].y + sy, w.nodes[idx].w, w.nodes[idx].h - sy};
    }
    if (right + 1 > w.node_count) w.node_count = right + 1;
    bspSplit(w, left, depth + 1);
    bspSplit(w, right, depth + 1);
}

bool isLeaf(World& w, int idx) {
    int left = 2 * idx + 1;
    return left >= w.node_count || (w.nodes[left].w == 0 && w.nodes[left].h == 0);
}

void carveRoom(World& w, BSPNode node) {
    int rw = rngRange(w, 3, node.w - 2);
    int rh = rngRange(w, 3, node.h - 2);
    int rx = rngRange(w, node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(w, node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++)
        for (int x = rx; x < rx + rw; x++)
            w.dungeon[y][x] = 1;
    w.rooms[w.room_count] = {rx, ry, rw, rh, rx + rw/2, ry + rh/2};
    w.room_count++;
}

void carveCorridor(World& w, int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx)
        if (w.dungeon[y1][x] == 0) w.dungeon[y1][x] = 2;
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy)
        if (w.dungeon[y][x2] == 0) w.dungeon[y][x2] = 2;
}

void findRoomCenter(World& w, int idx, int& cx, int& cy) {
    if (isLeaf(w, idx)) {
        for (int i = 0; i < w.room_count; i++) {
            if (w.rooms[i].x >= w.nodes[idx].x && w.rooms[i].x < w.nodes[idx].x + w.nodes[idx].w &&
                w.rooms[i].y >= w.nodes[idx].y && w.rooms[i].y < w.nodes[idx].y + w.nodes[idx].h) {
                cx = w.rooms[i].cx; cy = w.rooms[i].cy; return;
            }
        }
    }
    int left = 2 * idx + 1;
    if (left < w.node_count && w.nodes[left].w > 0) findRoomCenter(w, left, cx, cy);
}

void connectBSP(World& w, int idx, int& corridor_count) {
    if (isLeaf(w, idx)) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= w.node_count) return;
    int lcx = 0, lcy = 0, rcx = 0, rcy = 0;
    findRoomCenter(w, left, lcx, lcy);
    findRoomCenter(w, right, rcx, rcy);
    carveCorridor(w, lcx, lcy, rcx, rcy);
    corridor_count++;
    connectBSP(w, left, corridor_count);
    connectBSP(w, right, corridor_count);
}

void populateEnemies(World& w) {
    for (int i = 1; i < w.room_count; i++) {
        int count = rngRange(w, 1, 3);
        for (int j = 0; j < count; j++) {
            int ex = rngRange(w, w.rooms[i].x, w.rooms[i].x + w.rooms[i].w - 1);
            int ey = rngRange(w, w.rooms[i].y, w.rooms[i].y + w.rooms[i].h - 1);
            w.enemies[w.enemy_count++] = {ex, ey, 3, true};
        }
    }
}

int findEnemyAt(World& w, int x, int y) {
    for (int i = 0; i < w.enemy_count; i++)
        if (w.enemies[i].alive && w.enemies[i].x == x && w.enemies[i].y == y) return i;
    return -1;
}

void generateFloor(World& w) {
    memset(w.dungeon, 0, sizeof(w.dungeon));
    w.node_count = 1; w.room_count = 0; w.enemy_count = 0;
    memset(w.nodes, 0, sizeof(w.nodes));
    w.nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(w, 0, 0);
    for (int i = 0; i < w.node_count; i++)
        if (isLeaf(w, i)) carveRoom(w, w.nodes[i]);
    int cc = 0; connectBSP(w, 0, cc);
    w.px = w.rooms[0].cx; w.py = w.rooms[0].cy;
    w.stairsX = w.rooms[w.room_count-1].cx;
    w.stairsY = w.rooms[w.room_count-1].cy;
    populateEnemies(w);
}

void handleInput(World& w) {
    if (w.gameOver) return;
    int nx = w.px, ny = w.py;
    if (IsKeyPressed(KEY_W)) ny--;
    if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--;
    if (IsKeyPressed(KEY_D)) nx++;
    if (nx == w.px && ny == w.py) return;

    if (nx == w.stairsX && ny == w.stairsY) {
        w.floor_num++;
        w.score += 50;
        w.rng_state = (uint32_t)(w.floor_num * 48271);
        generateFloor(w);
        return;
    }

    int ei = findEnemyAt(w, nx, ny);
    if (ei >= 0) {
        w.enemies[ei].hp -= 1;
        w.playerHp -= 1;
        if (w.enemies[ei].hp <= 0) { w.enemies[ei].alive = false; w.score += 10; }
        if (w.playerHp <= 0) w.gameOver = true;
    } else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != 0) {
        w.px = nx; w.py = ny;
    }
}

int main() {
    World w = {};
    w.rng_state = 42;
    w.floor_num = 1;
    w.playerHp = 10;
    generateFloor(w);

    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Enemies: " << w.enemy_count << endl;
    cout << "Score: " << w.score << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        handleInput(w);
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (w.dungeon[y][x] == 1)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, DARKGRAY);
                else if (w.dungeon[y][x] == 2)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, (Color){60,60,60,255});
            }
        }
        DrawRectangle(w.stairsX*TILE_SIZE, w.stairsY*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, YELLOW);
        for (int i = 0; i < w.enemy_count; i++)
            if (w.enemies[i].alive)
                DrawRectangle(w.enemies[i].x*TILE_SIZE, w.enemies[i].y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, RED);
        DrawRectangle(w.px*TILE_SIZE, w.py*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, GREEN);
        DrawText(TextFormat("HP: %d  Floor: %d  Score: %d", w.playerHp, w.floor_num, w.score), 10, SCREEN_H - 25, 20, GREEN);
        if (w.gameOver) DrawText("GAME OVER", SCREEN_W/2 - 80, SCREEN_H/2, 30, RED);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints seed", expectedOutput: "Seed: 42" },
      { id: "g2", description: "Floor number", expectedOutput: "Floor: 1" },
      { id: "g3", description: "Room count", expectedOutput: "Rooms: 4" },
      { id: "g4", description: "Enemy count", expectedOutput: "Enemies: 5" },
      { id: "g5", description: "Initial score", expectedOutput: "Score: 0" },
    ],
    hints: [
      "handleInput takes World& w. Replace every px with w.px, every py with w.py, playerHp with w.playerHp, etc.",
      "Don't forget stairsX/Y, score, gameOver, and floor_num all become w.stairsX, w.score, w.gameOver, w.floor_num.",
      "The key change: void handleInput(World& w) { if(w.gameOver) return; int nx=w.px,ny=w.py; ... if(nx==w.stairsX&&ny==w.stairsY) { w.floor_num++; w.score+=50; ... } ... }",
    ],
    estimatedMinutes: 25,
  },
};