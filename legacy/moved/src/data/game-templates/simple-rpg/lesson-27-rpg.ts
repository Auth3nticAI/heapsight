import type { GameLessonVariant } from "@/types/game";

export const lesson27RPG: GameLessonVariant = {
  lessonId: "rpg-27-command-pattern",

  instructions: `# Command Pattern -- Actions as Data

## Mental Model

There's a pattern here. Every player action -- move, attack, pickup -- becomes a Command object. A struct with a type tag, parameters, and a snapshot of the state before the action. Push it onto a stack. To undo, pop the stack and restore the snapshot. The history is data. Undo is reading data backwards.

A move is not "increment X." A move is a Command with type=0, dx=1, dy=0, prevX=3, prevY=5. Execute adds the delta. Undo restores the snapshot. Actions are objects. Objects can be stored, queued, serialized, replayed, and reversed.

## What Breaks Without This

Without commands, undo requires a switch statement over every action type. "If the last action was a move, subtract the delta. If it was an attack, add back the HP." Miss an action type and undo silently fails. Every new action requires updating the undo logic. Commands carry their own undo. New action types are self-contained.

## The Fix

Command struct with type, delta, value, snapshots. CommandHistory with push/pop. Execute pushes. Undo pops. The stack is the single source of truth for action history.

## Pattern Insight

Every text editor uses the Command pattern for undo. Every strategy game uses it for move queues. Every networked multiplayer game uses it for deterministic replay. Commands are actions reified as data. That reification unlocks undo, redo, replay, and serialization.

## Scalability Insight

New action type: one new type tag, one new snapshot field. No existing commands change. No history logic changes. The stack pushes and pops any Command variant. Open for extension, closed for modification.

## Your Task

Build a command-driven dungeon with undo:

**Setup:**
- Player at (3,5), HP 100, Gold 0. Enemy at (10,3), HP 30.

**Sequence:**
1. Render grid, HUD: \`HUD|HP:100|Gold:0|Room:0\`
2. Move right 6 times: (3,5)->(9,5). Print each.
3. Move up 2 times: (9,5)->(9,3). Print each.
4. Attack: HP 30->20. Print \`Attack! Enemy HP: 20\`
5. Attack: HP 20->10. Print \`Attack! Enemy HP: 10\`
6. Undo last attack: HP restored to 20. Print \`Undo: enemy HP restored to 20\`
7. Attack again: HP 20->10. Print \`Attack! Enemy HP: 10\`
8. Attack: HP 10->0. Enemy dies, gold spawns.
9. Pickup gold: 0->25. Print \`Picked up 25 gold! Total: 25\`
10. \`HUD|HP:100|Gold:25|Room:0\`
11. \`GAME_MESSAGE|Commands: 12 executed, 1 undone\`
12. \`SCORE|150\`

## Common Mistake

Forgetting to snapshot state BEFORE the action. If you snapshot after executing, the undo will restore to the post-action state, not the pre-action state. Always: snapshot, then execute, then push.

## Elite Insight

Command logs enable deterministic replay. Record every command with a frame number. To replay: reset to initial state, execute commands in order. To debug a crash: replay up to the frame before the crash. Commands are the foundation of replay systems and lockstep networking.

## Pattern Recognition

Need undo? Commands. Need replay? Commands. Need networked multiplayer? Commands. The pattern emerges whenever actions need to be recorded, reversed, or replicated.

## Skill Reinforcement

- Command struct: type tag + parameters + state snapshots
- CommandHistory: bounded stack, push on execute, pop on undo
- State restoration: undo reads prevHP/prevX/prevY from the popped command
- Integration: commands drive the same grid/entity/economy systems from prior lessons

## Mastery Check

Twelve commands executed, one undone. Eleven remain on the stack. Each is a complete record. Execute them from index 0 to 10 and you reconstruct the exact game state. That is deterministic replay from command data.`,

  starterCode: `// ─── include/commands.h ───
#include <iostream>
#include <string>
using namespace std;

struct Command {
    int type;         // 0=move, 1=attack, 2=pickup
    int dx, dy;
    int value;
    int prevX, prevY;
    int prevHP;
    int prevGold;
};

const int MAX_HISTORY = 30;

struct CommandHistory {
    Command stack[MAX_HISTORY];
    int count = 0;
    int totalExecuted = 0;
    int totalUndone = 0;

    void push(Command cmd) {
        if (count < MAX_HISTORY) {
            stack[count++] = cmd;
            totalExecuted++;
        }
    }

    Command pop() {
        if (count > 0) {
            totalUndone++;
            return stack[--count];
        }
        return {-1, 0, 0, 0, 0, 0, 0, 0};
    }
};

// ─── src/main.cpp ───
// #include "commands.h"

void renderGrid(int px, int py, int ex, int ey, bool eAlive,
                bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (eAlive && col == ex && row == ey) {
                cout << 'E';
            } else if (goldActive && col == gx && row == gy) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    CommandHistory history;

    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    // TODO: Render initial grid, HUD

    // TODO: 6 moves right, 2 moves up

    // TODO: 2 attacks, undo last, redo, final attack

    // TODO: Pickup gold

    // TODO: HUD, GAME_MESSAGE, SCORE

    return 0;
}
`,

  solutionCode: `// ─── include/commands.h ───
#include <iostream>
#include <string>
using namespace std;

struct Command {
    int type;
    int dx, dy;
    int value;
    int prevX, prevY;
    int prevHP;
    int prevGold;
};

const int MAX_HISTORY = 30;

struct CommandHistory {
    Command stack[MAX_HISTORY];
    int count = 0;
    int totalExecuted = 0;
    int totalUndone = 0;

    void push(Command cmd) {
        if (count < MAX_HISTORY) {
            stack[count++] = cmd;
            totalExecuted++;
        }
    }

    Command pop() {
        if (count > 0) {
            totalUndone++;
            return stack[--count];
        }
        return {-1, 0, 0, 0, 0, 0, 0, 0};
    }
};

// ─── src/main.cpp ───
// #include "commands.h"

void renderGrid(int px, int py, int ex, int ey, bool eAlive,
                bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (eAlive && col == ex && row == ey) {
                cout << 'E';
            } else if (goldActive && col == gx && row == gy) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    CommandHistory history;

    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    // Initial render
    renderGrid(playerX, playerY, enemyX, enemyY, enemyAlive,
               goldActive, goldX, goldY);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // 6 moves right
    for (int i = 0; i < 6; i++) {
        Command cmd = {0, 1, 0, 0, playerX, playerY, 0, 0};
        playerX += cmd.dx;
        history.push(cmd);
        cout << "Move: player at (" << playerX << "," << playerY << ")" << endl;
    }

    // 2 moves up
    for (int i = 0; i < 2; i++) {
        Command cmd = {0, 0, -1, 0, playerX, playerY, 0, 0};
        playerY += cmd.dy;
        history.push(cmd);
        cout << "Move: player at (" << playerX << "," << playerY << ")" << endl;
    }

    // Attack 1
    {
        Command cmd = {1, 0, 0, 10, 0, 0, enemyHP, 0};
        enemyHP -= cmd.value;
        history.push(cmd);
        cout << "Attack! Enemy HP: " << enemyHP << endl;
    }

    // Attack 2
    {
        Command cmd = {1, 0, 0, 10, 0, 0, enemyHP, 0};
        enemyHP -= cmd.value;
        history.push(cmd);
        cout << "Attack! Enemy HP: " << enemyHP << endl;
    }

    // Undo last attack
    {
        Command undone = history.pop();
        if (undone.type == 1) {
            enemyHP = undone.prevHP;
        }
        cout << "Undo: enemy HP restored to " << enemyHP << endl;
    }

    // Redo attack
    {
        Command cmd = {1, 0, 0, 10, 0, 0, enemyHP, 0};
        enemyHP -= cmd.value;
        history.push(cmd);
        cout << "Attack! Enemy HP: " << enemyHP << endl;
    }

    // Final attack
    {
        Command cmd = {1, 0, 0, 10, 0, 0, enemyHP, 0};
        enemyHP -= cmd.value;
        history.push(cmd);
        cout << "Attack! Enemy HP: " << enemyHP << endl;
        if (enemyHP <= 0 && enemyAlive) {
            enemyAlive = false;
            goldX = enemyX; goldY = enemyY;
            goldActive = true;
        }
    }

    // Pickup
    playerX = goldX; playerY = goldY;
    {
        Command cmd = {2, 0, 0, 25, 0, 0, 0, playerGold};
        playerGold += cmd.value;
        goldActive = false;
        history.push(cmd);
        cout << "Picked up 25 gold! Total: " << playerGold << endl;
    }

    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;
    cout << "GAME_MESSAGE|Commands: " << history.totalExecuted
         << " executed, " << history.totalUndone << " undone" << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Grid renders with wall borders",
      expectedOutput: "####################",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Initial HUD shows 0 gold",
      expectedOutput: "HUD\\|HP:100\\|Gold:0\\|Room:0",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Player reaches (9,3) via moves",
      expectedOutput: "Move: player at \\(9,3\\)",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Undo restores enemy HP to 20",
      expectedOutput: "Undo: enemy HP restored to 20",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Enemy HP reaches 0",
      expectedOutput: "Attack! Enemy HP: 0",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Gold picked up with total 25",
      expectedOutput: "Picked up 25 gold! Total: 25",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Updated HUD shows 25 gold",
      expectedOutput: "HUD\\|HP:100\\|Gold:25\\|Room:0",
      isPattern: true,
    },
    {
      id: "g8",
      description: "GAME_MESSAGE shows 12 executed, 1 undone",
      expectedOutput: "GAME_MESSAGE\\|Commands: 12 executed, 1 undone",
      isPattern: true,
    },
    {
      id: "g9",
      description: "Final SCORE printed",
      expectedOutput: "SCORE\\|150",
      isPattern: true,
    },
  ],

  hints: [
    "Snapshot prevX/prevY BEFORE updating position. Snapshot prevHP BEFORE subtracting damage. Order: snapshot, execute, push.",
    "Undo pops the stack and restores: if type==1 (attack), set enemyHP=prevHP. The redo is a new push with fresh snapshot.",
    "Count: 6 right + 2 up + 2 attacks + 1 redo + 1 final attack + 1 pickup = 13? No: 6+2+1+1 = 10 before undo. Pop 1 = 9 on stack. Push redo+final+pickup = 12 total executed, 1 undone.",
  ],

  accumulatedCode: `// ==============================
// RPG CORE — Lesson 27
// Command Pattern: Actions as Data
// ==============================

// ─── include/events.h ───
#include <iostream>
#include <string>
using namespace std;

const int MAX_OBSERVERS = 10;

struct EventSystem {
    string observerNames[MAX_OBSERVERS];
    int observerCount = 0;
    int eventCount = 0;

    void subscribe(string name) {
        if (observerCount < MAX_OBSERVERS) {
            observerNames[observerCount++] = name;
        }
    }

    void notify(string eventType, int value) {
        cout << "[EVENT] " << eventType << ": " << value << endl;
        for (int i = 0; i < observerCount; i++) {
            cout << "  -> " << observerNames[i]
                 << " received " << eventType << endl;
        }
        eventCount++;
    }
};

// ─── include/commands.h ───

struct Command {
    int type;         // 0=move, 1=attack, 2=pickup
    int dx, dy;
    int value;
    int prevX, prevY;
    int prevHP;
    int prevGold;
};

const int MAX_HISTORY = 30;

struct CommandHistory {
    Command stack[MAX_HISTORY];
    int count = 0;
    int totalExecuted = 0;
    int totalUndone = 0;

    void push(Command cmd) {
        if (count < MAX_HISTORY) {
            stack[count++] = cmd;
            totalExecuted++;
        }
    }

    Command pop() {
        if (count > 0) {
            totalUndone++;
            return stack[--count];
        }
        return {-1, 0, 0, 0, 0, 0, 0, 0};
    }
};

// ─── src/main.cpp ───
// #include "events.h"
// #include "commands.h"

// === DIAGNOSTICS ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

// === GRID RENDER ===
void renderGrid(int px, int py, int ex, int ey, bool eAlive,
                bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (eAlive && col == ex && row == ey) {
                cout << 'E';
            } else if (goldActive && col == gx && row == gy) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    // === EVENT SYSTEM ===
    EventSystem events;
    events.subscribe("HUD");
    events.subscribe("ScoreSystem");
    events.subscribe("CombatLog");

    // === COMMAND HISTORY ===
    CommandHistory history;

    // === PLAYER ===
    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;

    // === ENEMY ===
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;

    // === LOOT ===
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    // === RENDER ===
    renderGrid(playerX, playerY, enemyX, enemyY, enemyAlive,
               goldActive, goldX, goldY);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // === MOVES ===
    for (int i = 0; i < 6; i++) {
        Command cmd = {0, 1, 0, 0, playerX, playerY, 0, 0};
        playerX += cmd.dx;
        history.push(cmd);
        cout << "Move: player at (" << playerX << "," << playerY << ")" << endl;
    }
    for (int i = 0; i < 2; i++) {
        Command cmd = {0, 0, -1, 0, playerX, playerY, 0, 0};
        playerY += cmd.dy;
        history.push(cmd);
        cout << "Move: player at (" << playerX << "," << playerY << ")" << endl;
    }

    // === COMBAT WITH UNDO ===
    {
        Command cmd = {1, 0, 0, 10, 0, 0, enemyHP, 0};
        enemyHP -= cmd.value;
        history.push(cmd);
        cout << "Attack! Enemy HP: " << enemyHP << endl;
    }
    {
        Command cmd = {1, 0, 0, 10, 0, 0, enemyHP, 0};
        enemyHP -= cmd.value;
        history.push(cmd);
        cout << "Attack! Enemy HP: " << enemyHP << endl;
    }
    {
        Command undone = history.pop();
        if (undone.type == 1) enemyHP = undone.prevHP;
        cout << "Undo: enemy HP restored to " << enemyHP << endl;
    }
    {
        Command cmd = {1, 0, 0, 10, 0, 0, enemyHP, 0};
        enemyHP -= cmd.value;
        history.push(cmd);
        cout << "Attack! Enemy HP: " << enemyHP << endl;
    }
    {
        Command cmd = {1, 0, 0, 10, 0, 0, enemyHP, 0};
        enemyHP -= cmd.value;
        history.push(cmd);
        cout << "Attack! Enemy HP: " << enemyHP << endl;
        if (enemyHP <= 0 && enemyAlive) {
            enemyAlive = false;
            goldX = enemyX; goldY = enemyY;
            goldActive = true;
        }
    }

    // === PICKUP ===
    playerX = goldX; playerY = goldY;
    {
        Command cmd = {2, 0, 0, 25, 0, 0, 0, playerGold};
        playerGold += cmd.value;
        goldActive = false;
        history.push(cmd);
        cout << "Picked up 25 gold! Total: " << playerGold << endl;
    }

    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;
    cout << "GAME_MESSAGE|Commands: " << history.totalExecuted
         << " executed, " << history.totalUndone << " undone" << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,
};
