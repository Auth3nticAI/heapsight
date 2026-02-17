import type { GameLessonVariant } from "@/types/game";

export const lesson04SimpleRpg: GameLessonVariant = {
  lessonId: "04-structs",

  starterCode: `#include <iostream>
using namespace std;

// Define a struct called Entity with fields:
//   string id, string type, int x, int y, int w, int h, int health

// Write a function called renderEntity that takes an Entity and outputs:
//   ENTITY|id|type|x|y|w|h|health
// If health is -1, omit it: ENTITY|id|type|x|y|w|h

int main() {
    // Create a warrior: id="warrior", type="player", (180,200), 22x26, health=100
    // Create goblin1: id="goblin1", type="enemy", (80,160), 18x18, health=40
    // Create goblin2: id="goblin2", type="enemy", (320,140), 18x18, health=40
    // Create potion1: id="potion1", type="item", (200,100), 10x10, health=-1

    // Render all four entities
    // Output: SCORE|0
    // Output: GAME_MESSAGE|Dungeon entrance found!

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

struct Entity {
    string id;
    string type;
    int x;
    int y;
    int w;
    int h;
    int health;
};

void renderEntity(Entity e) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.w << "|" << e.h;
    if (e.health != -1) {
        cout << "|" << e.health;
    }
    cout << endl;
}

int main() {
    Entity warrior = {"warrior", "player", 180, 200, 22, 26, 100};
    Entity goblin1 = {"goblin1", "enemy", 80, 160, 18, 18, 40};
    Entity goblin2 = {"goblin2", "enemy", 320, 140, 18, 18, 40};
    Entity potion1 = {"potion1", "item", 200, 100, 10, 10, -1};

    renderEntity(warrior);
    renderEntity(goblin1);
    renderEntity(goblin2);
    renderEntity(potion1);

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Dungeon entrance found!" << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-struct",
      description: "Renders warrior entity with health from struct",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|100",
      isPattern: true,
    },
    {
      id: "goblin1-struct",
      description: "Renders first goblin entity from struct",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|80\\|160\\|18\\|18\\|40",
      isPattern: true,
    },
    {
      id: "goblin2-struct",
      description: "Renders second goblin entity from struct",
      expectedOutput: "ENTITY\\|goblin2\\|enemy\\|320\\|140\\|18\\|18\\|40",
      isPattern: true,
    },
    {
      id: "potion-struct",
      description: "Renders potion entity without health field",
      expectedOutput: "ENTITY\\|potion1\\|item\\|200\\|100\\|10\\|10$",
      isPattern: true,
    },
    {
      id: "score-zero",
      description: "Outputs starting score of 0",
      expectedOutput: "SCORE\\|0",
      isPattern: true,
    },
    {
      id: "dungeon-message",
      description: "Displays dungeon entrance message",
      expectedOutput: "GAME_MESSAGE\\|Dungeon entrance found!",
      isPattern: true,
    },
  ],

  hints: [
    "Define the struct with: struct Entity { string id; string type; int x; int y; int w; int h; int health; };",
    "Use aggregate initialization: Entity warrior = {\"warrior\", \"player\", 180, 200, 22, 26, 100};",
    "In renderEntity, check if health != -1 before printing the health field.",
    "The potion uses health = -1 to indicate it has no health display.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

struct Entity {
    string id;
    string type;
    int x;
    int y;
    int w;
    int h;
    int health;
};

void renderEntity(Entity e) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.w << "|" << e.h;
    if (e.health != -1) {
        cout << "|" << e.health;
    }
    cout << endl;
}

int main() {
    Entity warrior = {"warrior", "player", 180, 200, 22, 26, 100};
    Entity goblin1 = {"goblin1", "enemy", 80, 160, 18, 18, 40};
    Entity goblin2 = {"goblin2", "enemy", 320, 140, 18, 18, 40};
    Entity potion1 = {"potion1", "item", 200, 100, 10, 10, -1};

    renderEntity(warrior);
    renderEntity(goblin1);
    renderEntity(goblin2);
    renderEntity(potion1);

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Dungeon entrance found!" << endl;

    return 0;
}`,
};
