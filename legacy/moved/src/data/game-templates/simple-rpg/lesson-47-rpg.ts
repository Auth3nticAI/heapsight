import type { GameLessonVariant } from "@/types/game";

export const lesson47RPG: GameLessonVariant = {
  lessonId: "rpg-47-quest-tracker",

  instructions: `# Quest Tracker — Event-Driven Progress

## Mental Model

There is a pattern here that separates toy quest systems from real ones. The player kills a goblin. Somewhere a counter increments. But where? Not in the combat function. Not in the enemy death handler. Not in the quest itself. The quest tracker is a separate system that observes game events. Combat fires "enemy killed: Goblin." The tracker scans active quests, finds any KILL:Goblin objective, increments the counter. Combat never knows quests exist. Quests never know combat exists. They communicate through events. This is the Observer pattern.

Think of the quest tracker as a journalist at a sporting event. The journalist does not play the game. The journalist watches and takes notes. When the score changes, the journalist updates the scoreboard. The quest tracker is the journalist. Game events are the game. Quest progress is the scoreboard.

## What Breaks Without This

Without event-based tracking, quest logic invades every system. The combat function checks objectives. Movement checks objectives. Inventory checks objectives. Every system acquires quest code. Change the quest format and you touch everything. The Observer pattern eliminates this coupling.

## The Fix

Create event handler functions: onEnemyKilled, onRoomEntered, onItemCollected. Each scans active quests for matching objectives and increments counters.

## Pattern Insight

The tracker is a message broker. Game systems publish events. The tracker subscribes and routes them to quest objectives. Pub/sub pattern — the foundation of every event system.

## Scalability Insight

With 100 active quests, scanning all per event is 400 comparisons (4 objectives each). Microseconds on modern hardware. The linear scan is correct for quest counts under 10,000.

## Your Task

1. Load and activate quest Q1 (Goblin Slayer: KILL:Goblin:3)
2. Render Room 0 grid: @ at (3,5), E at (8,3)
3. Player moves to (7,3), attacks enemy: 3 hits of 10 dmg
4. Enemy dies → onEnemyKilled fires: \`QUEST_PROGRESS|Q1|KILL:Goblin:1/3\`
5. Room transition to Room 1, kill 2 more goblins at (5,4) and (12,4)
6. Third kill: \`OBJECTIVE_COMPLETE|Q1|KILL:Goblin:3/3\`
7. Print: \`QUEST_TRACKER|active:1|checking:1 quests\`

## Common Mistake

Calling onEnemyKilled before setting enemyAlive to false. The kill event fires when the enemy dies (HP <= 0), not before. State change first, then event notification.

## Elite Insight

Unity's UnityEvent and Unreal's delegate system implement this exact pattern. Game designers wire quest trackers to combat events in visual editors. The underlying code is identical to yours.

## Pattern Recognition

onEnemyKilled, onRoomEntered, and onItemCollected share the same structure: scan, match, increment, report. This is a Template Method waiting to be extracted.

## Skill Reinforcement

- Observer pattern: tracker watches events without coupling to sources
- Linear scan: iterate active quests per event, filter by type
- Guard clauses: skip inactive quests, skip completed objectives
- Progress reporting: current/required count formatting

## Mastery Check

Why does the tracker scan ALL active quests per event instead of maintaining a lookup table? Because the scan is simple, correct, and fast enough. A lookup adds complexity for performance not needed. Optimize when the profiler says so.`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

enum ObjectiveType { KILL, COLLECT, REACH, TALK };
enum QuestStatus { INACTIVE, ACTIVE, COMPLETE };

struct Objective {
    ObjectiveType type;
    string target;
    int required;
    int current;
};

struct Quest {
    string id;
    string title;
    string description;
    Objective objectives[4];
    int objectiveCount;
    int rewardGold;
    int rewardXP;
    QuestStatus status;
};

string typeStr(ObjectiveType t) {
    switch (t) {
        case KILL: return "KILL";
        case COLLECT: return "COLLECT";
        case REACH: return "REACH";
        case TALK: return "TALK";
    }
    return "UNKNOWN";
}

// TODO: Implement onEnemyKilled — scan active quests, match KILL objectives
// TODO: Implement renderGrid with enemies

int main() {
    Quest quests[1];
    quests[0] = {"Q1", "Goblin Slayer", "Clear the goblin threat",
                 {{KILL, "Goblin", 3, 0}}, 1, 50, 100, ACTIVE};
    int questCount = 1;

    // TODO: Render Room 0, combat, event tracking
    // TODO: Room 1 combat, complete objective
    // TODO: Print QUEST_TRACKER status

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum ObjectiveType { KILL, COLLECT, REACH, TALK };
enum QuestStatus { INACTIVE, ACTIVE, COMPLETE };

struct Objective {
    ObjectiveType type;
    string target;
    int required;
    int current;
};

struct Quest {
    string id;
    string title;
    string description;
    Objective objectives[4];
    int objectiveCount;
    int rewardGold;
    int rewardXP;
    QuestStatus status;
};

string typeStr(ObjectiveType t) {
    switch (t) {
        case KILL: return "KILL";
        case COLLECT: return "COLLECT";
        case REACH: return "REACH";
        case TALK: return "TALK";
    }
    return "UNKNOWN";
}

void onEnemyKilled(Quest quests[], int count, const string& enemyType) {
    for (int i = 0; i < count; i++) {
        if (quests[i].status != ACTIVE) continue;
        for (int j = 0; j < quests[i].objectiveCount; j++) {
            Objective& obj = quests[i].objectives[j];
            if (obj.type == KILL && obj.target == enemyType
                && obj.current < obj.required) {
                obj.current++;
                cout << "QUEST_PROGRESS|" << quests[i].id << "|"
                     << typeStr(obj.type) << ":" << obj.target
                     << ":" << obj.current << "/" << obj.required << endl;
                if (obj.current == obj.required) {
                    cout << "OBJECTIVE_COMPLETE|" << quests[i].id << "|"
                         << typeStr(obj.type) << ":" << obj.target
                         << ":" << obj.current << "/" << obj.required << endl;
                }
            }
        }
    }
}

void renderGrid(int px, int py,
                int ex1, int ey1, bool e1,
                int ex2, int ey2, bool e2) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (e1 && col == ex1 && row == ey1)
                cout << 'E';
            else if (e2 && col == ex2 && row == ey2)
                cout << 'E';
            else
                cout << '.';
        }
        cout << endl;
    }
}

