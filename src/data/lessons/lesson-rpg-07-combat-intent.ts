import { Lesson } from "@/types/lesson";

export const lessonRPG07: Lesson = {
  id: "rpg-07-combat-intent",
  title: "Combat Intent",
  description: "Bump combat: moving into the enemy tile fires INTENT_ATTACK instead of moving. Introduces resolveCombat() as a named resolver in the pipeline.",
  order: 7,
  xpReward: 50,
  tier: "free",
  concepts: ["bump combat", "INTENT_ATTACK", "resolveCombat", "command dispatch"],
  part1: {
    title: "Concept: Combat Intent",
    type: "concept",
    instructions: `# Combat Intent

## Mental Model
In roguelikes, combat is just a failed move. The player tries to step onto an enemy tile -- the engine intercepts that move and converts it into an attack. This is **bump combat**: the same WASD input that moves the player also attacks. No separate button.

## The Key Insight: Combat as Command
Instead of moving, \`resolveCommand()\` detects the enemy tile and flips the pending intent to \`INTENT_ATTACK\`. Then a new resolver, \`resolveCombat()\`, handles that intent:
\`\`\`cpp
// Inside resolveCommand():
if (enemy_alive && new_x == enemy_x && new_y == enemy_y) {
    pending_intent = INTENT_ATTACK;
    return;  // do NOT move the player
}

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    cout << "Attack!" << endl;
    pending_intent = INTENT_NONE;
}

void phaseResolve() {
    resolveCommand();
    resolveCombat();  // handles INTENT_ATTACK if set
}
\`\`\`

## Key Concepts
- \`INTENT_ATTACK = 5\` is a new intent constant alongside MOVE_UP, MOVE_DOWN, etc.
- \`resolveCommand()\` flips intent to ATTACK instead of moving into enemy tile
- \`resolveCombat()\` is a second resolver called by \`phaseResolve()\`
- Damage is zero for now -- L08 adds HP and actual damage values

## Beginner Trap
**Putting combat logic inside \`resolveCommand()\`.** Resolve command handles movement. Combat resolution is a separate concern. Splitting them means you can later skip \`resolveCombat()\` for ranged attacks, stealth, or blocking.

## Elite Insight
Dwarf Fortress, NetHack, and Caves of Qud all use this pattern. The player has no "attack" action -- they just try to move into an occupied tile. The engine decides what happens based on what occupies it (enemy = attack, friendly = swap, item = pick up). The intent pipeline makes this extensible without if-else chains.

## Your Task
Simulate a bump attack. Place the enemy adjacent to the player at (6, 5). Try to move right. Show that the intent flips to ATTACK and \`resolveCombat()\` fires.

Expected output:
\`\`\`
Combat: bump
Player at (5, 5), Enemy at (6, 5)
Attack!
Attack: YES
\`\`\`

## Systems Thinking Connection
The Platformer uses a similar intent/action split — pressing jump sets a flag, but the physics system processes it next frame. Separating "what the player wants" from "what the game does" prevents order-dependent bugs across all genres.`,
    starterCode: `#include <iostream>
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
int player_x = 5, player_y = 5;
int enemy_x = 6, enemy_y = 5;
bool enemy_alive = true;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;
bool pending_attack = false;

void resolveCommand() {
    if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE; return;
    }
    // TODO: Check if target tile has enemy. If so, flip intent to INTENT_ATTACK and return.
    player_x = new_x;
    player_y = new_y;
    pending_intent = INTENT_NONE;
}

// TODO: Write resolveCombat()
// If pending_intent != INTENT_ATTACK, return
// cout << "Attack!" << endl
// Set pending_attack = true, clear pending_intent

int main() {
    cout << "Combat: bump" << endl;
    cout << "Player at (" << player_x << ", " << player_y << "), Enemy at (" << enemy_x << ", " << enemy_y << ")" << endl;
    pending_intent = INTENT_RIGHT;
    resolveCommand();
    // TODO: Call resolveCombat()
    cout << "Attack: " << (pending_attack ? "YES" : "NO") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
int player_x = 5, player_y = 5;
int enemy_x = 6, enemy_y = 5;
bool enemy_alive = true;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;
bool pending_attack = false;

void resolveCommand() {
    if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE; return;
    }
    if (enemy_alive && new_x == enemy_x && new_y == enemy_y) {
        pending_intent = INTENT_ATTACK;
        return;
    }
    player_x = new_x;
    player_y = new_y;
    pending_intent = INTENT_NONE;
}

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    cout << "Attack!" << endl;
    pending_attack = true;
    pending_intent = INTENT_NONE;
}

int main() {
    cout << "Combat: bump" << endl;
    cout << "Player at (" << player_x << ", " << player_y << "), Enemy at (" << enemy_x << ", " << enemy_y << ")" << endl;
    pending_intent = INTENT_RIGHT;
    resolveCommand();
    resolveCombat();
    cout << "Attack: " << (pending_attack ? "YES" : "NO") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Combat system label", expectedOutput: "Combat: bump", isPattern: false },
      { id: "t2", description: "Positions printed", expectedOutput: "Player at (5, 5), Enemy at (6, 5)", isPattern: false },
      { id: "t3", description: "Attack fires", expectedOutput: "Attack!", isPattern: false },
      { id: "t4", description: "Attack confirmed", expectedOutput: "Attack: YES", isPattern: false },
    ],
    hints: [
      "Inside resolveCommand(), after computing new_x/new_y, check: if (enemy_alive && new_x == enemy_x && new_y == enemy_y).",
      "If the check is true, set pending_intent = INTENT_ATTACK and return -- do NOT move the player.",
      "resolveCombat() only fires when pending_intent == INTENT_ATTACK. It prints Attack! then clears the intent.",
    ],
    estimatedMinutes: 10
  },
  part2: {
    title: "Build: Combat Intent",
    type: "game_builder",
    instructions: `# Build: Combat Intent

## Mental Model
Add bump combat to the dungeon. When the player presses WASD toward the enemy tile, the game fires INTENT_ATTACK instead of moving. A new \`resolveCombat()\` function handles it, printing "Attack!" to the console. Damage comes in L08 -- this lesson wires up the command.

## Step 1: Add INTENT_ATTACK
After the existing intent constants, add:
\`\`\`cpp
const int INTENT_ATTACK = 5;
\`\`\`
Also update \`intentName()\` to return "ATTACK" for INTENT_ATTACK.

## Step 2: Modify resolveCommand()
Add a bump-combat check before moving the player:
\`\`\`cpp
// At top of resolveCommand(), skip if already ATTACK intent
if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;

// After bounds and wall checks, before moving:
if (enemy_alive && new_x == enemy_x && new_y == enemy_y) {
    pending_intent = INTENT_ATTACK;
    return;
}
\`\`\`

## Step 3: Write resolveCombat()
\`\`\`cpp
void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    cout << "Attack!" << endl;
    pending_intent = INTENT_NONE;
}
\`\`\`

## Step 4: Update phaseResolve()
\`\`\`cpp
void phaseResolve() {
    resolveCommand();
    resolveCombat();
}
\`\`\`

## Step 5: Add cout
Add to the startup cout block:
\`\`\`cpp
cout << "Combat: bump" << endl;
\`\`\`

**Click Run now** -- walk the player toward the red enemy. When you bump into it, "Attack!" should appear in the console. The player does not move onto the enemy tile.

## Beginner Trap
**Forgetting to guard against \`INTENT_ATTACK\` at the top of \`resolveCommand()\`.** Without this guard, \`resolveCommand()\` tries to process the ATTACK intent as a move direction and gets confused.

## Mastery Check
Question: Why does \`phaseResolve()\` call both \`resolveCommand()\` and \`resolveCombat()\`?
Answer: \`resolveCommand()\` handles movement OR flips to INTENT_ATTACK. After it runs, \`resolveCombat()\` checks if INTENT_ATTACK was set and handles it. One input, two resolvers, clean separation.

Expected cout output:
\`\`\`
Player: (5, 5)
Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER
Turn: 0
Enemy: (9, 7)
Enemies: 1
Combat: bump
\`\`\``,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
const int INTENT_ATTACK = 5;  // TODO 1: added -- attack intent
int pending_intent = INTENT_NONE;
int turn_count = 0;

int enemy_x = 9, enemy_y = 7;
bool enemy_alive = true;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        // TODO 2: Add case INTENT_ATTACK: return "ATTACK";
        default: return "NONE";
    }
}

