import type { GameLessonVariant } from "@/types/game";

export const lesson50RPG: GameLessonVariant = {
  lessonId: "rpg-50-quest-milestone",

  instructions: `# Quest Milestone: Adventure Begins — The Halfway Mark

## THIS IS IT. THE HALFWAY MARK. YOU BUILT AN RPG ENGINE.

Fifty lessons. Grid rendering. Entity management. Combat. Loot economy. Inventory. Equipment. Shops. Crafting. Status effects. NPC dialogue. Room transitions. Save/load. Quest data. Quest tracking. Quest rewards. Quest chains. Level-up progression. Every system fires. Every system works. Every joint holds. This is not a toy program. This is a game engine. The next 50 lessons build content on top of it.

## Mental Model

There is a pattern here that defines what a "game" is versus what a "program" is. A program executes instructions. A game creates an experience through interlocking systems. The player does not see systems. The player sees a story: talk to the Elder, fight goblins, find the artifact, return as a hero. But beneath that story, six systems fire in concert: rendering shows the world, combat resolves fights, quests track progress, chains enforce order, rewards drive progression, leveling provides growth. The story is emergent. The systems are engineered. You engineered the systems.

## What Breaks Without This

This is the integration test for everything. Any system failure breaks the game. Broken rendering: cannot see the dungeon. Broken combat: enemies never die. Broken tracking: objectives never complete. Broken chains: story halts. Broken rewards: no growth. Broken leveling: stats stay flat. Every system is load-bearing.

## The Fix

Build the complete adventure. Five phases. Four rooms. Four quests. Three level-ups. One hero. One story.

## Pattern Insight

The milestone is a vertical slice through every architectural layer. Rendering at the bottom. Game state in the middle. Quest logic at the top. Data flows from input through state through quest events through rewards through stats through rendering. Every layer touches every other through well-defined interfaces. The slice proves the interfaces are correct.

## Scalability Insight

After this milestone, the engine is complete. Adding 10 more rooms, 20 more quests, 50 more enemies requires zero architectural changes. Data drives content. Code drives the engine. They scale independently.

## Your Task (MILESTONE — CELEBRATE THIS)

Build the COMPLETE quest milestone adventure:

**Phase 1 — Room 0 (Village):**
1. Print \`=== QUEST MILESTONE: ADVENTURE BEGINS ===\`
2. Render 20x10 grid: @ at (3,5), N at (8,4), ? at (8,3)
3. \`HUD|HP:40|ATK:8|Gold:0|XP:0|Level:1|Room:Village\`
4. \`NPC|Elder|Brave adventurer! Goblins infest the cave to the east. Slay them, find the lost artifact, and return to me.\`
5. Talk to Elder -> Q1 completes: \`QUEST_COMPLETE|Speak with Elder|+10g +25xp\`
6. Chain unlock: \`CHAIN_UNLOCK|Q2|Slay the Goblins|prerequisite Q1 complete\`

**Phase 2 — Room 1 (Goblin Cave):**
7. \`Room transition: Village -> Goblin Cave\`
8. Render grid: @ at (1,5), E at (6,3), E at (10,4), E at (14,3)
9. \`HUD|HP:40|ATK:8|Gold:10|XP:25|Level:1|Room:Goblin Cave\`
10. Kill 3 goblins (30 HP each, 10 damage per hit, 3 hits each)
11. Each death: \`Enemy defeated! Goblin slain.\` + quest progress
12. After 3rd: \`OBJECTIVE_COMPLETE|Q2|KILL:Goblin:3/3\`
13. \`QUEST_COMPLETE|Slay the Goblins|+50g +100xp\`
14. \`LEVEL_UP|Level 2|HP:40->50|ATK:8->10\`
15. \`CHAIN_UNLOCK|Q3|Retrieve the Artifact|prerequisite Q2 complete\`

**Phase 3 — Room 2 (Artifact Chamber):**
16. \`Room transition: Goblin Cave -> Artifact Chamber\`
17. Render grid: @ at (1,5), ! at (10,4)
18. \`HUD|HP:50|ATK:10|Gold:60|XP:125|Level:2|Room:Artifact Chamber\`
19. Move to artifact -> \`Collected: Ancient Artifact\`
20. \`QUEST_COMPLETE|Retrieve the Artifact|+40g +75xp\`
21. \`LEVEL_UP|Level 3|HP:50->60|ATK:10->12\`
22. \`CHAIN_UNLOCK|Q4|Return to Elder|prerequisite Q3 complete\`

**Phase 4 — Room 0 (Village Return):**
23. \`Room transition: Artifact Chamber -> Village\`
24. Render grid: @ at (3,5), N at (8,4)
25. \`HUD|HP:60|ATK:12|Gold:100|XP:200|Level:3|Room:Village\`
26. Talk to Elder -> \`QUEST_COMPLETE|Return to Elder|+50g +100xp\`
27. \`LEVEL_UP|Level 4|HP:60->70|ATK:12->14\`
28. \`NPC|Elder|You have saved our village! The artifact is restored. You are a legend.\`

**Phase 5 — Milestone Summary:**
29. \`CHAIN_COMPLETE|The Dungeon Saga|4 quests|+150g +300xp\`
30. \`STATS|Level:4|XP:300|HP:70|ATK:14|Gold:150\`
31. \`Saving... level=4 xp=300 hp=70 atk=14 gold=150 quests_complete=4\`
32. \`MILESTONE|Lesson 50|Adventure Begins|Halfway Complete!\`
33. \`SCORE|400\`

## Common Mistake

Getting the level-up math wrong. After Q1: 25 XP, level 1 (no change). After Q2: 125 XP, level 2 (HP+10, ATK+2). After Q3: 200 XP, level 3 (HP+10, ATK+2). After Q4: 300 XP, level 4 (HP+10, ATK+2). Track each transition carefully.

## Elite Insight

This adventure has the same structure as the first dungeon in every Zelda game. Room 1: NPC with quest. Room 2: enemies. Room 3: key item. Room 4: return. Miyamoto's team discovered this in 1986. It has been the RPG opening template for forty years.

## Pattern Recognition

The milestone tests every pattern from lessons 1-49: State Machine, Observer, Command, Chain of Responsibility, Strategy, Flyweight, Iterator, Threshold, and Mediator. Ten patterns. One program. Pattern literacy makes large systems manageable.

## Skill Reinforcement

- Complete game loop: title -> play -> fight -> loot -> quest -> level -> save
- Multi-room navigation with consistent state
- Quest chain traversal with prerequisite-based unlocking
- Progressive stat growth through XP and level thresholds
- NPC dialogue that changes with quest progress
- Save snapshot capturing all persistent state

## Mastery Check

Why is lesson 50 the halfway point and not the end? Because the engine is proven but the depth is not. Combat has no abilities. Quests have no branching. Economy has no crafting. World has no procedural generation. The next 50 lessons add depth. The foundation you built here supports all of it.`,

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

// TODO: Implement ALL event handlers
// TODO: Implement checkQuestCompletion with level-up
// TODO: Implement checkChainUnlocks
// TODO: Implement render functions for Village, Cave, Chamber
// TODO: Implement printHUD

int main() {
    int playerLevel = 1, playerXP = 0;
    int playerMaxHP = 40, playerAttack = 8;
    int playerGold = 0;
    int playerX = 3, playerY = 5;

    Quest quests[4];
    quests[0] = {"Q1", "Speak with Elder", "Talk to the village elder",
                 {{TALK, "Elder", 1, 0}}, 1, 10, 25, "", ACTIVE};
    quests[1] = {"Q2", "Slay the Goblins", "Kill 3 goblins in the cave",
                 {{KILL, "Goblin", 3, 0}}, 1, 50, 100, "Q1", INACTIVE};
    quests[2] = {"Q3", "Retrieve the Artifact", "Find the ancient artifact",
                 {{COLLECT, "Artifact", 1, 0}}, 1, 40, 75, "Q2", INACTIVE};
    quests[3] = {"Q4", "Return to Elder", "Report back to the elder",
                 {{TALK, "Elder", 1, 0}}, 1, 50, 100, "Q3", INACTIVE};
    int questCount = 4;

    // TODO: Phase 1 — Village: title, render, NPC, Q1
    // TODO: Phase 2 — Goblin Cave: render, combat x3, Q2
    // TODO: Phase 3 — Artifact Chamber: render, collect, Q3
    // TODO: Phase 4 — Village Return: render, NPC, Q4
    // TODO: Phase 5 — Summary: chain, stats, save, milestone, score

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

void renderVillage(int px, int py, int npcX, int npcY, bool showQM) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (col == npcX && row == npcY)
                cout << 'N';
            else if (showQM && col == npcX && row == npcY - 1)
                cout << '?';
            else
                cout << '.';
        }
        cout << endl;
    }
}

