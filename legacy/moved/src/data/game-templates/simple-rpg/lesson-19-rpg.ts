import type { GameLessonVariant } from "@/types/game";

export const lesson19RPG: GameLessonVariant = {
  lessonId: "rpg-19-states",

  instructions: `# Game States — State Machine

## Mental Model

The State pattern. Each state is explicit. Transitions are documented. No spaghetti. No implicit state.

One enum. One variable. One truth about what the game is doing right now. Every system in the game asks that one variable before it runs. MENU? Draw the title screen. Nothing else. PLAYING? Run combat, AI, physics, input. PAUSED? Draw the pause overlay. Suspend everything else. The state machine is the game loop's nervous system.

Before the state machine: scattered booleans. \\\`bool paused = false; bool inMenu = true; bool combatActive = false;\\\` Three flags. Eight possible combinations. Most of them invalid — you never intended \\\`paused && !inMenu && !combatActive\\\`. The state machine collapses eight combinations into three named, valid states. Impossible states become unrepresentable. That is the pattern's real power.

## What Breaks Without This

Pick any multiplayer game with a pause feature. In an early build: the enemy AI keeps processing while the pause menu is open. The player is taking damage through the menu. That is the classic multi-flag bug: \\\`paused = true\\\` was set, but the AI update code only checks \\\`!inCutscene\\\` and runs anyway. With a state machine: AI update begins with \\\`if (state != PLAYING) return;\\\`. One check. All states covered. The bug cannot exist.

## The Fix

Enum defines the states. One variable holds current state. Systems gate on it:

\\\`\\\`\\\`cpp
enum GameState { MENU, PLAYING, PAUSED };
GameState state = MENU;

// Transition documented at call site
state = PLAYING;
cout << "STATE|PLAYING" << endl;

// Systems gate themselves
if (state == PLAYING) {
    runCombat();
    runAI();
    runPhysics();
}

if (state == PAUSED) {
    // Nothing runs. Intentionally.
    cout << "SYSTEMS|[SUSPENDED]" << endl;
}
\\\`\\\`\\\`

The comment "Nothing runs. Intentionally." is documentation. It tells the next developer: this is correct behavior, not forgotten code. Explicit state machines produce code that explains itself.

## Pattern Insight

Unity's Animator is a visual state machine. Each animation is a state (IDLE, RUN, JUMP, ATTACK). Transitions between states are defined with conditions (speed > 0.1 → IDLE to RUN). The Animator is just a state machine with a graphical interface painted on top. Your \\\`GameState\\\` enum is the underlying data structure. The visual interface is a rendering layer. The logic is identical.

## Scalability Insight

The flat enum becomes a stack. Push states to enter them, pop to return. Push PAUSED over PLAYING — when you pop PAUSED, PLAYING resumes underneath. This is the State Stack pattern, used by every game for layered UI: gameplay → inventory → pause → settings. Each layer is a state. Each push is documented. Each pop restores the layer beneath. Your two-line \\\`state = PAUSED\\\` assignment becomes \\\`stateStack.push(PAUSED)\\\`. The concept scales linearly.

## Your Task

Four-frame state machine with real enum and gated systems:

**Frame 1 (MENU):** Print \\\`STATE|MENU\\\`, \\\`=== DUNGEON RPG ===\\\`, \\\`Press ENTER to start\\\`.

**Transition to PLAYING:** Print \\\`STATE|PLAYING\\\`.

**Frame 2 (PLAYING):** Render 20x10 grid: player \\\`@\\\` at (10,5), enemy \\\`E\\\` at (10,3). Run one combat tick (10 dmg: HP 30→20). Print \\\`HUD|HP:100|ENEMY_HP:20\\\`.

**Transition to PAUSED:** Print \\\`STATE|PAUSED\\\`.

**Frame 3 (PAUSED):** Print \\\`PAUSED\\\`, \\\`SYSTEMS|[SUSPENDED]\\\`, \\\`HUD|HP:100|ENEMY_HP:20\\\`.

**Transition back to PLAYING:** Print \\\`STATE|PLAYING\\\`.

**Frame 4 (PLAYING resumed):** Render same grid. Print \\\`HUD|HP:100|ENEMY_HP:20\\\`.

**Final:** Print \\\`GAME_MESSAGE|State machine controls flow\\\`.

## Common Mistake (Beginner Trap)

Running frame logic without checking the state. If frame 3 (PAUSED) runs combat code unconditionally, the enemy HP changes during pause. The state machine exists precisely to prevent this. Every system that runs in PLAYING and must not run in PAUSED must be gated with \\\`if (state == PLAYING)\\\`. No exceptions. Ungated code is implicit state. Implicit state is bugs.

## Elite Insight (Skyrim, Diablo, Zelda)

Diablo III's UI system is a state machine with seventeen states: gameplay, main menu, character select, loading screen, cutscene, dialogue, world map, loot bag, stash, shop, skill screen, passive screen, profile, achievements, social panel, options, and credits. Each state defines which UI panels are visible and which are hidden. Each transition is logged for analytics. The state machine is the source of truth for the entire UI layer. Your three-state machine is the same architecture at lesson scale.

## Pattern Recognition

You have implemented the State pattern. Here is the inventory of where it appears in your career ahead: enemy AI behavior (PATROL → CHASE → ATTACK → DEAD), UI navigation (button: NORMAL → FOCUSED → PRESSED → DISABLED), network connection (IDLE → CONNECTING → CONNECTED → DISCONNECTING → ERROR), physics bodies (DYNAMIC → KINEMATIC → STATIC → TRIGGER), save system checkpoints (UNSAVED → SAVING → SAVED → DIRTY), and animation layers (IDLE → BLEND → OVERRIDE). One pattern. Hundreds of applications. You know it now.

## Skill Reinforcement

- Enum: names instead of magic integers — \\\`PAUSED\\\` not \\\`2\\\`
- Single state variable: one source of truth for the entire game loop
- Gated systems: \\\`if (state == PLAYING)\\\` before every system that must not run in other states
- Documented transitions: print the new state at the transition site

## Mastery Check

What is the difference between a state machine and nested if-else trees? The state machine expresses all valid states and transitions explicitly. Invalid combinations are unrepresentable. The if-else tree expresses the complete boolean combination space — most of it invalid. As states grow, the if-else tree grows exponentially (2^n combinations). The state machine grows linearly (n states). At three states they look similar. At thirty states the difference is the difference between a maintainable system and an unmaintainable one.`,

  starterCode: `#include <iostream>
using namespace std;

enum GameState { MENU, PLAYING, PAUSED };

void renderGrid(int px, int py, int ex, int ey, bool alive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (alive && col == ex && row == ey) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    GameState state = MENU;
    int playerX = 10, playerY = 5, playerHP = 100;
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;

    // === FRAME 1: MENU ===
    // Print STATE|MENU, === DUNGEON RPG ===, Press ENTER to start

    // Transition to PLAYING (print STATE|PLAYING)

    // === FRAME 2: PLAYING ===
    // if (state == PLAYING): renderGrid, combat tick, HUD

    // Transition to PAUSED (print STATE|PAUSED)

    // === FRAME 3: PAUSED ===
    // if (state == PAUSED): PAUSED, SYSTEMS|[SUSPENDED], HUD

    // Transition back to PLAYING (print STATE|PLAYING)

    // === FRAME 4: PLAYING resumed ===
    // if (state == PLAYING): renderGrid, HUD

    // GAME_MESSAGE|State machine controls flow

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

enum GameState { MENU, PLAYING, PAUSED };

void renderGrid(int px, int py, int ex, int ey, bool alive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (alive && col == ex && row == ey) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    GameState state = MENU;
    int playerX = 10, playerY = 5, playerHP = 100;
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;

    // === FRAME 1: MENU ===
    cout << "STATE|MENU" << endl;
    cout << "=== DUNGEON RPG ===" << endl;
    cout << "Press ENTER to start" << endl;

    // Transition: MENU -> PLAYING
    state = PLAYING;
    cout << "STATE|PLAYING" << endl;

    // === FRAME 2: PLAYING ===
    if (state == PLAYING) {
        renderGrid(playerX, playerY, enemyX, enemyY, enemyAlive);
        enemyHP -= 10; // one combat tick
        cout << "HUD|HP:" << playerHP << "|ENEMY_HP:" << enemyHP << endl;
    }

    // Transition: PLAYING -> PAUSED
    state = PAUSED;
    cout << "STATE|PAUSED" << endl;

    // === FRAME 3: PAUSED ===
    if (state == PAUSED) {
        cout << "PAUSED" << endl;
        cout << "SYSTEMS|[SUSPENDED]" << endl;
        cout << "HUD|HP:" << playerHP << "|ENEMY_HP:" << enemyHP << endl;
    }

    // Transition: PAUSED -> PLAYING
    state = PLAYING;
    cout << "STATE|PLAYING" << endl;

    // === FRAME 4: PLAYING resumed ===
    if (state == PLAYING) {
        renderGrid(playerX, playerY, enemyX, enemyY, enemyAlive);
        cout << "HUD|HP:" << playerHP << "|ENEMY_HP:" << enemyHP << endl;
    }

    cout << "GAME_MESSAGE|State machine controls flow" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "MENU frame prints the game title — === DUNGEON RPG ===",
      expectedOutput: "=== DUNGEON RPG ===",
      isPattern: true,
    },
    {
      id: "g2",
      description: "MENU frame prints start prompt — Press ENTER to start",
      expectedOutput: "Press ENTER to start",
      isPattern: true,
    },
    {
      id: "g3",
      description: "PLAYING frame renders grid with enemy E at row 3 column 10",
      expectedOutput: "#\\.{9}E\\.{9}#",
      isPattern: true,
    },
    {
      id: "g4",
      description: "HUD shows ENEMY_HP:20 after one 10-damage combat tick",
      expectedOutput: "HUD\\|HP:100\\|ENEMY_HP:20",
      isPattern: true,
    },
    {
      id: "g5",
      description: "PAUSED frame prints SYSTEMS|[SUSPENDED] — systems gated by state",
      expectedOutput: "SYSTEMS\\|\\[SUSPENDED\\]",
      isPattern: true,
    },
    {
      id: "g6",
      description: "GAME_MESSAGE announces state machine controls game flow",
      expectedOutput: "GAME_MESSAGE\\|State machine controls flow",
      isPattern: true,
    },
  ],

  hints: [
    "Declare \\\`enum GameState { MENU, PLAYING, PAUSED };\\\` before main. Declare \\\`GameState state = MENU;\\\` at the top of main.",
    "Print \\\`STATE|PLAYING\\\` immediately after \\\`state = PLAYING;\\\`. Same for PAUSED. The transition print comes right after the assignment.",
    "Wrap frame 2 and frame 4 logic in \\\`if (state == PLAYING) { ... }\\\`. Wrap frame 3 logic in \\\`if (state == PAUSED) { ... }\\\`. The state machine enforces which code runs.",
    "One combat tick in frame 2: \\\`enemyHP -= 10;\\\`. No tick in frame 3 (PAUSED gated). No tick in frame 4 (resumed but no additional attack). Enemy HP stays at 20 for frames 3 and 4.",
    "Frame 4 renders the same grid as frame 2 — enemy still alive, same position, HP just lower. The grid does not show HP, only position and alive status.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — Lessons 1-19
// State Machine + Save + Free List
// ==============================

// === GAME STATE MACHINE ===
// Enum defines all valid states. One variable holds current state.
// Systems gate on state before running.
// Invalid state combinations are unrepresentable.

enum GameState { MENU, PLAYING, PAUSED };

// === SAVE SYSTEM (from Lesson 18) ===
void saveGame(int wave, int score, int hp, int gold) {
    cout << "SAVE|wave=" << wave << endl;
    cout << "SAVE|score=" << score << endl;
    cout << "SAVE|hp=" << hp << endl;
    cout << "SAVE|gold=" << gold << endl;
}

void loadGame(int& wave, int& score, int& hp, int& gold) {
    // Simulation: restore known saved values
    cout << "LOAD|wave=" << wave << endl;
    cout << "LOAD|score=" << score << endl;
    cout << "LOAD|hp=" << hp << endl;
    cout << "LOAD|gold=" << gold << endl;
}

// === FREE LIST POOL (from Lesson 17) ===
const int MAX_ENEMIES = 8;
bool alive[MAX_ENEMIES];
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int enemyHP_pool[MAX_ENEMIES];
int freeList[MAX_ENEMIES];
int freeTop = 0, nextId = 0;

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

int spawnEnemy(int x, int y, int hp = 30) {
    int id = (freeTop > 0) ? freeList[--freeTop] : nextId++;
    alive[id] = true; ex[id] = x; ey[id] = y; enemyHP_pool[id] = hp;
    return id;
}

void despawnEnemy(int id) {
    alive[id] = false;
    freeList[freeTop++] = id;
}

// === GRID RENDER ===
// Renders 20x10 dungeon. Reads entity state directly.
void renderGrid(int px, int py) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else {
                char cell = '.';
                for (int i = 0; i < MAX_ENEMIES; i++) {
                    if (alive[i] && ex[i] == col && ey[i] == row) {
                        cell = 'E'; break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }
}

int main() {
    GameState state = MENU;
    int playerX = 10, playerY = 5, playerHP = 100, playerGold = 0;

    // Spawn initial enemy
    int a = spawnEnemy(10, 3, 30);

    // === FRAME 1: MENU ===
    cout << "STATE|MENU" << endl;
    cout << "=== DUNGEON RPG ===" << endl;
    cout << "Press ENTER to start" << endl;

    // Transition: MENU -> PLAYING
    state = PLAYING;
    cout << "STATE|PLAYING" << endl;

    // === FRAME 2: PLAYING ===
    if (state == PLAYING) {
        renderGrid(playerX, playerY);
        enemyHP_pool[a] -= 10;
        if (enemyHP_pool[a] <= 0 && alive[a]) { despawnEnemy(a); playerGold += 25; }
        cout << "HUD|HP:" << playerHP << "|ENEMY_HP:" << enemyHP_pool[a] << endl;
    }

    // Transition: PLAYING -> PAUSED
    state = PAUSED;
    cout << "STATE|PAUSED" << endl;

    // === FRAME 3: PAUSED ===
    if (state == PAUSED) {
        cout << "PAUSED" << endl;
        cout << "SYSTEMS|[SUSPENDED]" << endl;
        cout << "HUD|HP:" << playerHP << "|ENEMY_HP:" << enemyHP_pool[a] << endl;
    }

    // Transition: PAUSED -> PLAYING
    state = PLAYING;
    cout << "STATE|PLAYING" << endl;

    // === FRAME 4: PLAYING resumed ===
    if (state == PLAYING) {
        renderGrid(playerX, playerY);
        cout << "HUD|HP:" << playerHP << "|ENEMY_HP:" << enemyHP_pool[a] << endl;
    }

    cout << "GAME_MESSAGE|State machine controls flow" << endl;

    return 0;
}
`,
};
