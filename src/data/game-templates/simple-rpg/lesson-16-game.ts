import type { GameLessonVariant } from "@/types/game";

export const lesson16SimpleRpg: GameLessonVariant = {
  lessonId: "16-game-loop",

  instructions: `# Turn System — Combat Round Simulation

## Objective
Build a **turn-based combat loop** that simulates 3 rounds of combat between a warrior and an orc, updating HP and rendering entities each round.

## Why This Matters
Turn-based RPGs process combat as a sequence of rounds. Each round is an **event queue**: player attacks, enemy attacks, state is checked. This loop pattern is the heart of every turn-based game from Final Fantasy to XCOM.

## Data-Driven OOP Concept
Each round processes the same event sequence (attack, counter-attack, render). The **loop is the engine**; the damage values and HP are the **data**. Changing the data changes the fight without changing the code structure.

## Requirements
1. Warrior: 100 HP, 20 ATK, at (180, 200), size 22x26.
2. Orc: 60 HP, 12 ATK, at (300, 180), size 20x22.
3. Simulate **3 combat rounds** using a for loop:
   - Player attacks orc: orc loses warrior's ATK damage.
   - Orc attacks player: warrior loses orc's ATK damage (only if orc HP > 0).
   - Output both entities with updated HP each round.
   - Output \`GAME_MESSAGE|Round X complete\` after each round.
4. After all rounds, output \`SCORE|<total damage dealt by warrior>\`.
5. After all rounds, output \`GAME_OVER\`.

## Expected Output
\`\`\`
ENTITY|warrior|player|180|200|22|26|88
ENTITY|orc|enemy|300|180|20|22|40
GAME_MESSAGE|Round 1 complete
ENTITY|warrior|player|180|200|22|26|76
ENTITY|orc|enemy|300|180|20|22|20
GAME_MESSAGE|Round 2 complete
ENTITY|warrior|player|180|200|22|26|76
ENTITY|orc|enemy|300|180|20|22|0
GAME_MESSAGE|Round 3 complete
SCORE|60
GAME_OVER
\`\`\``,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Warrior: 100 HP, 20 ATK, at (180,200), size 22x26
    // Orc: 60 HP, 12 ATK, at (300,180), size 20x22

    // Track total damage dealt by warrior
    // int totalDamage = 0;

    // Loop 3 combat rounds:
    // for (int round = 1; round <= 3; round++) {
    //     1. Warrior attacks orc (orc HP -= warrior ATK)
    //        Clamp orc HP to minimum 0
    //        Add warrior ATK to totalDamage
    //
    //     2. Orc attacks warrior (only if orc HP > 0)
    //        warrior HP -= orc ATK
    //
    //     3. Output ENTITY for warrior with current HP
    //     4. Output ENTITY for orc with current HP
    //     5. Output GAME_MESSAGE|Round X complete
    // }

    // Output SCORE|totalDamage
    // Output GAME_OVER

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int warriorHP = 100;
    int warriorATK = 20;
    int orcHP = 60;
    int orcATK = 12;
    int totalDamage = 0;

    for (int round = 1; round <= 3; round++) {
        // Warrior attacks orc
        orcHP = orcHP - warriorATK;
        if (orcHP < 0) orcHP = 0;
        totalDamage = totalDamage + warriorATK;

        // Orc attacks warrior (only if alive)
        if (orcHP > 0) {
            warriorHP = warriorHP - orcATK;
        }

        // Render entities
        cout << "ENTITY|warrior|player|180|200|22|26|" << warriorHP << endl;
        cout << "ENTITY|orc|enemy|300|180|20|22|" << orcHP << endl;
        cout << "GAME_MESSAGE|Round " << round << " complete" << endl;
    }

    cout << "SCORE|" << totalDamage << endl;
    cout << "GAME_OVER" << endl;

    return 0;
}`,

  tests: [
    {
      id: "round1-warrior",
      description: "Warrior has 88 HP after round 1 (100 - 12)",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|88",
      isPattern: true,
    },
    {
      id: "round1-orc",
      description: "Orc has 40 HP after round 1 (60 - 20)",
      expectedOutput: "ENTITY\\|orc\\|enemy\\|300\\|180\\|20\\|22\\|40",
      isPattern: true,
    },
    {
      id: "round2-warrior",
      description: "Warrior has 76 HP after round 2 (88 - 12)",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|76",
      isPattern: true,
    },
    {
      id: "round3-orc-dead",
      description: "Orc has 0 HP after round 3 (20 - 20)",
      expectedOutput: "ENTITY\\|orc\\|enemy\\|300\\|180\\|20\\|22\\|0",
      isPattern: true,
    },
    {
      id: "round3-warrior-no-damage",
      description: "Warrior takes no damage in round 3 because orc is dead (stays 76)",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|76",
      isPattern: true,
    },
    {
      id: "round-messages",
      description: "Outputs round complete message for each round",
      expectedOutput: "GAME_MESSAGE\\|Round 3 complete",
      isPattern: true,
    },
    {
      id: "total-score",
      description: "Total damage dealt equals 60 (20 x 3 rounds)",
      expectedOutput: "SCORE\\|60",
      isPattern: true,
    },
    {
      id: "game-over",
      description: "Outputs GAME_OVER after all rounds",
      expectedOutput: "GAME_OVER",
      isPattern: true,
    },
  ],

  hints: [
    "Initialize variables: int warriorHP = 100, warriorATK = 20, orcHP = 60, orcATK = 12, totalDamage = 0;",
    "In each round, subtract warriorATK from orcHP first, then clamp: if (orcHP < 0) orcHP = 0;",
    "Only let the orc attack if orcHP > 0 after taking damage. This prevents a dead orc from hitting back.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int warriorHP = 100;
    int warriorATK = 20;
    int orcHP = 60;
    int orcATK = 12;
    int totalDamage = 0;

    for (int round = 1; round <= 3; round++) {
        // Warrior attacks orc
        orcHP = orcHP - warriorATK;
        if (orcHP < 0) orcHP = 0;
        totalDamage = totalDamage + warriorATK;

        // Orc attacks warrior (only if alive)
        if (orcHP > 0) {
            warriorHP = warriorHP - orcATK;
        }

        // Render entities
        cout << "ENTITY|warrior|player|180|200|22|26|" << warriorHP << endl;
        cout << "ENTITY|orc|enemy|300|180|20|22|" << orcHP << endl;
        cout << "GAME_MESSAGE|Round " << round << " complete" << endl;
    }

    cout << "SCORE|" << totalDamage << endl;
    cout << "GAME_OVER" << endl;

    return 0;
}`,
};
