import { Lesson } from "@/types/lesson";

export const lessonRoguelike16: Lesson = {
  id: "roguelike-16-generation-module",
  title: "The Professional Split",
  description: "Split monolithic main.cpp into header/source pairs. Headers declare interfaces, sources define implementations. This is how every shipped C++ project works.",
  order: 16,
  xpReward: 100,
  tier: "pro",
  concepts: ["header/source split", "#pragma once", "forward declarations", "compilation units"],
  part1: {
    title: "Concept: Headers and Source Files",
    type: "concept",
    instructions: `# The Professional Split

## Mental Model
A header file (.h) is a MENU. It lists what's available: function names, parameter types, return types. A source file (.cpp) is the KITCHEN. It contains the actual code that runs. Customers (other files) read the menu. They don't need to see the kitchen.

## What Breaks Without This
Our L15 roguelike is 200+ lines in one file. Finding generateFloor() means scrolling past BSP code, entity code, and rendering code. Adding a new feature means editing a massive file where every change risks breaking unrelated code. Professional projects have THOUSANDS of files — each one small, focused, independently compilable.

## The Pattern

\`\`\`cpp
// hs_generate.h — the MENU
#pragma once
struct World;  // forward declaration
void generateFloor(World& w);
\`\`\`

\`\`\`cpp
// hs_generate.cpp — the KITCHEN
#include \"hs_generate.h\"
#include \"hs_world.h\"
void generateFloor(World& w) {
    // full implementation here
}
\`\`\`

## Key Concepts
- **\`#pragma once\`**: Tells the compiler "only include this header once per compilation." Prevents duplicate definitions.
- **Forward declaration**: \`struct World;\` tells the compiler "World exists" without including its full definition. Use when you only need a pointer or reference.
- **Include what you use**: \`hs_generate.cpp\` includes \`hs_world.h\` because it USES World fields. The header only needs \`struct World;\` because it only references World& parameters.
- **Header-only files**: Pure type definitions (enums, structs with no methods) stay in .h files with no .cpp counterpart. \`hs_types.h\` and \`hs_world.h\` are header-only.

## Your Task
Create a header/source pair for a simple math module. Declare in the header, implement in the source.

Expected output:
\`\`\`
add(3,4) = 7
multiply(3,4) = 12
Module: math
\`\`\`

## Beginner Trap
**Putting function BODIES in headers.** If \`hs_generate.h\` contains \`void generateFloor(World& w) { ... }\` instead of just the declaration, every file that includes it gets a COPY of the function body. The linker sees duplicates and errors out.

## Elite Insight
Unity's IL2CPP build and our WASM compiler both concatenate all .cpp files into one compilation unit. But file discipline still matters: it organizes code for HUMANS. A 10,000-line main.cpp is valid C++ but unmaintainable. The professional split is about developer productivity, not compiler requirements.`,
    starterCode: `#include <iostream>
using namespace std;

// In a real project, these would be in separate files:
// math.h - declarations
// math.cpp - implementations

// TODO: Declare add(int a, int b) and multiply(int a, int b)

// TODO: Implement add() - returns a + b
// TODO: Implement multiply() - returns a * b

int main() {
    cout << "add(3,4) = " << add(3, 4) << endl;
    cout << "multiply(3,4) = " << multiply(3, 4) << endl;
    cout << "Module: math" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int add(int a, int b) { return a + b; }
int multiply(int a, int b) { return a * b; }

int main() {
    cout << "add(3,4) = " << add(3, 4) << endl;
    cout << "multiply(3,4) = " << multiply(3, 4) << endl;
    cout << "Module: math" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Addition", expectedOutput: "add(3,4) = 7" },
      { id: "t2", description: "Multiplication", expectedOutput: "multiply(3,4) = 12" },
      { id: "t3", description: "Module name", expectedOutput: "Module: math" },
    ],
    hints: [
      "Declare: int add(int a, int b); before main().",
      "Implement: int add(int a, int b) { return a + b; }",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Multi-File Roguelike",
    type: "game_builder",
    instructions: `# Build: Multi-File Roguelike

## Mental Model
The 200-line main.cpp dies. In its place: 7 focused files. \`hs_types.h\` owns type definitions. \`hs_world.h\` owns the World struct. \`hs_generate.h/.cpp\` owns dungeon generation. \`hs_render.h/.cpp\` owns rendering. \`main.cpp\` owns the game loop.

## Your Task
The code is already split into files. Your job: fill in \`hs_generate.h\` (declare the generation functions) and \`hs_generate.cpp\` (implement them). The other files are given.

Expected cout output:
\`\`\`
Seed: 42
Floor: 1
Rooms: 4
Entities: 6
NextID: 7
Modules: generate|render
\`\`\`

**Click Run** to see the multi-file roguelike.

## File Overview
| File | Purpose |
|------|---------|
| \`src/hs_types.h\` | Constants, enums, basic structs (header-only) |
| \`src/hs_world.h\` | World struct definition (header-only) |
| \`src/hs_generate.h\` | Generation function declarations |
| \`src/hs_generate.cpp\` | Generation function implementations |
| \`src/hs_render.h\` | Render function declarations |
| \`src/hs_render.cpp\` | Render function implementations |
| \`src/main.cpp\` | Game loop, input handling |

## Did It Work?
Game plays identically to L15. The visual output is the same. But the code is now organized into focused files. The cout "Modules: generate|render" proves both modules are loaded.

## Beginner Trap
**Missing \`#include\` in the .cpp file.** \`hs_generate.cpp\` must include \`hs_generate.h\` (its own header), \`hs_world.h\` (for World struct fields), and \`<cstring>\` (for memset). Missing any include causes "undefined" errors.

## Elite Insight
Google's C++ style guide mandates: every .cpp includes its own .h FIRST. This catches headers that forget their own dependencies. If \`hs_generate.h\` uses BSPNode but doesn't include \`hs_types.h\`, putting \`#include "hs_generate.h"\` first in \`hs_generate.cpp\` will immediately error — catching the bug at the source.`,
    starterCode: {
  "src/hs_types.h": `#pragma once

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;
const int MAX_NODES = 15;
const int MAX_ENTITIES = 64;

enum TileType { TILE_WALL = 0, TILE_FLOOR = 1, TILE_CORRIDOR = 2, TILE_STAIRS = 3 };
enum EntityType { ENT_PLAYER = 0, ENT_ENEMY = 1 };
struct Vec2i { int x, y; };
struct BSPNode { int x, y, w, h; };
struct Room { int x, y, w, h, cx, cy; };`,
  "src/hs_world.h": `#pragma once
#include "hs_types.h"

struct World {
    int dungeon[MAP_H][MAP_W];
    BSPNode nodes[MAX_NODES];
    int node_count;
    Room rooms[8];
    int room_count;
    int entity_id[MAX_ENTITIES];
    int entity_x[MAX_ENTITIES];
    int entity_y[MAX_ENTITIES];
    int entity_hp[MAX_ENTITIES];
    int entity_type[MAX_ENTITIES];
    bool entity_active[MAX_ENTITIES];
    int entity_count;
    int nextId;
    int stairsX, stairsY;
    int floor_num;
    int score;
    bool gameOver;
    uint32_t rng_state;
};`,
  "src/hs_generate.h": `#pragma once
#include "hs_types.h"

struct World;

// TODO: Declare ALL generation functions:
// uint32_t rngNext(World& w);
// int rngRange(World& w, int lo, int hi);
// void bspSplit(World& w, int idx, int depth);
// bool isLeaf(World& w, int idx);
// void carveRoom(World& w, BSPNode node);
// void carveCorridor(World& w, int x1, int y1, int x2, int y2);
// void findRoomCenter(World& w, int idx, int& cx, int& cy);
// void connectBSP(World& w, int idx, int& cc);
// int addEntity(World& w, int type, int x, int y, int hp);
// int findEntityById(World& w, int id);
// int findEntityAt(World& w, int x, int y, int type);
// void populateEnemies(World& w);
// void generateFloor(World& w);`,
  "src/hs_generate.cpp": `#include "hs_generate.h"
#include "hs_world.h"
#include <cstring>

// TODO: Implement all generation functions here
// Copy the implementations from L15 for:
// rngNext, rngRange, bspSplit, isLeaf, carveRoom,
// carveCorridor, findRoomCenter, connectBSP,
// addEntity, findEntityById, findEntityAt,
// populateEnemies, generateFloor`,
  "src/hs_render.h": `#pragma once

struct World;
void renderTerrain(World& w);
void renderEntities(World& w);
void renderHUD(World& w);`,
  "src/hs_render.cpp": `#include "hs_render.h"
#include "hs_world.h"
#include "hs_types.h"
#include "raylib.h"

void renderTerrain(World& w) {
    for (int y = 0; y < MAP_H; y++) for (int x = 0; x < MAP_W; x++) {
        if (w.dungeon[y][x] == TILE_FLOOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,DARKGRAY);
        else if (w.dungeon[y][x] == TILE_CORRIDOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,(Color){60,60,60,255});
    }
    DrawRectangle(w.stairsX*TILE_SIZE,w.stairsY*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,YELLOW);
}

void renderEntities(World& w) {
    for (int i = 0; i < w.entity_count; i++) {
        if (!w.entity_active[i]) continue;
        Color c = (w.entity_type[i] == ENT_PLAYER) ? GREEN : RED;
        DrawRectangle(w.entity_x[i]*TILE_SIZE,w.entity_y[i]*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,c);
    }
}

void renderHUD(World& w) {
    DrawText(TextFormat("HP: %d  Floor: %d  Score: %d",w.entity_hp[0],w.floor_num,w.score),10,SCREEN_H-25,20,GREEN);
    if (w.gameOver) DrawText("GAME OVER",SCREEN_W/2-80,SCREEN_H/2,30,RED);
}`,
  "src/main.cpp": `#include <iostream>
#include "raylib.h"
#include "hs_types.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_render.h"
using namespace std;

void handleInput(World& w) {
    if (w.gameOver) return;
    int nx = w.entity_x[0], ny = w.entity_y[0];
    if (IsKeyPressed(KEY_W)) ny--; if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--; if (IsKeyPressed(KEY_D)) nx++;
    if (nx == w.entity_x[0] && ny == w.entity_y[0]) return;
    if (nx == w.stairsX && ny == w.stairsY) { w.floor_num++; w.score += 50; w.rng_state = (uint32_t)(w.floor_num * 48271); generateFloor(w); return; }
    int ei = findEntityAt(w, nx, ny, ENT_ENEMY);
    if (ei >= 0) {
        w.entity_hp[ei]--; w.entity_hp[0]--;
        if (w.entity_hp[ei] <= 0) { w.entity_active[ei] = false; w.score += 10; }
        if (w.entity_hp[0] <= 0) w.gameOver = true;
    }
    else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) {
        w.entity_x[0] = nx; w.entity_y[0] = ny;
    }
}

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;
    cout << "Modules: generate|render" << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        handleInput(w);
        BeginDrawing();
        ClearBackground(BLACK);
        renderTerrain(w);
        renderEntities(w);
        renderHUD(w);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    },
    solutionCode: {
  "src/hs_types.h": `#pragma once

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;
const int MAX_NODES = 15;
const int MAX_ENTITIES = 64;

enum TileType { TILE_WALL = 0, TILE_FLOOR = 1, TILE_CORRIDOR = 2, TILE_STAIRS = 3 };
enum EntityType { ENT_PLAYER = 0, ENT_ENEMY = 1 };
struct Vec2i { int x, y; };
struct BSPNode { int x, y, w, h; };
struct Room { int x, y, w, h, cx, cy; };`,
  "src/hs_world.h": `#pragma once
#include "hs_types.h"

struct World {
    int dungeon[MAP_H][MAP_W];
    BSPNode nodes[MAX_NODES];
    int node_count;
    Room rooms[8];
    int room_count;
    int entity_id[MAX_ENTITIES];
    int entity_x[MAX_ENTITIES];
    int entity_y[MAX_ENTITIES];
    int entity_hp[MAX_ENTITIES];
    int entity_type[MAX_ENTITIES];
    bool entity_active[MAX_ENTITIES];
    int entity_count;
    int nextId;
    int stairsX, stairsY;
    int floor_num;
    int score;
    bool gameOver;
    uint32_t rng_state;
};`,
  "src/hs_generate.h": `#pragma once
#include "hs_types.h"

struct World;
uint32_t rngNext(World& w);
int rngRange(World& w, int lo, int hi);
void bspSplit(World& w, int idx, int depth);
bool isLeaf(World& w, int idx);
void carveRoom(World& w, BSPNode node);
void carveCorridor(World& w, int x1, int y1, int x2, int y2);
void findRoomCenter(World& w, int idx, int& cx, int& cy);
void connectBSP(World& w, int idx, int& cc);
int addEntity(World& w, int type, int x, int y, int hp);
int findEntityById(World& w, int id);
int findEntityAt(World& w, int x, int y, int type);
void populateEnemies(World& w);
void generateFloor(World& w);`,
  "src/hs_generate.cpp": `#include "hs_generate.h"
#include "hs_world.h"
#include <cstring>

uint32_t rngNext(World& w) { w.rng_state = w.rng_state * 48271u % 0x7fffffffu; return w.rng_state; }
int rngRange(World& w, int lo, int hi) { return lo + (int)(rngNext(w) % (uint32_t)(hi - lo + 1)); }

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
            w.dungeon[y][x] = TILE_FLOOR;
    w.rooms[w.room_count] = {rx, ry, rw, rh, rx + rw/2, ry + rh/2};
    w.room_count++;
}

void carveCorridor(World& w, int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx)
        if (w.dungeon[y1][x] == TILE_WALL) w.dungeon[y1][x] = TILE_CORRIDOR;
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy)
        if (w.dungeon[y][x2] == TILE_WALL) w.dungeon[y][x2] = TILE_CORRIDOR;
}

