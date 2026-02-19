import type { GameLessonVariant } from "@/types/game";

export const lesson46RPG: GameLessonVariant = {
  lessonId: "rpg-46-quest-data",

  instructions: `# Quest Data Structure — Data-Driven Quests

## Mental Model

There is a pattern here that separates content from code forever. A quest is not a function. A quest is a row in a database. It has an ID, a title, a description, a list of objectives, a bag of rewards, and a status flag. The objectives themselves are data: a type (KILL, COLLECT, REACH, TALK), a target name, a required count, and a current count. The entire quest system is a data structure that code reads and mutates. The quest designer edits a text file. The programmer writes the interpreter. They never conflict.

Think of it this way: a quest is a checklist with a story attached. "Kill 3 Goblins" is a checkbox. When all checkboxes are ticked, the quest is complete. The story — the NPC dialogue, the quest log entry, the dramatic revelation — is decoration on top of a boolean array. Every RPG from Ultima to Skyrim works this way.

## What Breaks Without This

Without a Quest struct, quest logic scatters across the codebase. One function checks goblin kills. Another tracks herb collection. A third hardcodes rewards. Change one quest and you touch four files. Data-driven design consolidates all quest information into one place: the data file.

## The Fix

Define the data structures. Load from a pipe-delimited data string. Parse each line into a Quest struct. Display the quest log.

## Pattern Insight

The Quest struct is the Flyweight pattern. Every quest shares the same structure. The data file is the factory. The runtime status is the only mutable state. Separating static data from dynamic state is the key insight of data-driven design.

## Scalability Insight

Adding 100 quests means adding 100 lines to the data file. No recompilation. No new functions. The quest loading function handles any count. Data scales linearly. Code stays constant.

## Your Task

1. Define enums: ObjectiveType (KILL, COLLECT, REACH, TALK) and QuestStatus (INACTIVE, ACTIVE, COMPLETE)
2. Define structs: Objective (type, target, required, current) and Quest (id, title, description, objectives[4], objectiveCount, rewardGold, rewardXP, status)
3. Load 3 quests from pipe-delimited data string
4. Print quest log: \`QUEST_LOG|Q1|Goblin Slayer|INACTIVE\` for each
5. NPC offers quest: \`NPC|Elder|offers quest: Goblin Slayer\`
6. Activate Q1: \`QUEST_ACTIVATED|Q1|Goblin Slayer\`
7. Show active quest: \`ACTIVE_QUEST|Q1|Goblin Slayer|KILL:Goblin:0/3\`
8. Render grid: @ at (3,5), N at (5,4), ? at (5,3)
9. Print: \`QUEST_SYSTEM|ready|3 quests loaded\`

## Common Mistake

Hardcoding quest data inside functions. The moment you write \`if (questId == "Q1") { reward = 50; }\` you have left the data-driven path. The reward lives in the data file. The code reads the data file. The code never mentions "Q1" by name.

## Elite Insight

Bethesda's Creation Engine stores quests in ESM/ESP plugin files. Every quest in Skyrim is pure data. Modders create new quests by creating data entries, not by modifying engine code. Your text-file approach is the same architecture at smaller scale.

## Pattern Recognition

The quest log is a filtered view over the quest array. "Show active quests" means iterate all quests, filter by status, display. This is the Iterator pattern combined with the Filter pattern.

## Skill Reinforcement

- Enum design: bounded value sets for ObjectiveType and QuestStatus
- Struct composition: Objective nested inside Quest
- Data loading: string parsing with delimiters
- Status machines: INACTIVE to ACTIVE to COMPLETE

## Mastery Check

Why does the quest data live in a text file instead of in the code? Because content scales independently of logic. A designer adds quests by editing data. A programmer adds features by editing code. They never conflict.`,

  starterCode: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

// TODO: Define ObjectiveType enum: KILL, COLLECT, REACH, TALK
// TODO: Define QuestStatus enum: INACTIVE, ACTIVE, COMPLETE
// TODO: Define Objective struct (type, target, required, current)
// TODO: Define Quest struct (id, title, description, objectives[4], objectiveCount, rewardGold, rewardXP, status)

const string QUEST_DATA =
    "Q1|Goblin Slayer|Clear the goblin threat|KILL:Goblin:3|50:100\\n"
    "Q2|Herb Gatherer|Collect healing herbs|COLLECT:Herb:5|30:50\\n"
    "Q3|Scout the Ruins|Reach the ancient ruins|REACH:Ruins:1|20:75";

// TODO: Implement parseType, typeStr, statusStr
// TODO: Implement loadQuests
// TODO: Implement renderGrid (with NPC and quest marker)

int main() {
    Quest quests[10];

    // TODO: Load quests, print quest log, NPC interaction
    // TODO: Activate Q1, show active quest, render grid
    // TODO: Print QUEST_SYSTEM status

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <string>
#include <sstream>
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

const string QUEST_DATA =
    "Q1|Goblin Slayer|Clear the goblin threat|KILL:Goblin:3|50:100\\n"
    "Q2|Herb Gatherer|Collect healing herbs|COLLECT:Herb:5|30:50\\n"
    "Q3|Scout the Ruins|Reach the ancient ruins|REACH:Ruins:1|20:75";

ObjectiveType parseType(const string& s) {
    if (s == "KILL") return KILL;
    if (s == "COLLECT") return COLLECT;
    if (s == "REACH") return REACH;
    return TALK;
}

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

void renderGrid(int px, int py, int npcX, int npcY, int qmX, int qmY) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (col == npcX && row == npcY)
                cout << 'N';
            else if (col == qmX && row == qmY)
                cout << '?';
            else
                cout << '.';
        }
        cout << endl;
    }
}

