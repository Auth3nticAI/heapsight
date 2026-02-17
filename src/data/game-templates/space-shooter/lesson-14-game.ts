import type { GameLessonVariant } from "@/types/game";

export const lesson14SpaceShooter: GameLessonVariant = {
  lessonId: "14-headers",
  instructions: `# System Architecture — Forward-Declared Systems\n\nIn an Entity Component System, **systems** are functions that operate on component data. The order you call them matters: movement must happen before collision detection, and rendering should come last.\n\nIn C++, you can **forward-declare** functions — announce their signature before \`main()\` — and define them afterward. This keeps your main loop clean and readable.\n\n## Your Task\n\n1. Forward-declare three system functions before \`main()\`:\n   - \`void updateMovement()\` — moves the ship and enemy\n   - \`void updateCollision()\` — checks for collisions (prints a message)\n   - \`void renderEntities()\` — outputs all entities\n2. In \`main()\`, call them in order: movement, collision, render\n3. Define each function after \`main()\`\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\`\n- \`SCORE|value\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Forward-declare the three systems
// void updateMovement();
// void updateCollision();
// void renderEntities();

int main() {
    // Call systems in order: movement, collision, render

    return 0;
}

// Define updateMovement: print movement info
// Define updateCollision: print collision check message
// Define renderEntities: output ENTITY lines, SCORE, and GAME_MESSAGE
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

void updateMovement();
void updateCollision();
void renderEntities();

int main() {
    updateMovement();
    updateCollision();
    renderEntities();
    return 0;
}

void updateMovement() {
    cout << "GAME_MESSAGE|Movement system: ship moved to (180,200), enemy moved to (300,90)" << endl;
}

void updateCollision() {
    cout << "GAME_MESSAGE|Collision system: no collisions detected" << endl;
}

void renderEntities() {
    cout << "ENTITY|ship|player|180|200|24|24" << endl;
    cout << "ENTITY|enemy1|enemy|300|90|22|22" << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Render system: 2 entities drawn" << endl;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should output movement system message first",
      expectedOutput: "GAME_MESSAGE\\|Movement system: ship moved to \\(180,200\\), enemy moved to \\(300,90\\)",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should output collision system message second",
      expectedOutput: "GAME_MESSAGE\\|Collision system: no collisions detected",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should render ship entity",
      expectedOutput: "ENTITY\\|ship\\|player\\|180\\|200\\|24\\|24",
      isPattern: true,
    },
    {
      id: "t4",
      description: "Should render enemy entity",
      expectedOutput: "ENTITY\\|enemy1\\|enemy\\|300\\|90\\|22\\|22",
      isPattern: true,
    },
    {
      id: "t5",
      description: "Should render system draw count message",
      expectedOutput: "GAME_MESSAGE\\|Render system: 2 entities drawn",
      isPattern: true,
    },
  ],
  hints: [
    "Forward-declare all three functions before main: `void updateMovement();` etc.",
    "In main, call them in order: `updateMovement(); updateCollision(); renderEntities();`",
    "Define each function after main — the forward declaration tells the compiler they exist.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

void updateMovement();
void updateCollision();
void renderEntities();

int main() {
    updateMovement();
    updateCollision();
    renderEntities();
    return 0;
}

void updateMovement() {
    cout << "GAME_MESSAGE|Movement system: ship moved to (180,200), enemy moved to (300,90)" << endl;
}

void updateCollision() {
    cout << "GAME_MESSAGE|Collision system: no collisions detected" << endl;
}

void renderEntities() {
    cout << "ENTITY|ship|player|180|200|24|24" << endl;
    cout << "ENTITY|enemy1|enemy|300|90|22|22" << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Render system: 2 entities drawn" << endl;
}
`,
};
