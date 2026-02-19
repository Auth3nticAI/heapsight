import type { GameLessonVariant } from "@/types/game";

export const lesson05Platformer: GameLessonVariant = {
  lessonId: "05-damage-function",
  starterCode: `#include <iostream>
using namespace std;

int main() {
    int lives = 3;
    int coins = 0;

    // Create pointers to lives and coins

    // Lose 1 life via pointer, collect 1 coin via pointer

    // Render entities and show message

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int lives = 3;
    int coins = 0;

    int* livesPtr = &lives;
    int* coinsPtr = &coins;

    int oldLives = *livesPtr;
    *livesPtr = *livesPtr - 1;
    *coinsPtr = *coinsPtr + 1;

    cout << "ENTITY|runner|player|50|200|16|24|" << *livesPtr << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "ENTITY|coin1|item|150|180|12|12" << endl;
    cout << "GAME_MESSAGE|Ouch! Lives reduced from " << oldLives << " to " << *livesPtr << endl;
    cout << "SCORE|" << *coinsPtr * 10 << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render runner with 2 lives", expectedOutput: "ENTITY\\|runner\\|player\\|.*\\|2", isPattern: true },
    { id: "g2", description: "Should show lives message", expectedOutput: "GAME_MESSAGE\\|Ouch! Lives reduced from 3 to 2", isPattern: true },
    { id: "g3", description: "Should show score", expectedOutput: "SCORE\\|10", isPattern: true },
  ],
  hints: [
    "Create pointers: `int* livesPtr = &lives;`",
    "Save old value: `int oldLives = *livesPtr;` then modify: `*livesPtr = *livesPtr - 1;`",
    "Use `*coinsPtr * 10` for the score calculation.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int lives = 3;
    int coins = 0;
    int* livesPtr = &lives;
    int* coinsPtr = &coins;
    int oldLives = *livesPtr;
    *livesPtr = *livesPtr - 1;
    *coinsPtr = *coinsPtr + 1;
    cout << "ENTITY|runner|player|50|200|16|24|" << *livesPtr << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "ENTITY|coin1|item|150|180|12|12" << endl;
    cout << "GAME_MESSAGE|Ouch! Lives reduced from " << oldLives << " to " << *livesPtr << endl;
    cout << "SCORE|" << *coinsPtr * 10 << endl;
    return 0;
}
`,
};