void renderCave(int px, int py,
                int ex1, int ey1, bool e1,
                int ex2, int ey2, bool e2,
                int ex3, int ey3, bool e3) {
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
            else if (e3 && col == ex3 && row == ey3)
                cout << 'E';
            else
                cout << '.';
        }
        cout << endl;
    }
}

void renderChamber(int px, int py, int artX, int artY, bool artPresent) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (artPresent && col == artX && row == artY)
                cout << '!';
            else
                cout << '.';
        }
        cout << endl;
    }
}

void printHUD(int hp, int atk, int gold, int xp, int level, const string& room) {
    cout << "HUD|HP:" << hp << "|ATK:" << atk << "|Gold:" << gold
         << "|XP:" << xp << "|Level:" << level << "|Room:" << room << endl;
}

int main() {
    int playerLevel = 1, playerXP = 0;
    int playerMaxHP = 40, playerAttack = 8;
    int playerGold = 0;
    int playerX = 3, playerY = 5;

    Quest quests[4];
    quests[0] = {"Q1", "Speak with Elder", "Talk to the village elder",
                 {{TALK, "Elder", 1, 0}}, 1, 10, 25, "", ACTIVE};
    quests[1] = {"Q2", "Slay the Goblins", "Kill 3 goblins in the cave",
                 {{KILL, "Goblin", 3, 0}}, 1, 50, 100, "Q1", INACTIVE};
    quests[2] = {"Q3", "Retrieve the Artifact", "Find the ancient artifact",
                 {{COLLECT, "Artifact", 1, 0}}, 1, 40, 75, "Q2", INACTIVE};
    quests[3] = {"Q4", "Return to Elder", "Report back to the elder",
                 {{TALK, "Elder", 1, 0}}, 1, 50, 100, "Q3", INACTIVE};
    int questCount = 4;

    // =========================================================
    // PHASE 1 — Village
    // =========================================================
    cout << "=== QUEST MILESTONE: ADVENTURE BEGINS ===" << endl;
    renderVillage(playerX, playerY, 8, 4, true);
    printHUD(playerMaxHP, playerAttack, playerGold, playerXP, playerLevel, "Village");

    cout << "NPC|Elder|Brave adventurer! Goblins infest the cave to the east. Slay them, find the lost artifact, and return to me." << endl;
    onNPCTalked(quests, questCount, "Elder");
    checkQuestCompletion(quests[0], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);
    checkChainUnlocks(quests, questCount);

    // =========================================================
    // PHASE 2 — Goblin Cave
    // =========================================================
    cout << "Room transition: Village -> Goblin Cave" << endl;
    playerX = 1; playerY = 5;
    int gob1x = 6, gob1y = 3, gob1hp = 30; bool gob1alive = true;
    int gob2x = 10, gob2y = 4, gob2hp = 30; bool gob2alive = true;
    int gob3x = 14, gob3y = 3, gob3hp = 30; bool gob3alive = true;

    renderCave(playerX, playerY,
               gob1x, gob1y, gob1alive,
               gob2x, gob2y, gob2alive,
               gob3x, gob3y, gob3alive);
    printHUD(playerMaxHP, playerAttack, playerGold, playerXP, playerLevel, "Goblin Cave");

    // Goblin 1
    playerX = 5; playerY = 3;
    cout << "Player moved to (" << playerX << "," << playerY << ")" << endl;
    for (int i = 0; i < 3; i++) {
        gob1hp -= 10;
        cout << "Attack! Goblin HP: " << gob1hp << endl;
    }
    gob1alive = false;
    cout << "Enemy defeated! Goblin slain." << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    // Goblin 2
    playerX = 9; playerY = 4;
    cout << "Player moved to (" << playerX << "," << playerY << ")" << endl;
    for (int i = 0; i < 3; i++) {
        gob2hp -= 10;
        cout << "Attack! Goblin HP: " << gob2hp << endl;
    }
    gob2alive = false;
    cout << "Enemy defeated! Goblin slain." << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    // Goblin 3
    playerX = 13; playerY = 3;
    cout << "Player moved to (" << playerX << "," << playerY << ")" << endl;
    for (int i = 0; i < 3; i++) {
        gob3hp -= 10;
        cout << "Attack! Goblin HP: " << gob3hp << endl;
    }
    gob3alive = false;
    cout << "Enemy defeated! Goblin slain." << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    checkQuestCompletion(quests[1], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);
    checkChainUnlocks(quests, questCount);

    // =========================================================
    // PHASE 3 — Artifact Chamber
    // =========================================================
    cout << "Room transition: Goblin Cave -> Artifact Chamber" << endl;
    playerX = 1; playerY = 5;
    int artX = 10, artY = 4;
    bool artPresent = true;

    renderChamber(playerX, playerY, artX, artY, artPresent);
    printHUD(playerMaxHP, playerAttack, playerGold, playerXP, playerLevel, "Artifact Chamber");

    playerX = artX; playerY = artY;
    cout << "Player moved to (" << playerX << "," << playerY << ")" << endl;
    artPresent = false;
    cout << "Collected: Ancient Artifact" << endl;
    onItemCollected(quests, questCount, "Artifact");

    checkQuestCompletion(quests[2], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);
    checkChainUnlocks(quests, questCount);

    // =========================================================
    // PHASE 4 — Village Return
    // =========================================================
    cout << "Room transition: Artifact Chamber -> Village" << endl;
    playerX = 3; playerY = 5;
    renderVillage(playerX, playerY, 8, 4, false);
    printHUD(playerMaxHP, playerAttack, playerGold, playerXP, playerLevel, "Village");

    onNPCTalked(quests, questCount, "Elder");
    checkQuestCompletion(quests[3], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);

    cout << "NPC|Elder|You have saved our village! The artifact is restored. You are a legend." << endl;

    // =========================================================
    // PHASE 5 — Milestone Summary
    // =========================================================
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

    cout << "STATS|Level:" << playerLevel
         << "|XP:" << playerXP
         << "|HP:" << playerMaxHP
         << "|ATK:" << playerAttack
         << "|Gold:" << playerGold << endl;

    cout << "Saving... level=" << playerLevel
         << " xp=" << playerXP
         << " hp=" << playerMaxHP
         << " atk=" << playerAttack
         << " gold=" << playerGold
         << " quests_complete=" << completed << endl;

    cout << "MILESTONE|Lesson 50|Adventure Begins|Halfway Complete!" << endl;
    cout << "SCORE|400" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Milestone title screen prints",
      expectedOutput: "=== QUEST MILESTONE: ADVENTURE BEGINS ===",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Q2 chain unlock after Q1 completion",
      expectedOutput:
        "CHAIN_UNLOCK\\|Q2\\|Slay the Goblins\\|prerequisite Q1 complete",
      isPattern: true,
    },
    {
      id: "g3",
      description: "All goblins killed, objective 3/3 complete",
      expectedOutput: "OBJECTIVE_COMPLETE\\|Q2\\|KILL:Goblin:3/3",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Artifact collected and Q3 objective complete",
      expectedOutput: "OBJECTIVE_COMPLETE\\|Q3\\|COLLECT:Artifact:1/1",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Chain completes with 4 quests and accumulated rewards",
      expectedOutput:
        "CHAIN_COMPLETE\\|The Dungeon Saga\\|4 quests\\|\\+150g \\+300xp",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Final stats at Level 4",
      expectedOutput:
        "STATS\\|Level:4\\|XP:300\\|HP:70\\|ATK:14\\|Gold:150",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Milestone marker confirms halfway point",
      expectedOutput:
        "MILESTONE\\|Lesson 50\\|Adventure Begins\\|Halfway Complete!",
      isPattern: true,
    },
    {
      id: "g8",
      description: "Final score of 400",
      expectedOutput: "SCORE\\|400",
      isPattern: true,
    },
  ],

  hints: [
    "Follow the 5 phases strictly. Phase 1: Village (talk to Elder, Q1, chain unlock). Phase 2: Goblin Cave (3 combats, Q2, level up, chain unlock). Phase 3: Artifact Chamber (collect, Q3, level up, chain unlock). Phase 4: Village Return (talk, Q4, level up). Phase 5: Summary.",
    "Combat: each goblin has 30 HP, 3 attacks of 10 damage. After each death, call onEnemyKilled. After all 3, call checkQuestCompletion for Q2.",
    "Level-up math: Q1=25 XP (level 1, no change). Q2=125 XP (level 2: HP 40->50, ATK 8->10). Q3=200 XP (level 3: HP 50->60, ATK 10->12). Q4=300 XP (level 4: HP 60->70, ATK 12->14).",
    "Always: event handlers -> checkQuestCompletion -> checkChainUnlocks. This order ensures quest is COMPLETE before dependents are checked.",
    "CHAIN_COMPLETE sums ALL rewards: 10+50+40+50=150 gold, 25+100+75+100=300 XP across 4 completed quests.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

// ==============================
// RPG CORE — Lesson 50 MILESTONE
// ADVENTURE BEGINS: The Halfway Mark
// All systems integrated: grid, combat, inventory,
// equipment, shop, crafting, status effects, NPCs,
// quests, chains, leveling, save/load.
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

// === ENUM-TO-STRING HELPERS ===
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

// === QUEST DATA LOADER ===
ObjectiveType parseType(const string& s) {
    if (s == "KILL") return KILL;
    if (s == "COLLECT") return COLLECT;
    if (s == "REACH") return REACH;
    return TALK;
}

int loadQuests(const string& data, Quest quests[], int maxQuests) {
    istringstream stream(data);
    string line;
    int count = 0;
    while (getline(stream, line) && count < maxQuests) {
        Quest& q = quests[count];
        q.status = INACTIVE;
        q.objectiveCount = 0;
        istringstream ls(line);
        string token;
        int field = 0;
        while (getline(ls, token, '|')) {
            if (field == 0) q.id = token;
            else if (field == 1) q.title = token;
            else if (field == 2) q.description = token;
            else if (field == 3) {
                istringstream os(token);
                string part;
                int oi = 0;
                Objective& obj = q.objectives[q.objectiveCount];
                obj.current = 0;
                while (getline(os, part, ':')) {
                    if (oi == 0) obj.type = parseType(part);
                    else if (oi == 1) obj.target = part;
                    else if (oi == 2) obj.required = stoi(part);
                    oi++;
                }
                q.objectiveCount++;
            } else if (field == 4) {
                istringstream rs(token);
                string part;
                int ri = 0;
                while (getline(rs, part, ':')) {
                    if (ri == 0) q.rewardGold = stoi(part);
                    else if (ri == 1) q.rewardXP = stoi(part);
                    ri++;
                }
            }
            field++;
        }
        count++;
    }
    return count;
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

// === QUEST COMPLETION + LEVEL-UP SYSTEM ===
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

// === CHAIN UNLOCK SYSTEM ===
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

// === GRID RENDERS — Room-Specific ===
void renderVillage(int px, int py, int npcX, int npcY, bool showQM) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (col == npcX && row == npcY)
                cout << 'N';
            else if (showQM && col == npcX && row == npcY - 1)
                cout << '?';
            else
                cout << '.';
        }
        cout << endl;
    }
}

