import { Lesson } from "@/types/lesson";

export const lessonRPG09: Lesson = {
  id: "rpg-09-death-and-cleanup",
  title: "Death and Cleanup",
  description: "When enemy HP reaches zero, mark it dead in phaseCleanup(). Introduces deferred removal: damage happens in RESOLVE, death confirmation happens in CLEANUP.",
  order: 9,
  xpReward: 50,
  tier: "free",
  concepts: ["deferred removal", "enemy_alive flag", "phaseCleanup", "kill detection"],
  part1: {
    title: "Concept: Death and Cleanup",
    type: "concept",
    instructions: `# Death and Cleanup

## Mental Model
In L08, enemy HP goes below zero but the enemy stays on screen. Now add a death check. The important design question is WHERE: should the check go in \`resolveCombat()\` (RESOLVE phase) or \`phaseCleanup()\` (CLEANUP phase)?

The answer is **CLEANUP**. This is deferred removal: damage is applied in RESOLVE, but removal is confirmed in CLEANUP. Why? Because between RESOLVE and CLEANUP, other systems (like phaseWorld) might still need to reference the entity. If you remove it mid-turn, those systems can read garbage state.

## The Fix: Death Check in phaseCleanup()
\`\`\`cpp
void phaseCleanup() {
    if (enemy_alive && enemy_hp <= 0) {
        enemy_alive = false;
        cout << "Enemy dead" << endl;
    }
    turn_count++;
}
\`\`\`

## Key Concepts
- \`enemy_alive = false\` is the removal flag. The entity data stays in memory -- only the flag changes.
- \`phaseWorld()\` already guards: \`if (!enemy_alive) return;\` -- so the dead enemy stops chasing
- \`resolveCommand()\` already guards: the bump check only triggers if \`enemy_alive\` is true
- Death triggers once: the \`enemy_alive && enemy_hp <= 0\` check prevents double-triggering

## Beginner Trap
**Checking for death inside \`resolveCombat()\` immediately after dealing damage.** This is RESOLVE-phase removal, not deferred. If phaseWorld() runs after RESOLVE, it will try to move a dead enemy. Always defer removal to CLEANUP.

## Elite Insight
This is the same pattern used in Unity's Entity Component System (ECS): mark entities for destruction with a tag, then destroy them in a cleanup pass. Immediate deletion during a loop causes "iterator invalidation" bugs. Deferred deletion is safe.

## Your Task
Simulate a fatal attack. Start \`enemy_hp\` at 3 so one hit of 3 damage kills it. Add death detection to \`phaseCleanup()\`.

Expected output:
\`\`\`
Damage: 3
Enemy HP: 0/10
Enemy dead
Enemies: 0
Kill: hp-to-zero
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int enemy_hp = 3;  // low HP for demo -- one hit kills
int enemy_max_hp = 10;
bool enemy_alive = true;
int turn_count = 0;

const int INTENT_NONE = 0;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_ATTACK;

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
    pending_intent = INTENT_NONE;
}

void phaseCleanup() {
    // TODO: If enemy_alive and enemy_hp <= 0, set enemy_alive = false and cout "Enemy dead"
    turn_count++;
}

int main() {
    resolveCombat();
    phaseCleanup();
    cout << "Enemies: " << (enemy_alive ? 1 : 0) << endl;
    cout << "Kill: hp-to-zero" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int enemy_hp = 3;
int enemy_max_hp = 10;
bool enemy_alive = true;
int turn_count = 0;

const int INTENT_NONE = 0;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_ATTACK;

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
    pending_intent = INTENT_NONE;
}

void phaseCleanup() {
    if (enemy_alive && enemy_hp <= 0) {
        enemy_alive = false;
        cout << "Enemy dead" << endl;
    }
    turn_count++;
}

int main() {
    resolveCombat();
    phaseCleanup();
    cout << "Enemies: " << (enemy_alive ? 1 : 0) << endl;
    cout << "Kill: hp-to-zero" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Damage dealt", expectedOutput: "Damage: 3", isPattern: false },
      { id: "t2", description: "Enemy HP reaches zero", expectedOutput: "Enemy HP: 0/10", isPattern: false },
      { id: "t3", description: "Death announced", expectedOutput: "Enemy dead", isPattern: false },
      { id: "t4", description: "Enemy count reaches zero", expectedOutput: "Enemies: 0", isPattern: false },
      { id: "t5", description: "Kill system active", expectedOutput: "Kill: hp-to-zero", isPattern: false },
    ],
    hints: [
      "The death check goes in phaseCleanup(), NOT in resolveCombat().",
      "Check: if (enemy_alive && enemy_hp <= 0) -- both conditions needed to prevent double-triggering.",
      "Set enemy_alive = false then print Enemy dead.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Death and Cleanup",
    type: "game_builder",
    instructions: `# Build: Death and Cleanup

## Mental Model
Add a death check to \`phaseCleanup()\`. When enemy HP hits zero or below, set \`enemy_alive = false\`. The enemy stops drawing, stops chasing, and can no longer be attacked. This closes the combat loop started in L06.

## Step 1: Update phaseCleanup()
Add the death check before \`turn_count++\`:
\`\`\`cpp
void phaseCleanup() {
    if (enemy_alive && enemy_hp <= 0) {
        enemy_alive = false;
        cout << "Enemy dead" << endl;
    }
    turn_count++;
}
\`\`\`

## Step 2: Add startup cout
Add to the startup cout block:
\`\`\`cpp
cout << "Kill: hp-to-zero" << endl;
\`\`\`

**Click Run now** -- walk to the enemy and bump it 4 times (3 damage x 4 = 12 damage, enough to kill 10 HP). On the killing blow, "Enemy dead" appears in the console. The red square disappears from the grid. The chase stops.

Nothing else needs to change. \`phaseWorld()\` already has \`if (!enemy_alive) return;\` at the top. \`resolveCommand()\` already gates the bump check with \`enemy_alive\`. The deferred removal flag cleanly stops all enemy behavior.

## Beginner Trap
**Setting \`enemy_alive = false\` inside \`resolveCombat()\`.** If you do this, \`phaseWorld()\` runs AFTER RESOLVE and would try to read the now-dead enemy's state. The pipeline order matters: damage in RESOLVE, removal in CLEANUP.

## Elite Insight
For multiple enemies, \`phaseCleanup()\` would loop through all entities and remove any with HP <= 0. The pattern stays the same regardless of entity count. This is why ECS frameworks separate damage application from entity removal: it keeps the game loop deterministic.

## Mastery Check
Question: After the enemy dies, what happens if you try to bump into its old tile?
Answer: Nothing. \`resolveCommand()\` checks \`enemy_alive &&\` before the bump test, so moving into the dead enemy's tile just moves the player normally.

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
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;
int turn_count = 0;

int enemy_x = 9, enemy_y = 7;
bool enemy_alive = true;

int player_hp = 20, player_max_hp = 20;
int enemy_hp = 10, enemy_max_hp = 10;

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
    int dmg = 3;
    enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
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
    // TODO: If enemy_alive and enemy_hp <= 0: set enemy_alive = false, cout "Enemy dead"
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
    cout << "Player HP: " << player_hp << "/" << player_max_hp << endl;
    cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
    // TODO: cout << "Kill: hp-to-zero" << endl;

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
        if (enemy_alive) {
            DrawText(TextFormat("Enemy: (%d, %d)", enemy_x, enemy_y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP: %d/%d", enemy_hp, enemy_max_hp), 400, 160, 16, RED);
        } else {
            DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY);
        }
        DrawText(TextFormat("Player HP: %d/%d", player_hp, player_max_hp), 400, 140, 16, GREEN);

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

int player_hp = 20, player_max_hp = 20;
int enemy_hp = 10, enemy_max_hp = 10;

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
    int dmg = 3;
    enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
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
    if (enemy_alive && enemy_hp <= 0) {
        enemy_alive = false;
        cout << "Enemy dead" << endl;
    }
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
    cout << "Player HP: " << player_hp << "/" << player_max_hp << endl;
    cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;

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
        if (enemy_alive) {
            DrawText(TextFormat("Enemy: (%d, %d)", enemy_x, enemy_y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP: %d/%d", enemy_hp, enemy_max_hp), 400, 160, 16, RED);
        } else {
            DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY);
        }
        DrawText(TextFormat("Player HP: %d/%d", player_hp, player_max_hp), 400, 140, 16, GREEN);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Prints pipeline order", expectedOutput: "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER", isPattern: false },
      { id: "g3", description: "Prints initial turn", expectedOutput: "Turn: 0", isPattern: false },
      { id: "g4", description: "Prints player HP", expectedOutput: "Player HP: 20/20", isPattern: false },
      { id: "g5", description: "Kill system active", expectedOutput: "Kill: hp-to-zero", isPattern: false },
    ],
    hints: [
      "The death check goes in phaseCleanup(), before turn_count++.",
      "if (enemy_alive && enemy_hp <= 0) { enemy_alive = false; cout << \"Enemy dead\" << endl; }",
      "Add cout << \"Kill: hp-to-zero\" << endl; to the startup cout block.",
    ],
    estimatedMinutes: 10
  }
};
