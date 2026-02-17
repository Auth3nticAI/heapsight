import type { GameLessonVariant } from "@/types/game";

export const lesson13SimpleRpg: GameLessonVariant = {
  lessonId: "13-enums",

  instructions: `# Character Classes — Enum-Driven Stat Templates\n\nIn data-driven RPGs, **enums** serve as identifiers for character class archetypes. Each enum value maps to a stat template — a predefined set of HP, ATK, and DEF values. This pattern keeps class data centralized and easy to extend.\n\n## Objectives\n- Define an enum \`CharClass\` with values WARRIOR, MAGE, ROGUE\n- Write a function to assign base stats based on class enum\n- Create a character using the MAGE class\n- Render the character and display its stats\n\n## Class Stat Templates\n| Class | HP | ATK | DEF |\n|-------|----|-----|-----|\n| WARRIOR | 120 | 15 | 12 |\n| MAGE | 80 | 25 | 5 |\n| ROGUE | 90 | 20 | 8 |\n\n## Output Protocol\n- \`ENTITY|id|type|x|y|width|height|health\` — render the character\n- \`GAME_MESSAGE|text\` — display class info and stats\n- \`SCORE|value\` — total stat points (HP + ATK + DEF)`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define enum CharClass with WARRIOR=0, MAGE=1, ROGUE=2

// Write a function getClassName that takes CharClass and returns
// the class name as a string ("Warrior", "Mage", or "Rogue")

// Write a function getBaseHP that takes CharClass and returns base HP
//   WARRIOR=120, MAGE=80, ROGUE=90

// Write a function getBaseATK that takes CharClass and returns base ATK
//   WARRIOR=15, MAGE=25, ROGUE=20

// Write a function getBaseDEF that takes CharClass and returns base DEF
//   WARRIOR=12, MAGE=5, ROGUE=8

int main() {
    // Create a MAGE character
    // Get stats using the enum functions

    // Render character: ENTITY|mage1|player|200|200|20|24|<hp>
    // Output: GAME_MESSAGE|Class: <className>
    // Output: GAME_MESSAGE|Stats — HP: <hp>, ATK: <atk>, DEF: <def>
    // Output: SCORE|<hp + atk + def>

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum CharClass { WARRIOR, MAGE, ROGUE };

string getClassName(CharClass c) {
    switch (c) {
        case WARRIOR: return "Warrior";
        case MAGE:    return "Mage";
        case ROGUE:   return "Rogue";
        default:      return "Unknown";
    }
}

int getBaseHP(CharClass c) {
    switch (c) {
        case WARRIOR: return 120;
        case MAGE:    return 80;
        case ROGUE:   return 90;
        default:      return 0;
    }
}

int getBaseATK(CharClass c) {
    switch (c) {
        case WARRIOR: return 15;
        case MAGE:    return 25;
        case ROGUE:   return 20;
        default:      return 0;
    }
}

int getBaseDEF(CharClass c) {
    switch (c) {
        case WARRIOR: return 12;
        case MAGE:    return 5;
        case ROGUE:   return 8;
        default:      return 0;
    }
}

int main() {
    // Create a MAGE character
    CharClass playerClass = MAGE;
    string className = getClassName(playerClass);
    int hp = getBaseHP(playerClass);
    int atk = getBaseATK(playerClass);
    int def = getBaseDEF(playerClass);

    // Render character entity
    cout << "ENTITY|mage1|player|200|200|20|24|" << hp << endl;

    // Display class info
    cout << "GAME_MESSAGE|Class: " << className << endl;
    cout << "GAME_MESSAGE|Stats — HP: " << hp << ", ATK: " << atk
         << ", DEF: " << def << endl;

    // Score = total stat points
    int totalStats = hp + atk + def;
    cout << "SCORE|" << totalStats << endl;

    return 0;
}`,

  tests: [
    {
      id: "mage-entity",
      description: "Renders mage character with 80 HP",
      expectedOutput: "ENTITY\\|mage1\\|player\\|200\\|200\\|20\\|24\\|80",
      isPattern: true,
    },
    {
      id: "class-name",
      description: "Displays Mage class name",
      expectedOutput: "GAME_MESSAGE\\|Class: Mage",
      isPattern: true,
    },
    {
      id: "stat-display",
      description: "Displays full stat line for Mage",
      expectedOutput: "GAME_MESSAGE\\|Stats .+ HP: 80, ATK: 25, DEF: 5",
      isPattern: true,
    },
    {
      id: "score-total-stats",
      description: "Score equals total stats (80 + 25 + 5 = 110)",
      expectedOutput: "SCORE\\|110",
      isPattern: true,
    },
  ],

  hints: [
    "Define the enum: enum CharClass { WARRIOR, MAGE, ROGUE };",
    "Use switch statements in each function: switch(c) { case WARRIOR: return 120; ... }",
    "Create the character with: CharClass playerClass = MAGE; then call each stat function with playerClass.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

enum CharClass { WARRIOR, MAGE, ROGUE };

string getClassName(CharClass c) {
    switch (c) {
        case WARRIOR: return "Warrior";
        case MAGE:    return "Mage";
        case ROGUE:   return "Rogue";
        default:      return "Unknown";
    }
}

int getBaseHP(CharClass c) {
    switch (c) {
        case WARRIOR: return 120;
        case MAGE:    return 80;
        case ROGUE:   return 90;
        default:      return 0;
    }
}

int getBaseATK(CharClass c) {
    switch (c) {
        case WARRIOR: return 15;
        case MAGE:    return 25;
        case ROGUE:   return 20;
        default:      return 0;
    }
}

int getBaseDEF(CharClass c) {
    switch (c) {
        case WARRIOR: return 12;
        case MAGE:    return 5;
        case ROGUE:   return 8;
        default:      return 0;
    }
}

int main() {
    // Create a MAGE character
    CharClass playerClass = MAGE;
    string className = getClassName(playerClass);
    int hp = getBaseHP(playerClass);
    int atk = getBaseATK(playerClass);
    int def = getBaseDEF(playerClass);

    // Render character entity
    cout << "ENTITY|mage1|player|200|200|20|24|" << hp << endl;

    // Display class info
    cout << "GAME_MESSAGE|Class: " << className << endl;
    cout << "GAME_MESSAGE|Stats — HP: " << hp << ", ATK: " << atk
         << ", DEF: " << def << endl;

    // Score = total stat points
    int totalStats = hp + atk + def;
    cout << "SCORE|" << totalStats << endl;

    return 0;
}`,
};
