import type { GameLessonVariant } from "@/types/game";

export const lesson02Platformer: GameLessonVariant = {
  lessonId: "02-player-stats",
  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Runner variables
    int rx = 50, ry = 200;
    // Add rw, rh, lives variables

    // Platform variables

    // Output entities using game protocol

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int rx = 50, ry = 200, rw = 16, rh = 24, lives = 3;
    int px = 0, py = 240, pw = 380, ph = 20;

    cout << "ENTITY|runner|player|" << rx << "|" << ry << "|" << rw << "|" << rh << "|" << lives << endl;
    cout << "ENTITY|platform1|platform|" << px << "|" << py << "|" << pw << "|" << ph << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Platform world loaded!" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should output runner with lives", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|200\\|16\\|24\\|3", isPattern: true },
    { id: "g2", description: "Should output platform", expectedOutput: "ENTITY\\|platform1\\|platform\\|0\\|240\\|380\\|20", isPattern: true },
  ],
  hints: [
    "Runner needs: `rw = 16, rh = 24, lives = 3`",
    "Platform: `px = 0, py = 240, pw = 380, ph = 20`",
    "Chain variables with `<<` to build the ENTITY line.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int rx = 50, ry = 200, rw = 16, rh = 24, lives = 3;
    int px = 0, py = 240, pw = 380, ph = 20;
    cout << "ENTITY|runner|player|" << rx << "|" << ry << "|" << rw << "|" << rh << "|" << lives << endl;
    cout << "ENTITY|platform1|platform|" << px << "|" << py << "|" << pw << "|" << ph << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Platform world loaded!" << endl;
    return 0;
}
`,
};