void renderCave(int px, int py,
                int ex1, int ey1, bool e1,
                int ex2, int ey2, bool e2,
                int ex3, int ey3, bool e3) {
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
            else if (e3 && col == ex3 && row == ey3)
                cout << 'E';
            else
                cout << '.';
        }
        cout << endl;
    }
}

void renderChamber(int px, int py, int artX, int artY, bool artPresent) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (artPresent && col == artX && row == artY)
                cout << '!';
            else
                cout << '.';
        }
        cout << endl;
    }
}

// === HUD ===
void printHUD(int hp, int atk, int gold, int xp, int level, const string& room) {
    cout << "HUD|HP:" << hp << "|ATK:" << atk << "|Gold:" << gold
         << "|XP:" << xp << "|Level:" << level << "|Room:" << room << endl;
}

// === DIAGNOSTICS ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

// =========================================================
// MAIN — Complete Quest Milestone Adventure
// 4 rooms, 4 quests, 3 level-ups, 1 hero, 1 story
// =========================================================
int main() {
    // === PLAYER STATE ===
    int playerLevel = 1, playerXP = 0;
    int playerMaxHP = 40, playerAttack = 8;
    int playerGold = 0;
    int playerX = 3, playerY = 5;

    // === QUEST CHAIN — The Dungeon Saga ===
    Quest quests[4];
    quests[0] = {"Q1", "Speak with Elder", "Talk to the village elder",
                 {{TALK, "Elder", 1, 0}}, 1, 10, 25, "", ACTIVE};
    quests[1] = {"Q2", "Slay the Goblins", "Kill 3 goblins in the cave",
                 {{KILL, "Goblin", 3, 0}}, 1, 50, 100, "Q1", INACTIVE};
    quests[2] = {"Q3", "Retrieve the Artifact", "Find the ancient artifact",
                 {{COLLECT, "Artifact", 1, 0}}, 1, 40, 75, "Q2", INACTIVE};
    quests[3] = {"Q4", "Return to Elder", "Report back to the elder",
                 {{TALK, "Elder", 1, 0}}, 1, 50, 100, "Q3", INACTIVE};
    int questCount = 4;

    // === PHASE 1: Village ===
    cout << "=== QUEST MILESTONE: ADVENTURE BEGINS ===" << endl;
    renderVillage(playerX, playerY, 8, 4, true);
    printHUD(playerMaxHP, playerAttack, playerGold, playerXP, playerLevel, "Village");

    cout << "NPC|Elder|Brave adventurer! Goblins infest the cave to the east. Slay them, find the lost artifact, and return to me." << endl;
    onNPCTalked(quests, questCount, "Elder");
    checkQuestCompletion(quests[0], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);
    checkChainUnlocks(quests, questCount);

    // === PHASE 2: Goblin Cave ===
    cout << "Room transition: Village -> Goblin Cave" << endl;
    playerX = 1; playerY = 5;
    int gob1x = 6, gob1y = 3, gob1hp = 30; bool gob1alive = true;
    int gob2x = 10, gob2y = 4, gob2hp = 30; bool gob2alive = true;
    int gob3x = 14, gob3y = 3, gob3hp = 30; bool gob3alive = true;

    renderCave(playerX, playerY, gob1x, gob1y, gob1alive,
               gob2x, gob2y, gob2alive, gob3x, gob3y, gob3alive);
    printHUD(playerMaxHP, playerAttack, playerGold, playerXP, playerLevel, "Goblin Cave");

    // Combat: 3 goblins
    playerX = 5; playerY = 3;
    cout << "Player moved to (" << playerX << "," << playerY << ")" << endl;
    for (int i = 0; i < 3; i++) { gob1hp -= 10; cout << "Attack! Goblin HP: " << gob1hp << endl; }
    gob1alive = false;
    cout << "Enemy defeated! Goblin slain." << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    playerX = 9; playerY = 4;
    cout << "Player moved to (" << playerX << "," << playerY << ")" << endl;
    for (int i = 0; i < 3; i++) { gob2hp -= 10; cout << "Attack! Goblin HP: " << gob2hp << endl; }
    gob2alive = false;
    cout << "Enemy defeated! Goblin slain." << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    playerX = 13; playerY = 3;
    cout << "Player moved to (" << playerX << "," << playerY << ")" << endl;
    for (int i = 0; i < 3; i++) { gob3hp -= 10; cout << "Attack! Goblin HP: " << gob3hp << endl; }
    gob3alive = false;
    cout << "Enemy defeated! Goblin slain." << endl;
    onEnemyKilled(quests, questCount, "Goblin");

    checkQuestCompletion(quests[1], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);
    checkChainUnlocks(quests, questCount);

    // === PHASE 3: Artifact Chamber ===
    cout << "Room transition: Goblin Cave -> Artifact Chamber" << endl;
    playerX = 1; playerY = 5;
    int artX = 10, artY = 4; bool artPresent = true;

    renderChamber(playerX, playerY, artX, artY, artPresent);
    printHUD(playerMaxHP, playerAttack, playerGold, playerXP, playerLevel, "Artifact Chamber");

    playerX = artX; playerY = artY;
    cout << "Player moved to (" << playerX << "," << playerY << ")" << endl;
    artPresent = false;
    cout << "Collected: Ancient Artifact" << endl;
    onItemCollected(quests, questCount, "Artifact");

    checkQuestCompletion(quests[2], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);
    checkChainUnlocks(quests, questCount);

    // === PHASE 4: Village Return ===
    cout << "Room transition: Artifact Chamber -> Village" << endl;
    playerX = 3; playerY = 5;
    renderVillage(playerX, playerY, 8, 4, false);
    printHUD(playerMaxHP, playerAttack, playerGold, playerXP, playerLevel, "Village");

    onNPCTalked(quests, questCount, "Elder");
    checkQuestCompletion(quests[3], playerGold, playerXP,
                         playerLevel, playerMaxHP, playerAttack);

    cout << "NPC|Elder|You have saved our village! The artifact is restored. You are a legend." << endl;

    // === PHASE 5: Milestone Summary ===
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

    cout << "STATS|Level:" << playerLevel
         << "|XP:" << playerXP
         << "|HP:" << playerMaxHP
         << "|ATK:" << playerAttack
         << "|Gold:" << playerGold << endl;

    cout << "Saving... level=" << playerLevel
         << " xp=" << playerXP
         << " hp=" << playerMaxHP
         << " atk=" << playerAttack
         << " gold=" << playerGold
         << " quests_complete=" << completed << endl;

    cout << "MILESTONE|Lesson 50|Adventure Begins|Halfway Complete!" << endl;
    cout << "SCORE|400" << endl;

    return 0;
}
`,
};
