import type { GameLessonVariant } from "@/types/game";

export const lesson03SimpleRpg: GameLessonVariant = {
  lessonId: "03-functions",

  starterCode: `#include <iostream>
using namespace std;

// Write a function called spawnEntity that takes:
//   id (string), type (string), x (int), y (int), width (int), height (int)
// It should output: ENTITY|id|type|x|y|width|height

// Write a function called calcSwordDamage that takes:
//   baseDamage (int), multiplier (int)
// It should return baseDamage * multiplier

int main() {
    // Use spawnEntity to spawn a warrior at (180,200) size 22x26
    // Use spawnEntity to spawn a goblin at (300,180) size 18x18

    // Calculate sword damage with base 25 and multiplier 3
    // Output: GAME_MESSAGE|Goblin takes X sword damage!
    // Output: SCORE|X  (where X is the calculated damage)

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

void spawnEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

int calcSwordDamage(int baseDamage, int multiplier) {
    return baseDamage * multiplier;
}

int main() {
    // Spawn warrior and goblin
    spawnEntity("warrior", "player", 180, 200, 22, 26);
    spawnEntity("goblin1", "enemy", 300, 180, 18, 18);

    // Calculate and display sword damage
    int damage = calcSwordDamage(25, 3);
    cout << "GAME_MESSAGE|Goblin takes " << damage << " sword damage!" << endl;
    cout << "SCORE|" << damage << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-spawn",
      description: "Spawns warrior entity using spawnEntity function",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26",
      isPattern: true,
    },
    {
      id: "goblin-spawn",
      description: "Spawns goblin entity using spawnEntity function",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|300\\|180\\|18\\|18",
      isPattern: true,
    },
    {
      id: "damage-message",
      description: "Displays sword damage message (25 * 3 = 75)",
      expectedOutput: "GAME_MESSAGE\\|Goblin takes 75 sword damage!",
      isPattern: true,
    },
    {
      id: "score-damage",
      description: "Outputs score equal to calculated damage",
      expectedOutput: "SCORE\\|75",
      isPattern: true,
    },
  ],

  hints: [
    "spawnEntity should be a void function that uses cout to print the ENTITY line.",
    "calcSwordDamage should return an int: baseDamage * multiplier.",
    "Call calcSwordDamage(25, 3) and store the result in a variable.",
    "Use the damage variable in both the GAME_MESSAGE and SCORE output lines.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

void spawnEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

int calcSwordDamage(int baseDamage, int multiplier) {
    return baseDamage * multiplier;
}

int main() {
    // Spawn warrior and goblin
    spawnEntity("warrior", "player", 180, 200, 22, 26);
    spawnEntity("goblin1", "enemy", 300, 180, 18, 18);

    // Calculate and display sword damage
    int damage = calcSwordDamage(25, 3);
    cout << "GAME_MESSAGE|Goblin takes " << damage << " sword damage!" << endl;
    cout << "SCORE|" << damage << endl;

    return 0;
}`,
};
