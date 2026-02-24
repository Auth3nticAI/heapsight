import { Lesson } from "@/types/lesson";

export const lessonRoguelike12: Lesson = {
  id: "roguelike-12-types-and-coordinates",
  title: "Types and Coordinates",
  description: "Replace raw ints with Vec2i, TileType enum, EntityType enum. Type safety prevents wrong-value bugs.",
  order: 12,
  xpReward: 100,
  tier: "pro",
  concepts: ["enums", "type safety", "Vec2i struct", "named constants"],
  part1: {
    title: "Concept: Type Safety with Enums and Structs",
    type: "concept",
    instructions: `# Types and Coordinates

## Mental Model
Right now, tiles are integers: 0 = wall, 1 = floor, 2 = corridor. What does 3 mean? 4? Nobody knows without reading comments. Enums replace magic numbers with names. `TileType::FLOOR` is self-documenting. `dungeon[y][x] = 1` becomes `dungeon[y][x] = TileType::FLOOR`.

## What Breaks Without This
As the game grows, you'll add tile types: traps (3), water (4), stairs (5). Without enums, every comparison is a magic number guessing game. `if (dungeon[y][x] == 3)` — is that traps or corridors? Enums make it `if (tile == TileType::TRAP)`.

## The Fix: Enums and Vec2i

\```cpp
enum TileType { TILE_WALL = 0, TILE_FLOOR = 1, TILE_CORRIDOR = 2, TILE_STAIRS = 3 };
enum EntityType { ENT_PLAYER = 0, ENT_ENEMY = 1 };

struct Vec2i { int x, y; };
\```

## Key Concepts
- Enums replace magic numbers with named constants
- Vec2i bundles x/y into one parameter (two ints → one struct)
- EntityType distinguishes player from enemy without string comparisons
- All values are still ints under the hood — zero runtime cost

## Performance Insight
Enums compile to integers. `TileType::FLOOR` is literally the number 1 at runtime. Zero overhead. Vec2i is two ints packed together — same memory as two separate ints. Type safety is a compile-time feature, not a runtime cost.

## Memory Insight
Vec2i = 8 bytes (two ints). Same as two separate int variables. The struct adds semantic meaning without adding memory. Enums are 4 bytes each (same as int). Total new memory: 0 bytes.

## Your Task
Define TileType enum, EntityType enum, and Vec2i struct. Print their values.

Expected output:
\```
TILE_WALL: 0
TILE_FLOOR: 1
TILE_CORRIDOR: 2
Types defined: 3
\```

## Beginner Trap
**Using `enum class` when you want implicit int conversion.** `enum class TileType` requires explicit casts: `(int)TileType::FLOOR`. Plain `enum TileType` converts to int automatically. For a tile grid stored as int[][], plain enums are more practical.

## Elite Insight
Rust's type system makes invalid states unrepresentable. C++ enums are a weaker version of the same idea — you CAN still assign invalid values, but the names make correct usage obvious. Every shipped C++ engine uses enums for tile and entity types.

## Systems Thinking Connection
Type safety is the roguelike equivalent of the RPG's scene type enum. Both replace strings or magic numbers with compiler-checked constants. The compiler catches mistakes before the game runs.

## Skill Reinforcement
L11 organized state into World. L12 adds type safety. L13 will add entity IDs for safe references between entities.

## Mastery Check
Question: Why use Vec2i instead of separate x and y parameters?
Answer: Two reasons. First, you can't accidentally swap x and y when passing a Vec2i — it's one object. Second, functions that return a position return ONE value instead of needing output parameters. `Vec2i center = getRoomCenter(room)` is cleaner than `getRoomCenter(room, cx, cy)`.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Define enum TileType with TILE_WALL=0, TILE_FLOOR=1, TILE_CORRIDOR=2
// TODO: Define enum EntityType with ENT_PLAYER=0, ENT_ENEMY=1
// TODO: Define struct Vec2i with int x, y

int main() {
    // TODO: Print enum values
    cout << "TILE_WALL: 0" << endl;
    cout << "TILE_FLOOR: 1" << endl;
    cout << "TILE_CORRIDOR: 2" << endl;
    cout << "Types defined: 3" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

enum TileType { TILE_WALL = 0, TILE_FLOOR = 1, TILE_CORRIDOR = 2, TILE_STAIRS = 3 };
enum EntityType { ENT_PLAYER = 0, ENT_ENEMY = 1 };
struct Vec2i { int x, y; };

int main() {
    cout << "TILE_WALL: " << TILE_WALL << endl;
    cout << "TILE_FLOOR: " << TILE_FLOOR << endl;
    cout << "TILE_CORRIDOR: " << TILE_CORRIDOR << endl;
    cout << "Types defined: 3" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Wall type", expectedOutput: "TILE_WALL: 0" },
      { id: "t2", description: "Floor type", expectedOutput: "TILE_FLOOR: 1" },
      { id: "t3", description: "Corridor type", expectedOutput: "TILE_CORRIDOR: 2" },
      { id: "t4", description: "Types count", expectedOutput: "Types defined: 3" },
    ],
    hints: [
      "enum TileType { TILE_WALL = 0, TILE_FLOOR = 1, TILE_CORRIDOR = 2 };",
      "Print with cout << TILE_WALL (enum values convert to int automatically).",
      "struct Vec2i { int x, y; }; — just two ints bundled together.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Type-Safe Roguelike",
    type: "game_builder",
    instructions: `# Build: Type-Safe Roguelike

## Mental Model
Replace magic numbers with enums throughout the L11 refactored code. `dungeon[y][x] = 1` becomes `w.dungeon[y][x] = TILE_FLOOR`. Player position uses Vec2i. The game is identical but the code is self-documenting.

## What Breaks Without This
As you add more tile types (stairs, traps, water), magic numbers become unreadable. The enum makes every tile assignment and comparison obvious.

## Your Task
Add TileType enum, Vec2i struct, and EntityType enum to the World struct system. Replace magic numbers. Output must match.

Expected cout output:
\```
Seed: 42
Floor: 1
Rooms: 4
Enemies: 5
Tiles: wall=0 floor=1 corridor=2
\```

**Click Run** — game plays identically to L11.

## Did It Work?
Same game, better code. The output proves the enum values are correct. The dungeon renders identically because enums are just named integers.

## Beginner Trap
**Forgetting to update ALL comparison sites.** If you change `dungeon[y][x] = 1` to use TILE_FLOOR but leave `if (dungeon[y][x] == 1)` unchanged, it still works (1 == TILE_FLOOR), but defeats the purpose. Be consistent.

## Elite Insight
Dwarf Fortress uses over 200 tile types. Without enums, that would be 200 magic numbers scattered across hundreds of thousands of lines of code. Enums made Dwarf Fortress possible to maintain (barely).

## Mastery Check
Question: Should the dungeon array store TileType or int?
Answer: Keep it as int but USE TileType values. Changing the array type to TileType[][] would require casts everywhere because array indexing and arithmetic expect ints. The enum provides naming; the storage stays int.`,
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

enum TileType { TILE_WALL = 0, TILE_FLOOR = 1, TILE_CORRIDOR = 2, TILE_STAIRS = 3 };
enum EntityType { ENT_PLAYER = 0, ENT_ENEMY = 1 };
struct Vec2i { int x, y; };

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

// TODO: Replace dungeon[y][x] = 1 with dungeon[y][x] = TILE_FLOOR
void carveRoom(World& w, BSPNode node) {
    int rw = rngRange(w, 3, node.w - 2);
    int rh = rngRange(w, 3, node.h - 2);
    int rx = rngRange(w, node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(w, node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++)
        for (int x = rx; x < rx + rw; x++)
            w.dungeon[y][x] = 1; // TODO: use TILE_FLOOR
    w.rooms[w.room_count] = {rx, ry, rw, rh, rx + rw/2, ry + rh/2};
    w.room_count++;
}

// TODO: Replace dungeon comparisons with TileType enums
void carveCorridor(World& w, int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx)
        if (w.dungeon[y1][x] == 0) w.dungeon[y1][x] = 2; // TODO: use TILE_WALL and TILE_CORRIDOR
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy)
        if (w.dungeon[y][x2] == 0) w.dungeon[y][x2] = 2; // TODO: use TILE_WALL and TILE_CORRIDOR
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

void populateEnemies(World& w) {
    for (int i = 1; i < w.room_count; i++) { int count = rngRange(w,1,3); for (int j = 0; j < count; j++) { int ex = rngRange(w,w.rooms[i].x,w.rooms[i].x+w.rooms[i].w-1); int ey = rngRange(w,w.rooms[i].y,w.rooms[i].y+w.rooms[i].h-1); w.enemies[w.enemy_count++] = {ex,ey,3,true}; } }
}

int findEnemyAt(World& w, int x, int y) { for (int i = 0; i < w.enemy_count; i++) if (w.enemies[i].alive && w.enemies[i].x == x && w.enemies[i].y == y) return i; return -1; }

void generateFloor(World& w) {
    memset(w.dungeon, 0, sizeof(w.dungeon));
    w.node_count = 1; w.room_count = 0; w.enemy_count = 0;
    memset(w.nodes, 0, sizeof(w.nodes));
    w.nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(w, 0, 0);
    for (int i = 0; i < w.node_count; i++) if (isLeaf(w, i)) carveRoom(w, w.nodes[i]);
    int cc = 0; connectBSP(w, 0, cc);
    w.px = w.rooms[0].cx; w.py = w.rooms[0].cy;
    w.stairsX = w.rooms[w.room_count-1].cx; w.stairsY = w.rooms[w.room_count-1].cy;
    populateEnemies(w);
}

void handleInput(World& w) {
    if (w.gameOver) return;
    int nx = w.px, ny = w.py;
    if (IsKeyPressed(KEY_W)) ny--; if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--; if (IsKeyPressed(KEY_D)) nx++;
    if (nx == w.px && ny == w.py) return;
    if (nx == w.stairsX && ny == w.stairsY) { w.floor_num++; w.score += 50; w.rng_state = (uint32_t)(w.floor_num * 48271); generateFloor(w); return; }
    int ei = findEnemyAt(w, nx, ny);
    if (ei >= 0) { w.enemies[ei].hp--; w.playerHp--; if (w.enemies[ei].hp <= 0) { w.enemies[ei].alive = false; w.score += 10; } if (w.playerHp <= 0) w.gameOver = true; }
    else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != 0) { w.px = nx; w.py = ny; }
}

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.playerHp = 10;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Enemies: " << w.enemy_count << endl;
    cout << "Tiles: wall=" << TILE_WALL << " floor=" << TILE_FLOOR << " corridor=" << TILE_CORRIDOR << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        handleInput(w);
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < MAP_H; y++) for (int x = 0; x < MAP_W; x++) {
            if (w.dungeon[y][x] == TILE_FLOOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,DARKGRAY);
            else if (w.dungeon[y][x] == TILE_CORRIDOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,(Color){60,60,60,255});
        }
        DrawRectangle(w.stairsX*TILE_SIZE,w.stairsY*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,YELLOW);
        for (int i = 0; i < w.enemy_count; i++) if (w.enemies[i].alive) DrawRectangle(w.enemies[i].x*TILE_SIZE,w.enemies[i].y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,RED);
        DrawRectangle(w.px*TILE_SIZE,w.py*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,GREEN);
        DrawText(TextFormat("HP: %d  Floor: %d  Score: %d",w.playerHp,w.floor_num,w.score),10,SCREEN_H-25,20,GREEN);
        if (w.gameOver) DrawText("GAME OVER",SCREEN_W/2-80,SCREEN_H/2,30,RED);
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