void findRoomCenter(World& w, int idx, int& cx, int& cy) {
    if (isLeaf(w, idx)) { for (int i = 0; i < w.room_count; i++) { if (w.rooms[i].x >= w.nodes[idx].x && w.rooms[i].x < w.nodes[idx].x + w.nodes[idx].w && w.rooms[i].y >= w.nodes[idx].y && w.rooms[i].y < w.nodes[idx].y + w.nodes[idx].h) { cx = w.rooms[i].cx; cy = w.rooms[i].cy; return; } } }
    int left = 2 * idx + 1; if (left < w.node_count && w.nodes[left].w > 0) findRoomCenter(w, left, cx, cy);
}

void connectBSP(World& w, int idx, int& cc) {
    if (isLeaf(w, idx)) return;
    int left = 2*idx+1, right = 2*idx+2; if (right >= w.node_count) return;
    int lcx=0,lcy=0,rcx=0,rcy=0; findRoomCenter(w,left,lcx,lcy); findRoomCenter(w,right,rcx,rcy);
    carveCorridor(w,lcx,lcy,rcx,rcy); cc++; connectBSP(w,left,cc); connectBSP(w,right,cc);
}

int addEntity(World& w, int type, int x, int y, int hp) {
    int i = w.entity_count++;
    w.entity_id[i] = w.nextId++;
    w.entity_type[i] = type;
    w.entity_x[i] = x;
    w.entity_y[i] = y;
    w.entity_hp[i] = hp;
    w.entity_active[i] = true;
    return i;
}

