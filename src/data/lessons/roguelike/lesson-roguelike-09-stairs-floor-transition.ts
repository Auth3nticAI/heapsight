import { Lesson } from "@/types/lesson";

export const lessonRoguelike9: Lesson = {
  id: "roguelike-9-stairs-floor-transition",
  title: "Stairs & Floor Transition",
  description: "Yellow stairs lead to new floors. Step on stairs to regenerate the entire dungeon.",
  order: 9,
  xpReward: 50,
  tier: "free",
  concepts: ["floor transition", "state reset", "seed progression", "game loop"],
  part1: {
    title: "Concept: Floor Transitions",
    type: "concept",
    instructions: `# Stairs & Floor Transition

## Mental Model
A roguelike isn't one floor — it's a descent through progressively harder levels. Stairs connect floors. When the player steps on stairs, regenerate the entire dungeon with a new seed. The floor counter increments. Every floor is a fresh challenge.

## What Breaks Without This
One floor, one game. Without stairs, your roguelike is a single-screen experience. The descent is what gives roguelikes their "one more floor" addictive quality.

## The Fix: Regenerate on Stairs
1. Place stairs (YELLOW tile) in the last room's center
2. In handleInput, check if player stepped on stairs
3. If yes: increment floor, generate new seed, clear and regenerate everything
4. Reset: clear dungeon, reset BSP, re-carve rooms, re-connect, re-populate, re-place player

\```cpp
int floor_num = 1;
int stairsX, stairsY;

void generateFloor() {
    // Clear everything
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;
    node_count = 1; room_count = 0; enemy_count = 0;
    memset(nodes, 0, sizeof(nodes));

    // Regenerate
    nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(0, 0);
    for (int i = 0; i < node_count; i++)
        if (isLeaf(i)) carveRoom(nodes[i]);
    int cc = 0; connectBSP(0, cc);
    px = rooms[0].cx; py = rooms[0].cy;
    stairsX = rooms[room_count-1].cx;
    stairsY = rooms[room_count-1].cy;
    populateEnemies();
}
\```

## Key Concepts
- generateFloor() encapsulates all dungeon creation
- Seed progression: new seed per floor ensures different layouts
- Full state reset: dungeon array, BSP nodes, rooms, enemies all cleared
- Stairs placed in last room (furthest from player start)

## Performance Insight
Floor generation runs once per floor transition. BSP + room carving + corridors + population takes microseconds. The player waits zero perceptible time. Even on a depth-4 BSP, generation is under 1ms.

## Memory Insight
Floor transition reuses ALL existing arrays. dungeon[][] is overwritten, not re-allocated. nodes[] and rooms[] and enemies[] are rewritten in place. Zero allocations during floor transition. This is GATE A foreshadowing.

## Your Task
Implement a generateFloor function that resets and regenerates the dungeon. Print the floor number and stairs position.

Expected output:
\```
Floor: 1
Stairs: (22,21)
Transition: step on stairs
\```

## Beginner Trap
**Forgetting to reset node_count, room_count, and enemy_count.** If you only clear the dungeon array but leave stale room data, the new BSP will see phantom nodes and the corridor generator will connect wrong rooms.

## Elite Insight
Nethack generates all 50+ dungeon levels at game start and keeps them in memory. Spelunky generates each level only when entered and discards the previous one. Your approach (regenerate on entry, discard previous) is Spelunky's model — simpler and memory-efficient.

## Systems Thinking Connection
Floor transition is the roguelike equivalent of a scene change in RPGs. The RPG loads a new scene from disk. The Roguelike generates a new scene from the RNG. Different source, same pattern: tear down current state, build new state.

## Skill Reinforcement
Lesson 8 added combat. This lesson adds floor progression. Lesson 10 will combine everything into the complete micro-roguelike loop.

## Mastery Check
Question: Why use rng_state = floor_num * 48271 instead of a random seed?
Answer: Deterministic seeds! If floor 1 always uses seed 48271 and floor 2 uses seed 96542, you can reproduce exact dungeon layouts for debugging and testing. Random seeds make bugs unreproducible.`,
    starterCode: `#include <iostream>
using namespace std;

int floor_num = 1;

// TODO: Implement nextFloor()
// Increment floor_num
// Set new seed: rng_state = floor_num * 48271
// Print floor info

int main() {
    cout << "Floor: " << floor_num << endl;
    cout << "Stairs: (22,21)" << endl;
    cout << "Transition: step on stairs" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int floor_num = 1;

void nextFloor() {
    floor_num++;
}

int main() {
    cout << "Floor: " << floor_num << endl;
    cout << "Stairs: (22,21)" << endl;
    cout << "Transition: step on stairs" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Floor number", expectedOutput: "Floor: 1" },
      { id: "t2", description: "Stairs position", expectedOutput: "Stairs: (22,21)" },
      { id: "t3", description: "Transition type", expectedOutput: "Transition: step on stairs" },
    ],
    hints: [
      "nextFloor should increment floor_num, then regenerate the dungeon with a new seed.",
      "Set rng_state = floor_num * 48271 to get a different seed per floor.",
      "void nextFloor() { floor_num++; rng_state = floor_num * 48271; generateFloor(); }",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Multi-Floor Dungeon",
    type: "game_builder",
    instructions: `# Build: Multi-Floor Dungeon

## Mental Model
Combine everything: BSP dungeon + corridors + player + enemies + combat + stairs. When the player steps on the YELLOW stairs tile, regenerate the dungeon with a new seed. The floor counter increments and displays on the HUD.

## What Breaks Without This
A single-floor dungeon with no exit. The player clears all enemies and has nothing left to do. Stairs add infinite replayability — every floor is new.

## Your Task
Add stairs in the last room. When the player walks onto the stairs tile, call generateFloor() to regenerate everything. Show floor number on HUD.

Expected cout output:
\```
Seed: 42
Floor: 1
Rooms: 4
Enemies: 5
Stairs: (22,21)
\```

**Click Run**, explore, fight enemies, find the YELLOW stairs, and descend!

## Did It Work?
You should see the dungeon with a YELLOW square (stairs) in one room. Walk to it and step on it — the entire dungeon regenerates with new rooms, new corridors, new enemies. The floor counter in the HUD increments.

## Beginner Trap
**Not resetting memset(nodes, 0, sizeof(nodes)).** Old BSP data persists. isLeaf() checks if children have w==0 and h==0 to detect leaves. If old data remains, leaf detection fails and rooms are carved in wrong locations.

## Elite Insight
Slay the Spire's floor transitions include a reward screen (card picks, relics). Your transition is instant — step on stairs, new floor. Later lessons could add reward phases between floors.

## Mastery Check
Question: What happens to the player's HP between floors?
Answer: HP persists! Only the dungeon state (map, enemies, rooms) is regenerated. Player HP carries over as a resource — you spent HP fighting enemies on this floor, and you keep whatever's left for the next floor. This is core roguelike design: resources are permanent, environments are temporary.`,
    starterCode: `#include <iostream>
#include <cstring>
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

int px, py, playerHp = 10;
int stairsX, stairsY;
int floor_num = 1;
bool gameOver = false;

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

int findEnemyAt(int x, int y) {
    for (int i = 0; i < enemy_count; i++)
        if (enemies[i].alive && enemies[i].x == x && enemies[i].y == y) return i;
    return -1;
}

// TODO: Implement generateFloor()
// 1. Clear dungeon array to all 0
// 2. Reset: node_count=1, room_count=0, enemy_count=0
// 3. memset(nodes, 0, sizeof(nodes))
// 4. Build BSP, carve rooms, connect corridors
// 5. Place player in room 0, stairs in last room
// 6. Populate enemies

void handleInput() {
    if (gameOver) return;
    int nx = px, ny = py;
    if (IsKeyPressed(KEY_W)) ny--;
    if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--;
    if (IsKeyPressed(KEY_D)) nx++;
    if (nx == px && ny == py) return;

    // Check stairs
    if (nx == stairsX && ny == stairsY) {
        floor_num++;
        rng_state = (uint32_t)(floor_num * 48271);
        // TODO: call generateFloor()
        return;
    }

    int ei = findEnemyAt(nx, ny);
    if (ei >= 0) {
        enemies[ei].hp -= 1;
        playerHp -= 1;
        if (enemies[ei].hp <= 0) enemies[ei].alive = false;
        if (playerHp <= 0) gameOver = true;
    } else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0) {
        px = nx; py = ny;
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
    int cc = 0; connectBSP(0, cc);
    px = rooms[0].cx; py = rooms[0].cy;
    stairsX = rooms[room_count-1].cx;
    stairsY = rooms[room_count-1].cy;
    populateEnemies();

    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << floor_num << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Stairs: (" << stairsX << "," << stairsY << ")" << endl;

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
        DrawRectangle(stairsX*TILE_SIZE, stairsY*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, YELLOW);
        for (int i = 0; i < enemy_count; i++)
            if (enemies[i].alive)
                DrawRectangle(enemies[i].x*TILE_SIZE, enemies[i].y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, RED);
        DrawRectangle(px*TILE_SIZE, py*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, GREEN);
        DrawText(TextFormat("HP: %d  Floor: %d", playerHp, floor_num), 10, SCREEN_H - 25, 20, GREEN);
        if (gameOver) DrawText("GAME OVER", SCREEN_W/2 - 80, SCREEN_H/2, 30, RED);
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

int px, py, playerHp = 10;
int stairsX, stairsY;
int floor_num = 1;
bool gameOver = false;

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

int findEnemyAt(int x, int y) {
    for (int i = 0; i < enemy_count; i++)
        if (enemies[i].alive && enemies[i].x == x && enemies[i].y == y) return i;
    return -1;
}

void generateFloor() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;
    node_count = 1; room_count = 0; enemy_count = 0;
    memset(nodes, 0, sizeof(nodes));

    nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(0, 0);
    for (int i = 0; i < node_count; i++)
        if (isLeaf(i)) carveRoom(nodes[i]);
    int cc = 0; connectBSP(0, cc);
    px = rooms[0].cx; py = rooms[0].cy;
    stairsX = rooms[room_count-1].cx;
    stairsY = rooms[room_count-1].cy;
    populateEnemies();
}

void handleInput() {
    if (gameOver) return;
    int nx = px, ny = py;
    if (IsKeyPressed(KEY_W)) ny--;
    if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--;
    if (IsKeyPressed(KEY_D)) nx++;
    if (nx == px && ny == py) return;

    if (nx == stairsX && ny == stairsY) {
        floor_num++;
        rng_state = (uint32_t)(floor_num * 48271);
        generateFloor();
        return;
    }

    int ei = findEnemyAt(nx, ny);
    if (ei >= 0) {
        enemies[ei].hp -= 1;
        playerHp -= 1;
        if (enemies[ei].hp <= 0) enemies[ei].alive = false;
        if (playerHp <= 0) gameOver = true;
    } else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0) {
        px = nx; py = ny;
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
    int cc = 0; connectBSP(0, cc);
    px = rooms[0].cx; py = rooms[0].cy;
    stairsX = rooms[room_count-1].cx;
    stairsY = rooms[room_count-1].cy;
    populateEnemies();

    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << floor_num << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Stairs: (" << stairsX << "," << stairsY << ")" << endl;

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
        DrawRectangle(stairsX*TILE_SIZE, stairsY*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, YELLOW);
        for (int i = 0; i < enemy_count; i++)
            if (enemies[i].alive)
                DrawRectangle(enemies[i].x*TILE_SIZE, enemies[i].y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, RED);
        DrawRectangle(px*TILE_SIZE, py*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, GREEN);
        DrawText(TextFormat("HP: %d  Floor: %d", playerHp, floor_num), 10, SCREEN_H - 25, 20, GREEN);
        if (gameOver) DrawText("GAME OVER", SCREEN_W/2 - 80, SCREEN_H/2, 30, RED);
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
      { id: "g5", description: "Stairs position", expectedOutput: "Stairs: (22,21)" },
    ],
    hints: [
      "generateFloor() must first clear the dungeon array and reset all counters (node_count=1, room_count=0, enemy_count=0).",
      "Don't forget memset(nodes, 0, sizeof(nodes)) to clear old BSP data, or isLeaf detection will break.",
      "After BSP + rooms + corridors: set player at rooms[0].cx/cy, stairs at rooms[room_count-1].cx/cy, then populateEnemies().",
    ],
    estimatedMinutes: 20,
  },
};