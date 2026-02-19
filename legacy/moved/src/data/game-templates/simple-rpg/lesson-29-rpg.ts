import type { GameLessonVariant } from "@/types/game";

export const lesson29RPG: GameLessonVariant = {
  lessonId: "rpg-29-factory-pattern",

  instructions: `# Factory Pattern -- Data Wears Costumes

## Mental Model

There's a pattern here. A goblin is just data wearing a costume. HP 20, ATK 5, Gold 10, symbol G. A skeleton is different data, different costume. HP 40, ATK 8, Gold 20, symbol S. The Factory pattern says: give me a type string, I give you the entity with the right stats. One function. One entry point. All creation centralized.

Data drives the game. The factory is the bridge between type strings and live entities. In production, those strings come from a level editor, a JSON file, a database. The factory reads "goblin" and produces a Goblin struct with correct stats. The dungeon never hardcodes stats. The factory does.

## What Breaks Without This

Without a factory, every spawn site hardcodes stats. Change the goblin's HP? Find every spawn site. Miss one? Inconsistent goblins with different HP values in different rooms. The factory is the single source of truth for entity creation.

## The Fix

EntityFactory with create(string type, int x, int y). One method. Centralized creation. The caller says what type. The factory knows the stats.

## Pattern Insight

Unity prefabs, Unreal SpawnActor, Godot instance() -- all factories. Level editors produce data. Factories consume data and produce entities. That separation is what makes game content scalable. Your factory is this separation made explicit.

## Scalability Insight

Adding "lich": one new branch in create(). No spawn site changes. No combat changes. No grid changes. One edit point.

## Your Task

Build a factory-spawned dungeon:

**Spawn list:** "goblin" at (5,3), "goblin" at (12,3), "skeleton" at (8,6), "dragon" at (15,5)

**Sequence:**
1. Create all 4 entities via factory. Print \`[FACTORY] Created ...\` for each.
2. Render 20x10 grid: @ at (1,5), entities at positions with their symbols.
3. \`HUD|HP:100|Gold:0|Room:0\`
4. Attack goblin at (5,3): 2 hits of 10 dmg. HP 20->10->0.
5. Goblin dies. Player picks up 10 gold.
6. \`[FACTORY] Goblin defeated. Loot: 10 gold\`
7. Remaining enemy HP: 20 + 40 + 200 = 260.
8. \`HUD|HP:100|Gold:10|Room:0\`
9. \`GAME_MESSAGE|Factory spawned 4 entities, 1 defeated\`
10. \`SCORE|150\`

## Common Mistake

Rendering dead entities on the grid. Always check the alive flag before drawing. Dead goblins should not appear. The factory creates them; the game kills them; the renderer respects the alive flag.

## Elite Insight

Production factories read from data files. A CSV: "goblin,20,5,10,G". The factory parses the row and produces the entity. Adding a new enemy means adding a CSV row, not code. That is data-driven design at production scale.

## Pattern Recognition

Hardcoded stats at spawn sites? Need a factory. Multiple callers creating same entity types? Need a factory. Content creators adding types without code? Need a factory with a data table.

## Skill Reinforcement

- EntityFactory: create(string, int, int) returns Entity by value
- Entity struct: name, hp, attack, goldDrop, symbol, x, y, alive
- Factory tracks totalCreated for diagnostics
- Grid render uses entity.symbol and entity.alive
- Combat and loot use factory-created entity data

## Mastery Check

Four entities, one factory. The dungeon never wrote \`hp = 20\` or \`atk = 5\`. It said "goblin" and the factory produced the correct stats. Change goblin HP in one place -- the factory -- and every goblin in the game updates. That centralization is why the Factory pattern exists.`,

  starterCode: `// ─── include/factory.h ───
#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string name;
    int hp;
    int attack;
    int goldDrop;
    char symbol;
    int x, y;
    bool alive;
};

struct EntityFactory {
    int totalCreated = 0;

    Entity create(string type, int x, int y) {
        Entity e;
        if (type == "goblin") {
            e = {"Goblin", 20, 5, 10, 'G', x, y, true};
        } else if (type == "skeleton") {
            e = {"Skeleton", 40, 8, 20, 'S', x, y, true};
        } else if (type == "dragon") {
            e = {"Dragon", 200, 25, 100, 'D', x, y, true};
        } else {
            e = {"Unknown", 1, 1, 0, '?', x, y, true};
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
// #include "factory.h"

int main() {
    EntityFactory factory;
    const int MAX_ENEMIES = 4;
    Entity enemies[MAX_ENEMIES];
    int playerX = 1, playerY = 5;
    int playerHP = 100, playerGold = 0;
    int defeated = 0;

    // TODO: Spawn enemies via factory
    // TODO: Render grid, HUD
    // TODO: Attack goblin, loot
    // TODO: Remaining HP, updated HUD
    // TODO: GAME_MESSAGE, SCORE

    return 0;
}
`,

  solutionCode: `// ─── include/factory.h ───
#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string name;
    int hp;
    int attack;
    int goldDrop;
    char symbol;
    int x, y;
    bool alive;
};

struct EntityFactory {
    int totalCreated = 0;

    Entity create(string type, int x, int y) {
        Entity e;
        if (type == "goblin") {
            e = {"Goblin", 20, 5, 10, 'G', x, y, true};
        } else if (type == "skeleton") {
            e = {"Skeleton", 40, 8, 20, 'S', x, y, true};
        } else if (type == "dragon") {
            e = {"Dragon", 200, 25, 100, 'D', x, y, true};
        } else {
            e = {"Unknown", 1, 1, 0, '?', x, y, true};
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
// #include "factory.h"

int main() {
    EntityFactory factory;
    const int MAX_ENEMIES = 4;
    Entity enemies[MAX_ENEMIES];
    int playerX = 1, playerY = 5;
    int playerHP = 100, playerGold = 0;
    int defeated = 0;

    // Spawn enemies
    enemies[0] = factory.create("goblin", 5, 3);
    enemies[1] = factory.create("goblin", 12, 3);
    enemies[2] = factory.create("skeleton", 8, 6);
    enemies[3] = factory.create("dragon", 15, 5);

    // Render grid
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerX && row == playerY) {
                cout << '@';
            } else {
                char cell = '.';
                for (int i = 0; i < MAX_ENEMIES; i++) {
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
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // Combat: attack goblin[0]
    int damage = 10;
    for (int i = 0; i < 2; i++) {
        enemies[0].hp -= damage;
        cout << "Attack! " << enemies[0].name << " HP: " << enemies[0].hp << endl;
    }
    enemies[0].alive = false;
    defeated++;
    playerGold += enemies[0].goldDrop;
    cout << "[FACTORY] " << enemies[0].name << " defeated. Loot: "
         << enemies[0].goldDrop << " gold" << endl;

    // Remaining HP
    int remainingHP = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemies[i].alive) remainingHP += enemies[i].hp;
    }
    cout << "Remaining enemy HP: " << remainingHP << endl;

    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;
    cout << "GAME_MESSAGE|Factory spawned " << factory.totalCreated
         << " entities, " << defeated << " defeated" << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Factory creates Goblin",
      expectedOutput: "\\[FACTORY\\] Created Goblin \\(HP:20 ATK:5 Gold:10\\)",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Factory creates Skeleton",
      expectedOutput: "\\[FACTORY\\] Created Skeleton \\(HP:40 ATK:8 Gold:20\\)",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Factory creates Dragon",
      expectedOutput: "\\[FACTORY\\] Created Dragon \\(HP:200 ATK:25 Gold:100\\)",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Grid renders with wall borders",
      expectedOutput: "####################",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Goblin HP reaches 0",
      expectedOutput: "Goblin HP: 0",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Goblin defeated with loot",
      expectedOutput: "\\[FACTORY\\] Goblin defeated\\. Loot: 10 gold",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Remaining HP is 260",
      expectedOutput: "Remaining enemy HP: 260",
      isPattern: true,
    },
    {
      id: "g8",
      description: "Updated HUD shows 10 gold",
      expectedOutput: "HUD\\|HP:100\\|Gold:10\\|Room:0",
      isPattern: true,
    },
    {
      id: "g9",
      description: "GAME_MESSAGE shows 4 spawned, 1 defeated",
      expectedOutput: "GAME_MESSAGE\\|Factory spawned 4 entities, 1 defeated",
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
    "Create enemies in order: factory.create(type, x, y). Store each in enemies[i].",
    "Grid render: nested loop, check each enemy's alive flag and position. Use enemy.symbol.",
    "Remaining HP: sum enemies[i].hp where alive==true. goblin2(20) + skeleton(40) + dragon(200) = 260.",
  ],

  accumulatedCode: `// ==============================
// RPG CORE — Lesson 29
// Factory Pattern: Data Wears Costumes
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

// ─── include/factory.h ───

struct Entity {
    string name;
    int hp;
    int attack;
    int goldDrop;
    char symbol;
    int x, y;
    bool alive;
};

struct EntityFactory {
    int totalCreated = 0;

    Entity create(string type, int x, int y) {
        Entity e;
        if (type == "goblin") {
            e = {"Goblin", 20, 5, 10, 'G', x, y, true};
        } else if (type == "skeleton") {
            e = {"Skeleton", 40, 8, 20, 'S', x, y, true};
        } else if (type == "dragon") {
            e = {"Dragon", 200, 25, 100, 'D', x, y, true};
        } else {
            e = {"Unknown", 1, 1, 0, '?', x, y, true};
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
// #include "factory.h"

// === DIAGNOSTICS ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
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

    EntityFactory factory;

    // === ENTITIES ===
    const int MAX_ENEMIES = 4;
    Entity enemies[MAX_ENEMIES];
    enemies[0] = factory.create("goblin", 5, 3);
    enemies[1] = factory.create("goblin", 12, 3);
    enemies[2] = factory.create("skeleton", 8, 6);
    enemies[3] = factory.create("dragon", 15, 5);

    int playerX = 1, playerY = 5;
    int playerHP = 100, playerGold = 0;
    int defeated = 0;

    // === RENDER ===
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerX && row == playerY) {
                cout << '@';
            } else {
                char cell = '.';
                for (int i = 0; i < MAX_ENEMIES; i++) {
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
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // === COMBAT ===
    int damage = 10;
    for (int i = 0; i < 2; i++) {
        enemies[0].hp -= damage;
        cout << "Attack! " << enemies[0].name << " HP: " << enemies[0].hp << endl;
    }
    enemies[0].alive = false;
    defeated++;
    playerGold += enemies[0].goldDrop;
    cout << "[FACTORY] " << enemies[0].name << " defeated. Loot: "
         << enemies[0].goldDrop << " gold" << endl;

    int remainingHP = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemies[i].alive) remainingHP += enemies[i].hp;
    }
    cout << "Remaining enemy HP: " << remainingHP << endl;

    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;
    cout << "GAME_MESSAGE|Factory spawned " << factory.totalCreated
         << " entities, " << defeated << " defeated" << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,
};
