import { Lesson } from "@/types/lesson";

export const lessonRoguelike10: Lesson = {
  id: "roguelike-10-milestone-micro-roguelike",
  title: "Milestone: Micro Roguelike",
  description: "Complete gameplay loop: explore BSP dungeons, fight enemies, descend stairs. Your first roguelike.",
  order: 10,
  xpReward: 300,
  tier: "free",
  concepts: ["game loop", "state management", "procedural generation", "milestone integration"],
  part1: {
    title: "Concept: The Complete Game Loop",
    type: "concept",
    instructions: `# Milestone: Micro Roguelike

## Mental Model
A roguelike has one core loop: **Generate → Explore → Fight → Descend → Repeat.** In 9 lessons, you built every piece. This milestone integrates them into a complete, playable game. Nothing new to learn — just verify that everything works together.

## What You Built
| Lesson | System |
|--------|--------|
| L1 | Dungeon grid (40×30 tiles) |
| L2 | Deterministic RNG (Lehmer) |
| L3 | BSP single split |
| L4 | Recursive BSP (4 rooms) |
| L5 | L-shaped corridors |
| L6 | Player placement + WASD |
| L7 | Enemy population |
| L8 | Bump combat + HP |
| L9 | Stairs + floor transition |

## Architecture Proof
Your micro-roguelike uses:
- **~200 lines of C++** — no external libraries except raylib
- **~2KB of memory** — dungeon grid + player + enemies + BSP nodes
- **Zero heap allocations** — all arrays are fixed-size
- **Deterministic output** — same seed always produces the same dungeon

This is a real game engine. Small, but complete.

## Your Task
Verify the complete system by printing summary stats.

Expected output:
\```
Micro Roguelike
Rooms: 4
Enemies: 5
Systems: 9
\```

## Elite Insight
The original Rogue (1980) was about 10,000 lines of C. Your micro-roguelike is ~200 lines of C++ with the same core systems. The difference? Rogue added item identification, hunger, more enemy types, and 26 dungeon levels. Those are features on TOP of the loop you just built.

## Systems Thinking Connection
Your roguelike and the RPG path share the same fundamental pattern: a game loop that processes input, updates state, and renders. The RPG loads content from files; the Roguelike generates content from algorithms. Both are ~200 lines. Both are real games.

## Mastery Check
Question: If you wanted to add a new feature (like items), which function would you modify?
Answer: generateFloor() for item placement, handleInput() for item pickup, and the render loop for item display. The same three touchpoints for ANY new feature. This is the power of a clean game loop.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Micro Roguelike" << endl;
    cout << "Rooms: 4" << endl;
    cout << "Enemies: 5" << endl;
    // TODO: Print "Systems: 9"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Micro Roguelike" << endl;
    cout << "Rooms: 4" << endl;
    cout << "Enemies: 5" << endl;
    cout << "Systems: 9" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Game title", expectedOutput: "Micro Roguelike" },
      { id: "t2", description: "Room count", expectedOutput: "Rooms: 4" },
      { id: "t3", description: "Enemy count", expectedOutput: "Enemies: 5" },
      { id: "t4", description: "System count", expectedOutput: "Systems: 9" },
    ],
    hints: [
      "Just add the missing cout line: cout << \"Systems: 9\" << endl;",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Complete Micro Roguelike",
    type: "game_builder",
    instructions: `# Build: Complete Micro Roguelike

## Mental Model
This is the full game. BSP dungeon generation, corridors, player, enemies, bump combat, stairs, floor transitions, HP HUD, game over. Run it and play.

## What Breaks Without This
Nothing — this lesson is about verifying that everything works together. If any system is broken, you'll see it here.

## Your Task
The code is complete from L9. Add a score system: +10 points per enemy killed, +50 points per floor descended. Display score on HUD.

Expected cout output:
\```
Seed: 42
Floor: 1
Rooms: 4
Enemies: 5
Stairs: (22,21)
Score: 0
\```

**Click Run** and play the complete micro-roguelike!

## Did It Work?
You should have a fully playable roguelike: move with WASD, fight red enemies by walking into them, find yellow stairs to descend. HP and score display on HUD. Floor counter increments. Game over on death.

## Make It Yours
This is YOUR roguelike now. Try changing the seed to get different dungeons. Adjust enemy HP (3) or player HP (10) for different difficulty. Change BSP depth from 2 to 3 for more rooms. Make the corridors wider. Tests only check the cout output — the visuals and balance are your creative space.

## Beginner Trap
**Adding score to the wrong place.** Increment score in handleInput when an enemy dies (+10) and when stepping on stairs (+50). Don't put scoring in the render loop — that runs 60 times/second.

## Elite Insight
Spelunky's Derek Yu spent 4 years polishing what started as a simple roguelike prototype. Your micro-roguelike is that prototype. Every commercial roguelike started with exactly what you have: a grid, a player, enemies, and stairs. The rest is iteration.

## Mastery Check
Question: How many bytes of total game state does your micro-roguelike use?
Answer: dungeon[30][40] = 1200 bytes. BSPNode[15] = 240 bytes. Room[8] = 192 bytes. Enemy[32] = 384 bytes. Player(x,y,hp,score,floor) = 20 bytes. Total: ~2036 bytes. Your entire game fits in 2KB. AAA games use gigabytes of state — yours uses 2KB and is still fun.`,
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
int score = 0;
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
        // TODO: Add 50 to score when descending
        rng_state = (uint32_t)(floor_num * 48271);
        generateFloor();
        return;
    }

    int ei = findEnemyAt(nx, ny);
    if (ei >= 0) {
        enemies[ei].hp -= 1;
        playerHp -= 1;
        if (enemies[ei].hp <= 0) {
            enemies[ei].alive = false;
            // TODO: Add 10 to score when killing an enemy
        }
        if (playerHp <= 0) gameOver = true;
    } else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0) {
        px = nx; py = ny;
    }
}

