import type { GameLessonVariant } from "@/types/game";

export const lesson14Platformer: GameLessonVariant = {
  lessonId: "14-headers",
  instructions: `# Game Architecture — Forward-Declared Update Functions\n\nA platformer game loop has three distinct phases that run every frame:\n1. **Physics** — apply gravity, update velocities and positions\n2. **State** — check conditions, update player state (grounded, jumping, etc.)\n3. **Render** — output all entities to the screen\n\nIn C++, you can **forward-declare** functions before \`main()\` and define them afterward. This keeps your game loop clean: \`main()\` reads like a high-level blueprint while implementation details live below.\n\n## Your Task\n\n1. Forward-declare three functions before \`main()\`:\n   - \`void updatePhysics()\` — prints physics update info\n   - \`void updateState()\` — prints state transition info\n   - \`void renderScene()\` — outputs entities, score, and a message\n2. In \`main()\`, call them in order: physics, state, render\n3. Define each function after \`main()\`\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\`\n- \`SCORE|value\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Forward-declare the three update functions
// void updatePhysics();
// void updateState();
// void renderScene();

int main() {
    // Call the three functions in order: physics, state, render

    return 0;
}

// Define updatePhysics: print physics step info
// Define updateState: print state transition info
// Define renderScene: output ENTITY lines, SCORE, and GAME_MESSAGE
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

void updatePhysics();
void updateState();
void renderScene();

int main() {
    updatePhysics();
    updateState();
    renderScene();
    return 0;
}

void updatePhysics() {
    cout << "GAME_MESSAGE|Physics: gravity applied, player at (50,200)" << endl;
}

void updateState() {
    cout << "GAME_MESSAGE|State: player is GROUNDED on platform" << endl;
}

void renderScene() {
    cout << "ENTITY|runner|player|50|200|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "ENTITY|plat1|platform|100|180|60|10" << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Render: 3 entities drawn" << endl;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should output physics message first",
      expectedOutput: "GAME_MESSAGE\\|Physics: gravity applied, player at \\(50,200\\)",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should output state transition message",
      expectedOutput: "GAME_MESSAGE\\|State: player is GROUNDED on platform",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should render runner entity",
      expectedOutput: "ENTITY\\|runner\\|player\\|50\\|200\\|16\\|24",
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
      description: "Should render floating platform",
      expectedOutput: "ENTITY\\|plat1\\|platform\\|100\\|180\\|60\\|10",
      isPattern: true,
    },
    {
      id: "t6",
      description: "Should output render count message",
      expectedOutput: "GAME_MESSAGE\\|Render: 3 entities drawn",
      isPattern: true,
    },
  ],
  hints: [
    "Forward-declare all three functions before main: `void updatePhysics();` etc.",
    "In main, call them in order: `updatePhysics(); updateState(); renderScene();`",
    "Define each function after main — the forward declaration tells the compiler they exist.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

void updatePhysics();
void updateState();
void renderScene();

int main() {
    updatePhysics();
    updateState();
    renderScene();
    return 0;
}

void updatePhysics() {
    cout << "GAME_MESSAGE|Physics: gravity applied, player at (50,200)" << endl;
}

void updateState() {
    cout << "GAME_MESSAGE|State: player is GROUNDED on platform" << endl;
}

void renderScene() {
    cout << "ENTITY|runner|player|50|200|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "ENTITY|plat1|platform|100|180|60|10" << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Render: 3 entities drawn" << endl;
}
`,
};
