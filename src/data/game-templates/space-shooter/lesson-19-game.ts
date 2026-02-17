import type { GameLessonVariant } from "@/types/game";

export const lesson19SpaceShooter: GameLessonVariant = {
  lessonId: "19-difficulty",
  instructions: `# Difficulty System — Component Value Scaling\n\nIn an ECS, **difficulty** is a system that runs at spawn time. Instead of hard-coding enemy stats, the difficulty system scales component values based on the current wave number.\n\nThis keeps spawn logic simple — you always create the same base enemy — and lets a separate system handle scaling.\n\n## Your Task\n\n1. Write \`int scaleHP(int baseHP, int wave)\` — returns \`baseHP + (wave - 1) * 20\`\n2. Write \`double scaleSpeed(double base, int wave)\` — returns \`base + (wave - 1) * 0.5\`\n3. Spawn a wave 1 enemy and a wave 3 enemy using base HP=50 and base speed=1.0\n4. Output each enemy's stats with \`ENTITY\` and \`GAME_MESSAGE\`\n\n## Expected Values\n- Wave 1: HP = 50, speed = 1.0\n- Wave 3: HP = 90, speed = 2.0\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\`\n- \`SCORE|value\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write scaleHP: baseHP + (wave - 1) * 20
// Write scaleSpeed: base + (wave - 1) * 0.5

int main() {
    int baseHP = 50;
    double baseSpeed = 1.0;

    // Spawn wave 1 enemy: compute scaled HP and speed, render entity, show stats
    // Spawn wave 3 enemy: compute scaled HP and speed, render entity, show stats
    // Output SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int scaleHP(int baseHP, int wave) {
    return baseHP + (wave - 1) * 20;
}

double scaleSpeed(double base, int wave) {
    return base + (wave - 1) * 0.5;
}

int main() {
    int baseHP = 50;
    double baseSpeed = 1.0;

    int hp1 = scaleHP(baseHP, 1);
    double spd1 = scaleSpeed(baseSpeed, 1);
    cout << "ENTITY|enemy_w1|enemy|100|40|22|22" << endl;
    cout << "GAME_MESSAGE|Wave 1 enemy: HP=" << hp1 << " speed=" << spd1 << endl;

    int hp3 = scaleHP(baseHP, 3);
    double spd3 = scaleSpeed(baseSpeed, 3);
    cout << "ENTITY|enemy_w3|enemy|300|40|22|22" << endl;
    cout << "GAME_MESSAGE|Wave 3 enemy: HP=" << hp3 << " speed=" << spd3 << endl;

    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should render wave 1 enemy entity",
      expectedOutput: "ENTITY\\|enemy_w1\\|enemy\\|100\\|40\\|22\\|22",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should show wave 1 stats with HP=50 speed=1",
      expectedOutput: "GAME_MESSAGE\\|Wave 1 enemy: HP=50 speed=1",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should render wave 3 enemy entity",
      expectedOutput: "ENTITY\\|enemy_w3\\|enemy\\|300\\|40\\|22\\|22",
      isPattern: true,
    },
    {
      id: "t4",
      description: "Should show wave 3 stats with HP=90 speed=2",
      expectedOutput: "GAME_MESSAGE\\|Wave 3 enemy: HP=90 speed=2",
      isPattern: true,
    },
    {
      id: "t5",
      description: "Should output score",
      expectedOutput: "SCORE\\|0",
      isPattern: true,
    },
  ],
  hints: [
    "`scaleHP` formula: `return baseHP + (wave - 1) * 20;` — wave 1 adds 0, wave 3 adds 40.",
    "`scaleSpeed` formula: `return base + (wave - 1) * 0.5;` — wave 1 adds 0.0, wave 3 adds 1.0.",
    "Call both functions for wave 1 and wave 3, then use the results in your output.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int scaleHP(int baseHP, int wave) {
    return baseHP + (wave - 1) * 20;
}

double scaleSpeed(double base, int wave) {
    return base + (wave - 1) * 0.5;
}

int main() {
    int baseHP = 50;
    double baseSpeed = 1.0;

    int hp1 = scaleHP(baseHP, 1);
    double spd1 = scaleSpeed(baseSpeed, 1);
    cout << "ENTITY|enemy_w1|enemy|100|40|22|22" << endl;
    cout << "GAME_MESSAGE|Wave 1 enemy: HP=" << hp1 << " speed=" << spd1 << endl;

    int hp3 = scaleHP(baseHP, 3);
    double spd3 = scaleSpeed(baseSpeed, 3);
    cout << "ENTITY|enemy_w3|enemy|300|40|22|22" << endl;
    cout << "GAME_MESSAGE|Wave 3 enemy: HP=" << hp3 << " speed=" << spd3 << endl;

    cout << "SCORE|0" << endl;

    return 0;
}
`,
};
