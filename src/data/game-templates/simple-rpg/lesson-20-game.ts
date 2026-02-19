import type { GameLessonVariant } from "@/types/game";

export const lesson20SimpleRpg: GameLessonVariant = {
  lessonId: "20-spatial-buckets-v0",

  instructions: `# Combat Effects — Damage Number Display\n\nIn data-driven RPGs, **visual feedback** makes combat feel satisfying. When the warrior strikes an enemy, we display **damage numbers** as entities at the combat position.\n\n## What You'll Build\n\n- A warrior attacks a goblin for base damage\n- A **critical hit check** doubles damage when a condition is met\n- Floating **damage number entities** appear at the goblin's position\n- The combat result is reported via messages and score\n\n## Key Concepts\n\n- **Data-driven combat events**: damage values drive what gets rendered\n- **Critical hits**: conditional multiplier on base damage\n- **Effect entities**: temporary visual entities spawned from combat data\n\n## Output Protocol\n\n- \`ENTITY|id|type|x|y|width|height\` for all game objects\n- \`GAME_MESSAGE|text\` for combat narration\n- \`SCORE|value\` for total damage dealt`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Data-driven combat: generate visual damage effects from combat events
// Warrior attacks goblin. If goblinHP is even, it's a CRITICAL hit (2x damage).

struct CombatEvent {
    string attackerId;
    string targetId;
    int baseDamage;
    int targetX;
    int targetY;
    bool isCritical;
    int finalDamage;
};

// TODO: Write a function processCombat that takes a CombatEvent by reference
// - If target HP (use baseDamage % 2 == 0 as crit condition) triggers crit,
//   set isCritical = true and finalDamage = baseDamage * 2
// - Otherwise, isCritical = false and finalDamage = baseDamage

// TODO: Write a function renderDamageEffect that takes a CombatEvent
// - Output a damage number entity at the target position
//   ENTITY|dmg_effect|effect|targetX|targetY|16|16
// - If critical, output: GAME_MESSAGE|CRITICAL HIT! <finalDamage> damage!
// - Otherwise output: GAME_MESSAGE|Hit! <finalDamage> damage!

int main() {
    // Create warrior and goblin entities
    // ENTITY|warrior|player|180|200|22|26
    // ENTITY|goblin1|enemy|300|180|18|18

    // Create a CombatEvent: warrior attacks goblin, baseDamage=30,
    // target position (300, 180)

    // Process the combat event
    // Render the damage effect
    // Output SCORE|<finalDamage>

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct CombatEvent {
    string attackerId;
    string targetId;
    int baseDamage;
    int targetX;
    int targetY;
    bool isCritical;
    int finalDamage;
};

void processCombat(CombatEvent& evt) {
    if (evt.baseDamage % 2 == 0) {
        evt.isCritical = true;
        evt.finalDamage = evt.baseDamage * 2;
    } else {
        evt.isCritical = false;
        evt.finalDamage = evt.baseDamage;
    }
}

void renderDamageEffect(CombatEvent evt) {
    cout << "ENTITY|dmg_effect|effect|" << evt.targetX << "|"
         << evt.targetY << "|16|16" << endl;
    if (evt.isCritical) {
        cout << "GAME_MESSAGE|CRITICAL HIT! " << evt.finalDamage
             << " damage!" << endl;
    } else {
        cout << "GAME_MESSAGE|Hit! " << evt.finalDamage
             << " damage!" << endl;
    }
}

int main() {
    cout << "ENTITY|warrior|player|180|200|22|26" << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18" << endl;

    CombatEvent evt;
    evt.attackerId = "warrior";
    evt.targetId = "goblin1";
    evt.baseDamage = 30;
    evt.targetX = 300;
    evt.targetY = 180;
    evt.isCritical = false;
    evt.finalDamage = 0;

    processCombat(evt);
    renderDamageEffect(evt);

    cout << "SCORE|" << evt.finalDamage << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Outputs warrior entity at correct position",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26",
      isPattern: true,
    },
    {
      id: "goblin-entity",
      description: "Outputs goblin entity at correct position",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|300\\|180\\|18\\|18",
      isPattern: true,
    },
    {
      id: "damage-effect",
      description: "Renders damage number effect entity at goblin position",
      expectedOutput: "ENTITY\\|dmg_effect\\|effect\\|300\\|180\\|16\\|16",
      isPattern: true,
    },
    {
      id: "critical-message",
      description: "Displays critical hit message with doubled damage (30 is even, so 2x = 60)",
      expectedOutput: "GAME_MESSAGE\\|CRITICAL HIT! 60 damage!",
      isPattern: true,
    },
    {
      id: "score-output",
      description: "Outputs score equal to final damage dealt",
      expectedOutput: "SCORE\\|60",
      isPattern: true,
    },
  ],

  hints: [
    "The CombatEvent struct holds all combat data: attacker, target, damage, position, and results.",
    "In processCombat, check evt.baseDamage % 2 == 0 for the critical condition. 30 is even, so it crits.",
    "Critical hits double the damage: evt.finalDamage = evt.baseDamage * 2 gives 60.",
    "renderDamageEffect outputs an ENTITY line for the floating damage number, then a GAME_MESSAGE.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct CombatEvent {
    string attackerId;
    string targetId;
    int baseDamage;
    int targetX;
    int targetY;
    bool isCritical;
    int finalDamage;
};

void processCombat(CombatEvent& evt) {
    if (evt.baseDamage % 2 == 0) {
        evt.isCritical = true;
        evt.finalDamage = evt.baseDamage * 2;
    } else {
        evt.isCritical = false;
        evt.finalDamage = evt.baseDamage;
    }
}

void renderDamageEffect(CombatEvent evt) {
    cout << "ENTITY|dmg_effect|effect|" << evt.targetX << "|"
         << evt.targetY << "|16|16" << endl;
    if (evt.isCritical) {
        cout << "GAME_MESSAGE|CRITICAL HIT! " << evt.finalDamage
             << " damage!" << endl;
    } else {
        cout << "GAME_MESSAGE|Hit! " << evt.finalDamage
             << " damage!" << endl;
    }
}

int main() {
    cout << "ENTITY|warrior|player|180|200|22|26" << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18" << endl;

    CombatEvent evt;
    evt.attackerId = "warrior";
    evt.targetId = "goblin1";
    evt.baseDamage = 30;
    evt.targetX = 300;
    evt.targetY = 180;
    evt.isCritical = false;
    evt.finalDamage = 0;

    processCombat(evt);
    renderDamageEffect(evt);

    cout << "SCORE|" << evt.finalDamage << endl;

    return 0;
}`,
};
