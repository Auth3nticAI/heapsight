import type { Lesson } from "@/types/lesson";

export const lesson02: Lesson = {
  id: "02-player-stats",
  title: "Player Stats",
  description: "Store game state in variables. Display them as a HUD.",
  order: 2,
  xpReward: 75,
  tier: "free",
  concepts: ["variables", "int", "HUD", "game state"],
  part1: {
    title: "Concept: Variables",
    type: "concept",
    instructions: `# Player Stats

## Mental Model

Game state is variables. Variables are the source of truth. Display them = HUD. A game without variables is a screenshot. A game with variables is interactive. The entire difference between a static image and a playable game is mutable state.

## What Breaks Without This

Without variables, every value is hardcoded in a string literal. Want to take damage? Rewrite the string. Want to score a point? Rewrite another string. You cannot update anything. You cannot react to anything. The game is frozen.

## The Fix

Store \\\`hp\\\`, \\\`score\\\`, and \\\`lives\\\` as \\\`int\\\` variables. Print them in HUD format. Now state can change. Subtract from hp = damage. Add to score = points. Decrement lives = death. Variables are the bridge between game logic and display.

## Key Concepts

- **\\\`int hp = 100;\\\`** -- declares an integer variable. 4 bytes on the stack. Instant.
- **\\\`cout << hp\\\`** -- prints the current value of hp, not the text "hp".
- **\\\`HUD|HP:100|SCORE:0|LIVES:3\\\`** -- the HUD protocol line. The renderer draws this as an overlay.

## Performance Insight

\\\`int\\\` is 4 bytes. Fits in a CPU register. Fastest data type the processor handles. An \\\`int\\\` add is 1 CPU cycle. You could update a million int variables in under a millisecond.

## Memory Insight

Three ints = 12 bytes on the stack. Stack allocation is free -- the compiler just adjusts the stack pointer. No \\\`new\\\`, no \\\`malloc\\\`, no system calls. The memory is available the instant the function is entered.

## Your Task

Declare three variables and print a complete game frame:
\\\`\\\`\\\`
=== SPACE SHOOTER v0 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
GAME_MESSAGE|All systems nominal
\\\`\\\`\\\`

Use \\\`int hp = 100\\\`, \\\`int score = 0\\\`, \\\`int lives = 3\\\`. Build the HUD line using these variables with \\\`<<\\\`.

## Beginner Trap

**Using strings for numbers:** If you store hp as a string \\\`"100"\\\`, you cannot subtract damage from it. \\\`"100" - 25\\\` is a compiler error. Use \\\`int\\\`. Math only works on numeric types.

## Elite Insight

Unreal Engine stores player state as UProperties -- under the hood, they are ints, floats, and bools in flat memory. Same pattern you are building here. Named variables that hold game truth.

## Mastery Check

What happens if you print \\\`"hp"\\\` instead of \\\`hp\\\`? You get the literal text "hp" on screen, not the value 100. Quotes make a string literal. No quotes reference the variable.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Declare player stats
    // int hp = 100;
    // int score = 0;
    // int lives = 3;

    // Print frame header: === SPACE SHOOTER v0 ===

    // Print HUD using variables: HUD|HP:100|SCORE:0|LIVES:3

    // Print player entity: ENTITY|ship|player|180|300|24|24|100

    // Print status message: GAME_MESSAGE|All systems nominal

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int hp = 100;
    int score = 0;
    int lives = 3;

    cout << "=== SPACE SHOOTER v0 ===" << endl;
    cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    cout << "ENTITY|ship|player|180|300|24|24|" << hp << endl;
    cout << "GAME_MESSAGE|All systems nominal" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should print the HUD with correct stats",
        expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Should print the player ship entity",
        expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100",
        isPattern: true,
      },
    ],
    hints: [
      "Declare `int hp = 100;`, `int score = 0;`, `int lives = 3;` at the top of main.",
      'Build the HUD line by chaining: `cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;`',
      "Use `<< hp` (no quotes) to insert the variable value, not the text.",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: State Change",
    type: "game_builder",
    instructions: `# Game Builder: Two Frames, One Hit

A static HUD is useless. The whole point of variables is that they change. This exercise simulates a damage event across two frames. Frame 1 is the healthy state. Then the ship takes 25 damage. Frame 2 shows the result.

## The Pattern

\\\`\\\`\\\`cpp
int hp = 100;
// Frame 1: print hp (shows 100)
hp = hp - 25;
// Frame 2: print hp (shows 75)
\\\`\\\`\\\`

The variable mutates. The HUD reflects the new truth. The entity health field updates too. One source of truth, displayed everywhere.

## Your Task

Print two frames showing a damage event:
\\\`\\\`\\\`
=== FRAME 1 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
=== FRAME 2 ===
HUD|HP:75|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|75
GAME_MESSAGE|Hull breach! 25 damage taken
\\\`\\\`\\\`

Start with \\\`hp = 100\\\`, \\\`score = 0\\\`, \\\`lives = 3\\\`. After Frame 1, subtract 25 from hp. Print Frame 2 with the updated values.

The entity health field must match hp. The HUD must match hp. One variable, two outputs, both consistent. This is data-driven display.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int hp = 100;
    int score = 0;
    int lives = 3;

    // === FRAME 1 ===
    // Print frame header, HUD, and entity with hp=100

    // Take 25 damage
    // hp = hp - 25;

    // === FRAME 2 ===
    // Print frame header, HUD, entity with updated hp
    // Print damage message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int hp = 100;
    int score = 0;
    int lives = 3;

    // Frame 1
    cout << "=== FRAME 1 ===" << endl;
    cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    cout << "ENTITY|ship|player|180|300|24|24|" << hp << endl;

    // Take damage
    hp = hp - 25;

    // Frame 2
    cout << "=== FRAME 2 ===" << endl;
    cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    cout << "ENTITY|ship|player|180|300|24|24|" << hp << endl;
    cout << "GAME_MESSAGE|Hull breach! 25 damage taken" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Frame 1 should show HUD with HP:100",
        expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Frame 2 should show HUD with HP:75 after damage",
        expectedOutput: "HUD\\|HP:75\\|SCORE:0\\|LIVES:3",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show the damage message",
        expectedOutput: "GAME_MESSAGE\\|Hull breach! 25 damage taken",
        isPattern: true,
      },
    ],
    hints: [
      "Print Frame 1 HUD and entity using the initial hp value of 100.",
      "After Frame 1 output, do `hp = hp - 25;` to apply damage. Then print Frame 2.",
      "The entity health field (last field) should use `<< hp` so it automatically reflects the updated value.",
    ],
    estimatedMinutes: 6,
  },
};
