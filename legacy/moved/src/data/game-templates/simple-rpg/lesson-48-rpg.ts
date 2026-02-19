import type { GameLessonVariant } from "@/types/game";

export const lesson48RPG: GameLessonVariant = {
  lessonId: "rpg-48-quest-rewards",

  instructions: `# Quest Rewards and Leveling — The Progression Loop

## Mental Model

There is a pattern here that makes RPGs addictive. The quest is the checklist. The reward is the dopamine. When all objectives are complete, the system fires a completion event. Gold goes to the wallet. XP goes to the experience pool. Then XP crosses a threshold and the player levels up. Leveling increases stats. Higher stats enable harder quests. This is the progression loop — the beating heart of every RPG.

The reward system is a state machine with three transitions. First: all objectives complete triggers quest complete. Second: quest complete triggers reward distribution. Third: XP accumulation triggers level up. Each transition is simple. Together, they create the illusion of growth.

## What Breaks Without This

Without rewards, quests are chores. The player kills goblins and nothing happens. No gold, no XP, no level up. The progression loop is broken. Rewards are the incentive structure. Without incentives, the game loop halts.

## The Fix

When all objectives are done, set status to COMPLETE, distribute rewards (gold + XP), then check if XP crosses a level threshold. Level formula: newLevel = totalXP / 100 + 1. On level up: maxHP += 10, attack += 2.

## Pattern Insight

The reward is the Command pattern in reverse. The quest defines the reward at creation time. The completion system delivers it later. The temporal gap is what makes it data-driven. Change rewards in the data file, delivery code stays the same.

## Scalability Insight

Adding new reward types (items, abilities, reputation) means adding new fields to Quest and new lines in checkQuestCompletion. The structure stays the same. Reward types are additive.

## Your Task

1. Player starts: Level 1, XP:0, HP:40, ATK:8, Gold:0
2. Quest Q1: Goblin Slayer (KILL:Goblin:3, reward 50g 100xp)
3. Render Room 0 grid: @ at (3,5), E at (8,3)
4. Kill 3 goblins (call onEnemyKilled 3 times)
5. On quest complete: \`QUEST_COMPLETE|Goblin Slayer|+50g +100xp\`
6. Level up: \`LEVEL_UP|Level 2|HP:40->50|ATK:8->10\`
7. Print: \`STATS|Level:2|XP:100|HP:50|ATK:10|Gold:50\`
8. Print: \`REWARD_SYSTEM|ready|1 quest completed\`

## Common Mistake

Checking for level up before distributing XP. The order is: complete quest, add gold, add XP, check level threshold. If you check before adding XP, the player never levels up.

## Elite Insight

Diablo II uses this exact architecture. Quest completion grants fixed rewards from data tables. XP triggers level-up with stat points. The formula differs (exponential curve), but the architecture is identical.

## Pattern Recognition

The level-up check is a Threshold pattern. Accumulate XP. When it crosses a boundary (100 per level), trigger a state change and apply side effects. This pattern appears everywhere: rage meters, day/night cycles, health warnings.

## Skill Reinforcement

- Completion check: all-objectives-done predicate
- Reward distribution: ordered state mutations
- Threshold detection: integer division for level calculation
- Stat scaling: deterministic formulas for growth

## Mastery Check

Why separate gold and XP instead of one "reward points" value? Because they serve different purposes. Gold is consumable (shops). XP is permanent (levels). Conflating them makes the economy incoherent.`,

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

// TODO: Implement onEnemyKilled
// TODO: Implement checkQuestCompletion with level-up
// TODO: Implement renderGrid

int main() {
    int playerLevel = 1, playerXP = 0;
    int playerMaxHP = 40, playerAttack = 8;
    int playerGold = 0;

    Quest quests[1];
    quests[0] = {"Q1", "Goblin Slayer", "Clear the goblin threat",
                 {{KILL, "Goblin", 3, 0}}, 1, 50, 100, ACTIVE};

    // TODO: Render, kill goblins, complete quest, level up
    // TODO: Print STATS and REWARD_SYSTEM

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

void renderGrid(int px, int py, int ex, int ey, bool eAlive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (eAlive && col == ex && row == ey)
                cout << 'E';
            else
                cout << '.';
        }
        cout << endl;
    }
}

int main() {
    int playerLevel = 1, playerXP = 0;
    int playerMaxHP = 40, playerAttack = 8;
    int playerGold = 0;

    Quest quests[1];
    quests[0] = {"Q1", "Goblin Slayer", "Clear the goblin threat",
                 {{KILL, "Goblin", 3, 0}}, 1, 50, 100, ACTIVE};
    int questCount = 1;

    // Render
    renderGrid(3, 5, 8, 3, true);
    cout << "HUD|HP:" << playerMaxHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // Kill 3 goblins
    onEnemyKilled(quests, questCount, "Goblin");
    onEnemyKilled(quests, questCount, "Goblin");
    onEnemyKilled(quests, questCount, "Goblin");

    // Check completion
    checkQuestCompletion(quests[0], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);

    // Final stats
    cout << "STATS|Level:" << playerLevel
         << "|XP:" << playerXP
         << "|HP:" << playerMaxHP
         << "|ATK:" << playerAttack
         << "|Gold:" << playerGold << endl;

    int completed = 0;
    for (int i = 0; i < questCount; i++) {
        if (quests[i].status == COMPLETE) completed++;
    }
    cout << "REWARD_SYSTEM|ready|" << completed << " quest completed" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Quest complete with gold and XP rewards",
      expectedOutput: "QUEST_COMPLETE\\|Goblin Slayer\\|\\+50g \\+100xp",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Level up to Level 2 with stat increases",
      expectedOutput: "LEVEL_UP\\|Level 2\\|HP:40->50\\|ATK:8->10",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Reward system reports 1 quest completed",
      expectedOutput: "REWARD_SYSTEM\\|ready\\|1 quest completed",
      isPattern: true,
    },
  ],

  hints: [
    "Call onEnemyKilled 3 times to fill the objective, then checkQuestCompletion to trigger rewards.",
    "In checkQuestCompletion: distribute gold and XP BEFORE checking level up. The level check uses updated playerXP.",
    "Level formula: newLevel = playerXP / 100 + 1. With 100 XP: newLevel = 2. Since 2 > 1, level up fires.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

// ==============================
// RPG CORE — Lesson 48
// Quest Rewards: completion, gold, XP, level-up
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

// === GRID RENDER ===
void renderGrid(int px, int py, int ex, int ey, bool eAlive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (eAlive && col == ex && row == ey)
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
    int playerLevel = 1, playerXP = 0;
    int playerMaxHP = 40, playerAttack = 8;
    int playerGold = 0;

    Quest quests[1];
    quests[0] = {"Q1", "Goblin Slayer", "Clear the goblin threat",
                 {{KILL, "Goblin", 3, 0}}, 1, 50, 100, ACTIVE};
    int questCount = 1;

    renderGrid(3, 5, 8, 3, true);
    cout << "HUD|HP:" << playerMaxHP << "|Gold:" << playerGold << "|Room:0" << endl;

    onEnemyKilled(quests, questCount, "Goblin");
    onEnemyKilled(quests, questCount, "Goblin");
    onEnemyKilled(quests, questCount, "Goblin");

    checkQuestCompletion(quests[0], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);

    cout << "STATS|Level:" << playerLevel
         << "|XP:" << playerXP
         << "|HP:" << playerMaxHP
         << "|ATK:" << playerAttack
         << "|Gold:" << playerGold << endl;

    cout << "REWARD_SYSTEM|ready|1 quest completed" << endl;

    return 0;
}
`,
};
