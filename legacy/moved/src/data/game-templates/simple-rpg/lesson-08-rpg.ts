import type { GameLessonVariant } from "@/types/game";

export const lesson08RPG: GameLessonVariant = {
  lessonId: "rpg-08-death",

  instructions: `# Enemy Death — State Drives the World

## Mental Model

State transition. Alive becomes dead. The entity disappears from the world. State drives rendering. If not alive, don't draw. That is entity lifecycle.

A boolean flag -- \\\`bool alive = true\\\` -- captures the enemy's life state. When HP reaches zero, \\\`alive\\\` becomes false. The grid renderer checks \\\`alive\\\` before placing \\\`E\\\`. If false, it places \\\`.\\\` instead. The enemy vanishes. The world reflects the state.

## What Breaks Without This

Without the alive flag, dead enemies haunt the grid forever. HP is 0 but the \\\`E\\\` still renders. The player can interact with a ghost. State and display are desynced. The screen shows a lie. Every frame the player sees wrong information. The alive flag is the source of truth. The renderer reads the truth.

## The Fix

Three things:
1. Declare \\\`bool alive = true;\\\` alongside \\\`enemyHp\\\`.
2. After each attack: \\\`if (enemyHp <= 0) { alive = false; }\\\`
3. In the renderer: \\\`if (row == enemyY && col == enemyX && alive) { line += 'E'; }\\\`

The alive flag connects damage to display. Without it, those two systems are disconnected. With it, every attack that kills the enemy automatically removes it from the next frame.

## Pattern Insight

There is a pattern here: state drives rendering. This is the core insight of every entity system. State first. Display second. Never the other way around. The renderer is a read-only consumer of state. It never writes. It only reads and outputs. Your alive flag is a piece of state. Your grid renderer is the consumer. Keep them separated and the system stays clean.

## Scalability Insight

Right now alive is a bool: true or false. The next step is a state enum: \\\`ALIVE\\\`, \\\`DYING\\\`, \\\`DEAD\\\`. \\\`DYING\\\` triggers a death animation (multiple frames before removal). \\\`DEAD\\\` means fully removed. The renderer checks the enum and draws differently for each state. Your bool is the simplest version of that enum. The pattern is identical. The complexity scales up, the concept stays constant.

## Your Task

Enemy at (10,3) with HP 30. Player at (10,4). Attack 3 times with 10 damage each. Re-render the full grid after each attack. Print:
- After attack 1: grid with E, \\\`GAME_MESSAGE|Hit! Enemy HP: 20\\\`
- After attack 2: grid with E, \\\`GAME_MESSAGE|Hit! Enemy HP: 10\\\`
- After attack 3: grid without E (alive=false), \\\`GAME_MESSAGE|Enemy slain!\\\`, \\\`SCORE|100\\\`
- Final line: \\\`GAME_MESSAGE|The dungeon grows quiet.\\\`

## Common Mistake (Beginner Trap)

Printing the enemy's death message every frame after it dies, not just at the transition. The death message is a transition event. It should print once -- when \\\`alive\\\` goes from true to false. Use a guard: \\\`if (enemyHp <= 0 && alive) { alive = false; /* print death message */ }\\\`. The \\\`&& alive\\\` check ensures it fires exactly once.

## Elite Insight (Zelda/Skyrim/Diablo)

Diablo's entity system: each monster has an \\\`isDead\\\` flag. When it flips to true, the death animation plays, loot spawns, and the monster is removed from the active entity list. The update loop skips dead entities. The render loop skips dead entities. Your \\\`alive\\\` flag is that \\\`isDead\\\` flag inverted. Same concept. Skyrim's Actor system has \\\`Actor::IsDead()\\\` -- it returns true when the actor's \\\`Health\\\` ActorValue hits zero. Same pattern. Universal.

## Pattern Recognition

Entity lifecycle management appears in every engine: Unity \\\`SetActive(false)\\\`, Unreal \\\`Actor.Destroy()\\\`, Godot \\\`queue_free()\\\`. The pattern: detect death condition, set state, exclude from update, exclude from render. Your manual alive-flag system is the underlying concept that all of these automate. Learn the concept and the APIs become obvious.

## Skill Reinforcement

- Extract grid rendering into a function: \\\`void printGrid(int px, int py, int ex, int ey, bool alive)\\\`
- The alive parameter controls whether E or . appears at the enemy position
- Re-render after every state change -- the player needs visual feedback each turn
- \\\`SCORE|100\\\` prints once at the death event, not at the end of the program

## Mastery Check

Why is \\\`bool alive\\\` better than checking \\\`enemyHp <= 0\\\` everywhere? Because HP is a number. Alive is a semantic. You might have a boss that at zero HP enters a second phase and gains HP again. Or a zombie that resurrects. If you check HP directly, every conditional breaks. If you check \\\`alive\\\`, nothing breaks -- you just update the alive flag at the right moments. State semantics should be explicit. Name them. That is why \\\`alive\\\` exists as a separate variable.`,

  starterCode: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

int attack(int damage, int targetHp) {
    int hp = targetHp - damage;
    if (hp < 0) hp = 0;
    return hp;
}

bool isAdjacent(int px, int py, int ex, int ey) {
    return abs(px - ex) <= 1 && abs(py - ey) <= 1;
}

// TODO: Write printGrid(int playerX, int playerY, int enemyX, int enemyY, bool alive)
// Renders the 20x10 grid. @ at player. E at enemy if alive. . if not alive.

int main() {
    int playerX = 10, playerY = 4;
    int playerHp = 30, playerGold = 0;
    int enemyX = 10, enemyY = 3;
    int enemyHp = 30;
    bool alive = true;
    int score = 0;

    // TODO: Attack 3 times. After each:
    //   - Check if enemy just died (enemyHp <= 0 && alive)
    //   - If dying: alive=false, score+=100, printGrid, GAME_MESSAGE|Enemy slain!, SCORE|score
    //   - If still alive: printGrid, GAME_MESSAGE|Hit! Enemy HP: <hp>

    // TODO: Print GAME_MESSAGE|The dungeon grows quiet.

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

int attack(int damage, int targetHp) {
    int hp = targetHp - damage;
    if (hp < 0) hp = 0;
    return hp;
}

bool isAdjacent(int px, int py, int ex, int ey) {
    return abs(px - ex) <= 1 && abs(py - ey) <= 1;
}

void printGrid(int playerX, int playerY, int enemyX, int enemyY, bool alive) {
    cout << "####################" << endl;
    for (int row = 1; row <= 8; row++) {
        string line = "";
        for (int col = 0; col < 20; col++) {
            if (col == 0 || col == 19) {
                line += '#';
            } else if (row == playerY && col == playerX) {
                line += '@';
            } else if (row == enemyY && col == enemyX && alive) {
                line += 'E';
            } else {
                line += '.';
            }
        }
        cout << line << endl;
    }
    cout << "####################" << endl;
}

int main() {
    int playerX = 10, playerY = 4;
    int playerHp = 30, playerGold = 0;
    int enemyX = 10, enemyY = 3;
    int enemyHp = 30;
    bool alive = true;
    int score = 0;

    for (int i = 0; i < 3; i++) {
        enemyHp = attack(10, enemyHp);

        if (enemyHp <= 0 && alive) {
            alive = false;
            score += 100;
            printGrid(playerX, playerY, enemyX, enemyY, alive);
            cout << "GAME_MESSAGE|Enemy slain!" << endl;
            cout << "SCORE|" << score << endl;
        } else {
            printGrid(playerX, playerY, enemyX, enemyY, alive);
            cout << "GAME_MESSAGE|Hit! Enemy HP: " << enemyHp << endl;
        }
    }

    cout << "GAME_MESSAGE|The dungeon grows quiet." << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "First hit shows enemy HP at 20 in the game message",
      expectedOutput: "GAME_MESSAGE\\|Hit! Enemy HP: 20",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Second hit shows enemy HP at 10 in the game message",
      expectedOutput: "GAME_MESSAGE\\|Hit! Enemy HP: 10",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Enemy slain message appears when HP hits 0",
      expectedOutput: "GAME_MESSAGE\\|Enemy slain!",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Score of 100 is awarded and output on enemy death",
      expectedOutput: "SCORE\\|100",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Final game message confirms the dungeon grows quiet",
      expectedOutput: "GAME_MESSAGE\\|The dungeon grows quiet\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Write `printGrid` as a function above `main` -- it keeps the loop body clean and readable.",
    "Guard the death logic: `if (enemyHp <= 0 && alive)` -- the `&& alive` prevents re-triggering on subsequent frames.",
    "Call `printGrid(playerX, playerY, enemyX, enemyY, alive)` after updating `alive` so the final render shows no E.",
    "Print `GAME_MESSAGE|The dungeon grows quiet.` outside and after the loop -- it is the closing line, not part of the turn.",
  ],

  accumulatedCode: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

// --- Combat system ---
int attack(int damage, int targetHp) {
    int hp = targetHp - damage;
    if (hp < 0) hp = 0;
    return hp;
}

// --- Range system ---
bool isAdjacent(int px, int py, int ex, int ey) {
    return abs(px - ex) <= 1 && abs(py - ey) <= 1;
}

// --- Grid renderer (state-driven) ---
void printGrid(int playerX, int playerY, int enemyX, int enemyY, bool alive) {
    cout << "####################" << endl;
    for (int row = 1; row <= 8; row++) {
        string line = "";
        for (int col = 0; col < 20; col++) {
            if (col == 0 || col == 19) {
                line += '#';
            } else if (row == playerY && col == playerX) {
                line += '@';
            } else if (row == enemyY && col == enemyX && alive) {
                line += 'E';
            } else {
                line += '.';
            }
        }
        cout << line << endl;
    }
    cout << "####################" << endl;
}

int main() {
    // --- Player state ---
    int playerX = 10, playerY = 4;
    int playerHp = 30, playerGold = 0;

    // --- Enemy state (with lifecycle flag) ---
    int enemyX = 10, enemyY = 3;
    int enemyHp = 30;
    bool alive = true;

    // --- Score ---
    int score = 0;

    // --- Combat loop ---
    for (int i = 0; i < 3; i++) {
        if (isAdjacent(playerX, playerY, enemyX, enemyY)) {
            enemyHp = attack(10, enemyHp);
        }

        if (enemyHp <= 0 && alive) {
            alive = false;
            score += 100;
            printGrid(playerX, playerY, enemyX, enemyY, alive);
            cout << "GAME_MESSAGE|Enemy slain!" << endl;
            cout << "SCORE|" << score << endl;
        } else if (alive) {
            printGrid(playerX, playerY, enemyX, enemyY, alive);
            cout << "GAME_MESSAGE|Hit! Enemy HP: " << enemyHp << endl;
        }
    }

    cout << "GAME_MESSAGE|The dungeon grows quiet." << endl;
    cout << "HUD|HP:" << playerHp << "|GOLD:" << playerGold << endl;

    return 0;
}
`,
};
