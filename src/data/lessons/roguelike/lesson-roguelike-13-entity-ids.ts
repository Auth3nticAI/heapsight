import { Lesson } from "@/types/lesson";

export const lessonRoguelike13: Lesson = {
  id: "roguelike-13-entity-ids",
  title: "Entity IDs",
  description: "Give every entity a unique integer ID. References survive array removals. ID-based lookup replaces fragile index references.",
  order: 13,
  xpReward: 100,
  tier: "pro",
  concepts: ["entity IDs", "monotonic counters", "ID-based lookup", "identity vs index"],
  part1: {
    title: "Concept: Entity IDs vs Array Indices",
    type: "concept",
    instructions: `# Entity IDs

## Mental Model
Array indices are fragile references. Remove enemy at index 2, and everything at index 3+ shifts down. Any code holding "index 2" now points at the WRONG enemy. IDs are permanent. Entity #7 is always entity #7, no matter where it sits in the array.

## What Breaks Without This
Imagine a targeting system: "player is attacking enemy at index 3." Another enemy dies and gets removed from the array. Enemy at index 3 is now a DIFFERENT enemy. The player attacks the wrong target. With IDs, "player is attacking enemy #7" stays correct even if the array changes.

## The Fix: Monotonic ID Counter

\`\`\`cpp
struct Enemy { int id; int x, y, hp; bool alive; };

int nextId = 1;  // never resets, never decreases
Enemy enemies[32];
int count = 0;

enemies[count++] = {nextId++, 5, 3, 10, true};  // ID 1
enemies[count++] = {nextId++, 8, 7, 5, true};   // ID 2
// nextId is now 3 — next enemy gets ID 3
\`\`\`

## Key Concepts
- **ID \u2260 Index**: ID is an identity, index is a position. Entity #3 might be at index 0 after removals.
- **Monotonic counter**: nextId only goes up. IDs are never reused. This prevents stale references.
- **findById()**: Linear scan through array checking each entity's id field. O(n) but fine for small arrays.
- **alive flag vs removal**: Mark dead entities as `alive = false` instead of removing from array. No index shifting, IDs stay valid.

## Performance Insight
Linear scan for findById: O(n) per lookup. With 32 enemies max, that's 32 comparisons worst case — trivial. AAA engines with 10,000+ entities use hash maps, but for roguelikes, linear scan is optimal (cache-friendly, no allocation overhead).

## Memory Insight
One `int id` field per entity = 4 bytes. 32 enemies \u00d7 4 = 128 bytes total. One `int nextId` global = 4 bytes. Total cost: 132 bytes.

## Your Task
Create entities with IDs, look up by ID, mark one dead, verify the ID still resolves correctly.

Expected output:
\`\`\`
Entity 1 at (5,5)
Entity 2 at (10,3)
Entity 3 at (15,7)
Killed entity 2
Found ID 2 at index: 1
Alive: no
Entities: 3
NextID: 4
\`\`\`

## Beginner Trap
**Reusing IDs.** If enemy #2 dies and you give the next enemy ID 2, any code referencing "entity #2" now points at the wrong entity. IDs must be monotonic — always increment, never recycle.

## Elite Insight
Entity Component Systems (ECS) in Rust use generational indices: ID + generation counter. If entity #7 dies and slot 7 is reused, the generation increments. Old references with generation 0 fail to match generation 1. This catches stale references at runtime. C++ roguelikes use simpler monotonic IDs because entity counts are small.

## Systems Thinking Connection
L11 organized state. L12 added type safety. L13 adds identity safety. Each refactoring removes a class of bugs: L11 prevents global collisions, L12 prevents magic number errors, L13 prevents stale references.

## Skill Reinforcement
The id field is an integer — same type system from L12. The findById pattern is the same linear scan as findEnemyAt, just matching a different field. New concept, familiar mechanics.

## Mastery Check
Question: Why not just use the array index as the ID?
Answer: Because indices change when elements are added or removed. If you swap-remove element 2 (swap with last, decrement count), element 2 is now what was previously the last element. The index "2" now refers to a completely different entity. An ID field stays with the entity no matter where it moves in memory.`,
    starterCode: `#include <iostream>
using namespace std;

struct Entity { int id; int x, y, hp; bool alive; };

// TODO: Write findById - scan array, return index where id matches, or -1

int main() {
    Entity entities[10];
    int count = 0;
    int nextId = 1;

    // TODO: Create 3 entities with IDs 1,2,3 at positions (5,5),(10,3),(15,7)
    // Use: entities[count++] = {nextId++, x, y, hp, true};

    // TODO: Print each entity: "Entity {id} at ({x},{y})"

    // TODO: Kill entity 2 (set alive = false), print "Killed entity 2"

    // TODO: Find entity with ID 2, print index and alive status

    cout << "Entities: " << count << endl;
    cout << "NextID: " << nextId << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Entity { int id; int x, y, hp; bool alive; };

int findById(Entity* entities, int count, int id) {
    for (int i = 0; i < count; i++)
        if (entities[i].id == id) return i;
    return -1;
}

int main() {
    Entity entities[10];
    int count = 0;
    int nextId = 1;

    entities[count++] = {nextId++, 5, 5, 10, true};
    entities[count++] = {nextId++, 10, 3, 5, true};
    entities[count++] = {nextId++, 15, 7, 3, true};

    for (int i = 0; i < count; i++)
        cout << "Entity " << entities[i].id << " at (" << entities[i].x << "," << entities[i].y << ")" << endl;

    entities[1].alive = false;
    cout << "Killed entity 2" << endl;

    int idx = findById(entities, count, 2);
    cout << "Found ID 2 at index: " << idx << endl;
    cout << "Alive: " << (entities[idx].alive ? "yes" : "no") << endl;

    cout << "Entities: " << count << endl;
    cout << "NextID: " << nextId << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Entity 1", expectedOutput: "Entity 1 at (5,5)" },
      { id: "t2", description: "Entity 3", expectedOutput: "Entity 3 at (15,7)" },
      { id: "t3", description: "Kill entity", expectedOutput: "Killed entity 2" },
      { id: "t4", description: "Find by ID", expectedOutput: "Found ID 2 at index: 1" },
      { id: "t5", description: "Alive status", expectedOutput: "Alive: no" },
      { id: "t6", description: "NextID counter", expectedOutput: "NextID: 4" },
    ],
    hints: [
      "findById loops through the array checking entities[i].id == id.",
      "Create entities with: entities[count++] = {nextId++, x, y, hp, true};",
      "Use a ternary for alive status: entities[idx].alive ? \"yes\" : \"no\"",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: ID-Tracked Roguelike",
    type: "game_builder",
    instructions: `# Build: ID-Tracked Roguelike

## Mental Model
Every enemy gets a unique integer ID when spawned. The ID never changes, never resets, never gets reused. You can find any enemy by ID regardless of where it sits in the array. Combat, targeting, and death tracking all use IDs instead of fragile array indices.

## What Breaks Without This
When an enemy dies in bump combat, marking it `alive = false` works for now. But later lessons add targeting, status effects, and loot drops. All of those need to reference specific enemies. Without IDs, removing an enemy corrupts every reference.

## Your Task
Add `int id` to Enemy, `int nextId` to World. Assign IDs in populateEnemies. Add findEnemyById. Print NextID.

Expected cout output:
\`\`\`
Seed: 42
Floor: 1
Rooms: 4
Enemies: 5
NextID: 6
\`\`\`

**Click Run** to see the game with ID-tracked enemies.

## Did It Work?
Game plays identically to L12. The visual change is subtle — the HUD is the same. But under the hood, every enemy has a unique ID. The cout output proves it: 5 enemies created, next available ID is 6.

## Beginner Trap
**Resetting nextId in generateFloor().** When the player descends stairs, generateFloor clears enemies and generates new ones. If you reset nextId to 1, the new enemies get the same IDs as dead enemies from the previous floor. Keep nextId monotonic across the entire game session.

## Elite Insight
Dwarf Fortress tracks hundreds of thousands of entities across decades of in-game time. Each entity has a unique historical ID that references relationships, kills, artifacts, and memories. The ID counter never resets. Roguelikes with small entity counts don't need hash maps — linear scan by ID is cache-friendly and fast.

## Mastery Check
Question: Should the player also get an ID?
Answer: Yes, eventually. In L14 (SoA), the player will become just another entity in the arrays with its own ID. For now, keeping the player as separate px/py fields is fine — it's simpler and the refactoring comes next lesson.`,
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
// TODO: Add int id as the FIRST field of Enemy
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
    // TODO: Add int nextId;
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

// TODO: Add findEnemyById(World& w, int id) function

void populateEnemies(World& w) {
    for (int i = 1; i < w.room_count; i++) { int count = rngRange(w,1,3); for (int j = 0; j < count; j++) { int ex = rngRange(w,w.rooms[i].x,w.rooms[i].x+w.rooms[i].w-1); int ey = rngRange(w,w.rooms[i].y,w.rooms[i].y+w.rooms[i].h-1); w.enemies[w.enemy_count++] = {ex,ey,3,true}; } }
    // TODO: Change enemy creation to include w.nextId++ as first field
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
    // TODO: Initialize w.nextId = 1;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Enemies: " << w.enemy_count << endl;
    // TODO: Print "NextID: " << w.nextId

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
struct Enemy { int id, x, y, hp; bool alive; };

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
    int nextId;
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

int findEnemyById(World& w, int id) {
    for (int i = 0; i < w.enemy_count; i++)
        if (w.enemies[i].id == id) return i;
    return -1;
}

void populateEnemies(World& w) {
    for (int i = 1; i < w.room_count; i++) { int count = rngRange(w,1,3); for (int j = 0; j < count; j++) { int ex = rngRange(w,w.rooms[i].x,w.rooms[i].x+w.rooms[i].w-1); int ey = rngRange(w,w.rooms[i].y,w.rooms[i].y+w.rooms[i].h-1); w.enemies[w.enemy_count++] = {w.nextId++,ex,ey,3,true}; } }
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
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.playerHp = 10; w.nextId = 1;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Enemies: " << w.enemy_count << endl;
    cout << "NextID: " << w.nextId << endl;

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
      { id: "g5", description: "Next ID counter", expectedOutput: "NextID: 6" },
    ],
    hints: [
      "Add int id as the FIRST field: struct Enemy { int id, x, y, hp; bool alive; };",
      "In populateEnemies, change {ex,ey,3,true} to {w.nextId++,ex,ey,3,true}.",
      "Initialize w.nextId = 1 in main() before generateFloor(w).",
    ],
    estimatedMinutes: 20,
  },
};