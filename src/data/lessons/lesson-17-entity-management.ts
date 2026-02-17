import type { Lesson } from "@/types/lesson";

export const lesson17: Lesson = {
  id: "17-entity-management",
  title: "Entity Management",
  description: "Manage multiple game entities with arrays of structs.",
  order: 17,
  xpReward: 125,
  tier: "pro",
  concepts: ["arrays of structs", "entity systems", "batch operations"],
  part1: {
    title: "Concept: Struct Arrays",
    type: "concept",
    instructions: `# Arrays of Structs

Combining arrays with structs lets you manage collections of game objects.

## Array of Structs
\`\`\`cpp
struct Enemy {
    int x, y, hp;
};

Enemy enemies[3] = {
    {100, 50, 30},
    {200, 80, 40},
    {300, 60, 25}
};
\`\`\`

## Iterating Over Entities
\`\`\`cpp
for (int i = 0; i < 3; i++) {
    cout << enemies[i].hp << endl;
}
\`\`\`

## Your Task
Create 3 enemies with different HP values and find the total HP + count of alive enemies (HP > 0).

\`\`\`
Total HP: 95
Alive: 2
\`\`\`

Enemies: hp = {40, 0, 55} (one is dead).`,
    starterCode: `#include <iostream>
using namespace std;

struct Enemy {
    int x, y, hp;
};

int main() {
    Enemy enemies[3] = {
        {100, 50, 40},
        {200, 80, 0},
        {300, 60, 55}
    };

    // Calculate total HP and count alive

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct Enemy {
    int x, y, hp;
};

int main() {
    Enemy enemies[3] = {
        {100, 50, 40},
        {200, 80, 0},
        {300, 60, 55}
    };

    int totalHP = 0;
    int alive = 0;
    for (int i = 0; i < 3; i++) {
        totalHP = totalHP + enemies[i].hp;
        if (enemies[i].hp > 0) alive++;
    }

    cout << "Total HP: " << totalHP << endl;
    cout << "Alive: " << alive << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show total HP and alive count", expectedOutput: "Total HP: 95\nAlive: 2\n" },
    ],
    hints: [
      "Loop: `for (int i = 0; i < 3; i++)`",
      "Access with `enemies[i].hp`",
      "Only increment `alive` when `enemies[i].hp > 0`",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Entity System",
    type: "game_builder",
    instructions: `# Game Builder: Rendering Entity Arrays

Let's render a batch of entities from a struct array — the foundation of any entity system.

## Your Task
1. Define an Entity struct and create an array of 4 entities
2. Use a loop to render them all
3. Count alive entities and show the total

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|e0|enemy|60|80|18|18|40
ENTITY|e1|enemy|150|60|18|18|0
ENTITY|e2|enemy|280|90|18|18|35
SCORE|0
GAME_MESSAGE|2 enemies alive!
\`\`\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, w, h, hp;
};

int main() {
    // Create array of entities

    // Loop and render each

    // Count alive enemies and show message

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, w, h, hp;
};

int main() {
    Entity entities[4] = {
        {"hero", "player", 180, 200, 24, 24, 100},
        {"e0", "enemy", 60, 80, 18, 18, 40},
        {"e1", "enemy", 150, 60, 18, 18, 0},
        {"e2", "enemy", 280, 90, 18, 18, 35}
    };

    for (int i = 0; i < 4; i++) {
        cout << "ENTITY|" << entities[i].id << "|" << entities[i].type << "|"
             << entities[i].x << "|" << entities[i].y << "|"
             << entities[i].w << "|" << entities[i].h << "|"
             << entities[i].hp << endl;
    }

    int alive = 0;
    for (int i = 1; i < 4; i++) {
        if (entities[i].hp > 0) alive++;
    }

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|" << alive << " enemies alive!" << endl;
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should render all entities", expectedOutput: "ENTITY\\|e2\\|enemy\\|280\\|90\\|18\\|18\\|35", isPattern: true },
      { id: "g2", description: "Should count 2 alive enemies", expectedOutput: "GAME_MESSAGE\\|2 enemies alive!", isPattern: true },
    ],
    hints: [
      "Initialize: `Entity entities[4] = { {\"hero\", \"player\", ...}, ... };`",
      "Loop from 0 to 3 to render all 4 entities.",
      "Count alive enemies starting at index 1 (skip player).",
    ],
    estimatedMinutes: 8,
  },
};
