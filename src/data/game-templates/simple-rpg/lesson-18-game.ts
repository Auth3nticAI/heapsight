import type { GameLessonVariant } from "@/types/game";

export const lesson18SimpleRpg: GameLessonVariant = {
  lessonId: "18-score-system",

  instructions: `# Experience Points — Level-Up System

## Objective
Build an **XP and leveling system** where killing enemies grants experience, and reaching a threshold triggers a level-up with stat boosts.

## Why This Matters
XP systems are the core progression loop in RPGs. They transform raw combat data (kills) into player growth (levels, stats). Every RPG from Skyrim to Pokemon uses some form of this pattern.

## Data-Driven OOP Concept
The XP threshold (100 per level) is **data** that drives the leveling engine. The \`addXP\` function is the engine — it doesn't know *what* gives XP, only *how much*. This separation means you can add new XP sources (quests, exploration) without changing the level-up logic.

## Requirements
1. Player starts at level 1, 0 XP, 100 HP, 20 ATK.
2. Write a function \`void addXP(int &xp, int &level, int &hp, int &atk, int amount)\`:
   - Add \`amount\` to \`xp\`.
   - While \`xp >= level * 100\`: subtract threshold from xp, increment level, add 10 HP, add 5 ATK.
3. Kill 3 enemies in sequence:
   - Goblin: 45 XP, at (100, 180), size 18x18, 0 HP (dead)
   - Wolf: 60 XP, at (200, 160), size 20x16, 0 HP (dead)
   - Ogre: 80 XP, at (300, 140), size 24x28, 0 HP (dead)
4. After each kill, call \`addXP\` and output:
   - ENTITY for the dead enemy (0 HP)
   - ENTITY for the player at (180, 200), size 22x26, with current HP
   - GAME_MESSAGE showing XP gained and current level
5. After all kills, output \`SCORE|<total XP earned>\` (45 + 60 + 80 = 185).

## Expected Output
\`\`\`
ENTITY|goblin|enemy|100|180|18|18|0
ENTITY|hero|player|180|200|22|26|100
GAME_MESSAGE|Gained 45 XP! Level 1 (45/100 XP)
ENTITY|wolf|enemy|200|160|20|16|0
ENTITY|hero|player|180|200|22|26|110
GAME_MESSAGE|Gained 60 XP! Level 2 (5/200 XP)
ENTITY|ogre|enemy|300|140|24|28|0
ENTITY|hero|player|180|200|22|26|110
GAME_MESSAGE|Gained 80 XP! Level 2 (85/200 XP)
SCORE|185
\`\`\``,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write addXP function:
// void addXP(int &xp, int &level, int &hp, int &atk, int amount)
//   Add amount to xp
//   While xp >= level * 100:
//     xp -= level * 100
//     level++
//     hp += 10
//     atk += 5

int main() {
    // Player stats: level 1, 0 XP, 100 HP, 20 ATK
    // int level = 1, xp = 0, hp = 100, atk = 20;
    // int totalXP = 0;

    // Kill Goblin: 45 XP
    //   Output ENTITY|goblin|enemy|100|180|18|18|0
    //   Call addXP with 45
    //   totalXP += 45
    //   Output ENTITY|hero|player|180|200|22|26|<hp>
    //   Output GAME_MESSAGE|Gained 45 XP! Level <level> (<xp>/<level*100> XP)

    // Kill Wolf: 60 XP
    //   Output ENTITY|wolf|enemy|200|160|20|16|0
    //   Call addXP with 60
    //   totalXP += 60
    //   Output ENTITY|hero|player|180|200|22|26|<hp>
    //   Output GAME_MESSAGE|Gained 60 XP! Level <level> (<xp>/<level*100> XP)

    // Kill Ogre: 80 XP
    //   Output ENTITY|ogre|enemy|300|140|24|28|0
    //   Call addXP with 80
    //   totalXP += 80
    //   Output ENTITY|hero|player|180|200|22|26|<hp>
    //   Output GAME_MESSAGE|Gained 80 XP! Level <level> (<xp>/<level*100> XP)

    // Output SCORE|totalXP

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

void addXP(int &xp, int &level, int &hp, int &atk, int amount) {
    xp = xp + amount;
    while (xp >= level * 100) {
        xp = xp - level * 100;
        level++;
        hp = hp + 10;
        atk = atk + 5;
    }
}

int main() {
    int level = 1, xp = 0, hp = 100, atk = 20;
    int totalXP = 0;

    // Kill Goblin: 45 XP
    cout << "ENTITY|goblin|enemy|100|180|18|18|0" << endl;
    addXP(xp, level, hp, atk, 45);
    totalXP = totalXP + 45;
    cout << "ENTITY|hero|player|180|200|22|26|" << hp << endl;
    cout << "GAME_MESSAGE|Gained 45 XP! Level " << level
         << " (" << xp << "/" << level * 100 << " XP)" << endl;

    // Kill Wolf: 60 XP
    cout << "ENTITY|wolf|enemy|200|160|20|16|0" << endl;
    addXP(xp, level, hp, atk, 60);
    totalXP = totalXP + 60;
    cout << "ENTITY|hero|player|180|200|22|26|" << hp << endl;
    cout << "GAME_MESSAGE|Gained 60 XP! Level " << level
         << " (" << xp << "/" << level * 100 << " XP)" << endl;

    // Kill Ogre: 80 XP
    cout << "ENTITY|ogre|enemy|300|140|24|28|0" << endl;
    addXP(xp, level, hp, atk, 80);
    totalXP = totalXP + 80;
    cout << "ENTITY|hero|player|180|200|22|26|" << hp << endl;
    cout << "GAME_MESSAGE|Gained 80 XP! Level " << level
         << " (" << xp << "/" << level * 100 << " XP)" << endl;

    cout << "SCORE|" << totalXP << endl;

    return 0;
}`,

  tests: [
    {
      id: "goblin-dead",
      description: "Goblin rendered as dead entity with 0 HP",
      expectedOutput: "ENTITY\\|goblin\\|enemy\\|100\\|180\\|18\\|18\\|0",
      isPattern: true,
    },
    {
      id: "hero-after-goblin",
      description: "Hero has 100 HP after goblin kill (no level up yet)",
      expectedOutput: "ENTITY\\|hero\\|player\\|180\\|200\\|22\\|26\\|100",
      isPattern: true,
    },
    {
      id: "goblin-xp-message",
      description: "Shows 45 XP gained, still level 1 with 45/100 XP",
      expectedOutput: "GAME_MESSAGE\\|Gained 45 XP! Level 1 \\(45/100 XP\\)",
      isPattern: true,
    },
    {
      id: "wolf-dead",
      description: "Wolf rendered as dead entity with 0 HP",
      expectedOutput: "ENTITY\\|wolf\\|enemy\\|200\\|160\\|20\\|16\\|0",
      isPattern: true,
    },
    {
      id: "hero-after-wolf-levelup",
      description: "Hero has 110 HP after wolf kill (leveled up: +10 HP)",
      expectedOutput: "ENTITY\\|hero\\|player\\|180\\|200\\|22\\|26\\|110",
      isPattern: true,
    },
    {
      id: "wolf-xp-message",
      description: "Shows 60 XP gained, now level 2 with 5/200 XP",
      expectedOutput: "GAME_MESSAGE\\|Gained 60 XP! Level 2 \\(5/200 XP\\)",
      isPattern: true,
    },
    {
      id: "ogre-dead",
      description: "Ogre rendered as dead entity with 0 HP",
      expectedOutput: "ENTITY\\|ogre\\|enemy\\|300\\|140\\|24\\|28\\|0",
      isPattern: true,
    },
    {
      id: "ogre-xp-message",
      description: "Shows 80 XP gained, still level 2 with 85/200 XP",
      expectedOutput: "GAME_MESSAGE\\|Gained 80 XP! Level 2 \\(85/200 XP\\)",
      isPattern: true,
    },
    {
      id: "total-score",
      description: "Total XP earned is 185 (45 + 60 + 80)",
      expectedOutput: "SCORE\\|185",
      isPattern: true,
    },
  ],

  hints: [
    "Use references (int &xp) in addXP so changes persist outside the function.",
    "The level-up threshold is level * 100. At level 1 it's 100, at level 2 it's 200, etc.",
    "After goblin (45 XP): xp=45, level=1. After wolf (+60): xp=105 >= 100, so level up: xp=5, level=2, hp=110. After ogre (+80): xp=85, still < 200, stay level 2.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

void addXP(int &xp, int &level, int &hp, int &atk, int amount) {
    xp = xp + amount;
    while (xp >= level * 100) {
        xp = xp - level * 100;
        level++;
        hp = hp + 10;
        atk = atk + 5;
    }
}

int main() {
    int level = 1, xp = 0, hp = 100, atk = 20;
    int totalXP = 0;

    // Kill Goblin: 45 XP
    cout << "ENTITY|goblin|enemy|100|180|18|18|0" << endl;
    addXP(xp, level, hp, atk, 45);
    totalXP = totalXP + 45;
    cout << "ENTITY|hero|player|180|200|22|26|" << hp << endl;
    cout << "GAME_MESSAGE|Gained 45 XP! Level " << level
         << " (" << xp << "/" << level * 100 << " XP)" << endl;

    // Kill Wolf: 60 XP
    cout << "ENTITY|wolf|enemy|200|160|20|16|0" << endl;
    addXP(xp, level, hp, atk, 60);
    totalXP = totalXP + 60;
    cout << "ENTITY|hero|player|180|200|22|26|" << hp << endl;
    cout << "GAME_MESSAGE|Gained 60 XP! Level " << level
         << " (" << xp << "/" << level * 100 << " XP)" << endl;

    // Kill Ogre: 80 XP
    cout << "ENTITY|ogre|enemy|300|140|24|28|0" << endl;
    addXP(xp, level, hp, atk, 80);
    totalXP = totalXP + 80;
    cout << "ENTITY|hero|player|180|200|22|26|" << hp << endl;
    cout << "GAME_MESSAGE|Gained 80 XP! Level " << level
         << " (" << xp << "/" << level * 100 << " XP)" << endl;

    cout << "SCORE|" << totalXP << endl;

    return 0;
}`,
};
