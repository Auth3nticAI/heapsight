import type { GameLessonVariant } from "@/types/game";

export const lesson09SimpleRpg: GameLessonVariant = {
  lessonId: "09-references",

  instructions: `# Stat Modification — Buff System by Reference\n\nIn RPG buff/debuff systems, functions modify character stats **in-place**. C++ references let you pass a stat variable directly so the function changes the original value — no copies, no return values needed.\n\n## Objectives\n- Write \`applyBuff(int& stat, int amount)\` that adds \`amount\` to \`stat\`\n- Write \`applyDebuff(int& stat, int amount)\` that subtracts \`amount\` from \`stat\` (minimum 0)\n- Apply a +15 strength buff to the warrior\n- Apply a -10 defense debuff to the goblin\n- Render both entities and show messages\n\n## Output Protocol\n- \`ENTITY|id|type|x|y|width|height|health\` — render characters\n- \`GAME_MESSAGE|text\` — describe buff/debuff effects\n- \`SCORE|value\` — total stat change applied`,

  starterCode: `#include <iostream>
using namespace std;

// Write applyBuff: takes int& stat and int amount
// Adds amount to stat
// Output: GAME_MESSAGE|Buff applied! Stat increased by <amount>

// Write applyDebuff: takes int& stat and int amount
// Subtracts amount from stat (don't go below 0)
// Output: GAME_MESSAGE|Debuff applied! Stat decreased by <amount>

int main() {
    int warriorStrength = 20;
    int warriorHP = 100;
    int goblinDefense = 15;
    int goblinHP = 40;

    // Apply +15 strength buff to warrior
    // Apply -10 defense debuff to goblin

    // Render warrior: ENTITY|warrior|player|180|200|22|26|<warriorHP>
    // Render goblin: ENTITY|goblin1|enemy|300|180|18|18|<goblinHP>

    // Output: GAME_MESSAGE|Warrior STR: <strength>, Goblin DEF: <defense>
    // Output: SCORE|25  (total stat points changed: 15 + 10)

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

void applyBuff(int& stat, int amount) {
    stat += amount;
    cout << "GAME_MESSAGE|Buff applied! Stat increased by " << amount << endl;
}

void applyDebuff(int& stat, int amount) {
    stat -= amount;
    if (stat < 0) stat = 0;
    cout << "GAME_MESSAGE|Debuff applied! Stat decreased by " << amount << endl;
}

int main() {
    int warriorStrength = 20;
    int warriorHP = 100;
    int goblinDefense = 15;
    int goblinHP = 40;

    // Apply buffs and debuffs by reference
    applyBuff(warriorStrength, 15);
    applyDebuff(goblinDefense, 10);

    // Render entities
    cout << "ENTITY|warrior|player|180|200|22|26|" << warriorHP << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18|" << goblinHP << endl;

    // Show final stats
    cout << "GAME_MESSAGE|Warrior STR: " << warriorStrength
         << ", Goblin DEF: " << goblinDefense << endl;

    // Score = total stat points changed
    cout << "SCORE|25" << endl;

    return 0;
}`,

  tests: [
    {
      id: "buff-message",
      description: "Displays buff applied message for +15",
      expectedOutput: "GAME_MESSAGE\\|Buff applied! Stat increased by 15",
      isPattern: true,
    },
    {
      id: "debuff-message",
      description: "Displays debuff applied message for -10",
      expectedOutput: "GAME_MESSAGE\\|Debuff applied! Stat decreased by 10",
      isPattern: true,
    },
    {
      id: "warrior-entity",
      description: "Renders warrior entity with 100 HP",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|100",
      isPattern: true,
    },
    {
      id: "goblin-entity",
      description: "Renders goblin entity with 40 HP",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|300\\|180\\|18\\|18\\|40",
      isPattern: true,
    },
    {
      id: "final-stats",
      description: "Shows final stats: warrior STR 35, goblin DEF 5",
      expectedOutput: "GAME_MESSAGE\\|Warrior STR: 35, Goblin DEF: 5",
      isPattern: true,
    },
    {
      id: "score-total",
      description: "Score equals total stat change (15 + 10 = 25)",
      expectedOutput: "SCORE\\|25",
      isPattern: true,
    },
  ],

  hints: [
    "Use int& in the parameter list: void applyBuff(int& stat, int amount) to pass by reference.",
    "In applyDebuff, after subtracting check: if (stat < 0) stat = 0; to prevent negative stats.",
    "Call applyBuff(warriorStrength, 15) — this modifies warriorStrength directly because it's passed by reference.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

void applyBuff(int& stat, int amount) {
    stat += amount;
    cout << "GAME_MESSAGE|Buff applied! Stat increased by " << amount << endl;
}

void applyDebuff(int& stat, int amount) {
    stat -= amount;
    if (stat < 0) stat = 0;
    cout << "GAME_MESSAGE|Debuff applied! Stat decreased by " << amount << endl;
}

int main() {
    int warriorStrength = 20;
    int warriorHP = 100;
    int goblinDefense = 15;
    int goblinHP = 40;

    // Apply buffs and debuffs by reference
    applyBuff(warriorStrength, 15);
    applyDebuff(goblinDefense, 10);

    // Render entities
    cout << "ENTITY|warrior|player|180|200|22|26|" << warriorHP << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18|" << goblinHP << endl;

    // Show final stats
    cout << "GAME_MESSAGE|Warrior STR: " << warriorStrength
         << ", Goblin DEF: " << goblinDefense << endl;

    // Score = total stat points changed
    cout << "SCORE|25" << endl;

    return 0;
}`,
};
