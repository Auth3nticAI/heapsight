import type { GameLessonVariant } from "@/types/game";

export const lesson15SpaceShooter: GameLessonVariant = {
  lessonId: "15-collision",
  instructions: `# Collision System — AABB Between Entity Components\n\nIn ECS, **collision detection** is a system that reads position and size components to determine overlap. The most common 2D check is **AABB** (Axis-Aligned Bounding Box):\n\nTwo rectangles overlap when:\n\`\`\`\nax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by\n\`\`\`\n\n## Your Task\n\n1. Store bullet and enemy positions/sizes in parallel arrays (SoA style)\n2. Write \`bool checkAABB(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh)\`\n3. Check if the bullet collides with the enemy\n4. If collision: reduce enemy health by 25, output a \`GAME_MESSAGE\` and \`SCORE\`\n5. Render both entities\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\`\n- \`SCORE|value\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write checkAABB function: returns true if two rectangles overlap

int main() {
    // Parallel arrays for entity components (SoA)
    // ids: "bullet1", "enemy1"
    // types: "bullet", "enemy"
    // x:  {200, 195}  y: {100, 95}
    // w:  {6, 24}     h: {12, 24}
    // health: {1, 50}

    // Check collision between bullet and enemy
    // If hit: reduce enemy health by 25, output message and score
    // Render all entities

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

bool checkAABB(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

int main() {
    string ids[] = {"bullet1", "enemy1"};
    string types[] = {"bullet", "enemy"};
    int x[] = {200, 195};
    int y[] = {100, 95};
    int w[] = {6, 24};
    int h[] = {12, 24};
    int health[] = {1, 50};

    if (checkAABB(x[0], y[0], w[0], h[0], x[1], y[1], w[1], h[1])) {
        health[1] -= 25;
        cout << "GAME_MESSAGE|Bullet hit enemy! Health reduced to " << health[1] << endl;
        cout << "SCORE|25" << endl;
    }

    for (int i = 0; i < 2; i++) {
        cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
             << x[i] << "|" << y[i] << "|" << w[i] << "|" << h[i] << endl;
    }

    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should detect collision and show hit message",
      expectedOutput: "GAME_MESSAGE\\|Bullet hit enemy! Health reduced to 25",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should award 25 points for hit",
      expectedOutput: "SCORE\\|25",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should render bullet entity",
      expectedOutput: "ENTITY\\|bullet1\\|bullet\\|200\\|100\\|6\\|12",
      isPattern: true,
    },
    {
      id: "t4",
      description: "Should render enemy entity",
      expectedOutput: "ENTITY\\|enemy1\\|enemy\\|195\\|95\\|24\\|24",
      isPattern: true,
    },
  ],
  hints: [
    "AABB check: `return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;`",
    "Use index 0 for bullet and index 1 for enemy when calling checkAABB.",
    "If collision is true, subtract 25 from health[1] and print GAME_MESSAGE and SCORE.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

bool checkAABB(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

int main() {
    string ids[] = {"bullet1", "enemy1"};
    string types[] = {"bullet", "enemy"};
    int x[] = {200, 195};
    int y[] = {100, 95};
    int w[] = {6, 24};
    int h[] = {12, 24};
    int health[] = {1, 50};

    if (checkAABB(x[0], y[0], w[0], h[0], x[1], y[1], w[1], h[1])) {
        health[1] -= 25;
        cout << "GAME_MESSAGE|Bullet hit enemy! Health reduced to " << health[1] << endl;
        cout << "SCORE|25" << endl;
    }

    for (int i = 0; i < 2; i++) {
        cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
             << x[i] << "|" << y[i] << "|" << w[i] << "|" << h[i] << endl;
    }

    return 0;
}
`,
};
