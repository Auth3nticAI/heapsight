import { Lesson } from "@/types/lesson";

export const lessonRPG13: Lesson = {
  id: "rpg-13-entity-ids-v0",
  title: "Entity IDs v0",
  description: "Assign integer IDs to entities. Use NO_ENTITY=-1 as a sentinel. This lays the groundwork for array-indexed entity lookup in later lessons.",
  order: 13,
  xpReward: 100,
  tier: "pro",
  concepts: ["entity ID", "sentinel value", "integer keys", "NO_ENTITY"],
  part1: {
    title: "Concept: Entity IDs v0",
    type: "concept",
    instructions: `# Concept: Entity IDs v0

## Why Entity IDs?
So far we refer to entities by their variable names: \`world.player\` and \`world.enemy_pos\`. As a game grows, you'll have many enemies, NPCs, and items. Referring to them by position in a flat struct doesn't scale.

The solution: give every entity an **integer ID**. An entity's ID is its key. You look it up by ID the same way you index an array.

## The Sentinel: NO_ENTITY = -1
We need a value that means "no entity here". Use \`const int NO_ENTITY = -1\`. This plays the same role as \`nullptr\` for pointers, but it's just an int -- no pointers, no heap.

## The Pattern
\`\`\`cpp
const int NO_ENTITY = -1;
const int PLAYER_ID = 0;
const int ENEMY_ID  = 1;

const char* entityName(int id) {
    if (id == PLAYER_ID) return "Player";
    if (id == ENEMY_ID)  return "Enemy";
    return "None";
}
\`\`\`

## Your Task
1. Define \`NO_ENTITY = -1\`, \`PLAYER_ID = 0\`, \`ENEMY_ID = 1\`
2. Write \`entityName(int id)\` returning the right string
3. Loop over \`{PLAYER_ID, ENEMY_ID, NO_ENTITY}\` and print each
4. Print \`IDs: OK\` at the end

Expected output:
\`\`\`
ID 0: Player
ID 1: Enemy
ID -1: None
IDs: OK
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// TODO 1: Add const int NO_ENTITY = -1;
// TODO 1: Add const int PLAYER_ID = 0;
// TODO 1: Add const int ENEMY_ID  = 1;

// TODO 2: Write entityName(int id) returning the name string

int main() {
    // TODO 3: int ids[] = {PLAYER_ID, ENEMY_ID, NO_ENTITY};
    // for loop: cout << "ID " << ids[i] << ": " << entityName(ids[i]) << endl;
    cout << "IDs: OK" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int NO_ENTITY = -1;
const int PLAYER_ID = 0;
const int ENEMY_ID  = 1;

const char* entityName(int id) {
    if (id == PLAYER_ID) return "Player";
    if (id == ENEMY_ID)  return "Enemy";
    return "None";
}

int main() {
    int ids[] = {PLAYER_ID, ENEMY_ID, NO_ENTITY};
    for (int i = 0; i < 3; i++) {
        cout << "ID " << ids[i] << ": " << entityName(ids[i]) << endl;
    }
    cout << "IDs: OK" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Player ID", expectedOutput: "ID 0: Player", isPattern: false },
      { id: "t2", description: "Enemy ID", expectedOutput: "ID 1: Enemy", isPattern: false },
      { id: "t3", description: "Sentinel ID", expectedOutput: "ID -1: None", isPattern: false },
      { id: "t4", description: "IDs verified", expectedOutput: "IDs: OK", isPattern: false },
    ],
    hints: [
      "const int NO_ENTITY = -1; -- the sentinel. Like nullptr but safer (just an int).",
      "entityName() is a simple lookup: if/if/return None. Keep it short.",
      "int ids[] = {0, 1, -1}; for (int i=0; i<3; i++) -- classic fixed-size array loop.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Entity IDs v0",
    type: "game_builder",
    instructions: `# Build: Entity IDs v0

## Mental Model
Add integer IDs to the World struct so every entity has a unique int key. This doesn't change any behavior -- it's bookkeeping that sets up future lessons where IDs index arrays.

## Step 1: Add NO_ENTITY constant
After the INTENT constants, add:
\`\`\`cpp
const int NO_ENTITY = -1;
\`\`\`

## Step 2: Add IDs to World struct
\`\`\`cpp
struct World {
    int player_id = 0;   // entity 0 is always the player
    int enemy_id  = 1;   // entity 1 is the enemy
    Vec2i player = {5, 5};
    // ... rest unchanged
};
\`\`\`

## Step 3: Add entityName() function
After \`intentName()\`, add:
\`\`\`cpp
const char* entityName(int id) {
    if (id == world.player_id) return "Player";
    if (id == world.enemy_id)  return "Enemy";
    return "None";
}
\`\`\`

## Step 4: Add HUD lines
Show the IDs in the HUD panel:
\`\`\`cpp
DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
\`\`\`

## Step 5: Add startup cout
\`\`\`cpp
cout << "IDs: OK" << endl;
\`\`\`

**Click Run now** -- game behaves identically to L12 but now entities have IDs.

## Mastery Check
Question: Why store \`player_id\` in the struct if it's always 0?
Answer: Consistency. When you generalize to multiple enemies, each has its own ID field. Hard-coding 0 everywhere would require grep-replacing the whole codebase later.

Expected cout output:
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
\`\`\``,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];

const int INTENT_NONE   = 0;
const int INTENT_UP     = 1;
const int INTENT_DOWN   = 2;
const int INTENT_LEFT   = 3;
const int INTENT_RIGHT  = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;

// TODO 1: Add const int NO_ENTITY = -1;

struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    // TODO 2: Add int player_id = 0; int enemy_id = 1;
    Vec2i player = {5, 5};
    Vec2i enemy_pos = {9, 7};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
};
World world;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP:     return "MOVE_UP";
        case INTENT_DOWN:   return "MOVE_DOWN";
        case INTENT_LEFT:   return "MOVE_LEFT";
        case INTENT_RIGHT:  return "MOVE_RIGHT";
        case INTENT_ATTACK: return "ATTACK";
        default:            return "NONE";
    }
}

