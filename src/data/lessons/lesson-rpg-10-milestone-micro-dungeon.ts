import { Lesson } from "@/types/lesson";

export const lessonRPG10: Lesson = {
  id: "rpg-10-milestone-micro-dungeon",
  title: "Milestone: Micro Dungeon",
  description: "Milestone: the full turn pipeline is wired up. Move, chase, fight, kill. Add a kills counter to confirm the architecture works end to end.",
  order: 10,
  xpReward: 100,
  tier: "free",
  concepts: ["milestone", "kills counter", "complete pipeline", "architecture verification"],
  part1: {
    title: "Concept: Complete Turn Pipeline",
    type: "concept",
    instructions: `# Milestone: Micro Dungeon

## What You Built (L06-L09)
You now have a complete turn-based combat loop:
- **INPUT**: Player presses WASD
- **RESOLVE**: \`resolveCommand()\` moves or flips to INTENT_ATTACK. \`resolveCombat()\` applies damage.
- **WORLD**: \`phaseWorld()\` moves the enemy one step toward player.
- **CLEANUP**: \`phaseCleanup()\` removes dead entities, increments turns.
- **RENDER**: Draw tiles, player, enemy, HUD.

## This Lesson: Kills Counter
One addition: a \`kills\` counter. When the enemy dies in \`phaseCleanup()\`, increment kills. This proves the full pipeline is observable from outside -- a number goes up when combat succeeds.
\`\`\`cpp
int kills = 0;

void phaseCleanup() {
    if (enemy_alive && enemy_hp <= 0) {
        enemy_alive = false;
        kills++;
        cout << "Kill confirmed" << endl;
        cout << "Kills: " << kills << endl;
    }
    turn_count++;
}
\`\`\`

## Key Concepts
- \`kills\` is a single integer that accumulates over the session
- The kill is confirmed in CLEANUP, not RESOLVE -- consistent with deferred removal
- This counter can drive future systems: level up, unlock new areas, track difficulty

## Architecture Summary
The five-phase pipeline (INPUT, RESOLVE, WORLD, CLEANUP, RENDER) is now complete. Every subsequent lesson adds to one or more phases without restructuring the loop. This is the architecture that scales to 100 lessons.

## Your Task
Add \`kills\` counter. Update \`phaseCleanup()\` to increment it on death. Simulate a fatal attack sequence and show the full pipeline output.

Expected output:
\`\`\`
Milestone: micro-dungeon
Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER
Kill confirmed
Kills: 1
Turn: 1
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int enemy_hp = 3;
int enemy_max_hp = 10;
bool enemy_alive = true;
int turn_count = 0;
// TODO 1: Add kills = 0

const int INTENT_NONE = 0;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_ATTACK;

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    enemy_hp -= dmg;
    pending_intent = INTENT_NONE;
}

void phaseCleanup() {
    if (enemy_alive && enemy_hp <= 0) {
        enemy_alive = false;
        // TODO 2: kills++; cout "Kill confirmed" and "Kills: " + kills
    }
    turn_count++;
}

int main() {
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    resolveCombat();
    phaseCleanup();
    cout << "Turn: " << turn_count << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int enemy_hp = 3;
int enemy_max_hp = 10;
bool enemy_alive = true;
int turn_count = 0;
int kills = 0;

const int INTENT_NONE = 0;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_ATTACK;

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    enemy_hp -= dmg;
    pending_intent = INTENT_NONE;
}

void phaseCleanup() {
    if (enemy_alive && enemy_hp <= 0) {
        enemy_alive = false;
        kills++;
        cout << "Kill confirmed" << endl;
        cout << "Kills: " << kills << endl;
    }
    turn_count++;
}

int main() {
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    resolveCombat();
    phaseCleanup();
    cout << "Turn: " << turn_count << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Milestone marker", expectedOutput: "Milestone: micro-dungeon", isPattern: false },
      { id: "t2", description: "All phases listed", expectedOutput: "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER", isPattern: false },
      { id: "t3", description: "Kill confirmed", expectedOutput: "Kill confirmed", isPattern: false },
      { id: "t4", description: "Kills counter at 1", expectedOutput: "Kills: 1", isPattern: false },
      { id: "t5", description: "Turn incremented", expectedOutput: "Turn: 1", isPattern: false },
    ],
    hints: [
      "Add int kills = 0; at file scope alongside turn_count.",
      "In phaseCleanup(), after setting enemy_alive = false: kills++; cout \"Kill confirmed\" and \"Kills: \" + kills.",
      "The pipeline phrase needs WORLD in it: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER.",
    ],
    estimatedMinutes: 10
  },
  part2: {
    title: "Build: Milestone - Micro Dungeon",
    type: "game_builder",
    instructions: `# Build: Milestone - Micro Dungeon

## What to Build
Add a \`kills\` counter to the game. When the enemy dies, increment it. Display kills in the HUD and startup cout. This milestone confirms the full L06-L09 pipeline works together.

## Step 1: Add kills counter
\`\`\`cpp
int kills = 0;
\`\`\`
Add this at file scope alongside \`turn_count\`.

## Step 2: Update phaseCleanup()
Add kills increment alongside the death announcement:
\`\`\`cpp
void phaseCleanup() {
    if (enemy_alive && enemy_hp <= 0) {
        enemy_alive = false;
        kills++;
        cout << "Kill confirmed" << endl;
    }
    turn_count++;
}
\`\`\`

## Step 3: Add to startup cout
\`\`\`cpp
cout << "Milestone: micro-dungeon" << endl;
cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
\`\`\`

## Step 4: Add kills to HUD
\`\`\`cpp
DrawText(TextFormat("Kills: %d", kills), 400, 180, 16, YELLOW);
\`\`\`

**Click Run now** -- walk to the enemy and bump it 4 times. Watch the console: Damage, Enemy HP, Damage, Enemy HP, Damage, Enemy HP, Damage, Enemy HP 0/10... then "Kill confirmed". The enemy disappears and the YELLOW Kills counter in the HUD jumps to 1.

## Milestone Complete
You now have a working micro-dungeon with:
- Turn-based movement (WASD)
- Chase AI (\`phaseWorld()\`)
- Bump combat (INTENT_ATTACK)
- Damage resolution (HP decrement)
- Deferred removal (death in CLEANUP)
- Kill tracking (\`kills\` counter)

The next five lessons (L11-L15) refactor this into cleaner data structures without changing the behavior. The architecture is proven -- now we clean it up.

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
// TODO 1: Add int kills = 0;

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
        // TODO 2: kills++; cout "Kill confirmed"
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
    // TODO 3: cout "Milestone: micro-dungeon" and "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER"

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
        // TODO 4: DrawText(TextFormat("Kills: %d", kills), 400, 180, 16, YELLOW)

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
int kills = 0;

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
        kills++;
        cout << "Kill confirmed" << endl;
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
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;

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
        DrawText(TextFormat("Kills: %d", kills), 400, 180, 16, YELLOW);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Prints initial turn", expectedOutput: "Turn: 0", isPattern: false },
      { id: "g3", description: "Milestone marker", expectedOutput: "Milestone: micro-dungeon", isPattern: false },
      { id: "g4", description: "Full pipeline listed", expectedOutput: "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER", isPattern: false },
      { id: "g5", description: "Player HP shown", expectedOutput: "Player HP: 20/20", isPattern: false },
    ],
    hints: [
      "Add int kills = 0; at file scope alongside turn_count.",
      "In phaseCleanup(), after setting enemy_alive = false, add: kills++; cout \"Kill confirmed\" << endl;",
      "Add the two milestone cout lines to the startup block. Note WORLD is now in the phases list.",
      "Add DrawText(TextFormat(\"Kills: %d\", kills), 400, 180, 16, YELLOW); to the HUD.",
    ],
    estimatedMinutes: 12
  }
};
