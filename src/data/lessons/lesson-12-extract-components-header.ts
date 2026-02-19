import type { Lesson } from "@/types/lesson";

export const lesson12: Lesson = {
  id: "12-extract-components-header",
  title: "Extract Components Header",
  description: "Headers are interfaces. They declare what exists. Source files define how it works. Separation of declaration from implementation.",
  order: 12,
  xpReward: 125,
  tier: "pro",
  concepts: ["header files", "include guards", "#pragma once", "multi-file builds"],
  part1: {
    title: "Concept: Extract Components Header",
    type: "concept",
    instructions: `# Extract Components Header

Headers are interfaces. They declare what exists. Source files define how it works. Separation of declaration from implementation.

## Mental Model

A header is a contract. \`components.h\` says: these structs exist with these fields. Any .cpp that includes it can use them. Change the struct in one place \u2192 every file that includes it sees the change. Single source of truth.

## What Breaks

Without include guards, including a header twice (directly + indirectly) causes 'redefinition' compile errors. Without headers, you copy-paste struct definitions into every file. Change one \u2192 forget the other \u2192 fields mismatch \u2192 data corruption. File A thinks Position has {x, y}. File B thinks Position has {x, y, z}. They pass Position between them. Boom. Three bytes of garbage.

## The Fix

\`#pragma once\` at top of every header. One line. Modern compilers all support it. The preprocessor sees it and says: I already included this file, skip it.

Alternative: classic include guards.

\\\`\\\`\\\`cpp
#ifndef COMPONENTS_H
#define COMPONENTS_H
// struct definitions here
#endif
\\\`\\\`\\\`

Both work. \`#pragma once\` is shorter. Use it.

## Performance Insight

Headers are compile-time only. Zero runtime cost. The preprocessor copies the header content into every .cpp that includes it. After compilation, the header doesn't exist. It's been absorbed into the translation unit. No function calls. No indirection. No overhead.

## Memory Insight

Include guards prevent duplicate definitions. No runtime memory impact. The preprocessor resolves everything before the compiler even runs. Your binary is identical whether you use headers or copy-paste. Headers just prevent human error.

## Your Task

1. Simulate a multi-file build: print header content, print main.cpp including it, print build success
2. Define Position, Velocity, Health structs (as if from components.h)
3. Create one of each: Position(180,300), Velocity(0,-40), Health(100,100)
4. Print each component to verify the include worked
5. Output the build success message

## Beginner Trap

Forgetting \`#pragma once\`. Including components.h from two different files that both get included into main.cpp \u2192 the compiler sees the struct definitions twice \u2192 \`error: redefinition of 'Position'\`. One line prevents this. Every header. Every time.

## Elite Insight

Modern C++20 modules replace headers entirely. \`import components;\` instead of \`#include "components.h"\`. No preprocessor. No include guards. Faster compilation. But every codebase you'll work on for the next decade uses headers. The standard library uses headers. Your dependencies use headers. Learn them first.

## Systems Thinking Connection

L11 created component structs in main.cpp. That works for one file. But real projects have multiple .cpp files: main.cpp, systems.cpp, spawning.cpp. Each needs access to Position, Velocity, Health. Without a header, you duplicate the definitions. L12 extracts them to a single source of truth. This is the first step toward multi-file architecture.

## Skill Reinforcement

The structs are identical to L11. The concepts are identical. The only change is where they live. Moving code to a header doesn't change what it does. It changes how many files can use it. This is an organizational lesson, not a logic lesson.

## Mastery Check

What does \`#pragma once\` do? It tells the preprocessor to include this file at most once per translation unit. Without it, two \`#include "components.h"\` lines in the same file (or through indirect includes) would paste the struct definitions twice, causing a redefinition error.`,
    starterCode: `#include <iostream>
using namespace std;

// Simulating: include/components.h
// In a real project, these structs would be in a separate .h file
// with #pragma once at the top

// TODO: Print build log showing header content
// "=== MULTI-FILE BUILD TEST ==="
// "components.h: Position, Velocity, Health defined"
// "main.cpp: #include \\"components.h\\" OK"
// "Build: SUCCESS"

// TODO: Define struct Position { int x, y; };
// TODO: Define struct Velocity { int dx, dy; };
// TODO: Define struct Health { int current, max; };
// (In real code, these would be in components.h with #pragma once)

int main() {
    cout << "=== MULTI-FILE BUILD TEST ===" << endl;
    cout << "components.h: Position, Velocity, Health defined" << endl;
    cout << "main.cpp: #include \\"components.h\\" OK" << endl;
    cout << "Build: SUCCESS" << endl;

    cout << "--- Using components from header ---" << endl;

    // TODO: Create Position p = {180, 300}
    // TODO: Create Velocity v = {0, -40}
    // TODO: Create Health h = {100, 100}

    // TODO: Print each component
    // "Position p = {180, 300}"
    // "Velocity v = {0, -40}"
    // "Health h = {100, 100}"

    cout << "GAME_MESSAGE|Header extraction complete - single source of truth" << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

// Simulating: include/components.h
// #pragma once
struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };

int main() {
    cout << "=== MULTI-FILE BUILD TEST ===" << endl;
    cout << "components.h: Position, Velocity, Health defined" << endl;
    cout << "main.cpp: #include \\"components.h\\" OK" << endl;
    cout << "Build: SUCCESS" << endl;

    cout << "--- Using components from header ---" << endl;

    Position p = {180, 300};
    Velocity v = {0, -40};
    Health h = {100, 100};

    cout << "Position p = {" << p.x << ", " << p.y << "}" << endl;
    cout << "Velocity v = {" << v.dx << ", " << v.dy << "}" << endl;
    cout << "Health h = {" << h.current << ", " << h.max << "}" << endl;

    cout << "GAME_MESSAGE|Header extraction complete - single source of truth" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show build success",
        expectedOutput: "Build: SUCCESS",
      },
      {
        id: "t2",
        description: "Should show Position from header",
        expectedOutput: "Position p = {180, 300}",
      },
      {
        id: "t3",
        description: "Should show Velocity from header",
        expectedOutput: "Velocity v = {0, -40}",
      },
      {
        id: "t4",
        description: "Should show header extraction message",
        expectedOutput: "GAME_MESSAGE|Header extraction complete - single source of truth",
      },
    ],
    hints: [
      "Define structs before main, just like L11. In a real project, they'd be in components.h. Here we simulate the include by defining them in the same file.",
      "Print Velocity fields: `cout << \"Velocity v = {\" << v.dx << \", \" << v.dy << \"}\" << endl;` \u2014 note we print dx and dy but label matches the Velocity struct naming.",
      "The build log is just cout statements simulating what a real compiler would output. Print them in order: header found, include OK, build success.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Multi-File Build Simulation",
    type: "game_builder",
    instructions: `# Game Builder: Header-Structured Space Scene

Same game scene as L11 but now structured as if components came from a header. Print the build log showing the include chain, then run the full game scene. This teaches the mental model of multi-file C++ before you have a real build system.

## Mental Model

Real C++ build: compiler reads main.cpp \u2192 hits #include "components.h" \u2192 preprocessor pastes the header content \u2192 compiler sees structs + main code as one unit. We simulate this by printing the build process, then running the game. The output proves the "included" structs work.

## What Breaks

Without the header simulation, students don't see the build process. They define structs and use them without understanding that in a real project, those definitions would come from another file. This lesson makes the invisible visible.

## The Fix

Print the build log first. Show which files exist, what they contain, that the include succeeds. Then use the structs to run the game scene. The build log is the lesson. The game scene is the proof.

## Performance Insight

Headers add zero runtime cost. The preprocessor resolves all includes before compilation. Your compiled binary has no concept of headers. The build log we print is pure simulation \u2014 a teaching tool.

## Memory Insight

The struct definitions from the header are identical to inline definitions. Same memory layout. Same stack allocation. Same cache behavior. Headers are a source-code organization tool, not a runtime concept.

## Your Task

1. Print build log: list files (components.h, main.cpp), show include chain, build result
2. Define Position, Velocity, Health structs
3. Spawn 5 enemies using struct arrays, move 2 ticks (dy=2), kill 2, render survivors
4. Output HUD, message, score
5. The game scene should match L11 Part 2 output exactly

## Beginner Trap

Thinking headers change runtime behavior. They don't. \`#include "components.h"\` is textual substitution. The preprocessor replaces the include line with the file's contents. Then the compiler runs. The header is gone. It's a copy-paste machine with include guard protection.

## Elite Insight

Large codebases have hundreds of headers. Compile time becomes critical. Forward declarations, precompiled headers, and C++20 modules all optimize this. But the fundamental model is the same: headers declare, source files define, the preprocessor glues them together.

## Systems Thinking Connection

L11 proved structs work. L12 proves they can be shared across files. This is the foundation for L13+ where systems, spawning, and rendering live in separate .cpp files that all include the same components.h.

## Skill Reinforcement

The game logic is identical to L11. The only addition is the build log. This reinforces that architectural changes (header extraction) don't change behavior. They change maintainability.

## Mastery Check

If two .cpp files both include components.h without #pragma once, what happens? The compiler sees struct Position defined twice in the same translation unit. Redefinition error. #pragma once prevents this.`,
    starterCode: `#include <iostream>
using namespace std;

// Simulating: include/components.h with #pragma once
// TODO: Define struct Position { int x, y; };
// TODO: Define struct Velocity { int dx, dy; };
// TODO: Define struct Health { int current, max; };

int main() {
    // Build log
    cout << "=== BUILD LOG ===" << endl;
    cout << "[1/3] components.h: Position, Velocity, Health" << endl;
    cout << "[2/3] main.cpp: #include \\"components.h\\"" << endl;
    cout << "[3/3] Build: SUCCESS" << endl;
    cout << endl;

    const int MAX = 5;

    // TODO: Create component arrays
    // Position pos[MAX]; Velocity vel[MAX]; Health hp[MAX]; bool alive[MAX];

    int score = 0;

    // TODO: Spawn 5 enemies
    // x = 60 + i*60, y = 40, dx = 0, dy = 2, hp = 30/30

    // TODO: Movement - 2 ticks

    // TODO: Damage enemies 1 and 3 (30 damage each, +100 score)

    // TODO: Render alive enemies
    // ENTITY|eN|enemy|pos.x|pos.y|22|22|hp.current

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Header build verified - components shared" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

// Simulating: include/components.h
// #pragma once
struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };

int main() {
    // Build log
    cout << "=== BUILD LOG ===" << endl;
    cout << "[1/3] components.h: Position, Velocity, Health" << endl;
    cout << "[2/3] main.cpp: #include \\"components.h\\"" << endl;
    cout << "[3/3] Build: SUCCESS" << endl;
    cout << endl;

    const int MAX = 5;

    Position pos[MAX];
    Velocity vel[MAX];
    Health hp[MAX];
    bool alive[MAX];

    int score = 0;

    // Spawn 5 enemies
    for (int i = 0; i < MAX; i++) {
        pos[i] = {60 + i * 60, 40};
        vel[i] = {0, 2};
        hp[i] = {30, 30};
        alive[i] = true;
    }

    // Movement - 2 ticks
    for (int tick = 0; tick < 2; tick++) {
        for (int i = 0; i < MAX; i++) {
            if (alive[i]) {
                pos[i].x += vel[i].dx;
                pos[i].y += vel[i].dy;
            }
        }
    }

    // Damage enemies 1 and 3
    hp[1].current -= 30;
    if (hp[1].current <= 0) { hp[1].current = 0; alive[1] = false; }
    score += 100;

    hp[3].current -= 30;
    if (hp[3].current <= 0) { hp[3].current = 0; alive[3] = false; }
    score += 100;

    // Render alive enemies
    for (int i = 0; i < MAX; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << pos[i].x << "|" << pos[i].y
                 << "|22|22|" << hp[i].current << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Header build verified - components shared" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Build should succeed",
        expectedOutput: "Build: SUCCESS",
      },
      {
        id: "g2",
        description: "Enemy0 at (60,44) after 2 ticks",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|44\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Enemy1 should NOT render (killed)",
        expectedOutput: "^(?!.*ENTITY\\|e1\\|)",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Enemy2 at (180,44)",
        expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|44\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Enemy4 at (300,44)",
        expectedOutput: "ENTITY\\|e4\\|enemy\\|300\\|44\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g6",
        description: "Header build verified message",
        expectedOutput: "GAME_MESSAGE\\|Header build verified - components shared",
        isPattern: true,
      },
      {
        id: "g7",
        description: "Score is 200",
        expectedOutput: "SCORE\\|200",
        isPattern: true,
      },
    ],
    hints: [
      "The structs are identical to L11. Define them before main. In a real project, they'd live in components.h.",
      "The game logic is identical to L11 Part 2. Spawn, move 2 ticks, damage, render. Only the build log is new.",
      "Don't forget to escape quotes in the build log: `cout << \"[2/3] main.cpp: #include \\\"components.h\\\"\" << endl;`",
    ],
    estimatedMinutes: 7,
  },
};
