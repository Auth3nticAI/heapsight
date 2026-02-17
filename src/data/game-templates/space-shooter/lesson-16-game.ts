import type { GameLessonVariant } from "@/types/game";

export const lesson16SpaceShooter: GameLessonVariant = {
  lessonId: "16-game-loop",
  instructions: `# ECS Tick — System Execution Order\n\nAn ECS **game loop** runs all systems in sequence each frame (or "tick"). A single tick looks like:\n\n1. **Movement System** — update positions\n2. **Boundary System** — check if entities left the play area\n3. **Render System** — output all alive entities\n\nIf an enemy reaches \`y > 400\`, the game is over.\n\n## Your Task\n\n1. Store a ship and 2 enemies in parallel arrays\n2. Simulate **3 frames**: each frame moves enemies down by 120 on the y-axis\n3. Each frame: output a frame header message, render all alive entities\n4. If any enemy's y > 400 after movement, output \`GAME_OVER\` and stop\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\`\n- \`GAME_OVER\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Entity component arrays (3 entities: ship + 2 enemies)
    // ids: "ship", "enemy1", "enemy2"
    // types: "player", "enemy", "enemy"
    // x: {180, 100, 300}  y: {400, 40, 80}
    // w: {24, 22, 22}     h: {24, 22, 22}

    // Simulate 3 frames
    // Each frame: move enemies down by 120, render entities
    // If any enemy y > 400: output GAME_OVER and break

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string ids[] = {"ship", "enemy1", "enemy2"};
    string types[] = {"player", "enemy", "enemy"};
    int x[] = {180, 100, 300};
    int y[] = {400, 40, 80};
    int w[] = {24, 22, 22};
    int h[] = {24, 22, 22};
    int count = 3;
    bool gameOver = false;

    for (int frame = 1; frame <= 3; frame++) {
        // Movement system: move enemies down
        for (int i = 0; i < count; i++) {
            if (types[i] == "enemy") {
                y[i] += 120;
            }
        }

        cout << "GAME_MESSAGE|Frame " << frame << " — systems running" << endl;

        // Render system
        for (int i = 0; i < count; i++) {
            cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
                 << x[i] << "|" << y[i] << "|" << w[i] << "|" << h[i] << endl;
        }

        // Boundary system: check game over
        for (int i = 0; i < count; i++) {
            if (types[i] == "enemy" && y[i] > 400) {
                cout << "GAME_OVER" << endl;
                gameOver = true;
                break;
            }
        }

        if (gameOver) break;
    }

    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should output frame 1 header",
      expectedOutput: "GAME_MESSAGE\\|Frame 1",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should render enemy1 at y=160 in frame 1",
      expectedOutput: "ENTITY\\|enemy1\\|enemy\\|100\\|160\\|22\\|22",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should render enemy2 at y=200 in frame 1",
      expectedOutput: "ENTITY\\|enemy2\\|enemy\\|300\\|200\\|22\\|22",
      isPattern: true,
    },
    {
      id: "t4",
      description: "Should output frame 3 header",
      expectedOutput: "GAME_MESSAGE\\|Frame 3",
      isPattern: true,
    },
    {
      id: "t5",
      description: "Should trigger GAME_OVER when enemy passes y=400",
      expectedOutput: "GAME_OVER",
      isPattern: true,
    },
  ],
  hints: [
    "Use a for loop from frame 1 to 3. Each iteration is one ECS tick.",
    "Move only entities where `types[i] == \"enemy\"` by adding 120 to y[i].",
    "After rendering, check if any enemy y > 400. If so, print `GAME_OVER` and break.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string ids[] = {"ship", "enemy1", "enemy2"};
    string types[] = {"player", "enemy", "enemy"};
    int x[] = {180, 100, 300};
    int y[] = {400, 40, 80};
    int w[] = {24, 22, 22};
    int h[] = {24, 22, 22};
    int count = 3;
    bool gameOver = false;

    for (int frame = 1; frame <= 3; frame++) {
        for (int i = 0; i < count; i++) {
            if (types[i] == "enemy") {
                y[i] += 120;
            }
        }

        cout << "GAME_MESSAGE|Frame " << frame << " — systems running" << endl;

        for (int i = 0; i < count; i++) {
            cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
                 << x[i] << "|" << y[i] << "|" << w[i] << "|" << h[i] << endl;
        }

        for (int i = 0; i < count; i++) {
            if (types[i] == "enemy" && y[i] > 400) {
                cout << "GAME_OVER" << endl;
                gameOver = true;
                break;
            }
        }

        if (gameOver) break;
    }

    return 0;
}
`,
};