enum TileType { TILE_WALL = 0, TILE_FLOOR = 1, TILE_CORRIDOR = 2, TILE_STAIRS = 3 };
enum EntityType { ENT_PLAYER = 0, ENT_ENEMY = 1 };
struct Vec2i { int x, y; };

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

void populateEnemies(World& w) {
    for (int i = 1; i < w.room_count; i++) { int count = rngRange(w,1,3); for (int j = 0; j < count; j++) { int ex = rngRange(w,w.rooms[i].x,w.rooms[i].x+w.rooms[i].w-1); int ey = rngRange(w,w.rooms[i].y,w.rooms[i].y+w.rooms[i].h-1); w.enemies[w.enemy_count++] = {ex,ey,3,true}; } }
}

int findEnemyAt(World& w, int x, int y) { for (int i = 0; i < w.enemy_count; i++) if (w.enemies[i].alive && w.enemies[i].x == x && w.enemies[i].y == y) return i; return -1; }

void generateFloor(World& w) {
    memset(w.dungeon, 0, sizeof(w.dungeon));
    w.node_count = 1; w.room_count = 0; w.enemy_count = 0;
    memset(w.nodes, 0, sizeof(w.nodes));
    w.nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(w, 0, 0);
    for (int i = 0; i < w.node_count; i++) if (isLeaf(w, i)) carveRoom(w, w.nodes[i]);
    int cc = 0; connectBSP(w, 0, cc);
    w.px = w.rooms[0].cx; w.py = w.rooms[0].cy;
    w.stairsX = w.rooms[w.room_count-1].cx; w.stairsY = w.rooms[w.room_count-1].cy;
    populateEnemies(w);
}