void resolveCommand() {
    // TODO 3: Guard at top -- if INTENT_NONE or INTENT_ATTACK, return early
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;

    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE;
        return;
    }
    if (tiles[new_y][new_x] == 1) {
        pending_intent = INTENT_NONE;
        return;
    }
    // TODO 4: Bump check -- if enemy_alive and target == enemy pos, flip to INTENT_ATTACK and return

    player_x = new_x;
    player_y = new_y;
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
    // TODO 5: Also call resolveCombat()
}

// TODO 6: Write resolveCombat()
// If pending_intent != INTENT_ATTACK, return
// cout << "Attack!" << endl;
// pending_intent = INTENT_NONE;

void phaseWorld() {
    if (!enemy_alive) return;
    int dx = player_x - enemy_x;
    int dy = player_y - enemy_y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) {
        move_x = (dx > 0) ? 1 : -1;
    } else {
        move_y = (dy > 0) ? 1 : -1;
    }
    int nx = enemy_x + move_x;
    int ny = enemy_y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != 1 &&
        !(nx == player_x && ny == player_y)) {
        enemy_x = nx;
        enemy_y = ny;
    }
}

void phaseCleanup() {
    turn_count++;
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            if (y == 0 || y == GRID_H - 1 || x == 0 || x == GRID_W - 1)
                tiles[y][x] = 1;
            else
                tiles[y][x] = 0;
        }
    }
    tiles[3][4] = 1;
    tiles[3][5] = 1;
    tiles[6][7] = 1;
    tiles[6][8] = 1;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);

    initTiles();

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == 1) wall_count++;

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << turn_count << endl;
    cout << "Enemy: (" << enemy_x << ", " << enemy_y << ")" << endl;
    cout << "Enemies: 1" << endl;
    // TODO 7: cout << "Combat: bump" << endl;

    while (!WindowShouldClose()) {
        phaseInput();
        if (pending_intent != INTENT_NONE) {
            phaseResolve();
            phaseWorld();
            phaseCleanup();
        }

        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < GRID_H; y++) {
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE - 1, TILE - 1, c);
            }
        }
        DrawRectangle(player_x * TILE, player_y * TILE, TILE - 1, TILE - 1, GREEN);
        if (enemy_alive) {
            DrawRectangle(enemy_x * TILE, enemy_y * TILE, TILE - 1, TILE - 1, RED);
        }

        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d, %d)", player_x, player_y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        DrawText(TextFormat("Enemy: (%d, %d)", enemy_x, enemy_y), 400, 120, 16, RED);

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
int player_x = 5, player_y = 5;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;
int turn_count = 0;

