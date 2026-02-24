import { Lesson } from "@/types/lesson";

export const lessonRPG14: Lesson = {
  id: "rpg-14-soa-components-v0",
  title: "SoA Components v0",
  description: "Migrate entity positions into a parallel array indexed by entity ID. This is the Structure of Arrays pattern -- the foundation for cache-friendly ECS design.",
  order: 14,
  xpReward: 100,
  tier: "pro",
  concepts: ["SoA", "parallel arrays", "array indexing", "ECS foundation"],
  part1: {
    title: "Concept: SoA vs AoS",
    type: "concept",
    instructions: `# Concept: SoA vs AoS

## Two Ways to Store Multiple Entities

**Array of Structs (AoS)** -- each entity is a struct, you have an array of them:
\`\`\`cpp
struct Entity { int x, y, hp; };
Entity entities[4];  // entities[0].hp, entities[1].x, ...
\`\`\`

**Structure of Arrays (SoA)** -- each component type is its own array, indexed by entity ID:
\`\`\`cpp
int pos_x[4];  // pos_x[0], pos_x[1], ...
int pos_y[4];
int hp[4];
\`\`\`

## Why SoA?
- **Cache-friendly**: when processing all positions, \`pos_x[]\` and \`pos_y[]\` are contiguous in memory
- **Entity ID as index**: \`hp[entity_id]\` -- no pointer chasing, no map lookup
- **Easy to add components**: add a new array, don't change the struct
- This is the foundation of every modern game engine's Entity Component System

## Your Task
Demonstrate both patterns for 2 entities:
1. Print AoS HP access: \`AoS: entity[0].hp = 20\`
2. Print SoA HP access: \`SoA: hp[0] = 20\`
3. Print \`SoA: OK\`

Expected output:
\`\`\`
AoS: entity[0].hp = 20
SoA: hp[0] = 20
SoA: OK
\`\`\`

## Beginner Trap
**Storing all entity data in one big struct (Array of Structs) when you only need to iterate positions.** AoS loads HP, inventory, and AI data into cache just to read x and y. SoA keeps positions contiguous for fast iteration.

## Elite Insight
Data-oriented design (DOD) powers every modern ECS engine — EnTT, flecs, Unity DOTS all use SoA layouts internally. Cache-friendly data access is the single biggest performance win in entity-heavy games.

## Systems Thinking Connection
Shooter L14 formalizes the same SoA split for bullets: position[], velocity[], active[] as parallel arrays. Both paths discover the same truth — memory layout determines iteration speed more than algorithm choice.`,
    starterCode: `#include <iostream>
using namespace std;

// AoS: array of structs
struct Entity { int x, y, hp; };
Entity entities[2] = {{5, 5, 20}, {9, 7, 10}};

// SoA: struct of arrays (parallel arrays indexed by entity ID)
int pos_x[2] = {5, 9};
int pos_y[2] = {5, 7};
int hp[2]    = {20, 10};

int main() {
    // TODO 1: cout << "AoS: entity[0].hp = " << entities[0].hp << endl;
    // TODO 2: cout << "SoA: hp[0] = " << hp[0] << endl;
    cout << "SoA: OK" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

// AoS: array of structs
struct Entity { int x, y, hp; };
Entity entities[2] = {{5, 5, 20}, {9, 7, 10}};

// SoA: struct of arrays (parallel arrays indexed by entity ID)
int pos_x[2] = {5, 9};
int pos_y[2] = {5, 7};
int hp[2]    = {20, 10};

int main() {
    cout << "AoS: entity[0].hp = " << entities[0].hp << endl;
    cout << "SoA: hp[0] = " << hp[0] << endl;
    cout << "SoA: OK" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "AoS access", expectedOutput: "AoS: entity[0].hp = 20", isPattern: false },
      { id: "t2", description: "SoA access", expectedOutput: "SoA: hp[0] = 20", isPattern: false },
      { id: "t3", description: "SoA verified", expectedOutput: "SoA: OK", isPattern: false },
    ],
    hints: [
      "AoS: entities[0].hp -- access the first entity's hp field.",
      "SoA: hp[0] -- first element of the hp array. Same data, different layout.",
      "Both give you 20. The difference is in memory layout, not values.",
    ],
    estimatedMinutes: 10
  },
  part2: {
    title: "Build: SoA Components v0",
    type: "game_builder",
    instructions: `# Build: SoA Components v0

## Mental Model
Replace the named position fields \`Vec2i player\` and \`Vec2i enemy_pos\` in World with a single parallel array \`Vec2i pos[MAX_ENTITIES]\` indexed by entity ID. Access becomes \`world.pos[world.player_id].x\` instead of \`world.player.x\`.

## Step 1: Add MAX_ENTITIES constant
\`\`\`cpp
const int MAX_ENTITIES = 2;
\`\`\`

## Step 2: Update struct World
Replace \`Vec2i player\` and \`Vec2i enemy_pos\` with a SoA array:
\`\`\`cpp
struct World {
    int player_id = 0;
    int enemy_id  = 1;
    Vec2i pos[MAX_ENTITIES] = {{5,5},{9,7}}; // pos[player_id], pos[enemy_id]
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
};
\`\`\`

## Step 3: Update all position access
Find and replace in every function and HUD line:
- \`world.player.x\` -> \`world.pos[world.player_id].x\`
- \`world.player.y\` -> \`world.pos[world.player_id].y\`
- \`world.enemy_pos.x\` -> \`world.pos[world.enemy_id].x\`
- \`world.enemy_pos.y\` -> \`world.pos[world.enemy_id].y\`

## Step 4: Add startup cout
\`\`\`cpp
cout << "SoA: OK" << endl;
\`\`\`

**Click Run now** -- identical gameplay, positions now accessed via parallel array.

## Mastery Check
Question: What happens when you want to add a third entity later?
Answer: Increase \`MAX_ENTITIES\` to 3 and initialize index 2. The same \`pos[2]\` just works -- no struct to add fields to.

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
SoA: OK
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

const int NO_ENTITY = -1;
// TODO 1: Add const int MAX_ENTITIES = 2;

struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0;
    int enemy_id  = 1;
    // TODO 2: Replace Vec2i player and Vec2i enemy_pos with:
    //         Vec2i pos[MAX_ENTITIES] = {{5,5},{9,7}};
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

// TODO 3: Update resolveCommand -- world.player.x -> world.pos[world.player_id].x, etc.
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

// TODO 4: Update phaseWorld -- world.enemy_pos.x -> world.pos[world.enemy_id].x, etc.
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

    // TODO 5: Update cout to use world.pos[world.player_id].x etc.
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
    // TODO 6: cout << "SoA: OK" << endl;

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
        // TODO 7: Update DrawRectangle calls to use world.pos[world.player_id].x etc.
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
const int MAX_ENTITIES = 2;

struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0;
    int enemy_id  = 1;
    Vec2i pos[MAX_ENTITIES] = {{5,5},{9,7}};
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
    int new_x = world.pos[world.player_id].x;
    int new_y = world.pos[world.player_id].y;
    if (pending_intent == INTENT_UP)    new_y--;
    else if (pending_intent == INTENT_DOWN)  new_y++;
    else if (pending_intent == INTENT_LEFT)  new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE; return;
    }
    if (tiles[new_y][new_x] == TILE_WALL) { pending_intent = INTENT_NONE; return; }
    if (world.enemy_alive && new_x == world.pos[world.enemy_id].x && new_y == world.pos[world.enemy_id].y) {
        pending_intent = INTENT_ATTACK; return;
    }
    world.pos[world.player_id].x = new_x;
    world.pos[world.player_id].y = new_y;
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
    int dx = world.pos[world.player_id].x - world.pos[world.enemy_id].x;
    int dy = world.pos[world.player_id].y - world.pos[world.enemy_id].y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.pos[world.enemy_id].x + move_x;
    int ny = world.pos[world.enemy_id].y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != TILE_WALL && !(nx == world.pos[world.player_id].x && ny == world.pos[world.player_id].y)) {
        world.pos[world.enemy_id].x = nx; world.pos[world.enemy_id].y = ny;
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

    cout << "Player: (" << world.pos[world.player_id].x << ", " << world.pos[world.player_id].y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.pos[world.enemy_id].x << ", " << world.pos[world.enemy_id].y << ")" << endl;
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
    cout << "SoA: OK" << endl;

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
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
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
      { id: "g2", description: "IDs OK", expectedOutput: "IDs: OK", isPattern: false },
      { id: "g3", description: "SoA OK", expectedOutput: "SoA: OK", isPattern: false },
    ],
    hints: [
      "Add const int MAX_ENTITIES = 2; after const int NO_ENTITY.",
      "Vec2i pos[MAX_ENTITIES] = {{5,5},{9,7}}; -- brace-init both elements at once.",
      "Replace world.player.x with world.pos[world.player_id].x everywhere.",
    ],
    estimatedMinutes: 15
  }
};