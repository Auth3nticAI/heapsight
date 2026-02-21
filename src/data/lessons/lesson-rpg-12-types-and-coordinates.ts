import { Lesson } from "@/types/lesson";

export const lessonRPG12: Lesson = {
  id: "rpg-12-types-and-coordinates",
  title: "Types and Coordinates",
  description: "Add Vec2i for 2D coordinates and a TileType enum. Player and enemy positions become typed structs instead of raw int pairs.",
  order: 12,
  xpReward: 100,
  tier: "pro",
  concepts: ["Vec2i", "enum TileType", "type safety", "coordinate struct"],
  part1: {
    title: "Concept: Vec2i and TileType",
    type: "concept",
    instructions: `# Types and Coordinates

## Mental Model
Right now, positions are stored as two separate ints: \`int player_x, player_y\`. This works but has no type safety. You can accidentally pass y where x is expected. A \`struct Vec2i\` groups the two ints into a named pair.
\`\`\`cpp
struct Vec2i {
    int x = 0;
    int y = 0;
};
\`\`\`

Now \`Vec2i player = {5, 5}\` is a single, named coordinate. You can also add helper functions:
\`\`\`cpp
int manhattan(Vec2i a, Vec2i b) {
    int dx = a.x - b.x; if (dx < 0) dx = -dx;
    int dy = a.y - b.y; if (dy < 0) dy = -dy;
    return dx + dy;
}
\`\`\`

## TileType Enum
Tile values 0 and 1 are magic numbers. An enum names them:
\`\`\`cpp
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };
\`\`\`
Now \`tiles[y][x] == TILE_WALL\` reads like English instead of \`tiles[y][x] == 1\`.

## Key Concepts
- \`struct Vec2i\` with default member initializers (\`int x = 0; int y = 0;\`)
- Initialize: \`Vec2i p = {5, 5};\` or \`Vec2i p; p.x = 5; p.y = 5;\`
- \`enum TileType\` gives names to magic numbers
- These are pure type additions -- no behavior changes

## Beginner Trap
**Using float for grid coordinates.** Grid positions are always whole numbers. Use \`int\`, not \`float\`, to avoid floating-point rounding bugs when comparing positions.

## Elite Insight
In production engines, Vec2i is often templated: \`template<typename T> struct Vec2 { T x, y; }\`. You get \`Vec2<int>\`, \`Vec2<float>\`, and \`Vec2<double>\` from one definition. But for a 2D RPG on a grid, \`struct Vec2i\` is all you need.

## Your Task
Define \`Vec2i\` and \`TileType\`. Create two Vec2i positions and compute the Manhattan distance between them.

Expected output:
\`\`\`
Vec2i: (5, 5)
Enemy: (9, 7)
Distance: 6
Types: OK
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// TODO 1: Define struct Vec2i with int x = 0, y = 0;

enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

// TODO 2: Write int manhattan(Vec2i a, Vec2i b)
// Returns abs(a.x - b.x) + abs(a.y - b.y)

int main() {
    // TODO 3: Vec2i player = {5, 5}; Vec2i enemy = {9, 7};
    // TODO 3: cout Vec2i values and manhattan distance
    cout << "Types: OK" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Vec2i {
    int x = 0;
    int y = 0;
};

enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

int manhattan(Vec2i a, Vec2i b) {
    int dx = a.x - b.x; if (dx < 0) dx = -dx;
    int dy = a.y - b.y; if (dy < 0) dy = -dy;
    return dx + dy;
}

int main() {
    Vec2i player = {5, 5};
    Vec2i enemy = {9, 7};
    cout << "Vec2i: (" << player.x << ", " << player.y << ")" << endl;
    cout << "Enemy: (" << enemy.x << ", " << enemy.y << ")" << endl;
    cout << "Distance: " << manhattan(player, enemy) << endl;
    cout << "Types: OK" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Vec2i player position", expectedOutput: "Vec2i: (5, 5)", isPattern: false },
      { id: "t2", description: "Vec2i enemy position", expectedOutput: "Enemy: (9, 7)", isPattern: false },
      { id: "t3", description: "Manhattan distance", expectedOutput: "Distance: 6", isPattern: false },
      { id: "t4", description: "Types verified", expectedOutput: "Types: OK", isPattern: false },
    ],
    hints: [
      "struct Vec2i { int x = 0; int y = 0; }; -- two ints with defaults.",
      "Manhattan distance: abs(a.x - b.x) + abs(a.y - b.y). Player (5,5) to Enemy (9,7) = 4+2 = 6.",
      "Initialize: Vec2i player = {5, 5}; -- brace initialization sets x=5, y=5.",
    ],
    estimatedMinutes: 10
  },
  part2: {
    title: "Build: Types and Coordinates",
    type: "game_builder",
    instructions: `# Build: Types and Coordinates

## Mental Model
Refactor \`struct World\` to use \`Vec2i\` for positions. Replace \`world.player_x/world.player_y\` with \`world.player.x/world.player.y\`. Add \`TileType\` enum so wall checks read as \`TILE_WALL\` instead of \`1\`. Behavior is unchanged.

## Step 1: Add Vec2i and TileType
Above the World struct, add:
\`\`\`cpp
struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };
\`\`\`

## Step 2: Update struct World
Replace the position int pairs with Vec2i:
\`\`\`cpp
struct World {
    Vec2i player = {5, 5};
    Vec2i enemy_pos = {9, 7};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
};
\`\`\`

## Step 3: Update all references
Replace:
- \`world.player_x\` / \`world.player_y\`  ->  \`world.player.x\` / \`world.player.y\`
- \`world.enemy_x\` / \`world.enemy_y\`  ->  \`world.enemy_pos.x\` / \`world.enemy_pos.y\`
- \`tiles[y][x] == 1\`  ->  \`tiles[y][x] == TILE_WALL\`
- \`tiles[y][x] = 1\`  ->  \`tiles[y][x] = TILE_WALL\`

## Step 4: Add startup cout
\`\`\`cpp
cout << "Vec2i: OK" << endl;
\`\`\`

**Click Run now** -- identical behavior to L11, but positions are now typed coordinates.

## Mastery Check
Question: What does \`Vec2i player = {5, 5}\` mean?
Answer: Aggregate initialization -- \`{5, 5}\` sets \`x = 5, y = 5\` in order. No constructor needed.

Expected cout output:
\`\`\`
Player: (5, 5)
Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER
Turn: 0
Enemy: (9, 7)
Struct: world
Vec2i: OK
\`\`\``,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;

// TODO 1: Add struct Vec2i { int x = 0; int y = 0; };
// TODO 2: Add enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    // TODO 3: Replace player_x/player_y with Vec2i player = {5, 5};
    // TODO 3: Replace enemy_x/enemy_y with Vec2i enemy_pos = {9, 7};
    int player_x = 5, player_y = 5;  // replace with Vec2i
    int enemy_x = 9, enemy_y = 7;    // replace with Vec2i
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
};
World world;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        case INTENT_ATTACK: return "ATTACK";
        default: return "NONE";
    }
}

