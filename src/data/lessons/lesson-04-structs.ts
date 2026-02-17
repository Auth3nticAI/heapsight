import type { Lesson } from "@/types/lesson";

export const lesson04: Lesson = {
  id: "04-structs",
  title: "Structs",
  description: "Group related data together using structs.",
  order: 4,
  xpReward: 100,
  tier: "free",
  concepts: ["struct", "member access", "data grouping", "initialization"],
  part1: {
    title: "Concept: Structs",
    type: "concept",
    instructions: `# Structs

A **struct** groups related variables into a single type.

## Defining a Struct
\`\`\`cpp
struct Enemy {
    string name;
    int hp;
    float speed;
};
\`\`\`

## Creating and Using Structs
\`\`\`cpp
Enemy goblin;
goblin.name = "Goblin";
goblin.hp = 50;
goblin.speed = 1.5;
\`\`\`

Or initialize all at once:
\`\`\`cpp
Enemy goblin = {"Goblin", 50, 1.5};
\`\`\`

## Your Task
1. Define a \`struct Player\` with: \`string name\`, \`int hp\`, \`int attack\`
2. Define a \`struct Enemy\` with: \`string name\`, \`int hp\`, \`int defense\`
3. Create a player and an enemy, then calculate and print the damage dealt:

\`\`\`
Hero attacks Dragon!
Damage: 25
Dragon HP: 175
\`\`\`

Damage formula: \`player.attack - enemy.defense\`.
Dragon starts with 200 HP, player attack is 40, dragon defense is 15.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define your structs here

int main() {
    // Create player and enemy, calculate combat

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Player {
    string name;
    int hp;
    int attack;
};

struct Enemy {
    string name;
    int hp;
    int defense;
};

int main() {
    Player hero = {"Hero", 100, 40};
    Enemy dragon = {"Dragon", 200, 15};

    int damage = hero.attack - dragon.defense;
    dragon.hp = dragon.hp - damage;

    cout << hero.name << " attacks " << dragon.name << "!" << endl;
    cout << "Damage: " << damage << endl;
    cout << dragon.name << " HP: " << dragon.hp << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Output should show combat results",
        expectedOutput: "Hero attacks Dragon!\nDamage: 25\nDragon HP: 175\n",
      },
    ],
    hints: [
      "Define `struct Player` with `string name`, `int hp`, `int attack` — don't forget the semicolon after `}`.",
      'Create with: `Player hero = {"Hero", 100, 40};`',
      "Access members with dot notation: `hero.attack - dragon.defense`",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Entity Structs",
    type: "game_builder",
    instructions: `# Game Builder: Structs for Game Entities

Structs are perfect for game entities! Let's define an \`Entity\` struct and use it to manage our game objects.

## Entity Struct
\`\`\`cpp
struct Entity {
    string id;
    string type;
    int x, y, width, height;
    int health;
};
\`\`\`

## Your Task
1. Define an \`Entity\` struct with the fields above
2. Write a \`void renderEntity(Entity e)\` function that outputs the game protocol
3. Create a player and two enemies, render them all

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|slime1|enemy|80|150|16|16|30
ENTITY|slime2|enemy|300|150|16|16|30
SCORE|0
GAME_MESSAGE|Battle arena ready!
\`\`\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define Entity struct

// Write renderEntity function

int main() {
    // Create entities and render them

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
    Entity hero = {"hero", "player", 180, 200, 24, 24, 100};
    Entity slime1 = {"slime1", "enemy", 80, 150, 16, 16, 30};
    Entity slime2 = {"slime2", "enemy", 300, 150, 16, 16, 30};

    renderEntity(hero);
    renderEntity(slime1);
    renderEntity(slime2);

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Battle arena ready!" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should render a player entity struct",
        expectedOutput: "ENTITY\\|hero\\|player\\|180\\|200\\|24\\|24\\|100",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should render enemy entities",
        expectedOutput: "ENTITY\\|slime1\\|enemy\\|80\\|150\\|16\\|16\\|30",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show battle message",
        expectedOutput: "GAME_MESSAGE\\|Battle arena ready!",
        isPattern: true,
      },
    ],
    hints: [
      "The Entity struct needs: `string id`, `string type`, `int x, y, width, height`, `int health`.",
      "Access struct fields with dot notation: `e.id`, `e.x`, etc.",
      'Initialize with: `Entity hero = {"hero", "player", 180, 200, 24, 24, 100};`',
    ],
    estimatedMinutes: 8,
  },
};
