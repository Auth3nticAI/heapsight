import type { GameLessonVariant } from "@/types/game";

export const lesson28RPG: GameLessonVariant = {
  lessonId: "rpg-28-state-machine",

  instructions: `# State Machine -- The Game Has Modes

## Mental Model

There's a pattern here. The dungeon has modes. Exploring, Combat, Shopping, Inventory. Each mode allows certain actions and forbids others. You cannot shop during combat. You cannot attack while shopping. The state machine enforces the rules. States have enter/update/exit. Transitions have guards. The machine is the single source of truth for what mode the game is in.

Previously you used an integer: gameState=0 for MENU, gameState=1 for PLAYING. That works for two states. Four states with transition guards and lifecycle hooks? Integers become spaghetti. The StateMachine struct gives each state its own identity and makes transitions explicit.

## What Breaks Without This

Without a state machine, mode checks scatter across the codebase: \`if (state == 1 && !inCombat && nearShop)\`. Miss one check and you can shop during combat. Add a fifth mode and you edit every branch. The state machine centralizes all transitions with explicit guards. Illegal transitions are rejected, not accidentally allowed.

## The Fix

StateMachine with addState, transition(target, guard). Enter/update/exit lifecycle. Guards prevent illegal transitions. One struct, one source of truth.

## Pattern Insight

State machines are everywhere. Game AI. UI navigation. Network protocols. Animation controllers. Unity Animator is a visual state machine. Unreal behavior trees wrap state machines. Regular expressions are state machines. The formalization -- enter/update/exit with guarded transitions -- prevents the ad-hoc mode-checking that produces bugs.

## Scalability Insight

Adding "Dialogue" state: one addState call, one or two new guard conditions. No existing states change. No existing transitions change. O(1) to add a mode.

## Your Task

Build a complete state machine dungeon:

**States:** Exploring (0), Combat (1), Shopping (2), Inventory (3)

**Sequence:**
1. Enter Exploring. \`[STATE] Entering Exploring\`
2. Render 20x10 grid: @ at (3,5), E at (10,3). \`HUD|HP:100|Gold:50|Room:0\`
3. Exploring update.
4. Transition to Combat (enemyNearby=true).
5. Combat update. 3 attacks: HP 30->20->10->0. \`Enemy defeated!\`
6. Try Shopping (nearShop=false). Blocked.
7. Back to Exploring (combatOver=true).
8. Transition to Shopping (nearShop=true).
9. Shopping update. \`Bought health potion! Gold: 50->25\`
10. Transition to Inventory.
11. Inventory update. \`Inventory: HP Potion x1\`
12. Back to Exploring.
13. \`GAME_MESSAGE|States: 5 successful, 1 blocked\`
14. \`SCORE|150\`

## Common Mistake

Forgetting to call exit() before enter(). The transition method handles this automatically, but if you bypass it and set the current index directly, cleanup never runs. Always use the transition method.

## Elite Insight

Hierarchical state machines nest sub-states within states. Combat contains PlayerTurn, EnemyTurn, Victory. Each sub-state has its own enter/update/exit. The parent state handles shared behavior. Your flat four-state machine is step one; HSMs are the production evolution.

## Pattern Recognition

Distinct modes + different behavior per mode + guarded transitions = state machine. If you write \`if (state == X)\` more than three times, refactor to a state machine.

## Skill Reinforcement

- StateMachine struct: states array, current index, transition with guards
- Clean lifecycle: exit old state, enter new state, every transition
- Guard booleans: prevent impossible game states
- Integration: state machine wraps grid, combat, economy from prior lessons

## Mastery Check

Five successful transitions and one blocked. The blocked transition proves the guard works. Without it, the player enters Shopping during Combat -- an impossible game state. The state machine makes illegal states unrepresentable. That is the value of the pattern.`,

  starterCode: `// ─── include/states.h ───
#include <iostream>
#include <string>
using namespace std;

struct GameState {
    int id;
    string name;
    void enter() { cout << "[STATE] Entering " << name << endl; }
    void update() { cout << "[STATE] " << name << " update" << endl; }
    void exit() { cout << "[STATE] Exiting " << name << endl; }
};

struct StateMachine {
    GameState states[4];
    int current = 0;
    int stateCount = 0;
    int successfulTransitions = 0;
    int blockedTransitions = 0;

    void addState(int id, string name) {
        states[stateCount++] = {id, name};
    }

    bool transition(int targetId, bool guardPassed) {
        if (!guardPassed) {
            cout << "[STATE] Transition blocked to " << states[targetId].name << endl;
            blockedTransitions++;
            return false;
        }
        states[current].exit();
        current = targetId;
        states[current].enter();
        successfulTransitions++;
        return true;
    }
};

// ─── src/main.cpp ───
// #include "states.h"

void renderGrid(int px, int py, int ex, int ey, bool eAlive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else if (eAlive && col == ex && row == ey) cout << 'E';
            else cout << '.';
        }
        cout << endl;
    }
}

int main() {
    StateMachine sm;
    sm.addState(0, "Exploring");
    sm.addState(1, "Combat");
    sm.addState(2, "Shopping");
    sm.addState(3, "Inventory");

    int playerHP = 100, playerGold = 50;
    int enemyHP = 30;
    bool enemyAlive = true;

    // TODO: Enter Exploring, render grid, HUD
    // TODO: Exploring update
    // TODO: Transition to Combat, Combat update, 3 attacks
    // TODO: Try Shopping (blocked), back to Exploring
    // TODO: Shopping update, buy potion
    // TODO: Inventory update
    // TODO: Back to Exploring
    // TODO: GAME_MESSAGE, SCORE

    return 0;
}
`,

  solutionCode: `// ─── include/states.h ───
#include <iostream>
#include <string>
using namespace std;

struct GameState {
    int id;
    string name;
    void enter() { cout << "[STATE] Entering " << name << endl; }
    void update() { cout << "[STATE] " << name << " update" << endl; }
    void exit() { cout << "[STATE] Exiting " << name << endl; }
};

struct StateMachine {
    GameState states[4];
    int current = 0;
    int stateCount = 0;
    int successfulTransitions = 0;
    int blockedTransitions = 0;

    void addState(int id, string name) {
        states[stateCount++] = {id, name};
    }

    bool transition(int targetId, bool guardPassed) {
        if (!guardPassed) {
            cout << "[STATE] Transition blocked to " << states[targetId].name << endl;
            blockedTransitions++;
            return false;
        }
        states[current].exit();
        current = targetId;
        states[current].enter();
        successfulTransitions++;
        return true;
    }
};

// ─── src/main.cpp ───
// #include "states.h"

void renderGrid(int px, int py, int ex, int ey, bool eAlive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else if (eAlive && col == ex && row == ey) cout << 'E';
            else cout << '.';
        }
        cout << endl;
    }
}

int main() {
    StateMachine sm;
    sm.addState(0, "Exploring");
    sm.addState(1, "Combat");
    sm.addState(2, "Shopping");
    sm.addState(3, "Inventory");

    int playerHP = 100, playerGold = 50;
    int enemyHP = 30;
    bool enemyAlive = true;

    // Enter Exploring
    sm.states[sm.current].enter();
    renderGrid(3, 5, 10, 3, enemyAlive);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // Exploring update
    sm.states[sm.current].update();

    // Transition to Combat
    sm.transition(1, true);
    sm.states[sm.current].update();

    // 3 attacks
    for (int i = 0; i < 3; i++) {
        enemyHP -= 10;
        cout << "Attack! Enemy HP: " << enemyHP << endl;
    }
    enemyAlive = false;
    cout << "Enemy defeated!" << endl;

    // Try Shopping — blocked
    sm.transition(2, false);

    // Back to Exploring
    sm.transition(0, true);

    // Shopping
    sm.transition(2, true);
    sm.states[sm.current].update();
    playerGold -= 25;
    cout << "Bought health potion! Gold: 50->25" << endl;

    // Inventory
    sm.transition(3, true);
    sm.states[sm.current].update();
    cout << "Inventory: HP Potion x1" << endl;

    // Back to Exploring
    sm.transition(0, true);

    cout << "GAME_MESSAGE|States: " << sm.successfulTransitions
         << " successful, " << sm.blockedTransitions << " blocked" << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Exploring state entered initially",
      expectedOutput: "\\[STATE\\] Entering Exploring",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Grid renders with wall borders",
      expectedOutput: "####################",
      isPattern: true,
    },
    {
      id: "g3",
      description: "HUD shows initial gold and HP",
      expectedOutput: "HUD\\|HP:100\\|Gold:50\\|Room:0",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Combat state entered",
      expectedOutput: "\\[STATE\\] Entering Combat",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Enemy defeated after attacks",
      expectedOutput: "Enemy defeated!",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Shopping transition blocked",
      expectedOutput: "\\[STATE\\] Transition blocked to Shopping",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Health potion purchased",
      expectedOutput: "Bought health potion! Gold: 50->25",
      isPattern: true,
    },
    {
      id: "g8",
      description: "Inventory shows potion",
      expectedOutput: "Inventory: HP Potion x1",
      isPattern: true,
    },
    {
      id: "g9",
      description: "GAME_MESSAGE shows 5 successful, 1 blocked",
      expectedOutput: "GAME_MESSAGE\\|States: 5 successful, 1 blocked",
      isPattern: true,
    },
    {
      id: "g10",
      description: "Final SCORE printed",
      expectedOutput: "SCORE\\|150",
      isPattern: true,
    },
  ],

  hints: [
    "Initial enter is manual: sm.states[sm.current].enter(). After that, all transitions use sm.transition(targetId, guard).",
    "Shopping guard is false during combat (blocked), then true after returning to Exploring. Two attempts to the same target, different outcomes.",
    "Count: to Combat(1), blocked Shopping, to Exploring(2), to Shopping(3), to Inventory(4), to Exploring(5) = 5 successful, 1 blocked.",
  ],

  accumulatedCode: `// ==============================
// RPG CORE — Lesson 28
// State Machine: The Game Has Modes
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

// ─── include/states.h ───

struct GameState {
    int id;
    string name;
    void enter() { cout << "[STATE] Entering " << name << endl; }
    void update() { cout << "[STATE] " << name << " update" << endl; }
    void exit() { cout << "[STATE] Exiting " << name << endl; }
};

struct StateMachine {
    GameState states[4];
    int current = 0;
    int stateCount = 0;
    int successfulTransitions = 0;
    int blockedTransitions = 0;

    void addState(int id, string name) {
        states[stateCount++] = {id, name};
    }

    bool transition(int targetId, bool guardPassed) {
        if (!guardPassed) {
            cout << "[STATE] Transition blocked to " << states[targetId].name << endl;
            blockedTransitions++;
            return false;
        }
        states[current].exit();
        current = targetId;
        states[current].enter();
        successfulTransitions++;
        return true;
    }
};

// ─── src/main.cpp ───
// #include "events.h"
// #include "commands.h"
// #include "states.h"

// === DIAGNOSTICS ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

// === GRID RENDER ===
void renderGrid(int px, int py, int ex, int ey, bool eAlive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else if (eAlive && col == ex && row == ey) cout << 'E';
            else cout << '.';
        }
        cout << endl;
    }
}

