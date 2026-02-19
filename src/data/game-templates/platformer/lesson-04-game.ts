import type { GameLessonVariant } from "@/types/game";

export const lesson04Platformer: GameLessonVariant = {
  lessonId: "04-hit-or-miss",
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define Entity struct

// Write renderEntity function

int main() {
    // Create runner, ground, and 2 coins, render them all
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
    Entity runner = {"runner", "player", 50, 200, 16, 24, 3};
    Entity ground = {"ground", "platform", 0, 240, 380, 20, 0};
    Entity coin1 = {"coin1", "item", 150, 180, 12, 12, 0};
    Entity coin2 = {"coin2", "item", 280, 160, 12, 12, 0};

    renderEntity(runner);
    renderEntity(ground);
    renderEntity(coin1);
    renderEntity(coin2);

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Collect all coins!" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render runner", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|200\\|16\\|24\\|3", isPattern: true },
    { id: "g2", description: "Should render coins", expectedOutput: "ENTITY\\|coin1\\|item\\|150\\|180\\|12\\|12", isPattern: true },
    { id: "g3", description: "Should show collect message", expectedOutput: "GAME_MESSAGE\\|Collect all coins!", isPattern: true },
  ],
  hints: [
    "Entity struct: string id, type; int x, y, width, height, health.",
    'Initialize: `Entity runner = {"runner", "player", 50, 200, 16, 24, 3};`',
    "Call renderEntity() for each entity to print its protocol line.",
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
    Entity runner = {"runner", "player", 50, 200, 16, 24, 3};
    Entity ground = {"ground", "platform", 0, 240, 380, 20, 0};
    Entity coin1 = {"coin1", "item", 150, 180, 12, 12, 0};
    Entity coin2 = {"coin2", "item", 280, 160, 12, 12, 0};
    renderEntity(runner);
    renderEntity(ground);
    renderEntity(coin1);
    renderEntity(coin2);
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Collect all coins!" << endl;
    return 0;
}
`,
};
