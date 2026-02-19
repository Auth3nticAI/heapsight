import type { GameLessonVariant } from "@/types/game";

export const lesson31SpaceShooter: GameLessonVariant = {
  lessonId: "31-template-component-access",
  instructions: `# MILESTONE 31: Template Component Access — When Copy-Paste Kills Your Architecture

You have an \\\`int hp[]\\\` array, an \\\`int x[]\\\` array, an \\\`int y[]\\\` array, a \\\`string type[]\\\` array. You write \\\`getHP(int id)\\\`, \\\`getX(int id)\\\`, \\\`getY(int id)\\\`, \\\`getType(int id)\\\`. Four functions that do the exact same thing: return \\\`arr[id]\\\`. You write four setters. Four printers. Twelve functions where three would suffice. Every new component type doubles the boilerplate. This does not scale.

## What Breaks Without This

Boilerplate explosion. Every new SoA component array requires a dedicated getter, setter, and printer. Add a \\\`shield\\\` array — three more functions. Add \\\`speed\\\` — three more. Add \\\`damage\\\` — three more. The function count grows linearly with the component count, and every function is identical except for the type. One bug in the pattern means fixing it in twelve places.

## The Fix

Templates. One function, parameterized by type. \\\`getComponent<T>(T arr[], int id)\\\` works for \\\`int[]\\\`, \\\`float[]\\\`, \\\`string[]\\\`, any array type. The compiler generates the specialized versions at compile time. Zero runtime overhead. Zero virtual dispatch. The generated code is identical to what you would write by hand — the template just eliminates the copy-paste.

\\\`setComponent<T>(T arr[], int id, T value)\\\` writes to any component array. \\\`printComponents<T>(T arr[], int count, string label)\\\` dumps any component array with a label prefix. Three template functions replace unlimited hand-written accessors.

This is the SoA access pattern. Data lives in parallel arrays — one per component type. Templates provide uniform access across all of them. The data flow stays clean because every system uses the same interface to read and write components. No special cases. No type-specific code paths in the hot path.

## Your Task

1. Define SoA arrays: \\\`int hp[MAX]\\\`, \\\`int x[MAX]\\\`, \\\`int y[MAX]\\\`, \\\`string type[MAX]\\\` — parallel arrays, one per component
2. Write \\\`template <typename T> T getComponent(T arr[], int id)\\\` — returns \\\`arr[id]\\\`
3. Write \\\`template <typename T> void setComponent(T arr[], int id, T value)\\\` — sets \\\`arr[id] = value\\\`
4. Write \\\`template <typename T> void printComponents(T arr[], int count, string label)\\\` — prints \\\`COMPONENTS|<label>|<arr[0]>|<arr[1]>|...\\\`
5. Initialize 3 entities: ship (hp=100, x=180, y=300, type="player"), alien1 (hp=30, x=100, y=40, type="enemy"), alien2 (hp=30, x=200, y=40, type="enemy")
6. Print \\\`SHIP_HP|<value>\\\` using \\\`getComponent\\\`
7. Apply 10 damage to alien1: \\\`setComponent(hp, 1, getComponent(hp, 1) - 10)\\\`
8. Print all 4 component arrays using \\\`printComponents\\\`
9. Print \\\`SCORE|0\\\`

## Beginner Trap

**Common Mistake:** Passing a string literal \\\`"player"\\\` to a template expecting \\\`string\\\`. The compiler deduces \\\`const char*\\\` not \\\`string\\\`, and the template instantiation may not match your array type. Wrap literals: \\\`setComponent(type, 0, string("player"))\\\`. Be explicit about types when the deduction is ambiguous.

## Elite Insight

This is compile-time polymorphism. No vtable. No pointer indirection. The compiler stamps out a \\\`getComponent<int>\\\` and a \\\`getComponent<string>\\\` — two separate functions with zero overhead. Versus runtime polymorphism (\\\`virtual\\\`), you trade flexibility for speed. In a hot loop processing thousands of entities per frame, that trade is always worth it.

## Cross-Path Echo

TypeScript generics, Java generics, Rust generics — same concept, different implementation. C++ templates are the most powerful because they operate at compile time with full specialization. The mental model of "write once, works for any type" is universal across typed languages.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

// TODO: Template function getComponent<T>(T arr[], int id) — returns arr[id]

// TODO: Template function setComponent<T>(T arr[], int id, T value) — sets arr[id]

// TODO: Template function printComponents<T>(T arr[], int count, string label)
//       prints "COMPONENTS|label|arr[0]|arr[1]|...|arr[count-1]"

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
    { id: "g1", description: "Should read ship HP via template getter", expectedOutput: "SHIP_HP\\|100", isPattern: true },
    { id: "g2", description: "Should print hp array with damage applied to alien1", expectedOutput: "COMPONENTS\\|hp\\|100\\|20\\|30", isPattern: true },
    { id: "g3", description: "Should print x position components", expectedOutput: "COMPONENTS\\|x\\|180\\|100\\|200", isPattern: true },
    { id: "g4", description: "Should print y position components", expectedOutput: "COMPONENTS\\|y\\|300\\|40\\|40", isPattern: true },
    { id: "g5", description: "Should print type components via string template", expectedOutput: "COMPONENTS\\|type\\|player\\|enemy\\|enemy", isPattern: true },
    { id: "g6", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Template syntax: `template <typename T>` before the function. The compiler infers T from the array type — `int[]` gives `T = int`, `string[]` gives `T = string`.",
    "Wrap string literals when calling setComponent: `setComponent(type, 0, string(\"player\"))`. This ensures the compiler deduces `T = string` to match the `string[]` array.",
    "For printComponents, start with `cout << \"COMPONENTS|\" << label`, then loop printing `\"|\" << arr[i]` for each element. End with `endl`.",
  ],
  accumulatedCode: `#include <iostream>
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
};