int main() {
    Quest quests[1];
    quests[0] = {"Q1", "Goblin Slayer", "Clear the goblin threat",
                 {{KILL, "Goblin", 3, 0}}, 1, 50, 100, ACTIVE};
    int questCount = 1;

    // === Room 0 ===
    int playerX = 3, playerY = 5;
    int e1x = 8, e1y = 3, e1hp = 30;
    bool e1alive = true;
    renderGrid(playerX, playerY, e1x, e1y, e1alive, -1, -1, false);
    cout << "HUD|HP:100|Gold:0|Room:0" << endl;

    // Move and attack
    playerX = 7; playerY = 3;
    cout << "Player moved to (7,3)" << endl;
    for (int i = 0; i < 3; i++) {
        e1hp -= 10;
        cout << "Attack! Enemy HP: " << e1hp << endl;
    }
    e1alive = false;
    cout << "Enemy defeated!" << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    // === Room 1 ===
    cout << "Room transition: 0 -> 1" << endl;
    playerX = 1; playerY = 5;
    int e2x = 5, e2y = 4, e2hp = 30; bool e2alive = true;
    int e3x = 12, e3y = 4, e3hp = 30; bool e3alive = true;
    renderGrid(playerX, playerY, e2x, e2y, e2alive, e3x, e3y, e3alive);
    cout << "HUD|HP:100|Gold:0|Room:1" << endl;

    // Kill goblin 2
    for (int i = 0; i < 3; i++) e2hp -= 10;
    e2alive = false;
    cout << "Enemy defeated!" << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    // Kill goblin 3
    for (int i = 0; i < 3; i++) e3hp -= 10;
    e3alive = false;
    cout << "Enemy defeated!" << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    // Tracker status
    int activeCount = 0;
    for (int i = 0; i < questCount; i++) {
        if (quests[i].status == ACTIVE) activeCount++;
    }
    cout << "QUEST_TRACKER|active:" << activeCount
         << "|checking:" << questCount << " quests" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "First goblin kill triggers quest progress",
      expectedOutput: "QUEST_PROGRESS\\|Q1\\|KILL:Goblin:1/3",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Third kill completes KILL objective",
      expectedOutput: "OBJECTIVE_COMPLETE\\|Q1\\|KILL:Goblin:3/3",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Quest tracker status shows active count",
      expectedOutput: "QUEST_TRACKER\\|active:1\\|checking:1 quests",
      isPattern: true,
    },
  ],

  hints: [
    "onEnemyKilled loops through all quests. Skip non-ACTIVE quests. For each objective, check type==KILL and target matches. Only increment if current < required.",
    "Print QUEST_PROGRESS after every increment. Print OBJECTIVE_COMPLETE only when current reaches required.",
    "Call onEnemyKilled once per enemy death. The tracker handles scanning all quests and all objectives automatically.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

// ==============================
// RPG CORE — Lesson 47
// Quest Tracker: event-driven progress updates
// ==============================

// === QUEST ENUMS ===
enum ObjectiveType { KILL, COLLECT, REACH, TALK };
enum QuestStatus { INACTIVE, ACTIVE, COMPLETE };

// === DATA STRUCTURES ===
struct Objective {
    ObjectiveType type;
    string target;
    int required;
    int current;
};

struct Quest {
    string id;
    string title;
    string description;
    Objective objectives[4];
    int objectiveCount;
    int rewardGold;
    int rewardXP;
    QuestStatus status;
};

// === HELPER FUNCTIONS ===
string typeStr(ObjectiveType t) {
    switch (t) {
        case KILL: return "KILL";
        case COLLECT: return "COLLECT";
        case REACH: return "REACH";
        case TALK: return "TALK";
    }
    return "UNKNOWN";
}

string statusStr(QuestStatus s) {
    switch (s) {
        case INACTIVE: return "INACTIVE";
        case ACTIVE: return "ACTIVE";
        case COMPLETE: return "COMPLETE";
    }
    return "UNKNOWN";
}

// === EVENT HANDLERS — Observer Pattern ===
void onEnemyKilled(Quest quests[], int count, const string& enemyType) {
    for (int i = 0; i < count; i++) {
        if (quests[i].status != ACTIVE) continue;
        for (int j = 0; j < quests[i].objectiveCount; j++) {
            Objective& obj = quests[i].objectives[j];
            if (obj.type == KILL && obj.target == enemyType
                && obj.current < obj.required) {
                obj.current++;
                cout << "QUEST_PROGRESS|" << quests[i].id << "|"
                     << typeStr(obj.type) << ":" << obj.target
                     << ":" << obj.current << "/" << obj.required << endl;
                if (obj.current == obj.required) {
                    cout << "OBJECTIVE_COMPLETE|" << quests[i].id << "|"
                         << typeStr(obj.type) << ":" << obj.target
                         << ":" << obj.current << "/" << obj.required << endl;
                }
            }
        }
    }
}

void onRoomEntered(Quest quests[], int count, const string& roomName) {
    for (int i = 0; i < count; i++) {
        if (quests[i].status != ACTIVE) continue;
        for (int j = 0; j < quests[i].objectiveCount; j++) {
            Objective& obj = quests[i].objectives[j];
            if (obj.type == REACH && obj.target == roomName
                && obj.current < obj.required) {
                obj.current++;
                cout << "QUEST_PROGRESS|" << quests[i].id << "|"
                     << typeStr(obj.type) << ":" << obj.target
                     << ":" << obj.current << "/" << obj.required << endl;
                if (obj.current == obj.required) {
                    cout << "OBJECTIVE_COMPLETE|" << quests[i].id << "|"
                         << typeStr(obj.type) << ":" << obj.target
                         << ":" << obj.current << "/" << obj.required << endl;
                }
            }
        }
    }
}

void onItemCollected(Quest quests[], int count, const string& itemName) {
    for (int i = 0; i < count; i++) {
        if (quests[i].status != ACTIVE) continue;
        for (int j = 0; j < quests[i].objectiveCount; j++) {
            Objective& obj = quests[i].objectives[j];
            if (obj.type == COLLECT && obj.target == itemName
                && obj.current < obj.required) {
                obj.current++;
                cout << "QUEST_PROGRESS|" << quests[i].id << "|"
                     << typeStr(obj.type) << ":" << obj.target
                     << ":" << obj.current << "/" << obj.required << endl;
                if (obj.current == obj.required) {
                    cout << "OBJECTIVE_COMPLETE|" << quests[i].id << "|"
                         << typeStr(obj.type) << ":" << obj.target
                         << ":" << obj.current << "/" << obj.required << endl;
                }
            }
        }
    }
}

// === GRID RENDER ===
void renderGrid(int px, int py,
                int ex1, int ey1, bool e1,
                int ex2, int ey2, bool e2) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (e1 && col == ex1 && row == ey1)
                cout << 'E';
            else if (e2 && col == ex2 && row == ey2)
                cout << 'E';
            else
                cout << '.';
        }
        cout << endl;
    }
}

// === DIAGNOSTICS ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

int main() {
    Quest quests[1];
    quests[0] = {"Q1", "Goblin Slayer", "Clear the goblin threat",
                 {{KILL, "Goblin", 3, 0}}, 1, 50, 100, ACTIVE};
    int questCount = 1;

    int playerX = 3, playerY = 5;
    renderGrid(playerX, playerY, 8, 3, true, -1, -1, false);
    cout << "HUD|HP:100|Gold:0|Room:0" << endl;

    playerX = 7; playerY = 3;
    cout << "Player moved to (7,3)" << endl;
    for (int i = 0; i < 3; i++) cout << "Attack! Enemy HP: " << (30 - (i+1)*10) << endl;
    cout << "Enemy defeated!" << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    cout << "Room transition: 0 -> 1" << endl;
    renderGrid(1, 5, 5, 4, true, 12, 4, true);
    cout << "HUD|HP:100|Gold:0|Room:1" << endl;

    cout << "Enemy defeated!" << endl;
    onEnemyKilled(quests, questCount, "Goblin");
    cout << "Enemy defeated!" << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    cout << "QUEST_TRACKER|active:1|checking:" << questCount << " quests" << endl;

    return 0;
}
`,
};
