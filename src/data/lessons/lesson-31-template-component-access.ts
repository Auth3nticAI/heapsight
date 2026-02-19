import type { Lesson } from "@/types/lesson";

export const lesson31: Lesson = {
  id: "31-template-component-access",
  title: "Template Component Access",
  description: "Write generic functions that work with any component type.",
  order: 31,
  xpReward: 150,
  tier: "pro",
  concepts: ["templates", "generic programming", "type parameters", "compile-time polymorphism"],
  part1: {
    title: "Concept: Templates",
    type: "concept",
    instructions: `# Function Templates

You write a function that prints an int. Then you need one that prints a float. Then a string. The logic is identical — only the type changes. Copying the function three times is a maintenance nightmare.

C++ templates solve this. You write the function **once** with a placeholder type, and the compiler generates the specific versions for you.

## Syntax
\\\`\\\`\\\`cpp
template <typename T>
void printValue(T value) {
    cout << value << endl;
}
\\\`\\\`\\\`

When you call \\\`printValue(42)\\\`, the compiler creates a version for \\\`int\\\`. When you call \\\`printValue(3.14)\\\`, it creates one for \\\`double\\\`. Zero runtime cost — all resolved at compile time.

## Your Task
1. Write a template function \\\`printValue<T>(T value)\\\` that prints \\\`"VALUE|<value>"\\\`
2. Write a template function \\\`findMax<T>(T arr[], int count)\\\` that returns the max element in an array
3. Call \\\`printValue\\\` with int 42, float 3.14, and string "hello"
4. Create an int array {5, 12, 3, 9} and find its max — print \\\`"MAX|int|<result>"\\\`
5. Create a float array {1.5, 4.2, 2.8} and find its max — print \\\`"MAX|float|<result>"\\\`
6. Print \\\`"TYPES|3"\\\` to show 3 different types used with one function

Expected output:
\\\`\\\`\\\`
VALUE|42
VALUE|3.14
VALUE|hello
MAX|int|12
MAX|float|4.2
TYPES|3
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: Write template function printValue<T> that prints "VALUE|<value>"

// TODO: Write template function findMax<T> that returns max in array

int main() {
    // TODO: Call printValue with int, float, and string

    // TODO: Find max in int array {5, 12, 3, 9}

    // TODO: Find max in float array {1.5, 4.2, 2.8}

    // TODO: Print "TYPES|3"

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

template <typename T>
void printValue(T value) {
    cout << "VALUE|" << value << endl;
}

template <typename T>
T findMax(T arr[], int count) {
    T maxVal = arr[0];
    for (int i = 1; i < count; i++) {
        if (arr[i] > maxVal) {
            maxVal = arr[i];
        }
    }
    return maxVal;
}

int main() {
    printValue(42);
    printValue(3.14);
    printValue(string("hello"));

    int nums[] = {5, 12, 3, 9};
    cout << "MAX|int|" << findMax(nums, 4) << endl;

    float floats[] = {1.5f, 4.2f, 2.8f};
    cout << "MAX|float|" << findMax(floats, 3) << endl;

    cout << "TYPES|3" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should print int value", expectedOutput: "VALUE|42" },
      { id: "t2", description: "Should print float value", expectedOutput: "VALUE|3.14" },
      { id: "t3", description: "Should print string value", expectedOutput: "VALUE|hello" },
      { id: "t4", description: "Should find max int", expectedOutput: "MAX|int|12" },
      { id: "t5", description: "Should find max float", expectedOutput: "MAX|float|4.2" },
      { id: "t6", description: "Should report 3 types used", expectedOutput: "TYPES|3" },
    ],
    hints: [
      "Template syntax: `template <typename T>` goes right before the function. `T` is a placeholder for any type.",
      "For `findMax`, start with `T maxVal = arr[0]`, then loop comparing `arr[i] > maxVal`.",
      "When passing a string literal to a template, wrap it: `printValue(string(\"hello\"))` to ensure it deduces `string` not `const char*`.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Template Components",
    type: "game_builder",
    instructions: `# Game Builder: Template Component Access

Use templates to create generic getter/setter/printer functions for SoA component arrays.

## Your Task
1. Define SoA component arrays: \\\`int hp[MAX]\\\`, \\\`int x[MAX]\\\`, \\\`int y[MAX]\\\`, \\\`string type[MAX]\\\`
2. Write \\\`template <typename T> T getComponent(T arr[], int id)\\\` — returns \\\`arr[id]\\\`
3. Write \\\`template <typename T> void setComponent(T arr[], int id, T value)\\\` — sets \\\`arr[id] = value\\\`
4. Write \\\`template <typename T> void printComponents(T arr[], int count, string label)\\\` — prints \\\`"<label>|<arr[0]>|<arr[1]>|..."\\\`
5. Initialize 3 entities: ship (hp=100, x=180, y=300, type="player"), alien1 (hp=30, x=100, y=40, type="enemy"), alien2 (hp=30, x=200, y=40, type="enemy")
6. Use \\\`setComponent\\\` to set all values
7. Use \\\`getComponent\\\` to read ship hp and print \\\`"SHIP_HP|<value>"\\\`
8. Apply 10 damage to alien1 using get/set: \\\`setComponent(hp, 1, getComponent(hp, 1) - 10)\\\`
9. Print all components using \\\`printComponents\\\`
10. Print \\\`SCORE|0\\\`

Expected output:
\\\`\\\`\\\`
SHIP_HP|100
COMPONENTS|hp|100|20|30
COMPONENTS|x|180|100|200
COMPONENTS|y|300|40|40
COMPONENTS|type|player|enemy|enemy
SCORE|0
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

// TODO: Template function getComponent<T>(T arr[], int id) — returns arr[id]

// TODO: Template function setComponent<T>(T arr[], int id, T value) — sets arr[id]

// TODO: Template function printComponents<T>(T arr[], int count, string label)
//       prints "label|arr[0]|arr[1]|...|arr[count-1]"

int main() {
    int hp[MAX_ENTITIES];
    int x[MAX_ENTITIES];
    int y[MAX_ENTITIES];
    string type[MAX_ENTITIES];

    // TODO: Initialize 3 entities using setComponent

    // TODO: Print SHIP_HP using getComponent

    // TODO: Damage alien1: subtract 10 from hp[1]

    // TODO: Print all components using printComponents

    // TODO: Print SCORE|0

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

template <typename T>
T getComponent(T arr[], int id) {
    return arr[id];
}

template <typename T>
void setComponent(T arr[], int id, T value) {
    arr[id] = value;
}

template <typename T>
void printComponents(T arr[], int count, string label) {
    cout << "COMPONENTS|" << label;
    for (int i = 0; i < count; i++) {
        cout << "|" << arr[i];
    }
    cout << endl;
}

int main() {
    int hp[MAX_ENTITIES];
    int x[MAX_ENTITIES];
    int y[MAX_ENTITIES];
    string type[MAX_ENTITIES];

    setComponent(hp, 0, 100);
    setComponent(x, 0, 180);
    setComponent(y, 0, 300);
    setComponent(type, 0, string("player"));

    setComponent(hp, 1, 30);
    setComponent(x, 1, 100);
    setComponent(y, 1, 40);
    setComponent(type, 1, string("enemy"));

    setComponent(hp, 2, 30);
    setComponent(x, 2, 200);
    setComponent(y, 2, 40);
    setComponent(type, 2, string("enemy"));

    cout << "SHIP_HP|" << getComponent(hp, 0) << endl;

    setComponent(hp, 1, getComponent(hp, 1) - 10);

    printComponents(hp, 3, string("hp"));
    printComponents(x, 3, string("x"));
    printComponents(y, 3, string("y"));
    printComponents(type, 3, string("type"));

    cout << "SCORE|0" << endl;

    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should read ship HP with template getter", expectedOutput: "SHIP_HP\\|100", isPattern: true },
      { id: "g2", description: "Should print hp components with damage applied", expectedOutput: "COMPONENTS\\|hp\\|100\\|20\\|30", isPattern: true },
      { id: "g3", description: "Should print x components", expectedOutput: "COMPONENTS\\|x\\|180\\|100\\|200", isPattern: true },
      { id: "g4", description: "Should print y components", expectedOutput: "COMPONENTS\\|y\\|300\\|40\\|40", isPattern: true },
      { id: "g5", description: "Should print type components (string array)", expectedOutput: "COMPONENTS\\|type\\|player\\|enemy\\|enemy", isPattern: true },
      { id: "g6", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "Template functions work the same for `int[]` and `string[]`. The compiler generates separate versions for each type automatically.",
      "Use `setComponent(hp, 1, getComponent(hp, 1) - 10)` to apply damage — get the current value, subtract, set the result.",
      "For `printComponents`, loop from 0 to count, printing `\"|\" << arr[i]` each iteration. Start with the label: `cout << \"COMPONENTS|\" << label`.",
    ],
    estimatedMinutes: 10,
  },
};
