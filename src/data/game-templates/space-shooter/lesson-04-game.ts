import type { GameLessonVariant } from "@/types/game";

export const lesson04SpaceShooter: GameLessonVariant = {
  lessonId: "04-structs",
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define Ship struct (id, type, x, y, width, height, health)

// Write renderEntity function

int main() {
    // Create ship and 2 asteroids, render them
    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, width, height;
    int health;
};

void renderEntity(Entity e) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.health << endl;
}

int main() {
    Entity ship = {"ship", "player", 180, 220, 24, 24, 100};
    Entity ast1 = {"ast1", "enemy", 60, 80, 14, 14, 20};
    Entity ast2 = {"ast2", "enemy", 320, 40, 14, 14, 20};

    renderEntity(ship);
    renderEntity(ast1);
    renderEntity(ast2);

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Asteroid belt entered!" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render ship", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|220\\|24\\|24\\|100", isPattern: true },
    { id: "g2", description: "Should render asteroids", expectedOutput: "ENTITY\\|ast1\\|enemy\\|60\\|80\\|14\\|14\\|20", isPattern: true },
    { id: "g3", description: "Should show asteroid message", expectedOutput: "GAME_MESSAGE\\|Asteroid belt entered!", isPattern: true },
  ],
  hints: [
    "Entity struct needs: string id, string type, int x, y, width, height, health.",
    "renderEntity takes an Entity and prints the protocol line using e.id, e.x, etc.",
    'Initialize: `Entity ship = {"ship", "player", 180, 220, 24, 24, 100};`',
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, width, height;
    int health;
};

void renderEntity(Entity e) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.health << endl;
}

int main() {
    Entity ship = {"ship", "player", 180, 220, 24, 24, 100};
    Entity ast1 = {"ast1", "enemy", 60, 80, 14, 14, 20};
    Entity ast2 = {"ast2", "enemy", 320, 40, 14, 14, 20};
    renderEntity(ship);
    renderEntity(ast1);
    renderEntity(ast2);
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Asteroid belt entered!" << endl;
    return 0;
}
`,
};