int findEntityById(World& w, int id) {
    for (int i = 0; i < w.entity_count; i++)
        if (w.entity_id[i] == id) return i;
    return -1;
}

int findEntityAt(World& w, int x, int y, int type) {
    for (int i = 0; i < w.entity_count; i++)
        if (w.entity_active[i] && w.entity_type[i] == type && w.entity_x[i] == x && w.entity_y[i] == y) return i;
    return -1;
}

void populateEnemies(World& w) {
    for (int i = 1; i < w.room_count; i++) {
        int count = rngRange(w, 1, 3);
        for (int j = 0; j < count; j++) {
            int ex = rngRange(w, w.rooms[i].x, w.rooms[i].x + w.rooms[i].w - 1);
            int ey = rngRange(w, w.rooms[i].y, w.rooms[i].y + w.rooms[i].h - 1);
            addEntity(w, ENT_ENEMY, ex, ey, 3);
        }
    }
}

void generateFloor(World& w) {
    int savedHp = (w.entity_count > 0) ? w.entity_hp[0] : 10;
    memset(w.dungeon, 0, sizeof(w.dungeon));
    w.node_count = 1; w.room_count = 0; w.entity_count = 0;
    memset(w.nodes, 0, sizeof(w.nodes));
    w.nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(w, 0, 0);
    for (int i = 0; i < w.node_count; i++) if (isLeaf(w, i)) carveRoom(w, w.nodes[i]);
    int cc = 0; connectBSP(w, 0, cc);
    addEntity(w, ENT_PLAYER, w.rooms[0].cx, w.rooms[0].cy, savedHp);
    w.stairsX = w.rooms[w.room_count-1].cx; w.stairsY = w.rooms[w.room_count-1].cy;
    populateEnemies(w);
}`,
  "src/hs_render.h": `#pragma once

