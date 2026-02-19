import type { GameLessonVariant } from "@/types/game";

export const lesson10Platformer: GameLessonVariant = {
  lessonId: "10-entity-pool-v0",
  instructions: `# Dynamic Level — Runtime Platform Creation

## Project: Platformer FSM — Dynamic Memory for Level Data

**What you're building:** A level loading system that creates platform data at runtime using \`new\` and \`delete\`. Real games load level data from files — the number of platforms isn't known at compile time, so dynamic allocation is essential.

## Concept: Dynamic Level Loading

When loading a level from a file, you don't know how many platforms exist until runtime:

\`\`\`
int count = 3;  // read from level file
int* platX = new int[count];  // allocate at runtime
// ... use the data ...
delete[] platX;  // clean up when level unloads
\`\`\`

Forgetting \`delete[]\` causes memory leaks — your game eats more RAM every time a level loads!

## Your Task

1. Set \`int count = 3;\` (simulating a level file header)
2. Dynamically allocate arrays: \`new int[count]\` for platX, platY, platW, platH
3. Fill them with:
   - Platform 0: x=0, y=240, w=380, h=20 (ground)
   - Platform 1: x=80, y=180, w=90, h=12
   - Platform 2: x=220, y=130, w=90, h=12
4. Output player: \`ENTITY|runner|player|50|200|16|24\`
5. Loop and output each platform: \`ENTITY|platN|platform|x|y|w|h\`
6. Delete all arrays with \`delete[]\`
7. Output \`GAME_MESSAGE|3 platforms loaded dynamically\`
8. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    int count = 3;

    // TODO: Allocate dynamic arrays with new int[count]
    // platX, platY, platW, platH

    // TODO: Fill platform data
    // Platform 0 (ground): 0, 240, 380, 20
    // Platform 1: 80, 180, 90, 12
    // Platform 2: 220, 130, 90, 12

    // TODO: Output player entity

    // TODO: Loop and output platform entities

    // TODO: delete[] all arrays

    // TODO: Output GAME_MESSAGE and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int count = 3;

    int* platX = new int[count];
    int* platY = new int[count];
    int* platW = new int[count];
    int* platH = new int[count];

    platX[0] = 0;   platY[0] = 240; platW[0] = 380; platH[0] = 20;
    platX[1] = 80;  platY[1] = 180; platW[1] = 90;  platH[1] = 12;
    platX[2] = 220; platY[2] = 130; platW[2] = 90;  platH[2] = 12;

    cout << "ENTITY|runner|player|50|200|16|24" << endl;

    for (int i = 0; i < count; i++) {
        cout << "ENTITY|plat" << i << "|platform|"
             << platX[i] << "|" << platY[i] << "|"
             << platW[i] << "|" << platH[i] << endl;
    }

    delete[] platX;
    delete[] platY;
    delete[] platW;
    delete[] platH;

    cout << "GAME_MESSAGE|3 platforms loaded dynamically" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player entity", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|200\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render dynamic ground", expectedOutput: "ENTITY\\|plat0\\|platform\\|0\\|240\\|380\\|20", isPattern: true },
    { id: "g3", description: "Should render plat1", expectedOutput: "ENTITY\\|plat1\\|platform\\|80\\|180\\|90\\|12", isPattern: true },
    { id: "g4", description: "Should render plat2", expectedOutput: "ENTITY\\|plat2\\|platform\\|220\\|130\\|90\\|12", isPattern: true },
    { id: "g5", description: "Should show dynamic loading message", expectedOutput: "GAME_MESSAGE\\|3 platforms loaded dynamically", isPattern: true },
    { id: "g6", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Allocate with: `int* platX = new int[count];`",
    "Access elements just like regular arrays: `platX[0] = 0;`",
    "Always clean up: `delete[] platX;` for every `new int[count]`.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int count = 3;

    int* platX = new int[count];
    int* platY = new int[count];
    int* platW = new int[count];
    int* platH = new int[count];

    platX[0] = 0;   platY[0] = 240; platW[0] = 380; platH[0] = 20;
    platX[1] = 80;  platY[1] = 180; platW[1] = 90;  platH[1] = 12;
    platX[2] = 220; platY[2] = 130; platW[2] = 90;  platH[2] = 12;

    cout << "ENTITY|runner|player|50|200|16|24" << endl;

    for (int i = 0; i < count; i++) {
        cout << "ENTITY|plat" << i << "|platform|"
             << platX[i] << "|" << platY[i] << "|"
             << platW[i] << "|" << platH[i] << endl;
    }

    delete[] platX;
    delete[] platY;
    delete[] platW;
    delete[] platH;

    cout << "GAME_MESSAGE|3 platforms loaded dynamically" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
