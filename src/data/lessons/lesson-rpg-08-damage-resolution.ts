import { Lesson } from "@/types/lesson";

export const lessonRPG08: Lesson = {
  id: "rpg-08-damage-resolution",
  title: "Damage Resolution",
  description: "Add HP to the player and enemy. When combat fires, decrement HP by a damage value. The resolve pass now produces a number.",
  order: 8,
  xpReward: 50,
  tier: "free",
  concepts: ["hit points", "damage values", "resolveCombat", "health state"],
  part1: {
    title: "Concept: Damage Resolution",
    type: "concept",
    instructions: `# Damage Resolution

## Mental Model
Combat intent is wired up (L07). Now give it teeth: when \`resolveCombat()\` fires, decrement the enemy's HP by a damage value. HP state is just two integers per combatant: current and max. Damage is a third integer.

## The Fix: HP State + Damage in resolveCombat()
\`\`\`cpp
int player_hp = 20, player_max_hp = 20;
int enemy_hp = 10, enemy_max_hp = 10;

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
    pending_intent = INTENT_NONE;
}
\`\`\`

## Key Concepts
- HP is two ints: \`current_hp\` and \`max_hp\`. Nothing more complex is needed yet.
- Damage value (3) is a hardcoded constant for now -- randomized values come later
- \`enemy_hp\` can go negative: death checking comes in L09
- The resolve pass produces a number, not just a side effect

## Beginner Trap
**Using float for HP.** Use int. Fractional HP adds complexity with no benefit at this stage. If you need precision later, scale integers (e.g., 100 = 10.0 HP).

## Elite Insight
In real RPG engines, damage involves attack stat, defense stat, randomness, and status effects. But the structure is the same: resolve() computes a damage integer, applies it to HP, logs the result. You can extend this without changing the pipeline.

## Your Task
Add \`player_hp\`, \`player_max_hp\`, \`enemy_hp\`, \`enemy_max_hp\` as globals. Update \`resolveCombat()\` to subtract 3 from enemy_hp and print the result.

Expected output:
\`\`\`
Player HP: 20/20
Enemy HP: 10/10
Damage: 3
Enemy HP: 7/10
Player HP: 20/20
Combat done
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// TODO 1: Add player_hp = 20, player_max_hp = 20
// TODO 1: Add enemy_hp = 10, enemy_max_hp = 10

const int INTENT_NONE = 0;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_ATTACK;  // pre-set to simulate a combat

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    // TODO 2: Subtract dmg from enemy_hp
    // TODO 2: cout << "Damage: " << dmg << endl;
    // TODO 2: cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
    pending_intent = INTENT_NONE;
}

int main() {
    // TODO 3: cout Player HP and Enemy HP before combat
    resolveCombat();
    // TODO 4: cout Player HP after combat
    cout << "Combat done" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int player_hp = 20, player_max_hp = 20;
int enemy_hp = 10, enemy_max_hp = 10;

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

int main() {
    cout << "Player HP: " << player_hp << "/" << player_max_hp << endl;
    cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
    resolveCombat();
    cout << "Player HP: " << player_hp << "/" << player_max_hp << endl;
    cout << "Combat done" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Initial player HP", expectedOutput: "Player HP: 20/20", isPattern: false },
      { id: "t2", description: "Damage dealt", expectedOutput: "Damage: 3", isPattern: false },
      { id: "t3", description: "Enemy HP after hit", expectedOutput: "Enemy HP: 7/10", isPattern: false },
      { id: "t4", description: "Combat concluded", expectedOutput: "Combat done", isPattern: false },
    ],
    hints: [
      "Add int player_hp = 20, player_max_hp = 20; int enemy_hp = 10, enemy_max_hp = 10; at file scope.",
      "In resolveCombat(), after the intent check: enemy_hp -= dmg; then print Damage and Enemy HP.",
      "Print Player HP and Enemy HP before calling resolveCombat(), then Player HP again after.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Damage Resolution",
    type: "game_builder",
    instructions: `# Build: Damage Resolution

## Mental Model
Add HP to the game state. When \`resolveCombat()\` fires, decrement enemy HP by 3. Show HP values in the HUD and startup cout. The enemy can't die yet (that's L09) -- for now HP just goes down.

## Step 1: Add HP State
At file scope (after \`enemy_alive\`):
\`\`\`cpp
int player_hp = 20, player_max_hp = 20;
int enemy_hp = 10, enemy_max_hp = 10;
\`\`\`

## Step 2: Update resolveCombat()
Add damage logic:
\`\`\`cpp
void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
    pending_intent = INTENT_NONE;
}
\`\`\`

## Step 3: Add to startup cout
\`\`\`cpp
cout << "Player HP: " << player_hp << "/" << player_max_hp << endl;
cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
\`\`\`

## Step 4: Add HP to HUD
In the draw section, after existing HUD text:
\`\`\`cpp
DrawText(TextFormat("Player HP: %d/%d", player_hp, player_max_hp), 400, 140, 16, GREEN);
DrawText(TextFormat("Enemy HP: %d/%d", enemy_hp, enemy_max_hp), 400, 160, 16, RED);
\`\`\`

**Click Run now** -- walk the player to the enemy and bump into it. Watch "Attack!" followed by "Damage: 3" and "Enemy HP: 7/10" appear in the console. The HUD also updates.

Keep bumping -- the enemy HP goes down further. It can go below 0 for now. Death detection comes in L09.

## Beginner Trap
**Printing HP inside the game loop every frame.** The cout calls in \`resolveCombat()\` fire once per attack, not every frame. The startup cout fires once on launch. Do not add HP prints inside the while loop draw section.

## Mastery Check
Question: What would you change to make damage variable (1-6 like a dice roll)?
Answer: \`int dmg = rand() % 6 + 1;\` -- but for deterministic testing we keep dmg = 3. Later lessons address randomness.

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

// TODO 1: Add player_hp = 20, player_max_hp = 20
// TODO 1: Add enemy_hp = 10, enemy_max_hp = 10

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
    // TODO 2: int dmg = 3; enemy_hp -= dmg;
    // TODO 2: cout << "Damage: " << dmg << endl;
    // TODO 2: cout << "Enemy HP: " << enemy_hp << "/" << enemy_max_hp << endl;
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
    // TODO 3: cout Player HP and Enemy HP

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
        // TODO 4: DrawText for Player HP and Enemy HP

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
        DrawText(TextFormat("Player HP: %d/%d", player_hp, player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Enemy HP: %d/%d", enemy_hp, enemy_max_hp), 400, 160, 16, RED);

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
      { id: "g5", description: "Prints enemy HP", expectedOutput: "Enemy HP: 10/10", isPattern: false },
    ],
    hints: [
      "Add int player_hp = 20, player_max_hp = 20; int enemy_hp = 10, enemy_max_hp = 10; after enemy_alive.",
      "In resolveCombat(), add: int dmg = 3; enemy_hp -= dmg; cout Damage and Enemy HP lines.",
      "Add the two HP cout lines to the startup block after the Combat: bump line.",
      "Add DrawText for Player HP (GREEN) and Enemy HP (RED) in the HUD section.",
    ],
    estimatedMinutes: 12
  }
};
