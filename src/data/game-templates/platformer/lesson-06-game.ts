import type { GameLessonVariant } from "@/types/game";

export const lesson06Platformer: GameLessonVariant = {
  lessonId: "06-soa-enemies",
  instructions: `# Platform Layout — Position Arrays

## Project: Platformer FSM — Level Geometry in Arrays

**What you're building:** A platformer scene with 5 platforms whose positions are stored in parallel arrays. This is how real platformers store level geometry — contiguous arrays of positions that the physics and rendering systems iterate over each frame.

## Concept: Level Geometry as Data

Instead of hardcoding each platform as a separate variable, we store all platform data in parallel arrays:

\`\`\`
int platX[5];      // all X positions together
int platY[5];      // all Y positions together
int platW[5];      // all widths together
int platH[5];      // all heights together
\`\`\`

This makes it trivial to loop through every platform for collision detection, rendering, or any other system that needs to process them.

## Your Task

1. Create parallel arrays for 5 platforms: \`platX[5]\`, \`platY[5]\`, \`platW[5]\`, \`platH[5]\`
2. Initialize them with these values:
   - Platform 0 (ground): x=0, y=240, w=380, h=20
   - Platform 1: x=50, y=190, w=80, h=12
   - Platform 2: x=160, y=150, w=80, h=12
   - Platform 3: x=270, y=110, w=80, h=12
   - Platform 4: x=100, y=70, w=100, h=12
3. Output the player entity: \`ENTITY|runner|player|50|200|16|24\`
4. Loop through all 5 platforms and output each as: \`ENTITY|platN|platform|x|y|w|h\`
5. Output \`GAME_MESSAGE|5 platforms loaded\`
6. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Declare parallel arrays for 5 platforms
    // platX[5], platY[5], platW[5], platH[5]

    // TODO: Output player entity
    // ENTITY|runner|player|50|200|16|24

    // TODO: Loop through platforms and output ENTITY lines
    // Format: ENTITY|platN|platform|x|y|w|h

    // TODO: Output GAME_MESSAGE and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int platX[5] = {0, 50, 160, 270, 100};
    int platY[5] = {240, 190, 150, 110, 70};
    int platW[5] = {380, 80, 80, 80, 100};
    int platH[5] = {20, 12, 12, 12, 12};

    cout << "ENTITY|runner|player|50|200|16|24" << endl;

    for (int i = 0; i < 5; i++) {
        cout << "ENTITY|plat" << i << "|platform|"
             << platX[i] << "|" << platY[i] << "|"
             << platW[i] << "|" << platH[i] << endl;
    }

    cout << "GAME_MESSAGE|5 platforms loaded" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player entity", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|200\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render ground platform", expectedOutput: "ENTITY\\|plat0\\|platform\\|0\\|240\\|380\\|20", isPattern: true },
    { id: "g3", description: "Should render plat1", expectedOutput: "ENTITY\\|plat1\\|platform\\|50\\|190\\|80\\|12", isPattern: true },
    { id: "g4", description: "Should render plat4", expectedOutput: "ENTITY\\|plat4\\|platform\\|100\\|70\\|100\\|12", isPattern: true },
    { id: "g5", description: "Should show platforms loaded message", expectedOutput: "GAME_MESSAGE\\|5 platforms loaded", isPattern: true },
    { id: "g6", description: "Should show initial score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Declare arrays like: `int platX[5] = {0, 50, 160, 270, 100};`",
    "Use a for loop: `for (int i = 0; i < 5; i++)` to iterate all platforms.",
    "Build the platform ID in the output: `\"plat\" << i`",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int platX[5] = {0, 50, 160, 270, 100};
    int platY[5] = {240, 190, 150, 110, 70};
    int platW[5] = {380, 80, 80, 80, 100};
    int platH[5] = {20, 12, 12, 12, 12};

    cout << "ENTITY|runner|player|50|200|16|24" << endl;

    for (int i = 0; i < 5; i++) {
        cout << "ENTITY|plat" << i << "|platform|"
             << platX[i] << "|" << platY[i] << "|"
             << platW[i] << "|" << platH[i] << endl;
    }

    cout << "GAME_MESSAGE|5 platforms loaded" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
