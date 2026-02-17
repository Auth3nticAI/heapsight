import type { GameLessonVariant } from "@/types/game";

export const lesson15SimpleRpg: GameLessonVariant = {
  lessonId: "15-collision",

  instructions: `# Encounter Detection — Distance-Based Triggers

## Objective
Implement **distance-based encounter detection** to trigger combat when the player walks close enough to an enemy.

## Why This Matters
In RPGs, encounters fire when a player enters an enemy's detection radius. This is the simplest form of **spatial event triggering** — the same idea powers aggro ranges, NPC dialogue zones, and treasure proximity alerts.

## Data-Driven OOP Concept
The encounter range is **data** (a number), not hardcoded logic. By changing one value you shift from a stealth game (small range) to a brawler (huge range). The detection function is the engine; the range is the data.

## Requirements
1. Define a struct \`Entity\` with fields: \`string id, string type, int x, int y, int w, int h, int hp\`.
2. Write a function \`double getDistance(Entity a, Entity b)\` that returns the Euclidean distance between two entities using their x,y positions.
3. Write a function \`bool inEncounterRange(Entity a, Entity b, double range)\` that returns true if distance <= range.
4. Create a warrior at (200, 200) with 100 HP and a goblin at (230, 210) with 40 HP.
5. Check encounter with range 50.0:
   - If in range: output both entities, a battle message, and SCORE|1
   - If not in range: output both entities, an exploration message, and SCORE|0
6. The warrior and goblin ARE within 50 units, so combat triggers.

## Expected Output
\`\`\`
ENTITY|warrior|player|200|200|22|26|100
ENTITY|goblin|enemy|230|210|18|18|40
GAME_MESSAGE|Combat triggered! Goblin encountered!
SCORE|1
\`\`\``,

  starterCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

// Define an Entity struct with: id, type, x, y, w, h, hp

// Write getDistance(Entity a, Entity b) -> double
// Use sqrt((ax-bx)^2 + (ay-by)^2)

// Write inEncounterRange(Entity a, Entity b, double range) -> bool

int main() {
    // Create warrior at (200,200), 22x26, 100 HP
    // Create goblin at (230,210), 18x18, 40 HP

    // Check if within encounter range of 50.0
    // If in range:
    //   Output ENTITY for warrior and goblin
    //   Output GAME_MESSAGE|Combat triggered! Goblin encountered!
    //   Output SCORE|1
    // If not in range:
    //   Output ENTITY for warrior and goblin
    //   Output GAME_MESSAGE|Exploring... no enemies nearby.
    //   Output SCORE|0

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

struct Entity {
    string id;
    string type;
    int x;
    int y;
    int w;
    int h;
    int hp;
};

double getDistance(Entity a, Entity b) {
    double dx = a.x - b.x;
    double dy = a.y - b.y;
    return sqrt(dx * dx + dy * dy);
}

bool inEncounterRange(Entity a, Entity b, double range) {
    return getDistance(a, b) <= range;
}

int main() {
    Entity warrior = {"warrior", "player", 200, 200, 22, 26, 100};
    Entity goblin = {"goblin", "enemy", 230, 210, 18, 18, 40};

    cout << "ENTITY|" << warrior.id << "|" << warrior.type << "|"
         << warrior.x << "|" << warrior.y << "|" << warrior.w << "|"
         << warrior.h << "|" << warrior.hp << endl;
    cout << "ENTITY|" << goblin.id << "|" << goblin.type << "|"
         << goblin.x << "|" << goblin.y << "|" << goblin.w << "|"
         << goblin.h << "|" << goblin.hp << endl;

    if (inEncounterRange(warrior, goblin, 50.0)) {
        cout << "GAME_MESSAGE|Combat triggered! Goblin encountered!" << endl;
        cout << "SCORE|1" << endl;
    } else {
        cout << "GAME_MESSAGE|Exploring... no enemies nearby." << endl;
        cout << "SCORE|0" << endl;
    }

    return 0;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Renders warrior entity at position (200,200) with 100 HP",
      expectedOutput: "ENTITY\\|warrior\\|player\\|200\\|200\\|22\\|26\\|100",
      isPattern: true,
    },
    {
      id: "goblin-entity",
      description: "Renders goblin entity at position (230,210) with 40 HP",
      expectedOutput: "ENTITY\\|goblin\\|enemy\\|230\\|210\\|18\\|18\\|40",
      isPattern: true,
    },
    {
      id: "combat-triggered",
      description: "Triggers combat because distance ~32 is within range 50",
      expectedOutput: "GAME_MESSAGE\\|Combat triggered! Goblin encountered!",
      isPattern: true,
    },
    {
      id: "score-encounter",
      description: "Outputs score of 1 for successful encounter",
      expectedOutput: "SCORE\\|1",
      isPattern: true,
    },
  ],

  hints: [
    "The Entity struct needs seven fields: string id, string type, int x, int y, int w, int h, int hp.",
    "For getDistance, compute dx = a.x - b.x and dy = a.y - b.y, then return sqrt(dx*dx + dy*dy). Don't forget #include <cmath>.",
    "inEncounterRange simply returns getDistance(a, b) <= range.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

struct Entity {
    string id;
    string type;
    int x;
    int y;
    int w;
    int h;
    int hp;
};

double getDistance(Entity a, Entity b) {
    double dx = a.x - b.x;
    double dy = a.y - b.y;
    return sqrt(dx * dx + dy * dy);
}

bool inEncounterRange(Entity a, Entity b, double range) {
    return getDistance(a, b) <= range;
}

int main() {
    Entity warrior = {"warrior", "player", 200, 200, 22, 26, 100};
    Entity goblin = {"goblin", "enemy", 230, 210, 18, 18, 40};

    cout << "ENTITY|" << warrior.id << "|" << warrior.type << "|"
         << warrior.x << "|" << warrior.y << "|" << warrior.w << "|"
         << warrior.h << "|" << warrior.hp << endl;
    cout << "ENTITY|" << goblin.id << "|" << goblin.type << "|"
         << goblin.x << "|" << goblin.y << "|" << goblin.w << "|"
         << goblin.h << "|" << goblin.hp << endl;

    if (inEncounterRange(warrior, goblin, 50.0)) {
        cout << "GAME_MESSAGE|Combat triggered! Goblin encountered!" << endl;
        cout << "SCORE|1" << endl;
    } else {
        cout << "GAME_MESSAGE|Exploring... no enemies nearby." << endl;
        cout << "SCORE|0" << endl;
    }

    return 0;
}`,
};
