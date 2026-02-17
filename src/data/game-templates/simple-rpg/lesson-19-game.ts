import type { GameLessonVariant } from "@/types/game";

export const lesson19SimpleRpg: GameLessonVariant = {
  lessonId: "19-difficulty",

  instructions: `# Enemy Scaling — Data-Driven Difficulty Tables

## Objective
Use **data tables** (arrays) to scale enemy stats based on dungeon floor, generating weak enemies on floor 1 and strong enemies on floor 3.

## Why This Matters
Difficulty scaling is what gives RPGs their progression curve. Instead of writing separate code for each difficulty level, professional games use **data tables** — arrays or config files that map a floor/level number to stat multipliers. Change the table, change the game.

## Data-Driven OOP Concept
This is pure data-driven design: the enemy generation function is **one piece of code** that reads from a **scaling table** (arrays of multipliers). Floor 1 and floor 10 use the same function — only the data differs. This is how games like Diablo scale infinitely.

## Requirements
1. Define scaling tables as arrays (3 floors):
   - \`int baseHP[] = {30, 60, 100}\` — base HP for floors 1, 2, 3
   - \`int baseATK[] = {8, 15, 25}\` — base ATK for floors 1, 2, 3
   - \`string enemyNames[] = {"Rat", "Skeleton", "Demon"}\` — enemy type per floor
2. Write a function \`void generateEnemy(string names[], int hpTable[], int atkTable[], int floor, int enemyIndex)\` that:
   - Uses \`floor - 1\` as index into the tables
   - Outputs ENTITY for the enemy: id = name + to_string(enemyIndex), type = "enemy"
   - Position: x = 100 + (enemyIndex * 80), y = 160, size 20x20
   - Also outputs \`GAME_MESSAGE|Floor <floor>: <name> appears! HP:<hp> ATK:<atk>\`
3. In \`main()\`:
   - Generate 2 enemies for floor 1 (indices 0 and 1)
   - Generate 2 enemies for floor 3 (indices 2 and 3)
   - Output \`SCORE|<floor 3 base HP>\` to show the scaling value
   - Output \`GAME_OVER\`

## Expected Output
\`\`\`
ENTITY|Rat0|enemy|100|160|20|20|30
GAME_MESSAGE|Floor 1: Rat appears! HP:30 ATK:8
ENTITY|Rat1|enemy|180|160|20|20|30
GAME_MESSAGE|Floor 1: Rat appears! HP:30 ATK:8
ENTITY|Demon2|enemy|260|160|20|20|100
GAME_MESSAGE|Floor 3: Demon appears! HP:100 ATK:25
ENTITY|Demon3|enemy|340|160|20|20|100
GAME_MESSAGE|Floor 3: Demon appears! HP:100 ATK:25
SCORE|100
GAME_OVER
\`\`\``,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define scaling tables:
// int baseHP[] = {30, 60, 100};
// int baseATK[] = {8, 15, 25};
// string enemyNames[] = {"Rat", "Skeleton", "Demon"};

// Write generateEnemy function:
// void generateEnemy(string names[], int hpTable[], int atkTable[],
//                    int floor, int enemyIndex)
//   int idx = floor - 1;
//   string name = names[idx];
//   int hp = hpTable[idx];
//   int atk = atkTable[idx];
//   int x = 100 + (enemyIndex * 80);
//   Output ENTITY|<name><enemyIndex>|enemy|<x>|160|20|20|<hp>
//   Output GAME_MESSAGE|Floor <floor>: <name> appears! HP:<hp> ATK:<atk>

int main() {
    // Generate 2 enemies for floor 1 (indices 0, 1)
    // Generate 2 enemies for floor 3 (indices 2, 3)
    // Output SCORE|<floor 3 baseHP value>
    // Output GAME_OVER

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

// Scaling tables
int baseHP[] = {30, 60, 100};
int baseATK[] = {8, 15, 25};
string enemyNames[] = {"Rat", "Skeleton", "Demon"};

void generateEnemy(string names[], int hpTable[], int atkTable[],
                   int floor, int enemyIndex) {
    int idx = floor - 1;
    string name = names[idx];
    int hp = hpTable[idx];
    int atk = atkTable[idx];
    int x = 100 + (enemyIndex * 80);

    cout << "ENTITY|" << name << enemyIndex << "|enemy|"
         << x << "|160|20|20|" << hp << endl;
    cout << "GAME_MESSAGE|Floor " << floor << ": " << name
         << " appears! HP:" << hp << " ATK:" << atk << endl;
}

int main() {
    // Floor 1: 2 weak enemies
    generateEnemy(enemyNames, baseHP, baseATK, 1, 0);
    generateEnemy(enemyNames, baseHP, baseATK, 1, 1);

    // Floor 3: 2 strong enemies
    generateEnemy(enemyNames, baseHP, baseATK, 3, 2);
    generateEnemy(enemyNames, baseHP, baseATK, 3, 3);

    // Score shows the floor 3 scaling value
    cout << "SCORE|" << baseHP[2] << endl;
    cout << "GAME_OVER" << endl;

    return 0;
}`,

  tests: [
    {
      id: "floor1-enemy0",
      description: "Floor 1 generates Rat0 at x=100 with 30 HP",
      expectedOutput: "ENTITY\\|Rat0\\|enemy\\|100\\|160\\|20\\|20\\|30",
      isPattern: true,
    },
    {
      id: "floor1-enemy1",
      description: "Floor 1 generates Rat1 at x=180 with 30 HP",
      expectedOutput: "ENTITY\\|Rat1\\|enemy\\|180\\|160\\|20\\|20\\|30",
      isPattern: true,
    },
    {
      id: "floor1-message",
      description: "Floor 1 message shows Rat with HP:30 ATK:8",
      expectedOutput: "GAME_MESSAGE\\|Floor 1: Rat appears! HP:30 ATK:8",
      isPattern: true,
    },
    {
      id: "floor3-enemy2",
      description: "Floor 3 generates Demon2 at x=260 with 100 HP",
      expectedOutput: "ENTITY\\|Demon2\\|enemy\\|260\\|160\\|20\\|20\\|100",
      isPattern: true,
    },
    {
      id: "floor3-enemy3",
      description: "Floor 3 generates Demon3 at x=340 with 100 HP",
      expectedOutput: "ENTITY\\|Demon3\\|enemy\\|340\\|160\\|20\\|20\\|100",
      isPattern: true,
    },
    {
      id: "floor3-message",
      description: "Floor 3 message shows Demon with HP:100 ATK:25",
      expectedOutput: "GAME_MESSAGE\\|Floor 3: Demon appears! HP:100 ATK:25",
      isPattern: true,
    },
    {
      id: "score-scaling",
      description: "Score outputs floor 3 base HP (100)",
      expectedOutput: "SCORE\\|100",
      isPattern: true,
    },
    {
      id: "game-over",
      description: "Outputs GAME_OVER at the end",
      expectedOutput: "GAME_OVER",
      isPattern: true,
    },
  ],

  hints: [
    "Use floor - 1 as the array index since arrays are 0-based but floors are 1-based.",
    "To create the enemy ID, concatenate: name + to_string(enemyIndex). In cout you can just use << name << enemyIndex.",
    "The same generateEnemy function works for any floor — only the floor parameter changes. This is the power of data-driven design.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

// Scaling tables
int baseHP[] = {30, 60, 100};
int baseATK[] = {8, 15, 25};
string enemyNames[] = {"Rat", "Skeleton", "Demon"};

void generateEnemy(string names[], int hpTable[], int atkTable[],
                   int floor, int enemyIndex) {
    int idx = floor - 1;
    string name = names[idx];
    int hp = hpTable[idx];
    int atk = atkTable[idx];
    int x = 100 + (enemyIndex * 80);

    cout << "ENTITY|" << name << enemyIndex << "|enemy|"
         << x << "|160|20|20|" << hp << endl;
    cout << "GAME_MESSAGE|Floor " << floor << ": " << name
         << " appears! HP:" << hp << " ATK:" << atk << endl;
}

int main() {
    // Floor 1: 2 weak enemies
    generateEnemy(enemyNames, baseHP, baseATK, 1, 0);
    generateEnemy(enemyNames, baseHP, baseATK, 1, 1);

    // Floor 3: 2 strong enemies
    generateEnemy(enemyNames, baseHP, baseATK, 3, 2);
    generateEnemy(enemyNames, baseHP, baseATK, 3, 3);

    // Score shows the floor 3 scaling value
    cout << "SCORE|" << baseHP[2] << endl;
    cout << "GAME_OVER" << endl;

    return 0;
}`,
};
