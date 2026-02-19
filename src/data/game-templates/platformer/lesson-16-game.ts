import type { GameLessonVariant } from "@/types/game";

export const lesson16Platformer: GameLessonVariant = {
  lessonId: "16-entity-manager-class",
  instructions: `# Fixed Timestep — Deterministic Physics Loop\n\nReal games update physics many times per second. A **fixed timestep** means every physics step uses the same \`dt\` (delta time), making motion deterministic — the same code produces the same results on any hardware.\n\nWith gravity = 2000 pixels/sec\u00B2 and dt = 0.016s (approx 60 FPS):\n- Each frame: \`velocityY += gravity * dt\`\n- Then: \`posY += velocityY * dt\`\n\nThe player accelerates downward, falling faster each frame.\n\n## Your Task\n\n1. Start the player at y=100 with velocityY=0\n2. Simulate 5 frames with dt=0.016 and gravity=2000\n3. Each frame: update velocity, update position, output the player entity\n4. After all frames, output the ground platform and a summary message\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\`\n- \`SCORE|value\``,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    double playerY = 100.0;
    double velocityY = 0.0;
    double gravity = 2000.0;
    double dt = 0.016;

    // Simulate 5 frames:
    // Each frame: velocityY += gravity * dt
    //             playerY += velocityY * dt
    //             Output ENTITY with current position (cast playerY to int)

    // After loop: output ground platform and summary message

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    double playerY = 100.0;
    double velocityY = 0.0;
    double gravity = 2000.0;
    double dt = 0.016;

    for (int frame = 1; frame <= 5; frame++) {
        velocityY += gravity * dt;
        playerY += velocityY * dt;
        cout << "ENTITY|runner|player|50|" << (int)playerY
             << "|16|24" << endl;
    }

    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|Physics complete: 5 frames simulated at dt=0.016" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should output player entity on frame 1 near y=100",
      expectedOutput: "ENTITY\\|runner\\|player\\|50\\|100\\|16\\|24",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should show player falling further by frame 4",
      expectedOutput: "ENTITY\\|runner\\|player\\|50\\|105\\|16\\|24",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should show player at y=107 by frame 5",
      expectedOutput: "ENTITY\\|runner\\|player\\|50\\|107\\|16\\|24",
      isPattern: true,
    },
    {
      id: "t4",
      description: "Should render ground platform",
      expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|240\\|380\\|20",
      isPattern: true,
    },
    {
      id: "t5",
      description: "Should show physics complete message",
      expectedOutput: "GAME_MESSAGE\\|Physics complete: 5 frames simulated at dt=0.016",
      isPattern: true,
    },
  ],
  hints: [
    "Use a for loop: `for (int frame = 1; frame <= 5; frame++)` to simulate each frame.",
    "Update velocity first: `velocityY += gravity * dt;` then position: `playerY += velocityY * dt;`",
    "Cast to int for output: `(int)playerY` since ENTITY coordinates are integers.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    double playerY = 100.0;
    double velocityY = 0.0;
    double gravity = 2000.0;
    double dt = 0.016;

    for (int frame = 1; frame <= 5; frame++) {
        velocityY += gravity * dt;
        playerY += velocityY * dt;
        cout << "ENTITY|runner|player|50|" << (int)playerY
             << "|16|24" << endl;
    }

    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|Physics complete: 5 frames simulated at dt=0.016" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