struct World;
void renderTerrain(World& w);
void renderEntities(World& w);
void renderHUD(World& w);`,
  "src/hs_render.cpp": `#include "hs_render.h"
#include "hs_world.h"
#include "hs_types.h"
#include "raylib.h"

void renderTerrain(World& w) {
    for (int y = 0; y < MAP_H; y++) for (int x = 0; x < MAP_W; x++) {
        if (w.dungeon[y][x] == TILE_FLOOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,DARKGRAY);
        else if (w.dungeon[y][x] == TILE_CORRIDOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,(Color){60,60,60,255});
    }
    DrawRectangle(w.stairsX*TILE_SIZE,w.stairsY*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,YELLOW);
}

void renderEntities(World& w) {
    for (int i = 0; i < w.entity_count; i++) {
        if (!w.entity_active[i]) continue;
        Color c = (w.entity_type[i] == ENT_PLAYER) ? GREEN : RED;
        DrawRectangle(w.entity_x[i]*TILE_SIZE,w.entity_y[i]*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,c);
    }
}

void renderHUD(World& w) {
    DrawText(TextFormat("HP: %d  Floor: %d  Score: %d",w.entity_hp[0],w.floor_num,w.score),10,SCREEN_H-25,20,GREEN);
    if (w.gameOver) DrawText("GAME OVER",SCREEN_W/2-80,SCREEN_H/2,30,RED);
}`,
  "src/main.cpp": `#include <iostream>