int main() {
    Quest quests[10];
    int questCount = loadQuests(QUEST_DATA, quests, 10);

    // Print quest log
    for (int i = 0; i < questCount; i++) {
        cout << "QUEST_LOG|" << quests[i].id << "|" << quests[i].title
             << "|" << statusStr(quests[i].status) << endl;
    }

    // NPC offers quest
    cout << "NPC|Elder|offers quest: " << quests[0].title << endl;

    // Activate Q1
    quests[0].status = ACTIVE;
    cout << "QUEST_ACTIVATED|" << quests[0].id << "|" << quests[0].title << endl;

    // Show active quest with objectives
    for (int i = 0; i < questCount; i++) {
        if (quests[i].status == ACTIVE) {
            cout << "ACTIVE_QUEST|" << quests[i].id << "|" << quests[i].title << "|";
            for (int j = 0; j < quests[i].objectiveCount; j++) {
                const Objective& o = quests[i].objectives[j];
                cout << typeStr(o.type) << ":" << o.target
                     << ":" << o.current << "/" << o.required;
            }
            cout << endl;
        }
    }

    // Render grid
    renderGrid(3, 5, 5, 4, 5, 3);

    cout << "QUEST_SYSTEM|ready|" << questCount << " quests loaded" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Quest log shows Q1 as INACTIVE before activation",
      expectedOutput: "QUEST_LOG\\|Q1\\|Goblin Slayer\\|INACTIVE",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Q1 activated with correct title",
      expectedOutput: "QUEST_ACTIVATED\\|Q1\\|Goblin Slayer",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Quest system ready with 3 quests loaded",
      expectedOutput: "QUEST_SYSTEM\\|ready\\|3 quests loaded",
      isPattern: true,
    },
  ],

  hints: [
    "Use istringstream with getline and '|' delimiter to parse each quest line. Field 0=id, 1=title, 2=description, 3=objective (split on ':'), 4=rewards (split on ':').",
    "Always initialize obj.current to 0 when loading. Without explicit initialization, current may hold garbage memory values.",
    "The ACTIVE_QUEST line concatenates objective info: typeStr + ':' + target + ':' + current + '/' + required.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

// ==============================
// RPG CORE — Lesson 46
// Quest Data Structure: data-driven quest system
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

// === QUEST DATA (simulated file) ===
const string QUEST_DATA =
    "Q1|Goblin Slayer|Clear the goblin threat|KILL:Goblin:3|50:100\\n"
    "Q2|Herb Gatherer|Collect healing herbs|COLLECT:Herb:5|30:50\\n"
    "Q3|Scout the Ruins|Reach the ancient ruins|REACH:Ruins:1|20:75";

// === HELPER FUNCTIONS ===
ObjectiveType parseType(const string& s) {
    if (s == "KILL") return KILL;
    if (s == "COLLECT") return COLLECT;
    if (s == "REACH") return REACH;
    return TALK;
}

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

// === QUEST LOADER ===
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

// === GRID RENDER — with NPC and Quest Marker ===
void renderGrid(int px, int py, int npcX, int npcY, int qmX, int qmY) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19)
                cout << '#';
            else if (col == px && row == py)
                cout << '@';
            else if (col == npcX && row == npcY)
                cout << 'N';
            else if (col == qmX && row == qmY)
                cout << '?';
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
    Quest quests[10];
    int questCount = loadQuests(QUEST_DATA, quests, 10);

    for (int i = 0; i < questCount; i++) {
        cout << "QUEST_LOG|" << quests[i].id << "|" << quests[i].title
             << "|" << statusStr(quests[i].status) << endl;
    }

    cout << "NPC|Elder|offers quest: " << quests[0].title << endl;
    quests[0].status = ACTIVE;
    cout << "QUEST_ACTIVATED|" << quests[0].id << "|" << quests[0].title << endl;

    for (int i = 0; i < questCount; i++) {
        if (quests[i].status == ACTIVE) {
            cout << "ACTIVE_QUEST|" << quests[i].id << "|" << quests[i].title << "|";
            for (int j = 0; j < quests[i].objectiveCount; j++) {
                const Objective& o = quests[i].objectives[j];
                cout << typeStr(o.type) << ":" << o.target
                     << ":" << o.current << "/" << o.required;
            }
            cout << endl;
        }
    }

    renderGrid(3, 5, 5, 4, 5, 3);
    cout << "QUEST_SYSTEM|ready|" << questCount << " quests loaded" << endl;

    return 0;
}
`,
};
