import type { GameLessonVariant } from "@/types/game";

export const lesson03SpaceShooter: GameLessonVariant = {
  lessonId: "03-functions",
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write spawnEntity function

// Write calcLaserDamage function

int main() {
    // Spawn ship and alien
    // Calculate and display laser damage
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

int calcLaserDamage(int base, int mult) {
    return base * mult;
}

int main() {
    spawnEntity("ship", "player", 180, 220, 24, 24);
    spawnEntity("alien1", "enemy", 280, 50, 22, 22);

    int dmg = calcLaserDamage(30, 3);
    cout << "GAME_MESSAGE|Alien takes " << dmg << " laser damage!" << endl;
    cout << "SCORE|" << dmg << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should spawn ship", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|220\\|24\\|24", isPattern: true },
    { id: "g2", description: "Should spawn alien", expectedOutput: "ENTITY\\|alien1\\|enemy\\|280\\|50\\|22\\|22", isPattern: true },
    { id: "g3", description: "Should show laser damage", expectedOutput: "GAME_MESSAGE\\|Alien takes 90 laser damage!", isPattern: true },
  ],
  hints: [
    "spawnEntity should be `void` — it just prints the entity protocol line.",
    "calcLaserDamage returns base * mult. Call with (30, 3) to get 90.",
    "Use `<< dmg <<` to insert the calculated damage into the message.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

void spawnEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

int calcLaserDamage(int base, int mult) {
    return base * mult;
}

int main() {
    spawnEntity("ship", "player", 180, 220, 24, 24);
    spawnEntity("alien1", "enemy", 280, 50, 22, 22);
    int dmg = calcLaserDamage(30, 3);
    cout << "GAME_MESSAGE|Alien takes " << dmg << " laser damage!" << endl;
    cout << "SCORE|" << dmg << endl;
    return 0;
}
`,
};
