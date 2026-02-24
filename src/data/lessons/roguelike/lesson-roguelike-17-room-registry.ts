import { Lesson } from "@/types/lesson";

export const lessonRoguelike17: Lesson = {
  id: "roguelike-17-room-registry",
  title: "Room Registry",
  description: "Extract room-querying functions into a dedicated hs_rooms module. Headers declare the interface, source files implement it. Each module owns one responsibility.",
  order: 17,
  xpReward: 100,
  tier: "pro",
  concepts: ["module extraction", "room queries", "point-in-rect", "single responsibility"],
  part1: {
    title: "Concept: Room Query Functions",
    type: "concept",
    instructions: `# Room Registry

## What Breaks Without This
Your dungeon has rooms. But right now, answering "which room is the player in?" requires scanning every room manually every time you need it. Enemy AI needs to know which room it guards. Loot placement needs room centers. Minimap highlighting needs point-in-room checks. Without a dedicated room query module, every system re-implements the same loops. Bugs hide in the copies.

## Mental Model
A **Room Registry** is a phone book for rooms. You ask it questions: "What room contains tile (12, 8)?" or "Where is the center of room 2?" It answers instantly. Every system asks the registry instead of scanning raw arrays.

## The Pattern

\`\`\`cpp
struct Room { int x, y, w, h, cx, cy; };

// Is point (px,py) inside room r?
bool isPointInRoom(Room& r, int px, int py) {
    return px >= r.x && px < r.x + r.w
        && py >= r.y && py < r.y + r.h;
}

// Find which room contains (x,y), return index or -1
int findRoomAt(Room rooms[], int count, int x, int y) {
    for (int i = 0; i < count; i++)
        if (isPointInRoom(rooms[i], x, y)) return i;
    return -1;
}
\`\`\`

## Key Concepts
- **Point-in-rectangle test**: Check if (x,y) falls within [rx, rx+rw) x [ry, ry+rh). The half-open range avoids double-counting edges.
- **Index return**: Returning -1 for "not found" is C's convention. The caller checks before using the index.
- **Room center**: Pre-computed (cx, cy) avoids recalculating x+w/2 every frame. Store it once when the room is carved.
- **Module extraction**: When multiple systems need the same queries, extract them into a shared module instead of copy-pasting.

## Your Task
Implement room query functions for a simple array of rooms. Test them with console output.

Expected output:
\`\`\`
Room 0: (2,2) 5x4 center(4,4)
Room 1: (10,8) 6x3 center(13,9)
Point(4,4) in room: 0
Point(13,9) in room: 1
Point(0,0) in room: -1
Room count: 2
\`\`\`

## Beginner Trap
**Off-by-one in bounds check.** Using \`<=\` instead of \`<\` for the right/bottom edge means a room at (2,2) with width 5 claims tile (7,2). Half-open ranges: \`x >= r.x && x < r.x + r.w\`.

## Elite Insight
Doom (1993) stored rooms as "sectors" with a BSP tree for O(log n) point-in-sector queries. Our linear scan is O(n) but with ~8 rooms it's faster than tree overhead. Optimization matters when n grows â€” not before.`,
    starterCode: `#include <iostream>
using namespace std;

struct Room { int x, y, w, h, cx, cy; };

bool isPointInRoom(Room& r, int px, int py) {
    // TODO: Return true if (px,py) is inside room r
    // Use half-open range: px >= r.x && px < r.x + r.w
    return false;
}

int findRoomAt(Room rooms[], int count, int x, int y) {
    // TODO: Loop through rooms, return index of room containing (x,y)
    // Return -1 if no room contains the point
    return -1;
}

int getRoomCount(Room rooms[], int maxRooms) {
    // TODO: Count rooms where w > 0 (non-empty)
    return 0;
}

int main() {
    Room rooms[8] = {};
    rooms[0] = {2, 2, 5, 4, 4, 4};
    rooms[1] = {10, 8, 6, 3, 13, 9};

    cout << "Room 0: (" << rooms[0].x << "," << rooms[0].y << ") "
         << rooms[0].w << "x" << rooms[0].h
         << " center(" << rooms[0].cx << "," << rooms[0].cy << ")" << endl;
    cout << "Room 1: (" << rooms[1].x << "," << rooms[1].y << ") "
         << rooms[1].w << "x" << rooms[1].h
         << " center(" << rooms[1].cx << "," << rooms[1].cy << ")" << endl;

    cout << "Point(4,4) in room: " << findRoomAt(rooms, 2, 4, 4) << endl;
    cout << "Point(13,9) in room: " << findRoomAt(rooms, 2, 13, 9) << endl;
    cout << "Point(0,0) in room: " << findRoomAt(rooms, 2, 0, 0) << endl;
    cout << "Room count: " << getRoomCount(rooms, 8) << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Room { int x, y, w, h, cx, cy; };

bool isPointInRoom(Room& r, int px, int py) {
    return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
}

int findRoomAt(Room rooms[], int count, int x, int y) {
    for (int i = 0; i < count; i++)
        if (isPointInRoom(rooms[i], x, y)) return i;
    return -1;
}

int getRoomCount(Room rooms[], int maxRooms) {
    int count = 0;
    for (int i = 0; i < maxRooms; i++)
        if (rooms[i].w > 0) count++;
    return count;
}

int main() {
    Room rooms[8] = {};
    rooms[0] = {2, 2, 5, 4, 4, 4};
    rooms[1] = {10, 8, 6, 3, 13, 9};

    cout << "Room 0: (" << rooms[0].x << "," << rooms[0].y << ") "
         << rooms[0].w << "x" << rooms[0].h
         << " center(" << rooms[0].cx << "," << rooms[0].cy << ")" << endl;
    cout << "Room 1: (" << rooms[1].x << "," << rooms[1].y << ") "
         << rooms[1].w << "x" << rooms[1].h
         << " center(" << rooms[1].cx << "," << rooms[1].cy << ")" << endl;

    cout << "Point(4,4) in room: " << findRoomAt(rooms, 2, 4, 4) << endl;
    cout << "Point(13,9) in room: " << findRoomAt(rooms, 2, 13, 9) << endl;
    cout << "Point(0,0) in room: " << findRoomAt(rooms, 2, 0, 0) << endl;
    cout << "Room count: " << getRoomCount(rooms, 8) << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Room 0 info", expectedOutput: "Room 0: (2,2) 5x4 center(4,4)" },
      { id: "t2", description: "Room 1 info", expectedOutput: "Room 1: (10,8) 6x3 center(13,9)" },
      { id: "t3", description: "Point in room 0", expectedOutput: "Point(4,4) in room: 0" },
      { id: "t4", description: "Point in room 1", expectedOutput: "Point(13,9) in room: 1" },
      { id: "t5", description: "Point in no room", expectedOutput: "Point(0,0) in room: -1" },
      { id: "t6", description: "Room count", expectedOutput: "Room count: 2" },
    ],
    hints: [
      "isPointInRoom: return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;",
      "findRoomAt: loop i from 0 to count, call isPointInRoom(rooms[i], x, y), return i if true.",
      "getRoomCount: loop through maxRooms, increment a counter when rooms[i].w > 0.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Room Registry Module",
    type: "game_builder",
    instructions: `# Build: Room Registry Module

## Mental Model
The generation module owns BSP splitting, carving, corridors, and entity placement. But room QUERIES ("which room is this tile in?", "what's the center of room 3?") are used by rendering, AI, and UI systems too. They don't belong in generation. Extract them into \`hs_rooms.h/.cpp\` â€” a Room Registry that any module can query.

## Your Task
Create \`hs_rooms.h\` and \`hs_rooms.cpp\` with four room query functions. Update \`main.cpp\` to include the new module and print the updated Modules line.

Expected cout output:
\`\`\`
Seed: 42
Floor: 1
Rooms: 4
Entities: 6
NextID: 7
Modules: generate|render|rooms
\`\`\`

## File Overview
| File | Purpose | Change |
|------|---------|--------|
| \`src/hs_types.h\` | Constants, enums, structs | No change |
| \`src/hs_world.h\` | World struct | No change |
| \`src/hs_generate.h\` | Generation declarations | No change |
| \`src/hs_generate.cpp\` | Generation implementations | No change |
| \`src/hs_render.h\` | Render declarations | No change |
| \`src/hs_render.cpp\` | Render implementations | No change |
| \`src/hs_rooms.h\` | **NEW** Room query declarations | Create this |
| \`src/hs_rooms.cpp\` | **NEW** Room query implementations | Create this |
| \`src/main.cpp\` | Game loop | Add hs_rooms.h include, update Modules |

## New Functions in hs_rooms
| Function | Purpose |
|----------|---------|
| \`int findRoomAt(World& w, int x, int y)\` | Returns index of room containing (x,y), or -1 |
| \`Vec2i getRoomCenter(World& w, int roomIdx)\` | Returns center of room at index |
| \`bool isPointInRoom(Room& r, int x, int y)\` | Point-in-rectangle test |
| \`int getRoomCount(World& w)\` | Returns number of carved rooms |

## Step by Step
1. **Fill in \`hs_rooms.h\`**: Declare all four functions after the forward declaration.
2. **Fill in \`hs_rooms.cpp\`**: Implement each function. Include \`hs_rooms.h\` and \`hs_world.h\`.
3. **Check \`main.cpp\`**: It already includes \`hs_rooms.h\` and prints the updated Modules line.
4. **Click Run** to verify.

## Did It Work?
The game plays identically to L16. The cout now shows \`Modules: generate|render|rooms\` proving the new module is loaded. The visual output is unchanged â€” this refactoring adds capability without changing behavior.

## Beginner Trap
**Forgetting \`#include "hs_world.h"\` in hs_rooms.cpp.** The header only needs \`struct World;\` (forward declaration) because it only uses \`World&\` references. But the .cpp file ACCESSES \`w.rooms[i].x\` â€” it needs the full World definition from \`hs_world.h\`.

## Elite Insight
Separating queries from mutations is the CQRS pattern (Command Query Responsibility Segregation). \`hs_generate\` MUTATES the world (carves rooms, spawns entities). \`hs_rooms\` only READS it (finds rooms, checks containment). This separation means room queries can never accidentally corrupt world state â€” a guarantee enforced by module boundaries.`,
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
  "src/hs_rooms.h": `#pragma once
#include "hs_types.h"

struct World;

// TODO: Declare these four room query functions:
// int findRoomAt(World& w, int x, int y);
// Vec2i getRoomCenter(World& w, int roomIdx);
// bool isPointInRoom(Room& r, int x, int y);
// int getRoomCount(World& w);`,
  "src/hs_rooms.cpp": `#include "hs_rooms.h"
#include "hs_world.h"

// TODO: Implement findRoomAt(World& w, int x, int y)
// Loop through w.rooms[0..w.room_count-1]
// Check if (x,y) is inside each room using half-open range
// Return index i if found, -1 if not

// TODO: Implement getRoomCenter(World& w, int roomIdx)
// Return a Vec2i with {w.rooms[roomIdx].cx, w.rooms[roomIdx].cy}

// TODO: Implement isPointInRoom(Room& r, int x, int y)
// Return true if x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h

// TODO: Implement getRoomCount(World& w)
// Return w.room_count`,
  "src/main.cpp": `#include <iostream>
#include "raylib.h"
#include "hs_types.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_render.h"
#include "hs_rooms.h"
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
    cout << "Modules: generate|render|rooms" << endl;

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
  "src/hs_rooms.h": `#pragma once
#include "hs_types.h"

struct World;
int findRoomAt(World& w, int x, int y);
Vec2i getRoomCenter(World& w, int roomIdx);
bool isPointInRoom(Room& r, int x, int y);
int getRoomCount(World& w);`,
  "src/hs_rooms.cpp": `#include "hs_rooms.h"
#include "hs_world.h"

int findRoomAt(World& w, int x, int y) {
    for (int i = 0; i < w.room_count; i++) {
        if (x >= w.rooms[i].x && x < w.rooms[i].x + w.rooms[i].w &&
            y >= w.rooms[i].y && y < w.rooms[i].y + w.rooms[i].h) return i;
    }
    return -1;
}

Vec2i getRoomCenter(World& w, int roomIdx) {
    return {w.rooms[roomIdx].cx, w.rooms[roomIdx].cy};
}

bool isPointInRoom(Room& r, int x, int y) {
    return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

int getRoomCount(World& w) { return w.room_count; }`,
  "src/main.cpp": `#include <iostream>
#include "raylib.h"
#include "hs_types.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_render.h"
#include "hs_rooms.h"
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
    cout << "Modules: generate|render|rooms" << endl;

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
      { id: "g6", description: "Modules with rooms", expectedOutput: "Modules: generate|render|rooms" },
    ],
    hints: [
      "In hs_rooms.h, declare each function with its full signature ending in semicolon after the struct World; forward declaration.",
      "In hs_rooms.cpp, include hs_rooms.h and hs_world.h. The .cpp needs hs_world.h to access w.rooms[i] fields.",
      "findRoomAt: loop i from 0 to w.room_count, check x >= w.rooms[i].x && x < w.rooms[i].x + w.rooms[i].w (same for y).",
      "getRoomCenter returns Vec2i{w.rooms[roomIdx].cx, w.rooms[roomIdx].cy}.",
    ],
    estimatedMinutes: 20,
  },
};