// TODO 3: Add entityName(int id) function here

void resolveCommand() {
    if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;
    int new_x = world.player.x;
    int new_y = world.player.y;
    if (pending_intent == INTENT_UP)    new_y--;
    else if (pending_intent == INTENT_DOWN)  new_y++;
    else if (pending_intent == INTENT_LEFT)  new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE; return;
    }
    if (tiles[new_y][new_x] == TILE_WALL) { pending_intent = INTENT_NONE; return; }
    if (world.enemy_alive && new_x == world.enemy_pos.x && new_y == world.enemy_pos.y) {
        pending_intent = INTENT_ATTACK; return;
    }
    world.player.x = new_x;
    world.player.y = new_y;
    pending_intent = INTENT_NONE;
}

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    world.enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    pending_intent = INTENT_NONE;
}

void phaseInput() {
    pending_intent = INTENT_NONE;
    if (IsKeyPressed(KEY_W))      pending_intent = INTENT_UP;
    else if (IsKeyPressed(KEY_S)) pending_intent = INTENT_DOWN;
    else if (IsKeyPressed(KEY_A)) pending_intent = INTENT_LEFT;
    else if (IsKeyPressed(KEY_D)) pending_intent = INTENT_RIGHT;
}

void phaseResolve() {
    resolveCommand();
    resolveCombat();
}

