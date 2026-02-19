import type { GameLessonVariant } from "@/types/game";

export const lesson01SpaceShooter: GameLessonVariant = {
  lessonId: "01-boot-the-system",
  instructions: `# Boot the System -- Dead Screen

## Mental Model

A game is output. No output = dead screen. The renderer reads stdout line by line looking for protocol commands. No output means no pixels. A dead void. The game exists only when it outputs.

## What Breaks Without This

The game window stays black. No ship, no HUD, no proof your code ran. The renderer has zero data to work with. Your program executes and exits. Nothing was drawn. The game never booted.

Every game engine starts the same way: push data to the display pipeline. If the pipeline is empty, the screen is empty. Output is existence.

## The Fix

\`cout\` pushes bytes to stdout. The renderer watches stdout. Print structured protocol lines and the engine parses them, splits on pipes, dispatches draw calls. That is your entire graphics pipeline for now.

The protocol is simple:
- \`=== SPACE SHOOTER v0 ===\` -- frame header. The renderer uses this to identify game output.
- \`ENTITY|id|type|x|y|width|height|hp\` -- tells the renderer to draw something. Each pipe-separated field is one data point.
- \`GAME_MESSAGE|text\` -- pushes text to the HUD overlay.
- \`SCORE|N\` -- sets the score display value.

Each line is one command. The pipe character \`|\` separates fields. Think of it like a serialized packet -- minimal overhead, easy to parse.

\`cout\` with \`endl\` flushes one complete line. The engine reads it, splits on pipes, and dispatches. This is the same pattern real engines use for debug overlays -- structured text output that a consumer parses. No fancy API. Just data on a wire.

## Performance Insight

\`cout\` flushes per \`endl\`. In a real engine you would buffer all frame data and flush once at frame end. For now, \`endl\` per line is fine. The flush overhead is microseconds. We are not GPU-bound on four print statements.

## Memory Insight

String literals live in the \`.rodata\` section of your binary. They are mapped into read-only memory at load time. Zero heap allocation. Zero cost. The pointer is resolved before \`main()\` even runs.

## Your Task

Print these four lines in order:
\`\`\`
=== SPACE SHOOTER v0 ===
ENTITY|ship|player|180|300|24|24|100
GAME_MESSAGE|Awaiting orders, Commander.
SCORE|0
\`\`\`

The ship: id \`ship\`, type \`player\`, position (180, 300), size 24x24, health 100. The renderer draws it as a triangle at those coordinates. The message goes to the HUD. The score goes to the scoreboard.

## Beginner Trap

**Forgetting \`endl\`:** Output buffers in C++. Without \`endl\` or \`"\\n"\`, the buffer may never flush to the renderer. Your protocol lines sit in memory, never parsed. Always terminate each line. One \`endl\` per command.

**Misspelling protocol fields:** The parser does exact string splitting on \`|\`. One missing pipe and the whole line is garbage data. Match the format exactly.

## Elite Insight

Doom's first frame was clearing the framebuffer to black. One operation. Then it drew the first column of the first wall. Output = existence. Your first four \`cout\` lines are that same moment -- the game goes from nothing to something.

## Systems Thinking Connection

Every system in this game will follow the same pattern: compute state, then output protocol lines. Movement systems will update positions then print ENTITY lines. Damage systems will update HP then print HUD lines. The renderer is a dumb consumer. Your code is the producer. This producer-consumer pattern scales to any complexity.

## Skill Reinforcement

You are using: \`#include\`, \`main()\`, \`cout\`, \`endl\`, and string literals. These are the atoms. Everything else in C++ is built on top of getting bytes to an output stream.

## Mastery Check

Why does \`cout\` without \`endl\` sometimes show nothing? Buffer. The output buffer collects bytes until a flush signal arrives. \`endl\` forces the flush. Without it, data may sit in the buffer until program exit -- or forever if the program crashes.`,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print frame header: === SPACE SHOOTER v0 ===

    // TODO: Print player ship entity
    // Format: ENTITY|ship|player|180|300|24|24|100

    // TODO: Print game message
    // Format: GAME_MESSAGE|Awaiting orders, Commander.

    // TODO: Print score
    // Format: SCORE|0

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "=== SPACE SHOOTER v0 ===" << endl;
    cout << "ENTITY|ship|player|180|300|24|24|100" << endl;
    cout << "GAME_MESSAGE|Awaiting orders, Commander." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}`,

  tests: [
    {
      id: "g1",
      description: "Should output the frame header",
      expectedOutput: "=== SPACE SHOOTER v0 ===",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Should output the player ship entity at (180,300) with 100 hp",
      expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Should output the game message",
      expectedOutput: "GAME_MESSAGE\\|Awaiting orders, Commander\\.",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Should output the score",
      expectedOutput: "SCORE\\|0",
      isPattern: true,
    },
  ],

  hints: [
    'Each line is one `cout` statement ending with `endl`. Example: `cout << "SCORE|0" << endl;`',
    "The ENTITY line has 8 pipe-separated fields: id, type, x, y, width, height, hp.",
    'The full ship line: `cout << "ENTITY|ship|player|180|300|24|24|100" << endl;`',
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    cout << "=== SPACE SHOOTER v0 ===" << endl;
    cout << "ENTITY|ship|player|180|300|24|24|100" << endl;
    cout << "GAME_MESSAGE|Awaiting orders, Commander." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}`,
};
