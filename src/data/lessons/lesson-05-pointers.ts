import type { Lesson } from "@/types/lesson";

export const lesson05: Lesson = {
  id: "05-pointers",
  title: "Pointers & Memory",
  description: "Understand pointers, addresses, and why they crash games.",
  order: 5,
  xpReward: 150,
  tier: "free",
  instructions: `# Pointers & Memory

A **pointer** stores the memory address of another variable. This is the core concept behind C++ power — and bugs.

## Pointer Basics
\`\`\`cpp
int x = 42;
int* ptr = &x;  // ptr holds the address of x
cout << *ptr;    // prints 42 (dereference)
\`\`\`

- **\`&x\`** — "address of" x
- **\`int*\`** — pointer to an int
- **\`*ptr\`** — "value at" the address ptr holds (dereference)

## Why This Matters
Pointers let you:
- Share data without copying
- Build dynamic data structures
- **Crash your program** if you're not careful (dangling pointers!)

## Your Task
1. Create an \`int health = 100\`
2. Create a pointer \`int* healthPtr\` that points to \`health\`
3. Use the pointer to modify health to 75
4. Print the results:

\`\`\`
Address stored: yes
Health via pointer: 75
Original variable: 75
Same value: 1
\`\`\`

The last line checks if \`*healthPtr == health\`.`,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Create health variable and pointer

    // Modify health through the pointer

    // Print results

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int health = 100;
    int* healthPtr = &health;

    *healthPtr = 75;

    cout << "Address stored: yes" << endl;
    cout << "Health via pointer: " << *healthPtr << endl;
    cout << "Original variable: " << health << endl;
    cout << "Same value: " << (*healthPtr == health) << endl;

    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Output should demonstrate pointer usage",
      expectedOutput:
        "Address stored: yes\nHealth via pointer: 75\nOriginal variable: 75\nSame value: 1\n",
    },
  ],
  hints: [
    "Declare the pointer with `int* healthPtr = &health;`",
    "Modify through the pointer with `*healthPtr = 75;` — this changes `health` too!",
    "`*healthPtr == health` evaluates to `true` (prints as `1`) because they reference the same memory.",
  ],
  concepts: ["pointers", "address-of (&)", "dereference (*)", "memory"],
};
