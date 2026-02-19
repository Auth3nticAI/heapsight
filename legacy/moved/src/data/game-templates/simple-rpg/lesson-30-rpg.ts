import type { GameLessonVariant } from "@/types/game";

export const lesson30RPG: GameLessonVariant = {
  lessonId: "rpg-30-strategy-pattern",

  instructions: `# Strategy Pattern -- Behavior as Data

## Mental Model

There's a pattern here. Three enemies. Three AI strategies. The goblin charges toward the player. The skeleton holds position until hurt, then retreats. The guard patrols. Each behavior is a strategy struct. Swap the struct, change the behavior. At runtime. Without editing the enemy. Behavior is data. Data is swappable.

The Strategy pattern extracts behavior into interchangeable objects. An AggressiveAI moves toward the player. A DefensiveAI retreats when HP drops low. A PatrolAI walks back and forth. Each has a chooseAction() method. The enemy holds a strategy reference. Change the reference, change the brain.

## What Breaks Without This

Without strategies, enemy AI is a massive switch statement: \`if (type == goblin && hp > threshold) charge(); else if (type == goblin && hp <= threshold) retreat();\`. Add a behavior? Edit the switch. Add an enemy? Edit the switch. The switch grows as enemies times behaviors. The Strategy pattern grows as enemies plus behaviors. Linear beats quadratic.

## The Fix

AIStrategy struct with type tag. chooseAction() reads the type and returns an action string. Enemies hold a strategy. Swap the strategy, change the behavior. No enemy code edits.

## Pattern Insight

Every RTS game, every RPG, every stealth game uses strategies. Units in StarCraft have attack-move, patrol, hold. Enemies in Dark Souls have aggro, retreat, idle. Guards in Metal Gear have patrol, alert, search. Your three strategies are the minimum proof of a universal pattern.

## Scalability Insight

Adding "ambush" AI: one new strategy type value, one new branch in chooseAction(). No existing strategies change. No existing enemies change. O(1) to add a behavior.

## Your Task

Build a strategy AI dungeon:

**Setup:**
- Player at (3,5), HP 100, Gold 0
- Goblin at (10,3), AggressiveAI, HP 20/20, symbol G
- Skeleton at (15,5), DefensiveAI, HP 40/40, symbol S
- Guard at (5,7), PatrolAI, HP 30/30, symbol P

**Sequence:**
1. Render grid, \`HUD|HP:100|Gold:0|Room:0\`
2. Frame 1: All choose. Goblin: move_left. Skeleton: hold. Guard: patrol.
3. Frame 2: Attack goblin (HP 20->10). Still aggressive: move_left.
4. Frame 3: Attack goblin (HP 10->0). Dies. Loot 10 gold.
5. Frame 4: Attack skeleton (HP 40->30). Defensive, HP > 25%: hold.
6. Frame 5: Attack skeleton twice (HP 30->20->10). Swap to Patrol. \`[AI] Skeleton strategy: Defensive -> Patrol\`. Skeleton: patrol.
7. \`HUD|HP:100|Gold:10|Room:0\`
8. \`GAME_MESSAGE|AI active: 2 alive, 1 strategy swap\`
9. \`SCORE|150\`

## Common Mistake

Not re-evaluating after a strategy swap. The old action was computed with the old strategy. After swapping, call chooseAction again. The new strategy produces a different action.

## Elite Insight

Behavior trees combine strategies with decision trees. A tree node selects among strategies based on conditions: HP thresholds, distance checks, timer expirations. Each leaf is a strategy. The tree is the selector. Your flat strategy swap is the atomic operation; behavior trees compose many such operations into complex AI.

## Pattern Recognition

Enemies with different behaviors? Strategy. Behaviors that change at runtime? Strategy. Behaviors shared across enemy types? Strategy. The pattern applies whenever behavior is interchangeable and condition-dependent.

## Skill Reinforcement

- AIStrategy struct: type tag identifies behavior family
- chooseAction: pure function reads strategy + game state, returns action string
- Runtime swap: one struct assignment changes the enemy's brain
- Entity struct integrates strategy, position, stats, and alive flag
- Grid rendering respects alive flag and entity symbol

## Mastery Check

The skeleton's strategy changed from Defensive to Patrol with one struct assignment. Its code did not change. The chooseAction function did not change. The grid render did not change. Only the data changed. A struct assignment rewired the skeleton's brain. Behavior as data. That is the Strategy pattern.`,

  starterCode: `// ─── include/ai.h ───
#include <iostream>
#include <string>
using namespace std;

struct AIStrategy {
    int type;    // 0=aggressive, 1=defensive, 2=patrol
    string name;
};

string chooseAction(AIStrategy strategy, int ex, int ey,
                    int px, int py, int hp, int maxHP) {
    if (strategy.type == 0) {
        if (ex > px) return "move_left";
        if (ex < px) return "move_right";
        if (ey > py) return "move_up";
        return "move_down";
    } else if (strategy.type == 1) {
        if (hp < maxHP / 4) {
            if (ex < px) return "move_left";
            if (ex > px) return "move_right";
            return "retreat";
        }
        return "hold";
    } else {
        return "patrol";
    }
}

// ─── include/factory.h ───

struct Entity {
    string name;
    int hp, maxHP;
    int attack;
    int goldDrop;
    char symbol;
    int x, y;
    bool alive;
    AIStrategy strategy;
};

// ─── src/main.cpp ───
// #include "ai.h"
// #include "factory.h"

void renderGrid(int px, int py, Entity* enemies, int count) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else {
                char cell = '.';
                for (int i = 0; i < count; i++) {
                    if (enemies[i].alive && col == enemies[i].x && row == enemies[i].y) {
                        cell = enemies[i].symbol;
                        break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }
}

int main() {
    int playerX = 3, playerY = 5, playerHP = 100, playerGold = 0;
    int swaps = 0;

    Entity enemies[3] = {
        {"Goblin", 20, 20, 5, 10, 'G', 10, 3, true, {0, "Aggressive"}},
        {"Skeleton", 40, 40, 8, 20, 'S', 15, 5, true, {1, "Defensive"}},
        {"Guard", 30, 30, 6, 15, 'P', 5, 7, true, {2, "Patrol"}}
    };

    // TODO: Render grid, HUD
    // TODO: Frame 1-5 sequence
    // TODO: Updated HUD, GAME_MESSAGE, SCORE

    return 0;
}
`,

  solutionCode: `// ─── include/ai.h ───
#include <iostream>
#include <string>
using namespace std;

struct AIStrategy {
    int type;    // 0=aggressive, 1=defensive, 2=patrol
    string name;
};

string chooseAction(AIStrategy strategy, int ex, int ey,
                    int px, int py, int hp, int maxHP) {
    if (strategy.type == 0) {
        if (ex > px) return "move_left";
        if (ex < px) return "move_right";
        if (ey > py) return "move_up";
        return "move_down";
    } else if (strategy.type == 1) {
        if (hp < maxHP / 4) {
            if (ex < px) return "move_left";
            if (ex > px) return "move_right";
            return "retreat";
        }
        return "hold";
    } else {
        return "patrol";
    }
}

// ─── include/factory.h ───

struct Entity {
    string name;
    int hp, maxHP;
    int attack;
    int goldDrop;
    char symbol;
    int x, y;
    bool alive;
    AIStrategy strategy;
};

// ─── src/main.cpp ───
// #include "ai.h"
// #include "factory.h"

void renderGrid(int px, int py, Entity* enemies, int count) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else {
                char cell = '.';
                for (int i = 0; i < count; i++) {
                    if (enemies[i].alive && col == enemies[i].x && row == enemies[i].y) {
                        cell = enemies[i].symbol;
                        break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }
}

int main() {
    int playerX = 3, playerY = 5, playerHP = 100, playerGold = 0;
    int swaps = 0;

    Entity enemies[3] = {
        {"Goblin", 20, 20, 5, 10, 'G', 10, 3, true, {0, "Aggressive"}},
        {"Skeleton", 40, 40, 8, 20, 'S', 15, 5, true, {1, "Defensive"}},
        {"Guard", 30, 30, 6, 15, 'P', 5, 7, true, {2, "Patrol"}}
    };

    // Render grid
    renderGrid(playerX, playerY, enemies, 3);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // Frame 1: all choose
    cout << "--- Frame 1 ---" << endl;
    for (int i = 0; i < 3; i++) {
        string action = chooseAction(enemies[i].strategy,
                                     enemies[i].x, enemies[i].y,
                                     playerX, playerY,
                                     enemies[i].hp, enemies[i].maxHP);
        cout << enemies[i].name << " chooses: " << action << endl;
    }

    // Frame 2: attack goblin
    cout << "--- Frame 2 ---" << endl;
    enemies[0].hp -= 10;
    cout << "Attack! " << enemies[0].name << " HP: " << enemies[0].hp << endl;
    {
        string action = chooseAction(enemies[0].strategy,
                                     enemies[0].x, enemies[0].y,
                                     playerX, playerY,
                                     enemies[0].hp, enemies[0].maxHP);
        cout << enemies[0].name << " chooses: " << action << endl;
    }

    // Frame 3: kill goblin
    cout << "--- Frame 3 ---" << endl;
    enemies[0].hp -= 10;
    cout << "Attack! " << enemies[0].name << " HP: " << enemies[0].hp << endl;
    enemies[0].alive = false;
    cout << "Goblin defeated!" << endl;
    playerGold += enemies[0].goldDrop;

    // Frame 4: attack skeleton
    cout << "--- Frame 4 ---" << endl;
    enemies[1].hp -= 10;
    cout << "Attack! " << enemies[1].name << " HP: " << enemies[1].hp << endl;
    {
        string action = chooseAction(enemies[1].strategy,
                                     enemies[1].x, enemies[1].y,
                                     playerX, playerY,
                                     enemies[1].hp, enemies[1].maxHP);
        cout << enemies[1].name << " chooses: " << action << endl;
    }

    // Frame 5: attack skeleton twice, swap
    cout << "--- Frame 5 ---" << endl;
    enemies[1].hp -= 10;
    cout << "Attack! " << enemies[1].name << " HP: " << enemies[1].hp << endl;
    enemies[1].hp -= 10;
    cout << "Attack! " << enemies[1].name << " HP: " << enemies[1].hp << endl;

    string oldName = enemies[1].strategy.name;
    enemies[1].strategy = {2, "Patrol"};
    swaps++;
    cout << "[AI] " << enemies[1].name << " strategy: " << oldName
         << " -> " << enemies[1].strategy.name << endl;
    {
        string action = chooseAction(enemies[1].strategy,
                                     enemies[1].x, enemies[1].y,
                                     playerX, playerY,
                                     enemies[1].hp, enemies[1].maxHP);
        cout << enemies[1].name << " chooses: " << action << endl;
    }

    // Count alive
    int alive = 0;
    for (int i = 0; i < 3; i++) {
        if (enemies[i].alive) alive++;
    }

    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;
    cout << "GAME_MESSAGE|AI active: " << alive << " alive, "
         << swaps << " strategy swap" << endl;
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
      description: "Goblin aggressive: move_left",
      expectedOutput: "Goblin chooses: move_left",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Skeleton defensive holds",
      expectedOutput: "Skeleton chooses: hold",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Guard patrols",
      expectedOutput: "Guard chooses: patrol",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Goblin defeated",
      expectedOutput: "Goblin defeated!",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Skeleton strategy swapped",
      expectedOutput: "\\[AI\\] Skeleton strategy: Defensive -> Patrol",
      isPattern: true,
    },
    {
      id: "g8",
      description: "Skeleton patrols after swap",
      expectedOutput: "Skeleton chooses: patrol",
      isPattern: true,
    },
    {
      id: "g9",
      description: "Updated HUD shows 10 gold",
      expectedOutput: "HUD\\|HP:100\\|Gold:10\\|Room:0",
      isPattern: true,
    },
    {
      id: "g10",
      description: "GAME_MESSAGE shows 2 alive, 1 swap",
      expectedOutput: "GAME_MESSAGE\\|AI active: 2 alive, 1 strategy swap",
      isPattern: true,
    },
    {
      id: "g11",
      description: "Final SCORE printed",
      expectedOutput: "SCORE\\|150",
      isPattern: true,
    },
  ],

  hints: [
    "Frame 1: chooseAction for each enemy. Goblin at (10,3), player at (3,5): ex > px so aggressive returns move_left. Skeleton HP 40/40 > 40/4=10: holds.",
    "Frame 3: goblin HP 10->0. Set alive=false, add goldDrop (10) to playerGold.",
    "Frame 5: after two attacks (HP 30->20->10), swap strategy: enemies[1].strategy = {2, 'Patrol'}. Re-evaluate: patrol returns 'patrol'.",
  ],

  accumulatedCode: `// ==============================
// RPG CORE — Lesson 30
// Strategy Pattern: Behavior as Data
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

// ─── include/ai.h ───

struct AIStrategy {
    int type;    // 0=aggressive, 1=defensive, 2=patrol
    string name;
};

string chooseAction(AIStrategy strategy, int ex, int ey,
                    int px, int py, int hp, int maxHP) {
    if (strategy.type == 0) { // Aggressive
        if (ex > px) return "move_left";
        if (ex < px) return "move_right";
        if (ey > py) return "move_up";
        return "move_down";
    } else if (strategy.type == 1) { // Defensive
        if (hp < maxHP / 4) {
            if (ex < px) return "move_left";
            if (ex > px) return "move_right";
            return "retreat";
        }
        return "hold";
    } else { // Patrol
        return "patrol";
    }
}

// ─── include/factory.h ───

struct Entity {
    string name;
    int hp, maxHP;
    int attack;
    int goldDrop;
    char symbol;
    int x, y;
    bool alive;
    AIStrategy strategy;
};

struct EntityFactory {
    int totalCreated = 0;

    Entity create(string type, int x, int y, AIStrategy ai) {
        Entity e;
        if (type == "goblin") {
            e = {"Goblin", 20, 20, 5, 10, 'G', x, y, true, ai};
        } else if (type == "skeleton") {
            e = {"Skeleton", 40, 40, 8, 20, 'S', x, y, true, ai};
        } else if (type == "dragon") {
            e = {"Dragon", 200, 200, 25, 100, 'D', x, y, true, ai};
        } else {
            e = {"Unknown", 1, 1, 1, 0, '?', x, y, true, ai};
        }
        cout << "[FACTORY] Created " << e.name
             << " (HP:" << e.hp
             << " ATK:" << e.attack
             << " Gold:" << e.goldDrop << ")" << endl;
        totalCreated++;
        return e;
    }
};

// ─── src/main.cpp ───
// #include "events.h"
// #include "commands.h"
// #include "states.h"
// #include "ai.h"
// #include "factory.h"

// === DIAGNOSTICS ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

// === GRID RENDER ===
void renderGrid(int px, int py, Entity* enemies, int count) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else {
                char cell = '.';
                for (int i = 0; i < count; i++) {
                    if (enemies[i].alive && col == enemies[i].x && row == enemies[i].y) {
                        cell = enemies[i].symbol;
                        break;
                    }
                }
                cout << cell;
            }
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

    // === ENTITIES ===
    int playerX = 3, playerY = 5, playerHP = 100, playerGold = 0;
    int swaps = 0;

    Entity enemies[3] = {
        {"Goblin", 20, 20, 5, 10, 'G', 10, 3, true, {0, "Aggressive"}},
        {"Skeleton", 40, 40, 8, 20, 'S', 15, 5, true, {1, "Defensive"}},
        {"Guard", 30, 30, 6, 15, 'P', 5, 7, true, {2, "Patrol"}}
    };

    // === RENDER ===
    renderGrid(playerX, playerY, enemies, 3);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // === FRAME 1: ALL CHOOSE ===
    cout << "--- Frame 1 ---" << endl;
    for (int i = 0; i < 3; i++) {
        string action = chooseAction(enemies[i].strategy,
                                     enemies[i].x, enemies[i].y,
                                     playerX, playerY,
                                     enemies[i].hp, enemies[i].maxHP);
        cout << enemies[i].name << " chooses: " << action << endl;
    }

    // === FRAME 2: ATTACK GOBLIN ===
    cout << "--- Frame 2 ---" << endl;
    enemies[0].hp -= 10;
    cout << "Attack! " << enemies[0].name << " HP: " << enemies[0].hp << endl;
    {
        string action = chooseAction(enemies[0].strategy,
                                     enemies[0].x, enemies[0].y,
                                     playerX, playerY,
                                     enemies[0].hp, enemies[0].maxHP);
        cout << enemies[0].name << " chooses: " << action << endl;
    }

    // === FRAME 3: KILL GOBLIN ===
    cout << "--- Frame 3 ---" << endl;
    enemies[0].hp -= 10;
    cout << "Attack! " << enemies[0].name << " HP: " << enemies[0].hp << endl;
    enemies[0].alive = false;
    cout << "Goblin defeated!" << endl;
    playerGold += enemies[0].goldDrop;

    // === FRAME 4: ATTACK SKELETON ===
    cout << "--- Frame 4 ---" << endl;
    enemies[1].hp -= 10;
    cout << "Attack! " << enemies[1].name << " HP: " << enemies[1].hp << endl;
    {
        string action = chooseAction(enemies[1].strategy,
                                     enemies[1].x, enemies[1].y,
                                     playerX, playerY,
                                     enemies[1].hp, enemies[1].maxHP);
        cout << enemies[1].name << " chooses: " << action << endl;
    }

    // === FRAME 5: ATTACK + SWAP ===
    cout << "--- Frame 5 ---" << endl;
    enemies[1].hp -= 10;
    cout << "Attack! " << enemies[1].name << " HP: " << enemies[1].hp << endl;
    enemies[1].hp -= 10;
    cout << "Attack! " << enemies[1].name << " HP: " << enemies[1].hp << endl;

    string oldName = enemies[1].strategy.name;
    enemies[1].strategy = {2, "Patrol"};
    swaps++;
    cout << "[AI] " << enemies[1].name << " strategy: " << oldName
         << " -> " << enemies[1].strategy.name << endl;
    {
        string action = chooseAction(enemies[1].strategy,
                                     enemies[1].x, enemies[1].y,
                                     playerX, playerY,
                                     enemies[1].hp, enemies[1].maxHP);
        cout << enemies[1].name << " chooses: " << action << endl;
    }

    // === FINAL ===
    int alive = 0;
    for (int i = 0; i < 3; i++) {
        if (enemies[i].alive) alive++;
    }

    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;
    cout << "GAME_MESSAGE|AI active: " << alive << " alive, "
         << swaps << " strategy swap" << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,
};
