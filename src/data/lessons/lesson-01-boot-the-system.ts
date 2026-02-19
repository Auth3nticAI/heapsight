import type { Lesson } from "@/types/lesson";

export const lesson01: Lesson = {
  id: "01-boot-the-system",
  title: "Boot the System",
  description: "Print your first game frame. Output is existence.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: ["cout", "main()", "game frame", "output protocol"],
  part1: {
    title: "Concept: cout",
    type: "concept",
    instructions: `# Boot the System

## Mental Model

A game is output. No output = dead screen. The renderer reads stdout line by line. Every frame is a set of print statements. The renderer consumes them, parses them, draws pixels. No output means no pixels. The game exists only when it outputs.

## What Breaks Without This

The renderer reads stdout looking for protocol commands. No output means no data. No data means a black void. Your program runs and exits silently. The screen stays empty. The game never existed.

## The Fix

\\\`cout\\\` prints to stdout. The renderer watches stdout. Print a frame header. Print a frame number. Print a system message. The game boots.

Every game frame starts the same way: push data to the renderer. Here, stdout IS your render pipeline. You print structured protocol lines and the engine parses them. That is your entire graphics system for now.

## Key Concepts

- **\\\`#include <iostream>\\\`** -- imports the I/O library. Without it, \\\`cout\\\` does not exist.
- **\\\`using namespace std;\\\`** -- lets you write \\\`cout\\\` instead of \\\`std::cout\\\`. Less typing, same machine code.
- **\\\`cout << "text"\\\`** -- pushes bytes to stdout. The renderer reads them.
- **\\\`endl\\\`** -- flushes the buffer and adds a newline. One complete line per command.

## Performance Insight

\\\`cout\\\` flushes per \\\`endl\\\`. In production you would buffer all frame output and flush once. For now, \\\`endl\\\` per line is fine. The overhead is microseconds.

## Memory Insight

String literals like \\\`"=== SPACE SHOOTER v0 ==="\\\` live in read-only memory. They are baked into the binary at compile time. Zero allocation. Zero cost. The pointer is resolved before your program even runs.

## Your Task

Write a program that prints exactly:
\\\`\\\`\\\`
=== SPACE SHOOTER v0 ===
FRAME|1
GAME_MESSAGE|System Online
\\\`\\\`\\\`

Each line must end with \\\`endl\\\`.

## Beginner Trap

**Forgetting \\\`endl\\\`:** Output buffers in C++. Without \\\`endl\\\` or \\\`"\\n"\\\`, the buffer may never flush. Your text sits in memory, never reaching the renderer. Always terminate each protocol line.

## Elite Insight

Doom's first frame was just clearing the framebuffer to black. One operation. Then it drew. Output = existence. Your first \\\`cout\\\` is the same moment -- the game goes from nothing to something.

## Mastery Check

Why does \\\`cout\\\` without \\\`endl\\\` sometimes show nothing? The output buffer has not been flushed. Data sits in a buffer waiting for a flush signal. \\\`endl\\\` forces the flush.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Print the frame header: === SPACE SHOOTER v0 ===

    // Print the frame number: FRAME|1

    // Print the system message: GAME_MESSAGE|System Online

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "=== SPACE SHOOTER v0 ===" << endl;
    cout << "FRAME|1" << endl;
    cout << "GAME_MESSAGE|System Online" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should print the frame header",
        expectedOutput: "=== SPACE SHOOTER v0 ===",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Should print the frame number",
        expectedOutput: "FRAME\\|1",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Should print the system online message",
        expectedOutput: "GAME_MESSAGE\\|System Online",
        isPattern: true,
      },
    ],
    hints: [
      'Use `cout << "text" << endl;` to print each line.',
      "The pipe character `|` is just a regular character in a string literal. Type it directly.",
      'The three lines are: `=== SPACE SHOOTER v0 ===`, `FRAME|1`, and `GAME_MESSAGE|System Online`.',
    ],
    estimatedMinutes: 3,
  },
  part2: {
    title: "Game: First Frame",
    type: "game_builder",
    instructions: `# Game Builder: Your First Game Frame

Your first real game frame. The renderer needs four things: a frame header so it knows a frame started, an entity so it has something to draw, a message for the HUD overlay, and a score for the scoreboard.

## The Protocol

- **\\\`=== SPACE SHOOTER v0 ===\\\`** -- frame header. The renderer uses this to identify game output.
- **\\\`ENTITY|id|type|x|y|width|height|hp\\\`** -- draws an entity. Each field separated by \\\`|\\\`.
- **\\\`GAME_MESSAGE|text\\\`** -- pushes text to the HUD overlay.
- **\\\`SCORE|N\\\`** -- sets the score display.

## Your Task

Print these four lines in order:
\\\`\\\`\\\`
=== SPACE SHOOTER v0 ===
ENTITY|ship|player|180|300|24|24|100
GAME_MESSAGE|Awaiting orders, Commander.
SCORE|0
\\\`\\\`\\\`

The ship entity: id is \\\`ship\\\`, type is \\\`player\\\`, position (180, 300), size 24x24, health 100. This is your player. The renderer will draw it as a triangle at those coordinates.

Look at the Game Preview panel. Your ship should appear.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Print frame header: === SPACE SHOOTER v0 ===

    // Print the player ship entity
    // Format: ENTITY|ship|player|180|300|24|24|100

    // Print game message: GAME_MESSAGE|Awaiting orders, Commander.

    // Print score: SCORE|0

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "=== SPACE SHOOTER v0 ===" << endl;
    cout << "ENTITY|ship|player|180|300|24|24|100" << endl;
    cout << "GAME_MESSAGE|Awaiting orders, Commander." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should output the player ship entity",
        expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should output the game message",
        expectedOutput: "GAME_MESSAGE\\|Awaiting orders, Commander\\.",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should output the score",
        expectedOutput: "SCORE\\|0",
        isPattern: true,
      },
    ],
    hints: [
      'Each protocol line is just a `cout` statement. Example: `cout << "SCORE|0" << endl;`',
      "The ENTITY format has 8 fields separated by pipes: id, type, x, y, width, height, hp.",
      'Full ship line: `cout << "ENTITY|ship|player|180|300|24|24|100" << endl;`',
    ],
    estimatedMinutes: 5,
  },
};
