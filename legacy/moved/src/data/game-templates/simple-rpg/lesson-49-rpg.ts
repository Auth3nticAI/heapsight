import type { GameLessonVariant } from "@/types/game";

export const lesson49RPG: GameLessonVariant = {
  lessonId: "rpg-49-quest-chains",

  instructions: `# Quest Chains — Linked Adventures

## Mental Model

There is a pattern here that turns a bag of quests into a story. A quest chain is a linked list of adventures. Quest A unlocks Quest B. Quest B unlocks Quest C. The player cannot skip ahead. The chain enforces narrative order. "Clear the Cave" must happen before "Find the Artifact" because the artifact is inside the cleared cave. The dependency is logical, not arbitrary. The quest chain data structure encodes narrative logic as data.

Think of quest chains like chapters in a book. Chapter 2 assumes you read Chapter 1. Similarly, Quest 2 assumes Quest 1 is complete. The chain provides narrative context through ordering. Data-driven storytelling.

## What Breaks Without This

Without chains, all quests are available simultaneously. The player can "Find the Artifact" before "Clear the Cave." This breaks narrative logic and gameplay balance. Quest chains enforce the intended experience order.

## The Fix

Add a prerequisite field to the Quest struct. After completing any quest, scan all INACTIVE quests. If their prerequisite is now COMPLETE, activate them.

## Pattern Insight

Quest chains implement the Chain of Responsibility pattern. Each quest handles one piece of the narrative. When it completes, it passes responsibility to the next. The chain is data: an array with prerequisite links. The runtime behavior is emergent.

## Scalability Insight

Adding a branch (A unlocks both B and C) requires no code changes. Both B and C have prerequisite "A". When A completes, both activate. Branching is free. The linear scan handles all topologies.

## Your Task

1. Print initial status: Q1 ACTIVE, Q2 INACTIVE, Q3 INACTIVE
2. NPC Elder in Room 0: \`NPC|Elder|I need you to clear the cave of goblins.\`
3. Render Room 0 grid: @ at (3,5), N at (5,4), E at (12,3), E at (15,3)
4. Kill 2 goblins → Q1 complete → Q2 unlocks
5. \`CHAIN_UNLOCK|Q2|Find the Artifact|prerequisite Q1 complete\`
6. Room transition to Room 1 (ArtifactRoom) → Q2 complete → Q3 unlocks
7. \`CHAIN_UNLOCK|Q3|Return to Elder|prerequisite Q2 complete\`
8. Room transition back → Talk to Elder → Q3 complete
9. \`NPC|Elder|The dungeon is safe. You are a true hero!\`
10. \`CHAIN_COMPLETE|The Dungeon Saga|3 quests|+120g +225xp\`
11. \`QUEST_CHAIN|complete|all prerequisites satisfied\`

## Common Mistake

Forgetting to call checkChainUnlocks after each completion. If the check does not run, dependent quests stay INACTIVE even though their prerequisite is COMPLETE. Always: complete → unlock check.

## Elite Insight

World of Warcraft's quest chains span 30+ hours. Each quest has a prerequisite field in the database. The unlock check runs server-side after every completion. Your 3-quest chain uses identical architecture.

## Pattern Recognition

The prerequisite field creates a Directed Acyclic Graph. Q1 to Q2 to Q3 is linear. Q1 to Q2 and Q1 to Q3 is a fork. The quest system is a DAG executor. Same architecture as build systems and task schedulers.

## Skill Reinforcement

- Prerequisite modeling: string ID references between quests
- Chain unlock detection: scan INACTIVE quests after each completion
- NPC dialogue states: different text based on quest progress
- Accumulated rewards: chain totals across all linked quests

## Mastery Check

Why store a quest ID string instead of a pointer? Because data references survive reallocation, serialization, and save/load. In data-driven systems, reference by ID, never by address.`,

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
    string prerequisite;
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

string statusStr(QuestStatus s) {
    switch (s) {
        case INACTIVE: return "INACTIVE";
        case ACTIVE: return "ACTIVE";
        case COMPLETE: return "COMPLETE";
    }
    return "UNKNOWN";
}

// TODO: Implement event handlers, completion check, chain unlocks
// TODO: Implement renderGrid with NPC + enemies

int main() {
    int playerGold = 0, playerXP = 0;
    int playerLevel = 1, playerMaxHP = 40, playerAttack = 8;

    Quest quests[3];
    quests[0] = {"Q1", "Clear the Cave", "Defeat the goblins",
                 {{KILL, "Goblin", 2, 0}}, 1, 30, 50, "", ACTIVE};
    quests[1] = {"Q2", "Find the Artifact", "Reach the artifact room",
                 {{REACH, "ArtifactRoom", 1, 0}}, 1, 40, 75, "Q1", INACTIVE};
    quests[2] = {"Q3", "Return to Elder", "Report back",
                 {{TALK, "Elder", 1, 0}}, 1, 50, 100, "Q2", INACTIVE};
    int questCount = 3;

    // TODO: Full chain adventure across rooms

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
    string prerequisite;
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

string statusStr(QuestStatus s) {
    switch (s) {
        case INACTIVE: return "INACTIVE";
        case ACTIVE: return "ACTIVE";
        case COMPLETE: return "COMPLETE";
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

void onNPCTalked(Quest quests[], int count, const string& npcName) {
    for (int i = 0; i < count; i++) {
        if (quests[i].status != ACTIVE) continue;
        for (int j = 0; j < quests[i].objectiveCount; j++) {
            Objective& obj = quests[i].objectives[j];
            if (obj.type == TALK && obj.target == npcName
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

void checkQuestCompletion(Quest& q, int& playerGold, int& playerXP,
                          int& playerLevel, int& playerMaxHP, int& playerAttack) {
    if (q.status != ACTIVE) return;
    bool allDone = true;
    for (int i = 0; i < q.objectiveCount; i++) {
        if (q.objectives[i].current < q.objectives[i].required) {
            allDone = false;
            break;
        }
    }
    if (allDone) {
        q.status = COMPLETE;
        playerGold += q.rewardGold;
        playerXP += q.rewardXP;
        cout << "QUEST_COMPLETE|" << q.title << "|+"
             << q.rewardGold << "g +" << q.rewardXP << "xp" << endl;
        int newLevel = playerXP / 100 + 1;
        if (newLevel > playerLevel) {
            int oldHP = playerMaxHP;
            int oldATK = playerAttack;
            playerMaxHP += (newLevel - playerLevel) * 10;
            playerAttack += (newLevel - playerLevel) * 2;
            playerLevel = newLevel;
            cout << "LEVEL_UP|Level " << playerLevel
                 << "|HP:" << oldHP << "->" << playerMaxHP
                 << "|ATK:" << oldATK << "->" << playerAttack << endl;
        }
    }
}

void checkChainUnlocks(Quest quests[], int count) {
    for (int i = 0; i < count; i++) {
        if (quests[i].status != INACTIVE) continue;
        if (quests[i].prerequisite == "") continue;
        for (int j = 0; j < count; j++) {
            if (quests[j].id == quests[i].prerequisite
                && quests[j].status == COMPLETE) {
                quests[i].status = ACTIVE;
                cout << "CHAIN_UNLOCK|" << quests[i].id << "|"
                     << quests[i].title << "|prerequisite "
                     << quests[i].prerequisite << " complete" << endl;
            }
        }
    }
}

void renderGrid(int px, int py, int npcX, int npcY,
                int ex1, int ey1, bool e1,
                int ex2, int ey2, bool e2) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (col == npcX && row == npcY)
                cout << 'N';
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
    int playerGold = 0, playerXP = 0;
    int playerLevel = 1, playerMaxHP = 40, playerAttack = 8;

    Quest quests[3];
    quests[0] = {"Q1", "Clear the Cave", "Defeat the goblins",
                 {{KILL, "Goblin", 2, 0}}, 1, 30, 50, "", ACTIVE};
    quests[1] = {"Q2", "Find the Artifact", "Reach the artifact room",
                 {{REACH, "ArtifactRoom", 1, 0}}, 1, 40, 75, "Q1", INACTIVE};
    quests[2] = {"Q3", "Return to Elder", "Report back",
                 {{TALK, "Elder", 1, 0}}, 1, 50, 100, "Q2", INACTIVE};
    int questCount = 3;

    // Initial status
    for (int i = 0; i < questCount; i++) {
        cout << "QUEST_STATUS|" << quests[i].id << "|"
             << quests[i].title << "|" << statusStr(quests[i].status) << endl;
    }

    // Room 0: NPC and Goblins
    cout << "NPC|Elder|I need you to clear the cave of goblins." << endl;
    renderGrid(3, 5, 5, 4, 12, 3, true, 15, 3, true);
    cout << "HUD|HP:" << playerMaxHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // Kill 2 goblins
    onEnemyKilled(quests, questCount, "Goblin");
    onEnemyKilled(quests, questCount, "Goblin");
    checkQuestCompletion(quests[0], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);
    checkChainUnlocks(quests, questCount);

    // Room 1: Artifact Room
    cout << "Room transition: 0 -> 1" << endl;
    onRoomEntered(quests, questCount, "ArtifactRoom");
    checkQuestCompletion(quests[1], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);
    checkChainUnlocks(quests, questCount);

    // Room 0: Return to Elder
    cout << "Room transition: 1 -> 0" << endl;
    onNPCTalked(quests, questCount, "Elder");
    checkQuestCompletion(quests[2], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);

    cout << "NPC|Elder|The dungeon is safe. You are a true hero!" << endl;

    // Chain complete
    int totalGold = 0, totalXP = 0, completed = 0;
    for (int i = 0; i < questCount; i++) {
        if (quests[i].status == COMPLETE) {
            totalGold += quests[i].rewardGold;
            totalXP += quests[i].rewardXP;
            completed++;
        }
    }
    cout << "CHAIN_COMPLETE|The Dungeon Saga|" << completed
         << " quests|+" << totalGold << "g +" << totalXP << "xp" << endl;
    cout << "QUEST_CHAIN|complete|all prerequisites satisfied" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Q2 unlocks after Q1 prerequisite complete",
      expectedOutput:
        "CHAIN_UNLOCK\\|Q2\\|Find the Artifact\\|prerequisite Q1 complete",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Chain completes with all rewards tallied",
      expectedOutput:
        "CHAIN_COMPLETE\\|The Dungeon Saga\\|3 quests\\|\\+120g \\+225xp",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Quest chain system confirms all satisfied",
      expectedOutput:
        "QUEST_CHAIN\\|complete\\|all prerequisites satisfied",
      isPattern: true,
    },
  ],

  hints: [
    "After each quest completion, call checkChainUnlocks. It scans INACTIVE quests and activates those whose prerequisite is COMPLETE.",
    "The sequence per quest: fire events → checkQuestCompletion → checkChainUnlocks. This order ensures status is COMPLETE before the chain check.",
    "CHAIN_COMPLETE sums rewardGold and rewardXP for all COMPLETE quests: 30+40+50=120 gold, 50+75+100=225 XP.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

// ==============================
// RPG CORE — Lesson 49
// Quest Chains: prerequisite-based sequential unlocking
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
    string prerequisite; // "" = no prerequisite
    QuestStatus status;
};

// === HELPERS ===
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

// === EVENT HANDLERS ===
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

void onNPCTalked(Quest quests[], int count, const string& npcName) {
    for (int i = 0; i < count; i++) {
        if (quests[i].status != ACTIVE) continue;
        for (int j = 0; j < quests[i].objectiveCount; j++) {
            Objective& obj = quests[i].objectives[j];
            if (obj.type == TALK && obj.target == npcName
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

// === QUEST COMPLETION + LEVEL UP ===
void checkQuestCompletion(Quest& q, int& playerGold, int& playerXP,
                          int& playerLevel, int& playerMaxHP, int& playerAttack) {
    if (q.status != ACTIVE) return;
    bool allDone = true;
    for (int i = 0; i < q.objectiveCount; i++) {
        if (q.objectives[i].current < q.objectives[i].required) {
            allDone = false;
            break;
        }
    }
    if (allDone) {
        q.status = COMPLETE;
        playerGold += q.rewardGold;
        playerXP += q.rewardXP;
        cout << "QUEST_COMPLETE|" << q.title << "|+"
             << q.rewardGold << "g +" << q.rewardXP << "xp" << endl;
        int newLevel = playerXP / 100 + 1;
        if (newLevel > playerLevel) {
            int oldHP = playerMaxHP;
            int oldATK = playerAttack;
            playerMaxHP += (newLevel - playerLevel) * 10;
            playerAttack += (newLevel - playerLevel) * 2;
            playerLevel = newLevel;
            cout << "LEVEL_UP|Level " << playerLevel
                 << "|HP:" << oldHP << "->" << playerMaxHP
                 << "|ATK:" << oldATK << "->" << playerAttack << endl;
        }
    }
}

// === CHAIN UNLOCKS ===
void checkChainUnlocks(Quest quests[], int count) {
    for (int i = 0; i < count; i++) {
        if (quests[i].status != INACTIVE) continue;
        if (quests[i].prerequisite == "") continue;
        for (int j = 0; j < count; j++) {
            if (quests[j].id == quests[i].prerequisite
                && quests[j].status == COMPLETE) {
                quests[i].status = ACTIVE;
                cout << "CHAIN_UNLOCK|" << quests[i].id << "|"
                     << quests[i].title << "|prerequisite "
                     << quests[i].prerequisite << " complete" << endl;
            }
        }
    }
}

// === GRID RENDER ===
void renderGrid(int px, int py, int npcX, int npcY,
                int ex1, int ey1, bool e1,
                int ex2, int ey2, bool e2) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (col == npcX && row == npcY)
                cout << 'N';
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
    int playerGold = 0, playerXP = 0;
    int playerLevel = 1, playerMaxHP = 40, playerAttack = 8;

    Quest quests[3];
    quests[0] = {"Q1", "Clear the Cave", "Defeat the goblins",
                 {{KILL, "Goblin", 2, 0}}, 1, 30, 50, "", ACTIVE};
    quests[1] = {"Q2", "Find the Artifact", "Reach the artifact room",
                 {{REACH, "ArtifactRoom", 1, 0}}, 1, 40, 75, "Q1", INACTIVE};
    quests[2] = {"Q3", "Return to Elder", "Report back",
                 {{TALK, "Elder", 1, 0}}, 1, 50, 100, "Q2", INACTIVE};
    int questCount = 3;

    for (int i = 0; i < questCount; i++) {
        cout << "QUEST_STATUS|" << quests[i].id << "|"
             << quests[i].title << "|" << statusStr(quests[i].status) << endl;
    }

    cout << "NPC|Elder|I need you to clear the cave of goblins." << endl;
    renderGrid(3, 5, 5, 4, 12, 3, true, 15, 3, true);

    onEnemyKilled(quests, questCount, "Goblin");
    onEnemyKilled(quests, questCount, "Goblin");
    checkQuestCompletion(quests[0], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);
    checkChainUnlocks(quests, questCount);

    cout << "Room transition: 0 -> 1" << endl;
    onRoomEntered(quests, questCount, "ArtifactRoom");
    checkQuestCompletion(quests[1], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);
    checkChainUnlocks(quests, questCount);

    cout << "Room transition: 1 -> 0" << endl;
    onNPCTalked(quests, questCount, "Elder");
    checkQuestCompletion(quests[2], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);

    cout << "NPC|Elder|The dungeon is safe. You are a true hero!" << endl;

    int totalGold = 0, totalXP = 0, completed = 0;
    for (int i = 0; i < questCount; i++) {
        if (quests[i].status == COMPLETE) {
            totalGold += quests[i].rewardGold;
            totalXP += quests[i].rewardXP;
            completed++;
        }
    }
    cout << "CHAIN_COMPLETE|The Dungeon Saga|" << completed
         << " quests|+" << totalGold << "g +" << totalXP << "xp" << endl;
    cout << "QUEST_CHAIN|complete|all prerequisites satisfied" << endl;

    return 0;
}
`,
};
