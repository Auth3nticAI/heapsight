import type { GameLessonVariant } from "@/types/game";

export const lesson24SpaceShooter: GameLessonVariant = {
  lessonId: "24-debugging",
  instructions: `# System Debugging — Fix 3 ECS Bugs\n\nData-oriented code stores everything in arrays. This makes bugs subtle: a wrong index, an off-by-one loop, or a wrong type string can silently corrupt your entire game state.\n\n## Concepts\n- Common ECS bugs: wrong array index, off-by-one in system loops, incorrect entity type\n- Debugging strategy: check array data, loop bounds, and string values\n- Systematic approach to fixing data-oriented bugs\n\n## Your Task\nThe starter code has **3 bugs**. Find and fix them so the output matches the expected results:\n\n### Bug 1: Wrong Array Index\nThe render loop accesses \`hp[0]\` for all entities instead of \`hp[i]\`.\n\n### Bug 2: Off-by-One in Loop\nThe movement system loops \`i <= COUNT\` instead of \`i < COUNT\`, causing out-of-bounds access.\n\n### Bug 3: Wrong Entity Type\nThe second enemy is labeled "player" instead of "enemy".\n\n## Expected Output\n\`\`\`\nENTITY|ship|player|180|210|24|24|100\nENTITY|alien1|enemy|100|55|22|22|60\nENTITY|alien2|enemy|300|75|22|22|40\nGAME_MESSAGE|Systems nominal: 3 entities processed\nSCORE|0\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int COUNT = 3;

int main() {
    // ECS component arrays
    string ids[COUNT] = {"ship", "alien1", "alien2"};
    string types[COUNT] = {"player", "enemy", "player"};  // BUG 3: alien2 has wrong type
    int x[COUNT] = {180, 100, 300};
    int y[COUNT] = {200, 45, 65};
    int w[COUNT] = {24, 22, 22};
    int h[COUNT] = {24, 22, 22};
    int hp[COUNT] = {100, 60, 40};

    // Movement system — move all entities down by 10
    for (int i = 0; i <= COUNT; i++) {  // BUG 2: off-by-one, should be i < COUNT
        y[i] = y[i] + 10;
    }

    // Render system
    for (int i = 0; i < COUNT; i++) {
        cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
             << x[i] << "|" << y[i] << "|" << w[i] << "|" << h[i]
             << "|" << hp[0] << endl;  // BUG 1: should be hp[i], not hp[0]
    }

    cout << "GAME_MESSAGE|Systems nominal: " << COUNT << " entities processed" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int COUNT = 3;

int main() {
    // ECS component arrays
    string ids[COUNT] = {"ship", "alien1", "alien2"};
    string types[COUNT] = {"player", "enemy", "enemy"};
    int x[COUNT] = {180, 100, 300};
    int y[COUNT] = {200, 45, 65};
    int w[COUNT] = {24, 22, 22};
    int h[COUNT] = {24, 22, 22};
    int hp[COUNT] = {100, 60, 40};

    // Movement system — move all entities down by 10
    for (int i = 0; i < COUNT; i++) {
        y[i] = y[i] + 10;
    }

    // Render system
    for (int i = 0; i < COUNT; i++) {
        cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
             << x[i] << "|" << y[i] << "|" << w[i] << "|" << h[i]
             << "|" << hp[i] << endl;
    }

    cout << "GAME_MESSAGE|Systems nominal: " << COUNT << " entities processed" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render ship with correct HP (100) after movement", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|210\\|24\\|24\\|100", isPattern: true },
    { id: "g2", description: "Should render alien1 as enemy type with HP 60", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|55\\|22\\|22\\|60", isPattern: true },
    { id: "g3", description: "Should render alien2 as enemy type (not player) with HP 40", expectedOutput: "ENTITY\\|alien2\\|enemy\\|300\\|75\\|22\\|22\\|40", isPattern: true },
    { id: "g4", description: "Should show systems nominal message", expectedOutput: "GAME_MESSAGE\\|Systems nominal: 3 entities processed", isPattern: true },
    { id: "g5", description: "Should output score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Bug 1 (render system): Look at the hp index in the render loop. It uses `hp[0]` for every entity — it should be `hp[i]`.",
    "Bug 2 (movement system): The for loop uses `i <= COUNT` which goes one past the array. Change to `i < COUNT`.",
    "Bug 3 (entity type): Look at the types array. alien2 is set to \"player\" — it should be \"enemy\".",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int COUNT = 3;

int main() {
    string ids[COUNT] = {"ship", "alien1", "alien2"};
    string types[COUNT] = {"player", "enemy", "enemy"};
    int x[COUNT] = {180, 100, 300};
    int y[COUNT] = {200, 45, 65};
    int w[COUNT] = {24, 22, 22};
    int h[COUNT] = {24, 22, 22};
    int hp[COUNT] = {100, 60, 40};
    for (int i = 0; i < COUNT; i++) {
        y[i] = y[i] + 10;
    }
    for (int i = 0; i < COUNT; i++) {
        cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
             << x[i] << "|" << y[i] << "|" << w[i] << "|" << h[i]
             << "|" << hp[i] << endl;
    }
    cout << "GAME_MESSAGE|Systems nominal: " << COUNT << " entities processed" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
