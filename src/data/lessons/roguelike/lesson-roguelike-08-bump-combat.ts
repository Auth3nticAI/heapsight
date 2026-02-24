import { Lesson } from "@/types/lesson";

export const lessonRoguelike8: Lesson = {
  id: "roguelike-8-bump-combat",
  title: "Bump Combat",
  description: "Walk into enemies to fight. Damage exchange on collision. HP displayed on HUD.",
  order: 8,
  xpReward: 50,
  tier: "free",
  concepts: ["bump combat", "adjacency detection", "damage exchange", "HUD rendering"],
  part1: {
    title: "Concept: Bump-to-Attack",
    type: "concept",
    instructions: `# Bump Combat

## Mental Model
Traditional roguelikes use "bump combat" — move into an enemy's tile to attack. No separate attack button, no targeting system. Movement IS combat. If the target tile contains an enemy, deal damage instead of moving.

## What Breaks Without This
Enemies are red decorations. Without combat, there's no risk, no game over, no reason to care about enemy positions. Bump combat transforms the dungeon from a maze into a battlefield.

## The Fix: Check Before Move
When handling input, before moving to (nx, ny):
1. Check if any alive enemy is at (nx, ny)
2. If yes: deal damage to enemy, enemy deals damage back, DON'T move
3. If no: move normally

\```cpp
int findEnemyAt(int x, int y) {
    for (int i = 0; i < enemy_count; i++)
        if (enemies[i].alive && enemies[i].x == x && enemies[i].y == y) return i;
    return -1;
}

void handleInput() {
    int nx = px, ny = py;
    if (IsKeyPressed(KEY_W)) ny--;
    // ... S, A, D ...
    if (nx == px && ny == py) return;
    int ei = findEnemyAt(nx, ny);
    if (ei >= 0) {
        enemies[ei].hp -= 1; // player deals 1 damage
        playerHp -= 1;       // enemy deals 1 damage back
        if (enemies[ei].hp <= 0) enemies[ei].alive = false;
    } else if (dungeon[ny][nx] != 0) {
        px = nx; py = ny;
    }
}
\```

## Key Concepts
- Bump combat: movement triggers attack if enemy present
- findEnemyAt: linear scan of enemy array
- Damage exchange: both sides take damage simultaneously
- Death check: hp <= 0 sets alive = false

## Performance Insight
findEnemyAt scans up to 32 enemies — trivial cost. With 5-10 enemies per floor, this is 5-10 comparisons per keypress. At 2 keypresses per second, that's 20 comparisons/second. Negligible.

## Memory Insight
Adding player HP costs 4 bytes. The combat system adds zero data structures — it reuses the existing enemy array and player position. Total new memory: 4 bytes.

## Your Task
Implement findEnemyAt and bump combat. Player has 10 HP, enemies have 3 HP. Print combat stats.

Expected output:
\```
Player HP: 10
Enemy HP: 3
Combat: bump to attack
\```

## Beginner Trap
**Moving the player AND dealing damage on the same keypress.** When you bump an enemy, the player should stay in place. Only move if no enemy is at the target tile.

## Elite Insight
Nethack's combat is also bump-based, but adds weapon damage dice, armor class, and to-hit rolls. Your system is the core: bump = attack. Everything else is layered on top. Diablo started as a roguelike and kept the "click enemy = attack" model.

## Systems Thinking Connection
Bump combat is elegant because it unifies two systems (movement and combat) into one input handler. The Platformer separates jump/run/attack into different buttons. The Roguelike combines movement and attack into WASD. Fewer buttons, deeper tactics.

## Skill Reinforcement
Lesson 7 placed enemies. This lesson makes them interactive. Lesson 9 will add stairs to escape to a new floor.

## Mastery Check
Question: Why does the player NOT move when bumping an enemy?
Answer: If the player moved to the enemy's tile, they'd overlap. The player attacks FROM their current position. The enemy dies in place. This is standard roguelike design — attack without moving.`,
    starterCode: `#include <iostream>
using namespace std;

struct Enemy { int x, y, hp; bool alive; };
Enemy enemies[4] = {{3,3,3,true}, {5,3,3,true}, {3,5,3,true}, {7,7,3,true}};
int enemy_count = 4;
int playerHp = 10;

// TODO: Implement findEnemyAt(int x, int y)
// Return index of alive enemy at (x,y), or -1 if none

int main() {
    cout << "Player HP: " << playerHp << endl;
    cout << "Enemy HP: " << enemies[0].hp << endl;
    cout << "Combat: bump to attack" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Enemy { int x, y, hp; bool alive; };
Enemy enemies[4] = {{3,3,3,true}, {5,3,3,true}, {3,5,3,true}, {7,7,3,true}};
int enemy_count = 4;
int playerHp = 10;

int findEnemyAt(int x, int y) {
    for (int i = 0; i < enemy_count; i++)
        if (enemies[i].alive && enemies[i].x == x && enemies[i].y == y) return i;
    return -1;
}

int main() {
    cout << "Player HP: " << playerHp << endl;
    cout << "Enemy HP: " << enemies[0].hp << endl;
    cout << "Combat: bump to attack" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Player HP", expectedOutput: "Player HP: 10" },
      { id: "t2", description: "Enemy HP", expectedOutput: "Enemy HP: 3" },
      { id: "t3", description: "Combat type", expectedOutput: "Combat: bump to attack" },
    ],
    hints: [
      "findEnemyAt loops through all enemies checking alive && x match && y match.",
      "Return the index i if found, -1 if no enemy at that position.",
      "int findEnemyAt(int x, int y) { for(int i=0;i<enemy_count;i++) if(enemies[i].alive && enemies[i].x==x && enemies[i].y==y) return i; return -1; }",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Combat Dungeon",
    type: "game_builder",
    instructions: `# Build: Combat Dungeon

## Mental Model
Integrate bump combat into the full dungeon. Walk into a red enemy to fight. Both player and enemy lose 1 HP per bump. Dead enemies disappear. HP is shown on the HUD at the bottom of the screen.

## What Breaks Without This
Enemies are impassable red obstacles. The player can see them but can't interact. Without combat, the dungeon is a navigation puzzle, not a game.

## Your Task
Add bump combat to the L7 dungeon. Player starts with 10 HP, enemies with 3 HP. Show HP on the HUD. Dead enemies (hp <= 0) are removed from rendering.

Expected cout output:
\```
Seed: 42
Rooms: 4
Enemies: 5
Player: (6,3)
Player HP: 10
\```

**Click Run** and bump into enemies to fight!

## Did It Work?
You should see the dungeon with enemies (RED) and player (GREEN). Walk into an enemy — both lose 1 HP. The enemy disappears after 3 hits. Your HP is shown at the bottom. If HP reaches 0, game over text appears.

## Beginner Trap
**Forgetting to check if the enemy is already dead.** Always check `enemies[i].alive` before processing combat. A dead enemy should be ignored by both findEnemyAt and the renderer.

## Elite Insight
Hades uses a "grace period" after taking damage. Traditional roguelikes don't — damage is instant and turn-based. Your bump combat is pure roguelike: one bump = one exchange. No invincibility frames, no animation delays.

## Mastery Check
Question: What happens if two enemies are adjacent to the player and the player bumps one?
Answer: Only the enemy at the target tile takes damage. findEnemyAt returns the FIRST enemy at (nx, ny). The other enemy is unaffected. In a real roguelike, area attacks would need a different system.`,
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

int px, py, playerHp = 10;
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

// TODO: Modify handleInput() to add bump combat
// When target tile has an enemy: deal 1 damage to enemy, take 1 damage
// When enemy hp <= 0, set alive = false
// When playerHp <= 0, set gameOver = true
// Only MOVE if no enemy at target tile
void handleInput() {
    if (gameOver) return;
    int nx = px, ny = py;
    if (IsKeyPressed(KEY_W)) ny--;
    if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--;
    if (IsKeyPressed(KEY_D)) nx++;
    if (nx == px && ny == py) return;

    // TODO: check for enemy at (nx, ny) and handle combat
    // If no enemy, move if tile is walkable
    if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0) {
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
    int corridor_count = 0;
    connectBSP(0, corridor_count);
    px = rooms[0].cx; py = rooms[0].cy;
    populateEnemies();

    cout << "Seed: " << 42 << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Player: (" << px << "," << py << ")" << endl;
    cout << "Player HP: " << playerHp << endl;

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
        for (int i = 0; i < enemy_count; i++)
            if (enemies[i].alive)
                DrawRectangle(enemies[i].x*TILE_SIZE, enemies[i].y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, RED);
        DrawRectangle(px*TILE_SIZE, py*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, GREEN);
        // HUD
        DrawText(TextFormat("HP: %d", playerHp), 10, SCREEN_H - 25, 20, GREEN);
        if (gameOver) DrawText("GAME OVER", SCREEN_W/2 - 80, SCREEN_H/2, 30, RED);
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

int px, py, playerHp = 10;
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

void handleInput() {
    if (gameOver) return;
    int nx = px, ny = py;
    if (IsKeyPressed(KEY_W)) ny--;
    if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--;
    if (IsKeyPressed(KEY_D)) nx++;
    if (nx == px && ny == py) return;

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
    int corridor_count = 0;
    connectBSP(0, corridor_count);
    px = rooms[0].cx; py = rooms[0].cy;
    populateEnemies();

    cout << "Seed: " << 42 << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Player: (" << px << "," << py << ")" << endl;
    cout << "Player HP: " << playerHp << endl;

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
        for (int i = 0; i < enemy_count; i++)
            if (enemies[i].alive)
                DrawRectangle(enemies[i].x*TILE_SIZE, enemies[i].y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, RED);
        DrawRectangle(px*TILE_SIZE, py*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, GREEN);
        DrawText(TextFormat("HP: %d", playerHp), 10, SCREEN_H - 25, 20, GREEN);
        if (gameOver) DrawText("GAME OVER", SCREEN_W/2 - 80, SCREEN_H/2, 30, RED);
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
      { id: "g5", description: "Player HP", expectedOutput: "Player HP: 10" },
    ],
    hints: [
      "In handleInput, after computing (nx,ny), call findEnemyAt(nx,ny). If it returns >= 0, handle combat instead of moving.",
      "Combat: enemies[ei].hp -= 1; playerHp -= 1; if(enemies[ei].hp<=0) enemies[ei].alive=false; if(playerHp<=0) gameOver=true;",
      "Put the enemy check BEFORE the movement check: if(ei>=0){...combat...} else if(tile is walkable){...move...}",
    ],
    estimatedMinutes: 15,
  },
};