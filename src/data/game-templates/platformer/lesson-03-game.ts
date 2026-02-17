import type { GameLessonVariant } from "@/types/game";

export const lesson03Platformer: GameLessonVariant = {
  lessonId: "03-functions",
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write spawnEntity function

// Write calcJumpHeight function (base * multiplier)

int main() {
    // Spawn runner, ground platform, and a coin
    // Show jump height and score
    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

void spawnEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

int calcJumpHeight(int base, int mult) {
    return base * mult;
}

int main() {
    spawnEntity("runner", "player", 50, 200, 16, 24);
    spawnEntity("ground", "platform", 0, 240, 380, 20);
    spawnEntity("coin1", "item", 200, 180, 12, 12);

    int jump = calcJumpHeight(20, 3);
    cout << "GAME_MESSAGE|Jump height: " << jump << " pixels!" << endl;
    cout << "SCORE|10" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should spawn runner", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|200\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should spawn coin", expectedOutput: "ENTITY\\|coin1\\|item\\|200\\|180\\|12\\|12", isPattern: true },
    { id: "g3", description: "Should show jump height", expectedOutput: "GAME_MESSAGE\\|Jump height: 60 pixels!", isPattern: true },
  ],
  hints: [
    "spawnEntity is `void` — it prints the ENTITY protocol line.",
    "calcJumpHeight(20, 3) returns 60.",
    "Use `<< jump <<` to insert the value into the message.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

void spawnEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

int calcJumpHeight(int base, int mult) {
    return base * mult;
}

int main() {
    spawnEntity("runner", "player", 50, 200, 16, 24);
    spawnEntity("ground", "platform", 0, 240, 380, 20);
    spawnEntity("coin1", "item", 200, 180, 12, 12);
    int jump = calcJumpHeight(20, 3);
    cout << "GAME_MESSAGE|Jump height: " << jump << " pixels!" << endl;
    cout << "SCORE|10" << endl;
    return 0;
}
`,
};