int main() {
    generateFloor();

    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << floor_num << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Stairs: (" << stairsX << "," << stairsY << ")" << endl;
    cout << "Score: " << score << endl;

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
        DrawText(TextFormat("HP: %d  Floor: %d  Score: %d", playerHp, floor_num, score), 10, SCREEN_H - 25, 20, GREEN);
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
int score = 0;
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
        score += 50;
        rng_state = (uint32_t)(floor_num * 48271);
        generateFloor();
        return;
    }

    int ei = findEnemyAt(nx, ny);
    if (ei >= 0) {
        enemies[ei].hp -= 1;
        playerHp -= 1;
        if (enemies[ei].hp <= 0) {
            enemies[ei].alive = false;
            score += 10;
        }
        if (playerHp <= 0) gameOver = true;
    } else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0) {
        px = nx; py = ny;
    }
}

int main() {
    generateFloor();

    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << floor_num << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Stairs: (" << stairsX << "," << stairsY << ")" << endl;
    cout << "Score: " << score << endl;

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
        DrawText(TextFormat("HP: %d  Floor: %d  Score: %d", playerHp, floor_num, score), 10, SCREEN_H - 25, 20, GREEN);
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
      { id: "g6", description: "Initial score", expectedOutput: "Score: 0" },
    ],
    hints: [
      "Add score += 10 right after enemies[ei].alive = false (when an enemy dies).",
      "Add score += 50 right before generateFloor() in the stairs handler.",
      "Two scoring lines: one in combat (score += 10 on kill) and one in stairs handler (score += 50 on descend).",
    ],
    estimatedMinutes: 20,
    customizationPrompt: "This is YOUR micro-roguelike. Change the seed to explore different dungeons. Adjust enemy HP (3) and player HP (10) for different difficulty curves. Try BSP depth 3 for more rooms. Make corridors 2 tiles wide for an open feel. Change enemy colors by room. Add a kill counter. The tests only check cout output — visuals, balance, and game feel are your creative space.",
  },
};