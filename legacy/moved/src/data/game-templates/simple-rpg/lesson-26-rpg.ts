import type { GameLessonVariant } from "@/types/game";

export const lesson26RPG: GameLessonVariant = {
  lessonId: "rpg-26-observer-pattern",

  instructions: `# Observer Pattern -- Events Decouple Everything

## Mental Model

There's a pattern here. The player attacks, and the HUD updates, the score increments, and the combat log prints. Three reactions to one action. Without the Observer pattern, the attack code calls all three directly. Tight coupling. Add a fourth system and you edit the attack function. Add a fifth and you edit it again.

The Observer pattern says: "I do not know who is listening. I just announce what happened." Observers subscribe to event types. When an event fires, every subscriber gets notified. The publisher does not know the subscribers. The subscribers do not know each other. The event system is the only coupling point. That is decoupling. That is the pattern.

## What Breaks Without This

Without observers, the attack function looks like this:

\`\`\`cpp
void attack() {
    // damage logic
    updateHUD();      // coupled
    addScore();       // coupled
    printLog();       // coupled
    spawnLoot();      // coupled
    checkAchievement(); // coupled
}
\`\`\`

Five dependencies. Change any downstream system signature and you fix the attack function. The Observer pattern reduces this to:

\`\`\`cpp
void attack() {
    // damage logic
    events.notify("damage_dealt", 10); // one call, zero coupling
}
\`\`\`

## The Fix

EventSystem with subscribe/notify. Subscribe once at init. Notify at action sites. The fan-out happens automatically. New systems subscribe without touching existing code.

## Pattern Insight

The Observer is a Gang of Four classic. JavaScript DOM events, C# delegates, Unity UnityEvent, Unreal delegates, Godot signals -- all observers. Every GUI framework, every game engine, every reactive UI library. You are implementing the structural foundation they all share.

## Scalability Insight

Adding an "AchievementSystem" observer: one line. \`events.subscribe("AchievementSystem")\`. No event dispatch changes. No existing observer changes. O(1) to add a feature. That is the power of decoupling through events.

## Your Task

Build the event-driven dungeon sequence:

**Setup:**
- EventSystem with 3 observers: "HUD", "ScoreSystem", "CombatLog"
- Player at (3,5), HP 100, Gold 0. Enemy at (10,3), HP 30.

**Sequence:**
1. Render 20x10 grid with @ at (3,5) and E at (10,3)
2. \`HUD|HP:100|Gold:0|Room:0\`
3. Move player to (9,3) -- notify \`player_moved\` value 1
4. Attack 3x10 dmg -- notify \`damage_dealt\` value 10 each time
5. Enemy dies -- notify \`enemy_killed\` value 1
6. Gold pickup at (10,3) -- notify \`gold_collected\` value 25
7. \`HUD|HP:100|Gold:25|Room:0\`
8. \`GAME_MESSAGE|Events dispatched: 6\`
9. \`SCORE|150\`

## Common Mistake

Firing enemy_killed before setting enemyAlive=false. The event should reflect post-kill state. Update first, notify second. Observers that check state during notification need current values, not stale ones.

## Elite Insight

Production event systems carry typed payloads: {source, target, amount, damageType, isCritical}. Your int value is a simplified payload. The subscribe/notify skeleton is identical at any scale. The payload grows; the architecture does not change.

## Pattern Recognition

"When X happens, also do Y and Z" -- that "also" is the Observer pattern in disguise. Without observers, "also" means "add another hardcoded call." With observers, "also" means "subscribe another listener." The former couples. The latter decouples.

## Skill Reinforcement

- EventSystem struct: subscribe adds to observer array, notify fans out
- Bounded array with count guard on subscribe
- String-typed event dispatch for flexibility
- Decoupled game actions: move, attack, kill, collect all fire events
- Grid rendering with entity state driven by event consequences

## Mastery Check

Six events fired. Three observers each. Eighteen total notifications. The event system multiplied 6 actions into 18 reactions without the action sites knowing about the reactions. That fan-out is the fundamental power of the Observer pattern.`,

  starterCode: `// ─── include/events.h ───
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

// ─── src/main.cpp ───
// #include "events.h"

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
    EventSystem events;
    // TODO: Subscribe "HUD", "ScoreSystem", "CombatLog"

    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    // TODO: Render initial grid, print HUD|HP:100|Gold:0|Room:0

    // TODO: Move to (9,3), notify player_moved

    // TODO: Attack loop 3x10, notify damage_dealt each
    //       On death: notify enemy_killed, spawn gold

    // TODO: Pickup gold, notify gold_collected
    //       Print updated HUD

    // TODO: GAME_MESSAGE|Events dispatched: 6
    // TODO: SCORE|150

    return 0;
}
`,

  solutionCode: `// ─── include/events.h ───
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

// ─── src/main.cpp ───
// #include "events.h"

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
    EventSystem events;
    events.subscribe("HUD");
    events.subscribe("ScoreSystem");
    events.subscribe("CombatLog");

    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    // Render initial grid
    renderGrid(playerX, playerY, enemyX, enemyY, enemyAlive,
               goldActive, goldX, goldY);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // Move to adjacent
    playerX = 9; playerY = 3;
    events.notify("player_moved", 1);

    // Combat
    int damage = 10;
    for (int i = 0; i < 3; i++) {
        enemyHP -= damage;
        events.notify("damage_dealt", 10);
        if (enemyHP <= 0 && enemyAlive) {
            enemyAlive = false;
            events.notify("enemy_killed", 1);
            goldX = enemyX; goldY = enemyY;
            goldActive = true;
        }
    }

    // Pickup
    playerX = goldX; playerY = goldY;
    if (goldActive) {
        playerGold += 25;
        goldActive = false;
        events.notify("gold_collected", 25);
    }

    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;
    cout << "GAME_MESSAGE|Events dispatched: " << events.eventCount << endl;
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
      description: "player_moved event fires",
      expectedOutput: "\\[EVENT\\] player_moved: 1",
      isPattern: true,
    },
    {
      id: "g4",
      description: "damage_dealt event fires with value 10",
      expectedOutput: "\\[EVENT\\] damage_dealt: 10",
      isPattern: true,
    },
    {
      id: "g5",
      description: "enemy_killed event fires",
      expectedOutput: "\\[EVENT\\] enemy_killed: 1",
      isPattern: true,
    },
    {
      id: "g6",
      description: "gold_collected event fires with value 25",
      expectedOutput: "\\[EVENT\\] gold_collected: 25",
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
      description: "GAME_MESSAGE shows 6 events dispatched",
      expectedOutput: "GAME_MESSAGE\\|Events dispatched: 6",
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
    "Subscribe all 3 observers before any game actions. Order: subscribe, render, then events.",
    "Attack loop: 3 iterations of 10 dmg. Each fires damage_dealt. Inside the loop, check enemyHP <= 0 && enemyAlive to fire enemy_killed once.",
    "Total events: 1 player_moved + 3 damage_dealt + 1 enemy_killed + 1 gold_collected = 6.",
  ],

  accumulatedCode: `// ==============================
// RPG CORE — Lesson 26
// Observer Pattern: Events Decouple Everything
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

// ─── src/main.cpp ───
// #include "events.h"

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

    // === PLAYER ===
    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;

    // === ENEMY ===
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;

    // === LOOT ===
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    // === PERSISTENT STATE ===
    int room = 0;

    // === RENDER ===
    renderGrid(playerX, playerY, enemyX, enemyY, enemyAlive,
               goldActive, goldX, goldY);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:" << room << endl;

    // === MOVE ===
    playerX = 9; playerY = 3;
    events.notify("player_moved", 1);

    // === COMBAT ===
    int damage = 10;
    for (int i = 0; i < 3; i++) {
        enemyHP -= damage;
        events.notify("damage_dealt", 10);
        if (enemyHP <= 0 && enemyAlive) {
            enemyAlive = false;
            events.notify("enemy_killed", 1);
            goldX = enemyX; goldY = enemyY;
            goldActive = true;
        }
    }

    // === PICKUP ===
    playerX = goldX; playerY = goldY;
    if (goldActive) {
        playerGold += 25;
        goldActive = false;
        events.notify("gold_collected", 25);
    }

    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:" << room << endl;
    cout << "GAME_MESSAGE|Events dispatched: " << events.eventCount << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,
};
