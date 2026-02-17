import type { Lesson } from "@/types/lesson";

export const lesson22: Lesson = {
  id: "22-memory-leaks",
  title: "Memory Leaks",
  description: "Understand and prevent memory leaks with new/delete.",
  order: 22,
  xpReward: 150,
  tier: "pro",
  concepts: ["memory leaks", "new without delete", "resource management"],
  part1: {
    title: "Concept: Leaks",
    type: "concept",
    instructions: `# Memory Leaks

A **memory leak** happens when you \`new\` without \`delete\`. The memory is never freed.

## The Problem
\`\`\`cpp
void badFunction() {
    int* data = new int(42);
    // oops — no delete! Memory leaked!
}
\`\`\`

## The Fix
\`\`\`cpp
void goodFunction() {
    int* data = new int(42);
    cout << *data << endl;
    delete data;  // cleaned up!
}
\`\`\`

## Your Task
Fix the leaky code: allocate 3 values, use them, then properly delete them all.

\`\`\`
Values: 10 20 30
All memory freed!
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int* a = new int(10);
    int* b = new int(20);
    int* c = new int(30);

    cout << "Values: " << *a << " " << *b << " " << *c << endl;

    // Fix the leak! Delete all allocated memory

    cout << "All memory freed!" << endl;
    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int* a = new int(10);
    int* b = new int(20);
    int* c = new int(30);

    cout << "Values: " << *a << " " << *b << " " << *c << endl;

    delete a;
    delete b;
    delete c;

    cout << "All memory freed!" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show values and confirm cleanup", expectedOutput: "Values: 10 20 30\nAll memory freed!\n" },
    ],
    hints: [
      "Add `delete a;`, `delete b;`, and `delete c;` before the final print.",
      "Always delete in reverse order or any order — just don't forget any!",
      "Every `new` must have a matching `delete`.",
    ],
    estimatedMinutes: 3,
  },
  part2: {
    title: "Game: Clean Memory",
    type: "game_builder",
    instructions: `# Game Builder: Leak-Free Entity Creation

Create entities dynamically and ensure proper cleanup. Every \`new\` gets a \`delete\`.

## Your Task
1. Dynamically allocate HP for 3 entities
2. Render them
3. Delete all allocations
4. Show cleanup confirmation

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|e1|enemy|100|80|18|18|50
ENTITY|e2|enemy|300|80|18|18|50
GAME_MESSAGE|Memory clean! 3 allocations freed
SCORE|0
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Dynamically allocate HP values
    int* playerHP = new int(100);
    int* e1HP = new int(50);
    int* e2HP = new int(50);

    // Render entities

    // Clean up and confirm

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int* playerHP = new int(100);
    int* e1HP = new int(50);
    int* e2HP = new int(50);

    cout << "ENTITY|hero|player|180|200|24|24|" << *playerHP << endl;
    cout << "ENTITY|e1|enemy|100|80|18|18|" << *e1HP << endl;
    cout << "ENTITY|e2|enemy|300|80|18|18|" << *e2HP << endl;

    delete playerHP;
    delete e1HP;
    delete e2HP;

    cout << "GAME_MESSAGE|Memory clean! 3 allocations freed" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should render entities", expectedOutput: "ENTITY\\|hero\\|player\\|180\\|200\\|24\\|24\\|100", isPattern: true },
      { id: "g2", description: "Should confirm cleanup", expectedOutput: "GAME_MESSAGE\\|Memory clean! 3 allocations freed", isPattern: true },
    ],
    hints: [
      "Use `*playerHP` to read the value when building entity output.",
      "Delete ALL three pointers after rendering.",
      "The message confirms 3 allocations were freed.",
    ],
    estimatedMinutes: 5,
  },
};
