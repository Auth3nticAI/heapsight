import type { GameLessonVariant } from "@/types/game";

export const lesson05SpaceShooter: GameLessonVariant = {
  lessonId: "05-pointers",
  starterCode: `#include <iostream>
using namespace std;

int main() {
    int shipHP = 100;
    int alienHP = 80;

    // Create pointers to both HP values

    // Deal 35 damage to alien via pointer

    // Render entities and show damage message

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int shipHP = 100;
    int alienHP = 80;

    int* sHP = &shipHP;
    int* aHP = &alienHP;

    int damage = 35;
    int oldHP = *aHP;
    *aHP = *aHP - damage;

    cout << "ENTITY|ship|player|180|220|24|24|" << *sHP << endl;
    cout << "ENTITY|alien1|enemy|300|80|22|22|" << *aHP << endl;
    cout << "GAME_MESSAGE|Alien hit! Shields from " << oldHP << " to " << *aHP << endl;
    cout << "SCORE|" << damage << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render ship with full health", expectedOutput: "ENTITY\\|ship\\|player\\|.*\\|100", isPattern: true },
    { id: "g2", description: "Should render alien with reduced health", expectedOutput: "ENTITY\\|alien1\\|enemy\\|.*\\|45", isPattern: true },
    { id: "g3", description: "Should show damage message", expectedOutput: "GAME_MESSAGE\\|Alien hit! Shields from 80 to 45", isPattern: true },
  ],
  hints: [
    "Create pointers: `int* sHP = &shipHP;` and `int* aHP = &alienHP;`",
    "Save old value first: `int oldHP = *aHP;` then `*aHP = *aHP - damage;`",
    "Use `*sHP` and `*aHP` when building entity output lines.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int shipHP = 100;
    int alienHP = 80;
    int* sHP = &shipHP;
    int* aHP = &alienHP;
    int damage = 35;
    int oldHP = *aHP;
    *aHP = *aHP - damage;
    cout << "ENTITY|ship|player|180|220|24|24|" << *sHP << endl;
    cout << "ENTITY|alien1|enemy|300|80|22|22|" << *aHP << endl;
    cout << "GAME_MESSAGE|Alien hit! Shields from " << oldHP << " to " << *aHP << endl;
    cout << "SCORE|" << damage << endl;
    return 0;
}
`,
};