int main() {
    // === SYSTEMS ===
    EventSystem events;
    events.subscribe("HUD");
    events.subscribe("ScoreSystem");
    events.subscribe("CombatLog");

    CommandHistory history;

    StateMachine sm;
    sm.addState(0, "Exploring");
    sm.addState(1, "Combat");
    sm.addState(2, "Shopping");
    sm.addState(3, "Inventory");

    // === PLAYER ===
    int playerHP = 100, playerGold = 50;

    // === ENEMY ===
    int enemyHP = 30;
    bool enemyAlive = true;

    // === GAME SESSION ===
    sm.states[sm.current].enter();
    renderGrid(3, 5, 10, 3, enemyAlive);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    sm.states[sm.current].update();
    sm.transition(1, true); // -> Combat
    sm.states[sm.current].update();

    for (int i = 0; i < 3; i++) {
        enemyHP -= 10;
        cout << "Attack! Enemy HP: " << enemyHP << endl;
    }
    enemyAlive = false;
    cout << "Enemy defeated!" << endl;

    sm.transition(2, false); // blocked
    sm.transition(0, true);  // -> Exploring
    sm.transition(2, true);  // -> Shopping
    sm.states[sm.current].update();
    playerGold -= 25;
    cout << "Bought health potion! Gold: 50->25" << endl;

    sm.transition(3, true); // -> Inventory
    sm.states[sm.current].update();
    cout << "Inventory: HP Potion x1" << endl;

    sm.transition(0, true); // -> Exploring

    cout << "GAME_MESSAGE|States: " << sm.successfulTransitions
         << " successful, " << sm.blockedTransitions << " blocked" << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,
};