#include "raylib.h"
#include "hs_types.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_render.h"
using namespace std;

void handleInput(World& w) {
    if (w.gameOver) return;
    int nx = w.entity_x[0], ny = w.entity_y[0];
    if (IsKeyPressed(KEY_W)) ny--; if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--; if (IsKeyPressed(KEY_D)) nx++;
    if (nx == w.entity_x[0] && ny == w.entity_y[0]) return;
    if (nx == w.stairsX && ny == w.stairsY) { w.floor_num++; w.score += 50; w.rng_state = (uint32_t)(w.floor_num * 48271); generateFloor(w); return; }
    int ei = findEntityAt(w, nx, ny, ENT_ENEMY);
    if (ei >= 0) {
        w.entity_hp[ei]--; w.entity_hp[0]--;
        if (w.entity_hp[ei] <= 0) { w.entity_active[ei] = false; w.score += 10; }
        if (w.entity_hp[0] <= 0) w.gameOver = true;
    }
    else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) {
        w.entity_x[0] = nx; w.entity_y[0] = ny;
    }
}

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;
    cout << "Modules: generate|render" << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        handleInput(w);
        BeginDrawing();
        ClearBackground(BLACK);
        renderTerrain(w);
        renderEntities(w);
        renderHUD(w);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    },
    tests: [
      { id: "g1", description: "Prints seed", expectedOutput: "Seed: 42" },
      { id: "g2", description: "Floor number", expectedOutput: "Floor: 1" },
      { id: "g3", description: "Room count", expectedOutput: "Rooms: 4" },
      { id: "g4", description: "Entity count", expectedOutput: "Entities: 6" },
      { id: "g5", description: "Next ID counter", expectedOutput: "NextID: 7" },
      { id: "g6", description: "Module split", expectedOutput: "Modules: generate|render" },
    ],
    hints: [
      "In hs_generate.h, declare each function with its full signature ending in semicolon.",
      "In hs_generate.cpp, include hs_generate.h, hs_world.h, and <cstring>, then paste the implementations.",
      "Forward declare struct World; in hs_generate.h since the header only uses World& references.",
    ],
    estimatedMinutes: 25,
  },
};