int enemy_x = 9, enemy_y = 7;
bool enemy_alive = true;

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
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;

    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE;
        return;
    }
    if (tiles[new_y][new_x] == 1) {
        pending_intent = INTENT_NONE;
        return;
    }
    if (enemy_alive && new_x == enemy_x && new_y == enemy_y) {
        pending_intent = INTENT_ATTACK;
        return;
    }
    player_x = new_x;
    player_y = new_y;
    pending_intent = INTENT_NONE;
}

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    cout << "Attack!" << endl;
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
    if (!enemy_alive) return;
    int dx = player_x - enemy_x;
    int dy = player_y - enemy_y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) {
        move_x = (dx > 0) ? 1 : -1;
    } else {
        move_y = (dy > 0) ? 1 : -1;
    }
    int nx = enemy_x + move_x;
    int ny = enemy_y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != 1 &&
        !(nx == player_x && ny == player_y)) {
        enemy_x = nx;
        enemy_y = ny;
    }
}

void phaseCleanup() {
    turn_count++;
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            if (y == 0 || y == GRID_H - 1 || x == 0 || x == GRID_W - 1)
                tiles[y][x] = 1;
            else
                tiles[y][x] = 0;
        }
    }
    tiles[3][4] = 1;
    tiles[3][5] = 1;
    tiles[6][7] = 1;
    tiles[6][8] = 1;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);

    initTiles();

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == 1) wall_count++;

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << turn_count << endl;
    cout << "Enemy: (" << enemy_x << ", " << enemy_y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;

    while (!WindowShouldClose()) {
        phaseInput();
        if (pending_intent != INTENT_NONE) {
            phaseResolve();
            phaseWorld();
            phaseCleanup();
        }

        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < GRID_H; y++) {
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE - 1, TILE - 1, c);
            }
        }
        DrawRectangle(player_x * TILE, player_y * TILE, TILE - 1, TILE - 1, GREEN);
        if (enemy_alive) {
            DrawRectangle(enemy_x * TILE, enemy_y * TILE, TILE - 1, TILE - 1, RED);
        }

        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d, %d)", player_x, player_y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        DrawText(TextFormat("Enemy: (%d, %d)", enemy_x, enemy_y), 400, 120, 16, RED);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Prints pipeline order", expectedOutput: "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER", isPattern: false },
      { id: "g3", description: "Prints initial turn", expectedOutput: "Turn: 0", isPattern: false },
      { id: "g4", description: "Prints enemy position", expectedOutput: "Enemy: (9, 7)", isPattern: false },
      { id: "g5", description: "Combat system active", expectedOutput: "Combat: bump", isPattern: false },
    ],
    hints: [
      "Add const int INTENT_ATTACK = 5; after INTENT_RIGHT. Add case INTENT_ATTACK: return \"ATTACK\"; to intentName().",
      "After wall checks in resolveCommand(), add: if (enemy_alive && new_x == enemy_x && new_y == enemy_y) { pending_intent = INTENT_ATTACK; return; }",
      "resolveCombat() is called from phaseResolve() after resolveCommand(). It only fires when pending_intent == INTENT_ATTACK.",
    ],
    estimatedMinutes: 14
  }
};
