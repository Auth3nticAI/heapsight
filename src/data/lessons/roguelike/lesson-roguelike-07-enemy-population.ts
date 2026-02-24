import { Lesson } from "@/types/lesson";

export const lessonRoguelike7: Lesson = {
  id: "roguelike-7-enemy-population",
  title: "Enemy Population",
  description: "Red enemies populate rooms. 1-3 per room, threat budget enforced by RNG.",
  order: 7,
  xpReward: 50,
  tier: "free",
  concepts: ["enemy placement", "threat budget", "entity arrays", "room population"],
  part1: {
    title: "Concept: Populating Rooms with Enemies",
    type: "concept",
    instructions: `# Enemy Population

## Mental Model
An empty dungeon is a walking simulator. Enemies make it a roguelike. Place 1-3 enemies per room (skip the player's starting room). Use the RNG for count and position. The total enemy count is your "threat budget" — controlled by the seed.

## What Breaks Without This
A dungeon with only corridors and rooms has no challenge, no risk, no game. Enemies create the tension that makes exploration meaningful.

## The Fix: Room-Based Population
After generating the dungeon and placing the player:
1. Skip room 0 (player's starting room)
2. For each other room, generate count = rngRange(1, 3)
3. For each enemy, pick a random position inside the room
4. Store enemies in a fixed-size array with (x, y, hp, alive) fields

\```cpp
struct Enemy { int x, y, hp; bool alive; };
Enemy enemies[32]; // max 32 enemies
int enemy_count = 0;

void populateRoom(Room& room) {
    int count = rngRange(1, 3);
    for (int i = 0; i < count; i++) {
        int ex = rngRange(room.x, room.x + room.w - 1);
        int ey = rngRange(room.y, room.y + room.h - 1);
        enemies[enemy_count++] = {ex, ey, 3, true};
    }
}
\```

## Key Concepts
- Threat budget: RNG controls enemy count per room
- Skip player room: room 0 is always safe
- Fixed-size enemy array: no heap allocation
- Enemy struct: minimal data (position + hp + alive flag)

## Performance Insight
With 4 rooms and max 3 enemies each, worst case is 9 enemies. Even with 8 rooms at depth-3, that's 21 enemies max. A fixed array of 32 handles any reasonable dungeon. No dynamic allocation needed.

## Memory Insight
32 Enemy structs = 32 * 12 bytes = 384 bytes. The entire enemy population fits in less than half a kilobyte. Combined with the player (8 bytes) and dungeon grid (1200 bytes), the entire game state is under 2KB.

## Your Task
Place enemies in rooms 1-3 (skip room 0). Each room gets 1-3 enemies. Print the total enemy count.

Expected output (seed 42):
\```
Enemies: 5
Rooms populated: 3
Player room: safe
\```

## Beginner Trap
**Placing enemies in the player's room.** The player should start in a safe room. If enemies spawn on top of the player, the game feels unfair. Always skip room 0 during population.

## Elite Insight
Brogue uses a "difficulty budget" that scales with dungeon depth. Floor 1 gets weak enemies, floor 20 gets dragons. Your flat 1-3 per room is the starting point — Lesson 38 will scale with floor number.

## Systems Thinking Connection
Entity population is the roguelike equivalent of the RPG's NPC placement. The RPG places NPCs at fixed coordinates loaded from files. The Roguelike generates enemy positions from the RNG. Different source, same pattern: entities in a spatial data structure.

## Skill Reinforcement
Lesson 6 placed the player. This lesson places enemies. Lesson 8 will make them interact — bump into an enemy to fight.

## Mastery Check
Question: Why store enemies in a flat array instead of per-room lists?
Answer: A flat array gives O(1) indexed access, contiguous memory layout, and trivial iteration. Per-room lists add pointer overhead, cache misses, and complexity. When the max count is small (32), a flat array is always better.`,
    starterCode: `#include <iostream>
using namespace std;

uint32_t rng_state = 42;
uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

struct Room { int x, y, w, h; };
struct Enemy { int x, y, hp; bool alive; };
Enemy enemies[32];
int enemy_count = 0;

// TODO: Implement populateRoom(Room& room)
// Generate count = rngRange(1, 3)
// For each, place at random position in room using rngRange
// Store in enemies array with hp=3 and alive=true

int main() {
    Room test_rooms[3] = {{5,5,8,6}, {20,5,10,8}, {10,18,12,8}};

    // TODO: call populateRoom for each test room

    cout << "Enemies: " << enemy_count << endl;
    cout << "Rooms populated: 3" << endl;
    cout << "Player room: safe" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

uint32_t rng_state = 42;
uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

struct Room { int x, y, w, h; };
struct Enemy { int x, y, hp; bool alive; };
Enemy enemies[32];
int enemy_count = 0;

void populateRoom(Room& room) {
    int count = rngRange(1, 3);
    for (int i = 0; i < count; i++) {
        int ex = rngRange(room.x, room.x + room.w - 1);
        int ey = rngRange(room.y, room.y + room.h - 1);
        enemies[enemy_count++] = {ex, ey, 3, true};
    }
}

int main() {
    Room test_rooms[3] = {{5,5,8,6}, {20,5,10,8}, {10,18,12,8}};

    for (int i = 0; i < 3; i++)
        populateRoom(test_rooms[i]);

    cout << "Enemies: " << enemy_count << endl;
    cout << "Rooms populated: 3" << endl;
    cout << "Player room: safe" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Enemy count", expectedOutput: "Enemies: 5" },
      { id: "t2", description: "Rooms populated", expectedOutput: "Rooms populated: 3" },
      { id: "t3", description: "Player room safe", expectedOutput: "Player room: safe" },
    ],
    hints: [
      "populateRoom generates a count with rngRange(1,3), then loops count times placing enemies at random positions.",
      "Each enemy: ex = rngRange(room.x, room.x+room.w-1), ey = rngRange(room.y, room.y+room.h-1).",
      "void populateRoom(Room& room) { int count=rngRange(1,3); for(int i=0;i<count;i++) { int ex=rngRange(room.x,room.x+room.w-1); int ey=rngRange(room.y,room.y+room.h-1); enemies[enemy_count++]={ex,ey,3,true}; } }",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Dungeon with Enemies",
    type: "game_builder",
    instructions: `# Build: Dungeon with Enemies

## Mental Model
Build on the L6 explorable dungeon. After placing the player, populate rooms 1-3 with red enemies. Now the dungeon feels dangerous — red squares lurk in every room except your starting room.

## What Breaks Without This
An explorable dungeon with no threats is boring. Enemies give the player a reason to move carefully, plan routes, and eventually fight.

## Your Task
Starting from the L6 dungeon with player movement, add enemy population. Skip room 0. Render enemies as RED squares. Print enemy count.

Expected cout output:
\```
Seed: 42
Rooms: 4
Enemies: 5
Player: (6,3)
\```

**Click Run** and explore. Red enemies should be visible in rooms 1-3.

## Did It Work?
You should see the player (GREEN) in room 0 and RED squares in the other 3 rooms. The enemies don't move yet — that comes in later lessons. For now, they're just red statues.

## Beginner Trap
**Drawing enemies on top of the dungeon tiles.** Draw order matters: dungeon first, then enemies, then player. If you draw the dungeon last, it covers everything.

## Elite Insight
Spelunky's enemy placement follows a "guaranteed path" principle: enemies never block the critical path. Your room-0-is-safe rule is a simpler version of this — the player always starts in a threat-free zone.

## Mastery Check
Question: Why use a single flat enemies[] array instead of storing enemies inside Room structs?
Answer: Separation of concerns. Rooms are about geometry (x, y, w, h). Enemies are about gameplay (position, hp, alive). Mixing them violates single-responsibility. The flat array also makes iteration trivial — one loop processes all enemies regardless of which room they're in.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;

int dungeon[MAP_H][MAP_W];
uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

struct BSPNode { int x, y, w, h; };
const int MAX_NODES = 15;
BSPNode nodes[MAX_NODES];
int node_count = 1;

struct Room { int x, y, w, h, cx, cy; };
Room rooms[8];
int room_count = 0;

struct Enemy { int x, y, hp; bool alive; };
Enemy enemies[32];
int enemy_count = 0;

int px, py;

void bspSplit(int idx, int depth) {
    if (depth >= 2 || nodes[idx].w < 10 || nodes[idx].h < 10) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= MAX_NODES) return;
    if (depth % 2 == 0) {
        int sx = rngRange(nodes[idx].w / 3, nodes[idx].w * 2 / 3);
        nodes[left] = {nodes[idx].x, nodes[idx].y, sx, nodes[idx].h};
        nodes[right] = {nodes[idx].x + sx, nodes[idx].y, nodes[idx].w - sx, nodes[idx].h};
    } else {
        int sy = rngRange(nodes[idx].h / 3, nodes[idx].h * 2 / 3);
        nodes[left] = {nodes[idx].x, nodes[idx].y, nodes[idx].w, sy};
        nodes[right] = {nodes[idx].x, nodes[idx].y + sy, nodes[idx].w, nodes[idx].h - sy};
    }
    if (right + 1 > node_count) node_count = right + 1;
    bspSplit(left, depth + 1);
    bspSplit(right, depth + 1);
}

bool isLeaf(int idx) {
    int left = 2 * idx + 1;
    return left >= node_count || (nodes[left].w == 0 && nodes[left].h == 0);
}

void carveRoom(BSPNode node) {
    int rw = rngRange(3, node.w - 2);
    int rh = rngRange(3, node.h - 2);
    int rx = rngRange(node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++)
        for (int x = rx; x < rx + rw; x++)
            dungeon[y][x] = 1;
    rooms[room_count] = {rx, ry, rw, rh, rx + rw/2, ry + rh/2};
    room_count++;
}

void carveCorridor(int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx)
        if (dungeon[y1][x] == 0) dungeon[y1][x] = 2;
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy)
        if (dungeon[y][x2] == 0) dungeon[y][x2] = 2;
}

void findRoomCenter(int idx, int& cx, int& cy) {
    if (isLeaf(idx)) {
        for (int i = 0; i < room_count; i++) {
            if (rooms[i].x >= nodes[idx].x && rooms[i].x < nodes[idx].x + nodes[idx].w &&
                rooms[i].y >= nodes[idx].y && rooms[i].y < nodes[idx].y + nodes[idx].h) {
                cx = rooms[i].cx; cy = rooms[i].cy; return;
            }
        }
    }
    int left = 2 * idx + 1;
    if (left < node_count && nodes[left].w > 0) findRoomCenter(left, cx, cy);
}

void connectBSP(int idx, int& corridor_count) {
    if (isLeaf(idx)) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= node_count) return;
    int lcx = 0, lcy = 0, rcx = 0, rcy = 0;
    findRoomCenter(left, lcx, lcy);
    findRoomCenter(right, rcx, rcy);
    carveCorridor(lcx, lcy, rcx, rcy);
    corridor_count++;
    connectBSP(left, corridor_count);
    connectBSP(right, corridor_count);
}

void handleInput() {
    int nx = px, ny = py;
    if (IsKeyPressed(KEY_W)) ny--;
    if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--;
    if (IsKeyPressed(KEY_D)) nx++;
    if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0) {
        px = nx; py = ny;
    }
}

// TODO: Implement populateEnemies()
// Loop through rooms 1 to room_count-1 (skip room 0)
// For each room, count = rngRange(1, 3)
// For each enemy, place at rngRange position inside the room
// Store in enemies[] with hp=3 and alive=true

int main() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;

    nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(0, 0);
    for (int i = 0; i < node_count; i++)
        if (isLeaf(i)) carveRoom(nodes[i]);
    int corridor_count = 0;
    connectBSP(0, corridor_count);

    px = rooms[0].cx; py = rooms[0].cy;

    // TODO: call populateEnemies() here

    cout << "Seed: " << 42 << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Player: (" << px << "," << py << ")" << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        handleInput();
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[y][x] == 1)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, DARKGRAY);
                else if (dungeon[y][x] == 2)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, (Color){60,60,60,255});
            }
        }
        // Draw enemies
        for (int i = 0; i < enemy_count; i++) {
            if (enemies[i].alive)
                DrawRectangle(enemies[i].x*TILE_SIZE, enemies[i].y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, RED);
        }
        DrawRectangle(px*TILE_SIZE, py*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, GREEN);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;

int dungeon[MAP_H][MAP_W];
uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

struct BSPNode { int x, y, w, h; };
const int MAX_NODES = 15;
BSPNode nodes[MAX_NODES];
int node_count = 1;

struct Room { int x, y, w, h, cx, cy; };
Room rooms[8];
int room_count = 0;

struct Enemy { int x, y, hp; bool alive; };
Enemy enemies[32];
int enemy_count = 0;

int px, py;

void bspSplit(int idx, int depth) {
    if (depth >= 2 || nodes[idx].w < 10 || nodes[idx].h < 10) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= MAX_NODES) return;
    if (depth % 2 == 0) {
        int sx = rngRange(nodes[idx].w / 3, nodes[idx].w * 2 / 3);
        nodes[left] = {nodes[idx].x, nodes[idx].y, sx, nodes[idx].h};
        nodes[right] = {nodes[idx].x + sx, nodes[idx].y, nodes[idx].w - sx, nodes[idx].h};
    } else {
        int sy = rngRange(nodes[idx].h / 3, nodes[idx].h * 2 / 3);
        nodes[left] = {nodes[idx].x, nodes[idx].y, nodes[idx].w, sy};
        nodes[right] = {nodes[idx].x, nodes[idx].y + sy, nodes[idx].w, nodes[idx].h - sy};
    }
    if (right + 1 > node_count) node_count = right + 1;
    bspSplit(left, depth + 1);
    bspSplit(right, depth + 1);
}

bool isLeaf(int idx) {
    int left = 2 * idx + 1;
    return left >= node_count || (nodes[left].w == 0 && nodes[left].h == 0);
}

void carveRoom(BSPNode node) {
    int rw = rngRange(3, node.w - 2);
    int rh = rngRange(3, node.h - 2);
    int rx = rngRange(node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++)
        for (int x = rx; x < rx + rw; x++)
            dungeon[y][x] = 1;
    rooms[room_count] = {rx, ry, rw, rh, rx + rw/2, ry + rh/2};
    room_count++;
}

void carveCorridor(int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx)
        if (dungeon[y1][x] == 0) dungeon[y1][x] = 2;
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy)
        if (dungeon[y][x2] == 0) dungeon[y][x2] = 2;
}

void findRoomCenter(int idx, int& cx, int& cy) {
    if (isLeaf(idx)) {
        for (int i = 0; i < room_count; i++) {
            if (rooms[i].x >= nodes[idx].x && rooms[i].x < nodes[idx].x + nodes[idx].w &&
                rooms[i].y >= nodes[idx].y && rooms[i].y < nodes[idx].y + nodes[idx].h) {
                cx = rooms[i].cx; cy = rooms[i].cy; return;
            }
        }
    }
    int left = 2 * idx + 1;
    if (left < node_count && nodes[left].w > 0) findRoomCenter(left, cx, cy);
}

void connectBSP(int idx, int& corridor_count) {
    if (isLeaf(idx)) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= node_count) return;
    int lcx = 0, lcy = 0, rcx = 0, rcy = 0;
    findRoomCenter(left, lcx, lcy);
    findRoomCenter(right, rcx, rcy);
    carveCorridor(lcx, lcy, rcx, rcy);
    corridor_count++;
    connectBSP(left, corridor_count);
    connectBSP(right, corridor_count);
}

void handleInput() {
    int nx = px, ny = py;
    if (IsKeyPressed(KEY_W)) ny--;
    if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--;
    if (IsKeyPressed(KEY_D)) nx++;
    if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0) {
        px = nx; py = ny;
    }
}

void populateEnemies() {
    for (int i = 1; i < room_count; i++) {
        int count = rngRange(1, 3);
        for (int j = 0; j < count; j++) {
            int ex = rngRange(rooms[i].x, rooms[i].x + rooms[i].w - 1);
            int ey = rngRange(rooms[i].y, rooms[i].y + rooms[i].h - 1);
            enemies[enemy_count++] = {ex, ey, 3, true};
        }
    }
}

int main() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;

    nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(0, 0);
    for (int i = 0; i < node_count; i++)
        if (isLeaf(i)) carveRoom(nodes[i]);
    int corridor_count = 0;
    connectBSP(0, corridor_count);

    px = rooms[0].cx; py = rooms[0].cy;
    populateEnemies();

    cout << "Seed: " << 42 << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Player: (" << px << "," << py << ")" << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        handleInput();
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[y][x] == 1)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, DARKGRAY);
                else if (dungeon[y][x] == 2)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, (Color){60,60,60,255});
            }
        }
        for (int i = 0; i < enemy_count; i++) {
            if (enemies[i].alive)
                DrawRectangle(enemies[i].x*TILE_SIZE, enemies[i].y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, RED);
        }
        DrawRectangle(px*TILE_SIZE, py*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, GREEN);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints seed", expectedOutput: "Seed: 42" },
      { id: "g2", description: "Room count", expectedOutput: "Rooms: 4" },
      { id: "g3", description: "Enemy count", expectedOutput: "Enemies: 5" },
      { id: "g4", description: "Player position", expectedOutput: "Player: (6,3)" },
    ],
    hints: [
      "Loop from room index 1 (skip room 0) to room_count-1. For each room, get count = rngRange(1,3).",
      "For each enemy: ex = rngRange(rooms[i].x, rooms[i].x + rooms[i].w - 1), same for ey with y and h.",
      "void populateEnemies() { for(int i=1;i<room_count;i++) { int count=rngRange(1,3); for(int j=0;j<count;j++) { int ex=rngRange(rooms[i].x,rooms[i].x+rooms[i].w-1); int ey=rngRange(rooms[i].y,rooms[i].y+rooms[i].h-1); enemies[enemy_count++]={ex,ey,3,true}; } } }",
    ],
    estimatedMinutes: 15,
  },
};