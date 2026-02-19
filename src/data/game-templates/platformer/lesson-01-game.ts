import type { GameLessonVariant } from "@/types/game";

export const lesson01Platformer: GameLessonVariant = {
  lessonId: "01-boot-the-system",
  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Output a runner entity: ENTITY|runner|player|50|200|16|24
    // Output a message: GAME_MESSAGE|Level 1 Start!

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "ENTITY|runner|player|50|200|16|24" << endl;
    cout << "GAME_MESSAGE|Level 1 Start!" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should output runner entity", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|200\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should output level start message", expectedOutput: "GAME_MESSAGE\\|Level 1 Start!", isPattern: true },
  ],
  hints: [
    'Use `cout << "ENTITY|runner|player|50|200|16|24" << endl;`',
    "Each protocol line needs its own `endl`.",
    'Message format: `cout << "GAME_MESSAGE|Level 1 Start!" << endl;`',
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    cout << "ENTITY|runner|player|50|200|16|24" << endl;
    cout << "GAME_MESSAGE|Level 1 Start!" << endl;
    return 0;
}
`,
};