void handleInput(World& w) {
    if (w.gameOver) return;
    int nx = w.px, ny = w.py;
    if (IsKeyPressed(KEY_W)) ny--; if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--; if (IsKeyPressed(KEY_D)) nx++;
    if (nx == w.px && ny == w.py) return;
    if (nx == w.stairsX && ny == w.stairsY) { w.floor_num++; w.score += 50; w.rng_state = (uint32_t)(w.floor_num * 48271); generateFloor(w); return; }
    int ei = findEnemyAt(w, nx, ny);
    if (ei >= 0) { w.enemies[ei].hp--; w.playerHp--; if (w.enemies[ei].hp <= 0) { w.enemies[ei].alive = false; w.score += 10; } if (w.playerHp <= 0) w.gameOver = true; }
    else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) { w.px = nx; w.py = ny; }
}

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.playerHp = 10;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Enemies: " << w.enemy_count << endl;
    cout << "Tiles: wall=" << TILE_WALL << " floor=" << TILE_FLOOR << " corridor=" << TILE_CORRIDOR << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        handleInput(w);
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < MAP_H; y++) for (int x = 0; x < MAP_W; x++) {
            if (w.dungeon[y][x] == TILE_FLOOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,DARKGRAY);
            else if (w.dungeon[y][x] == TILE_CORRIDOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,(Color){60,60,60,255});
        }
        DrawRectangle(w.stairsX*TILE_SIZE,w.stairsY*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,YELLOW);
        for (int i = 0; i < w.enemy_count; i++) if (w.enemies[i].alive) DrawRectangle(w.enemies[i].x*TILE_SIZE,w.enemies[i].y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,RED);
        DrawRectangle(w.px*TILE_SIZE,w.py*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,GREEN);
        DrawText(TextFormat("HP: %d  Floor: %d  Score: %d",w.playerHp,w.floor_num,w.score),10,SCREEN_H-25,20,GREEN);
        if (w.gameOver) DrawText("GAME OVER",SCREEN_W/2-80,SCREEN_H/2,30,RED);
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
      { id: "g5", description: "Tile types", expectedOutput: "Tiles: wall=0 floor=1 corridor=2" },
    ],
    hints: [
      "Replace w.dungeon[y][x] = 1 with w.dungeon[y][x] = TILE_FLOOR in carveRoom.",
      "Replace == 0 with == TILE_WALL and = 2 with = TILE_CORRIDOR in carveCorridor.",
      "In handleInput, change != 0 to != TILE_WALL for the movement check.",
    ],
    estimatedMinutes: 20,
  },
};