// TODO 4: Update resolveCommand() -- world.player_x -> world.player.x, etc.
void resolveCommand() {
    if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;
    int new_x = world.player_x;
    int new_y = world.player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE; return;
    }
    if (tiles[new_y][new_x] == 1) { pending_intent = INTENT_NONE; return; }
    if (world.enemy_alive && new_x == world.enemy_x && new_y == world.enemy_y) {
        pending_intent = INTENT_ATTACK; return;
    }
    world.player_x = new_x;
    world.player_y = new_y;
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
    if (IsKeyPressed(KEY_W)) pending_intent = INTENT_UP;
    else if (IsKeyPressed(KEY_S)) pending_intent = INTENT_DOWN;
    else if (IsKeyPressed(KEY_A)) pending_intent = INTENT_LEFT;
    else if (IsKeyPressed(KEY_D)) pending_intent = INTENT_RIGHT;
}

void phaseResolve() {
    resolveCommand();
    resolveCombat();
}

// TODO 5: Update phaseWorld() -- world.player_x -> world.player.x, etc.
void phaseWorld() {
    if (!world.enemy_alive) return;
    int dx = world.player_x - world.enemy_x;
    int dy = world.player_y - world.enemy_y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.enemy_x + move_x;
    int ny = world.enemy_y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != 1 && !(nx == world.player_x && ny == world.player_y)) {
        world.enemy_x = nx; world.enemy_y = ny;
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
            tiles[y][x] = (y==0||y==GRID_H-1||x==0||x==GRID_W-1) ? 1 : 0; // TODO: use TILE_WALL
    tiles[3][4] = 1; tiles[3][5] = 1;  // TODO: TILE_WALL
    tiles[6][7] = 1; tiles[6][8] = 1;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    initTiles();

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == 1) wall_count++;  // TODO: TILE_WALL

    cout << "Player: (" << world.player_x << ", " << world.player_y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.enemy_x << ", " << world.enemy_y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
    cout << "Player HP: " << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    cout << "Struct: world" << endl;
    // TODO 6: cout << "Vec2i: OK" << endl;

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
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, c);
            }
        DrawRectangle(world.player_x*TILE, world.player_y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.enemy_x*TILE, world.enemy_y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.player_x, world.player_y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.enemy_x, world.enemy_y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
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

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;

struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
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
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        case INTENT_ATTACK: return "ATTACK";
        default: return "NONE";
    }
}

void resolveCommand() {
    if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;
    int new_x = world.player.x;
    int new_y = world.player.y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
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
    if (IsKeyPressed(KEY_W)) pending_intent = INTENT_UP;
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
        DrawText(TextFormat("Player:(%d,%d)", world.player.x, world.player.y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.enemy_pos.x, world.enemy_pos.y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Prints pipeline order", expectedOutput: "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER", isPattern: false },
      { id: "g3", description: "Struct confirmed", expectedOutput: "Struct: world", isPattern: false },
      { id: "g4", description: "Vec2i confirmed", expectedOutput: "Vec2i: OK", isPattern: false },
      { id: "g5", description: "Player HP shown", expectedOutput: "Player HP: 20/20", isPattern: false },
    ],
    hints: [
      "Add struct Vec2i { int x = 0; int y = 0; }; and enum TileType { TILE_FLOOR=0, TILE_WALL=1 }; before struct World.",
      "In struct World, replace player_x/player_y with Vec2i player = {5, 5}; and enemy_x/enemy_y with Vec2i enemy_pos = {9, 7};",
      "Update every world.player_x to world.player.x and world.enemy_x to world.enemy_pos.x.",
      "Replace tiles[y][x] == 1 with tiles[y][x] == TILE_WALL everywhere, including initTiles().",
    ],
    estimatedMinutes: 18
  }
};
