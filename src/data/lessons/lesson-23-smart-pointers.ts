import type { Lesson } from "@/types/lesson";

export const lesson23: Lesson = {
  id: "23-smart-pointers",
  title: "Smart Pointers",
  description: "Learn about automatic memory management concepts.",
  order: 23,
  xpReward: 125,
  tier: "pro",
  concepts: ["unique_ptr concept", "RAII", "automatic cleanup"],
  part1: {
    title: "Concept: Smart Ptrs",
    type: "concept",
    instructions: `# Smart Pointers (Concept)

Modern C++ uses **smart pointers** that automatically free memory. JSCPP doesn't support them directly, but understanding the concept is essential.

## The Problem
\`\`\`cpp
int* ptr = new int(42);
// If we forget delete ptr... memory leak!
\`\`\`

## The Solution: RAII Pattern
RAII = "Resource Acquisition Is Initialization". We simulate this with a cleanup function:

\`\`\`cpp
// Simulated smart pointer behavior
int* create(int val) {
    return new int(val);
}
void destroy(int* ptr) {
    delete ptr;
}
\`\`\`

## Your Task
Write \`create\` and \`destroy\` helper functions. Use them to manage memory safely:

\`\`\`
Created: 42
Destroyed safely
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// Write create and destroy functions

int main() {
    // Use create, print value, use destroy

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int* create(int val) {
    return new int(val);
}

void destroy(int* ptr) {
    delete ptr;
}

int main() {
    int* val = create(42);
    cout << "Created: " << *val << endl;
    destroy(val);
    cout << "Destroyed safely" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should create and safely destroy", expectedOutput: "Created: 42\nDestroyed safely\n" },
    ],
    hints: [
      "`create` returns `new int(val)` — allocates and initializes.",
      "`destroy` calls `delete ptr` — frees the memory.",
      "In real C++, `unique_ptr` does this automatically!",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Safe Entities",
    type: "game_builder",
    instructions: `# Game Builder: RAII Entity Management

Use helper functions to create and destroy entity HP safely — simulating smart pointer behavior.

## Your Task
1. Write \`createHP\` and \`destroyHP\` helpers
2. Create player and enemy HP using helpers
3. Render entities
4. Destroy all HP values safely

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|boss|enemy|280|80|32|32|200
GAME_MESSAGE|RAII pattern: all resources managed!
SCORE|0
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// Write createHP and destroyHP functions

int main() {
    // Create HP values

    // Render entities

    // Destroy HP safely

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int* createHP(int val) {
    return new int(val);
}

void destroyHP(int* ptr) {
    delete ptr;
}

int main() {
    int* playerHP = createHP(100);
    int* bossHP = createHP(200);

    cout << "ENTITY|hero|player|180|200|24|24|" << *playerHP << endl;
    cout << "ENTITY|boss|enemy|280|80|32|32|" << *bossHP << endl;
    cout << "GAME_MESSAGE|RAII pattern: all resources managed!" << endl;
    cout << "SCORE|0" << endl;

    destroyHP(playerHP);
    destroyHP(bossHP);
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should render boss with 200 HP", expectedOutput: "ENTITY\\|boss\\|enemy\\|280\\|80\\|32\\|32\\|200", isPattern: true },
      { id: "g2", description: "Should show RAII message", expectedOutput: "GAME_MESSAGE\\|RAII pattern: all resources managed!", isPattern: true },
    ],
    hints: [
      "`createHP` returns `new int(val)`.",
      "`destroyHP` calls `delete ptr`.",
      "Always call destroyHP for every createHP call.",
    ],
    estimatedMinutes: 5,
  },
};