void phaseWorld() {
    if (!world.enemy_alive) return;
    int dx = world.player.x - world.enemy_pos.x;
    int dy = world.player.y - world.enemy_pos.y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.enemy_pos.x + move_x;
    int ny = world.enemy_pos.y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != TILE_WALL && !(nx == world.player.x && ny == world.player.y)) {
        world.enemy_pos.x = nx; world.enemy_pos.y = ny;
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

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == TILE_WALL) wall_count++;

    cout << "Player: (" << world.player.x << ", " << world.player.y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.enemy_pos.x << ", " << world.enemy_pos.y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
    cout << "Player HP: " << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    cout << "Struct: world" << endl;
    cout << "Vec2i: OK" << endl;
    // TODO 4: cout << "IDs: OK" << endl;

    while (!WindowShouldClose()) {
        phaseInput();
        if (pending_intent != INTENT_NONE) {
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
        DrawRectangle(world.player.x*TILE, world.player.y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.enemy_pos.x*TILE, world.enemy_pos.y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.player.x, world.player.y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.enemy_pos.x, world.enemy_pos.y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        // TODO 5: DrawText Player[id] and Enemy[id] here
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];

const int INTENT_NONE   = 0;
const int INTENT_UP     = 1;
const int INTENT_DOWN   = 2;
const int INTENT_LEFT   = 3;
const int INTENT_RIGHT  = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;

const int NO_ENTITY = -1;

struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0;
    int enemy_id  = 1;
    Vec2i player = {5, 5};
    Vec2i enemy_pos = {9, 7};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
};
World world;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP:     return "MOVE_UP";
        case INTENT_DOWN:   return "MOVE_DOWN";
        case INTENT_LEFT:   return "MOVE_LEFT";
        case INTENT_RIGHT:  return "MOVE_RIGHT";
        case INTENT_ATTACK: return "ATTACK";
        default:            return "NONE";
    }
}

const char* entityName(int id) {
    if (id == world.player_id) return "Player";
    if (id == world.enemy_id)  return "Enemy";
    return "None";
}

void resolveCommand() {
    if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;
    int new_x = world.player.x;
    int new_y = world.player.y;
    if (pending_intent == INTENT_UP)    new_y--;
    else if (pending_intent == INTENT_DOWN)  new_y++;
    else if (pending_intent == INTENT_LEFT)  new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE; return;
    }
    if (tiles[new_y][new_x] == TILE_WALL) { pending_intent = INTENT_NONE; return; }
    if (world.enemy_alive && new_x == world.enemy_pos.x && new_y == world.enemy_pos.y) {
        pending_intent = INTENT_ATTACK; return;
    }
    world.player.x = new_x;
    world.player.y = new_y;
    pending_intent = INTENT_NONE;
}

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    world.enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    pending_intent = INTENT_NONE;
}

void phaseInput() {
    pending_intent = INTENT_NONE;
    if (IsKeyPressed(KEY_W))      pending_intent = INTENT_UP;
    else if (IsKeyPressed(KEY_S)) pending_intent = INTENT_DOWN;
    else if (IsKeyPressed(KEY_A)) pending_intent = INTENT_LEFT;
    else if (IsKeyPressed(KEY_D)) pending_intent = INTENT_RIGHT;
}

void phaseResolve() {
    resolveCommand();
    resolveCombat();
}

void phaseWorld() {
    if (!world.enemy_alive) return;
    int dx = world.player.x - world.enemy_pos.x;
    int dy = world.player.y - world.enemy_pos.y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.enemy_pos.x + move_x;
    int ny = world.enemy_pos.y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != TILE_WALL && !(nx == world.player.x && ny == world.player.y)) {
        world.enemy_pos.x = nx; world.enemy_pos.y = ny;
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

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == TILE_WALL) wall_count++;

    cout << "Player: (" << world.player.x << ", " << world.player.y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.enemy_pos.x << ", " << world.enemy_pos.y << ")" << endl;
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

    while (!WindowShouldClose()) {
        phaseInput();
        if (pending_intent != INTENT_NONE) {
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
        DrawRectangle(world.player.x*TILE, world.player.y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.enemy_pos.x*TILE, world.enemy_pos.y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.player.x, world.player.y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.enemy_pos.x, world.enemy_pos.y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Vec2i OK", expectedOutput: "Vec2i: OK", isPattern: false },
      { id: "g3", description: "IDs OK", expectedOutput: "IDs: OK", isPattern: false },
    ],
    hints: [
      "Add const int NO_ENTITY = -1; after the INTENT constants.",
      "In struct World, add: int player_id = 0; int enemy_id = 1; as the first two fields.",
      "entityName() checks world.player_id first, then world.enemy_id, else returns None.",
    ],
    estimatedMinutes: 12
  }
};