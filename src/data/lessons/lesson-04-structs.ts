import type { Lesson } from "@/types/lesson";

export const lesson04: Lesson = {
  id: "04-structs",
  title: "Structs",
  description: "Group related data together using structs.",
  order: 4,
  xpReward: 100,
  tier: "free",
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
  concepts: ["struct", "member access", "data grouping", "initialization"],
};
